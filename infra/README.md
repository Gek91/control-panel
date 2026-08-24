# Infra

Local Kubernetes (minikube) manifests and helpers for control-panel.

## Prerequisites

- Docker
- [minikube](https://minikube.sigs.k8s.io/)
- kubectl
- [Just](https://github.com/casey/just)

## Deploy local stack

From the repo root (`control-panel/`):

```bash
./infra/scripts/deploy-local.sh
```

The script:

1. starts minikube if needed
2. builds each service image via `just docker-build`
3. loads the images into minikube (`minikube image load`)
4. applies `infra/k8s/environments/local`

## Apply manifests only

If images are already built and loaded:

```bash
kubectl apply -k infra/k8s/environments/local
```

## Access services

| Service | NodePort | Command |
|---|---|---|
| cash-manager-be | 30080 | `minikube service cash-manager-be -n control-panel` |
| weight-record-be | 30081 | `minikube service weight-record-be -n control-panel` |
| news-collector-be | 30082 | `minikube service news-collector-be -n control-panel` |
| control-panel-fe | 30083 | `minikube service control-panel-fe -n control-panel` |
| postgres | 30432 | `minikube service postgres -n control-panel` |

## Minikube dashboard

To inspect the cluster in a web UI (pods, deployments, services, logs):

```bash
minikube dashboard
```

Leave the terminal open while using the dashboard; it proxies the UI and stops when the process exits.

### PostgreSQL (StatefulSet)

Single small instance with 1 Gi persistent volume.

| | |
|---|---|
| Host (in-cluster) | `postgres.control-panel.svc.cluster.local` |
| Port | `5432` |
| Database | `controlpanel` |
| User / password | `controlpanel` / `controlpanel` (local Secret only) |


The frontend nginx proxies API traffic inside the cluster:

| Frontend path | Backend service |
|---|---|
| `/api/news/...` | `news-collector-be` |
| `/api/cash/...` | `cash-manager-be` |
| `/api/weight/...` | `weight-record-be` |

## Layout

```
infra/
├── scripts/deploy-local.sh
└── k8s/
    ├── apps/<service>/{base,overlays/local}
    ├── data/postgres/{base,overlays/local}
    └── environments/local
```
