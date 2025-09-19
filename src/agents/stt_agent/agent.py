from google.adk.agents.llm_agent import Agent
from .tools import stt_tool

stt_agent = Agent(
    name="stt_agent",
    model="gemini-2.0-flash-001",
    description="Agente que transcreve áudios usando Whisper",
    instruction=
    """
    Você é um agente que transcreve áudios usando Whisper.
    Use a ferramenta whisper_stt para converter o áudio em texto.
    responda em português do Brasil.
    Retorne o texto transcrito.
    """,
    tools=[stt_tool],
)

root_agent = stt_agent