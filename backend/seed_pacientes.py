from datetime import date

from app.database import SessionLocal
from app.models.paciente import Paciente

PACIENTES = [
    Paciente(nome="Ana Paula Ferreira",      cpf="10234567890", data_nascimento=date(1985, 3, 12), telefone="71991234567"),
    Paciente(nome="Carlos Eduardo Souza",    cpf="20345678901", data_nascimento=date(1972, 7, 28), telefone="71992345678"),
    Paciente(nome="Maria das Graças Lima",   cpf="30456789012", data_nascimento=date(1960, 11, 5), telefone="71993456789"),
    Paciente(nome="João Batista Oliveira",   cpf="40567890123", data_nascimento=date(1990, 1, 18), telefone=None),
    Paciente(nome="Fernanda Costa Santos",   cpf="50678901234", data_nascimento=date(2001, 6, 30), telefone="71994567890"),
    Paciente(nome="Roberto Alves Pereira",   cpf="60789012345", data_nascimento=date(1955, 9, 14), telefone="71995678901"),
    Paciente(nome="Luciana Barbosa Reis",    cpf="70890123456", data_nascimento=date(1988, 4, 22), telefone=None),
    Paciente(nome="Marcos Antônio Gomes",    cpf="80901234567", data_nascimento=date(1945, 12, 3), telefone="71996789012"),
    Paciente(nome="Patrícia Nunes Cardoso",  cpf="91012345678", data_nascimento=date(1995, 8, 9),  telefone="71997890123"),
    Paciente(nome="Thiago Rodrigues Moura",  cpf="11123456789", data_nascimento=date(1983, 2, 17), telefone=None),
    Paciente(nome="Camila Martins Tavares",  cpf="21234567890", data_nascimento=date(1998, 5, 25), telefone="71998901234"),
    Paciente(nome="Antônio José Mendes",     cpf="31345678901", data_nascimento=date(1938, 10, 7), telefone="71999012345"),
    Paciente(nome="Juliana Carvalho Dias",   cpf="41456789012", data_nascimento=date(1977, 3, 31), telefone=None),
    Paciente(nome="Rafael Henrique Cunha",   cpf="51567890123", data_nascimento=date(2005, 7, 13), telefone="71981234567"),
    Paciente(nome="Adriana Pinto Freitas",   cpf="61678901234", data_nascimento=date(1969, 1, 20), telefone="71982345678"),
    Paciente(nome="Eduardo Lima Rocha",      cpf="71789012345", data_nascimento=date(1993, 11, 8), telefone=None),
    Paciente(nome="Sandra Mara Nascimento",  cpf="81890123456", data_nascimento=date(1952, 6, 16), telefone="71983456789"),
    Paciente(nome="Felipe Augusto Castro",   cpf="91901234567", data_nascimento=date(2000, 9, 4),  telefone="71984567890"),
    Paciente(nome="Beatriz Araújo Vieira",   cpf="12012345678", data_nascimento=date(1987, 4, 27), telefone=None),
    Paciente(nome="Leandro Ferraz Correia",  cpf="22123456789", data_nascimento=date(1975, 12, 11),telefone="71985678901"),
    Paciente(nome="Vanessa Torres Melo",     cpf="32234567890", data_nascimento=date(2003, 2, 6),  telefone="71986789012"),
    Paciente(nome="Gilberto Sousa Ribeiro",  cpf="42345678901", data_nascimento=date(1948, 8, 19), telefone=None),
    Paciente(nome="Priscila Macedo Lopes",   cpf="52456789012", data_nascimento=date(1992, 5, 3),  telefone="71987890123"),
    Paciente(nome="Renato Borges Andrade",   cpf="62567890123", data_nascimento=date(1965, 10, 24),telefone="71988901234"),
    Paciente(nome="Larissa Campos Teixeira", cpf="72678901234", data_nascimento=date(2008, 3, 15), telefone=None),
]

db = SessionLocal()

for paciente in PACIENTES:
    db.add(paciente)

db.commit()
print(f"{len(PACIENTES)} pacientes criados com sucesso.")
db.close()
