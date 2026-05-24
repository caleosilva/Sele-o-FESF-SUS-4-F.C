from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.models.paciente import Paciente
from app.repositories.paciente import PacienteRepository
from app.schemas.paciente import PacienteCreate, PacienteUpdate


class PacienteService:
    def __init__(self, db: Session) -> None:
        self.repo = PacienteRepository(db)

    def create(self, data: PacienteCreate) -> Paciente:
        if self.repo.get_by_cpf(data.cpf):
            raise HTTPException(status.HTTP_409_CONFLICT, "CPF já cadastrado.")
        return self.repo.create(Paciente(**data.model_dump()))

    def get_all(
        self,
        skip: int = 0,
        limit: int = 100,
        campo: str | None = None,
        busca: str | None = None,
    ) -> tuple[list[Paciente], int]:
        return self.repo.get_all_filtered(skip=skip, limit=limit, campo=campo, busca=busca)

    def get_by_id(self, paciente_id: int) -> Paciente:
        paciente = self.repo.get_by_id(paciente_id)
        if not paciente:
            raise HTTPException(
                status.HTTP_404_NOT_FOUND,
                f"Paciente {paciente_id} não encontrado.",
            )
        return paciente

    def update(self, paciente_id: int, data: PacienteUpdate) -> Paciente:
        paciente = self.get_by_id(paciente_id)
        for campo, valor in data.model_dump(exclude_none=True).items():
            setattr(paciente, campo, valor)
        return self.repo.update(paciente)

    def delete(self, paciente_id: int) -> None:
        paciente = self.get_by_id(paciente_id)
        self.repo.delete(paciente)
