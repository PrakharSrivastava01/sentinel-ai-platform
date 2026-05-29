#!/bin/bash

GREEN='\033[0;32m'; YELLOW='\033[1;33m'
BLUE='\033[0;34m'; NC='\033[0m'

info()  { echo -e "${BLUE}[INFO]${NC}  $1"; }
ok()    { echo -e "${GREEN}[OK]${NC}    $1"; }
warn()  { echo -e "${YELLOW}[WARN]${NC}  $1"; }
error() { echo -e "${RED}[ERROR]${NC} $1"; exit 1; }

echo ""
echo "SentinelAI -- Full Stack Setup"
echo "================================"
echo ""

# ── Variables ──────────────────────────────────────────────────────
read -p "App namespace prefix [sentinelai]: " NS_PREFIX
NS_PREFIX=${NS_PREFIX:-sentinelai}

read -p "Monitoring namespace [monitoring]: " NS_MONITORING
NS_MONITORING=${NS_MONITORING:-monitoring}

read -p "Grafana admin password [sentinel@123]: " GRAFANA_PASSWORD
GRAFANA_PASSWORD=${GRAFANA_PASSWORD:-sentinel@123}

read -p "Image name [sentinelai]: " IMAGE_NAME
IMAGE_NAME=${IMAGE_NAME:-sentinelai}

read -p "Image tag [1.0.0]: " IMAGE_TAG
IMAGE_TAG=${IMAGE_TAG:-1.0.0}

read -p "Install ArgoCD? (yes/no) [yes]: " INSTALL_ARGOCD
INSTALL_ARGOCD=${INSTALL_ARGOCD:-yes}

echo ""
info "Starting setup with:"
info "  App namespaces : ${NS_PREFIX}-dev / ${NS_PREFIX}-staging / ${NS_PREFIX}-prod"
info "  Monitoring ns  : ${NS_MONITORING}"
info "  Image          : ${IMAGE_NAME}:${IMAGE_TAG}"
info "  ArgoCD         : ${INSTALL_ARGOCD}"
echo ""

# ── Step 0: Cluster check ──────────────────────────────────────────
info "Step 0/8 -- Checking K3d cluster..."
if ! k3d cluster list 2>/dev/null | grep -q "Sentinel"; then
  warn "No cluster found. Running k3d-setup.sh first..."
  bash scripts/k3d-setup.sh
fi
ok "Cluster ready."

# ── Step 1: Namespaces ─────────────────────────────────────────────
info "Step 1/8 -- Creating namespaces..."
kubectl apply -f k8s/namespaces.yaml
ok "Namespaces created."

# ── Step 2: OPA Gatekeeper ─────────────────────────────────────────
info "Step 2/8 -- Installing OPA Gatekeeper..."
kubectl apply -f https://raw.githubusercontent.com/open-policy-agent/gatekeeper/master/deploy/gatekeeper.yaml
info "Waiting for Gatekeeper to be ready..."
kubectl wait --for=condition=ready pod -l control-plane=controller-manager \
  -n gatekeeper-system --timeout=120s
kubectl apply -f k8s/gatekeeper/templates/
kubectl apply -f k8s/gatekeeper/constraints/
ok "OPA Gatekeeper installed and policies applied."

# ── Step 3: Docker image ───────────────────────────────────────────
info "Step 3/8 -- Building and importing Docker image..."
info "Note: Use the backend image name only (e.g. sentinelai, not the compose image name)"
docker build -t "${IMAGE_NAME}:${IMAGE_TAG}" .
k3d image import "${IMAGE_NAME}:${IMAGE_TAG}" -c "$(kubectl config current-context | sed 's/k3d-//')"
ok "Image imported."

# ── Step 4: App deploy ─────────────────────────────────────────────
info "Step 4/8 -- Deploying app to all environments..."
kubectl apply -k k8s/overlays/dev/
kubectl apply -k k8s/overlays/staging/
kubectl apply -k k8s/overlays/prod/
ok "App deployed to dev / staging / prod."

# ── Step 5: Prometheus + Grafana ───────────────────────────────────
info "Step 5/8 -- Installing kube-prometheus-stack via Helm..."
if ! command -v helm &> /dev/null; then
  warn "Helm not found. Skipping Prometheus stack. Install manually:"
  warn "  helm install prometheus prometheus-community/kube-prometheus-stack --namespace ${NS_MONITORING} --create-namespace"
else
  helm repo add prometheus-community https://prometheus-community.github.io/helm-charts 2>/dev/null || true
  helm repo update
  helm upgrade --install prometheus prometheus-community/kube-prometheus-stack \
    --namespace "${NS_MONITORING}" \
    --create-namespace \
    --set grafana.adminPassword="${GRAFANA_PASSWORD}" \
    --set prometheus.prometheusSpec.retention=7d \
    --set alertmanager.enabled=true \
    --wait
  ok "Prometheus + Grafana + Alertmanager installed."
fi

# ── Step 6: Monitoring manifests ───────────────────────────────────
info "Step 6/8 -- Applying monitoring manifests..."
kubectl apply -f k8s/monitoring/servicemonitor.yaml
kubectl apply -f k8s/monitoring/prometheusrule.yaml
kubectl apply -f k8s/monitoring/alertmanager.yaml
ok "Monitoring manifests applied."

# ── Step 7: Frontend ───────────────────────────────────────────────
info "Step 7/8 -- Deploying frontend dashboard..."
docker build -t sentinelai-dashboard:1.0.0 frontend/
k3d image import sentinelai-dashboard:1.0.0 -c "$(kubectl config current-context | sed 's/k3d-//')"
kubectl apply -f k8s/frontend/dashboard.yaml
ok "Frontend deployed."

# ── Step 8: ArgoCD ─────────────────────────────────────────────────
if [ "${INSTALL_ARGOCD}" = "yes" ]; then
  info "Step 8/8 -- Installing ArgoCD..."
  kubectl apply -f k8s/argocd/namespace.yaml
  kubectl apply -n argocd \
    -f https://raw.githubusercontent.com/argoproj/argo-cd/stable/manifests/install.yaml
  info "Waiting for ArgoCD to be ready..."
  kubectl wait --for=condition=ready pod \
    -l app.kubernetes.io/name=argocd-server \
    -n argocd --timeout=180s
  info "Applying ApplicationSet..."
  kubectl apply -f k8s/argocd/appset.yaml
  ARGOCD_PASSWORD=$(kubectl -n argocd get secret argocd-initial-admin-secret \
    -o jsonpath="{.data.password}" | base64 -d)
  ok "ArgoCD installed and ApplicationSet applied."
  echo ""
  info "ArgoCD credentials:"
  info "  URL      : kubectl port-forward svc/argocd-server 8888:443 -n argocd"
  info "  Username : admin"
  info "  Password : ${ARGOCD_PASSWORD}"
else
  info "Step 8/8 -- Skipping ArgoCD."
fi

# ── Done ───────────────────────────────────────────────────────────
echo ""
echo "================================"
ok "Full stack is up."
echo ""
info "Access:"
info "  App       : http://localhost:8080"
info "  ArgoCD    : https://localhost:8888 (after port-forward)"
info "  Grafana   : kubectl port-forward svc/prometheus-grafana 3000:80 -n ${NS_MONITORING}"
info "  Prometheus: kubectl port-forward svc/prometheus-kube-prometheus-prometheus 9090:9090 -n ${NS_MONITORING}"
echo ""
