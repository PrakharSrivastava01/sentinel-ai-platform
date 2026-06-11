import psutil


def get_disk_usage():
    usage = psutil.disk_usage("/")

    return {
        "total_gb": round(usage.total / (1024**3), 2),
        "used_gb": round(usage.used / (1024**3), 2),
        "free_gb": round(usage.free / (1024**3), 2),
        "percent": usage.percent,
    }


def get_memory_usage():
    memory = psutil.virtual_memory()

    return {
        "total_gb": round(memory.total / (1024**3), 2),
        "used_gb": round(memory.used / (1024**3), 2),
        "available_gb": round(memory.available / (1024**3), 2),
        "percent": memory.percent,
    }


def get_cpu_usage():
    return {
        "cpu_percent": psutil.cpu_percent(interval=1)
    }
