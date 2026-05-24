from __future__ import annotations

import datetime
from typing import TYPE_CHECKING

from sqlalchemy import DateTime, Enum, ForeignKey, Text, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import Base
from app.models.enums import CorRisco

if TYPE_CHECKING:
    from app.models.paciente import Paciente


class Triagem(Base):
    __tablename__ = "triagens"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    paciente_id: Mapped[int] = mapped_column(
        ForeignKey("pacientes.id", ondelete="RESTRICT"), index=True, nullable=False
    )
    cor_risco: Mapped[CorRisco] = mapped_column(
        Enum(CorRisco, name="cor_risco"), nullable=False
    )
    queixa_principal: Mapped[str] = mapped_column(Text, nullable=False)
    created_at: Mapped[datetime.datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )

    paciente: Mapped[Paciente] = relationship("Paciente", back_populates="triagens")
