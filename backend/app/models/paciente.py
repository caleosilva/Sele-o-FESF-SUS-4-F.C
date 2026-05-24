from __future__ import annotations

import datetime
from typing import TYPE_CHECKING

from sqlalchemy import Date, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import Base, TimestampMixin

if TYPE_CHECKING:
    from app.models.triagem import Triagem


class Paciente(Base, TimestampMixin):
    __tablename__ = "pacientes"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    nome: Mapped[str] = mapped_column(String(100), nullable=False)
    cpf: Mapped[str] = mapped_column(String(11), unique=True, index=True, nullable=False)
    data_nascimento: Mapped[datetime.date] = mapped_column(Date, nullable=False)
    telefone: Mapped[str | None] = mapped_column(String(20), nullable=True)

    triagens: Mapped[list[Triagem]] = relationship("Triagem", back_populates="paciente")
