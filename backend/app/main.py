from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.exc import IntegrityError

from app.auth import router as auth_router
from app.exceptions.handlers import NotFoundError, integrity_error_handler, not_found_handler
from app.routers import paciente, triagem

app = FastAPI(title="FESFSUS — Sistema de Triagem", version="0.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.add_exception_handler(IntegrityError, integrity_error_handler)
app.add_exception_handler(NotFoundError, not_found_handler)

app.include_router(auth_router.router)
app.include_router(paciente.router)
app.include_router(triagem.router)


@app.get("/health", tags=["health"])
def health() -> dict:
    return {"status": "ok"}
