// src/app/components/record-list/record-list.component.ts
import { Component, Input, EventEmitter, Output } from '@angular/core';
import { Record } from '../../models/record';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Exercise } from '../../models/exercise';

@Component({
  selector: 'app-record-list',
  templateUrl: './record-list.html',
  styleUrls: ['./record-list.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  providers: [DatePipe]
})
export class RecordListComponent {

  @Input({ required: true }) records: Record[] = [];
  @Input({ required: true}) exercises: Exercise[] = [];
  @Output() addRecordEmitter = new EventEmitter<void>();
  @Output() editRecordEmitter = new EventEmitter<Record>();
  @Output() removeRecordEmiter = new EventEmitter<string>();
  @Output() sortChangeEmitter = new EventEmitter<{field: 'date' | 'exercise', order: 'asc' | 'desc'}>();
  @Output() filterChangeEmitter = new EventEmitter<{exerciseId: string | null, fromDate: Date | null, toDate: Date | null}>();


  currentSortField: 'date' | 'exercise' = 'date';
  currentSortDirection: 'asc' | 'desc' = 'desc';
  filterByExerciseId: string | null = null;
  filterByFromDate: Date | null = null;
  filterByToDate: Date | null = null;

  onSort(field: 'date' | 'exercise'): void {
    if (field === this.currentSortField) {
      this.currentSortDirection = this.currentSortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.currentSortField = field;
      this.currentSortDirection = 'desc';
    }
    
    this.sortChangeEmitter.emit({
      field: this.currentSortField,
      order: this.currentSortDirection
    });
  }

  onFilterChange(): void {
    this.filterChangeEmitter.emit({
      exerciseId: this.filterByExerciseId,
      fromDate: this.filterByFromDate,
      toDate: this.filterByToDate
    });
  }
}
