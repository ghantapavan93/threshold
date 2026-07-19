"""API request/response Pydantic models (boundary validation)."""
from __future__ import annotations

from pydantic import BaseModel, Field


class PolicyDiffRequest(BaseModel):
    base_version: str
    proposed_version: str


class ReplayJobRequest(BaseModel):
    base_version: str
    proposed_version: str
    session_seed: int = 42
    session_count: int = Field(default=200, ge=1, le=5000)
    injections: list[str] = Field(default_factory=lambda: ["timeout", "invalid_output", "stale_identity"])


class ConversionRequest(BaseModel):
    conversiontype: str
    confirmationref: str
    amount: float = 0.0
    currency: str = "USD"


class CancellationRequest(BaseModel):
    itemReservationId: str
