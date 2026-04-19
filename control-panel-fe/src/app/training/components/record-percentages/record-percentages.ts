import { Component, OnInit } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { RecordService } from '../../services/records-service';
import { PercentageValue } from '../../models/record';
import { Exercise } from '../../models/exercise';
import { ExerciseService } from '../../services/exercises-service';
import {
  ModuleContentRow,
  ModuleDetail,
  ModuleFilter,
  ModulePanel,
  ModuleTable,
} from '../../../main/components';

@Component({
  selector: 'app-record-percentages',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    ModuleContentRow,
    ModuleDetail,
    ModuleFilter,
    ModulePanel,
    ModuleTable,
  ],
  templateUrl: './record-percentages.html',
  styleUrls: ['./record-percentages.scss'],
})
export class RecordPercentages implements OnInit {

    exerciseId = "1"
    exercises: Exercise[] = [];
    percentages: PercentageValue[] = [];


    constructor(
        private recordService: RecordService,
        private exerciseService: ExerciseService
    ) {
        
    }

    ngOnInit(): void {
        this.loadExercises();
        this.loadPercentagesTable();
    }

    loadExercises(): void {
        this.exerciseService.getExercises().subscribe(data => {
            this.exercises = data;
        });
    }

    loadPercentagesTable(): void {
        this.recordService.getExercisePercentage(this.exerciseId).subscribe(data => {
            this.percentages = data;
        });
    }

    

}