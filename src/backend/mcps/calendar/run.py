from typing import Any
from fastmcp import FastMCP
from google.oauth2.credentials import Credentials
from google_auth_oauthlib.flow import InstalledAppFlow
from google.auth.transport.requests import Request
from googleapiclient.discovery import build
import os.path
import datetime
import sys

SCOPES = ["https://www.googleapis.com/auth/calendar"]

mcp = FastMCP("Calendar MCP")

def get_calendar_service():
    """Autentica e retorna um objeto de serviço para interagir com a API."""

    script_dir = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
    token_path = os.path.join(script_dir, "token.json")
    credentials_path = os.path.join(script_dir, "google_client_secret.json")
    
    creds = None
    # Busca o token de acesso do usuário.
    if os.path.exists(token_path):
        creds = Credentials.from_authorized_user_file(token_path, SCOPES)

    # Se não houver credenciais válidas, pede para o usuário fazer login.
    if not creds or not creds.valid:
        if creds and creds.expired and creds.refresh_token:
            creds.refresh(Request())
        else:
            # Carrega as credenciais do arquivo baixado do GCP.
            flow = InstalledAppFlow.from_client_secrets_file(credentials_path, SCOPES)
            creds = flow.run_local_server(port=0)

        # Armazena o token de acesso do usuário.
        with open(token_path, "w") as token:
            token.write(creds.to_json())

    calendar_service = build("calendar", "v3", credentials=creds)

    return calendar_service

@mcp.tool
def create_event(event_details: dict[str, Any]) -> dict:
    """Cria um evento no google calendar"""
    try:
        calendar_service = get_calendar_service()
        start_time = datetime.datetime.fromisoformat(
            f"{event_details['date']}T{event_details['time']}"
        )
        event = {
            "summary": event_details.get("name", ""),
            "location": event_details.get("location", ""),
            "description": f"Tipo: {event_details['type']}\n"
            f"Descrição: {event_details['description']}\n"
            f"Alvo ({event_details['target']['type']}): {event_details['target']['name']}\n"
            f"Detalhes do Alvo: {event_details['target']['description']}\n"
            f"Sugestão: {event_details.get('suggestion', '')}",
            "start": {
                "dateTime": start_time.isoformat(),
                "timeZone": "America/Sao_Paulo",
            },
            "end": {
                "dateTime": (start_time + datetime.timedelta(hours=1)).isoformat(),
                "timeZone": "America/Sao_Paulo",
            },
        }

        created_event = (
            calendar_service.events().insert(calendarId="primary", body=event).execute()
        )
        return {"status": "success", "link": created_event.get("htmlLink")}
    except Exception as e:
        error_msg = str(e)
        if "invalid_grant" in error_msg or "expired" in error_msg.lower() or "revoked" in error_msg.lower():
            return {"error": "Ocorreu um erro ao criar o evento. O token de acesso expirou ou foi revogado. Por favor, tente novamente mais tarde."}
        elif "google_client_secret.json" in error_msg:
            return {"error": "Arquivo google_client_secret.json não encontrado. Configure as credenciais do Google Calendar primeiro."}
        else:
            return {"error": f"Erro ao criar evento: {error_msg}"}

def setup_auth():
    """Executa apenas a autenticação para gerar o token.json"""
    print("Iniciando autenticação com Google Calendar...")
    print("O navegador será aberto em instantes...")
    try:
        get_calendar_service()
        print("Autenticação concluída com sucesso!")
        return True
    except Exception as e:
        print(f"Erro na autenticação: {e}")
        return False

if __name__ == "__main__":    
    # Se passar --setup como argumento, faz apenas autenticação
    if len(sys.argv) > 1 and sys.argv[1] == "--setup":
        setup_auth()
    else:
        mcp.run(transport="stdio")

