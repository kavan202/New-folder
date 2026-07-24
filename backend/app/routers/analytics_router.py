from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database import get_db
from app.auth import get_current_admin_user
from app.models.user import User
from app.schemas.analytics import AnalyticsResponse
from app.services.analytics_service import AnalyticsService

router = APIRouter(prefix="/analytics", tags=["Analytics"])

@router.get("", response_model=AnalyticsResponse)
def get_analytics_dashboard(
    db: Session = Depends(get_db),
    admin_user: User = Depends(get_current_admin_user),
):
    return AnalyticsService.get_analytics(db=db)
