.PHONY: backend-install backend-run backend-migrate backend-seed backend-revision backend-upgrade

backend-install:
	cd backend && poetry install

backend-run:
	cd backend && poetry run uvicorn app.main:app --reload

backend-migrate:
	cd backend && poetry run alembic upgrade head

backend-seed:
	cd backend && poetry run python -m app.seed

backend-revision:
	cd backend && poetry run alembic revision --autogenerate -m "update"
