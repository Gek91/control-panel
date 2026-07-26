#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
REPO_ROOT="$(cd "${ROOT}/.." && pwd)"
K8S_LOCAL="${ROOT}/k8s/environments/local"

if ! command -v minikube >/dev/null 2>&1; then
  echo "minikube is required" >&2
  exit 1
fi
if ! command -v kubectl >/dev/null 2>&1; then
  echo "kubectl is required" >&2
  exit 1
fi
if ! command -v just >/dev/null 2>&1; then
  echo "just is required" >&2
  exit 1
fi

if ! minikube status >/dev/null 2>&1; then
  echo "starting minikube..."
  minikube start
fi

services=(
  "cash-manager-be:cash-manager:0.0.1-SNAPSHOT"
  "weight-record-be:weight-record-api:0.0.1"
  "news-collector-be:news-collector-be:0.0.1"
  "control-panel-fe:control-panel-fe:0.0.1"
)

for entry in "${services[@]}"; do
  IFS=':' read -r dir image tag <<<"${entry}"
  echo "==> building ${dir} (${image}:${tag})"
  (
    cd "${REPO_ROOT}/${dir}"
    just docker-build
  )
  echo "==> loading ${image}:${tag} into minikube"
  minikube image load "${image}:${tag}"
done

echo "==> applying local kustomize"
kubectl apply -k "${K8S_LOCAL}"

echo "==> done"
echo "Services (NodePort):"
echo "  cash-manager-be     -> minikube service cash-manager-be -n control-panel"
echo "  weight-record-be    -> minikube service weight-record-be -n control-panel"
echo "  news-collector-be   -> minikube service news-collector-be -n control-panel"
echo "  control-panel-fe    -> minikube service control-panel-fe -n control-panel"
