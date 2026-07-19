"""Runtime configuration (12-factor: env-overridable, safe local defaults)."""
from __future__ import annotations

import os


class Settings:
    version: str = "0.1.0"
    database_url: str = os.environ.get("DATABASE_URL", "sqlite:///./threshold.db")
    # HMAC key for the tamper-evident audit trail. Override in any real deploy.
    audit_secret: str = os.environ.get("THRESHOLD_AUDIT_SECRET", "dev-threshold-secret")
    cors_origins: list[str] = os.environ.get(
        "CORS_ORIGINS", "http://localhost:3000,http://127.0.0.1:3000"
    ).split(",")
    seed_on_startup: bool = os.environ.get("SEED_ON_STARTUP", "1") == "1"
    # Background transactional-outbox drain worker.
    outbox_worker: bool = os.environ.get("OUTBOX_WORKER", "1") == "1"
    outbox_interval_s: float = float(os.environ.get("OUTBOX_INTERVAL_S", "3"))


settings = Settings()
