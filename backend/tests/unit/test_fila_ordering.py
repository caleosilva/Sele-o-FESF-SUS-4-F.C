"""Testes unitários para a lógica de ordenação da fila de triagem.

Verifica que TriagemRepository.get_fila() respeita a prioridade clínica:
  vermelho (emergência) > laranja (muito urgente) > amarelo (urgente) > verde (pouco urgente)

Dentro da mesma cor, a ordenação é FIFO por horário de chegada (created_at).
"""

import pytest
from datetime import date, datetime, timedelta, timezone

from app.models.enums import CorRisco
from app.models.paciente import Paciente
from app.models.triagem import Triagem
from app.repositories.triagem import TriagemRepository

pytestmark = pytest.mark.unit

_BASE_TIME = datetime(2024, 1, 1, 12, 0, 0, tzinfo=timezone.utc)
_NASCIMENTO = date(1990, 1, 1)

# CPFs únicos para evitar conflito de UNIQUE dentro de um mesmo teste
_CPF_POOL = [f"{i:011d}" for i in range(100, 200)]
_cpf_idx = 0


def _next_cpf() -> str:
    global _cpf_idx
    cpf = _CPF_POOL[_cpf_idx % len(_CPF_POOL)]
    _cpf_idx += 1
    return cpf


def _make_paciente(db, nome: str = "Paciente") -> Paciente:
    p = Paciente(nome=nome, cpf=_next_cpf(), data_nascimento=_NASCIMENTO)
    db.add(p)
    db.flush()
    return p


def _make_triagem(db, paciente: Paciente, cor: CorRisco, delta_secs: int = 0) -> Triagem:
    t = Triagem(
        paciente_id=paciente.id,
        cor_risco=cor,
        queixa_principal="Queixa de teste com texto suficientemente longo",
        created_at=_BASE_TIME + timedelta(seconds=delta_secs),
    )
    db.add(t)
    db.flush()
    return t


# ── Ordenação por prioridade ──────────────────────────────────────────────────

def test_should_return_queue_ordered_vermelho_laranja_amarelo_verde(db):
    p1 = _make_paciente(db, "Verde")
    p2 = _make_paciente(db, "Amarelo")
    p3 = _make_paciente(db, "Laranja")
    p4 = _make_paciente(db, "Vermelho")

    # Inseridos em ordem inversa à esperada para validar que a query ordena corretamente
    _make_triagem(db, p1, CorRisco.verde, delta_secs=0)
    _make_triagem(db, p2, CorRisco.amarelo, delta_secs=1)
    _make_triagem(db, p3, CorRisco.laranja, delta_secs=2)
    _make_triagem(db, p4, CorRisco.vermelho, delta_secs=3)

    fila = TriagemRepository(db).get_fila()
    cores = [t.cor_risco for t in fila]

    assert cores == [
        CorRisco.vermelho,
        CorRisco.laranja,
        CorRisco.amarelo,
        CorRisco.verde,
    ]


def test_should_place_vermelho_before_all_others_regardless_of_arrival(db):
    p_verde_cedo = _make_paciente(db, "Verde Cedo")
    p_vermelho_tarde = _make_paciente(db, "Vermelho Tarde")

    _make_triagem(db, p_verde_cedo, CorRisco.verde, delta_secs=0)
    _make_triagem(db, p_vermelho_tarde, CorRisco.vermelho, delta_secs=60)

    fila = TriagemRepository(db).get_fila()
    assert fila[0].cor_risco == CorRisco.vermelho


# ── FIFO dentro da mesma cor ──────────────────────────────────────────────────

def test_should_order_same_color_by_arrival_time_fifo(db):
    p_primeiro = _make_paciente(db, "Chegou Primeiro")
    p_segundo = _make_paciente(db, "Chegou Segundo")

    t_segundo = _make_triagem(db, p_segundo, CorRisco.amarelo, delta_secs=60)
    t_primeiro = _make_triagem(db, p_primeiro, CorRisco.amarelo, delta_secs=0)

    fila = TriagemRepository(db).get_fila()
    ids = [t.id for t in fila]
    assert ids.index(t_primeiro.id) < ids.index(t_segundo.id)


def test_should_maintain_fifo_within_vermelho_color(db):
    pacientes = [_make_paciente(db, f"Vermelho {i}") for i in range(3)]
    triagens = [
        _make_triagem(db, p, CorRisco.vermelho, delta_secs=i * 30)
        for i, p in enumerate(pacientes)
    ]

    fila = TriagemRepository(db).get_fila()
    fila_ids = [t.id for t in fila]
    triagem_ids = [t.id for t in triagens]

    # A ordem de chegada deve ser preservada dentro da mesma cor
    posicoes = [fila_ids.index(tid) for tid in triagem_ids]
    assert posicoes == sorted(posicoes)


# ── Fila vazia ────────────────────────────────────────────────────────────────

def test_should_return_empty_list_when_no_triagens_exist(db):
    fila = TriagemRepository(db).get_fila()
    assert fila == []
