import { Component } from '@angular/core';

/** Colonna flessibile larga (es. grafico): il flex sizing è sull'host, non su un wrapper interno. */
@Component({
  selector: 'app-module-wide-col',
  standalone: true,
  styleUrl: './module-wide-col.scss',
  template: ` <div class="chart-slot"><ng-content /></div> `,
})
export class ModuleWideCol {}
