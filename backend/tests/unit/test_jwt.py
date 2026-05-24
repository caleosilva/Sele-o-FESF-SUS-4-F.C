"""Testes unitários para geração e verificação de tokens JWT."""

import pytest
from datetime import timedelta as original_timedelta
from jose import JWTError

from app.auth.jwt import create_access_token, decode_token

pytestmark = pytest.mark.unit


def test_should_create_valid_token_with_correct_payload():
    token = create_access_token("user@test.com", "enfermeiro")
    payload = decode_token(token)
    assert payload["sub"] == "user@test.com"
    assert payload["perfil"] == "enfermeiro"


def test_should_include_expiration_in_token_payload():
    token = create_access_token("user@test.com", "medico")
    payload = decode_token(token)
    assert "exp" in payload


def test_should_reject_token_with_tampered_signature():
    token = create_access_token("user@test.com", "enfermeiro")
    tampered = token[:-5] + "XXXXX"
    with pytest.raises(JWTError):
        decode_token(tampered)


def test_should_reject_token_signed_with_wrong_key(monkeypatch):
    import app.auth.jwt as jwt_mod

    monkeypatch.setattr(jwt_mod.settings, "SECRET_KEY", "outra-chave-secreta")
    token_outra_chave = create_access_token("user@test.com", "enfermeiro")
    monkeypatch.setattr(jwt_mod.settings, "SECRET_KEY", "chave-original-diferente")
    with pytest.raises(JWTError):
        decode_token(token_outra_chave)


def test_should_reject_expired_token(monkeypatch):
    import app.auth.jwt as jwt_mod

    # Substitui timedelta no namespace do módulo para forçar expiração imediata
    monkeypatch.setattr(
        jwt_mod,
        "timedelta",
        lambda **_: original_timedelta(seconds=-1),
    )
    token = create_access_token("user@test.com", "enfermeiro")
    with pytest.raises(JWTError):
        decode_token(token)
