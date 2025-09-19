from fastapi import FastAPI
import uvicorn

app = FastAPI(
    title="Assistente inteligente",
    description="Assistente Inteligente com Cadeia de Agentes de IA para Agendamento e Gestão de Compromissos",
    version="1.0.0",
)

@app.get("/")
async def root():
    return {"message": "Assistente Inteligente"}


if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port="5000", access_log=True)