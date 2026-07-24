from datetime import datetime
from typing import Optional
from pydantic import BaseModel, ConfigDict

class PurchaseOrderCreate(BaseModel):
    vehicle_id: int
    quantity: int = 1
    customer_name: Optional[str] = None
    customer_phone: Optional[str] = None
    customer_email: Optional[str] = None

class PurchaseOrderResponse(BaseModel):
    id: int
    user_id: int
    vehicle_id: int
    vehicle_make: str
    vehicle_model: str
    purchase_price: float
    quantity_purchased: int
    status: str
    created_at: datetime
    user_username: Optional[str] = None
    user_email: Optional[str] = None
    vehicle_image_url: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)
