import { Injectable } from '@angular/core';
import { FeedCategory, NewsItem } from '../models/news';

const CATEGORIES: FeedCategory[] = [
  {
    id: 'tech',
    name: 'Tecnologia',
    feeds: [
      { id: 'hn', name: 'Hacker News' },
      { id: 'verge', name: 'The Verge' },
    ],
  },
  {
    id: 'science',
    name: 'Scienza',
    feeds: [
      { id: 'nature', name: 'Nature News' },
      { id: 'esa', name: 'ESA Blog' },
    ],
  },
  {
    id: 'dev',
    name: 'Sviluppo',
    feeds: [
      { id: 'angular', name: 'Angular Blog' },
      { id: 'ts', name: 'TypeScript Weekly' },
    ],
  },
];

const NEWS: NewsItem[] = [
  {
    id: '1',
    publishedAt: new Date('2026-04-18T09:30:00'),
    title: 'Nuove API del browser per il layout',
    summary: 'Panoramica sulle proposte W3C che semplificano griglie e allineamenti.',
    feedId: 'hn',
    externalUrl: 'https://news.ycombinator.com/item?id=example',
  },
  {
    id: '2',
    publishedAt: new Date('2026-04-17T14:00:00'),
    title: 'Smartphone pieghevoli: cosa cambia nel 2026',
    summary: 'Materiali e hinge design al centro delle ultime generazioni.',
    feedId: 'verge',
    externalUrl: 'https://www.theverge.com/',
  },
  {
    id: '3',
    publishedAt: new Date('2026-04-16T11:15:00'),
    title: 'Osservazioni su un esopianeta nella zona abitabile',
    summary: 'Lo studio combina dati JWST e modelli atmosferici.',
    feedId: 'nature',
    externalUrl: 'https://www.nature.com/news',
  },
  {
    id: '4',
    publishedAt: new Date('2026-04-15T08:45:00'),
    title: 'Missione verso la Luna: aggiornamento cargo',
    summary: 'Timeline e carichi scientifici della prossima missione.',
    feedId: 'esa',
    externalUrl: 'https://www.esa.int/',
  },
  {
    id: '5',
    publishedAt: new Date('2026-04-14T16:20:00'),
    title: 'Angular 20: signali e change detection',
    summary: 'Come migrare gradualmente i componenti esistenti.',
    feedId: 'angular',
    externalUrl: 'https://blog.angular.dev/',
  },
  {
    id: '6',
    publishedAt: new Date('2026-04-13T10:00:00'),
    title: 'TypeScript 5.9 in produzione',
    summary: 'Checklist per adottare le novità del linguaggio senza regressioni.',
    feedId: 'ts',
    externalUrl: 'https://www.typescriptlang.org/',
  },
  {
    id: '7',
    publishedAt: new Date('2026-04-12T19:30:00'),
    title: 'Discussione: monorepo vs multi-repo',
    summary: 'Pro e contro emersi da team di medie dimensioni.',
    feedId: 'hn',
    externalUrl: 'https://news.ycombinator.com/',
  },
];

export interface GetNewsOptions {
  /** Se true, restituisce solo le news non ancora lette. */
  onlyUnread?: boolean;
}

/**
 * Service di accesso ai dati news. Mock dell'API che sarà esposta dal backend:
 * lo stato di lettura è gestito qui internamente (lato "server") e non viene
 * persistito sul frontend. Il componente deve solo chiamare i metodi del
 * service e usare il flag `read` presente sui `NewsItem` restituiti.
 */
@Injectable({ providedIn: 'root' })
export class NewsDataService {
  // Stato lato "backend" mockato: id delle news marcate come lette.
  private readonly readIds = new Set<string>();

  getCategories(): FeedCategory[] {
    return CATEGORIES;
  }

  getFeedNameById(feedId: string): string {
    for (const cat of CATEGORIES) {
      const f = cat.feeds.find((x) => x.id === feedId);
      if (f) return f.name;
    }
    return feedId;
  }

  /**
   * Restituisce la lista di news ordinate per data discendente, con il flag
   * `read` valorizzato. Se `onlyUnread` è true il filtro è applicato lato
   * "backend" (verrà mappato sul corrispondente parametro HTTP).
   */
  async getNews(opts: GetNewsOptions = {}): Promise<NewsItem[]> {
    const items = NEWS.map<NewsItem>((n) => ({ ...n, read: this.readIds.has(n.id) }));
    items.sort((a, b) => b.publishedAt.getTime() - a.publishedAt.getTime());
    return opts.onlyUnread ? items.filter((n) => !n.read) : items;
  }

  /** Marca una news come letta o non letta lato backend. */
  async markRead(id: string, read: boolean): Promise<void> {
    if (read) {
      this.readIds.add(id);
    } else {
      this.readIds.delete(id);
    }
  }
}
