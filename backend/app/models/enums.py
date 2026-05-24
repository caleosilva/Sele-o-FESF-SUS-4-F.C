import enum


class CorRisco(str, enum.Enum):
    verde = "verde"
    amarelo = "amarelo"
    laranja = "laranja"
    vermelho = "vermelho"


class PerfilUsuario(str, enum.Enum):
    recepcionista = "recepcionista"
    enfermeiro = "enfermeiro"
    medico = "medico"
