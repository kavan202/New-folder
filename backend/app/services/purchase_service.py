from typing import List, Optional
from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from app.models.vehicle import Vehicle
from app.models.user import User
from app.models.purchase_order import PurchaseOrder
from app.models.customer import Customer
from app.models.sale import Sale
from app.schemas.purchase import PurchaseOrderCreate, PurchaseOrderResponse

class PurchaseService:
    MAX_STOCK_PER_PURCHASE = 100

    @staticmethod
    def create_purchase(db: Session, user: User, purchase_in: PurchaseOrderCreate) -> PurchaseOrderResponse:
        vehicle = db.query(Vehicle).filter(Vehicle.id == purchase_in.vehicle_id).first()
        if not vehicle:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Vehicle with ID {purchase_in.vehicle_id} not found."
            )
        
        qty = purchase_in.quantity if purchase_in.quantity > 0 else 1

        if vehicle.quantity < qty:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Vehicle is unavailable or has insufficient stock. Only {vehicle.quantity} remaining."
            )

        # Deduct stock
        vehicle.quantity -= qty

        # Create PurchaseOrder
        order = PurchaseOrder(
            user_id=user.id,
            vehicle_id=vehicle.id,
            vehicle_make=vehicle.make,
            vehicle_model=vehicle.model,
            purchase_price=vehicle.price * qty,
            quantity_purchased=qty,
            status="Completed"
        )
        db.add(order)

        # Record Customer & Sale for analytics integration if customer info provided or user profile
        cust_name = purchase_in.customer_name or user.username
        cust_phone = purchase_in.customer_phone or "9999999999"
        cust_email = purchase_in.customer_email or user.email

        customer = Customer(
            full_name=cust_name,
            mobile_number=cust_phone,
            email=cust_email
        )
        db.add(customer)
        db.flush()

        sale = Sale(
            vehicle_id=vehicle.id,
            customer_id=customer.id,
            sale_price=vehicle.price * qty
        )
        db.add(sale)

        db.commit()
        db.refresh(order)

        return PurchaseService._build_response(order)

    @staticmethod
    def get_user_purchases(
        db: Session,
        user_id: int,
        search: Optional[str] = None,
        date: Optional[str] = None
    ) -> List[PurchaseOrderResponse]:
        query = db.query(PurchaseOrder).filter(PurchaseOrder.user_id == user_id)
        
        if search:
            search_pattern = f"%{search.strip()}%"
            query = query.filter(
                (PurchaseOrder.vehicle_make.ilike(search_pattern)) |
                (PurchaseOrder.vehicle_model.ilike(search_pattern))
            )
        
        if date:
            # Match date prefix e.g. "2026-07-24"
            query = query.filter(PurchaseOrder.created_at.cast(String).like(f"{date.strip()}%"))

        orders = query.order_by(PurchaseOrder.created_at.desc()).all()
        return [PurchaseService._build_response(o) for o in orders]

    @staticmethod
    def get_all_purchases(
        db: Session,
        user_id: Optional[int] = None,
        vehicle_id: Optional[int] = None,
        search: Optional[str] = None,
        date: Optional[str] = None,
        skip: int = 0,
        limit: int = 100
    ) -> List[PurchaseOrderResponse]:
        query = db.query(PurchaseOrder)

        if user_id:
            query = query.filter(PurchaseOrder.user_id == user_id)
        if vehicle_id:
            query = query.filter(PurchaseOrder.vehicle_id == vehicle_id)
        if search:
            search_pattern = f"%{search.strip()}%"
            query = query.filter(
                (PurchaseOrder.vehicle_make.ilike(search_pattern)) |
                (PurchaseOrder.vehicle_model.ilike(search_pattern))
            )
        if date:
            query = query.filter(PurchaseOrder.created_at.cast(String).like(f"{date.strip()}%"))

        orders = query.order_by(PurchaseOrder.created_at.desc()).offset(skip).limit(limit).all()
        return [PurchaseService._build_response(o) for o in orders]

    @staticmethod
    def _build_response(order: PurchaseOrder) -> PurchaseOrderResponse:
        res = PurchaseOrderResponse.model_validate(order)
        if order.user:
            res.user_username = order.user.username
            res.user_email = order.user.email
        if order.vehicle:
            res.vehicle_image_url = order.vehicle.image_url
        return res
