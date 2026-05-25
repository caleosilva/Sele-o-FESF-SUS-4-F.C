import pytest

pytestmark = pytest.mark.integration

_PACIENTE_BASE = {
    "nome": "Carlos Souza",
    "cpf": "55566677788",
    "data_nascimento": "1970-03-20",
}

_QUEIXA = "Dor torácica intensa com irradiação para o braço esquerdo"


async def _criar_paciente(client, cpf: str = "55566677788") -> int:
    payload = {**_PACIENTE_BASE, "cpf": cpf}
    r = await client.post("/pacientes/", json=payload)
    assert r.status_code == 201, f"Falha ao criar paciente: {r.text}"
    return r.json()["id"]


async def test_should_create_triagem_and_return_201_when_enfermeiro(auth_client):
    paciente_id = await _criar_paciente(auth_client)

    response = await auth_client.post(
        "/triagens/",
        json={
            "paciente_id": paciente_id,
            "cor_risco": "vermelho",
            "queixa_principal": _QUEIXA,
        },
    )

    assert response.status_code == 201
    body = response.json()
    assert body["paciente_id"] == paciente_id
    assert body["cor_risco"] == "vermelho"
    assert "id" in body


async def test_should_return_403_when_recepcionista_tries_to_create_triagem(
    recepcionista_client,
):
    response = await recepcionista_client.post(
        "/triagens/",
        json={
            "paciente_id": 1,
            "cor_risco": "verde",
            "queixa_principal": "Consulta de rotina sem urgência aparente",
        },
    )

    assert response.status_code == 403


async def test_should_return_401_when_creating_triagem_without_authentication(async_client):
    response = await async_client.post(
        "/triagens/",
        json={
            "paciente_id": 1,
            "cor_risco": "verde",
            "queixa_principal": "Consulta de rotina sem urgência aparente",
        },
    )

    assert response.status_code == 401


async def test_should_return_404_when_paciente_does_not_exist(auth_client):
    response = await auth_client.post(
        "/triagens/",
        json={
            "paciente_id": 999999,
            "cor_risco": "verde",
            "queixa_principal": "Consulta de rotina sem urgência aparente",
        },
    )

    assert response.status_code == 404


async def test_should_return_ordered_queue_from_fila_endpoint(auth_client):
    p1_id = await _criar_paciente(auth_client, cpf="11100011100")
    p2_id = await _criar_paciente(auth_client, cpf="22200022200")

    await auth_client.post(
        "/triagens/",
        json={"paciente_id": p1_id, "cor_risco": "verde", "queixa_principal": _QUEIXA},
    )
    await auth_client.post(
        "/triagens/",
        json={"paciente_id": p2_id, "cor_risco": "vermelho", "queixa_principal": _QUEIXA},
    )

    response = await auth_client.get("/triagens/fila")

    assert response.status_code == 200
    fila = response.json()
    assert isinstance(fila, list)
    assert len(fila) >= 2

    cores = [t["cor_risco"] for t in fila]
    idx_vermelho = next(i for i, c in enumerate(cores) if c == "vermelho")
    idx_verde = next(i for i, c in enumerate(cores) if c == "verde")
    assert idx_vermelho < idx_verde


async def test_should_return_triagem_linked_to_correct_paciente(auth_client):
    paciente_id = await _criar_paciente(auth_client, cpf="33300033300")

    created = (
        await auth_client.post(
            "/triagens/",
            json={
                "paciente_id": paciente_id,
                "cor_risco": "amarelo",
                "queixa_principal": _QUEIXA,
            },
        )
    ).json()

    assert created["paciente_id"] == paciente_id
