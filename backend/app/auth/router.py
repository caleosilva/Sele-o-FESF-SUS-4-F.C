from fastapi import APIRouter, Depends, HTTPException, Response, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session

from app.auth.jwt import create_access_token
from app.auth.dependencies import get_current_user
from app.auth.schemas import LoginRequest, MeResponse
from app.auth.security import verify_password
from app.config import settings
from app.database import get_db
from app.models.usuario import Usuario

router = APIRouter(prefix="/auth", tags=["auth"])

_COOKIE_NAME = "access_token"

_INVALID_CREDENTIALS = HTTPException(
    status_code=status.HTTP_401_UNAUTHORIZED,
    detail="E-mail ou senha incorretos.",
)


@router.post("/login", response_model=MeResponse, summary="Login via JSON")
def login(data: LoginRequest, response: Response, db: Session = Depends(get_db)) -> MeResponse:
    user = _authenticate(db, data.email, data.senha)
    token = create_access_token(user.email, user.perfil.value)
    response.set_cookie(
        key=_COOKIE_NAME,
        value=token,
        httponly=True,
        samesite="lax",
        secure=settings.APP_ENV != "development",
        max_age=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
    )
    return MeResponse(email=user.email, perfil=user.perfil.value)


@router.post(
    "/login/form",
    response_model=MeResponse,
    summary="Login via form (Swagger UI)",
    include_in_schema=False,
)
def login_form(
    response: Response,
    form: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db),
) -> MeResponse:
    user = _authenticate(db, form.username, form.password)
    token = create_access_token(user.email, user.perfil.value)
    response.set_cookie(
        key=_COOKIE_NAME,
        value=token,
        httponly=True,
        samesite="lax",
        secure=settings.APP_ENV != "development",
        max_age=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
    )
    return MeResponse(email=user.email, perfil=user.perfil.value)


@router.get("/me", response_model=MeResponse, summary="Retorna o usuário autenticado")
def me(current_user: Usuario = Depends(get_current_user)) -> MeResponse:
    return MeResponse(email=current_user.email, perfil=current_user.perfil.value)


@router.post("/logout", status_code=status.HTTP_204_NO_CONTENT, summary="Encerra a sessão")
def logout(response: Response) -> None:
    response.delete_cookie(key=_COOKIE_NAME, samesite="lax")


def _authenticate(db: Session, email: str, senha: str) -> Usuario:
    user = (
        db.query(Usuario)
        .filter(Usuario.email == email, Usuario.is_active.is_(True))
        .first()
    )
    if not user or not verify_password(senha, user.senha_hash):
        raise _INVALID_CREDENTIALS
    return user
