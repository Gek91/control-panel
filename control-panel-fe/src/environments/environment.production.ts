/**
 * Environment per la build di produzione (vedi `fileReplacements` in
 * `angular.json`). Path relativi serviti da nginx nello stesso host.
 */
export const environment = {
  production: true,
  newsApiBaseUrl: '/api/news/v1',
  cashApiBaseUrl: '/api/cash',
  weightApiBaseUrl: '/api/weight',
};
