from pydantic import BaseModel, EmailStr


class LoginRequest(BaseModel):
    email: EmailStr
    senha: str


class MeResponse(BaseModel):
    email: str
    perfil: str


class TokenPayload(BaseModel):
    sub: str
    perfil: str
