import pytest
from datetime import date, timedelta

from pydantic import ValidationError

from app.models.enums import CorRisco
from app.schemas.paciente import PacienteCreate
from app.schemas.triagem import TriagemCreate

pytestmark = pytest.mark.unit


def _paciente_base(**kwargs) -> dict:
    return {
        "nome": "João da Silva",
        "cpf": "12345678901",
        "data_nascimento": date(1990, 6, 15),
        **kwargs,
    }



def test_should_raise_when_cpf_has_fewer_than_11_digits():
    with pytest.raises(ValidationError, match="11 dígitos"):
        PacienteCreate(**_paciente_base(cpf="123456789"))


def test_should_raise_when_cpf_has_more_than_11_digits():
    with pytest.raises(ValidationError, match="11 dígitos"):
        PacienteCreate(**_paciente_base(cpf="123456789012"))


def test_should_accept_cpf_with_exactly_11_digits():
    paciente = PacienteCreate(**_paciente_base(cpf="12345678901"))
    assert paciente.cpf == "12345678901"


def test_should_normalize_cpf_stripping_dots_and_dash():
    paciente = PacienteCreate(**_paciente_base(cpf="123.456.789-01"))
    assert paciente.cpf == "12345678901"


def test_should_normalize_cpf_stripping_spaces():
    paciente = PacienteCreate(**_paciente_base(cpf=" 123 456 789 01 "))
    assert paciente.cpf == "12345678901"



def test_should_raise_when_data_nascimento_is_in_the_future():
    future_date = date.today() + timedelta(days=1)
    with pytest.raises(ValidationError, match="futura"):
        PacienteCreate(**_paciente_base(data_nascimento=future_date))


def test_should_accept_data_nascimento_equal_to_today():
    paciente = PacienteCreate(**_paciente_base(data_nascimento=date.today()))
    assert paciente.data_nascimento == date.today()



def test_should_raise_when_queixa_principal_is_too_short():
    with pytest.raises(ValidationError):
        TriagemCreate(
            paciente_id=1,
            cor_risco=CorRisco.verde,
            queixa_principal="dor",
        )


def test_should_raise_when_queixa_principal_is_too_long():
    with pytest.raises(ValidationError):
        TriagemCreate(
            paciente_id=1,
            cor_risco=CorRisco.verde,
            queixa_principal="x" * 501,
        )


def test_should_accept_valid_triagem_with_cor_risco_vermelho():
    triagem = TriagemCreate(
        paciente_id=1,
        cor_risco=CorRisco.vermelho,
        queixa_principal="Dor torácica intensa com irradiação para o braço esquerdo",
    )
    assert triagem.cor_risco == CorRisco.vermelho
    assert triagem.paciente_id == 1


def test_should_accept_all_valid_cor_risco_values():
    for cor in CorRisco:
        triagem = TriagemCreate(
            paciente_id=1,
            cor_risco=cor,
            queixa_principal="Queixa de teste com tamanho suficiente",
        )
        assert triagem.cor_risco == cor
