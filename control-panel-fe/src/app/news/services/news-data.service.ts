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

@Injectable({ providedIn: 'root' })
export class NewsDataService {
  getCategories(): FeedCategory[] {
    return CATEGORIES;
  }

  getNews(): NewsItem[] {
    return [...NEWS].sort(
      (a, b) => b.publishedAt.getTime() - a.publishedAt.getTime(),
    );
  }

  getFeedNameById(feedId: string): string {
    for (const cat of CATEGORIES) {
      const f = cat.feeds.find((x) => x.id === feedId);
      if (f) return f.name;
    }
    return feedId;
  }
}
