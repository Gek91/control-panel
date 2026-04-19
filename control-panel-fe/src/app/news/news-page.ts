import { DatePipe } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatTooltipModule } from '@angular/material/tooltip';
import {
  ModulePageHeader,
  ModulePanel,
  ModulePanelHeader,
  ModuleTable,
} from '../main/components';
import { FeedCategory, NewsItem } from './models/news';
import { NewsDataService } from './services/news-data.service';

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
  private readonly newsData = inject(NewsDataService);

  protected readonly categories = this.newsData.getCategories();
  protected readonly feedLabels = this.buildFeedLabels();

  protected readonly enabledFeedIds = signal<Set<string>>(this.allFeedIds());
  protected readonly showOnlyUnread = signal(false);

  // Cache locale della risposta del backend. Lo stato di lettura non vive
  // sul FE: ogni cambio (filtro o mark read) ricarica la lista dal service.
  private readonly newsCache = signal<NewsItem[]>([]);
  protected readonly loading = signal(false);

  protected readonly displayedNews = computed(() => {
    const allowed = this.enabledFeedIds();
    return this.newsCache().filter((n) => allowed.has(n.feedId));
  });

  protected readonly unreadCount = computed(
    () => this.displayedNews().filter((n) => !n.read).length,
  );

  protected readonly totalCount = computed(() => this.displayedNews().length);

  constructor() {
    void this.reloadNews();
  }

  protected feedName(feedId: string): string {
    return this.feedLabels.get(feedId) ?? this.newsData.getFeedNameById(feedId);
  }

  protected categoryAllEnabled(cat: FeedCategory): boolean {
    return cat.feeds.length > 0 && cat.feeds.every((f) => this.enabledFeedIds().has(f.id));
  }

  protected categorySomeEnabled(cat: FeedCategory): boolean {
    const n = cat.feeds.filter((f) => this.enabledFeedIds().has(f.id)).length;
    return n > 0 && n < cat.feeds.length;
  }

  protected feedChecked(feedId: string): boolean {
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
  }

  protected toggleFeed(feedId: string, checked: boolean): void {
    const next = new Set(this.enabledFeedIds());
    if (checked) {
      next.add(feedId);
    } else {
      next.delete(feedId);
    }
    this.enabledFeedIds.set(next);
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
    await this.newsData.markRead(item.id, !item.read);
    await this.reloadNews();
  }

  protected async openArticle(item: NewsItem): Promise<void> {
    const url = item.externalUrl?.trim();
    if (!url) return;
    if (!item.read) {
      await this.newsData.markRead(item.id, true);
      await this.reloadNews();
    }
    const a = document.createElement('a');
    a.href = url;
    a.target = '_blank';
    a.rel = 'noopener noreferrer';
    a.click();
  }

  private async reloadNews(): Promise<void> {
    this.loading.set(true);
    try {
      const list = await this.newsData.getNews({ onlyUnread: this.showOnlyUnread() });
      this.newsCache.set(list);
    } finally {
      this.loading.set(false);
    }
  }

  private allFeedIds(): Set<string> {
    const ids = new Set<string>();
    for (const cat of this.categories) {
      for (const f of cat.feeds) {
        ids.add(f.id);
      }
    }
    return ids;
  }

  private buildFeedLabels(): Map<string, string> {
    const map = new Map<string, string>();
    for (const cat of this.categories) {
      for (const f of cat.feeds) {
        map.set(f.id, f.name);
      }
    }
    return map;
  }
}
