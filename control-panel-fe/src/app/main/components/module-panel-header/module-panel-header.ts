import { Component, input } from '@angular/core';

@Component({
  selector: 'app-module-panel-header',
  standalone: true,
  template: `
    @if (title()) {
      <h2 class="app-mod-panel-title" [attr.id]="titleId() || null">{{ title() }}</h2>
    }
    @if (description()) {
      <p class="app-mod-panel-lede">{{ description() }}</p>
    }
  `,
})
export class ModulePanelHeader {
  readonly title = input('');
  readonly description = input('');
  readonly titleId = input<string | undefined>(undefined);
}
