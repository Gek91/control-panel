from __future__ import annotations

from datetime import date

from sqlalchemy import Date, Float, ForeignKey, Integer, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import BaseModel


class Record(BaseModel):
    __tablename__ = "records"

    id: Mapped[str] = mapped_column(String(36), primary_key=True)
    date: Mapped[date] = mapped_column(Date, nullable=False)
    exercise_id: Mapped[str] = mapped_column(
        String(10), ForeignKey("exercises.id"), nullable=False
    )
    weight: Mapped[float] = mapped_column(Float, nullable=False)
    percentage: Mapped[int] = mapped_column(Integer, nullable=False)

    exercise = relationship("Exercise", lazy="joined")
