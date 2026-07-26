/**
 * Environment per la build di produzione (vedi `fileReplacements` in
 * `angular.json`). Per default si assume che il frontend sia servito sotto
 * lo stesso host del backend e quindi venga utilizzato un path relativo.
 *
 * Cambiare `newsApiBaseUrl` per puntare a un'origine specifica
 * (es. `https://api.example.com/api/v1`).
 */
export const environment = {
  production: true,
  newsApiBaseUrl: '/api/v1',
};
