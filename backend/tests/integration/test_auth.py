import pytest

pytestmark = pytest.mark.integration


async def test_should_return_user_data_and_set_cookie_when_credentials_are_valid(
    async_client, usuario_enfermeiro
):
    response = await async_client.post(
        "/auth/login",
        json={"email": "enfermeiro@teste.com", "senha": "senha123"},
    )

    assert response.status_code == 200
    body = response.json()
    assert body["email"] == "enfermeiro@teste.com"
    assert body["perfil"] == "enfermeiro"
    assert "access_token" in response.cookies


async def test_should_return_401_when_password_is_wrong(async_client, usuario_enfermeiro):
    response = await async_client.post(
        "/auth/login",
        json={"email": "enfermeiro@teste.com", "senha": "senha_incorreta"},
    )

    assert response.status_code == 401


async def test_should_return_401_when_email_does_not_exist(async_client):
    response = await async_client.post(
        "/auth/login",
        json={"email": "nao_cadastrado@teste.com", "senha": "senha123"},
    )

    assert response.status_code == 401


async def test_should_return_current_user_info_when_token_is_valid(
    auth_client, usuario_enfermeiro
):
    response = await auth_client.get("/auth/me")

    assert response.status_code == 200
    assert response.json()["email"] == "enfermeiro@teste.com"
    assert response.json()["perfil"] == "enfermeiro"


async def test_should_return_401_when_accessing_me_without_token(async_client):
    response = await async_client.get("/auth/me")

    assert response.status_code == 401


async def test_should_return_204_and_clear_cookie_on_logout(auth_client):
    response = await auth_client.post("/auth/logout")

    assert response.status_code == 204
