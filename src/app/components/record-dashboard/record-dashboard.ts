import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RecordService } from '../../services/records-service';
import { Record } from '../../models/record';
import { BaseChartDirective, provideCharts, withDefaultRegisterables } from 'ng2-charts';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ChartConfiguration, ChartOptions, ChartType } from 'chart.js';
import { Exercise } from '../../models/exercise';
import { ExerciseService } from '../../services/exercises-service';


@Component({
  selector: 'app-record-dashboard',
  standalone: true,
  imports: [CommonModule, BaseChartDirective, FormsModule, ReactiveFormsModule],
  templateUrl: './record-dashboard.html',
  styleUrls: ['./record-dashboard.scss'],
  providers: [provideCharts(withDefaultRegisterables())],
})
export class RecordDashboard implements OnInit {
  @ViewChild(BaseChartDirective) chart: BaseChartDirective | undefined;

  exerciseId = "1"
  records: Record[] = [];
  exercises: Exercise[] = [];

  public lineChartData: ChartConfiguration['data'] = {
    datasets: [
      {
        data: [],
        label: 'Weight over time',
        borderColor: 'rgba(0,123,255,1)',
        backgroundColor: 'rgba(0,123,255,0.3)',
      },
    ],
    labels: [],
  };

  public lineChartOptions: ChartOptions = {
    responsive: true,
  };
  
  public lineChartType: ChartType = 'line';

  constructor(
    private recordService: RecordService,
    private exerciseService: ExerciseService
  ) {
    
  }

  ngOnInit(): void {
      this.loadRecordsForExercise();
      this.loadExercises();
  }

  loadRecordsForExercise(): void {
    this.recordService.getRecords({ exerciseId: this.exerciseId, fromDate: null, toDate: null }, { field: 'date', order: 'desc' }).subscribe(data => {
      this.records = data;
      this.updateChartData();
    });
  }

  loadExercises(): void {
    this.exerciseService.getExercises().subscribe(data => {
      this.exercises = data;
    });
  }

  updateChartData(): void {
    this.lineChartData.labels = this.records.map(r => new Date(r.date).toLocaleDateString());
    this.lineChartData.datasets[0].data = this.records.map(r => r.max_value ? r.max_value : 0);
    this.chart?.update();
  }
}
