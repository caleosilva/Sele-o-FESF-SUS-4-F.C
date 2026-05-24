from collections.abc import Callable

from fastapi import Cookie, Depends, HTTPException, status
from jose import JWTError
from sqlalchemy.orm import Session

from app.auth.jwt import decode_token
from app.database import get_db
from app.models.enums import PerfilUsuario
from app.models.usuario import Usuario

_UNAUTHORIZED = HTTPException(
    status_code=status.HTTP_401_UNAUTHORIZED,
    detail="Token inválido ou expirado.",
)


def get_current_user(
    access_token: str | None = Cookie(default=None),
    db: Session = Depends(get_db),
) -> Usuario:
    if not access_token:
        raise _UNAUTHORIZED
    try:
        payload = decode_token(access_token)
        email: str | None = payload.get("sub")
        if not email:
            raise _UNAUTHORIZED
    except JWTError:
        raise _UNAUTHORIZED

    user = (
        db.query(Usuario)
        .filter(Usuario.email == email, Usuario.is_active.is_(True))
        .first()
    )
    if user is None:
        raise _UNAUTHORIZED
    return user


def require_perfil(*perfis: PerfilUsuario) -> Callable[..., Usuario]:
    def _check(current_user: Usuario = Depends(get_current_user)) -> Usuario:
        if current_user.perfil not in perfis:
            nomes = ", ".join(p.value for p in perfis)
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Acesso restrito ao(s) perfil(is): {nomes}.",
            )
        return current_user

    return _check
