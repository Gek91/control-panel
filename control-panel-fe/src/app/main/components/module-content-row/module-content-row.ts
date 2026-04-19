import { Component } from '@angular/core';

@Component({
  selector: 'app-module-content-row',
  standalone: true,
  template: ` <div class="app-mod-content-row"><ng-content /></div> `,
})
export class ModuleContentRow {}
