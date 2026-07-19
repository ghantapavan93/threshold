"""Scenario-library tests: each proposed policy BLOCKS for a distinct reason."""
import json
from pathlib import Path

import pytest

from app.domain.policy import Policy
from app.domain.replay import run_replay

SEED = Path(__file__).resolve().parent.parent / "seed" / "policies"


def load(name: str) -> Policy:
    return Policy.model_validate(json.loads((SEED / name).read_text()))


def _run(proposed_file: str):
    return run_replay(load("aurora_v17.json"), load(proposed_file), 42, 200,
                      ["timeout"], "test-secret")


@pytest.mark.parametrize("proposed_file, fail_key", [
    ("aurora_v18_fatfinger.json", "plausibility"),
    ("aurora_v18_consent.json", "consent"),
    ("aurora_v18_immutable.json", "immutable_field_guard"),
])
def test_scenario_blocks_for_its_reason(proposed_file, fail_key):
    job = _run(proposed_file)
    assert job["verdict"]["value"] == "BLOCKED"
    by = {c["key"]: c for c in job["constraint_results"]}
    assert by[fail_key]["result"] == "FAIL", by[fail_key]


def test_plausibility_passes_on_good_values():
    job = _run("aurora_v18_safe.json")
    by = {c["key"]: c for c in job["constraint_results"]}
    assert by["plausibility"]["result"] == "PASS"
