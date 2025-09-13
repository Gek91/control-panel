import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import {MatTabsModule} from '@angular/material/tabs';
import { RecordGlobalList } from '../record-global-list/record-global-list';
import { RecordDashboard } from '../record-dashboard/record-dashboard';
import { RecordPercentages } from '../record-percentages/record-percentages';

@Component({
  selector: 'app-record-main',
  imports: [CommonModule, MatTabsModule, RecordGlobalList, RecordDashboard, RecordPercentages],
  templateUrl: './record-main.html',
  styleUrl: './record-main.scss',
  standalone: true,
})
export class RecordMain {


}