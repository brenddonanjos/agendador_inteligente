import os
import uuid
from fastapi import APIRouter, File, UploadFile

from api.agent_flow_service import AgentFlowService

class AgentFlowController:
    def __init__(self, service: AgentFlowService):
        self.service = service

    async def schedule(self, file: UploadFile = File(...)):
        temp_audio_path = None
        try:
            unique_id = str(uuid.uuid4())[:8]
            file_extension = os.path.splitext(file.filename)[1] if file.filename else ".mp3"
            temp_audio_name = f"temp_{unique_id}{file_extension}"
            temp_audio_path = f"agents/stt_agent/{temp_audio_name}"
            session = f"session_{unique_id}"

            content = await file.read()
            with open(temp_audio_path, "wb") as f:
                f.write(content)

            prompt = f"Transcreva o áudio {temp_audio_name} para texto"
            user_id = "user_default"

            response_stt, err = await self.service.execute_stt(
                prompt=prompt, user_id=user_id, session=session
            )
            if err:
                return {"message": "Erro na transcrição do áudio", "error": err}

            response_npl, err = await self.service.execute_npl(
                prompt=response_stt, user_id=user_id, session=session
            )
            if err:
                return {
                    "message": "Erro na conversão do texto para objeto json",
                    "error": err,
                }

            response_suggestor, err = await self.service.execute_suggestor(
                prompt=response_npl, user_id=user_id, session=session
            )
            if err:
                return {"message": "Erro na criação da sugestão", "error": err}

            response_scheduler, err = await self.service.execute_scheduler(
                prompt=response_suggestor,
                user_id=user_id,
                session=session
            )
            if err:
                return {"message": "Erro no agendamento", "error": err}

            return {
                "message": response_scheduler,
                "error": None
            }, 200
        except Exception as e:
            return {"message": "Erro ao receber o arquivo", "error": str(e)}, 500
        finally:
            if temp_audio_path:
                os.remove(temp_audio_path)

def agent_flow_router(controller: AgentFlowController) -> APIRouter:
    router = APIRouter(prefix="/agents")

    @router.post("/schedule")
    async def schedule(file: UploadFile = File(...)):
        return await controller.schedule(file)

    return router