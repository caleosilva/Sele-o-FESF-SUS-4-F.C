from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from app.auth.dependencies import get_current_user, require_perfil
from app.database import get_db
from app.models.enums import PerfilUsuario
from app.models.usuario import Usuario
from app.schemas.triagem import TriagemCreate, TriagemFilaOut, TriagemOut
from app.services.triagem import TriagemService

router = APIRouter(prefix="/triagens", tags=["triagens"])


def get_service(db: Session = Depends(get_db)) -> TriagemService:
    return TriagemService(db)


@router.post("/", response_model=TriagemOut, status_code=status.HTTP_201_CREATED)
def criar_triagem(
    data: TriagemCreate,
    service: TriagemService = Depends(get_service),
    _: Usuario = Depends(require_perfil(PerfilUsuario.enfermeiro)),
):
    return service.create(data)


@router.get("/fila", response_model=list[TriagemFilaOut])
def fila_de_atendimento(
    skip: int = 0,
    limit: int = 100,
    service: TriagemService = Depends(get_service),
    _: Usuario = Depends(get_current_user),
):
    return service.get_fila(skip=skip, limit=limit)
