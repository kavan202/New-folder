from typing import List, Optional
from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.auth import get_current_user, get_current_admin_user
from app.models.user import User
from app.schemas.purchase import PurchaseOrderCreate, PurchaseOrderResponse
from app.services.purchase_service import PurchaseService

router = APIRouter(prefix="/orders", tags=["Orders"])

@router.post("/purchase", response_model=PurchaseOrderResponse, status_code=status.HTTP_201_CREATED)
def purchase_vehicle(
    purchase_in: PurchaseOrderCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return PurchaseService.create_purchase(db=db, user=current_user, purchase_in=purchase_in)

@router.get("/my", response_model=List[PurchaseOrderResponse])
def get_my_purchases(
    search: Optional[str] = Query(None, description="Search by vehicle make or model"),
    date: Optional[str] = Query(None, description="Filter by purchase date YYYY-MM-DD"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return PurchaseService.get_user_purchases(
        db=db,
        user_id=current_user.id,
        search=search,
        date=date
    )

@router.get("", response_model=List[PurchaseOrderResponse])
def get_all_purchases(
    user_id: Optional[int] = Query(None),
    vehicle_id: Optional[int] = Query(None),
    search: Optional[str] = Query(None),
    date: Optional[str] = Query(None),
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=500),
    db: Session = Depends(get_db),
    admin_user: User = Depends(get_current_admin_user)
):
    return PurchaseService.get_all_purchases(
        db=db,
        user_id=user_id,
        vehicle_id=vehicle_id,
        search=search,
        date=date,
        skip=skip,
        limit=limit
    )
