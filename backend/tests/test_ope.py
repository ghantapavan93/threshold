"""OPE support-guard: refuse on thin support; the holdout stays mandatory."""
import json
from pathlib import Path

from app.domain.ope import support_guard
from app.domain.policy import Policy
from app.domain.replay import run_replay

SEED = Path(__file__).resolve().parent.parent / "seed" / "policies"


def load(n):
    return Policy.model_validate(json.loads((SEED / n).read_text()))


def test_support_levels():
    assert support_guard(0, 200)["support"] == "NONE"
    assert support_guard(0, 200)["refuses_estimate"] is True
    assert support_guard(9, 200)["support"] == "THIN"
    assert support_guard(9, 200)["refuses_estimate"] is True
    s = support_guard(30, 200)
    assert s["support"] == "SUFFICIENT" and s["refuses_estimate"] is False


def test_replay_includes_prescreen():
    trap = run_replay(load("aurora_v17.json"), load("aurora_v18.json"), 42, 200, ["timeout"], "s")
    # V18 changes ~30 sessions -> sufficient support
    assert trap["ope_prescreen"]["support"] == "SUFFICIENT"
    safe = run_replay(load("aurora_v17.json"), load("aurora_v18_safe.json"), 42, 200, ["timeout"], "s")
    # the safe fix changes fewer sessions -> the pre-screen REFUSES; holdout still required
    assert safe["ope_prescreen"]["refuses_estimate"] is True
    assert safe["verdict"]["value"] == "ELIGIBLE_FOR_HOLDOUT"  # verdict unaffected — holdout is the mechanism
