import pytest
from httpx import AsyncClient, ASGITransport
from sqlalchemy import create_engine
from sqlalchemy.orm import Session, sessionmaker
from sqlalchemy.pool import StaticPool

from app.auth.jwt import create_access_token
from app.auth.security import hash_password
from app.database import get_db
from app.main import app
from app.models.base import Base
from app.models.enums import PerfilUsuario
from app.models.usuario import Usuario

# StaticPool: SQLAlchemy reutiliza UMA única conexão para todos os acessos.
# Isso garante que todos os testes e fixtures enxerguem o mesmo banco em memória.
engine = create_engine(
    "sqlite:///:memory:",
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


@pytest.fixture(scope="session", autouse=True)
def create_tables():
    Base.metadata.create_all(engine)
    yield
    Base.metadata.drop_all(engine)


@pytest.fixture
def db():
    """Sessão de banco de dados para cada teste.

    Ao final, a sessão é fechada (rollback de qualquer transação aberta) e
    todas as linhas de todas as tabelas são deletadas, garantindo isolamento
    entre testes sem depender de savepoints — estratégia compatível com SQLite.
    """
    session = TestingSessionLocal()
    yield session
    session.close()
    with engine.begin() as conn:
        for table in reversed(Base.metadata.sorted_tables):
            conn.execute(table.delete())


@pytest.fixture
async def async_client(db):
    """AsyncClient do httpx apontando para a app FastAPI via transporte ASGI.

    O get_db é sobrescrito para que endpoints usem a mesma sessão do teste,
    tornando os dados dos fixtures visíveis sem necessidade de conexão externa.
    """

    def override_get_db():
        yield db

    app.dependency_overrides[get_db] = override_get_db
    async with AsyncClient(
        transport=ASGITransport(app=app), base_url="http://test"
    ) as client:
        yield client
    app.dependency_overrides.clear()


@pytest.fixture
def usuario_enfermeiro(db):
    usuario = Usuario(
        nome="Enfermeiro Teste",
        email="enfermeiro@teste.com",
        senha_hash=hash_password("senha123"),
        perfil=PerfilUsuario.enfermeiro,
    )
    db.add(usuario)
    db.commit()
    db.refresh(usuario)
    return usuario


@pytest.fixture
def usuario_recepcionista(db):
    usuario = Usuario(
        nome="Recepcionista Teste",
        email="recepcionista@teste.com",
        senha_hash=hash_password("senha123"),
        perfil=PerfilUsuario.recepcionista,
    )
    db.add(usuario)
    db.commit()
    db.refresh(usuario)
    return usuario


@pytest.fixture
def token_enfermeiro(usuario_enfermeiro):
    return create_access_token(
        usuario_enfermeiro.email, usuario_enfermeiro.perfil.value
    )


@pytest.fixture
def token_recepcionista(usuario_recepcionista):
    return create_access_token(
        usuario_recepcionista.email, usuario_recepcionista.perfil.value
    )


@pytest.fixture
async def auth_client(async_client, token_enfermeiro):
    """Client autenticado como enfermeiro (pode criar triagens)."""
    async_client.cookies.set("access_token", token_enfermeiro)
    return async_client


@pytest.fixture
async def recepcionista_client(async_client, token_recepcionista):
    """Client autenticado como recepcionista (bloqueado em POST /triagens)."""
    async_client.cookies.set("access_token", token_recepcionista)
    return async_client
