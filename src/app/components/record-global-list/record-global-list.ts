import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { RecordListComponent } from "../record-list/record-list";
import { Record } from '../../models/record';
import { RecordService, SortByRecord, FilterByRecord } from '../../services/records-service';
import { ExerciseService } from '../../services/exercises-service';
import { Exercise } from '../../models/exercise';
import { RecordForm } from '../record-form/record-form';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-record-global-list',
  imports: [RecordListComponent, RecordForm, CommonModule, FormsModule],
  templateUrl: './record-global-list.html',
  styleUrl: './record-global-list.scss',
  standalone: true,
})
export class RecordGlobalList implements OnInit {

  isFormVisible = false
  records: Record[] = [];
  exercises: Exercise[] = [];
  currentRecord: Record | null = null;
  sortBy: SortByRecord = {
    field: 'date',
    order: 'desc'
  };
  filterBy: FilterByRecord = {
    exerciseId: null,
    fromDate: null,
    toDate: null
  };



  constructor(
    private recordService: RecordService,
    private exerciseService: ExerciseService
  ) {

  }

  ngOnInit(): void {
    this.loadRecords();
    this.loadExercises();
  }

  loadRecords(): void {
    this.recordService.getRecords(this.filterBy, this.sortBy).subscribe(data => {
      this.records = data;
    });
  }

  loadExercises(): void {
    this.exerciseService.getExercises().subscribe(data => {
      this.exercises = data;
    });
  }

  handleSaveRecord(record : Record): void {

    if (this.currentRecord !== null) {
      this.recordService.updateRecord(record).subscribe(() => {
        this.loadRecords();
      });
    } else {
      // --- CREATE ---
      this.recordService.addRecord(record).subscribe(() => {
        this.loadRecords();
      });
    }
    this.isFormVisible = false
  }

  handleCancel(): void {
    this.isFormVisible = false
  }

  handleDeleteRecord(id: string): void {
    // --- DELETE ---
    this.recordService.deleteRecord(id).subscribe(() => {
      this.loadRecords();
    });
  }


  handleAddRecord(): void {
    this.currentRecord = null;
    this.isFormVisible = true
  }

  handleEditRecord(record: Record): void {
    this.currentRecord = record;
    this.isFormVisible = true   
  }

  handleSortChange(sortData: {field: 'date' | 'exercise', order: 'asc' | 'desc'}): void {
    this.sortBy = {
      field: sortData.field,
      order: sortData.order
    };
    this.loadRecords();
  }

  handleFilterChange(filterData: {exerciseId: string | null, fromDate: Date | null, toDate: Date | null}): void {
    this.filterBy.exerciseId = filterData.exerciseId;
    this.filterBy.fromDate = filterData.fromDate;
    this.filterBy.toDate = filterData.toDate;
    this.loadRecords();
  }
  
}
