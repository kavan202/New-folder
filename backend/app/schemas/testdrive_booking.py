from datetime import datetime
from typing import Optional
from pydantic import BaseModel, ConfigDict

class TestDriveBookingCreate(BaseModel):
    vehicle_id: int
    booking_date: str
    booking_time: str
    contact_number: str
    notes: Optional[str] = None

class TestDriveBookingResponse(BaseModel):
    id: int
    user_id: int
    vehicle_id: int
    vehicle_name: str
    booking_date: str
    booking_time: str
    contact_number: str
    notes: Optional[str] = None
    status: str
    created_at: datetime
    user_username: Optional[str] = None
    user_email: Optional[str] = None
    vehicle_image_url: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)

class TestDriveStatusUpdate(BaseModel):
    status: str
