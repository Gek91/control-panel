import { Component, OnInit, Inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Record } from '../../models/record';
import { Exercise } from '../../models/exercise';
import { ExerciseService } from '../../services/exercises-service';
import { DatePipe, CommonModule } from '@angular/common';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatButtonModule } from '@angular/material/button';


@Component({
  selector: 'app-record-form',
  imports: [
    ReactiveFormsModule, 
    CommonModule, 
    MatDialogModule, 
    MatFormFieldModule, 
    MatInputModule, 
    MatSelectModule, 
    MatDatepickerModule, 
    MatNativeDateModule, 
    MatButtonModule
  ],
  templateUrl: './record-form.html',
  styleUrl: './record-form.scss',
  standalone: true,
  providers: [DatePipe]
})
export class RecordForm implements OnInit {

  recordForm: FormGroup;
  isEditing = false;
  exercises: Exercise[] = [];

  constructor(
    private fb: FormBuilder,
    private datePipe: DatePipe,
    private exerciseService: ExerciseService,
    public dialogRef: MatDialogRef<RecordForm>,
    @Inject(MAT_DIALOG_DATA) public data: { recordToEdit: Record | null, exercises: Exercise[] }
  ) {
    const today = datePipe.transform(new Date(), 'yyyy-MM-dd');
    this.recordForm = this.fb.group({
      date: [today, Validators.required],
      exerciseId: ['', Validators.required],
      weight: ['', [Validators.required, Validators.min(1)]],
      percentage: [100, [Validators.required, Validators.min(1), Validators.max(100)]]
    });

    if (this.data.recordToEdit) {
      this.isEditing = true;
      const formattedDate = new Date(this.data.recordToEdit.date).toISOString().substring(0, 10);
      this.recordForm.setValue({
        date: formattedDate,
        exerciseId: this.data.recordToEdit.exercise.id,
        weight: this.data.recordToEdit.weight,
        percentage: this.data.recordToEdit.percentage
      });
    }
  }

  ngOnInit(): void {
    this.exercises = this.data.exercises;
  }

  onSubmit(): void {
    if (this.recordForm.invalid) {
      return; 
    }
    const formValue = this.recordForm.value;
    
    const selectedExercise = this.exercises.find(ex => ex.id === formValue.exerciseId);
    if (!selectedExercise) {
      return;
    }
    
    const recordData = {
      ...formValue,
      date: new Date(formValue.date),
      exercise: selectedExercise
    };
    
    const recordToSave = this.isEditing && this.data.recordToEdit
      ? { ...recordData, id: this.data.recordToEdit.id }
      : recordData;
      
    this.dialogRef.close(recordToSave);
  }

  onCancel(): void {
    this.dialogRef.close();
  }
}

