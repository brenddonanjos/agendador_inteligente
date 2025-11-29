import os
from fastapi import APIRouter, Request
from api.google_auth_service import get_calendar_service
from google_auth_oauthlib.flow import Flow


class GoogleAuthController:
    def __init__(self):
        pass

    def get_auth_status(self):
        """Verifica se o usuário está autenticado com o Google Calendar"""
        try:
            get_calendar_service()
            return {"authenticated": True, "message": "Usuário autenticado"}
        except Exception as e:
            return {
                "authenticated": False,
                "message": f"Usuário não autenticado {str(e)}",
            }

    def get_url_auth(self):
        """Retorna a URL de autenticação do Google"""
        try:
            os.environ['OAUTHLIB_INSECURE_TRANSPORT'] = '1'
            script_dir = os.path.dirname(os.path.abspath(__file__))
            credentials_path = os.path.join(
                script_dir, "google_client_secret.json"
            )

            flow = Flow.from_client_secrets_file(
                credentials_path,
                scopes=["https://www.googleapis.com/auth/calendar"],
                redirect_uri="http://localhost:5000/auth/google/callback",
            )

            auth_url, _ = flow.authorization_url(prompt="consent")

            # Armazenar o flow temporariamente (em produção, use Redis/DB)
            global temp_flow
            temp_flow = flow

            return {"auth_url": auth_url}
        except Exception as e:
            return {"error": f"Erro ao gerar URL de autenticação: {str(e)}"}
    
    def google_callback(self, request: Request):
        """Callback do Google OAuth"""
        try:
            global temp_flow
            if not temp_flow:
                return {"error": "Sessão de autenticação expirada"}
            
            # Capturar o código de autorização da query string
            authorization_response = str(request.url)
            temp_flow.fetch_token(authorization_response=authorization_response)
            
            # Salvar as credenciais
            script_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
            token_path = os.path.join(script_dir, "token.json")
            
            creds = temp_flow.credentials
            with open(token_path, 'w') as token:
                token.write(creds.to_json())
            
            # Limpar o flow temporário
            temp_flow = None
            
            return {
                "message": "Autenticação realizada com sucesso! Você pode fechar esta aba.",
                "authenticated": True
            }
        except Exception as e:
            return {"error": f"Erro na autenticação: {str(e)}"}



def google_auth_router(controller: GoogleAuthController) -> APIRouter:
    router = APIRouter(prefix="/auth/google")

    @router.get("/status")
    async def get_auth_status():
        return controller.get_auth_status()

    @router.get("/url-auth")
    async def get_url_auth():
        return controller.get_url_auth()

    @router.get("/callback")
    async def google_callback(request: Request):
        return controller.google_callback(request)

    return router
