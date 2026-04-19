import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./main/main-layout').then((m) => m.MainLayout),
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'training' },
      {
        path: 'training',
        loadChildren: () =>
          import('./training/training.routes').then((m) => m.trainingRoutes),
      },
      {
        path: 'news',
        loadChildren: () => import('./news/news.routes').then((m) => m.newsRoutes),
      },
    ],
  },
];
