# Canoe Guru (Monorepo)

## Structure

- `frontend/` React + Vite
- `backend/` FastAPI + Poetry + Alembic
- `infra/` Docker Compose (Postgres dev/prod)

## Dev Setup (local)

### 1) Start Postgres (dev)

```bash
cd infra
docker compose --profile dev up -d db_dev
```

### 2) Apply migrations

```bash
cd ../backend
DATABASE_URL=postgresql+psycopg://postgres:postgres@localhost:5433/canoe_guru_dev poetry run alembic upgrade head
```

### 3) Seed mock data (dev)

```bash
cd ../infra
docker compose --profile dev run --rm --build seed_dev
```

### 4) Run API (dev)

```bash
cd ../infra
docker compose --profile dev up -d api_dev
```

API will be available at:
- `http://localhost:8002/health`
- `http://localhost:8002/docs`

### 5) Run Frontend

```bash
cd ../frontend
npm install
npm run dev
```

Frontend uses `frontend/.env`:
```
VITE_API_BASE_URL=http://localhost:8002
```

Open:
- `http://localhost:5173`

## Mock Data Notes

- Seed script: `backend/app/seed.py`
- It creates 4 events with statuses:
  - `upcoming`
  - `open`
  - `in_progress`
  - `finished`
- It also creates categories, athletes, and results for the finished event.

## Useful Commands

From repo root:

- Install backend deps:
  ```bash
  make backend-install
  ```
- Run backend locally (no docker):
  ```bash
  make backend-run
  ```
- Apply migrations:
  ```bash
  make backend-migrate
  ```
- Seed data (dev DB):
  ```bash
  make backend-seed
  ```

## Agent Context (quick refresher)

- Backend: FastAPI + SQLAlchemy + Alembic in `backend/`
- Frontend: React + Vite in `frontend/`
- Dev DB runs via Docker on port `5433` (see `infra/`)
- API dev container maps to `http://localhost:8002`
- Frontend expects API at `VITE_API_BASE_URL=http://localhost:8002`
- Seed script creates 4 events with statuses:
  - `upcoming`, `open`, `in_progress`, `finished`
- Event selection rules:
  - Picks require 1st/2nd/3rd/Dark Horse
  - Dark Horse must be outside top 10 (default for official events)
  - No duplicate athlete per category selection
- Game overview:
  - Fantasy slalom canoe game: users build a team per event/category.
  - MVP focuses on official events only (global ranking for all users).
  - Future: users can create their own events with custom rules and CSV uploads.
  - Events can be global (official) or custom (user-created).
  - Users can create leagues (public/private) with separate rankings.
  - App is bilingual (PT/EN) and mobile-first.
  - Ads/monetization placements already exist in the frontend structure.
