from fastapi import APIRouter, UploadFile, File, HTTPException

ALLOWED_EXTENSIONS = {'flac', 'mp3', 'wav'}

def app_router() -> APIRouter:
    router = APIRouter(
        prefix="/appointments",
        tags=["Appointments"]
    )

    @router.post("/", summary="Create an appointment")
    async def create_appointment(audio: UploadFile = File(...)):
        ext = audio.filename.split('.')[-1].lower()
        if ext not in ALLOWED_EXTENSIONS:
            raise HTTPException(status_code=400, detail="Formato de áudio não permitido.")

        return {
            "filename": audio.filename,
            "content_type": audio.content_type,
            "message": "Arquivo recebido com sucesso."
        }
    
    return router