from .athletes import router as athletes_router
from .categories import router as categories_router
from .events import router as events_router
from .picks import router as picks_router
from .results import router as results_router
from .scores import router as scores_router

__all__ = [
    "athletes_router",
    "categories_router",
    "events_router",
    "picks_router",
    "results_router",
    "scores_router",
]
