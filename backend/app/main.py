"""Threshold API — a Policy Change Safety Gate for the Transaction Moment.

Deterministic core; NO AI in the critical path. See docs/ for the frozen thesis,
API contract, and threat model.
"""
from __future__ import annotations

import asyncio
import logging
import uuid
from contextlib import asynccontextmanager

from fastapi import FastAPI, Request
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from starlette.exceptions import HTTPException as StarletteHTTPException

from .config import settings
from .db import init_db
from .observability import setup_tracing
from .routers import (
    audit,
    cancellations,
    conversions,
    health,
    momentforge,
    policies,
    replay,
    scenarios,
)
from .seed import seed_policies

logging.basicConfig(level=logging.INFO, format='{"level":"%(levelname)s","msg":"%(message)s"}')
log = logging.getLogger("threshold")


async def _outbox_loop():
    """Best-effort background drain of the transactional outbox."""
    from . import outbox
    from .db import SessionLocal

    def _drain():
        db = SessionLocal()
        try:
            return outbox.drain_once(db)
        finally:
            db.close()

    while True:
        await asyncio.sleep(settings.outbox_interval_s)
        try:
            await asyncio.to_thread(_drain)  # don't block the event loop
        except Exception as e:  # noqa: BLE001 — a drain error must not kill the loop
            log.warning("outbox drain error: %s", e)


@asynccontextmanager
async def lifespan(app: FastAPI):
    setup_tracing()
    init_db()
    if settings.seed_on_startup:
        n = seed_policies()
        log.info("seeded %s policy version(s)", n)
    worker = asyncio.create_task(_outbox_loop()) if settings.outbox_worker else None
    try:
        yield
    finally:
        if worker:
            worker.cancel()


app = FastAPI(title="Threshold", version=settings.version, lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["X-Request-ID"],
)


@app.middleware("http")
async def add_request_id(request: Request, call_next):
    rid = request.headers.get("X-Request-ID", str(uuid.uuid4()))
    request.state.request_id = rid
    response = await call_next(request)
    response.headers["X-Request-ID"] = rid
    return response


def _envelope(request: Request, code: str, message: str, status: int) -> JSONResponse:
    rid = getattr(request.state, "request_id", None)
    return JSONResponse(status_code=status, content={"error": {"code": code, "message": message, "request_id": rid}})


@app.exception_handler(StarletteHTTPException)
async def http_exc_handler(request: Request, exc: StarletteHTTPException):
    return _envelope(request, f"http_{exc.status_code}", str(exc.detail), exc.status_code)


@app.exception_handler(RequestValidationError)
async def validation_exc_handler(request: Request, exc: RequestValidationError):
    return _envelope(request, "validation_error", str(exc.errors()), 422)


for r in (health.router, policies.router, replay.router, conversions.router,
          cancellations.router, audit.router, scenarios.router, momentforge.router):
    app.include_router(r)
