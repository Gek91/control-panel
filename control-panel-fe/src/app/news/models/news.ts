export interface Feed {
  id: string;
  name: string;
}

export interface FeedCategory {
  id: string;
  name: string;
  feeds: Feed[];
}

export interface NewsItem {
  id: string;
  publishedAt: Date;
  title: string;
  summary: string;
  feedId: string;
  /** Link all'articolo originale sul sito della fonte (es. da RSS). */
  externalUrl?: string;
}
