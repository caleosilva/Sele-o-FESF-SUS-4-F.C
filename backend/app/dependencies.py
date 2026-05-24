from sqlalchemy.orm import Session

from app.database import get_db
from app.services.paciente import PacienteService
from fastapi import Depends


def get_paciente_service(db: Session = Depends(get_db)) -> PacienteService:
    return PacienteService(db)
