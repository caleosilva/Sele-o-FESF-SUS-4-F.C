from typing import Callable

from sqlalchemy.orm import Query, Session

from app.models.paciente import Paciente
from app.repositories.base import BaseRepository


def _filtro_nome(query: Query, valor: str) -> Query:
    return query.filter(Paciente.nome.ilike(f"%{valor}%"))


def _filtro_cpf(query: Query, valor: str) -> Query:
    digits = "".join(c for c in valor if c.isdigit())
    return query.filter(Paciente.cpf.ilike(f"%{digits}%"))


_FILTROS: dict[str, Callable[[Query, str], Query]] = {
    "nome": _filtro_nome,
    "cpf": _filtro_cpf,
}


class PacienteRepository(BaseRepository[Paciente]):
    def __init__(self, db: Session) -> None:
        super().__init__(Paciente, db)

    def get_by_cpf(self, cpf: str) -> Paciente | None:
        return self.db.query(Paciente).filter(Paciente.cpf == cpf).first()

    def get_all_filtered(
        self,
        skip: int = 0,
        limit: int = 100,
        campo: str | None = None,
        busca: str | None = None,
    ) -> tuple[list[Paciente], int]:
        query = self.db.query(Paciente)
        if campo and busca and campo in _FILTROS:
            query = _FILTROS[campo](query, busca)
        total = query.count()
        data = query.order_by(Paciente.nome).offset(skip).limit(limit).all()
        return data, total
