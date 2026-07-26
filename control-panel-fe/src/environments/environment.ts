/**
 * Environment di default (usato per `ng serve` e build di sviluppo).
 *
 * Path relativi + proxy (`src/proxy.conf.json`) / nginx in container:
 * - news   → `/api/news/v1` (news-collector-be, espone `/api/v1/...`)
 * - cash   → `/api/cash`    (cash-manager-be)
 * - weight → `/api/weight`  (weight-record-be)
 */
export const environment = {
  production: false,
  newsApiBaseUrl: '/api/news/v1',
  cashApiBaseUrl: '/api/cash',
  weightApiBaseUrl: '/api/weight',
};
