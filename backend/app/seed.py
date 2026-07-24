import os
import sys

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from sqlalchemy.orm import Session
from app.database import SessionLocal, engine
from app.models.base import Base
from app.models.user import User, UserRole
from app.models.vehicle import Vehicle
from app.models.customer import Customer
from app.models.sale import Sale
from app.models.testdrive import TestDrive
from app.auth import get_password_hash

photo_vehicles = [
    {
        "make": "Ford",
        "model": "F-150 Lightning",
        "category": "Truck",
        "price": 7350000.0,
        "color": "Iconic Silver",
        "fuel_type": "Electric",
        "quantity": 4,
        "image_url": "https://images.unsplash.com/photo-1605893477799-b99e3b8b93fe?auto=format&fit=crop&w=800&q=80",
    },
    {
        "make": "Chevrolet",
        "model": "Corvette Z06",
        "category": "Sports",
        "price": 13500000.0,
        "color": "Arctic White",
        "fuel_type": "Petrol",
        "quantity": 4,
        "image_url": "https://images.unsplash.com/photo-1617814076367-b759c7d7e738?auto=format&fit=crop&w=800&q=80",
    },
    {
        "make": "Toyota",
        "model": "Camry XSE",
        "category": "Sedan",
        "price": 4850000.0,
        "color": "Pearl White",
        "fuel_type": "Petrol",
        "quantity": 5,
        "image_url": "https://images.unsplash.com/photo-1621007947382-bb3c3994e3fb?auto=format&fit=crop&w=800&q=80",
    },
    {
        "make": "BMW",
        "model": "M5 Competition",
        "category": "Luxury",
        "price": 16500000.0,
        "color": "Black Sapphire",
        "fuel_type": "Petrol",
        "quantity": 3,
        "image_url": "https://images.unsplash.com/photo-1555215695-3004980ad54e?auto=format&fit=crop&w=800&q=80",
    },
    {
        "make": "Porsche",
        "model": "911 GT3 RS",
        "category": "Sports",
        "price": 34500000.0,
        "color": "Guards Red",
        "fuel_type": "Petrol",
        "quantity": 3,
        "image_url": "https://images.unsplash.com/photo-1614162692292-7ac56d7f7f1e?auto=format&fit=crop&w=800&q=80",
    },
    {
        "make": "Audi",
        "model": "RS e-tron GT",
        "category": "Electric",
        "price": 17200000.0,
        "color": "Kemora Grey",
        "fuel_type": "Electric",
        "quantity": 0,
        "image_url": "https://images.unsplash.com/photo-1603584173870-7f23fdae1b7a?auto=format&fit=crop&w=800&q=80",
    },
    {
        "make": "Tata",
        "model": "Harrier",
        "category": "SUV",
        "price": 2490000.0,
        "color": "Oberon Black",
        "fuel_type": "Diesel",
        "quantity": 7,
        "image_url": "https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=800&q=80",
    },
    {
        "make": "Tesla",
        "model": "Model S Plaid",
        "category": "Electric",
        "price": 14500000.0,
        "color": "Pearl White",
        "fuel_type": "Electric",
        "quantity": 1,
        "image_url": "https://images.unsplash.com/photo-1560958089-b8a1929cea89?auto=format&fit=crop&w=800&q=80",
    },
    {
        "make": "Mercedes-Benz",
        "model": "G 63 AMG",
        "category": "SUV",
        "price": 28500000.0,
        "color": "Polar White",
        "fuel_type": "Petrol",
        "quantity": 4,
        "image_url": "https://images.unsplash.com/photo-1520031441872-265e4ff70845?auto=format&fit=crop&w=800&q=80",
    },
    {
        "make": "Hyundai",
        "model": "Creta SX",
        "category": "SUV",
        "price": 1899000.0,
        "color": "Phantom Black",
        "fuel_type": "Petrol",
        "quantity": 8,
        "image_url": "https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=800&q=80",
    },
    {
        "make": "Maruti Suzuki",
        "model": "Swift VXi",
        "category": "Hatchback",
        "price": 729000.0,
        "color": "Fire Red",
        "fuel_type": "Petrol",
        "quantity": 10,
        "image_url": "https://images.unsplash.com/photo-1590362891991-f776e747a588?auto=format&fit=crop&w=800&q=80",
    },
    {
        "make": "Kia",
        "model": "Seltos HTX",
        "category": "SUV",
        "price": 1650000.0,
        "color": "Gravity Blue",
        "fuel_type": "Diesel",
        "quantity": 6,
        "image_url": "https://images.unsplash.com/photo-1563720223185-11003d516935?auto=format&fit=crop&w=800&q=80",
    },
]

def seed_database():
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        # Seed Admin user if not exists
        admin = db.query(User).filter(User.username == "admin").first()
        if not admin:
            admin = User(
                username="admin",
                email="admin@autovault.com",
                hashed_password=get_password_hash("admin123"),
                role=UserRole.ADMIN.value
            )
            db.add(admin)

        # Seed Standard user if not exists
        user = db.query(User).filter(User.username == "user").first()
        if not user:
            user = User(
                username="user",
                email="buyer@autovault.com",
                hashed_password=get_password_hash("user123"),
                role=UserRole.USER.value
            )
            db.add(user)

        # Sync/Seed Vehicles matching the photo specs
        for item in photo_vehicles:
            existing = db.query(Vehicle).filter(
                Vehicle.make == item["make"],
                Vehicle.model == item["model"]
            ).first()

            if existing:
                existing.category = item["category"]
                existing.price = item["price"]
                existing.color = item["color"]
                existing.fuel_type = item["fuel_type"]
                existing.quantity = item["quantity"]
                existing.image_url = item["image_url"]
            else:
                new_vehicle = Vehicle(**item)
                db.add(new_vehicle)

        db.commit()

        # Seed sample Customer & Sales & Test Drive for Initial Analytics
        if db.query(Customer).count() == 0:
            c1 = Customer(full_name="Rajesh Sharma", mobile_number="9876543210", email="rajesh@example.com")
            c2 = Customer(full_name="Priya Patel", mobile_number="9123456789", email="priya@example.com")
            db.add_all([c1, c2])
            db.commit()

            v1 = db.query(Vehicle).filter(Vehicle.model == "Camry XSE").first()
            if v1:
                s1 = Sale(vehicle_id=v1.id, customer_id=c1.id, sale_price=v1.price)
                td1 = TestDrive(vehicle_id=v1.id, customer_name=c1.full_name, customer_phone=c1.mobile_number, customer_email=c1.email, status="Scheduled")
                db.add_all([s1, td1])
                db.commit()

        print("Database seeded & updated successfully matching exact photo specifications!")
    except Exception as e:
        db.rollback()
        print(f"Error seeding database: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    seed_database()
