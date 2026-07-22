"""Governance-vault endpoint — runs the policy-version lifecycle demo and returns
its signed lineage plus the guarantees it enforces (legal transitions only,
tamper-evident, tenant-isolated, key-rotation-safe)."""
from __future__ import annotations

from fastapi import APIRouter

from ..domain.governance import run_governance_demo

router = APIRouter(prefix="/api/v1")


@router.get("/governance-demo")
def governance_demo() -> dict:
    return run_governance_demo()
