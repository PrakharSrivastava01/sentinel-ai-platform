import json

from k8s_tools import (
    get_pod_logs,
    get_pod_description,
    get_namespace_events,
)

from langchain_ollama import ChatOllama


llm = ChatOllama(
    model="qwen2.5-coder:7b",
    temperature=0,
)


def investigate_pod(namespace, pod):

    logs = get_pod_logs(
        namespace,
        pod,
    )

    description = get_pod_description(
        namespace,
        pod,
    )

    events = get_namespace_events(
        namespace,
    )

    prompt = f"""

Return ONLY valid JSON.

Do NOT use markdown.
Do NOT use ```json
Do NOT explain.

Required format:

{{
  "root_cause": "...",
  "severity": "...",
  "confidence": "...",
  "evidence": [],
  "recommended_fix": "..."
}}

Logs:
{logs}

Description:
{description}

Events:
{events}
"""

    response = llm.invoke(prompt)

    return response.content
