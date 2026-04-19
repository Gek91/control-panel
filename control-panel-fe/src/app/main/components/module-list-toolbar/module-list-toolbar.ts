import { Component, input } from '@angular/core';

@Component({
  selector: 'app-module-list-toolbar',
  standalone: true,
  template: `
    <div class="app-mod-list-head">
      <h2>{{ heading() }}</h2>
      <div class="app-mod-list-controls">
        <ng-content />
      </div>
    </div>
  `,
})
export class ModuleListToolbar {
  readonly heading = input.required<string>();
}
