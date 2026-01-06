# Infra

## Dev

```bash
docker compose --profile dev up -d db_dev
# migrate once the DB is up
cd ../backend && poetry run alembic upgrade head
# seed data
cd .. && docker compose --profile dev run --rm seed_dev
# run API
docker compose --profile dev up -d api_dev
```

## Prod (local)

```bash
docker compose --profile prod up -d db_prod
# migrate once the DB is up
cd ../backend && poetry run alembic upgrade head
# run API
docker compose --profile prod up -d api_prod
```
