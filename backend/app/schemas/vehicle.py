from pydantic import BaseModel, Field, ConfigDict, EmailStr
from datetime import datetime
from typing import Optional

class VehicleBase(BaseModel):
    make: str = Field(..., min_length=1, max_length=50)
    model: str = Field(..., min_length=1, max_length=50)
    category: str = Field(..., min_length=1, max_length=50)
    color: str = Field("Midnight Black", min_length=1, max_length=50)
    fuel_type: str = Field("Hybrid", min_length=1, max_length=30) # Petrol, Diesel, EV, Hybrid
    price: float = Field(..., gt=0)
    quantity: int = Field(0, ge=0)
    image_url: Optional[str] = Field(None)

class VehicleCreate(VehicleBase):
    pass

class VehicleUpdate(BaseModel):
    make: Optional[str] = Field(None, min_length=1, max_length=50)
    model: Optional[str] = Field(None, min_length=1, max_length=50)
    category: Optional[str] = Field(None, min_length=1, max_length=50)
    color: Optional[str] = Field(None, min_length=1, max_length=50)
    fuel_type: Optional[str] = Field(None, min_length=1, max_length=30)
    price: Optional[float] = Field(None, gt=0)
    quantity: Optional[int] = Field(None, ge=0)
    image_url: Optional[str] = Field(None)

class VehicleResponse(VehicleBase):
    id: int
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)

class VehicleRestock(BaseModel):
    quantity_to_add: int = Field(..., gt=0)

class PurchaseRequest(BaseModel):
    customer_name: str = Field(..., min_length=1, max_length=100)
    customer_phone: str = Field(..., min_length=10, max_length=10, pattern=r"^\d{10}$")
    customer_email: Optional[str] = Field(None)
