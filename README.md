<div align="center">

# SentinelAI 🛡️

**AI-Powered DevSecOps Monitoring Platform**

![Python](https://img.shields.io/badge/Python-3.12-blue?style=flat-square&logo=python)
![FastAPI](https://img.shields.io/badge/FastAPI-0.100+-green?style=flat-square&logo=fastapi)
![Docker](https://img.shields.io/badge/Docker-29.4-blue?style=flat-square&logo=docker)
![Kubernetes](https://img.shields.io/badge/Kubernetes-1.31-blue?style=flat-square&logo=kubernetes)
![Terraform](https://img.shields.io/badge/Terraform-1.15-purple?style=flat-square&logo=terraform)
![AWS EKS](https://img.shields.io/badge/AWS-EKS-orange?style=flat-square&logo=amazonaws)
![GitHub Actions](https://img.shields.io/badge/CI%2FCD-GitHub_Actions-black?style=flat-square&logo=githubactions)
[![CI](https://github.com/Heyyprakhar1/sentinel-ai-platform/actions/workflows/ci.yml/badge.svg)](https://github.com/Heyyprakhar1/sentinel-ai-platform/actions/workflows/ci.yml)
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
     ├── pytest (21 tests)
     ├── SonarCloud — static analysis
     ├── Trivy — CRITICAL CVE gate
     └── OPA Gatekeeper — policy enforcement
     │
     ▼
Amazon ECR
     │
     ▼
AWS EKS v1.35 (ap-south-1)
     ├── VPC — 2 public + 2 private subnets
     ├── Node Group — t3.medium × 2
     │
     ├── Observability
     │   ├── kube-prometheus-stack (Helm)
     │   ├── ServiceMonitor — scrapes /metrics
     │   ├── PrometheusRule — 3 alert rules
     │   ├── Alertmanager — Slack routing
     │   ├── Grafana — cluster + app dashboards
     │   ├── HPA — scales 2–10 replicas
     │   ├── PDB — minAvailable: 1
     │   └── NetworkPolicy — zero trust
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
| Frontend | React + Vite — live metrics dashboard | ✅ Done |

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
│       └── anomaly_detector.py       # Z-score engine (Phase 9)
│
├── frontend/                         # React dashboard (Phase 10)
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
│   ├── Dockerfile                    # nginx:1.27-alpine, non-root
│   └── nginx.conf                    # Reverse proxy to backend
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
│   │   └── dashboard.yaml            # Dashboard Deployment + Service + Ingress + HPA + PDB + NetPol
│   ├── gatekeeper/
│   │   ├── templates/                # ConstraintTemplates (Rego)
│   │   │   ├── require-nonroot.yaml
│   │   │   ├── require-resource-limits.yaml
│   │   │   └── ban-latest-tag.yaml
│   │   └── constraints/              # Policy enforcement
│   └── monitoring/
│       ├── servicemonitor.yaml       # Prometheus scrape config
│       ├── prometheusrule.yaml       # CPU / Memory / Down alerts
│       └── alertmanager.yaml         # Slack routing
│
├── terraform/
│   ├── backend.tf                    # S3 remote state
│   ├── main.tf
│   ├── variables.tf
│   ├── outputs.tf
│   ├── vpc.tf                        # VPC, subnets, IGW, route tables
│   ├── iam.tf                        # Cluster + node group roles
│   ├── eks.tf                        # EKS cluster + node group
│   └── ecr.tf                        # ECR + lifecycle policy
│
├── tests/
│   ├── test_health.py                # 5 tests
│   ├── test_status.py                # 4 tests
│   ├── test_alerts.py                # 4 tests
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
│   ├── workflows/
│   │   └── ci.yml
│   ├── PULL_REQUEST_TEMPLATE.md
│   └── ISSUE_TEMPLATE/
│       └── bug_report.md
│
├── Dockerfile                        # Backend — multi-stage, non-root
├── Makefile
├── requirements.txt
├── .env.example
└── .dockerignore
```

---

## Prerequisites

Before you start, make sure these are installed:

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

## Local Setup — Step by Step

### 1. Clone the repo

```bash
git clone https://github.com/Heyyprakhar1/sentinel-ai-platform.git
cd sentinel-ai-platform
```

### 2. Set up Python environment

```bash
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

### 3. Run the backend locally (no Docker needed)

```bash
uvicorn app.main:app --reload --port 8000
```

Swagger UI will be live at `http://localhost:8000/docs` — you can hit all endpoints from there.

### 4. Run tests

```bash
pytest tests/ -v
# Should see 21 passed
```

### 5. Build Docker image

```bash
make build
# Builds sentinelai:1.0.0
```

### 6. Create K3d cluster

```bash
make cluster-up
# Script will prompt for cluster name
```

### 7. Import image and deploy

```bash
make import-image

kubectl apply -f k8s/namespaces.yaml
make deploy-all
```

### 8. Verify everything is running

```bash
make status
# Shows all 3 environments

curl http://localhost:8080/health
curl http://localhost:8080/alerts
curl http://localhost:8080/recommendation
```

---

## Running the Frontend Dashboard

The dashboard connects to the backend and Prometheus. You need both running first.

### Step 1 — Port-forward the backend

```bash
kubectl port-forward svc/dev-sentinelai-service 8001:80 -n sentinelai-dev
# Keep this terminal open
```

### Step 2 — Start the dashboard

```bash
cd frontend
npm install
VITE_API_URL=http://localhost:8001 npm run dev
```

Open `http://localhost:5173` — you'll see live CPU, memory, anomaly scores, and alerts.

### Step 3 — Add K8s metrics (optional)

If you also want pod-level metrics from Prometheus:

```bash
# In a separate terminal
kubectl port-forward svc/prometheus-kube-prometheus-prometheus 9090:9090 -n monitoring
```

Then restart the dashboard with:

```bash
VITE_API_URL=http://localhost:8001 VITE_PROM_URL=http://localhost:9090 npm run dev
```

The K8s Resources panel at the bottom will populate with node CPU and per-pod bars.

---

## Setting Up the Observability Stack

```bash
# Add Prometheus community Helm repo
helm repo add prometheus-community https://prometheus-community.github.io/helm-charts
helm repo update

# Install kube-prometheus-stack
helm install prometheus prometheus-community/kube-prometheus-stack \
  --namespace monitoring \
  --create-namespace \
  --set grafana.adminPassword=sentinel@123 \
  --set prometheus.prometheusSpec.retention=7d

# Wait for pods to be ready
kubectl get pods -n monitoring -w

# Apply SentinelAI monitoring manifests
kubectl apply -f k8s/monitoring/servicemonitor.yaml
kubectl apply -f k8s/monitoring/prometheusrule.yaml
kubectl apply -f k8s/monitoring/alertmanager.yaml
```

Access Grafana:

```bash
kubectl port-forward svc/prometheus-grafana 3000:80 -n monitoring
# http://localhost:3000 → admin / sentinel@123
```

Access Prometheus:

```bash
kubectl port-forward svc/prometheus-kube-prometheus-prometheus 9090:9090 -n monitoring
# http://localhost:9090
```

Grafana dashboard IDs to import: `15757` (cluster overview), `1860` (node exporter), `6417` (pod resources).

---

## AWS EKS Deployment (Terraform)

This is optional — the whole platform runs fine locally on K3d. EKS is Phase 7 and costs money to run.

```bash
cd terraform

# Initialize — downloads providers, configures S3 backend
terraform init

# Preview what will be created
terraform plan

# Create everything (~10 minutes)
terraform apply -auto-approve
```

What gets created: VPC, subnets, EKS cluster (v1.35), node group (t3.medium × 2), ECR repository, IAM roles, S3 remote state.

Connect kubectl to the new cluster:

```bash
aws eks update-kubeconfig --region ap-south-1 --name sentinelai-cluster
kubectl get nodes
# Should see 2 nodes in Ready state
```

When you're done:

```bash
terraform destroy -auto-approve
```

---

## API Endpoints

| Endpoint | Method | Description | Kubernetes Role |
|---|---|---|---|
| `/health` | GET | Liveness check — returns app name, version, status | Liveness probe |
| `/status` | GET | Readiness check — returns uptime, environment | Readiness probe |
| `/metrics` | GET | Prometheus-format metrics | Scrape target |
| `/alerts` | GET | Active alert feed with severity levels | Core workload |
| `/recommendation` | GET | AI anomaly score + recommendation text | Core workload |

Quick test once running:

```bash
curl http://localhost:8000/health | python3 -m json.tool
curl http://localhost:8000/recommendation | python3 -m json.tool
```

---

## How the AI Anomaly Detection Works

The `/recommendation` endpoint runs a Z-score engine on the last 20 metric readings.

- Baseline kicks in after 5 readings (before that, confidence is low)
- Z-score above 2.0 → warning
- Z-score above 3.0 → critical
- Confidence level (low/medium/high) derived from Z-score magnitude
- Recommendation text is generated dynamically based on which metric triggered

This means the first minute of uptime will show low confidence — that's expected, not a bug.

---

## Alert Rules

| Alert | Fires When | Severity |
|---|---|---|
| `SentinelAIHighCPU` | CPU > 80% for 2 minutes | warning |
| `SentinelAIHighMemory` | Memory > 85% for 2 minutes | critical |
| `SentinelAIDown` | Pod unreachable for 1 minute | critical |

Alerts route to Slack via Alertmanager — `#sentinelai-alerts` for warnings, `#sentinelai-critical` for critical. Update the webhook URL in `k8s/monitoring/alertmanager.yaml` before applying.

---

## OPA Gatekeeper Policies

Three admission policies are enforced across all SentinelAI namespaces. Any manifest that violates these gets rejected at apply time.

| Policy | Rule |
|---|---|
| `require-non-root` | All containers must run as non-root user |
| `require-resource-limits` | CPU and memory limits are required on every container |
| `ban-latest-tag` | `:latest` image tag is not allowed |

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
make status-dev       # Dev only
make logs-dev         # Tail dev pod logs

# Cluster
make cluster-up       # Create K3d cluster
make cluster-down     # Delete K3d cluster
make import-image     # Load Docker image into K3d

# Cleanup
make clean            # Delete all deployments
```

---

## CI/CD Pipeline

```
push to main
     │
     ▼
  test
  ├── Python 3.12
  └── pytest — 21 tests
     │
     ├────────────────────┐
     ▼                    ▼
sonarcloud           docker-build
                          │
                          ▼
                     trivy-scan
                     CRITICAL CVE = fail
```

Branch protection is on — nothing merges without all jobs passing.

---

## Useful kubectl Commands

```bash
# Cluster health
kubectl get nodes
kubectl get pods -A | grep sentinelai

# Per environment
kubectl get all -n sentinelai-dev
kubectl get all -n sentinelai-staging
kubectl get all -n sentinelai-prod

# Autoscaling + resilience
kubectl get hpa -n sentinelai-dev
kubectl get pdb -n sentinelai-dev
kubectl get networkpolicy -n sentinelai-dev

# OPA policies
kubectl get constrainttemplates
kubectl get requirenonroot
kubectl get requireresourcelimits
kubectl get banlatesttag

# Observability
kubectl get servicemonitor -n monitoring
kubectl get prometheusrule -n monitoring

# Logs
kubectl logs -l app=sentinelai -n sentinelai-dev --tail=50

# Debug a pod
kubectl describe pod <pod-name> -n sentinelai-dev

# Port-forward (alternative to Ingress)
kubectl port-forward -n sentinelai-dev svc/dev-sentinelai-service 9000:80
```

---

## Troubleshooting

**Dashboard shows "CONNECTING..." and no data**
Port-forward is either not running or using the wrong port. Check:
```bash
kubectl port-forward svc/dev-sentinelai-service 8001:80 -n sentinelai-dev
```
Then restart the frontend with `VITE_API_URL=http://localhost:8001`.

**K8s panel shows "Loading pod data..."**
Prometheus port-forward is not active. Run:
```bash
kubectl port-forward svc/prometheus-kube-prometheus-prometheus 9090:9090 -n monitoring
```

**Pods stuck in Pending after Helm install**
Usually a PVC issue on K3d. Check:
```bash
kubectl get pvc -n monitoring
kubectl describe pod <stuck-pod> -n monitoring
```

**OPA blocks your manifest**
Read the error message — it will say exactly which policy failed. Fix the manifest (add resource limits, set non-root user, change image tag).

**Terraform apply fails on EKS**
Usually an IAM permissions issue. Make sure your AWS CLI user has `eks:*`, `ec2:*`, `iam:PassRole`, and `iam:CreateRole`.

---

## Contributing

Contributions are welcome. The project has a clear structure so it's easy to know where things go.

### Getting started

```bash
# Fork the repo, then clone your fork
git clone https://github.com/<your-username>/sentinel-ai-platform.git
cd sentinel-ai-platform

# Create a branch
git checkout -b feat/your-feature
```

### Before submitting a PR

```bash
# Run tests
pytest tests/ -v

# Make sure existing environments still work
make deploy-all
make status
```

### PR guidelines

- Use the PR template in `.github/PULL_REQUEST_TEMPLATE.md`
- Keep PRs focused — one thing per PR
- If you're adding a new endpoint, add tests for it
- If you're adding a new K8s manifest, make sure it passes OPA policies

### Found a bug?

Open an issue using the bug report template in `.github/ISSUE_TEMPLATE/bug_report.md`. Include what you expected, what happened, and the relevant logs.

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
