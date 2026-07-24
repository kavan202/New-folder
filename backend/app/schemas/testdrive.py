from pydantic import BaseModel, Field, ConfigDict
from datetime import datetime
from typing import Optional

class TestDriveCreate(BaseModel):
    vehicle_id: int = Field(..., gt=0)
    customer_name: str = Field(..., min_length=1, max_length=100)
    customer_phone: str = Field(..., min_length=10, max_length=10, pattern=r"^\d{10}$")
    customer_email: Optional[str] = Field(None)

class TestDriveResponse(BaseModel):
    id: int
    vehicle_id: int
    vehicle_name: Optional[str] = None
    customer_name: str
    customer_phone: str
    customer_email: Optional[str] = None
    booking_date: datetime
    status: str
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)
