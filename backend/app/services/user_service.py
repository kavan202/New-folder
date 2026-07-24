import logging
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError, OperationalError, SQLAlchemyError
from sqlalchemy import text
from fastapi import HTTPException, status
from app.models.user import User, UserRole
from app.schemas.user import UserCreate
from app.auth import get_password_hash, verify_password

logger = logging.getLogger("app.registration")
logger.setLevel(logging.INFO)

class UserService:
    @staticmethod
    def sync_user_sequence(db: Session):
        """Ensures PostgreSQL users_id_seq sequence is set to MAX(id) to prevent duplicate key errors."""
        try:
            bind = db.get_bind()
            if bind and bind.dialect.name == "postgresql":
                db.execute(text("SELECT setval(pg_get_serial_sequence('users', 'id'), COALESCE((SELECT MAX(id) FROM users), 1));"))
                db.commit()
                logger.info("[DATABASE] Synchronized PostgreSQL 'users_id_seq' sequence.")
        except Exception as e:
            db.rollback()
            logger.warning("[DATABASE] Could not sync 'users_id_seq' sequence: %s", e)

    @staticmethod
    def register_user(db: Session, user_in: UserCreate) -> User:
        # Step 1: Request received
        logger.info("[REGISTRATION] Step 1: Request received for username: '%s', email: '%s'", user_in.username, user_in.email)

        # Step 2: Input validation
        if not user_in.username or not user_in.username.strip():
            logger.warning("[REGISTRATION] Step 2: Input validation failed - Username is required")
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Username is required")

        if not user_in.email or not user_in.email.strip():
            logger.warning("[REGISTRATION] Step 2: Input validation failed - Email is required")
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Email is required")

        if not user_in.password or not user_in.password.strip():
            logger.warning("[REGISTRATION] Step 2: Input validation failed - Password is required")
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Password is required")

        # Check existing username
        existing_username = db.query(User).filter(User.username == user_in.username.strip()).first()
        if existing_username:
            logger.warning("[REGISTRATION] Step 2: Input validation failed - Username '%s' already exists", user_in.username)
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Username already registered"
            )

        # Check existing email
        existing_email = db.query(User).filter(User.email == user_in.email.strip()).first()
        if existing_email:
            logger.warning("[REGISTRATION] Step 2: Input validation failed - Email '%s' already exists", user_in.email)
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email already registered"
            )

        logger.info("[REGISTRATION] Step 2: Input validation passed for username: '%s'", user_in.username)

        # Step 3: Password hashing
        logger.info("[REGISTRATION] Step 3: Hashing password for username: '%s'", user_in.username)
        try:
            hashed_pw = get_password_hash(user_in.password)
            logger.info("[REGISTRATION] Step 3: Password successfully hashed for username: '%s'", user_in.username)
        except Exception as e:
            logger.error("[REGISTRATION] Step 3: Password hashing failed for username '%s': %s", user_in.username, e, exc_info=True)
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Password hashing failed"
            )

        # Step 4: Database insertion
        role = UserRole.USER.value
        logger.info("[REGISTRATION] Step 4: Preparing user record: username='%s', email='%s', role='%s'", user_in.username, user_in.email, role)
        user = User(
            username=user_in.username.strip(),
            email=user_in.email.strip(),
            hashed_password=hashed_pw,
            role=role
        )
        db.add(user)
        logger.info("[REGISTRATION] Step 4: User object added to database session for username: '%s'", user_in.username)

        # Step 5: Commit/Rollback
        logger.info("[REGISTRATION] Step 5: Attempting database commit for username: '%s'", user_in.username)
        try:
            db.commit()
            db.refresh(user)
            logger.info("[REGISTRATION] Step 5: Database commit successful. Registered user ID %s (username: '%s')", user.id, user.username)
        except IntegrityError as ie:
            db.rollback()
            logger.error("[REGISTRATION] Step 5: Database IntegrityError for username '%s': %s", user_in.username, ie)
            err_str = str(ie.orig) if hasattr(ie, 'orig') and ie.orig else str(ie)
            err_lower = err_str.lower()

            if "users_username_key" in err_lower or "ix_users_username" in err_lower or "username" in err_lower:
                raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Username already registered")
            elif "users_email_key" in err_lower or "ix_users_email" in err_lower or "email" in err_lower:
                raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Email already registered")
            elif "users_pkey" in err_lower or "primary key" in err_lower or "duplicate key" in err_lower:
                UserService.sync_user_sequence(db)
                raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Database primary key sequence collision. Please try registering again.")
            elif "not-null" in err_lower or "null value" in err_lower:
                raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=f"Required database field missing: {err_str}")
            else:
                raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=f"Database constraint violation: {err_str}")
        except OperationalError as oe:
            db.rollback()
            logger.error("[REGISTRATION] Step 5: Database OperationalError (connection failed) for username '%s': %s", user_in.username, oe)
            raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Database connection failed")
        except SQLAlchemyError as se:
            db.rollback()
            logger.error("[REGISTRATION] Step 5: SQLAlchemyError for username '%s': %s", user_in.username, se)
            raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Database transaction error: {str(se)}")
        except Exception as ex:
            db.rollback()
            logger.error("[REGISTRATION] Step 5: Unexpected error during commit for username '%s': %s", user_in.username, ex, exc_info=True)
            raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Registration failed: {str(ex)}")

        # Step 6: Returned response
        logger.info("[REGISTRATION] Step 6: Returning response for registered user ID: %s, username: '%s'", user.id, user.username)
        return user

    @staticmethod
    def register_admin_user(db: Session, user_in: UserCreate) -> User:
        # Step 1: Request received
        logger.info("[ADMIN REGISTRATION] Step 1: Request received for username: '%s', email: '%s'", user_in.username, user_in.email)

        # Step 2: Input validation
        if not user_in.username or not user_in.username.strip():
            logger.warning("[ADMIN REGISTRATION] Step 2: Input validation failed - Username is required")
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Username is required")

        if not user_in.email or not user_in.email.strip():
            logger.warning("[ADMIN REGISTRATION] Step 2: Input validation failed - Email is required")
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Email is required")

        if not user_in.password or not user_in.password.strip():
            logger.warning("[ADMIN REGISTRATION] Step 2: Input validation failed - Password is required")
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Password is required")

        # Check existing username
        existing_username = db.query(User).filter(User.username == user_in.username.strip()).first()
        if existing_username:
            logger.warning("[ADMIN REGISTRATION] Step 2: Input validation failed - Username '%s' already exists", user_in.username)
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Username already registered"
            )

        # Check existing email
        existing_email = db.query(User).filter(User.email == user_in.email.strip()).first()
        if existing_email:
            logger.warning("[ADMIN REGISTRATION] Step 2: Input validation failed - Email '%s' already exists", user_in.email)
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email already registered"
            )

        logger.info("[ADMIN REGISTRATION] Step 2: Input validation passed for username: '%s'", user_in.username)

        # Step 3: Password hashing
        logger.info("[ADMIN REGISTRATION] Step 3: Hashing password for username: '%s'", user_in.username)
        try:
            hashed_pw = get_password_hash(user_in.password)
            logger.info("[ADMIN REGISTRATION] Step 3: Password successfully hashed for username: '%s'", user_in.username)
        except Exception as e:
            logger.error("[ADMIN REGISTRATION] Step 3: Password hashing failed for username '%s': %s", user_in.username, e, exc_info=True)
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Password hashing failed"
            )

        # Step 4: Database insertion
        role = UserRole.ADMIN.value
        logger.info("[ADMIN REGISTRATION] Step 4: Preparing admin record: username='%s', email='%s', role='%s'", user_in.username, user_in.email, role)
        user = User(
            username=user_in.username.strip(),
            email=user_in.email.strip(),
            hashed_password=hashed_pw,
            role=role
        )
        db.add(user)
        logger.info("[ADMIN REGISTRATION] Step 4: Admin record added to session for username: '%s'", user_in.username)

        # Step 5: Commit/Rollback
        logger.info("[ADMIN REGISTRATION] Step 5: Attempting database commit for username: '%s'", user_in.username)
        try:
            db.commit()
            db.refresh(user)
            logger.info("[ADMIN REGISTRATION] Step 5: Commit successful for admin user ID %s (username: '%s')", user.id, user.username)
        except IntegrityError as ie:
            db.rollback()
            logger.error("[ADMIN REGISTRATION] Step 5: Database IntegrityError for username '%s': %s", user_in.username, ie)
            err_str = str(ie.orig) if hasattr(ie, 'orig') and ie.orig else str(ie)
            err_lower = err_str.lower()

            if "users_username_key" in err_lower or "ix_users_username" in err_lower or "username" in err_lower:
                raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Username already registered")
            elif "users_email_key" in err_lower or "ix_users_email" in err_lower or "email" in err_lower:
                raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Email already registered")
            elif "users_pkey" in err_lower or "primary key" in err_lower or "duplicate key" in err_lower:
                UserService.sync_user_sequence(db)
                raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Database primary key sequence collision. Please try registering again.")
            elif "not-null" in err_lower or "null value" in err_lower:
                raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=f"Required database field missing: {err_str}")
            else:
                raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=f"Database constraint violation: {err_str}")
        except OperationalError as oe:
            db.rollback()
            logger.error("[ADMIN REGISTRATION] Step 5: Database connection failed for username '%s': %s", user_in.username, oe)
            raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Database connection failed")
        except SQLAlchemyError as se:
            db.rollback()
            logger.error("[ADMIN REGISTRATION] Step 5: SQLAlchemyError for username '%s': %s", user_in.username, se)
            raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Database transaction error: {str(se)}")
        except Exception as ex:
            db.rollback()
            logger.error("[ADMIN REGISTRATION] Step 5: Unexpected error for username '%s': %s", user_in.username, ex, exc_info=True)
            raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Registration failed: {str(ex)}")

        # Step 6: Returned response
        logger.info("[ADMIN REGISTRATION] Step 6: Returning response for admin user ID: %s, username: '%s'", user.id, user.username)
        return user

    @staticmethod
    def authenticate_user(db: Session, username_or_email: str, password: str) -> User:
        user = db.query(User).filter(
            (User.username == username_or_email) | (User.email == username_or_email)
        ).first()
        if not user or not verify_password(password, user.hashed_password):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Incorrect username/email or password",
                headers={"WWW-Authenticate": "Bearer"},
            )
        return user

