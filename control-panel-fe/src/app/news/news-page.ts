import { DatePipe } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatTooltipModule } from '@angular/material/tooltip';
import { firstValueFrom } from 'rxjs';
import {
  ModulePageHeader,
  ModulePanel,
  ModulePanelHeader,
  ModuleTable,
} from '../main/components';
import { FeedCategory, NewsItem } from './models/news';
import { NewsService } from './services/news.service';

@Component({
  selector: 'app-news-page',
  imports: [
    DatePipe,
    MatButtonModule,
    MatCheckboxModule,
    MatDividerModule,
    MatIconModule,
    MatSlideToggleModule,
    MatTooltipModule,
    ModulePageHeader,
    ModulePanel,
    ModulePanelHeader,
    ModuleTable,
  ],
  templateUrl: './news-page.html',
  styleUrl: './news-page.scss',
  standalone: true,
})
export class NewsPage {
  private readonly news = inject(NewsService);

  protected readonly categories = signal<FeedCategory[]>([]);
  protected readonly feedLabels = computed(() => {
    const map = new Map<number, string>();
    for (const cat of this.categories()) {
      for (const f of cat.feeds) {
        map.set(f.id, f.name);
      }
    }
    return map;
  });

  protected readonly enabledFeedIds = signal<Set<number>>(new Set());
  protected readonly showOnlyUnread = signal(false);

  // Cache locale dell'ultima risposta del backend. Il filtro per
  // feed/categoria è applicato server-side: qui non si filtra più
  // in memoria, così unreadCount/totalCount restano coerenti col
  // filtro `onlyUnread` propagato al BE.
  private readonly newsCache = signal<NewsItem[]>([]);
  protected readonly loading = signal(false);

  // Contatore monotono per scartare risposte di richieste superate
  // (l'utente può cliccare più checkbox in rapida successione).
  private reloadId = 0;

  protected readonly displayedNews = computed(() => this.newsCache());

  protected readonly unreadCount = computed(
    () => this.displayedNews().filter((n) => !n.read).length,
  );

  protected readonly totalCount = computed(() => this.displayedNews().length);

  constructor() {
    void this.bootstrap();
  }

  protected feedName(feedId: number): string {
    return this.feedLabels().get(feedId) ?? String(feedId);
  }

  protected categoryAllEnabled(cat: FeedCategory): boolean {
    return cat.feeds.length > 0 && cat.feeds.every((f) => this.enabledFeedIds().has(f.id));
  }

  protected categorySomeEnabled(cat: FeedCategory): boolean {
    const n = cat.feeds.filter((f) => this.enabledFeedIds().has(f.id)).length;
    return n > 0 && n < cat.feeds.length;
  }

  protected feedChecked(feedId: number): boolean {
    return this.enabledFeedIds().has(feedId);
  }

  protected toggleCategory(cat: FeedCategory): void {
    const next = new Set(this.enabledFeedIds());
    const ids = cat.feeds.map((f) => f.id);
    if (this.categoryAllEnabled(cat)) {
      ids.forEach((id) => next.delete(id));
    } else {
      ids.forEach((id) => next.add(id));
    }
    this.enabledFeedIds.set(next);
    void this.reloadNews();
  }

  protected toggleFeed(feedId: number, checked: boolean): void {
    const next = new Set(this.enabledFeedIds());
    if (checked) {
      next.add(feedId);
    } else {
      next.delete(feedId);
    }
    this.enabledFeedIds.set(next);
    void this.reloadNews();
  }

  protected async setShowOnlyUnread(value: boolean): Promise<void> {
    this.showOnlyUnread.set(value);
    await this.reloadNews();
  }

  protected hasArticleLink(item: NewsItem): boolean {
    return Boolean(item.externalUrl?.trim());
  }

  protected articleRowAriaLabel(item: NewsItem): string {
    const readState = item.read ? 'già letta' : 'non letta';
    return this.hasArticleLink(item)
      ? `Apri articolo in nuova scheda: ${item.title} (${readState})`
      : `${item.title} (${readState}, nessun link disponibile)`;
  }

  protected markReadAriaLabel(item: NewsItem): string {
    return item.read
      ? `Segna come non letta: ${item.title}`
      : `Segna come letta: ${item.title}`;
  }

  protected async toggleRead(item: NewsItem, event: Event): Promise<void> {
    event.stopPropagation();
    await firstValueFrom(this.news.markRead(item.id, !item.read));
    await this.reloadNews();
  }

  protected async openArticle(item: NewsItem): Promise<void> {
    const url = item.externalUrl?.trim();
    if (!url) return;
    if (!item.read) {
      await firstValueFrom(this.news.markRead(item.id, true));
      await this.reloadNews();
    }
    const a = document.createElement('a');
    a.href = url;
    a.target = '_blank';
    a.rel = 'noopener noreferrer';
    a.click();
  }

  /**
   * Carica le categorie dal BE, abilita di default tutti i feed e
   * scatena il primo refresh delle news.
   */
  private async bootstrap(): Promise<void> {
    const cats = await firstValueFrom(this.news.getCategories());
    this.categories.set(cats);
    const all = new Set<number>();
    for (const cat of cats) {
      for (const f of cat.feeds) {
        all.add(f.id);
      }
    }
    this.enabledFeedIds.set(all);
    await this.reloadNews();
  }

  private async reloadNews(): Promise<void> {
    const id = ++this.reloadId;

    // Categorie non ancora caricate o nessun feed selezionato:
    // lista vuota senza chiamare il BE.
    if (this.categories().length === 0 || this.enabledFeedIds().size === 0) {
      this.newsCache.set([]);
      return;
    }

    const { categoryIds, feedIds } = this.buildFilter();

    this.loading.set(true);
    try {
      const list = await firstValueFrom(
        this.news.getNews({
          onlyUnread: this.showOnlyUnread(),
          categoryIds,
          feedIds,
        }),
      );
      // Scarta risposte arrivate fuori ordine.
      if (id !== this.reloadId) return;
      this.newsCache.set(list);
    } finally {
      if (id === this.reloadId) {
        this.loading.set(false);
      }
    }
  }

  /**
   * Traduce lo stato canonico {@link enabledFeedIds} (granularità: feed)
   * nella forma più compatta accettata dall'API:
   * - per ogni categoria interamente selezionata si manda la sola
   *   `categoryId` (il BE espande sui suoi feed via JOIN);
   * - per le categorie parzialmente selezionate si mandano i singoli
   *   `feedIds`;
   * - se *tutto* è selezionato si omettono entrambi i parametri (= nessun
   *   filtro per fonte sul BE).
   */
  private buildFilter(): { categoryIds?: number[]; feedIds?: number[] } {
    const categoryIds: number[] = [];
    const feedIds: number[] = [];
    let allFull = true;

    for (const cat of this.categories()) {
      if (this.categoryAllEnabled(cat)) {
        categoryIds.push(cat.id);
      } else {
        allFull = false;
        for (const f of cat.feeds) {
          if (this.feedChecked(f.id)) {
            feedIds.push(f.id);
          }
        }
      }
    }

    if (allFull) return {};
    return {
      categoryIds: categoryIds.length > 0 ? categoryIds : undefined,
      feedIds: feedIds.length > 0 ? feedIds : undefined,
    };
  }
}
