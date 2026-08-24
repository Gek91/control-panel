import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';
import { PercentageValue, Record } from '../models/record';
import { SortBy } from '../../utils/sorting';
import { WEIGHT_API_BASE_URL } from './weight-api.config';

@Injectable({
  providedIn: 'root',
})
export class RecordService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = inject(WEIGHT_API_BASE_URL);

  getRecords(
    filterBy?: FilterByRecord,
    sortBy?: SortByRecord,
  ): Observable<Record[]> {
    let params = new HttpParams();

    if (filterBy?.exerciseId) {
      params = params.set('exerciseId', filterBy.exerciseId);
    }
    if (filterBy?.fromDate) {
      params = params.set('fromDate', toIsoDate(filterBy.fromDate));
    }
    if (filterBy?.toDate) {
      params = params.set('toDate', toIsoDate(filterBy.toDate));
    }

    params = params.set('sortBy', sortBy?.field ?? 'date');
    params = params.set('sortOrder', sortBy?.order ?? 'desc');

    return this.http
      .get<RecordDto[]>(`${this.baseUrl}/records`, { params })
      .pipe(map((dtos) => dtos.map(toRecord)));
  }

  getExercisePercentage(exerciseId: string): Observable<PercentageValue[]> {
    return this.http.get<PercentageValue[]>(
      `${this.baseUrl}/exercises/${exerciseId}/percentages`,
    );
  }

  addRecord(record: Omit<Record, 'id'>): Observable<Record> {
    return this.http
      .post<RecordDto>(`${this.baseUrl}/records`, toWriteBody(record))
      .pipe(map(toRecord));
  }

  updateRecord(updatedRecord: Record): Observable<Record> {
    return this.http
      .put<RecordDto>(
        `${this.baseUrl}/records/${updatedRecord.id}`,
        toWriteBody(updatedRecord),
      )
      .pipe(map(toRecord));
  }

  deleteRecord(id: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/records/${id}`);
  }
}

export interface SortByRecord extends SortBy {
  field: 'date' | 'exercise' | 'id';
}

export interface FilterByRecord {
  exerciseId: string | null;
  fromDate: Date | null;
  toDate: Date | null;
}

interface RecordDto {
  id: string;
  date: string;
  exercise: { id: string; name: string };
  weight: number;
  percentage: number;
}

function toRecord(dto: RecordDto): Record {
  const record: Record = {
    id: dto.id,
    date: new Date(dto.date),
    exercise: dto.exercise,
    weight: dto.weight,
    percentage: dto.percentage,
  };
  record.max_value = record.weight * 100 / record.percentage;
  return record;
}

function toWriteBody(record: Omit<Record, 'id'> | Record): {
  date: string;
  exerciseId: string;
  weight: number;
  percentage: number;
} {
  return {
    date: toIsoDate(record.date),
    exerciseId: record.exercise.id,
    weight: record.weight,
    percentage: record.percentage,
  };
}

function toIsoDate(value: Date): string {
  const date = value instanceof Date ? value : new Date(value);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}
