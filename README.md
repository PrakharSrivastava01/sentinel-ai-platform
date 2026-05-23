<div align="center">

# SentinelAI🛡️

**AI-Powered DevSecOps Monitoring Platform**

![Python](https://img.shields.io/badge/Python-3.12-blue?style=flat-square&logo=python)
![FastAPI](https://img.shields.io/badge/FastAPI-0.100+-green?style=flat-square&logo=fastapi)
![Docker](https://img.shields.io/badge/Docker-29.4-blue?style=flat-square&logo=docker)
![Kubernetes](https://img.shields.io/badge/Kubernetes-1.31-blue?style=flat-square&logo=kubernetes)
![K3d](https://img.shields.io/badge/K3d-5.x-orange?style=flat-square)
![AWS EKS](https://img.shields.io/badge/AWS-EKS-orange?style=flat-square&logo=amazonaws)
![GitHub Actions](https://img.shields.io/badge/CI%2FCD-GitHub_Actions-black?style=flat-square&logo=githubactions)
![License](https://img.shields.io/badge/License-MIT-green?style=flat-square)
[![CI](https://github.com/Heyyprakhar1/sentinel-ai-platform/actions/workflows/ci.yml/badge.svg)](https://github.com/Heyyprakhar1/sentinel-ai-platform/actions/workflows/ci.yml)

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

### Planned State — AWS EKS Production

```
GitHub Push
     │
     ▼
GitHub Actions CI/CD Pipeline
     │
     ├── SonarQube  (static analysis)
     ├── Trivy      (container vulnerability scan)
     └── OPA Gatekeeper (policy enforcement)
     │
     ▼
Amazon ECR  (container registry)
     │
     ▼
AWS EKS  (multi-environment cluster)
     │
     ├── Prometheus + Grafana  (observability)
     └── AI Anomaly Detection  (insights layer)
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
| CI/CD | GitHub Actions | ⏳ Phase 5 |
| Container Registry | Amazon ECR | ⏳ Phase 7 |
| Security Scanning | SonarQube, Trivy | ⏳ Phase 6 |
| Policy Enforcement | OPA Gatekeeper | ⏳ Phase 6 |
| Monitoring | Prometheus, Grafana | ⏳ Phase 8 |
| Cloud Orchestration | AWS EKS | ⏳ Phase 7 |
| AI Layer | Anomaly detection, recommendations | ⏳ Phase 9 |

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
| Image Pull Policy | Never | IfNotPresent | Always\* |
| Liveness Delay | 5s | 10s | 15s |
| Readiness Delay | 5s | 10s | 15s |

> \*`Always` in production once ECR is configured in Phase 7

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
│   │   └── kustomization.yaml
│   └── overlays/
│       ├── dev/                    # 1 replica, DEBUG, Never pull
│       ├── staging/                # 2 replicas, INFO, IfNotPresent
│       └── prod/                   # 3 replicas, WARNING, Always
│
├── scripts/
│   └── k3d-setup.sh               # Cluster creation with prereq checks
│
├── docs/
│   ├── architecture.md
│   └── setup.md
│
├── .github/
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

### 8. Verify

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
| 5 | GitHub Actions CI/CD pipeline | 🔄 In Progress |
| 6 | DevSecOps — SonarQube, Trivy, OPA Gatekeeper | ⏳ Pending |
| 7 | AWS EKS deployment + ECR | ⏳ Pending |
| 8 | Monitoring — Prometheus + Grafana | ⏳ Pending |
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
