.PHONY: backend-install backend-run backend-migrate backend-seed backend-revision backend-upgrade

backend-install:
	cd backend && poetry install

backend-run:
	cd backend && poetry run uvicorn app.main:app --reload

backend-migrate:
	cd backend && DATABASE_URL=postgresql+psycopg://postgres:postgres@localhost:5433/canoe_guru_dev poetry run alembic upgrade head

backend-seed:
	cd backend && DATABASE_URL=postgresql+psycopg://postgres:postgres@localhost:5433/canoe_guru_dev poetry run python -m app.seed

backend-revision:
	cd backend && poetry run alembic revision --autogenerate -m "update"
