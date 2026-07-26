/**
 * Environment di default (usato per `ng serve` e build di sviluppo).
 *
 * `newsApiBaseUrl` è il base path delle API del news-collector backend.
 * In sviluppo si usa il path relativo `/api/v1` insieme al proxy
 * (vedi `src/proxy.conf.json`) che inoltra le richieste a localhost:8080,
 * evitando problemi di CORS.
 *
 * Per puntare a un backend differente è sufficiente modificare il valore
 * qui sotto (oppure modificare la mappa di proxy).
 */
export const environment = {
  production: false,
  newsApiBaseUrl: '/api/v1',
};
