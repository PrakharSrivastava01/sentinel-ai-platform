from fastapi import APIRouter, Response
from prometheus_client import generate_latest, CONTENT_TYPE_LATEST, Counter, Gauge
import psutil

router = APIRouter()

REQUEST_COUNT = Counter("sentinelai_requests_total", "Total API requests")
CPU_USAGE = Gauge("sentinelai_cpu_usage_percent", "CPU usage percent")
MEMORY_USAGE = Gauge("sentinelai_memory_usage_percent", "Memory usage percent")

@router.get("/metrics")
def metrics():
    REQUEST_COUNT.inc()
    CPU_USAGE.set(psutil.cpu_percent())
    MEMORY_USAGE.set(psutil.virtual_memory().percent)
    return Response(generate_latest(), media_type=CONTENT_TYPE_LATEST)
