export interface Feed {
  id: number;
  name: string;
}

export interface FeedCategory {
  id: number;
  name: string;
  feeds: Feed[];
}

export interface NewsItem {
  id: number;
  feedId: number;
  publishedAt: Date | null;
  fetchedAt: Date;
  title: string;
  summary: string;
  externalUrl: string;
  read: boolean;
}
