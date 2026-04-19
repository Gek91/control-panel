# news-collector-be

Backend Go (Gin) per la gestione delle news del control-panel.

## Requisiti

- Go 1.23+

## Setup

```bash
go mod tidy
```

## Run

```bash
make run
# oppure
go run .
```

Default: server in ascolto su `:8080`. Override con `PORT=9090 go run .`.

### Swagger (documentazione API)

Con il server avviato, l’interfaccia **Swagger UI** è disponibile qui:

**http://localhost:8080/swagger/index.html**

Se usi un’altra porta (`PORT`), sostituisci `8080` (es. `http://localhost:9090/swagger/index.html`). All’avvio, `main.go` aggiorna l’host nello spec OpenAPI in base a `PORT`, così “Try it out” punta al server corretto.

**Rigenerare i file OpenAPI** (a partire dai commenti `swag` nel codice, output in `docs/`):

```bash
make swagger
```

Il target usa **`swag` nel PATH** se installato (più veloce), altrimenti **`go run github.com/swaggo/swag/cmd/swag@v1.8.12`** (stessa versione indicativa del modulo). Installazione opzionale del CLI:

```bash
go install github.com/swaggo/swag/cmd/swag@v1.8.12
```

Assicurati che `$(go env GOPATH)/bin` sia nel `PATH`. Dopo `make swagger` trovi tra l’altro `docs/docs.go`, `docs/swagger.json` e `docs/swagger.yaml`.

### Variabili d'ambiente

Tutte le configurazioni sono caricate all'avvio dal package `internal/core`.

| Variabile             | Default | Descrizione                                                      |
| --------------------- | ------- | ---------------------------------------------------------------- |
| `PORT`                | `8080`                  | Porta HTTP del server                                          |
| `LOG_LEVEL`           | `info`                  | Livello slog: `debug`, `info`, `warn`, `error`                 |
| `READ_HEADER_TIMEOUT` | `5s`                    | Timeout lettura header HTTP (numero = secondi, oppure `500ms`) |
| `SHUTDOWN_TIMEOUT`    | `10s`                   | Tempo massimo concesso al graceful shutdown                    |
| `DB_IN_MEMORY`       | _(off)_                 | `true` / `1` per SQLite in RAM (nessun file)                    |
| `DB_PATH`             | `news.db`               | Path del file SQLite (creato al primo avvio se non esiste)     |
| `SCHEMA_PATH`         | `resources/schema.sql`  | Path dello schema SQL applicato al primo init                  |
| `SEED_PATH`           | _(vuoto)_               | Se valorizzato, applica i dati di seed al primo init           |

## Build

```bash
make build
./bin/news-collector-be
```

## Endpoints

| Metodo | Path                    | Descrizione              |
| ------ | ----------------------- | ------------------------ |
| GET    | `/health`               | Healthcheck              |
| GET    | `/api/v1/news`          | Lista news (query opz.) |
| PATCH  | `/api/v1/news/:id/read` | Segna letta / non letta  |
| GET    | `/swagger/*`            | Swagger UI e `doc.json`  |

## Struttura del progetto

```
.
├── main.go
├── docs/                    # OpenAPI: docs.go (+ swagger.json/yaml da `make swagger`)
├── internal/
│   ├── api/                 # router, health
│   ├── core/                # config, errori repository condivisi
│   ├── db/                  # Store + SQLite (file / in-memory)
│   ├── feed/                # dominio feed
│   └── news/                # dominio news
└── Makefile
```

## Storage

Lo storage è **SQLite** (driver pure-Go `modernc.org/sqlite`, niente CGO).

Il file viene creato al primo avvio nel path `DB_PATH` (default `news.db` nella CWD).
Lo schema è definito in `resources/schema.sql` e viene applicato automaticamente al
primo avvio (quando la tabella `news` non esiste ancora).

In sviluppo puoi precaricare dati di esempio impostando `SEED_PATH=resources/local_data.sql`
oppure lanciando il target Make dedicato:

```bash
make run-dev      # equivalente a SEED_PATH=resources/local_data.sql LOG_LEVEL=debug go run .
make reset-db     # cancella il file DB per ripartire da zero
```

> Nota: lo schema viene applicato **una sola volta**. Per evolverlo dopo il primo avvio
> servirà rigenerare il DB (`make reset-db`) o introdurre un sistema di migrazioni
> versionate.
