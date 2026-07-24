from typing import List, Optional
from fastapi import APIRouter, Depends, Query, status, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.auth import get_current_user, get_current_admin_user
from app.models.user import User
from app.schemas.testdrive_booking import (
    TestDriveBookingCreate,
    TestDriveBookingResponse
)
from app.services.testdrive_booking_service import TestDriveBookingService

router = APIRouter(prefix="/test-drives", tags=["TestDrives"])

@router.post("/book", response_model=TestDriveBookingResponse, status_code=status.HTTP_201_CREATED)
def book_test_drive(
    booking_in: TestDriveBookingCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return TestDriveBookingService.book_test_drive(db=db, user=current_user, booking_in=booking_in)

@router.post("", response_model=TestDriveBookingResponse, status_code=status.HTTP_201_CREATED)
def book_test_drive_alias(
    booking_in: TestDriveBookingCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return TestDriveBookingService.book_test_drive(db=db, user=current_user, booking_in=booking_in)

@router.get("/my", response_model=List[TestDriveBookingResponse])
def get_my_test_drives(
    search: Optional[str] = Query(None),
    status: Optional[str] = Query(None),
    date: Optional[str] = Query(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return TestDriveBookingService.get_user_bookings(
        db=db,
        user_id=current_user.id,
        search=search,
        status_filter=status,
        date_filter=date
    )

@router.get("", response_model=List[TestDriveBookingResponse])
def get_all_test_drives(
    user_id: Optional[int] = Query(None),
    vehicle_id: Optional[int] = Query(None),
    search: Optional[str] = Query(None),
    status: Optional[str] = Query(None),
    date: Optional[str] = Query(None),
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=500),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # If user is regular user, only return their own bookings
    if current_user.role != "admin":
        user_id = current_user.id

    return TestDriveBookingService.get_all_bookings(
        db=db,
        user_id=user_id,
        vehicle_id=vehicle_id,
        search=search,
        status_filter=status,
        date_filter=date,
        skip=skip,
        limit=limit
    )

@router.put("/{id}/approve", response_model=TestDriveBookingResponse)
def approve_test_drive(
    id: int,
    db: Session = Depends(get_db),
    admin_user: User = Depends(get_current_admin_user)
):
    return TestDriveBookingService.approve_booking(db=db, booking_id=id)

@router.put("/{id}/cancel", response_model=TestDriveBookingResponse)
def cancel_test_drive(
    id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return TestDriveBookingService.cancel_booking(db=db, booking_id=id, current_user=current_user)

@router.put("/{id}/complete", response_model=TestDriveBookingResponse)
def complete_test_drive(
    id: int,
    db: Session = Depends(get_db),
    admin_user: User = Depends(get_current_admin_user)
):
    return TestDriveBookingService.complete_booking(db=db, booking_id=id)
