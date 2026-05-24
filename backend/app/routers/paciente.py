from typing import Literal

from fastapi import APIRouter, Depends, status

from app.auth.dependencies import get_current_user
from app.dependencies import get_paciente_service
from app.models.usuario import Usuario
from app.schemas.paciente import PacienteCreate, PacienteOut, PacientesPaginados, PacienteUpdate
from app.services.paciente import PacienteService

router = APIRouter(prefix="/pacientes", tags=["pacientes"])


@router.post("/", response_model=PacienteOut, status_code=status.HTTP_201_CREATED)
def criar_paciente(
    data: PacienteCreate,
    service: PacienteService = Depends(get_paciente_service),
    _: Usuario = Depends(get_current_user),
):
    return service.create(data)


@router.get("/", response_model=PacientesPaginados)
def listar_pacientes(
    skip: int = 0,
    limit: int = 100,
    campo: Literal["nome", "cpf"] | None = None,
    busca: str | None = None,
    service: PacienteService = Depends(get_paciente_service),
    _: Usuario = Depends(get_current_user),
):
    dados, total = service.get_all(skip=skip, limit=limit, campo=campo, busca=busca)
    return PacientesPaginados(data=dados, total=total)


@router.get("/{paciente_id}", response_model=PacienteOut)
def buscar_paciente(
    paciente_id: int,
    service: PacienteService = Depends(get_paciente_service),
    _: Usuario = Depends(get_current_user),
):
    return service.get_by_id(paciente_id)


@router.put("/{paciente_id}", response_model=PacienteOut)
def atualizar_paciente(
    paciente_id: int,
    data: PacienteUpdate,
    service: PacienteService = Depends(get_paciente_service),
    _: Usuario = Depends(get_current_user),
):
    return service.update(paciente_id, data)


@router.delete("/{paciente_id}", status_code=status.HTTP_204_NO_CONTENT)
def excluir_paciente(
    paciente_id: int,
    service: PacienteService = Depends(get_paciente_service),
    _: Usuario = Depends(get_current_user),
):
    service.delete(paciente_id)
