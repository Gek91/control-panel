import { Component, input } from '@angular/core';

@Component({
  selector: 'app-module-panel',
  standalone: true,
  styleUrl: './module-panel.scss',
  host: {
    '[class.app-mod-col-list]': 'colList()',
    '[class.app-mod-col-wide]': 'colWide()',
  },
  template: `
    <div
      class="app-mod-panel"
      [class.app-mod-panel--flush]="flush()"
      [class.app-mod-form]="form()"
      [class.app-mod-panel--no-margin]="noMargin()"
    >
      <ng-content />
    </div>
  `,
})
export class ModulePanel {
  readonly flush = input(false);
  readonly form = input(false);
  readonly noMargin = input(false);
  readonly colList = input(false);
  readonly colWide = input(false);
}
