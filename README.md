# SentinelAI 🛡️
### AI-Powered DevSecOps Monitoring Platform on AWS EKS

> A production-style cloud-native platform demonstrating real-world DevSecOps workflows — containerization, Kubernetes orchestration, CI/CD automation, security scanning, and observability engineering.

---

## Overview

SentinelAI is a backend-first DevSecOps platform built to simulate real engineering workflows used in modern cloud teams. It exposes a FastAPI backend with health, metrics, alerting, and AI recommendation endpoints — designed from Day 1 for Kubernetes deployment.

This is **not** a tutorial project. Every decision — folder structure, probe design, multi-env separation, image tagging — reflects production engineering practices.

---

## Architecture

### Current (Local)

```
Developer
    ↓
FastAPI Backend (Python 3.12)
    ↓
Docker Container (multi-stage, non-root)
    ↓
K3d Cluster — 1 server + 2 agents
    ↓
Traefik Ingress → localhost:8080
    ↓
┌─────────────┬──────────────┬─────────────┐
│  sentinelai │  sentinelai  │ sentinelai  │
│    -dev     │   -staging   │   -prod     │
│  1 replica  │  2 replicas  │  3 replicas │
└─────────────┴──────────────┴─────────────┘
```

### Planned (Production)

```
GitHub Push
    ↓
GitHub Actions CI/CD
    ↓
SonarQube → Trivy → OPA Gatekeeper
    ↓
Amazon ECR
    ↓
AWS EKS (multi-env)
    ↓
Prometheus + Grafana
    ↓
AI Anomaly Detection Layer
```

---

## Tech Stack

| Layer | Technology |
|---|---|
| Backend | Python, FastAPI, Uvicorn |
| Containerization | Docker (multi-stage) |
| Orchestration | Kubernetes, K3d (local), AWS EKS (prod) |
| CI/CD | GitHub Actions |
| Container Registry | Amazon ECR |
| DevSecOps | SonarQube, Trivy, OPA Gatekeeper |
| Monitoring | Prometheus, Grafana |
| AI Layer | Anomaly detection, Alert recommendations |
| IaC | Terraform (Phase 7+) |

---

## Quick Start

### Prerequisites

| Tool | Version |
|---|---|
| Python | 3.12+ |
| Docker | 20.0+ |
| kubectl | 1.28+ |
| k3d | 5.0+ (auto-installed) |

### 1. Clone the repository

```bash
git clone https://github.com/Heyyprakhar1/sentinel-ai-platform.git
cd sentinel-ai-platform
```

### 2. Setup Python environment

```bash
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

### 3. Run locally (without Docker)

```bash
uvicorn app.main:app --reload --port 8000
```

### 4. Create K3d cluster

```bash
make cluster-up
# Enter cluster name when prompted
```

### 5. Build and import Docker image

```bash
make build
make import-image
```

### 6. Deploy all environments

```bash
kubectl apply -f k8s/namespaces.yaml
make deploy-all
```

### 7. Verify

```bash
make status
curl http://localhost:8080/health
```

---

## API Endpoints

| Endpoint | Method | Description | K8s Usage |
|---|---|---|---|
| `/health` | GET | App liveness check | Liveness probe |
| `/status` | GET | App readiness check | Readiness probe |
| `/metrics` | GET | Prometheus metrics | Scrape target |
| `/alerts` | GET | Alert feed | Core workload |
| `/recommendation` | GET | AI insight stub | Core workload |

---

## Environment Matrix

| Property | Dev | Staging | Prod |
|---|---|---|---|
| Namespace | sentinelai-dev | sentinelai-staging | sentinelai-prod |
| Replicas | 1 | 2 | 3 |
| Log Level | DEBUG | INFO | WARNING |
| CPU Request | 50m | 100m | 200m |
| Memory Request | 64Mi | 128Mi | 256Mi |
| Image Pull Policy | Never | IfNotPresent | IfNotPresent* |

> *`Always` in prod once ECR is configured (Phase 7)

---

## Makefile Commands

```bash
# Docker
make build            # Build Docker image
make run              # Run container locally
make stop             # Stop container

# Kubernetes
make deploy-dev       # Deploy to dev environment
make deploy-staging   # Deploy to staging environment
make deploy-prod      # Deploy to prod environment
make deploy-all       # Deploy all environments
make status           # Show all environments status
make status-dev       # Show dev environment status
make logs-dev         # Show dev pod logs

# Cluster
make cluster-up       # Create K3d cluster
make cluster-down     # Delete K3d cluster
make import-image     # Import image into cluster

# Cleanup
make clean            # Remove all environments
```

---

## Project Structure

```
sentinel-ai-platform/
├── app/
│   ├── main.py                  # Entry point
│   ├── api/
│   │   └── routes/              # health, metrics, alerts, recommendations
│   ├── core/
│   │   ├── config.py            # Env var config (pydantic-settings)
│   │   └── logging_config.py    # Structured logging
│   ├── models/
│   │   └── schemas.py           # Pydantic data contracts
│   └── services/
│       ├── alert_service.py
│       └── recommendation_service.py
├── k8s/
│   ├── base/                    # Shared Kubernetes manifests
│   └── overlays/
│       ├── dev/
│       ├── staging/
│       └── prod/
├── scripts/
│   └── k3d-setup.sh             # Cluster setup script
├── docs/
│   ├── architecture.md
│   └── setup.md
├── .github/
│   ├── PULL_REQUEST_TEMPLATE.md
│   └── ISSUE_TEMPLATE/
├── Dockerfile                   # Multi-stage, non-root
├── Makefile                     # Common commands
├── requirements.txt
└── .env.example
```

---

## Roadmap

| Phase | Description | Status |
|---|---|---|
| 1 | FastAPI Backend Foundation | ✅ Done |
| 2 | Docker Containerization | ✅ Done |
| 3 | Local Kubernetes (K3d) + Multi-env | ✅ Done |
| 4 | Repository Structure | ✅ Done |
| 5 | GitHub Actions CI/CD | 🔄 Next |
| 6 | DevSecOps — SonarQube, Trivy, OPA | ⏳ Pending |
| 7 | AWS EKS Deployment | ⏳ Pending |
| 8 | Monitoring — Prometheus + Grafana | ⏳ Pending |
| 9 | AI Insights Layer | ⏳ Pending |
| 10 | Optional Frontend Dashboard | ⏳ Pending |

---

## Author

**Prakhar Srivastava** — DevOps Engineer  
[Portfolio](https://prakharsrivastava-devops.netlify.app) · [LinkedIn](https://www.linkedin.com/in/heyyprakhar1/) · [Hashnode](https://hashnode.com/@heyyprakhar01)
