import { Component } from '@angular/core';

@Component({
  selector: 'app-module-filter',
  standalone: true,
  template: ` <div class="app-mod-filter"><ng-content /></div> `,
})
export class ModuleFilter {}
