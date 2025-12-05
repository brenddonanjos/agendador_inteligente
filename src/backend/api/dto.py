from typing import Optional
from pydantic import BaseModel

class ResponseScheduleDTO(BaseModel):
    success: bool
    message: str
    link: Optional[str] = None