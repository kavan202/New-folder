from typing import List
from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.auth import get_current_user
from app.models.user import User
from app.models.vehicle import Vehicle
from app.schemas.testdrive import TestDriveCreate, TestDriveResponse
from app.services.testdrive_service import TestDriveService

router = APIRouter(prefix="/test-drives", tags=["TestDrives"])

@router.post("", response_model=TestDriveResponse, status_code=status.HTTP_201_CREATED)
def book_test_drive(
    test_drive_in: TestDriveCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    td = TestDriveService.create_test_drive(db=db, test_drive_in=test_drive_in)
    v = db.query(Vehicle).filter(Vehicle.id == td.vehicle_id).first()
    res = TestDriveResponse.model_validate(td)
    if v:
        res.vehicle_name = f"{v.make} {v.model}"
    return res

@router.get("", response_model=List[TestDriveResponse])
def get_test_drives(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=500),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    tds = TestDriveService.get_test_drives(db=db, skip=skip, limit=limit)
    res_list = []
    for td in tds:
        v = db.query(Vehicle).filter(Vehicle.id == td.vehicle_id).first()
        r = TestDriveResponse.model_validate(td)
        if v:
            r.vehicle_name = f"{v.make} {v.model}"
        res_list.append(r)
    return res_list
