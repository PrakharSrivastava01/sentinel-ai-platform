# SentinelAI — Architecture

## Project Summary

SentinelAI is a cloud-native DevSecOps monitoring platform built with a production-first mindset. It is designed to demonstrate real-world infrastructure engineering — containerized workloads, Kubernetes orchestration, CI/CD automation, security scanning, and AI-powered operational insights.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Backend | Python, FastAPI |
| Containerization | Docker |
| Orchestration | Kubernetes, AWS EKS |
| CI/CD | GitHub Actions |
| Container Registry | Amazon ECR |
| Security | SonarQube, Trivy, OPA Gatekeeper |
| Monitoring | Prometheus, Grafana |
| AI Layer | Anomaly Detection, Alert Analysis |

---

## Current Architecture — Local Development

```
┌─────────────────────────────────────────────────────┐
│                   Developer Machine                  │
│                                                      |
│   FastAPI App (Python 3.12)                          │
│        │                                             │
│   Docker Container (sentinelai:1.0.0)                │
│        │                                             │
│   K3d Cluster (K3s v1.31.5)                          │
│   ┌────────────────────────────────────────────┐     │
│   │  Traefik Ingress → localhost:8080          │     │
│   │                                            │     │
│   │  ┌──────────┐ ┌─────────┐ ┌──────────┐     │     │
│   │  │   Dev    │ │Staging  │ │   Prod   │     │     │
│   │  │ 1 replica│ │2 replica│ │3 replica │     │     │
│   │  └──────────┘ └─────────┘ └──────────┘     │     |
│   └────────────────────────────────────────────┘     │
└─────────────────────────────────────────────────────-┘
```

---

## Planned Architecture — Production (AWS EKS)

```
Developer
    │
    ▼
GitHub Repository
    │
    ▼
GitHub Actions CI/CD Pipeline
    ├── SonarQube       (code quality analysis)
    ├── Trivy           (vulnerability scanning)
    └── OPA Gatekeeper  (policy enforcement)
    │
    ▼
Amazon ECR
(container image registry)
    │
    ▼
AWS EKS Cluster
    ├── sentinelai-dev
    ├── sentinelai-staging
    └── sentinelai-prod
    │
    ▼
Prometheus + Grafana
(metrics & dashboards)
    │
    ▼
AI Insights Layer
(anomaly detection, recommendations)
```

---

## Kubernetes Structure

Manifests follow the **Kustomize base + overlays** pattern for clean environment separation.

```
k8s/
├── base/                    # shared across all environments
│   ├── deployment.yaml
│   ├── service.yaml
│   ├── ingress.yaml
│   └── kustomization.yaml
├── overlays/
│   ├── dev/                 # development overrides
│   │   ├── configmap.yaml
│   │   ├── patch.yaml
│   │   └── kustomization.yaml
│   ├── staging/             # staging overrides
│   │   ├── configmap.yaml
│   │   ├── patch.yaml
│   │   └── kustomization.yaml
│   └── prod/                # production overrides
│       ├── configmap.yaml
│       ├── patch.yaml
│       └── kustomization.yaml
└── namespaces.yaml
```

---

## Environment Matrix

| Property | Dev | Staging | Prod |
|----------|-----|---------|------|
| Namespace | sentinelai-dev | sentinelai-staging | sentinelai-prod |
| Replicas | 1 | 2 | 3 |
| Log Level | DEBUG | INFO | WARNING |
| CPU Request | 50m | 100m | 200m |
| CPU Limit | 100m | 200m | 400m |
| Memory Request | 64Mi | 128Mi | 256Mi |
| Memory Limit | 128Mi | 256Mi | 512Mi |
| Image Pull Policy | Never | IfNotPresent | Always |
| Liveness Delay | 5s | 10s | 15s |
| Readiness Delay | 5s | 10s | 15s |

---

## API Endpoints

| Method | Endpoint | Purpose | K8s Usage |
|--------|----------|---------|-----------|
| GET | `/health` | App liveness check  | Liveness Probe    |
| GET | `/status` | App readiness check | Readiness Probe   |
| GET | `/metrics`| Prometheus metrics  | Prometheus Scrape |
| GET | `/alerts` | Alert feed | Core Workload |
| GET | `/recommendation` | AI recommendations | Core Workload |

---

## Observability Design

Observability is built into the application from Day 1 — not added as an afterthought.

- `/health` and `/status` feed directly into Kubernetes probes
- `/metrics` exposes Prometheus-compatible metrics including request counts, CPU usage, and memory usage
- Structured logging is configured at startup via `app/core/logging_config.py`
- Log level is environment-specific — DEBUG in dev, WARNING in prod

---

## Security Design

| Layer | Tool | Purpose |
|-------|------|---------|
| Code Quality | SonarQube | Static analysis, code smells |
| Image Scanning | Trivy | CVE scanning on Docker images  |
| Policy Enforcement | OPA Gatekeeper | Block non-compliant K8s deployments |
| Container Hardening | Non-root user | Runs as `sentinel` user, not root   |
| Secrets Management | K8s Secrets + AWS Secrets Manager | No hardcoded credentials |

---

## Development Phases

| Phase | Description | Status |
|-------|-------------|--------|
| 1 | Backend Foundation | ✅ Complete |
| 2 | Dockerization | ✅ Complete |
| 3 | Local Kubernetes | ✅ Complete |
| 4 | Repository Structuring | 🔄 In Progress |
| 5 | GitHub Actions CI/CD | ⏳ Pending |
| 6 | DevSecOps Integration | ⏳ Pending |
| 7 | AWS EKS Deployment | ⏳ Pending |
| 8 | Monitoring & Observability | ⏳ Pending |
| 9 | AI Insights Layer | ⏳ Pending |
| 10 | Frontend Dashboard | ⏳ Optional |
