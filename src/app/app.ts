import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { RecordMain } from './components/record-main/record-main';


@Component({
  selector: 'app-root',
  imports: [RecordMain],
  standalone: true,
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  protected readonly title = signal('weight-record');
}
