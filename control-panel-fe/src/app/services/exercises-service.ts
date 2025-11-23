// src/app/services/exercise.service.ts
import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { Exercise } from '../models/exercise';

@Injectable({
  providedIn: 'root'
})
export class ExerciseService {

  // Simula un database con esercizi predefiniti
  private exercises: Exercise[] = [
    { id: '1', name: 'Panca Piana' },
    { id: '2', name: 'Squat' },
    { id: '3', name: 'Stacco da Terra' },
    { id: '4', name: 'Panca Inclinata' },
    { id: '5', name: 'Panca Declinata' },
    { id: '6', name: 'Spinte con Manubri' },
    { id: '7', name: 'Remata' },
    { id: '8', name: 'Trazioni' },
    { id: '9', name: 'Dip' },
    { id: '10', name: 'Military Press' }
  ];

  constructor() { }

  // READ (Tutti gli esercizi)
  getExercises(): Observable<Exercise[]> {
    return of(this.exercises);
  }
}
