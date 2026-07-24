from typing import Dict, Any, List
from sqlalchemy.orm import Session
from app.models.vehicle import Vehicle
from app.models.sale import Sale
from app.models.testdrive import TestDrive

class AnalyticsService:
    @staticmethod
    def get_analytics(db: Session) -> Dict[str, Any]:
        sales = db.query(Sale).all()
        test_drives = db.query(TestDrive).all()
        vehicles = db.query(Vehicle).all()

        vehicle_dict = {v.id: f"{v.make} {v.model}" for v in vehicles}

        total_purchases = len(sales)
        total_test_drives = len(test_drives)

        # Calculate vehicle-wise purchase counts
        purchase_map: Dict[str, int] = {}
        for s in sales:
            v_name = vehicle_dict.get(s.vehicle_id, f"Vehicle #{s.vehicle_id}")
            purchase_map[v_name] = purchase_map.get(v_name, 0) + 1

        vehicle_purchase_counts = [
            {"name": name, "count": count} for name, count in purchase_map.items()
        ]

        most_purchased_vehicle = "No purchase records available."
        if purchase_map:
            most_purchased_vehicle = max(purchase_map, key=purchase_map.get)

        # Calculate vehicle-wise test drive counts
        test_drive_map: Dict[str, int] = {}
        for td in test_drives:
            v_name = vehicle_dict.get(td.vehicle_id, f"Vehicle #{td.vehicle_id}")
            test_drive_map[v_name] = test_drive_map.get(v_name, 0) + 1

        vehicle_test_drive_counts = [
            {"name": name, "count": count} for name, count in test_drive_map.items()
        ]

        most_test_driven_vehicle = "No test drive records available."
        if test_drive_map:
            most_test_driven_vehicle = max(test_drive_map, key=test_drive_map.get)

        return {
            "total_purchases": total_purchases,
            "total_test_drives": total_test_drives,
            "most_purchased_vehicle": most_purchased_vehicle,
            "most_test_driven_vehicle": most_test_driven_vehicle,
            "vehicle_purchase_counts": vehicle_purchase_counts,
            "vehicle_test_drive_counts": vehicle_test_drive_counts,
        }
