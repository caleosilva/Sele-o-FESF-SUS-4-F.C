"""add initial models

Revision ID: a1b2c3d4e5f6
Revises:
Create Date: 2026-05-21 10:00:00.000000

"""
from typing import Sequence, Union

import sqlalchemy as sa
from sqlalchemy.dialects import postgresql
from alembic import op

revision: str = "a1b2c3d4e5f6"
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Cria os tipos ENUM ignorando se já existirem
    op.execute("""
        DO $$ BEGIN
            CREATE TYPE cor_risco AS ENUM ('verde', 'amarelo', 'laranja', 'vermelho');
        EXCEPTION WHEN duplicate_object THEN NULL;
        END $$;
    """)
    op.execute("""
        DO $$ BEGIN
            CREATE TYPE perfil_usuario AS ENUM ('recepcionista', 'enfermeiro', 'medico');
        EXCEPTION WHEN duplicate_object THEN NULL;
        END $$;
    """)
    # create_type=False: tipos já existem, SQLAlchemy não tenta recriar
    cor_risco_enum = postgresql.ENUM(name="cor_risco", create_type=False)
    perfil_usuario_enum = postgresql.ENUM(name="perfil_usuario", create_type=False)

    op.create_table(
        "pacientes",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("nome", sa.String(100), nullable=False),
        sa.Column("cpf", sa.String(11), nullable=False),
        sa.Column("data_nascimento", sa.Date(), nullable=False),
        sa.Column("telefone", sa.String(20), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_pacientes_id", "pacientes", ["id"])
    op.create_index("ix_pacientes_cpf", "pacientes", ["cpf"], unique=True)

    op.create_table(
        "usuarios",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("nome", sa.String(100), nullable=False),
        sa.Column("email", sa.String(255), nullable=False),
        sa.Column("senha_hash", sa.String(255), nullable=False),
        sa.Column("perfil", perfil_usuario_enum, nullable=False),
        sa.Column("is_active", sa.Boolean(), server_default="true", nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_usuarios_id", "usuarios", ["id"])
    op.create_index("ix_usuarios_email", "usuarios", ["email"], unique=True)

    op.create_table(
        "triagens",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("paciente_id", sa.Integer(), nullable=False),
        sa.Column("cor_risco", cor_risco_enum, nullable=False),
        sa.Column("queixa_principal", sa.Text(), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.ForeignKeyConstraint(["paciente_id"], ["pacientes.id"], ondelete="RESTRICT"),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_triagens_id", "triagens", ["id"])
    op.create_index("ix_triagens_paciente_id", "triagens", ["paciente_id"])


def downgrade() -> None:
    op.drop_index("ix_triagens_paciente_id", table_name="triagens")
    op.drop_index("ix_triagens_id", table_name="triagens")
    op.drop_table("triagens")

    op.drop_index("ix_usuarios_email", table_name="usuarios")
    op.drop_index("ix_usuarios_id", table_name="usuarios")
    op.drop_table("usuarios")

    op.drop_index("ix_pacientes_cpf", table_name="pacientes")
    op.drop_index("ix_pacientes_id", table_name="pacientes")
    op.drop_table("pacientes")

    op.execute("DROP TYPE IF EXISTS perfil_usuario")
    op.execute("DROP TYPE IF EXISTS cor_risco")
