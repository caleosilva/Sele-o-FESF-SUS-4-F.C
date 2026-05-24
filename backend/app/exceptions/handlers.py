from fastapi import Request
from fastapi.responses import JSONResponse
from sqlalchemy.exc import IntegrityError


async def integrity_error_handler(request: Request, exc: IntegrityError) -> JSONResponse:
    return JSONResponse(status_code=409, content={"detail": "Conflito: registro duplicado."})


async def not_found_handler(request: Request, exc: Exception) -> JSONResponse:
    return JSONResponse(status_code=404, content={"detail": str(exc)})


class NotFoundError(Exception):
    def __init__(self, entity: str, id: int) -> None:
        super().__init__(f"{entity} com id={id} não encontrado.")
