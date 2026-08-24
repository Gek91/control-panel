import { InjectionToken } from '@angular/core';

/**
 * Base URL delle API weight-record (es. `/api/weight`).
 * Fornito da `ApplicationConfig` tramite environment.
 */
export const WEIGHT_API_BASE_URL = new InjectionToken<string>(
  'WEIGHT_API_BASE_URL',
);
