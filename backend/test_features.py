import sys
import os
from fastapi.testclient import TestClient

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app.main import app
from app.seed import seed_database
from app.database import SessionLocal
from app.models.user import User

def run_tests():
    print("Starting automated verification for Purchase History and Test Drive Management...")
    seed_database()
    
    client = TestClient(app)

    # 1. Login as standard user
    response = client.post("/api/auth/login", json={"username": "user", "password": "user123"})
    assert response.status_code == 200, f"User login failed: {response.text}"
    user_token = response.json()["access_token"]
    user_headers = {"Authorization": f"Bearer {user_token}"}
    print("[OK] User login successful")

    # 2. Login as admin user
    response = client.post("/api/auth/login", json={"username": "admin", "password": "admin123"})
    assert response.status_code == 200, f"Admin login failed: {response.text}"
    admin_token = response.json()["access_token"]
    admin_headers = {"Authorization": f"Bearer {admin_token}"}
    print("[OK] Admin login successful")

    # 3. Get vehicles list
    response = client.get("/api/vehicles", headers=user_headers)
    assert response.status_code == 200
    vehicles = response.json()
    assert len(vehicles) > 0, "No vehicles returned"
    v = vehicles[0]
    vehicle_id = v["id"]
    print(f"[OK] Vehicles retrieved (using vehicle: {v['make']} {v['model']})")

    # 4. Purchase vehicle
    purchase_payload = {
        "vehicle_id": vehicle_id,
        "quantity": 1,
        "customer_name": "Test Customer",
        "customer_phone": "9876543210",
        "customer_email": "test@example.com"
    }
    response = client.post("/api/orders/purchase", json=purchase_payload, headers=user_headers)
    assert response.status_code == 201, f"Purchase failed: {response.text}"
    purchase_data = response.json()
    assert purchase_data["vehicle_id"] == vehicle_id
    assert purchase_data["status"] == "Completed"
    print(f"[OK] POST /orders/purchase passed (Order ID: {purchase_data['id']})")

    # 5. Get user purchases (/orders/my)
    response = client.get("/api/orders/my", headers=user_headers)
    assert response.status_code == 200
    user_purchases = response.json()
    assert len(user_purchases) > 0
    print(f"[OK] GET /orders/my passed ({len(user_purchases)} orders found)")

    # 6. Admin get all orders (/orders)
    response = client.get("/api/orders", headers=admin_headers)
    assert response.status_code == 200
    all_orders = response.json()
    assert len(all_orders) > 0
    print(f"[OK] GET /orders (Admin) passed ({len(all_orders)} total orders found)")

    # 7. Book test drive (/test-drives/book)
    td_payload = {
        "vehicle_id": vehicle_id,
        "booking_date": "2026-08-01",
        "booking_time": "10:00 AM",
        "contact_number": "9876543210",
        "notes": "Interested in highway mileage test."
    }
    response = client.post("/api/test-drives/book", json=td_payload, headers=user_headers)
    assert response.status_code == 201, f"Test drive booking failed: {response.text}"
    booking_data = response.json()
    booking_id = booking_data["id"]
    assert booking_data["status"] == "Pending"
    print(f"[OK] POST /test-drives/book passed (Booking ID: {booking_id})")

    # 8. Test drive capacity limit verification
    # Add 2 more bookings for same slot (capacity max = 3)
    client.post("/api/test-drives/book", json=td_payload, headers=user_headers)
    client.post("/api/test-drives/book", json=td_payload, headers=user_headers)
    # 4th booking should fail
    fail_response = client.post("/api/test-drives/book", json=td_payload, headers=user_headers)
    assert fail_response.status_code == 400, f"Expected 400 capacity error but got {fail_response.status_code}"
    assert "Maximum booking capacity" in fail_response.json()["detail"]
    print("[OK] Test Drive capacity enforcement (Max 3 appointments per slot) passed")

    # 9. Get user test drives (/test-drives/my)
    response = client.get("/api/test-drives/my", headers=user_headers)
    assert response.status_code == 200
    user_tds = response.json()
    assert len(user_tds) >= 3
    print(f"[OK] GET /test-drives/my passed ({len(user_tds)} test drives found)")

    # 10. Admin approve test drive (/test-drives/{id}/approve)
    response = client.put(f"/api/test-drives/{booking_id}/approve", headers=admin_headers)
    assert response.status_code == 200
    assert response.json()["status"] == "Approved"
    print("[OK] PUT /test-drives/{id}/approve passed")

    # 11. Admin complete test drive (/test-drives/{id}/complete)
    response = client.put(f"/api/test-drives/{booking_id}/complete", headers=admin_headers)
    assert response.status_code == 200
    assert response.json()["status"] == "Completed"
    print("[OK] PUT /test-drives/{id}/complete passed")

    # 12. User cancel test drive (/test-drives/{id}/cancel)
    td2 = user_tds[1]["id"]
    response = client.put(f"/api/test-drives/{td2}/cancel", headers=user_headers)
    assert response.status_code == 200
    assert response.json()["status"] == "Cancelled"
    print("[OK] PUT /test-drives/{id}/cancel passed")

    print("\nALL VERIFICATION TESTS PASSED SUCCESSFULLY!")

if __name__ == "__main__":
    run_tests()
