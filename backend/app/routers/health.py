from fastapi import APIRouter

from ..config import settings

router = APIRouter()


@router.get("/health")
def health() -> dict:
    return {"status": "ok", "version": settings.version}
