import { Component, input } from '@angular/core';

@Component({
  selector: 'app-module-page-header',
  standalone: true,
  template: `
    <header class="app-mod-header">
      <h1>{{ title() }}</h1>
      @if (subtitle()) {
        <p class="app-mod-subtitle">{{ subtitle() }}</p>
      }
    </header>
  `,
})
export class ModulePageHeader {
  readonly title = input.required<string>();
  readonly subtitle = input('');
}
