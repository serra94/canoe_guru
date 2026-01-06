import os

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.routes import (
    athletes_router,
    categories_router,
    events_router,
    picks_router,
    results_router,
    scores_router,
)

app = FastAPI(title="Canoe Guru API", version="0.1.0")

origins = os.getenv("CORS_ORIGINS", "http://localhost:5173").split(",")
app.add_middleware(
    CORSMiddleware,
    allow_origins=[origin.strip() for origin in origins if origin.strip()] or ["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health")
def health_check() -> dict:
    return {"status": "ok"}


app.include_router(events_router)
app.include_router(categories_router)
app.include_router(athletes_router)
app.include_router(picks_router)
app.include_router(results_router)
app.include_router(scores_router)
