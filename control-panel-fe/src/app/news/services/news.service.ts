import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';
import { Feed, FeedCategory, NewsItem } from '../models/news';
import { NEWS_API_BASE_URL } from './news-api.config';

export interface GetNewsOptions {
  /** Se true, chiede al backend solo le news non ancora lette. */
  onlyUnread?: boolean;
  /**
   * Elenco di feed selezionati. `undefined` o array vuoto = nessun
   * filtro per feed. È combinato in OR con {@link categoryIds}.
   */
  feedIds?: number[];
  /**
   * Elenco di categorie selezionate per intero. `undefined` o array
   * vuoto = nessun filtro per categoria. È combinato in OR con
   * {@link feedIds}.
   */
  categoryIds?: number[];
}

/**
 * Service del modulo news: incapsula sia le chiamate HTTP al backend
 * `news-collector-be` sia l'adattamento dei DTO al modello di dominio
 * usato dalla UI (`NewsItem`, `FeedCategory`).
 */
@Injectable({ providedIn: 'root' })
export class NewsService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = inject(NEWS_API_BASE_URL);

  /**
   * Restituisce le categorie con i relativi feed, così come fornite dal BE
   * (`GET /feeds`). Dei feed vengono esposti alla UI solo `id` e `name`.
   */
  getCategories(): Observable<FeedCategory[]> {
    return this.http
      .get<CategoryWithFeedsDto[]>(`${this.baseUrl}/feeds`)
      .pipe(map((dtos) => dtos.map(toFeedCategory)));
  }

  /**
   * Restituisce le news ordinate per data discendente, con il flag `read`
   * valorizzato. Tutti i filtri (`feedIds`, `categoryIds`, `onlyUnread`)
   * sono inoltrati al backend; non viene applicato alcun post-filtraggio
   * lato client.
   */
  getNews(opts: GetNewsOptions = {}): Observable<NewsItem[]> {
    let httpParams = new HttpParams();
    if (opts.feedIds && opts.feedIds.length > 0) {
      httpParams = httpParams.set('feedIds', opts.feedIds.join(','));
    }
    if (opts.categoryIds && opts.categoryIds.length > 0) {
      httpParams = httpParams.set('categoryIds', opts.categoryIds.join(','));
    }
    // `onlyUnread = true` → richiediamo le sole news non lette;
    // `onlyUnread = false` → nessun filtro lato backend (tutte).
    if (opts.onlyUnread) {
      httpParams = httpParams.set('read', false);
    }
    return this.http
      .get<NewsDto[]>(`${this.baseUrl}/news`, { params: httpParams })
      .pipe(map((dtos) => dtos.map(toNewsItem)));
  }

  markRead(id: number, read: boolean): Observable<void> {
    return this.http.patch<void>(`${this.baseUrl}/news/${id}/read`, { read });
  }
}

/**
 * DTO restituito da `GET /news` (vedi `news-collector-be/internal/news/model.go`).
 * Le date sono stringhe in formato RFC3339 e vengono convertite a `Date`
 * nella mappatura verso `NewsItem`.
 */
interface NewsDto {
  id: number;
  feedId: number;
  link: string;
  title: string;
  summary?: string;
  publishedAt?: string | null;
  fetchedAt: string;
  read: boolean;
}

/**
 * DTO restituito da `GET /feeds` (vedi
 * `news-collector-be/internal/feed/model.go::CategoryWithFeeds`).
 */
interface CategoryWithFeedsDto {
  id: number;
  name: string;
  feeds: FeedDto[];
}

interface FeedDto {
  id: number;
  name: string;
  // Altri campi (url, enabled, ...) sono presenti nel payload ma non
  // interessano la UI e vengono ignorati.
}

function toNewsItem(dto: NewsDto): NewsItem {
  return {
    id: dto.id,
    feedId: dto.feedId,
    title: dto.title,
    summary: dto.summary ?? '',
    externalUrl: dto.link,
    publishedAt: dto.publishedAt ? new Date(dto.publishedAt) : null,
    fetchedAt: new Date(dto.fetchedAt),
    read: dto.read,
  };
}

function toFeedCategory(dto: CategoryWithFeedsDto): FeedCategory {
  return {
    id: dto.id,
    name: dto.name,
    feeds: dto.feeds.map(toFeed),
  };
}

function toFeed(dto: FeedDto): Feed {
  return { id: dto.id, name: dto.name };
}
