import { NgClass } from '@angular/common';
import { Component, computed, input } from '@angular/core';

@Component({
  selector: 'app-module-table',
  standalone: true,
  imports: [NgClass],
  template: `
    <div class="app-mod-table-wrap">
      <table [ngClass]="tableClasses()">
        <ng-content />
      </table>
    </div>
  `,
})
export class ModuleTable {
  /** Classe aggiuntiva sulla tabella (es. <code>news-table</code>). */
  readonly extraTableClass = input('');

  protected readonly tableClasses = computed(() => {
    const extra = this.extraTableClass().trim();
    const map: Record<string, boolean> = { 'app-mod-table': true };
    if (extra) {
      map[extra] = true;
    }
    return map;
  });
}
