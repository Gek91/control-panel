import { DatePipe } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDividerModule } from '@angular/material/divider';
import { FeedCategory, NewsItem } from './models/news';
import { NewsDataService } from './services/news-data.service';

@Component({
  selector: 'app-news-page',
  imports: [DatePipe, MatCardModule, MatCheckboxModule, MatDividerModule],
  templateUrl: './news-page.html',
  styleUrl: './news-page.scss',
  standalone: true,
})
export class NewsPage {
  private readonly newsData = inject(NewsDataService);

  protected readonly categories = this.newsData.getCategories();
  private readonly allNews = this.newsData.getNews();
  protected readonly feedLabels = this.buildFeedLabels();

  protected readonly enabledFeedIds = signal<Set<string>>(this.allFeedIds());

  protected readonly filteredNews = computed(() => {
    const allowed = this.enabledFeedIds();
    return this.allNews.filter((n) => allowed.has(n.feedId));
  });

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

  protected hasArticleLink(item: NewsItem): boolean {
    return Boolean(item.externalUrl?.trim());
  }

  protected articleRowAriaLabel(item: NewsItem): string {
    return this.hasArticleLink(item)
      ? `Apri articolo in nuova scheda: ${item.title}`
      : `${item.title} (nessun link disponibile)`;
  }

  protected openArticle(item: NewsItem): void {
    const url = item.externalUrl?.trim();
    if (!url) return;
    const a = document.createElement('a');
    a.href = url;
    a.target = '_blank';
    a.rel = 'noopener noreferrer';
    a.click();
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
