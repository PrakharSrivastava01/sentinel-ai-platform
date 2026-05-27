# app/services/anomaly_detector.py
from collections import deque
import statistics

BUFFER_SIZE = 20
MIN_READINGS = 5

class MetricsBuffer:
    def __init__(self):
        self.cpu = deque(maxlen=BUFFER_SIZE)
        self.memory = deque(maxlen=BUFFER_SIZE)

    def push(self, cpu: float, memory: float):
        self.cpu.append(cpu)
        self.memory.append(memory)

    def ready(self) -> bool:
        return len(self.cpu) >= MIN_READINGS and len(self.memory) >= MIN_READINGS


class AnomalyDetector:
    def __init__(self, buffer: MetricsBuffer):
        self.buffer = buffer

    def z_score(self, values: deque, current: float) -> float:
        try:
            mean = statistics.mean(values)
            stdev = statistics.stdev(values)
            if stdev == 0:
                return 0.0
            return (current - mean) / stdev
        except Exception:
            return 0.0

    def confidence(self, score: float) -> str:
        abs_score = abs(score)
        if abs_score > 3.0:
            return "high"
        elif abs_score > 2.0:
            return "medium"
        return "low"

    def analyze(self, cpu: float, memory: float) -> dict:
        self.buffer.push(cpu, memory)

        if not self.buffer.ready():
            return {
                "warming_up": True,
                "cpu_score": 0.0,
                "memory_score": 0.0,
                "anomaly_detected": False,
                "severity": "normal",
                "confidence": "low",
            }

        cpu_score = self.z_score(self.buffer.cpu, cpu)
        memory_score = self.z_score(self.buffer.memory, memory)

        max_score = max(abs(cpu_score), abs(memory_score))
        anomaly_detected = max_score > 2.0

        if max_score > 3.0:
            severity = "critical"
        elif max_score > 2.0:
            severity = "warning"
        else:
            severity = "normal"

        return {
            "warming_up": False,
            "cpu_score": round(cpu_score, 2),
            "memory_score": round(memory_score, 2),
            "anomaly_detected": anomaly_detected,
            "severity": severity,
            "confidence": self.confidence(max_score),
        }


# Global singleton — one buffer for the entire app lifecycle
metrics_buffer = MetricsBuffer()
detector = AnomalyDetector(metrics_buffer)
