from langchain.agents import create_agent
from langchain.tools import tool
from langchain_ollama import ChatOllama

from tools import get_disk_usage


@tool
def disk_usage() -> str:
    """
    Get current disk usage information.
    """
    return str(get_disk_usage())


llm = ChatOllama(
    model="qwen2.5-coder:7b",
    temperature=0,
)

agent = create_agent(
    model=llm,
    tools=[disk_usage],
)

response = agent.invoke(
    {
        "messages": [
            {
                "role": "user",
                "content": "Analyze my disk usage and tell me if there are any concerns."
            }
        ]
    }
)

print(response)