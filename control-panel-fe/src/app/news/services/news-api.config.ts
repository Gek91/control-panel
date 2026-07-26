import { InjectionToken } from '@angular/core';

/**
 * Base URL delle API del news-collector backend (es. `/api/v1` o
 * `https://example.com/api/v1`). Il valore viene fornito a livello di
 * `ApplicationConfig` a partire dall'environment file.
 */
export const NEWS_API_BASE_URL = new InjectionToken<string>('NEWS_API_BASE_URL');
