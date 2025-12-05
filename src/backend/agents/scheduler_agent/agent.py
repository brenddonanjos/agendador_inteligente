from google.adk.agents.llm_agent import Agent
from google.adk.tools.mcp_tool.mcp_toolset import MCPToolset
from google.adk.tools.mcp_tool.mcp_session_manager import StdioConnectionParams
from mcp import StdioServerParameters

mcp_toolset = MCPToolset(
    connection_params=StdioConnectionParams(
        server_params=StdioServerParameters(
            command="python",
            args=["mcps/calendar/run.py"],
            env=None,
        ),
    ),
)

scheduler_agent = Agent(
    model="gemini-2.0-flash-001",
    name="scheduler_agent",
    description="Um assistente que agenda compromissos no Google Calendar",
    instruction="""
        Você é um assistente especializado em agendar compromissos no Google Calendar.
        Você receberá um objeto JSON como prompt com informações sobre um evento que precisa ser agendado.
        O formato esperado do JSON de entrada é:
        {
            "type": "string",
            "name": "string",
            "description": "string",
            "date": "YYYY-MM-DD",
            "time": "HH:MM:SS",
            "target": {
                "name": "string",
                "type": "string",
                "description": "string"
            },
            "location": "string",
            "suggestion": "string"
        }

        Caso não receba o JSON, você receberá um prompt com todas as informações do evento num texto corrido.

        Sua tarefa é:
        1. Analisar as informações do evento no JSON ou prompt
        2. Caso os dados estejam incompletos ou inválidos, solicitar as informações faltantes
        3. Extraia o user_id do PROMPT, ele vai estar claro no inicio deste prompt = user_id: <string_do_id>.
        4. Adicionar o user_id ao objeto JSON ("user_id": "string"). 
        5. usa a ferramenta create_event para criar o evento
        6. Retornar o link do evento criado ou erro caso não consiga criar o evento
    """,
    tools=[mcp_toolset],
)

root_agent = scheduler_agent
