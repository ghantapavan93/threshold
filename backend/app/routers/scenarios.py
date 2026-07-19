"""Scenario library (fanflow-inspired: fixtures that double as demo + teaching).
A curated set of base→proposed pairs, each blocking (or clearing) for a DIFFERENT
reason, so the constraint catalog's breadth is demonstrable."""
from fastapi import APIRouter

router = APIRouter(prefix="/api/v1/merchants/{merchant_id}")

SCENARIOS = [
    {"id": "trap", "base": "V17", "proposed": "V18",
     "title": "The missing-attribute trap",
     "teaches": "An operator flip (include_is_not_in → exclude_is_in) that silently widens missing-cc_bin sessions.",
     "expected_verdict": "BLOCKED", "signature": True},
    {"id": "safe", "base": "V17", "proposed": "V18-safe",
     "title": "The safe fix",
     "teaches": "The intended age change with the operator flip reverted — clears to a holdout.",
     "expected_verdict": "ELIGIBLE_FOR_HOLDOUT", "signature": False},
    {"id": "fatfinger", "base": "V17", "proposed": "V18-fatfinger",
     "title": "Fat-finger data entry",
     "teaches": "An age gate typed as 2 — the plausibility guard (ShelfTrace-inspired) catches it.",
     "expected_verdict": "BLOCKED", "signature": False},
    {"id": "consent", "base": "V17", "proposed": "V18-consent",
     "title": "Consent gap",
     "teaches": "Targeting a sensitive attribute without consent — the consent constraint fails.",
     "expected_verdict": "BLOCKED", "signature": False},
    {"id": "immutable", "base": "V17", "proposed": "V18-immutable",
     "title": "Immutable field edit",
     "teaches": "Editing country (US→CA) — per Rokt docs this requires a new campaign.",
     "expected_verdict": "BLOCKED", "signature": False},
]


@router.get("/scenarios")
def list_scenarios(merchant_id: str) -> list[dict]:
    return SCENARIOS
