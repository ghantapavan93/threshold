"""Agentic Transaction Passport — the anti-corruption layer's laws as executable
invariants: admitted ⊆ claimed, confirmation required, expiry & tamper admit
nothing, unsupported keys (the prompt-injection shape) never admit, consent gates
sensitive fields, and every admitted value is valid. Determinism throughout."""
from hypothesis import given, settings
from hypothesis import strategies as st

from app.domain.passport import (
    ADMITTED,
    Passport,
    PassportField,
    SUPPORTED,
    admit,
    build_signed,
    run_named_scenario,
    scenarios,
)

SECRET = "test-passport-secret"
NOW = 1_000_000


def _valid(fields):
    return build_signed("agent", NOW - 60, NOW + 300, fields, SECRET)


# ---------- curated scenario behaviour ----------

def test_clean_admits_all_four():
    r = run_named_scenario("clean", SECRET)
    assert r["outcome"]["passport_valid"] is True
    assert set(r["outcome"]["admitted"]) == {
        "party_size", "max_additional_spend_minor", "time_constraint_minutes", "location_preference"}
    assert r["summary"]["admitted"] == 4 and r["summary"]["rejected"] == 0


def test_prompt_injection_strips_unsupported_keys():
    r = run_named_scenario("prompt_injection", SECRET)
    admitted = r["outcome"]["admitted"]
    assert "apply_discount_pct" not in admitted and "internal_priority" not in admitted
    # the honest, supported fields still pass.
    assert "party_size" in admitted
    stripped = [row["key"] for row in r["outcome"]["ledger"] if row["status"] == "STRIPPED"]
    assert set(stripped) == {"apply_discount_pct", "internal_priority"}


def test_unconfirmed_field_is_rejected():
    r = run_named_scenario("unconfirmed", SECRET)
    assert "max_additional_spend_minor" not in r["outcome"]["admitted"]
    rej = [row for row in r["outcome"]["ledger"] if row["key"] == "max_additional_spend_minor"]
    assert rej and rej[0]["status"] == "REJECTED"


def test_expired_passport_admits_nothing():
    r = run_named_scenario("expired", SECRET)
    assert r["outcome"]["passport_valid"] is False
    assert r["outcome"]["admitted"] == {}


def test_tampered_passport_is_rejected_wholesale():
    r = run_named_scenario("tampered", SECRET)
    assert r["outcome"]["passport_valid"] is False
    assert r["outcome"]["admitted"] == {}
    assert "provenance" in (r["outcome"]["reason"] or "")


def test_sensitive_field_needs_consent():
    without = run_named_scenario("sensitive_no_consent", SECRET)
    assert "dietary_requirement" not in without["outcome"]["admitted"]
    with_ = run_named_scenario("sensitive_with_consent", SECRET)
    assert "dietary_requirement" in with_["outcome"]["admitted"]


def test_out_of_range_values_rejected():
    r = run_named_scenario("out_of_range", SECRET)
    admitted = r["outcome"]["admitted"]
    assert "party_size" not in admitted                       # 500 out of range
    assert "max_additional_spend_minor" not in admitted       # a float, not minor units
    assert "time_constraint_minutes" in admitted              # the one valid field


# ---------- the laws ----------

def test_law_admitted_is_subset_of_claimed():
    for name in scenarios(SECRET):
        r = run_named_scenario(name, SECRET)
        assert set(r["outcome"]["admitted"]).issubset(set(r["outcome"]["claimed_keys"]))


def test_law_every_admitted_field_was_confirmed_and_valid():
    for name in scenarios(SECRET):
        r = run_named_scenario(name, SECRET)
        claimed = {f["key"]: f for f in r["passport"]["fields"]}
        for key, value in r["outcome"]["admitted"].items():
            assert claimed[key]["customer_confirmed"] is True
            assert SUPPORTED[key].validate(value)


@given(
    extra_key=st.text(min_size=1, max_size=12).filter(lambda k: k not in SUPPORTED),
    extra_val=st.one_of(st.integers(), st.text(max_size=8), st.booleans(), st.floats(allow_nan=False)),
)
@settings(max_examples=100)
def test_law_unsupported_keys_never_admit(extra_key, extra_val):
    # Any key not in the schema — the shape a prompt injection takes — is never admitted.
    fields = [PassportField("party_size", 2, True), PassportField(extra_key, extra_val, True)]
    r = admit(_valid(fields), NOW, {}, SECRET)
    assert extra_key not in r["admitted"]


@given(
    val=st.one_of(st.integers(min_value=-50, max_value=1000), st.text(max_size=6),
                  st.booleans(), st.floats(allow_nan=False, allow_infinity=False)),
    confirmed=st.booleans(),
)
@settings(max_examples=150)
def test_law_total_and_admits_only_valid(val, confirmed):
    # The ACL never raises on junk, and only admits values that pass the validator.
    fields = [PassportField("party_size", val, confirmed)]
    r = admit(_valid(fields), NOW, {}, SECRET)
    if "party_size" in r["admitted"]:
        assert confirmed and SUPPORTED["party_size"].validate(val)


def test_law_tamper_any_field_breaks_provenance():
    good = _valid([PassportField("party_size", 2, True)])
    # flip the confirmation flag after signing.
    tampered = Passport(good.agent_id, good.issued_at, good.expires_at,
                        [PassportField("party_size", 2, False)], good.signature)
    assert admit(tampered, NOW, {}, SECRET)["passport_valid"] is False


def test_law_deterministic():
    r = run_named_scenario("prompt_injection", SECRET)
    assert r == run_named_scenario("prompt_injection", SECRET)
