from typing import List, Optional
from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from app.models.vehicle import Vehicle
from app.models.user import User
from app.models.test_drive_booking import TestDriveBooking
from app.models.testdrive import TestDrive
from app.schemas.testdrive_booking import TestDriveBookingCreate, TestDriveBookingResponse

MAX_SLOT_CAPACITY = 3

class TestDriveBookingService:
    @staticmethod
    def book_test_drive(db: Session, user: User, booking_in: TestDriveBookingCreate) -> TestDriveBookingResponse:
        vehicle = db.query(Vehicle).filter(Vehicle.id == booking_in.vehicle_id).first()
        if not vehicle:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Vehicle with ID {booking_in.vehicle_id} not found."
            )
        if vehicle.quantity <= 0:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Vehicle is out of stock and unavailable for test drive."
            )

        # Check capacity for selected date & time
        active_count = db.query(TestDriveBooking).filter(
            TestDriveBooking.booking_date == booking_in.booking_date.strip(),
            TestDriveBooking.booking_time == booking_in.booking_time.strip(),
            TestDriveBooking.status != "Cancelled"
        ).count()

        if active_count >= MAX_SLOT_CAPACITY:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Maximum booking capacity ({MAX_SLOT_CAPACITY} appointments) reached for {booking_in.booking_date} at {booking_in.booking_time}. Please select another slot."
            )

        vehicle_name = f"{vehicle.make} {vehicle.model}"

        booking = TestDriveBooking(
            user_id=user.id,
            vehicle_id=vehicle.id,
            vehicle_name=vehicle_name,
            booking_date=booking_in.booking_date.strip(),
            booking_time=booking_in.booking_time.strip(),
            contact_number=booking_in.contact_number.strip(),
            notes=booking_in.notes.strip() if booking_in.notes else None,
            status="Pending"
        )
        db.add(booking)

        # Legacy testdrive table sync for analytics
        legacy_td = TestDrive(
            vehicle_id=vehicle.id,
            customer_name=user.username,
            customer_phone=booking_in.contact_number.strip(),
            customer_email=user.email,
            status="Scheduled"
        )
        db.add(legacy_td)

        db.commit()
        db.refresh(booking)

        return TestDriveBookingService._build_response(booking)

    @staticmethod
    def get_user_bookings(
        db: Session,
        user_id: int,
        search: Optional[str] = None,
        status_filter: Optional[str] = None,
        date_filter: Optional[str] = None
    ) -> List[TestDriveBookingResponse]:
        query = db.query(TestDriveBooking).filter(TestDriveBooking.user_id == user_id)

        if search:
            query = query.filter(TestDriveBooking.vehicle_name.ilike(f"%{search.strip()}%"))
        if status_filter:
            query = query.filter(TestDriveBooking.status.ilike(status_filter.strip()))
        if date_filter:
            query = query.filter(TestDriveBooking.booking_date == date_filter.strip())

        bookings = query.order_by(TestDriveBooking.created_at.desc()).all()
        return [TestDriveBookingService._build_response(b) for b in bookings]

    @staticmethod
    def get_all_bookings(
        db: Session,
        user_id: Optional[int] = None,
        vehicle_id: Optional[int] = None,
        search: Optional[str] = None,
        status_filter: Optional[str] = None,
        date_filter: Optional[str] = None,
        skip: int = 0,
        limit: int = 100
    ) -> List[TestDriveBookingResponse]:
        query = db.query(TestDriveBooking)

        if user_id:
            query = query.filter(TestDriveBooking.user_id == user_id)
        if vehicle_id:
            query = query.filter(TestDriveBooking.vehicle_id == vehicle_id)
        if search:
            query = query.filter(
                (TestDriveBooking.vehicle_name.ilike(f"%{search.strip()}%")) |
                (TestDriveBooking.contact_number.ilike(f"%{search.strip()}%"))
            )
        if status_filter:
            query = query.filter(TestDriveBooking.status.ilike(status_filter.strip()))
        if date_filter:
            query = query.filter(TestDriveBooking.booking_date == date_filter.strip())

        bookings = query.order_by(TestDriveBooking.created_at.desc()).offset(skip).limit(limit).all()
        return [TestDriveBookingService._build_response(b) for b in bookings]

    @staticmethod
    def approve_booking(db: Session, booking_id: int) -> TestDriveBookingResponse:
        booking = db.query(TestDriveBooking).filter(TestDriveBooking.id == booking_id).first()
        if not booking:
            raise HTTPException(status_code=404, detail="Test drive booking not found.")
        booking.status = "Approved"
        db.commit()
        db.refresh(booking)
        return TestDriveBookingService._build_response(booking)

    @staticmethod
    def cancel_booking(db: Session, booking_id: int, current_user: User) -> TestDriveBookingResponse:
        booking = db.query(TestDriveBooking).filter(TestDriveBooking.id == booking_id).first()
        if not booking:
            raise HTTPException(status_code=404, detail="Test drive booking not found.")
        
        # User can only cancel their own booking unless they are admin
        if current_user.role != "admin" and booking.user_id != current_user.id:
            raise HTTPException(status_code=403, detail="You can only cancel your own bookings.")

        booking.status = "Cancelled"
        db.commit()
        db.refresh(booking)
        return TestDriveBookingService._build_response(booking)

    @staticmethod
    def complete_booking(db: Session, booking_id: int) -> TestDriveBookingResponse:
        booking = db.query(TestDriveBooking).filter(TestDriveBooking.id == booking_id).first()
        if not booking:
            raise HTTPException(status_code=404, detail="Test drive booking not found.")
        booking.status = "Completed"
        db.commit()
        db.refresh(booking)
        return TestDriveBookingService._build_response(booking)

    @staticmethod
    def _build_response(booking: TestDriveBooking) -> TestDriveBookingResponse:
        res = TestDriveBookingResponse.model_validate(booking)
        if booking.user:
            res.user_username = booking.user.username
            res.user_email = booking.user.email
        if booking.vehicle:
            res.vehicle_image_url = booking.vehicle.image_url
        return res
