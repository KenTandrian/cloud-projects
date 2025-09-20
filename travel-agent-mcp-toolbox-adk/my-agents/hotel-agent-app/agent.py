import os
from google.adk.agents.llm_agent import Agent
from toolbox_core import ToolboxSyncClient

toolbox = ToolboxSyncClient(
    os.environ.get("TOOLBOX_URL", "http://localhost:5000")
)

# Load single tool
# tools = toolbox.load_tool('search-hotels-by-location')

# Load all the tools
tools = toolbox.load_toolset('my_first_toolset')

root_agent = Agent(
    name="hotel_agent",
    model="gemini-2.5-flash",
    description=(
        "Agent to answer questions about hotels in a city or hotels by name."
    ),
    instruction=(
        "You are a helpful agent who can answer user questions about the hotels in a specific city or hotels by name. Use the tools to answer the question"
    ),
    tools=tools,
)
