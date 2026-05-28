#!/bin/bash

GREEN='\033[0;32m'; YELLOW='\033[1;33m'
BLUE='\033[0;34m'; NC='\033[0m'

info()  { echo -e "${BLUE}[INFO]${NC}  $1"; }
ok()    { echo -e "${GREEN}[OK]${NC}    $1"; }
warn()  { echo -e "${YELLOW}[WARN]${NC}  $1"; }

echo ""
echo "SentinelAI -- Full Stack Teardown"
echo "=================================="
echo ""
warn "This will delete everything. Are you sure? (yes/no)"
read -p "> " CONFIRM
if [ "$CONFIRM" != "yes" ]; then
  info "Aborted."
  exit 0
fi

echo ""

# ── Step 1: Frontend ───────────────────────────────────────────────
info "Step 1/6 -- Removing frontend..."
kubectl delete -f k8s/frontend/dashboard.yaml --ignore-not-found
ok "Frontend removed."

# ── Step 2: Monitoring manifests ───────────────────────────────────
info "Step 2/6 -- Removing monitoring manifests..."
kubectl delete -f k8s/monitoring/servicemonitor.yaml --ignore-not-found
kubectl delete -f k8s/monitoring/prometheusrule.yaml --ignore-not-found
kubectl delete -f k8s/monitoring/alertmanager.yaml --ignore-not-found
ok "Monitoring manifests removed."

# ── Step 3: Prometheus stack ───────────────────────────────────────
info "Step 3/6 -- Uninstalling kube-prometheus-stack..."
helm uninstall prometheus -n monitoring 2>/dev/null || true
kubectl delete namespace monitoring --ignore-not-found
ok "Prometheus stack removed."

# ── Step 4: App ────────────────────────────────────────────────────
info "Step 4/6 -- Removing app from all environments..."
kubectl delete -k k8s/overlays/dev/ --ignore-not-found
kubectl delete -k k8s/overlays/staging/ --ignore-not-found
kubectl delete -k k8s/overlays/prod/ --ignore-not-found
ok "App removed from dev / staging / prod."

# ── Step 5: OPA Gatekeeper ─────────────────────────────────────────
info "Step 5/6 -- Removing OPA Gatekeeper..."
kubectl delete -f k8s/gatekeeper/constraints/ --ignore-not-found
kubectl delete -f k8s/gatekeeper/templates/ --ignore-not-found
kubectl delete -f https://raw.githubusercontent.com/open-policy-agent/gatekeeper/master/deploy/gatekeeper.yaml --ignore-not-found
ok "Gatekeeper removed."

# ── Step 6: Namespaces ─────────────────────────────────────────────
info "Step 6/6 -- Removing namespaces..."
kubectl delete -f k8s/namespaces.yaml --ignore-not-found
ok "Namespaces removed."

# ── Done ───────────────────────────────────────────────────────────
echo ""
echo "=================================="
ok "Full stack torn down."
echo ""
