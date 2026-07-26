import { Component } from '@angular/core';

@Component({
  selector: 'app-module-detail',
  standalone: true,
  template: ` <div class="app-mod-detail"><ng-content /></div> `,
})
export class ModuleDetail {}
