<div align="center">

# SentinelAI 🛡️

**AI-Powered DevSecOps Monitoring Platform**

![Python](https://img.shields.io/badge/Python-3.12-blue?style=flat-square&logo=python)
![FastAPI](https://img.shields.io/badge/FastAPI-0.100+-green?style=flat-square&logo=fastapi)
![Docker](https://img.shields.io/badge/Docker-29.4-blue?style=flat-square&logo=docker)
![Kubernetes](https://img.shields.io/badge/Kubernetes-1.31-blue?style=flat-square&logo=kubernetes)
![Terraform](https://img.shields.io/badge/Terraform-1.15-purple?style=flat-square&logo=terraform)
![AWS EKS](https://img.shields.io/badge/AWS-EKS-orange?style=flat-square&logo=amazonaws)
![React](https://img.shields.io/badge/React-18-61DAFB?style=flat-square&logo=react)
![GitHub Actions](https://img.shields.io/badge/CI%2FCD-GitHub_Actions-black?style=flat-square&logo=githubactions)
[![CI](https://github.com/Heyyprakhar1/sentinel-ai-platform/actions/workflows/ci.yml/badge.svg)](https://github.com/Heyyprakhar1/sentinel-ai-platform/actions/workflows/ci.yml)
[![Security](https://github.com/Heyyprakhar1/sentinel-ai-platform/actions/workflows/security.yml/badge.svg)](https://github.com/Heyyprakhar1/sentinel-ai-platform/actions/workflows/security.yml)
[![Quality Gate Status](https://sonarcloud.io/api/project_badges/measure?project=Heyyprakhar1_sentinel-ai-platform&metric=alert_status)](https://sonarcloud.io/summary/new_code?id=Heyyprakhar1_sentinel-ai-platform)

</div>

---

## What Is This

SentinelAI is a FastAPI backend wired for Kubernetes from day one — health probes, Prometheus metrics, structured logging, typed service layer. It runs across three environments (dev/staging/prod) on a local K3d cluster, with the same manifests deployable to AWS EKS via Terraform.

On top of the backend: a Z-score anomaly detection engine, a full observability stack (Prometheus, Grafana, Alertmanager), and a React dashboard that pulls live metrics from both the API and Prometheus.

Every file in this repo exists for a reason. Nothing was added for the sake of it looking complete.

---

## Architecture

### Local — K3d

```
Developer Workstation (WSL2 / Ubuntu)
            │
            ▼
  FastAPI Backend (Python 3.12)
  ┌──────────────────────────────┐
  │  /health   /status  /metrics │  ← Kubernetes probe-ready
  │  /alerts   /recommendation  │  ← Core workload
  └──────────────────────────────┘
            │
            ▼
  Docker Container
  multi-stage · non-root user · python:3.12-slim
            │
            ▼
  K3d Cluster — 1 server + 2 agents
            │
            ▼
  Traefik Ingress → localhost:8080
            │
     ┌──────┴──────────┬──────────────┐
     ▼                 ▼              ▼
sentinelai-dev   sentinelai-      sentinelai-
 1 replica       staging           prod
                 2 replicas        3 replicas
```

### Production — AWS EKS via Terraform

```
GitHub Push
     │
     ▼
GitHub Actions CI/CD
     ├── pytest (22 tests, 70% coverage gate)
     ├── SonarCloud — static analysis + quality gate
     ├── Docker build
     └── Trivy — CRITICAL CVE fail gate
     │
     ▼
Amazon ECR
     │
     ▼
AWS EKS v1.35 (ap-south-1)
     ├── VPC — 2 public + 2 private subnets
     ├── Node Group — t3.medium × 2
     │
     ├── Security
     │   ├── OPA Gatekeeper — 3 admission policies
     │   └── NetworkPolicy — zero trust
     │
     ├── Observability
     │   ├── kube-prometheus-stack (Helm)
     │   ├── ServiceMonitor — scrapes /metrics
     │   ├── PrometheusRule — CPU / Memory / Down alerts
     │   ├── Alertmanager — Slack routing
     │   ├── Grafana — cluster + app dashboards
     │   ├── HPA — scales 2–10 replicas
     │   └── PDB — minAvailable: 1
     │
     ├── AI Layer
     │   └── Z-score anomaly engine (20-reading baseline)
     │
     └── React Dashboard
         └── Live metrics + K8s panel via Prometheus API
```

---

## Tech Stack

| Layer | Technology | Status |
|---|---|---|
| Backend | Python 3.12, FastAPI, Uvicorn | ✅ Done |
| Containerization | Docker (multi-stage, non-root) | ✅ Done |
| Local Dev Stack | Docker Compose (backend + frontend + Prometheus + Grafana) | ✅ Done |
| Orchestration | Kubernetes, K3d (local), AWS EKS (prod) | ✅ Done |
| Config Management | Kustomize (base + overlays) | ✅ Done |
| Automation | Makefile | ✅ Done |
| CI/CD | GitHub Actions | ✅ Done |
| Code Quality | SonarCloud | ✅ Done |
| Security Scanning | Trivy (CRITICAL fail gate) | ✅ Done |
| Policy Enforcement | OPA Gatekeeper (3 policies) | ✅ Done |
| Infrastructure as Code | Terraform v1.15 | ✅ Done |
| Container Registry | Amazon ECR | ✅ Done |
| Cloud Orchestration | AWS EKS v1.35 | ✅ Done |
| Metrics Collection | Prometheus + ServiceMonitor | ✅ Done |
| Dashboards | Grafana (cluster + custom dashboards) | ✅ Done |
| Alerting | PrometheusRule + Alertmanager (Slack) | ✅ Done |
| Autoscaling | HPA — CPU 70% / Memory 80%, max 10 | ✅ Done |
| Resilience | PodDisruptionBudget (minAvailable: 1) | ✅ Done |
| Network Security | NetworkPolicy (zero trust) | ✅ Done |
| AI Layer | Z-score anomaly detection + recommendations | ✅ Done |
| Frontend | React 18 + Vite — live metrics dashboard | ✅ Done |

---

## Project Structure

```
sentinel-ai-platform/
│
├── app/                              # FastAPI application
│   ├── main.py                       # Entry point
│   ├── api/
│   │   └── routes/
│   │       ├── health.py             # GET /health  ← liveness probe
│   │       ├── metrics.py            # GET /metrics ← Prometheus scrape
│   │       ├── alerts.py             # GET /alerts
│   │       └── recommendations.py   # GET /recommendation ← AI layer
│   ├── core/
│   │   ├── config.py                 # Pydantic-settings env config
│   │   └── logging_config.py         # Structured stdout logging
│   ├── models/
│   │   └── schemas.py                # Pydantic data contracts
│   └── services/
│       ├── alert_service.py
│       ├── recommendation_service.py
│       └── anomaly_detector.py       # Z-score engine
│
├── frontend/                         # React dashboard
│   ├── src/
│   │   ├── components/
│   │   │   ├── StatusBar.jsx         # Top bar — live health status
│   │   │   ├── MetricCard.jsx        # CPU / Memory / Uptime cards
│   │   │   ├── MetricsChart.jsx      # 2.5min rolling time-series
│   │   │   ├── AlertsFeed.jsx        # Live alert feed
│   │   │   ├── AnomalyPanel.jsx      # Z-score gauge + recommendation
│   │   │   ├── StatusDetails.jsx     # Service status panel
│   │   │   └── K8sPanel.jsx          # Node CPU + per-pod metrics
│   │   ├── hooks/
│   │   │   └── usePolling.js         # Polling + history hooks
│   │   └── lib/
│   │       └── api.js                # API client + Prometheus queries
│   ├── Dockerfile                    # K8s deploy — nginx:1.27-alpine, non-root
│   ├── Dockerfile.compose            # Docker Compose variant
│   ├── nginx.conf                    # Reverse proxy to backend
│   └── nginx.compose.conf            # Compose variant nginx config
│
├── k8s/
│   ├── namespaces.yaml               # dev / staging / prod namespaces
│   ├── base/                         # Shared manifests
│   │   ├── deployment.yaml
│   │   ├── service.yaml
│   │   ├── ingress.yaml
│   │   ├── hpa.yaml                  # CPU 70% / Memory 80%, max 10
│   │   ├── pdb.yaml                  # minAvailable: 1
│   │   ├── networkpolicy.yaml        # Zero trust
│   │   └── kustomization.yaml
│   ├── overlays/
│   │   ├── dev/                      # 1 replica, DEBUG, Never pull
│   │   ├── staging/                  # 2 replicas, INFO, IfNotPresent
│   │   └── prod/                     # 3 replicas, WARNING, Always
│   ├── frontend/
│   │   └── dashboard.yaml            # Deployment + Service + Ingress + HPA + PDB + NetPol
│   ├── gatekeeper/
│   │   ├── templates/                # ConstraintTemplates (Rego)
│   │   └── constraints/              # Policy enforcement
│   └── monitoring/
│       ├── servicemonitor.yaml       # Prometheus scrape config
│       ├── prometheusrule.yaml       # CPU / Memory / Down alerts
│       └── alertmanager.yaml         # Slack routing
│
├── monitoring/
│   └── compose/                      # Prometheus + Alertmanager configs for Docker Compose
│
├── terraform/
│   ├── backend.tf                    # S3 remote state
│   ├── vpc.tf                        # VPC, subnets, IGW, route tables
│   ├── iam.tf                        # Cluster + node group roles
│   ├── eks.tf                        # EKS cluster + node group
│   └── ecr.tf                        # ECR + lifecycle policy
│
├── tests/
│   ├── test_health.py                # 5 tests
│   ├── test_status.py                # 4 tests
│   ├── test_alerts.py                # 4 tests
│   ├── test_api.py                   # 2 smoke tests
│   └── test_recommendations.py      # 8 tests (includes anomaly scenarios)
│
├── scripts/
│   └── k3d-setup.sh
│
├── docs/
│   ├── architecture.md
│   └── setup.md
│
├── .github/
│   ├── workflows/ci.yml
│   ├── PULL_REQUEST_TEMPLATE.md
│   └── ISSUE_TEMPLATE/bug_report.md
│
├── docker-compose.yml                # Full local stack — backend + frontend + Prometheus + Grafana
├── Dockerfile                        # Backend — multi-stage, non-root
├── Makefile
├── requirements.txt
├── .env.example
└── .dockerignore
```

---

## Prerequisites

| Tool | Version | Why |
|---|---|---|
| Python | 3.12+ | Backend runtime |
| Docker | 20.0+ | Container builds |
| kubectl | 1.28+ | Cluster management |
| k3d | 5.0+ | Local Kubernetes |
| Helm | 3.0+ | Prometheus stack install |
| Node.js | 18+ | Frontend dev server |
| Terraform | 1.10+ | AWS infra (optional) |
| AWS CLI | 2.0+ | EKS access (optional) |

---

## Quickstart — Docker Compose

The fastest way to run the full stack locally — no Kubernetes needed.

```bash
git clone https://github.com/Heyyprakhar1/sentinel-ai-platform.git
cd sentinel-ai-platform

cp .env.example .env
# Set GRAFANA_ADMIN_PASSWORD in .env

docker compose up -d
```

What starts:

| Service | URL |
|---|---|
| Backend API | http://localhost:8000 |
| Frontend Dashboard | http://localhost:5173 |
| Prometheus | http://localhost:9090 |
| Grafana | http://localhost:3000 |
| Alertmanager | http://localhost:9093 |

```bash
# Check everything is up
docker compose ps

# Tail logs
docker compose logs -f sentinelai-backend

# Tear down
docker compose down
```

---

## Local Kubernetes Setup

### 1. Clone and set up Python env

```bash
git clone https://github.com/Heyyprakhar1/sentinel-ai-platform.git
cd sentinel-ai-platform

python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

### 2. Run tests

```bash
pytest tests/ -v
# 22 passed
```

### 3. Build Docker image

```bash
make build
```

### 4. Create K3d cluster and deploy

```bash
make cluster-up
make import-image

kubectl apply -f k8s/namespaces.yaml
make deploy-all
make status
```

### 5. Hit the API

```bash
curl http://localhost:8080/health
curl http://localhost:8080/recommendation
```

---

## Running the Frontend Dashboard

```bash
# Terminal 1 — backend port-forward
kubectl port-forward svc/dev-sentinelai-service 8001:80 -n sentinelai-dev

# Terminal 2 — frontend
cd frontend
npm install
VITE_API_URL=http://localhost:8001 npm run dev
```

Open `http://localhost:5173`.

For K8s pod-level metrics in the dashboard:

```bash
# Terminal 3 — Prometheus port-forward
kubectl port-forward svc/prometheus-kube-prometheus-prometheus 9090:9090 -n monitoring
```

Then restart the frontend with:

```bash
VITE_API_URL=http://localhost:8001 VITE_PROM_URL=http://localhost:9090 npm run dev
```

---

## Observability Stack

```bash
helm repo add prometheus-community https://prometheus-community.github.io/helm-charts
helm repo update

helm install prometheus prometheus-community/kube-prometheus-stack \
  --namespace monitoring \
  --create-namespace \
  --set grafana.adminPassword=sentinel@123 \
  --set prometheus.prometheusSpec.retention=7d

kubectl get pods -n monitoring -w

kubectl apply -f k8s/monitoring/servicemonitor.yaml
kubectl apply -f k8s/monitoring/prometheusrule.yaml
kubectl apply -f k8s/monitoring/alertmanager.yaml
```

| Tool | Access |
|---|---|
| Grafana | `kubectl port-forward svc/prometheus-grafana 3000:80 -n monitoring` → http://localhost:3000 (admin / sentinel@123) |
| Prometheus | `kubectl port-forward svc/prometheus-kube-prometheus-prometheus 9090:9090 -n monitoring` → http://localhost:9090 |

Grafana dashboard IDs to import: `15757` (cluster overview), `1860` (node exporter), `6417` (pod resources).

---

## AWS EKS Deployment

```bash
cd terraform
terraform init
terraform plan
terraform apply -auto-approve

# Connect kubectl
aws eks update-kubeconfig --region ap-south-1 --name sentinelai-cluster
kubectl get nodes

# Destroy when done
terraform destroy -auto-approve
```

---

## API Reference

| Endpoint | Method | Description | K8s Role |
|---|---|---|---|
| `/health` | GET | App name, version, status | Liveness probe |
| `/status` | GET | Uptime, environment | Readiness probe |
| `/metrics` | GET | Prometheus-format metrics | Scrape target |
| `/alerts` | GET | Active alerts with severity | Core workload |
| `/recommendation` | GET | Z-score + recommendation text | Core workload |

```bash
curl http://localhost:8000/health | python3 -m json.tool
curl http://localhost:8000/recommendation | python3 -m json.tool
```

---

## How the AI Anomaly Detection Works

The `/recommendation` endpoint runs a Z-score engine on the last 20 metric readings.

- Baseline activates after 5 readings
- Z-score > 2.0 → warning
- Z-score > 3.0 → critical
- Confidence (low/medium/high) derived from Z-score magnitude
- Recommendation text generated dynamically based on which metric triggered

Low confidence during the first ~30 seconds of uptime is expected — the baseline is still building.

---

## Alert Rules

| Alert | Condition | Severity |
|---|---|---|
| `SentinelAIHighCPU` | CPU > 80% for 2 minutes | warning |
| `SentinelAIHighMemory` | Memory > 85% for 2 minutes | critical |
| `SentinelAIDown` | Pod unreachable for 1 minute | critical |

Alerts route to Slack via Alertmanager. Update the webhook URL in `k8s/monitoring/alertmanager.yaml` before applying.

---

## OPA Gatekeeper Policies

| Policy | Rule |
|---|---|
| `require-non-root` | All containers must run as non-root user |
| `require-resource-limits` | CPU and memory limits required on every container |
| `ban-latest-tag` | `:latest` image tag not allowed |

---

## Environment Differences

| Property | Dev | Staging | Prod |
|---|---|---|---|
| Namespace | `sentinelai-dev` | `sentinelai-staging` | `sentinelai-prod` |
| Replicas | 1 | 2 | 3 |
| Log Level | DEBUG | INFO | WARNING |
| CPU Request / Limit | 50m / 100m | 100m / 200m | 200m / 400m |
| Memory Request / Limit | 64Mi / 128Mi | 128Mi / 256Mi | 256Mi / 512Mi |
| Image Pull Policy | Never | IfNotPresent | Always |

---

## CI/CD Pipeline

```
push to main
     │
     ▼
  test
  ├── Python 3.12
  ├── pytest — 22 tests
  └── coverage gate — 70% minimum
     │
     ├────────────────────┐
     ▼                    ▼
sonarcloud           docker-build
                          │
                          ▼
                     trivy-scan
                     CRITICAL CVE = fail
```

---

## Makefile Commands

```bash
# Docker
make build            # Build sentinelai:1.0.0
make run              # Run container on port 8000
make stop             # Stop and remove container

# Deploy
make deploy-dev       # Apply dev overlay
make deploy-staging   # Apply staging overlay
make deploy-prod      # Apply prod overlay
make deploy-all       # Apply namespaces + all overlays

# Observe
make status           # Show pods across all 3 envs
make logs-dev         # Tail dev pod logs

# Cluster
make cluster-up       # Create K3d cluster
make cluster-down     # Delete K3d cluster
make import-image     # Load Docker image into K3d

# Cleanup
make clean            # Delete all deployments
```

---

## Troubleshooting

**Dashboard shows "CONNECTING..."**
Port-forward not running. Run:
```bash
kubectl port-forward svc/dev-sentinelai-service 8001:80 -n sentinelai-dev
```
Restart frontend with `VITE_API_URL=http://localhost:8001`.

**K8s panel shows "Loading pod data..."**
Prometheus port-forward not active:
```bash
kubectl port-forward svc/prometheus-kube-prometheus-prometheus 9090:9090 -n monitoring
```

**Pods stuck in Pending after Helm install**
Usually a PVC issue on K3d:
```bash
kubectl get pvc -n monitoring
kubectl describe pod <stuck-pod> -n monitoring
```

**OPA blocks your manifest**
The error will say exactly which policy failed. Fix the manifest — add resource limits, set non-root user, or change image tag.

**Terraform apply fails on EKS**
Usually an IAM permissions issue. Your AWS CLI user needs `eks:*`, `ec2:*`, `iam:PassRole`, `iam:CreateRole`.

---

## Roadmap

| Phase | What | Status |
|---|---|---|
| 1 | FastAPI backend — endpoints, schemas, service layer | ✅ Complete |
| 2 | Docker — multi-stage, non-root, slim image | ✅ Complete |
| 3 | Local Kubernetes — K3d, multi-env, Kustomize, Ingress | ✅ Complete |
| 4 | Repo structure, Makefile, GitHub templates | ✅ Complete |
| 5 | GitHub Actions CI/CD — test, SonarCloud, Trivy | ✅ Complete |
| 6 | DevSecOps — SonarCloud quality gate, Trivy CVE gate, OPA Gatekeeper | ✅ Complete |
| 7 | AWS EKS via Terraform — VPC, EKS, ECR, IAM, S3 state | ✅ Complete |
| 8 | Observability — Prometheus, Grafana, Alertmanager, HPA, PDB, NetworkPolicy | ✅ Complete |
| 9 | AI anomaly detection — Z-score engine, dynamic recommendations | ✅ Complete |
| 10 | React dashboard — live metrics, anomaly feed, K8s panel | ✅ Complete |

---

<div align="center">

**Prakhar Srivastava** — DevOps Engineer

[LinkedIn](https://www.linkedin.com/in/heyyprakhar1/) · [Portfolio](https://prakharsrivastava-devops.netlify.app) · [Hashnode](https://hashnode.com/@heyyprakhar01)

</div>
