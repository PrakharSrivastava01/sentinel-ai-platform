#!/bin/bash

# ─────────────────────────────────────────────
#  SentinelAI — K3d Cluster Setup Script
#  Usage: ./k3d-setup.sh
# ─────────────────────────────────────────────

set -e

# ── Colors ──
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# ── Helpers ──
info()    { echo -e "${BLUE}[INFO]${NC}  $1"; }
success() { echo -e "${GREEN}[OK]${NC}    $1"; }
warn()    { echo -e "${YELLOW}[WARN]${NC}  $1"; }
error()   { echo -e "${RED}[ERROR]${NC} $1"; }

# ─────────────────────────────────────────────
# CLEANUP FUNCTION
# ─────────────────────────────────────────────
cleanup_and_exit() {
  echo ""
  warn "Prerequisite check failed. Cleaning up..."

  # Remove k3d if it was just installed in this session
  if [[ "$K3D_JUST_INSTALLED" == "true" ]]; then
    info "Removing k3d that was installed in this session..."
    sudo rm -f /usr/local/bin/k3d 2>/dev/null && success "k3d removed" || warn "Could not remove k3d — remove manually: sudo rm -f /usr/local/bin/k3d"
  fi

  # Delete cluster if it was just created in this session
  if [[ "$CLUSTER_JUST_CREATED" == "true" ]] && command -v k3d &>/dev/null; then
    info "Removing cluster '${CLUSTER_NAME}' created in this session..."
    k3d cluster delete "${CLUSTER_NAME}" 2>/dev/null && success "Cluster removed" || warn "Could not remove cluster"
  fi

  echo ""
  echo -e "${RED}╔══════════════════════════════════════════════════╗${NC}"
  echo -e "${RED}║           Prerequisites Not Satisfied            ║${NC}"
  echo -e "${RED}╚══════════════════════════════════════════════════╝${NC}"
  echo ""
  echo -e "  Please install the missing tools and re-run the script."
  echo ""

  if [[ "$DOCKER_MISSING" == "true" ]]; then
    echo -e "  ${YELLOW}Docker:${NC}"
    echo -e "    sudo apt-get update"
    echo -e "    sudo apt-get install -y docker.io"
    echo -e "    sudo service docker start"
    echo -e "    sudo usermod -aG docker \$USER"
    echo -e "    newgrp docker"
    echo ""
  fi

  if [[ "$DOCKER_DAEMON_DOWN" == "true" ]]; then
    echo -e "  ${YELLOW}Docker daemon is not running:${NC}"
    echo -e "    sudo service docker start"
    echo ""
  fi

  if [[ "$KUBECTL_MISSING" == "true" ]]; then
    echo -e "  ${YELLOW}kubectl:${NC}"
    echo -e "    curl -LO https://dl.k8s.io/release/\$(curl -s https://dl.k8s.io/release/stable.txt)/bin/linux/amd64/kubectl"
    echo -e "    chmod +x kubectl"
    echo -e "    sudo mv kubectl /usr/local/bin/"
    echo ""
  fi

  echo -e "  Once installed, re-run: ${GREEN}./k3d-setup.sh${NC}"
  echo ""
  exit 1
}

# ─────────────────────────────────────────────
# STEP 0 — Banner
# ─────────────────────────────────────────────
echo ""
echo -e "${BLUE}╔══════════════════════════════════════╗${NC}"
echo -e "${BLUE}║     SentinelAI — K3d Cluster Setup   ║${NC}"
echo -e "${BLUE}╚══════════════════════════════════════╝${NC}"
echo ""

# ─────────────────────────────────────────────
# STEP 1 — User Input
# ─────────────────────────────────────────────
read -p "$(echo -e ${YELLOW}Enter cluster name: ${NC})" CLUSTER_NAME

if [[ -z "$CLUSTER_NAME" ]]; then
  error "Cluster name cannot be empty."
  exit 1
fi

info "Cluster name set to: ${CLUSTER_NAME}"
echo ""

# ─────────────────────────────────────────────
# STEP 2 — Prerequisites Check
# ─────────────────────────────────────────────
info "Checking prerequisites..."

PREREQ_FAILED=false
DOCKER_MISSING=false
DOCKER_DAEMON_DOWN=false
KUBECTL_MISSING=false
K3D_JUST_INSTALLED=false
CLUSTER_JUST_CREATED=false

