import os
from google.oauth2.credentials import Credentials
from google_auth_oauthlib.flow import InstalledAppFlow
from google.auth.transport.requests import Request
from googleapiclient.discovery import build

SCOPES = ["https://www.googleapis.com/auth/calendar"]


def get_calendar_service():
    """Autentica e retorna um objeto de serviço para interagir com a API."""

    script_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
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
