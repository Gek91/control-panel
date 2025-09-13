import { Component, Input, Output, EventEmitter, SimpleChanges, OnChanges, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Record } from '../../models/record';
import { Exercise } from '../../models/exercise';
import { ExerciseService } from '../../services/exercises-service';
import { DatePipe, CommonModule } from '@angular/common';


@Component({
  selector: 'app-record-form',
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './record-form.html',
  styleUrl: './record-form.scss',
  standalone: true,
  providers: [DatePipe]
})
export class RecordForm implements OnChanges, OnInit {

  @Input() recordToEdit: Record | null = null;
  @Output() saveFormEmitter = new EventEmitter<Record>();
  @Output() cancelFormEmitter = new EventEmitter<void>();
  
  recordForm: FormGroup;
  isEditing = false;
  currentRecordId: string | null = null;
  exercises: Exercise[] = [];

  constructor(
    private fb: FormBuilder,
    private datePipe: DatePipe,
    private exerciseService: ExerciseService
  ) {
    // Inizializza il form
    const today = datePipe.transform(new Date(), 'yyyy-MM-dd');
    this.recordForm = this.fb.group({
      date: [today, Validators.required],
      exerciseId: ['', Validators.required],
      weight: ['', [Validators.required, Validators.min(1)]],
      percentage: [100, [Validators.required, Validators.min(1), Validators.max(100)]]
    });
  }

  ngOnInit(): void {
    this.loadExercises();
  }

  loadExercises(): void {
    this.exerciseService.getExercises().subscribe(data => {
      this.exercises = data;
    });
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
    
    // Prepara i dati del record con l'oggetto Exercise
    const recordData = {
      ...formValue,
      date: new Date(formValue.date),
      exercise: selectedExercise
    };
    
    // Se siamo in modifica, aggiungiamo l'ID altrimenti inviamo solo i dati del form.
    const recordToSave = this.isEditing && this.recordToEdit
      ? { ...recordData, id: this.recordToEdit.id }
      : recordData;
      
    // Emette l'evento 'save' con i dati, notificando il genitore.
    this.saveFormEmitter.emit(recordToSave);
  }

  //activate when input changes
  ngOnChanges(changes: SimpleChanges): void {
    // Se il genitore ci ha passato un 'recordToEdit'...
    if (changes['recordToEdit'] && this.recordToEdit) {
      // ...allora siamo in modalità modifica.
      this.isEditing = true;
      // Formatta la data per l'input type="date" (YYYY-MM-DD)
      const formattedDate = new Date(this.recordToEdit.date).toISOString().substring(0, 10);
      // E popoliamo il form con i dati ricevuti.
      this.recordForm.setValue({
        date: formattedDate,
        exerciseId: this.recordToEdit.exercise.id,
        weight: this.recordToEdit.weight,
        percentage: this.recordToEdit.percentage
      });
    } else {
      // Altrimenti, siamo in modalità creazione.
      this.isEditing = false;
      // Reset del form per la creazione di un nuovo record
      this.resetForm();
    }
  }

  onCancel(): void {
    // Emette l'evento 'cancel', notificando il genitore.
    this.cancelFormEmitter.emit();
  }

  private resetForm(): void {
    const today = this.datePipe.transform(new Date(), 'yyyy-MM-dd');
    this.recordForm.reset({
      date: today,
      exercise: '',
      weight: '',
      percentage: 100
    });
  }

}
