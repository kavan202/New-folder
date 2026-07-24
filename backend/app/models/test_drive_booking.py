from datetime import datetime, timezone
from typing import Optional
from sqlalchemy import String, Integer, DateTime, ForeignKey, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.models.base import Base

class TestDriveBooking(Base):
    __tablename__ = "test_drive_bookings"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    user_id: Mapped[int] = mapped_column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    vehicle_id: Mapped[int] = mapped_column(Integer, ForeignKey("vehicles.id"), nullable=False, index=True)
    vehicle_name: Mapped[str] = mapped_column(String(100), nullable=False)
    booking_date: Mapped[str] = mapped_column(String(20), nullable=False, index=True)
    booking_time: Mapped[str] = mapped_column(String(20), nullable=False, index=True)
    contact_number: Mapped[str] = mapped_column(String(20), nullable=False)
    notes: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    status: Mapped[str] = mapped_column(String(30), default="Pending", nullable=False, index=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        nullable=False
    )

    user = relationship("User", backref="test_drive_bookings", lazy="joined")
    vehicle = relationship("Vehicle", backref="test_drive_bookings", lazy="joined")
