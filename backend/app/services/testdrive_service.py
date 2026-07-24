from typing import List
from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from app.models.testdrive import TestDrive
from app.models.vehicle import Vehicle
from app.schemas.testdrive import TestDriveCreate

class TestDriveService:
    @staticmethod
    def create_test_drive(db: Session, test_drive_in: TestDriveCreate) -> TestDrive:
        vehicle = db.query(Vehicle).filter(Vehicle.id == test_drive_in.vehicle_id).first()
        if not vehicle:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Vehicle with id {test_drive_in.vehicle_id} not found"
            )
        
        test_drive = TestDrive(
            vehicle_id=test_drive_in.vehicle_id,
            customer_name=test_drive_in.customer_name,
            customer_phone=test_drive_in.customer_phone,
            customer_email=test_drive_in.customer_email,
            status="Scheduled"
        )
        db.add(test_drive)
        db.commit()
        db.refresh(test_drive)
        return test_drive

    @staticmethod
    def get_test_drives(db: Session, skip: int = 0, limit: int = 100) -> List[TestDrive]:
        return db.query(TestDrive).order_by(TestDrive.created_at.desc()).offset(skip).limit(limit).all()
