from sqlalchemy.orm import Session

from app.exceptions.handlers import NotFoundError
from app.models.triagem import Triagem
from app.repositories.paciente import PacienteRepository
from app.repositories.triagem import TriagemRepository
from app.schemas.triagem import TriagemCreate


class TriagemService:
    def __init__(self, db: Session) -> None:
        self.repo = TriagemRepository(db)
        self.paciente_repo = PacienteRepository(db)

    def create(self, data: TriagemCreate) -> Triagem:
        if not self.paciente_repo.get_by_id(data.paciente_id):
            raise NotFoundError("Paciente", data.paciente_id)
        return self.repo.create(Triagem(**data.model_dump()))

    def get_fila(self, skip: int = 0, limit: int = 100) -> list[Triagem]:
        return self.repo.get_fila(skip=skip, limit=limit)