# Docker binary check
if ! command -v docker &>/dev/null; then
  error "Docker not found."
  DOCKER_MISSING=true
  PREREQ_FAILED=true
else
  DOCKER_VERSION=$(docker --version | awk '{print $3}' | tr -d ',')
  success "Docker found — v${DOCKER_VERSION}"

  # Docker daemon check
  if ! docker info &>/dev/null 2>&1; then
    error "Docker daemon is not running."
    DOCKER_DAEMON_DOWN=true
    PREREQ_FAILED=true
  else
    success "Docker daemon is running"
  fi
fi

# kubectl check
if ! command -v kubectl &>/dev/null; then
  error "kubectl not found."
  KUBECTL_MISSING=true
  PREREQ_FAILED=true
else
  KUBECTL_VERSION=$(kubectl version --client --short 2>/dev/null | awk '{print $3}')
  success "kubectl found — ${KUBECTL_VERSION}"
fi

# If any prerequisite failed — cleanup and exit
if [[ "$PREREQ_FAILED" == "true" ]]; then
  cleanup_and_exit
fi

echo ""

# ─────────────────────────────────────────────
# STEP 3 — K3d Install (if not present)
# ─────────────────────────────────────────────
info "Checking k3d..."

if ! command -v k3d &>/dev/null; then
  warn "k3d not found — installing..."
  K3D_JUST_INSTALLED=true
  curl -s https://raw.githubusercontent.com/k3d-io/k3d/main/install.sh | bash

  if ! command -v k3d &>/dev/null; then
    error "k3d installation failed."
    cleanup_and_exit
  fi
  success "k3d installed — $(k3d version | head -1)"
else
  success "k3d already installed — $(k3d version | head -1)"
fi

echo ""

# ─────────────────────────────────────────────
# STEP 4 — Existing Cluster Check
# ─────────────────────────────────────────────
info "Checking if cluster already exists..."

if k3d cluster list | grep -q "^${CLUSTER_NAME}"; then
  warn "Cluster '${CLUSTER_NAME}' already exists."
  read -p "$(echo -e ${YELLOW}Delete and recreate? [y/N]: ${NC})" RECREATE
  if [[ "$RECREATE" =~ ^[Yy]$ ]]; then
    info "Deleting existing cluster..."
    k3d cluster delete "${CLUSTER_NAME}"
    success "Existing cluster deleted"
  else
    info "Using existing cluster."
    k3d kubeconfig merge "${CLUSTER_NAME}" --kubeconfig-switch-context
    success "Kubeconfig set — context: k3d-${CLUSTER_NAME}"
    echo ""
    kubectl cluster-info
    exit 0
  fi
fi

echo ""

# ─────────────────────────────────────────────
# STEP 5 — Cluster Create
# ─────────────────────────────────────────────
info "Creating cluster '${CLUSTER_NAME}'..."
CLUSTER_JUST_CREATED=true

k3d cluster create "${CLUSTER_NAME}" \
  --agents 2 \
  --port "8080:80@loadbalancer" \
  --port "8443:443@loadbalancer" \
  --wait

success "Cluster '${CLUSTER_NAME}' is ready"
echo ""

# ─────────────────────────────────────────────
# STEP 6 — Kubeconfig Set
# ─────────────────────────────────────────────
info "Merging kubeconfig and switching context..."

k3d kubeconfig merge "${CLUSTER_NAME}" --kubeconfig-switch-context
success "Kubeconfig set — active context: k3d-${CLUSTER_NAME}"
echo ""

# ─────────────────────────────────────────────
# STEP 7 — Verification
# ─────────────────────────────────────────────
info "Verifying cluster..."
echo ""

kubectl cluster-info
echo ""

info "Nodes:"
kubectl get nodes -o wide
echo ""

info "System pods:"
kubectl get pods -n kube-system
echo ""

# ─────────────────────────────────────────────
# DONE
# ─────────────────────────────────────────────
echo -e "${GREEN}╔══════════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║   Cluster '${CLUSTER_NAME}' ready for SentinelAI!   ║${NC}"
echo -e "${GREEN}╚══════════════════════════════════════════════════╝${NC}"
echo ""
echo -e "  ${BLUE}Context:${NC}  k3d-${CLUSTER_NAME}"
echo -e "  ${BLUE}HTTP:${NC}     localhost:8080"
echo -e "  ${BLUE}HTTPS:${NC}    localhost:8443"
echo ""
