.PHONY: up down migrate logs

## Constrói as imagens e sobe todos os containers em background
up:
	docker compose up --build -d

## Derruba todos os containers (mantém volumes)
down:
	docker compose down

## Executa as migrations do Alembic dentro do container da API
migrate:
	docker compose exec api alembic upgrade head

## Exibe os logs de todos os serviços em modo streaming (Ctrl+C para sair)
logs:
	docker compose logs -f
