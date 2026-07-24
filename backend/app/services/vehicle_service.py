from typing import List, Optional
from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from app.models.vehicle import Vehicle
from app.models.customer import Customer
from app.models.sale import Sale
from app.schemas.vehicle import VehicleCreate, VehicleUpdate

class VehicleService:
    @staticmethod
    def create_vehicle(db: Session, vehicle_in: VehicleCreate) -> Vehicle:
        vehicle = Vehicle(
            make=vehicle_in.make,
            model=vehicle_in.model,
            category=vehicle_in.category,
            color=vehicle_in.color or "Midnight Black",
            fuel_type=vehicle_in.fuel_type or "Hybrid",
            price=vehicle_in.price,
            quantity=vehicle_in.quantity,
            image_url=vehicle_in.image_url,
        )
        db.add(vehicle)
        db.commit()
        db.refresh(vehicle)
        return vehicle

    @staticmethod
    def get_vehicles(db: Session, skip: int = 0, limit: int = 100) -> List[Vehicle]:
        return db.query(Vehicle).offset(skip).limit(limit).all()

    @staticmethod
    def get_vehicle_by_id(db: Session, vehicle_id: int) -> Vehicle:
        vehicle = db.query(Vehicle).filter(Vehicle.id == vehicle_id).first()
        if not vehicle:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Vehicle with id {vehicle_id} not found"
            )
        return vehicle

    @staticmethod
    def update_vehicle(db: Session, vehicle_id: int, vehicle_in: VehicleUpdate) -> Vehicle:
        vehicle = VehicleService.get_vehicle_by_id(db, vehicle_id)
        update_data = vehicle_in.model_dump(exclude_unset=True)
        for field, value in update_data.items():
            setattr(vehicle, field, value)
        db.commit()
        db.refresh(vehicle)
        return vehicle

    @staticmethod
    def delete_vehicle(db: Session, vehicle_id: int) -> None:
        vehicle = VehicleService.get_vehicle_by_id(db, vehicle_id)
        db.delete(vehicle)
        db.commit()

    @staticmethod
    def search_vehicles(
        db: Session,
        make: Optional[str] = None,
        model: Optional[str] = None,
        category: Optional[str] = None,
        color: Optional[str] = None,
        fuel_type: Optional[str] = None,
        min_price: Optional[float] = None,
        max_price: Optional[float] = None,
    ) -> List[Vehicle]:
        query = db.query(Vehicle)
        if make:
            query = query.filter(Vehicle.make.ilike(f"%{make}%"))
        if model:
            query = query.filter(Vehicle.model.ilike(f"%{model}%"))
        if category:
            query = query.filter(Vehicle.category.ilike(f"%{category}%"))
        if color:
            query = query.filter(Vehicle.color.ilike(f"%{color}%"))
        if fuel_type:
            query = query.filter(Vehicle.fuel_type.ilike(f"%{fuel_type}%"))
        if min_price is not None:
            query = query.filter(Vehicle.price >= min_price)
        if max_price is not None:
            query = query.filter(Vehicle.price <= max_price)
        return query.all()

    @staticmethod
    def purchase_vehicle(
        db: Session,
        vehicle_id: int,
        customer_name: Optional[str] = None,
        customer_phone: Optional[str] = None,
        customer_email: Optional[str] = None,
    ) -> Vehicle:
        vehicle = VehicleService.get_vehicle_by_id(db, vehicle_id)
        if vehicle.quantity <= 0:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Vehicle is out of stock"
            )
        vehicle.quantity -= 1

        # Record Customer & Sale if info provided
        if customer_name and customer_phone:
            customer = Customer(
                full_name=customer_name,
                mobile_number=customer_phone,
                email=customer_email
            )
            db.add(customer)
            db.flush()

            sale = Sale(
                vehicle_id=vehicle.id,
                customer_id=customer.id,
                sale_price=vehicle.price
            )
            db.add(sale)

        db.commit()
        db.refresh(vehicle)
        return vehicle

    @staticmethod
    def restock_vehicle(db: Session, vehicle_id: int, quantity_to_add: int) -> Vehicle:
        if quantity_to_add <= 0:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Quantity to add must be greater than zero"
            )
        vehicle = VehicleService.get_vehicle_by_id(db, vehicle_id)
        vehicle.quantity += quantity_to_add
        db.commit()
        db.refresh(vehicle)
        return vehicle
