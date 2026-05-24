from sqlalchemy import case
from sqlalchemy.orm import Session, joinedload

from app.models.enums import CorRisco
from app.models.triagem import Triagem
from app.repositories.base import BaseRepository

# Expressão de prioridade: vermelho=1 (maior) → verde=4 (menor)
_PRIORIDADE = case(
    (Triagem.cor_risco == CorRisco.vermelho, 1),
    (Triagem.cor_risco == CorRisco.laranja, 2),
    (Triagem.cor_risco == CorRisco.amarelo, 3),
    (Triagem.cor_risco == CorRisco.verde, 4),
    else_=5,
)


class TriagemRepository(BaseRepository[Triagem]):
    def __init__(self, db: Session) -> None:
        super().__init__(Triagem, db)

    def get_fila(self, skip: int = 0, limit: int = 100) -> list[Triagem]:
        """Retorna triagens ordenadas por prioridade de risco e, dentro da mesma cor, por chegada."""
        return (
            self.db.query(Triagem)
            .options(joinedload(Triagem.paciente))
            .order_by(_PRIORIDADE, Triagem.created_at.asc())
            .offset(skip)
            .limit(limit)
            .all()
        )
