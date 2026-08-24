import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';
import { Exercise } from '../models/exercise';
import { WEIGHT_API_BASE_URL } from './weight-api.config';

@Injectable({
  providedIn: 'root',
})
export class ExerciseService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = inject(WEIGHT_API_BASE_URL);

  getExercises(): Observable<Exercise[]> {
    return this.http.get<ExerciseDto[]>(`${this.baseUrl}/exercises`).pipe(
      map((dtos) => dtos.map((dto) => ({ id: dto.id, name: dto.name }))),
    );
  }
}

interface ExerciseDto {
  id: string;
  name: string;
}
