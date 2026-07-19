"""Policy contract domain models (see docs/POLICY_SCHEMA.md).

A Policy is an immutable, versioned document that gates placement offers at the
Transaction Moment. Threshold never *selects* offers (Rokt Brain does that); it
validates that a *change* between two policy versions is safe.
"""
from __future__ import annotations

from typing import Any, Literal
from pydantic import BaseModel, Field, field_validator

# Deterministic operators. The last two are the VERIFIED Rokt trap: they differ
# ONLY in how they treat a missing attribute value (Rokt Audience targeting docs:
# "Include (is not in)" vs "Exclude (is in)").
Operator = Literal[
    "equals",
    "not_equals",
    "gte",
    "lte",
    "in",
    "include_is_not_in",  # eligible ONLY if present AND value not in list  -> MISSING = EXCLUDED
    "exclude_is_in",      # excluded if present AND value in list; else eligible -> MISSING = INCLUDED
]

PROHIBITED_CATEGORIES = {"gambling", "alcohol", "tobacco"}


class Rule(BaseModel):
    id: str
    attribute: str
    op: Operator
    value: Any = None
    sensitive: bool = False
    consent_required: bool = False


class FrequencyCap(BaseModel):
    max_impressions: int = Field(ge=0)
    per_days: int = Field(ge=1)


class Offer(BaseModel):
    id: str
    category: str


class Policy(BaseModel):
    policy_version: str
    merchant_id: str
    name: str
    latency_budget_ms: int = Field(gt=0)
    fallback_action: str = "no_offer"
    requires_holdout: bool = True
    frequency_cap: FrequencyCap
    offer: Offer
    eligibility_rules: list[Rule]

    # Material term whose change re-triggers Rokt's manual approval (VERIFIED:
    # "Material changes to a campaign's privacy policy, disclaimers, or terms
    # and conditions trigger the approval process").
    disclaimers: str | None = None
    # Immutable campaign fields — changing any requires a NEW campaign, not an
    # edit (VERIFIED: objective/country/language/timezone on Manage-a-campaign).
    objective: str | None = None
    country: str | None = None
    language: str | None = None
    timezone: str | None = None

    # tolerate/ignore documentation-only keys like `_change_notes`
    model_config = {"extra": "ignore"}

    @field_validator("eligibility_rules")
    @classmethod
    def _rule_ids_unique(cls, rules: list[Rule]) -> list[Rule]:
        ids = [r.id for r in rules]
        if len(ids) != len(set(ids)):
            raise ValueError("eligibility_rules must have unique ids")
        return rules

    def rule_by_id(self, rule_id: str) -> Rule | None:
        return next((r for r in self.eligibility_rules if r.id == rule_id), None)
