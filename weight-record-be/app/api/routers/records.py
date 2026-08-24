from __future__ import annotations

from datetime import date
from typing import Annotated, Literal

from fastapi import APIRouter, Depends, HTTPException, Response, status

from app.api.dependencies import get_records_service
from app.api.schemas.records import RecordCreateDTO, RecordDTO, RecordUpdateDTO
from app.core.exceptions import NotFoundError
from app.records.services.records_service import InvalidRecordError, RecordsService

router = APIRouter(prefix="/records")


@router.get("", status_code=status.HTTP_200_OK)
async def list_records(
    records_service: Annotated[RecordsService, Depends(get_records_service)],
    exerciseId: str | None = None,
    fromDate: date | None = None,
    toDate: date | None = None,
    sortBy: Literal["date", "exercise", "id"] = "date",
    sortOrder: Literal["asc", "desc"] = "desc",
) -> list[RecordDTO]:
    records = records_service.list_records(
        exercise_id=exerciseId,
        from_date=fromDate,
        to_date=toDate,
        sort_by=sortBy,
        sort_order=sortOrder,
    )
    return [RecordDTO.from_entity(record) for record in records]


@router.get("/{record_id}", status_code=status.HTTP_200_OK)
async def get_record(
    record_id: str,
    records_service: Annotated[RecordsService, Depends(get_records_service)],
) -> RecordDTO:
    try:
        return RecordDTO.from_entity(records_service.get_record(record_id))
    except NotFoundError as exc:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail=exc.message
        ) from exc


@router.post("", status_code=status.HTTP_201_CREATED)
async def create_record(
    body: RecordCreateDTO,
    records_service: Annotated[RecordsService, Depends(get_records_service)],
) -> RecordDTO:
    try:
        record = records_service.create_record(
            record_date=body.date,
            exercise_id=body.exerciseId,
            weight=body.weight,
            percentage=body.percentage,
        )
    except InvalidRecordError as exc:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail=exc.message
        ) from exc
    except NotFoundError as exc:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail=exc.message
        ) from exc
    return RecordDTO.from_entity(record)


@router.put("/{record_id}", status_code=status.HTTP_200_OK)
async def update_record(
    record_id: str,
    body: RecordUpdateDTO,
    records_service: Annotated[RecordsService, Depends(get_records_service)],
) -> RecordDTO:
    try:
        record = records_service.update_record(
            record_id,
            record_date=body.date,
            exercise_id=body.exerciseId,
            weight=body.weight,
            percentage=body.percentage,
        )
    except InvalidRecordError as exc:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail=exc.message
        ) from exc
    except NotFoundError as exc:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail=exc.message
        ) from exc
    return RecordDTO.from_entity(record)


@router.delete("/{record_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_record(
    record_id: str,
    records_service: Annotated[RecordsService, Depends(get_records_service)],
) -> Response:
    try:
        records_service.delete_record(record_id)
    except NotFoundError as exc:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail=exc.message
        ) from exc
    return Response(status_code=status.HTTP_204_NO_CONTENT)
