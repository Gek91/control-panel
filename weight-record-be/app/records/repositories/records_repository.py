from __future__ import annotations

from datetime import date

from sqlalchemy import func
from sqlalchemy.orm import Session

from app.records.models.record import Record


class RecordRepository:
    def __init__(self, session: Session):
        self.session = session

    def get_by_id(self, record_id: str) -> Record | None:
        return (
            self.session.query(Record).filter(Record.id == record_id).first()
        )

    def list(
        self,
        *,
        exercise_id: str | None = None,
        from_date: date | None = None,
        to_date: date | None = None,
        sort_by: str = "date",
        sort_order: str = "desc",
    ) -> list[Record]:
        query = self.session.query(Record)

        if exercise_id is not None:
            query = query.filter(Record.exercise_id == exercise_id)
        if from_date is not None:
            query = query.filter(Record.date >= from_date)
        if to_date is not None:
            query = query.filter(Record.date <= to_date)

        if sort_by == "exercise":
            from app.exercises.models.exercise import Exercise

            query = query.join(Record.exercise)
            column = Exercise.name
        elif sort_by == "id":
            column = Record.id
        else:
            column = Record.date

        if sort_order == "asc":
            query = query.order_by(column.asc())
        else:
            query = query.order_by(column.desc())

        return query.all()

    def max_estimated_one_rep_max(self, exercise_id: str) -> float | None:
        """Max of weight * 100 / percentage for the exercise, or None if no records."""
        return (
            self.session.query(
                func.max(Record.weight * 100.0 / Record.percentage)
            )
            .filter(Record.exercise_id == exercise_id)
            .scalar()
        )

    def add(self, record: Record) -> Record:
        self.session.add(record)
        self.session.flush()
        return record

    def delete(self, record: Record) -> None:
        self.session.delete(record)
        self.session.flush()
