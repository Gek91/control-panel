Common tasks are also available via [Just](https://github.com/casey/just) — see `Justfile` (`just --list`).

## Local development

### Prerequisites

Backend services running on the host (default ports):

| Service | Port |
|---|---|
| cash-manager-be | `8080` |
| weight-record-be | `8081` |
| news-collector-be | `8082` |

### Install dependencies

```bash
npm install
```

### Run the application

```bash
npm start
# or: just run
```

This starts `ng serve` (typically on `http://localhost:4200`). The Angular app calls relative API paths (`/api/cash`, `/api/weight`, `/api/news`); the CLI proxies them to the local backends via `src/proxy.conf.json` (wired in `angular.json` as `proxyConfig`).

| Frontend path | Proxied to | Path rewrite |
|---|---|---|
| `/api/cash/...` | `http://localhost:8080` | `/api/cash` stripped |
| `/api/weight/...` | `http://localhost:8081` | `/api/weight` stripped |
| `/api/news/...` | `http://localhost:8082` | `/api/news` stripped |

Same routing idea as nginx in the container; `proxy.conf.json` is used only by `ng serve`, not in Docker/Kubernetes.

### Build the application
```bash
npm run build
```

## Docker

### Build image

```bash
docker build -t control-panel-fe:0.0.1 .
```

### Run container

```bash
docker run --rm -p 8080:8080 control-panel-fe:0.0.1
```

The container serves the static Angular build with nginx (port 8080) and proxies backend APIs:

| Frontend path | Backend service |
|---|---|
| `/api/news/...` | `news-collector-be:8080` (prefix stripped) |
| `/api/cash/...` | `cash-manager-be:8080` (prefix stripped) |
| `/api/weight/...` | `weight-record-be:8080` (prefix stripped) |

### `docker-entrypoint.sh`

Container entrypoint that runs before nginx. It:

- creates nginx temp directories under `/tmp` (needed when `/tmp` is an empty volume in Kubernetes)
- writes a DNS `resolver` from `/etc/resolv.conf` so backend service names are resolved at request time, not at startup

## Version

The app version is defined in `package.json`.
