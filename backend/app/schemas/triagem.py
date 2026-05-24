from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field

from app.models.enums import CorRisco
from app.schemas.paciente import PacienteResumo


class TriagemCreate(BaseModel):
    paciente_id: int
    cor_risco: CorRisco
    queixa_principal: str = Field(min_length=5, max_length=500)


class TriagemOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    paciente_id: int
    cor_risco: CorRisco
    queixa_principal: str
    created_at: datetime


class TriagemFilaOut(TriagemOut):
    paciente: PacienteResumo
