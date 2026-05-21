# SentinelAI — Local Setup Guide

## Prerequisites

| Tool | Version | Install |
|------|---------|---------|
| Python | 3.12+ | [python.org](https://python.org) |
| Docker | 20.0+ | [docker.com](https://docker.com) |
| kubectl | 1.28+ | [kubernetes.io](https://kubernetes.io/docs/tasks/tools/) |
| k3d | 5.0+ | Auto-installed via script |

---

## Quick Start

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

### 3. Run locally
```bash
uvicorn app.main:app --reload --port 8000
```

### 4. Create K3d cluster
```bash
make cluster-up
```

### 5. Build and import Docker image
```bash
make build
make import-image
```

### 6. Deploy all environments
```bash
make deploy-all
```

### 7. Verify
```bash
make status
curl http://localhost:8080/health
```

---

## Available Endpoints

| Endpoint | Description |
|----------|-------------|
| GET /health | Liveness check |
| GET /status | Readiness check |
| GET /metrics | Prometheus metrics |
| GET /alerts | Alert feed |
| GET /recommendation | AI recommendation |

---

## Environment URLs

| Environment | URL |
|-------------|-----|
| All (via Ingress) | http://localhost:8080 |
| Dev (port-forward) | http://localhost:9000 |
