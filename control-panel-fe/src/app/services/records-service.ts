// src/app/services/record.service.ts
import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { Record, PercentageValue } from '../models/record';
import { Exercise } from '../models/exercise';
import { SortBy } from '../utils/sorting';

@Injectable({
  providedIn: 'root'
})
export class RecordService {

  // Simula un database con dati iniziali
  private records: Record[] = [
    { id: '1', date: new Date('2025-09-12'), exercise: { id: '1', name: 'Panca Piana' }, weight: 100, percentage: 100 },
    { id: '2', date: new Date('2025-09-10'), exercise: { id: '2', name: 'Squat' }, weight: 140, percentage: 100 },
    { id: '3', date: new Date('2025-09-08'), exercise: { id: '3', name: 'Stacco da Terra' }, weight: 180, percentage: 100 },
    { id: '4', date: new Date('2025-09-13'), exercise: { id: '1', name: 'Panca Piana' }, weight: 110, percentage: 80 },
    { id: '5', date: new Date('2025-09-11'), exercise: { id: '2', name: 'Squat' }, weight: 150, percentage: 90 },
    { id: '6', date: new Date('2025-09-09'), exercise: { id: '3', name: 'Stacco da Terra' }, weight: 160, percentage: 95 },
    { id: '7', date: new Date('2025-09-14'), exercise: { id: '1', name: 'Panca Piana' }, weight: 130, percentage: 96 },
    { id: '8', date: new Date('2025-09-12'), exercise: { id: '2', name: 'Squat' }, weight: 130, percentage: 80 },
    { id: '9', date: new Date('2025-09-10'), exercise: { id: '3', name: 'Stacco da Terra' }, weight: 190, percentage: 95 },
    { id: '10', date: new Date('2025-09-15'), exercise: { id: '1', name: 'Panca Piana' }, weight: 100, percentage: 76 },
    { id: '11', date: new Date('2025-09-13'), exercise: { id: '2', name: 'Squat' }, weight: 140, percentage: 100 },
    { id: '12', date: new Date('2025-09-11'), exercise: { id: '3', name: 'Stacco da Terra' }, weight: 180, percentage: 100 },
    { id: '13', date: new Date('2025-09-16'), exercise: { id: '1', name: 'Panca Piana' }, weight: 110, percentage: 80 },
    { id: '14', date: new Date('2025-09-14'), exercise: { id: '2', name: 'Squat' }, weight: 150, percentage: 90 },
    { id: '15', date: new Date('2025-09-12'), exercise: { id: '3', name: 'Stacco da Terra' }, weight: 160, percentage: 95 },
    { id: '16', date: new Date('2025-09-17'), exercise: { id: '1', name: 'Panca Piana' }, weight: 130, percentage: 96 },
    { id: '17', date: new Date('2025-09-18'), exercise: { id: '2', name: 'Squat' }, weight: 130, percentage: 80 },
    { id: '18', date: new Date('2025-09-19'), exercise: { id: '3', name: 'Stacco da Terra' }, weight: 190, percentage: 95 }
  ];

  private percentagesMap: Map<string, PercentageValue[]> = 
    new Map([
        ["1", [{percentage: 50, value: 50}, {percentage: 60, value: 60}, {percentage: 70, value: 70}, {percentage: 80, value: 80}, {percentage: 90, value: 90}, {percentage: 100, value: 100}]],
        ["2", [{percentage: 50, value: 51}, {percentage: 60, value: 61}, {percentage: 70, value: 71}, {percentage: 80, value: 81}, {percentage: 90, value: 91}, {percentage: 100, value: 101}]],
        ["3", [{percentage: 50, value: 52}, {percentage: 60, value: 62}, {percentage: 70, value: 72}, {percentage: 80, value: 82}, {percentage: 90, value: 92}, {percentage: 100, value: 102}]],
    ]);


  private nextId = 4;

  constructor() { }

  getRecords(filterBy?: FilterByRecord, sortBy?: SortByRecord): Observable<Record[]> {
    
    var toBeSortedrecord : Record[]  = this.records
    toBeSortedrecord.forEach(r => r.max_value= r.weight * 100 / r.percentage )

    if(filterBy != null) {
      if(filterBy.exerciseId != null) {
        toBeSortedrecord = toBeSortedrecord.filter(r => r.exercise.id === filterBy.exerciseId);
      }

      if(filterBy.fromDate != null) {
        const fromDate = new Date(filterBy.fromDate)
        toBeSortedrecord = toBeSortedrecord.filter(r => r.date >= fromDate);
      }

      if(filterBy.toDate != null) {
        const toDate = new Date(filterBy.toDate)
        toBeSortedrecord = toBeSortedrecord.filter(r => r.date <= toDate);
      } 
    }

    if(sortBy != null) {
      if(sortBy.field === 'date')
        return of(toBeSortedrecord.sort((a, b) => (sortBy.order === 'asc' ? 1 : -1) * b.date.getTime() - a.date.getTime()));
      else if(sortBy.field === 'exercise')
        return of(toBeSortedrecord.sort((a, b) => (sortBy.order === 'asc' ? 1 : -1) * a.exercise.name.localeCompare(b.exercise.name)));
      else if(sortBy.field === 'id')
        return of(toBeSortedrecord.sort((a, b) => (sortBy.order === 'asc' ? 1 : -1) * a.id.localeCompare(b.id)));
    }

    return of(toBeSortedrecord.sort((a, b) => a.id.localeCompare(b.id)))
  }

  getExercisePercentage(exerciseId: string): Observable<PercentageValue[]> {
    return of(this.percentagesMap.get(exerciseId) || []);
  }

  addRecord(record: Omit<Record, 'id'>): Observable<Record> {
    const newRecord: Record = {
      ...record,
      id: (this.nextId++).toString()
    };
    this.records.push(newRecord);
    return of(newRecord);
  }

  updateRecord(updatedRecord: Record): Observable<Record> {
    const index = this.records.findIndex(r => r.id === updatedRecord.id);
    if (index !== -1) {
      this.records[index] = updatedRecord;
    }
    return of(updatedRecord);
  }

  deleteRecord(id: string): Observable<{}> {
    this.records = this.records.filter(r => r.id !== id);
    return of({});
  }
}

export interface SortByRecord extends SortBy {
  field: 'date' | 'exercise' | 'id'
}

export interface FilterByRecord {
  exerciseId: string | null
  fromDate: Date | null
  toDate: Date | null
}