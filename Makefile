.PHONY: help build run stop deploy-dev deploy-staging deploy-prod status logs clean

# ── Variables ──────────────────────────────────────
IMAGE_NAME=sentinelai
IMAGE_TAG=1.0.0
CLUSTER_NAME=Sentinel-Cluster

# ── Help ───────────────────────────────────────────
help:
	@echo ""
	@echo "  SentinelAI — Available Commands"
	@echo ""
	@echo "  Docker:"
	@echo "    make build          Build Docker image"
	@echo "    make run            Run container locally"
	@echo "    make stop           Stop container"
	@echo ""
	@echo "  Kubernetes:"
	@echo "    make deploy-dev     Deploy to dev environment"
	@echo "    make deploy-staging Deploy to staging environment"
	@echo "    make deploy-prod    Deploy to prod environment"
	@echo "    make status         Show all environments status"
	@echo "    make status-dev     Show dev environment status"
	@echo "    make logs-dev       Show dev pod logs"
	@echo ""
	@echo "  Cluster:"
	@echo "    make cluster-up     Create K3d cluster"
	@echo "    make cluster-down   Delete K3d cluster"
	@echo "    make import-image   Import image into cluster"
	@echo ""
	@echo "  Cleanup:"
	@echo "    make clean          Remove all environments"
	@echo ""

# ── Docker ─────────────────────────────────────────
build:
	docker build -t $(IMAGE_NAME):$(IMAGE_TAG) .

run:
	docker run -d --name sentinelai-app -p 8000:8000 $(IMAGE_NAME):$(IMAGE_TAG)

stop:
	docker stop sentinelai-app && docker rm sentinelai-app

# ── Cluster ────────────────────────────────────────
cluster-up:
	bash scripts/k3d-setup.sh

cluster-down:
	k3d cluster delete $(CLUSTER_NAME)

import-image:
	k3d image import $(IMAGE_NAME):$(IMAGE_TAG) -c $(CLUSTER_NAME)

# ── Kubernetes Deploy ──────────────────────────────
deploy-dev:
	kubectl apply -k k8s/overlays/dev/

deploy-staging:
	kubectl apply -k k8s/overlays/staging/

deploy-prod:
	kubectl apply -k k8s/overlays/prod/

deploy-all:
	kubectl apply -f k8s/namespaces.yaml
	kubectl apply -k k8s/overlays/dev/
	kubectl apply -k k8s/overlays/staging/
	kubectl apply -k k8s/overlays/prod/

# ── Status ─────────────────────────────────────────
status:
	@echo "\n── Dev ──────────────────────────────"
	kubectl get all -n sentinelai-dev
	@echo "\n── Staging ──────────────────────────"
	kubectl get all -n sentinelai-staging
	@echo "\n── Prod ─────────────────────────────"
	kubectl get all -n sentinelai-prod

status-dev:
	kubectl get all -n sentinelai-dev

status-staging:
	kubectl get all -n sentinelai-staging

status-prod:
	kubectl get all -n sentinelai-prod

# ── Logs ───────────────────────────────────────────
logs-dev:
	kubectl logs -l app=sentinelai -n sentinelai-dev --tail=50

logs-staging:
	kubectl logs -l app=sentinelai -n sentinelai-staging --tail=50

logs-prod:
	kubectl logs -l app=sentinelai -n sentinelai-prod --tail=50

# ── Cleanup ────────────────────────────────────────
clean:
	kubectl delete -k k8s/overlays/dev/ --ignore-not-found
	kubectl delete -k k8s/overlays/staging/ --ignore-not-found
	kubectl delete -k k8s/overlays/prod/ --ignore-not-found

# ── Docker Compose ─────────────────────────────────────────────────
compose-up:
	docker compose up -d

compose-down:
	docker compose down

compose-logs:
	docker compose logs -f

compose-ps:
	docker compose ps

compose-restart:
	docker compose restart

compose-build:
	docker compose build --no-cache
