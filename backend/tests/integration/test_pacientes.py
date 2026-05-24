"""Testes de integração para os endpoints de pacientes (/pacientes)."""

import pytest

pytestmark = pytest.mark.integration

_PAYLOAD_VALIDO = {
    "nome": "Maria da Silva",
    "cpf": "98765432100",
    "data_nascimento": "1985-06-15",
}

_PAYLOAD_ALTERNATIVO = {
    "nome": "Pedro Souza",
    "cpf": "11122233344",
    "data_nascimento": "1978-03-22",
}


async def test_should_create_patient_and_return_201_when_authenticated(auth_client):
    response = await auth_client.post("/pacientes/", json=_PAYLOAD_VALIDO)

    assert response.status_code == 201
    body = response.json()
    assert body["cpf"] == "98765432100"
    assert body["nome"] == "Maria da Silva"
    assert "id" in body


async def test_should_return_401_when_creating_patient_without_authentication(async_client):
    response = await async_client.post("/pacientes/", json=_PAYLOAD_VALIDO)

    assert response.status_code == 401


async def test_should_return_409_when_cpf_already_exists(auth_client):
    await auth_client.post("/pacientes/", json=_PAYLOAD_VALIDO)
    response = await auth_client.post("/pacientes/", json=_PAYLOAD_VALIDO)

    assert response.status_code == 409


async def test_should_return_422_when_cpf_has_fewer_than_11_digits(auth_client):
    payload = {**_PAYLOAD_VALIDO, "cpf": "12345"}
    response = await auth_client.post("/pacientes/", json=payload)

    assert response.status_code == 422


async def test_should_return_422_when_data_nascimento_is_in_the_future(auth_client):
    payload = {**_PAYLOAD_VALIDO, "data_nascimento": "2099-01-01"}
    response = await auth_client.post("/pacientes/", json=payload)

    assert response.status_code == 422


async def test_should_return_paginated_patient_list_when_authenticated(auth_client):
    await auth_client.post("/pacientes/", json=_PAYLOAD_VALIDO)
    await auth_client.post("/pacientes/", json=_PAYLOAD_ALTERNATIVO)

    response = await auth_client.get("/pacientes/")

    assert response.status_code == 200
    body = response.json()
    assert "data" in body
    assert "total" in body
    assert body["total"] >= 2


async def test_should_return_patient_by_id(auth_client):
    criado = (await auth_client.post("/pacientes/", json=_PAYLOAD_VALIDO)).json()
    response = await auth_client.get(f"/pacientes/{criado['id']}")

    assert response.status_code == 200
    assert response.json()["id"] == criado["id"]
    assert response.json()["cpf"] == criado["cpf"]


async def test_should_return_404_when_patient_does_not_exist(auth_client):
    response = await auth_client.get("/pacientes/999999")

    assert response.status_code == 404
