from pydantic import BaseModel
from typing import List, Optional

class VehicleCountItem(BaseModel):
    name: str
    count: int

class AnalyticsMetrics(BaseModel):
    total_purchases: int
    total_test_drives: int
    most_purchased_vehicle: str
    most_test_driven_vehicle: str

class AnalyticsResponse(BaseModel):
    total_purchases: int
    total_test_drives: int
    most_purchased_vehicle: str
    most_test_driven_vehicle: str
    vehicle_purchase_counts: List[VehicleCountItem]
    vehicle_test_drive_counts: List[VehicleCountItem]
