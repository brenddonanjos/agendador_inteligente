from pydantic import BaseModel, Field
from typing import Optional


class Target(BaseModel):
    name: str = Field(description="nome da pessoa alvo")
    type: str = Field(description="tipo de pessoa alvo")
    description: str = Field(description="descrição da pessoa alvo")


class Event(BaseModel):
    type: str = Field(
        description="tipo de compromisso (consulta médica, reunião, aniversário, etc)"
    )
    name: str = Field(description="nome do evento")
    description: str = Field(description="descrição do evento")
    date: str = Field(description="data do evento")
    time: str = Field(description="horário do evento")
    target: Target = Field(
        description="informações da pessoa alvo participante/aniversariante/empresa (caso tenha o nome, descrição)"
    )
    location: str = Field(description="local do evento")
    suggestion: Optional[str] = Field(description="sugestão personalizada para o usuário")
