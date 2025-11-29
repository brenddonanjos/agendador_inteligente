import whisper
from google.adk.tools import FunctionTool
import os

_model = None


def get_model(model_name: str = "medium"):
    global _model
    if _model is None:
        _model = whisper.load_model(model_name)
    return _model

def whisper_stt(audio_path: str) -> str:
    script_dir = os.path.dirname(os.path.abspath(__file__))
    audio_path = os.path.join(script_dir, audio_path)

    try:
        model = get_model("medium")
        result = model.transcribe(audio_path, language="pt")
        return result["text"]
    except Exception as e:
        return f"Erro na transcrição: {str(e)}"

stt_tool = FunctionTool(func=whisper_stt)
