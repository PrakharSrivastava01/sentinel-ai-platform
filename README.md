<div align="center">

# SentinelAI🛡️

**AI-Powered DevSecOps Monitoring Platform**

![Python](https://img.shields.io/badge/Python-3.12-blue?style=flat-square&logo=python)
![FastAPI](https://img.shields.io/badge/FastAPI-0.100+-green?style=flat-square&logo=fastapi)
![Docker](https://img.shields.io/badge/Docker-29.4-blue?style=flat-square&logo=docker)
![Kubernetes](https://img.shields.io/badge/Kubernetes-1.31-blue?style=flat-square&logo=kubernetes)
![K3d](https://img.shields.io/badge/K3d-5.x-orange?style=flat-square)
![Terraform](https://img.shields.io/badge/Terraform-1.15-purple?style=flat-square&logo=terraform)
![AWS EKS](https://img.shields.io/badge/AWS-EKS-orange?style=flat-square&logo=amazonaws)
![GitHub Actions](https://img.shields.io/badge/CI%2FCD-GitHub_Actions-black?style=flat-square&logo=githubactions)
![License](https://img.shields.io/badge/License-MIT-green?style=flat-square)
[![CI](https://github.com/Heyyprakhar1/sentinel-ai-platform/actions/workflows/ci.yml/badge.svg)](https://github.com/Heyyprakhar1/sentinel-ai-platform/actions/workflows/ci.yml)
[![Quality Gate Status](https://sonarcloud.io/api/project_badges/measure?project=Heyyprakhar1_sentinel-ai-platform&metric=alert_status)](https://sonarcloud.io/summary/new_code?id=Heyyprakhar1_sentinel-ai-platform)

*A backend-first, infrastructure-driven platform built to demonstrate production DevSecOps engineering — containerization, multi-environment Kubernetes orchestration, CI/CD automation, security scanning, and observability.*

</div>

---

## Overview

SentinelAI is a cloud-native DevSecOps platform built to simulate real engineering workflows used in modern platform and infrastructure teams. It exposes a FastAPI backend instrumented for observability from Day 1 — health probes, Prometheus metrics, structured logging, and a typed service layer — designed to be deployed and operated on Kubernetes.

Every decision in this project reflects a production engineering mindset: folder structure designed for scalability, Kubernetes manifests organized with Kustomize overlays, Docker images built multi-stage with non-root users, and environment separation done at the namespace level.

This is not a tutorial project. It is a portfolio of engineering decisions.

---

## Architecture

### Current State — Local Kubernetes

```
Developer Workstation (WSL2 / Ubuntu)
            │
            ▼
  FastAPI Backend (Python 3.12)
  ┌─────────────────────────────┐
  │  /health  /status  /metrics │  ← Kubernetes probe-ready
  │  /alerts  /recommendation   │  ← Core workload
  └─────────────────────────────┘
            │
            ▼
  Docker Container
  (multi-stage build · non-root user · slim image)
            │
            ▼
  K3d Cluster — 1 server + 2 agents
            │
            ▼
  Traefik Ingress Controller
  localhost:8080
            │
     ┌──────┴──────┬──────────────┐
     ▼             ▼              ▼
sentinelai-dev  sentinelai-     sentinelai-
 (1 replica)    staging          prod
                (2 replicas)    (3 replicas)
```

### Production State — AWS EKS via Terraform

```
GitHub Push
     │
     ▼
GitHub Actions CI/CD Pipeline
     │
     ├── SonarCloud (static analysis)
     ├── Trivy      (container vulnerability scan)
     └── OPA Gatekeeper (policy enforcement)
     │
     ▼
Amazon ECR  (container registry)
     │
     ▼
AWS EKS v1.35  (ap-south-1)
     ├── sentinelai-cluster
     ├── Node Group — t3.medium × 2
     ├── VPC — 2 public + 2 private subnets
     └── IAM roles — cluster + node group
     │
     ├── Observability Stack (✅ Phase 8)
     │   ├── kube-prometheus-stack (Helm)
     │   ├── ServiceMonitor — custom metrics scraping
     │   ├── PrometheusRule — 3 alert rules
     │   ├── Alertmanager — Slack routing (warning + critical)
     │   ├── Grafana — cluster + application dashboards
     │   ├── HPA — CPU/Memory autoscaling (2–10 replicas)
     │   ├── PDB — zero downtime disruption budget
     │   └── NetworkPolicy — zero trust ingress/egress
     └── AI Anomaly Detection  (insights layer — Phase 9)
```

---

## Tech Stack

| Layer | Technology | Status |
|---|---|---|
| Backend | Python 3.12, FastAPI, Uvicorn | ✅ Implemented |
| Containerization | Docker (multi-stage, non-root) | ✅ Implemented |
| Orchestration | Kubernetes, K3d (local) | ✅ Implemented |
| Config Management | Kustomize (base + overlays) | ✅ Implemented |
| Automation | Makefile | ✅ Implemented |
| CI/CD | GitHub Actions | ✅ Implemented |
| Code Quality | SonarCloud | ✅ Implemented |
| Security Scanning | Trivy (CRITICAL fail gate) | ✅ Implemented |
| Policy Enforcement | OPA Gatekeeper (3 policies) | ✅ Implemented |
| Infrastructure as Code | Terraform v1.15 | ✅ Implemented |
| Container Registry | Amazon ECR | ✅ Implemented |
| Cloud Orchestration | AWS EKS v1.35 | ✅ Implemented |
| Metrics Collection | Prometheus + ServiceMonitor | ✅ Implemented |
| Dashboards | Grafana (custom + cluster dashboards) | ✅ Implemented |
| Alerting | PrometheusRule + Alertmanager (Slack) | ✅ Implemented |
| Autoscaling | HPA (CPU 70% / Memory 80%, max 10) | ✅ Implemented |
| Resilience | PodDisruptionBudget (minAvailable: 1) | ✅ Implemented |
| Network Security | NetworkPolicy (zero trust) | ✅ Implemented |
| AI Layer | Anomaly detection, recommendations | ⏳ Phase 9 |

---

## CI/CD Pipeline

```
push to main
     │
     ▼
  test job
  ├── Python 3.12 setup
  ├── Install dependencies
  └── pytest (18 tests)
     │
     ├──────────────────┐
     ▼                  ▼
sonarcloud          docker-build
(code quality)      (image build)
                         │
                         ▼
                    trivy-scan
                    (CRITICAL CVE gate)
```

---

## Observability Stack

SentinelAI exposes custom Prometheus metrics from `/metrics` — scraped automatically via a ServiceMonitor CRD. Three Grafana dashboards are live: cluster-level resource usage, per-pod breakdown, and a custom SentinelAI application dashboard.

### Custom Metrics

| Metric | Type | Description |
|---|---|---|
| `sentinelai_requests_total` | Counter | Total API requests served |
| `sentinelai_cpu_usage_percent` | Gauge | Application CPU usage % |
| `sentinelai_memory_usage_percent` | Gauge | Application memory usage % |

### Alert Rules

| Alert | Condition | Severity |
|---|---|---|
| `SentinelAIHighCPU` | CPU > 80% for 2m | warning |
| `SentinelAIHighMemory` | Memory > 85% for 2m | critical |
| `SentinelAIDown` | Pod unreachable for 1m | critical |

Alerts route to Slack via Alertmanager — `#sentinelai-alerts` for warnings, `#sentinelai-critical` for critical.

---

## API Endpoints

| Endpoint | Method | Description | Kubernetes Role |
|---|---|---|---|
| `/health` | GET | Application liveness check | Liveness probe |
| `/status` | GET | Application readiness + uptime | Readiness probe |
| `/metrics` | GET | Prometheus-format metrics | Scrape target |
| `/alerts` | GET | Structured alert feed | Core workload |
| `/recommendation` | GET | AI-driven alert recommendation | Core workload |

The `/health` and `/status` endpoints were designed for Kubernetes from the start — not retrofitted later. This is the contract between the application and the platform it runs on.

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
| Liveness Delay | 5s | 10s | 15s |
| Readiness Delay | 5s | 10s | 15s |

---

## AWS Infrastructure — Terraform

All AWS resources are provisioned via Terraform with S3 remote state and native state locking.

| Resource | Configuration |
|---|---|
| EKS Cluster | v1.35, ap-south-1, API auth mode |
| Node Group | t3.medium, desired 2, min 1, max 3 |
| VPC | 10.0.0.0/16, 2 public + 2 private subnets |
| Subnets | ap-south-1a + ap-south-1b |
| ECR Repository | scan on push, AES-256, lifecycle policy (last 10 images) |
| IAM Cluster Role | AmazonEKSClusterPolicy |
| IAM Node Role | AmazonEKSWorkerNodePolicy + CNI + ECR ReadOnly |
| Remote State | S3 bucket with native locking (Terraform v1.10+) |

```bash
cd terraform
terraform init
terraform plan
terraform apply -auto-approve

# Connect kubectl to EKS
aws eks update-kubeconfig --region ap-south-1 --name sentinelai-cluster
kubectl get nodes
```

---

## OPA Gatekeeper Policies

Three admission control policies are enforced across all SentinelAI namespaces:

| Policy | Rule | Enforcement |
|---|---|---|
| `require-non-root` | All containers must run as non-root user | deny |
| `require-resource-limits` | All containers must define CPU and memory limits | deny |
| `ban-latest-tag` | `:latest` image tag is not permitted | deny |

---

## Project Structure

```
sentinel-ai-platform/
│
├── app/                            # Application source
│   ├── main.py                     # Entry point — wires routes, starts logger
│   ├── api/
│   │   └── routes/
│   │       ├── health.py           # GET /health
│   │       ├── metrics.py          # GET /metrics (Prometheus)
│   │       ├── alerts.py           # GET /alerts
│   │       └── recommendations.py  # GET /recommendation
│   ├── core/
│   │   ├── config.py               # Pydantic-settings env var config
│   │   └── logging_config.py       # Structured stdout logging
│   ├── models/
│   │   └── schemas.py              # Pydantic data contracts
│   └── services/
│       ├── alert_service.py        # Alert logic (isolated, testable)
│       └── recommendation_service.py
│
├── k8s/
│   ├── namespaces.yaml             # dev / staging / prod namespaces
│   ├── base/                       # Shared manifests
│   │   ├── deployment.yaml
│   │   ├── service.yaml
│   │   ├── ingress.yaml            # Traefik ingress
│   │   ├── hpa.yaml                # HPA — CPU 70% / Memory 80%, max 10 replicas
│   │   ├── pdb.yaml                # PodDisruptionBudget — minAvailable: 1
│   │   ├── networkpolicy.yaml      # Zero trust — restrict ingress/egress by namespace
│   │   └── kustomization.yaml
│   ├── overlays/
│   │   ├── dev/                    # 1 replica, DEBUG, Never pull
│   │   ├── staging/                # 2 replicas, INFO, IfNotPresent
│   │   └── prod/                   # 3 replicas, WARNING, Always
│   ├── gatekeeper/
│   │   ├── templates/              # ConstraintTemplates (Rego logic)
│   │   │   ├── require-nonroot.yaml
│   │   │   ├── require-resource-limits.yaml
│   │   │   └── ban-latest-tag.yaml
│   │   └── constraints/            # Policy enforcement rules
│   │       ├── require-non-root-constraint.yaml
│   │       ├── require-resource-limits-constraint.yaml
│   │       └── ban-latest-tag-constraint.yaml
│   └── monitoring/                 # Observability manifests
│       ├── servicemonitor.yaml     # Prometheus scrape config for SentinelAI
│       ├── prometheusrule.yaml     # Alert rules — CPU, Memory, Down
│       └── alertmanager.yaml       # Slack routing — warning + critical channels
│
├── terraform/                      # AWS infrastructure as code
│   ├── backend.tf                  # S3 remote state config
│   ├── main.tf                     # Provider config
│   ├── variables.tf                # Input variables
│   ├── outputs.tf                  # Output values
│   ├── vpc.tf                      # VPC, subnets, IGW, route tables
│   ├── iam.tf                      # EKS cluster + node group IAM roles
│   ├── eks.tf                      # EKS cluster + node group
│   └── ecr.tf                      # ECR repository + lifecycle policy
│
├── tests/
│   ├── test_health.py              # 5 tests — /health endpoint
│   ├── test_status.py              # 4 tests — /status endpoint
│   ├── test_alerts.py              # 4 tests — /alerts endpoint
│   └── test_recommendations.py    # 5 tests — /recommendation endpoint
│
├── scripts/
│   └── k3d-setup.sh               # Cluster creation with prereq checks
│
├── docs/
│   ├── architecture.md
│   └── setup.md
│
├── .github/
│   ├── workflows/
│   │   └── ci.yml                 # CI pipeline — test, sonarcloud, trivy
│   ├── PULL_REQUEST_TEMPLATE.md
│   └── ISSUE_TEMPLATE/
│       └── bug_report.md
│
├── Dockerfile                      # Multi-stage, python:3.12-slim, non-root
├── Makefile                        # Unified command interface
├── requirements.txt
├── .env.example
└── .dockerignore
```

---

## Local Setup

### Prerequisites

| Tool | Version | Notes |
|---|---|---|
| Python | 3.12+ | |
| Docker | 20.0+ | Daemon must be running |
| kubectl | 1.28+ | |
| k3d | 5.0+ | Auto-installed by setup script |
| Helm | 3.0+ | For kube-prometheus-stack |
| Terraform | 1.10+ | For AWS infrastructure |
| AWS CLI | 2.0+ | Configured with credentials |

### 1. Clone and set up Python environment

```bash
git clone https://github.com/Heyyprakhar1/sentinel-ai-platform.git
cd sentinel-ai-platform

python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

### 2. Run locally without Docker

```bash
uvicorn app.main:app --reload --port 8000
```

Verify at `http://localhost:8000/docs` — FastAPI auto-generates Swagger UI.

### 3. Build Docker image

```bash
make build
```

### 4. Run as container

```bash
make run
# curl http://localhost:8000/health
```

### 5. Create K3d cluster

```bash
make cluster-up
# Script will prompt for cluster name and handle prerequisites
```

### 6. Import image into cluster

```bash
make import-image
```

### 7. Deploy all environments

```bash
kubectl apply -f k8s/namespaces.yaml
make deploy-all
```

### 8. Deploy observability stack

```bash
# Install kube-prometheus-stack
helm repo add prometheus-community https://prometheus-community.github.io/helm-charts
helm repo update
helm install prometheus prometheus-community/kube-prometheus-stack -n monitoring --create-namespace

# Apply SentinelAI monitoring manifests
kubectl apply -f k8s/monitoring/servicemonitor.yaml
kubectl apply -f k8s/monitoring/prometheusrule.yaml
kubectl apply -f k8s/monitoring/alertmanager.yaml

# Access Grafana
kubectl port-forward svc/prometheus-grafana 3001:80 -n monitoring &
# http://localhost:3001 — admin / prom-operator

# Access Prometheus
kubectl port-forward svc/prometheus-kube-prometheus-prometheus 9090:9090 -n monitoring &
# http://localhost:9090
```

### 9. Verify

```bash
make status
curl http://localhost:8080/health
curl http://localhost:8080/alerts
curl http://localhost:8080/metrics
```

---

## Makefile Reference

```bash
# Docker
make build            # Build sentinelai:1.0.0 image
make run              # Run container on port 8000
make stop             # Stop and remove container

# Kubernetes — Deploy
make deploy-dev       # Apply dev overlay
make deploy-staging   # Apply staging overlay
make deploy-prod      # Apply prod overlay
make deploy-all       # Apply namespaces + all overlays

# Kubernetes — Observe
make status           # Show all 3 environments
make status-dev       # Dev namespace only
make status-staging   # Staging namespace only
make status-prod      # Prod namespace only
make logs-dev         # Tail dev pod logs
make logs-staging     # Tail staging pod logs
make logs-prod        # Tail prod pod logs

# Cluster
make cluster-up       # Create K3d cluster via script
make cluster-down     # Delete K3d cluster
make import-image     # Import Docker image into cluster

# Cleanup
make clean            # Delete all environment deployments
```

---

## Kubernetes Quick Reference

```bash
# Cluster health
kubectl get nodes
k3d cluster list

# All environments at once
kubectl get pods -A | grep sentinelai

# Detailed environment status
kubectl get all -n sentinelai-dev
kubectl get all -n sentinelai-staging
kubectl get all -n sentinelai-prod

# Ingress status
kubectl get ingress -A | grep sentinelai

# OPA Gatekeeper policies
kubectl get constrainttemplates
kubectl get requirenonroot
kubectl get requireresourcelimits
kubectl get banlatesttag

# Autoscaling + resilience
kubectl get hpa -n sentinelai-dev
kubectl get pdb -n sentinelai-dev
kubectl get networkpolicy -n sentinelai-dev

# Observability
kubectl get servicemonitor -n monitoring
kubectl get prometheusrule -n monitoring
kubectl port-forward svc/prometheus-grafana 3001:80 -n monitoring &
kubectl port-forward svc/prometheus-kube-prometheus-prometheus 9090:9090 -n monitoring &

# Pod logs
kubectl logs -l app=sentinelai -n sentinelai-dev --tail=50

# Describe a pod (debugging)
kubectl describe pod <pod-name> -n sentinelai-dev

# Port-forward (alternative to Ingress)
kubectl port-forward -n sentinelai-dev svc/dev-sentinelai-service 9000:80
```

---

## Docker Details

The Dockerfile follows production best practices:

```
Stage 1 — Build
  Base:      python:3.12-slim
  Action:    Install dependencies from requirements.txt

Stage 2 — Runtime
  Base:      python:3.12-slim
  User:      Non-root (sentinel:sentinel)
  Port:      8000
  Command:   uvicorn app.main:app --host 0.0.0.0 --port 8000
```

Key decisions:
- `--no-cache-dir` on pip install keeps image lean
- Non-root user reduces container attack surface
- `.dockerignore` excludes `venv/`, `__pycache__/`, `.env`, `.git/`

---

## Roadmap

| Phase | Description | Status |
|---|---|---|
| 1 | FastAPI backend foundation | ✅ Complete |
| 2 | Docker containerization | ✅ Complete |
| 3 | Local Kubernetes — K3d, multi-env, Ingress | ✅ Complete |
| 4 | Repository structure and documentation | ✅ Complete |
| 5 | GitHub Actions CI/CD pipeline | ✅ Complete |
| 6 | DevSecOps — SonarCloud, Trivy, OPA Gatekeeper | ✅ Complete |
| 7 | AWS EKS deployment + ECR via Terraform | ✅ Complete |
| 8 | Observability — Prometheus, Grafana, Alerting, HPA, PDB, NetworkPolicy | ✅ Complete |
| 9 | AI anomaly detection and insights layer | ⏳ Pending |
| 10 | Frontend observability dashboard | ⏳ Optional |

---

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feat/your-feature`
3. Follow the PR template in `.github/PULL_REQUEST_TEMPLATE.md`
4. Ensure `make status` passes before submitting

---

<div align="center">

**Prakhar Srivastava** — DevOps & Platform Engineer

[LinkedIn](https://www.linkedin.com/in/heyyprakhar1/) · [Portfolio](https://prakharsrivastava-devops.netlify.app) · [Hashnode](https://hashnode.com/@heyyprakhar01)

</div>
