import io
import pytest
from fastapi import status
from app.auth import create_access_token
from app.models.user import User, UserRole
from app.models.vehicle import Vehicle

@pytest.fixture
def normal_user_headers(db_session):
    user = User(
        username="normaluser",
        email="normal@example.com",
        hashed_password="hashed_password",
        role=UserRole.USER.value
    )
    db_session.add(user)
    db_session.commit()
    db_session.refresh(user)
    token = create_access_token(data={"sub": user.username, "role": user.role})
    return {"Authorization": f"Bearer {token}"}

@pytest.fixture
def admin_user_headers(db_session):
    admin = User(
        username="adminboss",
        email="adminboss@example.com",
        hashed_password="hashed_password",
        role=UserRole.ADMIN.value
    )
    db_session.add(admin)
    db_session.commit()
    db_session.refresh(admin)
    token = create_access_token(data={"sub": admin.username, "role": admin.role})
    return {"Authorization": f"Bearer {token}"}

# Test CRUD: Create Vehicle with color & fuel_type
def test_create_vehicle(client, normal_user_headers):
    payload = {
        "make": "Tesla",
        "model": "Model 3",
        "category": "Electric",
        "color": "Midnight Black",
        "fuel_type": "EV",
        "price": 4200000.0,
        "quantity": 5
    }
    res = client.post("/api/vehicles", json=payload, headers=normal_user_headers)
    assert res.status_code == status.HTTP_201_CREATED
    data = res.json()
    assert data["make"] == "Tesla"
    assert data["color"] == "Midnight Black"
    assert data["fuel_type"] == "EV"
    assert data["quantity"] == 5

# Test CRUD: List Vehicles
def test_list_vehicles(client, normal_user_headers, db_session):
    v1 = Vehicle(make="Ford", model="Mustang", category="Sports", price=5500000.0, quantity=2)
    v2 = Vehicle(make="BMW", model="M3", category="Sports", price=7500000.0, quantity=1)
    db_session.add_all([v1, v2])
    db_session.commit()

    res = client.get("/api/vehicles", headers=normal_user_headers)
    assert res.status_code == status.HTTP_200_OK
    data = res.json()
    assert len(data) >= 2

# Test CRUD: Update Vehicle
def test_update_vehicle(client, normal_user_headers, db_session):
    v = Vehicle(make="Honda", model="Civic", category="Sedan", price=2200000.0, quantity=3)
    db_session.add(v)
    db_session.commit()
    db_session.refresh(v)

    update_payload = {"price": 2400000.0, "quantity": 4, "color": "Apex Blue"}
    res = client.put(f"/api/vehicles/{v.id}", json=update_payload, headers=normal_user_headers)
    assert res.status_code == status.HTTP_200_OK
    data = res.json()
    assert data["price"] == 2400000.0
    assert data["color"] == "Apex Blue"

# Test Delete Vehicle
def test_delete_vehicle_forbidden_for_normal_user(client, normal_user_headers, db_session):
    v = Vehicle(make="Audi", model="A4", category="Luxury", price=4000000.0, quantity=1)
    db_session.add(v)
    db_session.commit()
    db_session.refresh(v)

    res = client.delete(f"/api/vehicles/{v.id}", headers=normal_user_headers)
    assert res.status_code == status.HTTP_403_FORBIDDEN

def test_delete_vehicle_success_for_admin(client, admin_user_headers, db_session):
    v = Vehicle(make="Audi", model="A4", category="Luxury", price=4000000.0, quantity=1)
    db_session.add(v)
    db_session.commit()
    db_session.refresh(v)

    res = client.delete(f"/api/vehicles/{v.id}", headers=admin_user_headers)
    assert res.status_code == status.HTTP_204_NO_CONTENT

# Test Search API with color & fuel_type
def test_search_vehicles_filtering(client, normal_user_headers, db_session):
    v1 = Vehicle(make="Toyota", model="Corolla", category="Sedan", color="Silver", fuel_type="Hybrid", price=2000000.0, quantity=10)
    v2 = Vehicle(make="Toyota", model="RAV4", category="SUV", color="Black", fuel_type="Petrol", price=3200000.0, quantity=5)
    v3 = Vehicle(make="Porsche", model="911", category="Sports", color="Red", fuel_type="Petrol", price=12000000.0, quantity=1)
    db_session.add_all([v1, v2, v3])
    db_session.commit()

    # Search by make and fuel_type
    res = client.get("/api/vehicles/search?make=Toyota&fuel_type=Hybrid", headers=normal_user_headers)
    assert res.status_code == status.HTTP_200_OK
    data = res.json()
    assert len(data) == 1
    assert data[0]["model"] == "Corolla"

# Test Purchase API with customer details
def test_purchase_vehicle_success(client, normal_user_headers, db_session):
    v = Vehicle(make="Chevrolet", model="Tahoe", category="SUV", price=6000000.0, quantity=2)
    db_session.add(v)
    db_session.commit()
    db_session.refresh(v)

    purchase_payload = {
        "customer_name": "Rohan Kumar",
        "customer_phone": "9876543210",
        "customer_email": "rohan@example.com"
    }
    res = client.post(f"/api/vehicles/{v.id}/purchase", json=purchase_payload, headers=normal_user_headers)
    assert res.status_code == status.HTTP_200_OK
    data = res.json()
    assert data["quantity"] == 1

def test_purchase_vehicle_out_of_stock(client, normal_user_headers, db_session):
    v = Vehicle(make="Nissan", model="Leaf", category="Electric", price=2800000.0, quantity=0)
    db_session.add(v)
    db_session.commit()
    db_session.refresh(v)

    res = client.post(f"/api/vehicles/{v.id}/purchase", headers=normal_user_headers)
    assert res.status_code == status.HTTP_400_BAD_REQUEST

# Test Test Drive Booking
def test_book_test_drive(client, normal_user_headers, db_session):
    v = Vehicle(make="BMW", model="i4", category="Electric", price=7000000.0, quantity=3)
    db_session.add(v)
    db_session.commit()
    db_session.refresh(v)

    td_payload = {
        "vehicle_id": v.id,
        "customer_name": "Ananya Roy",
        "customer_phone": "9123456789",
        "customer_email": "ananya@example.com"
    }
    res = client.post("/api/test-drives", json=td_payload, headers=normal_user_headers)
    assert res.status_code == status.HTTP_201_CREATED
    data = res.json()
    assert data["customer_name"] == "Ananya Roy"
    assert data["status"] == "Scheduled"

# Test Image Upload API
def test_upload_vehicle_image(client, admin_user_headers):
    file_data = io.BytesIO(b"fake image bytes")
    files = {"file": ("test_car.png", file_data, "image/png")}
    res = client.post("/api/vehicles/upload-image", files=files, headers=admin_user_headers)
    assert res.status_code == status.HTTP_200_OK
    data = res.json()
    assert "image_url" in data
    assert data["image_url"].startswith("/static/uploads/")

# Test Analytics API
def test_analytics_dashboard_admin_only(client, normal_user_headers, admin_user_headers):
    res_user = client.get("/api/analytics", headers=normal_user_headers)
    assert res_user.status_code == status.HTTP_403_FORBIDDEN

    res_admin = client.get("/api/analytics", headers=admin_user_headers)
    assert res_admin.status_code == status.HTTP_200_OK
    data = res_admin.json()
    assert "total_purchases" in data
    assert "vehicle_purchase_counts" in data
