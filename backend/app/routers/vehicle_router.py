import os
import uuid
from typing import List, Optional
from fastapi import APIRouter, Depends, Query, UploadFile, File, HTTPException, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.auth import get_current_user, get_current_admin_user
from app.models.user import User
from app.schemas.vehicle import (
    VehicleCreate,
    VehicleUpdate,
    VehicleResponse,
    VehicleRestock,
    PurchaseRequest,
)
from app.services.vehicle_service import VehicleService

router = APIRouter(prefix="/vehicles", tags=["Vehicles"])

UPLOAD_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "..", "uploads")
os.makedirs(UPLOAD_DIR, exist_ok=True)

@router.post("/upload-image")
def upload_vehicle_image(
    file: UploadFile = File(...),
    admin_user: User = Depends(get_current_admin_user)
):
    valid_extensions = {".jpg", ".jpeg", ".png", ".webp"}
    ext = os.path.splitext(file.filename)[1].lower()
    if ext not in valid_extensions:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Unsupported image format. Allowed formats: JPG, JPEG, PNG, WEBP."
        )
    
    # Read file content & check size limit (5MB = 5 * 1024 * 1024)
    content = file.file.read()
    if len(content) > 5 * 1024 * 1024:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Image size exceeds maximum limit of 5MB."
        )

    filename = f"{uuid.uuid4().hex}{ext}"
    file_path = os.path.join(UPLOAD_DIR, filename)
    with open(file_path, "wb") as f:
        f.write(content)

    return {"image_url": f"/static/uploads/{filename}"}

@router.get("/search", response_model=List[VehicleResponse])
def search_vehicles(
    make: Optional[str] = Query(None, description="Make of vehicle"),
    model: Optional[str] = Query(None, description="Model of vehicle"),
    category: Optional[str] = Query(None, description="Category of vehicle"),
    color: Optional[str] = Query(None, description="Color of vehicle"),
    fuel_type: Optional[str] = Query(None, description="Fuel type of vehicle"),
    min_price: Optional[float] = Query(None, ge=0, description="Minimum price filter"),
    max_price: Optional[float] = Query(None, ge=0, description="Maximum price filter"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return VehicleService.search_vehicles(
        db=db,
        make=make,
        model=model,
        category=category,
        color=color,
        fuel_type=fuel_type,
        min_price=min_price,
        max_price=max_price,
    )

@router.get("", response_model=List[VehicleResponse])
def list_vehicles(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=500),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return VehicleService.get_vehicles(db=db, skip=skip, limit=limit)

@router.post("", response_model=VehicleResponse, status_code=status.HTTP_201_CREATED)
def create_vehicle(
    vehicle_in: VehicleCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return VehicleService.create_vehicle(db=db, vehicle_in=vehicle_in)

@router.get("/{id}", response_model=VehicleResponse)
def get_vehicle(
    id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return VehicleService.get_vehicle_by_id(db=db, vehicle_id=id)

@router.put("/{id}", response_model=VehicleResponse)
def update_vehicle(
    id: int,
    vehicle_in: VehicleUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return VehicleService.update_vehicle(db=db, vehicle_id=id, vehicle_in=vehicle_in)

@router.delete("/{id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_vehicle(
    id: int,
    db: Session = Depends(get_db),
    admin_user: User = Depends(get_current_admin_user),
):
    VehicleService.delete_vehicle(db=db, vehicle_id=id)
    return None

@router.post("/{id}/purchase", response_model=VehicleResponse)
def purchase_vehicle(
    id: int,
    purchase_in: Optional[PurchaseRequest] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    customer_name = purchase_in.customer_name if purchase_in else None
    customer_phone = purchase_in.customer_phone if purchase_in else None
    customer_email = purchase_in.customer_email if purchase_in else None

    return VehicleService.purchase_vehicle(
        db=db,
        vehicle_id=id,
        customer_name=customer_name,
        customer_phone=customer_phone,
        customer_email=customer_email,
    )

@router.post("/{id}/restock", response_model=VehicleResponse)
def restock_vehicle(
    id: int,
    restock_in: VehicleRestock,
    db: Session = Depends(get_db),
    admin_user: User = Depends(get_current_admin_user),
):
    return VehicleService.restock_vehicle(
        db=db, vehicle_id=id, quantity_to_add=restock_in.quantity_to_add
    )
