<div align="center">

# SentinelAI 🛡️

**AI-Powered DevSecOps Monitoring Platform**

[![CI](https://github.com/Heyyprakhar1/sentinel-ai-platform/actions/workflows/ci.yml/badge.svg)](https://github.com/Heyyprakhar1/sentinel-ai-platform/actions/workflows/ci.yml)
[![Security](https://github.com/Heyyprakhar1/sentinel-ai-platform/actions/workflows/security.yml/badge.svg)](https://github.com/Heyyprakhar1/sentinel-ai-platform/actions/workflows/security.yml)
[![Quality Gate Status](https://sonarcloud.io/api/project_badges/measure?project=Heyyprakhar1_sentinel-ai-platform&metric=alert_status)](https://sonarcloud.io/summary/new_code?id=Heyyprakhar1_sentinel-ai-platform)

![Python](https://img.shields.io/badge/Python-3.12-3776AB?style=flat-square&logo=python&logoColor=white)
![FastAPI](https://img.shields.io/badge/FastAPI-0.136-009688?style=flat-square&logo=fastapi&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-multi--stage-2496ED?style=flat-square&logo=docker&logoColor=white)
![Kubernetes](https://img.shields.io/badge/Kubernetes-K3d%20%2B%20EKS-326CE5?style=flat-square&logo=kubernetes&logoColor=white)
![Terraform](https://img.shields.io/badge/Terraform-1.15-7B42BC?style=flat-square&logo=terraform&logoColor=white)
![React](https://img.shields.io/badge/React-18-61DAFB?style=flat-square&logo=react&logoColor=white)
![AWS](https://img.shields.io/badge/AWS-EKS%20%2B%20ECR-FF9900?style=flat-square&logo=amazonaws&logoColor=white)

</div>

---

## What Is This

SentinelAI is a production-style DevSecOps platform built from scratch — FastAPI backend, React dashboard, full Kubernetes deployment across dev/staging/prod environments, AWS EKS infrastructure via Terraform, and two independent CI pipelines running on every push.

The backend is Kubernetes-native from day one: health probes, Prometheus metrics endpoint, structured JSON logging, typed service layer. On top of that: a Z-score anomaly detection engine, a kube-prometheus-stack observability setup, and a React dashboard pulling live metrics from both the API and Prometheus.

This is not a tutorial project. Every decision — Kustomize overlay structure, probe design, multi-env separation, securityContext enforcement, OPA admission policies — reflects how production teams actually run services.

---

## Architecture

### Local — K3d

```
Developer Workstation (WSL2 / Ubuntu)
              │
              ▼
  FastAPI Backend (Python 3.12)
  ┌────────────────────────────────┐
  │  /health  /status   /metrics  │  ← Kubernetes probe-ready
  │  /alerts  /recommendation     │  ← Core workload
  └────────────────────────────────┘
              │
              ▼
  Docker Image — multi-stage, non-root, python:3.12-slim
              │
              ▼
  K3d Cluster — 1 server + 2 agents
              │
              ▼
  Traefik Ingress → localhost:8080
              │
    ┌─────────┼──────────┐
    ▼         ▼          ▼
sentinelai  sentinelai  sentinelai
  -dev       -staging    -prod
 1 replica  2 replicas  3 replicas
```

### Production — AWS EKS via Terraform

```
GitHub Push
     │
     ├─────────────────────────────────────────────────────────────┐
     ▼                                                             ▼
CI Pipeline (ci.yml)                          Security Pipeline (security.yml)
├── pytest — 23 tests, 89% coverage           ├── bandit      — Python SAST
├── coverage gate — 70% minimum               ├── pip-audit   — Python CVEs
├── SonarCloud — static analysis              ├── npm audit   — JS vulnerabilities
└── docker-build                              ├── hadolint    — 3 Dockerfiles
     └── trivy-scan (CRITICAL = fail)         ├── shellcheck  — shell scripts
                                              └── gitleaks    — full git history
     │
     ▼
Amazon ECR
     │
     ▼
AWS EKS v1.35 (ap-south-1)
     ├── VPC — 2 public + 2 private subnets
     ├── Node Group — t3.medium × 2
     │
     ├── Admission Control
     │   ├── OPA Gatekeeper — 3 policies (non-root, resource limits, no latest tag)
     │   └── NetworkPolicy — zero trust ingress/egress
     │
     ├── Observability
     │   ├── kube-prometheus-stack (Helm)
     │   ├── ServiceMonitor — scrapes /metrics
     │   ├── PrometheusRule — CPU / Memory / Down alerts
     │   ├── Alertmanager — Slack routing
     │   ├── Grafana — cluster + app dashboards
     │   ├── HPA — scales 2–10 replicas on CPU/memory
     │   └── PDB — minAvailable: 1
     │
     ├── AI Layer
     │   └── Z-score anomaly engine (20-reading rolling baseline)
     │
     └── React Dashboard
         └── Live metrics + K8s pod panel via Prometheus API
```

---

## Tech Stack

| Layer | Technology | Status |
|---|---|---|
| Backend | Python 3.12, FastAPI 0.136, Uvicorn | ✅ |
| Containerization | Docker — multi-stage, non-root, python:3.12-slim | ✅ |
| Local Dev Stack | Docker Compose — backend + frontend + Prometheus + Grafana + Alertmanager | ✅ |
| Orchestration | Kubernetes — K3d (local), AWS EKS v1.35 (prod) | ✅ |
| Config Management | Kustomize — base + dev/staging/prod overlays | ✅ |
| Automation | Makefile | ✅ |
| CI Pipeline | GitHub Actions — pytest + SonarCloud + Trivy | ✅ |
| Security Pipeline | GitHub Actions — Bandit + pip-audit + npm audit + Hadolint + ShellCheck + Gitleaks | ✅ |
| Code Quality | SonarCloud — quality gate | ✅ |
| Image Security | Trivy — CRITICAL CVE fail gate | ✅ |
| Python SAST | Bandit — 0 medium/high issues | ✅ |
| Dependency Audit | pip-audit (Python) + npm audit (JS) | ✅ |
| Dockerfile Lint | Hadolint — backend + 2 frontend Dockerfiles | ✅ |
| Shell Analysis | ShellCheck | ✅ |
| Secret Scanning | Gitleaks — full git history on every push | ✅ |
| Admission Control | OPA Gatekeeper — 3 Rego policies | ✅ |
| Infrastructure as Code | Terraform v1.15 — VPC, EKS, ECR, IAM, S3 state | ✅ |
| Container Registry | Amazon ECR | ✅ |
| Metrics | Prometheus + ServiceMonitor | ✅ |
| Dashboards | Grafana — cluster overview + custom app dashboard | ✅ |
| Alerting | PrometheusRule + Alertmanager — Slack routing | ✅ |
| Autoscaling | HPA — CPU 70% / Memory 80%, min 2 / max 10 | ✅ |
| Resilience | PodDisruptionBudget — minAvailable: 1 | ✅ |
| Network Security | NetworkPolicy — zero trust | ✅ |
| Pod Security | securityContext — runAsNonRoot, readOnlyRootFilesystem, no privilege escalation | ✅ |
| AI Layer | Z-score anomaly detection + dynamic recommendations | ✅ |
| Frontend | React 18 + Vite — live metrics dashboard | ✅ |
| GitOps | ArgoCD — continuous deployment | 🔄 In Progress |

---

## Project Structure

```
sentinel-ai-platform/
│
├── app/                              # FastAPI application
│   ├── main.py                       # App entry point + lifespan
│   ├── api/routes/
│   │   ├── health.py                 # GET /health  ← liveness probe
│   │   ├── metrics.py                # GET /metrics ← Prometheus scrape
│   │   ├── alerts.py                 # GET /alerts
│   │   └── recommendations.py       # GET /recommendation ← AI layer
│   ├── core/
│   │   ├── config.py                 # Pydantic-settings env config
│   │   └── logging_config.py         # Structured JSON stdout logging
│   ├── models/schemas.py             # Pydantic data contracts
│   └── services/
│       ├── alert_service.py          # UUID alert IDs, real CPU readings
│       ├── recommendation_service.py
│       └── anomaly_detector.py       # Z-score engine — 20-reading baseline
│
├── frontend/                         # React + Vite dashboard
│   ├── src/
│   │   ├── components/
│   │   │   ├── StatusBar.jsx         # Live health status bar
│   │   │   ├── MetricCard.jsx        # CPU / Memory / Uptime cards
│   │   │   ├── MetricsChart.jsx      # 2.5min rolling time-series
│   │   │   ├── AlertsFeed.jsx        # Live alert feed
│   │   │   ├── AnomalyPanel.jsx      # Z-score gauge + recommendation
│   │   │   ├── StatusDetails.jsx     # Service status panel
│   │   │   └── K8sPanel.jsx          # Node CPU + per-pod metrics via Prometheus
│   │   ├── hooks/usePolling.js       # Polling + history state hooks
│   │   └── lib/api.js                # API client + Prometheus query builder
│   ├── Dockerfile                    # K8s deploy — nginx:1.27-alpine, non-root
│   ├── Dockerfile.compose            # Docker Compose variant
│   ├── nginx.conf                    # Reverse proxy config
│   └── package-lock.json             # Pinned deps — deterministic CI installs
│
├── k8s/
│   ├── namespaces.yaml               # dev / staging / prod
│   ├── base/                         # Shared manifests
│   │   ├── deployment.yaml           # securityContext — non-root, readOnly FS
│   │   ├── service.yaml
│   │   ├── ingress.yaml
│   │   ├── hpa.yaml                  # CPU 70% / Memory 80%, max 10 replicas
│   │   ├── pdb.yaml                  # minAvailable: 1
│   │   ├── networkpolicy.yaml        # Zero trust
│   │   └── kustomization.yaml
│   ├── overlays/
│   │   ├── dev/                      # namePrefix: dev-, 1 replica, DEBUG, Never pull
│   │   ├── staging/                  # namePrefix: staging-, 2 replicas, INFO
│   │   └── prod/                     # namePrefix: prod-, 3 replicas, WARNING, Always
│   ├── frontend/dashboard.yaml       # Frontend Deployment + Service + Ingress
│   ├── gatekeeper/
│   │   ├── templates/                # ConstraintTemplates (Rego)
│   │   │   ├── require-nonroot.yaml
│   │   │   ├── require-resource-limits.yaml
│   │   │   └── ban-latest-tag.yaml
│   │   └── constraints/
│   └── monitoring/
│       ├── servicemonitor.yaml       # Prometheus scrape config
│       ├── prometheusrule.yaml       # CPU / Memory / Down alert rules
│       └── alertmanager.yaml         # Slack routing config
│
├── terraform/
│   ├── backend.tf                    # S3 remote state + DynamoDB lock
│   ├── vpc.tf                        # VPC, public/private subnets, IGW, NAT
│   ├── iam.tf                        # EKS cluster + node group IAM roles
│   ├── eks.tf                        # EKS cluster v1.35 + managed node group
│   ├── ecr.tf                        # ECR repo + lifecycle policy
│   ├── variables.tf
│   └── outputs.tf
│
├── tests/
│   ├── test_health.py                # 5 tests — health endpoint
│   ├── test_status.py                # 4 tests — status endpoint
│   ├── test_alerts.py                # 4 tests — alerts + UUID IDs
│   ├── test_recommendations.py       # 8 tests — Z-score + anomaly scenarios
│   └── test_api.py                   # 2 smoke tests — all endpoints reachable
│
├── monitoring/compose/               # Prometheus + Alertmanager configs for Compose
├── scripts/k3d-setup.sh              # Cluster setup + teardown script
├── docs/
│   ├── architecture.md
│   └── setup.md
│
├── .github/
│   ├── workflows/
│   │   ├── ci.yml                    # Test + SonarCloud + docker-build + Trivy
│   │   └── security.yml              # Bandit + pip-audit + npm audit + Hadolint + ShellCheck + Gitleaks
│   ├── PULL_REQUEST_TEMPLATE.md
│   └── ISSUE_TEMPLATE/bug_report.md
│
├── docker-compose.yml                # Full local stack
├── Dockerfile                        # Backend — multi-stage, non-root
├── Makefile                          # All common commands
├── requirements.txt                  # Pinned Python deps
├── .env.example                      # Environment variable template
├── .gitleaksignore                   # Documented suppression — rotated example credential
└── .dockerignore
```

---

## Prerequisites

| Tool | Version | Purpose |
|---|---|---|
| Python | 3.12+ | Backend runtime |
| Docker | 20.0+ | Image builds |
| kubectl | 1.28+ | Cluster management |
| k3d | 5.0+ | Local Kubernetes |
| Helm | 3.0+ | Prometheus stack |
| Node.js | 18+ | Frontend dev server |
| Terraform | 1.10+ | AWS infra (optional) |
| AWS CLI | 2.0+ | EKS access (optional) |

---

## Quickstart — Docker Compose

Fastest way to run the full stack locally. No Kubernetes needed.

```bash
git clone https://github.com/Heyyprakhar1/sentinel-ai-platform.git
cd sentinel-ai-platform

cp .env.example .env
# Edit .env — set GRAFANA_ADMIN_PASSWORD

docker compose up -d
docker compose ps
```

| Service | URL |
|---|---|
| Backend API | http://localhost:8000 |
| Swagger UI | http://localhost:8000/docs |
| Frontend Dashboard | http://localhost:5173 |
| Prometheus | http://localhost:9090 |
| Grafana | http://localhost:3000 |
| Alertmanager | http://localhost:9093 |

```bash
docker compose logs -f sentinelai-backend
docker compose down
```

---

## Local Kubernetes Setup

### 1. Clone + Python env

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
# 23 passed

pytest tests/ --cov=app --cov-report=term
# 89% coverage
```

### 3. Build + cluster

```bash
make build
make cluster-up
make import-image
```

### 4. Deploy all environments

```bash
kubectl apply -f k8s/namespaces.yaml
make deploy-all
make status
```

### 5. Verify

```bash
curl http://localhost:8080/health
curl http://localhost:8080/alerts
curl http://localhost:8080/recommendation
```

---

## Frontend Dashboard

```bash
# Terminal 1 — backend
kubectl port-forward svc/dev-sentinelai-service 8001:80 -n sentinelai-dev

# Terminal 2 — dashboard
cd frontend && npm install
VITE_API_URL=http://localhost:8001 npm run dev
# Open http://localhost:5173
```

For K8s pod metrics in the dashboard:

```bash
# Terminal 3 — Prometheus
kubectl port-forward svc/prometheus-kube-prometheus-prometheus 9090:9090 -n monitoring

# Restart frontend with both vars
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

kubectl apply -f k8s/monitoring/servicemonitor.yaml
kubectl apply -f k8s/monitoring/prometheusrule.yaml
kubectl apply -f k8s/monitoring/alertmanager.yaml
```

| Tool | Access |
|---|---|
| Grafana | `kubectl port-forward svc/prometheus-grafana 3000:80 -n monitoring` → http://localhost:3000 |
| Prometheus | `kubectl port-forward svc/prometheus-kube-prometheus-prometheus 9090:9090 -n monitoring` → http://localhost:9090 |

Grafana dashboard IDs to import: `15757` (cluster overview), `1860` (node exporter), `6417` (pod resources).

---

## AWS EKS Deployment

```bash
cd terraform
terraform init
terraform plan
terraform apply -auto-approve

aws eks update-kubeconfig --region ap-south-1 --name sentinelai-cluster
kubectl get nodes
```

```bash
# Teardown
terraform destroy -auto-approve
```

---

## CI/CD Pipelines

Two pipelines run in parallel on every push to `main`. Both must pass — nothing merges if either fails.

### CI Pipeline (`ci.yml`)

```
push to main
     │
     ▼
  test
  ├── Python 3.12
  ├── pytest — 23 tests
  └── coverage gate — 70% minimum (currently 89%)
     │
     ├──────────────────┐
     ▼                  ▼
sonarcloud         docker-build
quality gate            │
                        ▼
                   trivy-scan
                   CRITICAL CVE = fail
```

### Security Pipeline (`security.yml`)

```
push to main
     │
     ├── python-security  →  bandit (app/)  +  pip-audit (requirements.txt)
     ├── js-security      →  npm audit --audit-level=high (frontend/)
     ├── dockerfile-lint  →  hadolint (Dockerfile, frontend/Dockerfile, frontend/Dockerfile.compose)
     ├── shell-check      →  shellcheck (scripts/)
     └── secret-scan      →  gitleaks (full git history, fetch-depth: 0)
```

---

## API Reference

| Endpoint | Method | Description | Kubernetes Role |
|---|---|---|---|
| `/health` | GET | App name, version, uptime | Liveness probe |
| `/status` | GET | Runtime status, environment | Readiness probe |
| `/metrics` | GET | Prometheus-format metrics | Scrape target |
| `/alerts` | GET | Active alerts with UUID IDs + severity | Core workload |
| `/recommendation` | GET | Z-score anomaly score + recommendation text | Core workload |

```bash
# Quick checks
curl http://localhost:8000/health | python3 -m json.tool
curl http://localhost:8000/recommendation | python3 -m json.tool
```

---

## How the Anomaly Detection Works

The `/recommendation` endpoint runs a Z-score engine on a rolling window of the last 20 metric readings.

```
Reading arrives
     │
     ▼
Buffer (max 20 readings)
     │
     ├── < 5 readings → warming_up: true, confidence: low
     │
     └── ≥ 5 readings → calculate mean + std dev
               │
               ▼
          Z-score = (current - mean) / std_dev
               │
               ├── Z > 3.0 → severity: critical
               ├── Z > 2.0 → severity: warning
               └── Z ≤ 2.0 → severity: info
```

Alert IDs are UUID-based (`alert-cpu-critical-a3f9b2c1`) — safe to pipe into PagerDuty, OpsGenie, or any deduplication system without collision.

---

## Alert Rules

| Alert | Fires When | Severity |
|---|---|---|
| `SentinelAIHighCPU` | CPU > 80% for 2 minutes | warning |
| `SentinelAIHighMemory` | Memory > 85% for 2 minutes | critical |
| `SentinelAIDown` | Pod unreachable for 1 minute | critical |

Routes to Slack via Alertmanager. Update the webhook URL in `k8s/monitoring/alertmanager.yaml` before applying.

---

## OPA Gatekeeper Policies

Enforced at admission time — any manifest violating these is rejected at `kubectl apply`.

| Policy | Rule |
|---|---|
| `require-non-root` | All containers must run as non-root user |
| `require-resource-limits` | CPU + memory limits required on every container |
| `ban-latest-tag` | `:latest` image tag rejected |

---

## Security Hardening

| Area | Implementation |
|---|---|
| Container user | Non-root (`sentinel` user, UID 1000) |
| K8s pod spec | `runAsNonRoot: true`, `readOnlyRootFilesystem: true`, `allowPrivilegeEscalation: false` |
| Secrets | No secrets in code — env vars + GitHub Secrets only |
| Python code | Bandit SAST — 0 medium/high findings |
| Python deps | pip-audit — CVEs fixed (starlette 1.0.0 → 1.0.1) |
| JS deps | npm audit — 0 high/critical vulnerabilities |
| Dockerfiles | Hadolint — all 3 Dockerfiles clean |
| Shell scripts | ShellCheck — 0 warnings |
| Git history | Gitleaks — full history scanned on every push |
| Image scanning | Trivy — CRITICAL CVEs block registry push |
| Alert IDs | UUID-based — deduplication-safe |

---

## Environment Matrix

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
```bash
kubectl port-forward svc/dev-sentinelai-service 8001:80 -n sentinelai-dev
# Restart frontend with VITE_API_URL=http://localhost:8001
```

**K8s panel shows "Loading pod data..."**
```bash
kubectl port-forward svc/prometheus-kube-prometheus-prometheus 9090:9090 -n monitoring
```

**Pods stuck in Pending after Helm install**
```bash
kubectl get pvc -n monitoring
kubectl describe pod <pod-name> -n monitoring
# Usually a storage class issue on K3d — PVC can't bind
```

**OPA blocks your manifest**
The rejection message names the exact policy that failed. Either add resource limits, set `runAsNonRoot`, or fix the image tag.

**`warming_up: true` in /recommendation**
Expected. Z-score engine needs 5 readings (~30s of uptime) before baseline is ready.

**Gitleaks fails on CI**
Check `.gitleaksignore` — if you've added new example credentials, document and suppress them there. Never suppress without a comment explaining why.

**Terraform apply fails**
Your AWS CLI user needs: `eks:*`, `ec2:*`, `iam:PassRole`, `iam:CreateRole`, `ecr:*`, `s3:*`.

---

## Roadmap

| Phase | What | Status |
|---|---|---|
| 1 | FastAPI backend — endpoints, schemas, typed service layer | ✅ Complete |
| 2 | Docker — multi-stage, non-root, python:3.12-slim | ✅ Complete |
| 3 | Local Kubernetes — K3d, multi-env, Kustomize, Traefik Ingress | ✅ Complete |
| 4 | Repo structure — Makefile, GitHub templates, PR/issue templates | ✅ Complete |
| 5 | CI pipeline — pytest, SonarCloud quality gate, Trivy CVE gate | ✅ Complete |
| 6 | DevSecOps — OPA Gatekeeper (3 Rego policies), NetworkPolicy | ✅ Complete |
| 7 | AWS EKS via Terraform — VPC, EKS, ECR, IAM, S3 remote state | ✅ Complete |
| 8 | Observability — kube-prometheus-stack, Grafana, Alertmanager, HPA, PDB | ✅ Complete |
| 9 | AI layer — Z-score anomaly engine, dynamic recommendations | ✅ Complete |
| 10 | React dashboard — live metrics, anomaly panel, K8s pod panel | ✅ Complete |
| 11 | Security hardening — securityContext, UUID alert IDs, CVE fixes, full security pipeline | ✅ Complete |
| 12 | GitOps — ArgoCD continuous deployment | 🔄 In Progress |

---

## Contributing

```bash
git clone https://github.com/<your-username>/sentinel-ai-platform.git
git checkout -b feat/your-feature
```

Before submitting a PR:
- `pytest tests/ --cov=app --cov-fail-under=70` must pass
- `make deploy-all && make status` — all 3 envs healthy
- New endpoint = new tests
- New K8s manifest = must pass OPA admission policies

---

<div align="center">

**Prakhar Srivastava** — DevOps Engineer

[LinkedIn](https://www.linkedin.com/in/heyyprakhar1/) · [Portfolio](https://prakharsrivastava-devops.netlify.app) · [Hashnode](https://hashnode.com/@heyyprakhar01)

</div>
