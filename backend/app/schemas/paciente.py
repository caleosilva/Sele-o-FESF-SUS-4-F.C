import re
from datetime import date, datetime

from pydantic import BaseModel, Field, field_validator


def _validar_data_nascimento(v: date | None) -> date | None:
    if v is not None and v > date.today():
        raise ValueError("A data de nascimento não pode ser futura.")
    return v


class PacienteBase(BaseModel):
    nome: str
    cpf: str
    data_nascimento: date
    telefone: str | None = None

    @field_validator("cpf")
    @classmethod
    def normalizar_cpf(cls, v: str) -> str:
        digits = re.sub(r"\D", "", v)
        if len(digits) != 11:
            raise ValueError("CPF deve ter exatamente 11 dígitos numéricos.")
        return digits


class PacienteCreate(PacienteBase):
    @field_validator("data_nascimento")
    @classmethod
    def data_nascimento_nao_futura(cls, v: date) -> date:
        return _validar_data_nascimento(v)


class PacienteUpdate(BaseModel):
    nome: str | None = Field(None, min_length=3, max_length=100)
    data_nascimento: date | None = None
    telefone: str | None = None

    @field_validator("data_nascimento")
    @classmethod
    def data_nascimento_nao_futura(cls, v: date | None) -> date | None:
        return _validar_data_nascimento(v)


class PacienteResumo(BaseModel):
    model_config = {"from_attributes": True}

    id: int
    nome: str
    cpf: str


class PacienteOut(PacienteBase):
    model_config = {"from_attributes": True}

    id: int
    created_at: datetime
    updated_at: datetime


class PacientesPaginados(BaseModel):
    data: list[PacienteOut]
    total: int
