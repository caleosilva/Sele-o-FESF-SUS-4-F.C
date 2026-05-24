# FESF-SUS — Sistema de Triagem

![Backend Coverage](./backend/coverage.svg)

Sistema web para gestão de triagem hospitalar da Fundação Estatal Saúde da Família, permitindo o cadastro de pacientes e a classificação por cor de risco (verde, amarelo, laranja e vermelho) com controle de acesso por perfil de usuário (recepcionista, enfermeiro e médico). O backend é construído em FastAPI com PostgreSQL e o frontend em Next.js.

---

## Execução com Docker

### Pré-requisitos

- [Docker](https://docs.docker.com/get-docker/) 24+
- [Docker Compose](https://docs.docker.com/compose/) v2 (já incluso no Docker Desktop)
- `make` (Linux/macOS — já disponível por padrão)

### Subir o ambiente do zero

```bash
# 1. Copie o arquivo de variáveis de ambiente
cp .env.example .env

# 2. Edite o .env e defina valores seguros para:
#    POSTGRES_PASSWORD e SECRET_KEY (veja instruções no próprio arquivo)

# 3. Construa as imagens e suba todos os containers
make up

# 4. Aplique as migrations do banco de dados
make migrate
```

Isso é tudo. Após `make up` + `make migrate`, os três serviços estarão rodando.

### Acessos

| Serviço                     | URL                        |
| --------------------------- | -------------------------- |
| Frontend (Next.js)          | http://localhost:3000      |
| API REST (FastAPI)          | http://localhost:8000      |
| Swagger / Docs interativos  | http://localhost:8000/docs |
| Banco de dados (PostgreSQL) | localhost:5432             |

### Usuários disponíveis após o seed

> Para popular os usuários, execute uma vez:
>
> ```bash
> docker compose exec api python seed_usuario.py
> ```

| E-mail                | Senha    | Perfil        |
| --------------------- | -------- | ------------- |
| medico@sus.gov.br     | senha123 | médico        |
| enfermeiro@sus.gov.br | senha123 | enfermeiro    |
| recepcao@sus.gov.br   | senha123 | recepcionista |

### Outros comandos

```bash
make logs     # Exibe logs de todos os serviços em tempo real (Ctrl+C para sair)
make down     # Para e remove os containers (os dados do banco são preservados no volume)
```

---

## Testes

### Backend — Pytest

Utiliza SQLite em memória (`StaticPool`) para isolamento total sem dependência de PostgreSQL.
Cada teste recebe um banco limpo via limpeza automática de tabelas após a execução.

```bash
cd backend

# Instalar dependências de desenvolvimento (apenas na primeira vez)
pip install -r requirements-dev.txt

# Rodar todos os testes com relatório de cobertura
pytest --cov=app --cov-report=html:coverage --cov-fail-under=80

# Apenas testes unitários
pytest -m unit

# Apenas testes de integração
pytest -m integration
```

O relatório HTML de cobertura é gerado em `backend/coverage/index.html`.

Para regenerar o badge de cobertura:

```bash
coverage-badge -f -o coverage.svg
```

### Frontend — Jest + React Testing Library

```bash
cd frontend

# Instalar dependências (apenas na primeira vez)
npm install

# Rodar todos os testes
npm test

# Rodar com relatório de cobertura
npm run test:coverage
```

### Estrutura dos testes

```
backend/
└── tests/
    ├── conftest.py              # Fixtures globais (banco, client HTTP, usuários, tokens)
    ├── unit/
    │   ├── test_jwt.py          # Geração e verificação de tokens JWT
    │   ├── test_schemas.py      # Validação Pydantic (CPF, data nascimento, queixa)
    │   └── test_fila_ordering.py # Lógica de prioridade da fila de triagem
    └── integration/
        ├── test_auth.py         # Endpoints /auth (login, me, logout)
        ├── test_pacientes.py    # Endpoints /pacientes (CRUD + auth)
        └── test_triagens.py     # Endpoints /triagens (criação, fila, RBAC)

frontend/
└── __tests__/
    ├── LoginPage.test.tsx       # Formulário de login (render, erro, redirect)
    ├── TriagemCard.test.tsx     # Card de triagem (cores, CPF formatado)
    ├── TriagemFila.test.tsx     # Fila via Zustand real (setState)
    ├── helpers/
    │   └── mockStore.ts         # Helper mockAuthStore() / mockTriagemStore()
    └── integration/
        └── login-flow.test.tsx  # Fluxo completo: form → API → Zustand → redirect
```
