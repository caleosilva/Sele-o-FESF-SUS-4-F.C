from datetime import datetime, timedelta, timezone

from jose import jwt

from app.config import settings

_ALGORITHM = "HS256"


def create_access_token(subject: str, perfil: str) -> str:
    expire = datetime.now(timezone.utc) + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    payload = {"sub": subject, "perfil": perfil, "exp": expire}
    return jwt.encode(payload, settings.SECRET_KEY, algorithm=_ALGORITHM)


def decode_token(token: str) -> dict:
    """Lança JWTError se o token for inválido ou expirado."""
    return jwt.decode(token, settings.SECRET_KEY, algorithms=[_ALGORITHM])
