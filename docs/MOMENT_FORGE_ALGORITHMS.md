# Moment Forge — CS Fundamentals & Tactical-DDD Spine

*The algorithmic core behind Threshold's "Semantic Change Compiler." Every claim is
tagged `[REPO]` (verified against shipped code, with file:function cited) or
`[DESIGNED]` (a modelling frame layered on the repo, not yet code). No Big-O is
stated without a justification tied to a concrete loop.*

Grounding sources read for this document:
`backend/app/domain/evaluator.py`, `diff.py`, `constraints.py`, `verdict.py`,
`ope.py`, `replay.py`, `policy.py`, `sessions.py`, `failclosed.py`;
`docs/POLICY_SCHEMA.md`, `docs/TRANSACTION_INVARIANTS.md`,
`docs/ADR/ADR-002-deterministic-hot-path-no-llm.md`; `backend/tests/test_domain.py`;
`backend/seed/policies/aurora_v17.json`.

---

## 0. One-paragraph thesis

The Transaction Moment is a **pure function** `decide : (SessionSnapshot, Policy) → Decision`
`[REPO evaluator.evaluate]`. Threshold never asks "is this offer good?"; it asks
"did the *meaning* of `decide` change between two immutable policy versions, and for
whom?" That question is answered by replaying a fixed corpus of event-time snapshots
through both versions and computing a **semantic delta** — the set of sessions whose
decision changed, each annotated with the *operator that caused it* via
**counterfactual isolation**. The centerpiece is a documented Rokt trap: switching a
rule from `include_is_not_in` to `exclude_is_in` changes behaviour on exactly one
input class — a **missing attribute** — silently widening eligibility. Everything below
makes that airtight.

---

## 1. Tactical DDD model (OOP done right)

### 1.1 Aggregate map

| Aggregate (root) | Entities / VOs it owns | Invariants it protects | Boundary rationale |
|---|---|---|---|
| **Policy** `[REPO policy.Policy]` | `Rule` (VO), `FrequencyCap` (VO), `Offer` (VO) | unique rule ids; `latency_budget_ms > 0`; `max_impressions ≥ 0`, `per_days ≥ 1`; ordered rule list | A policy version is the unit of change and of immutability (Invariant 5). Rules only have meaning *inside* a policy's ordered evaluation, so they are non-root VOs, not separate aggregates. |
| **SessionSnapshot** `[DESIGNED over REPO sessions.py dict]` | attribute map (VO) | event-time closure: only attributes known at capture; no future join (Invariant 4) | The snapshot is the immutable evidence unit. Making it an aggregate enforces "no future-information leakage" structurally: nothing can mutate a captured snapshot. |
| **ReplayJob** `[DESIGNED over REPO replay.run_replay]` | `Decision` pairs, `SemanticDelta`, `Verdict`, `AuditTrail` | determinism (Invariant 3); idempotency per Idempotency-Key (Invariant 7) | The transactional consistency boundary for one compile. One job = one (base, proposed, seed, count, injections) tuple → one result, forever. |
| **AuditTrail** `[REPO audit.py]` | append-only records w/ per-record HMAC | append-only, tamper-evident (Invariant 8) | Integrity is its own concern; it must not be reachable for mutation from the decision path. |

### 1.2 Value objects (immutable, encapsulated — *not* anemic)

```python
# [REPO] evaluator.Decision — frozen: identity is its value.
@dataclass(frozen=True)
class Decision:
    decision: str                    # "offer" | "no_offer"
    matched_rules: tuple[str, ...]   # tuple => structurally immutable
    failed_rule: str | None
    fallback_reason: str | None = None
    # Behaviour lives WITH the data (no anemic getter-bag):
    def is_offer(self) -> bool: return self.decision == "offer"

# [REPO] policy.Rule — a VO with an evaluation *method*, not just fields.
class Rule(BaseModel):
    id: str; attribute: str; op: Operator
    value: Any = None
    sensitive: bool = False
    consent_required: bool = False
    # eval_rule() [REPO evaluator.eval_rule] is the Rule's behaviour, kept pure.

# [DESIGNED] The compiler's OUTPUT as a first-class VO.
@dataclass(frozen=True)
class SemanticDelta:
    changed: frozenset[str]                 # session ids whose decision changed
    attributions: Mapping[str, str]         # session_id -> causing rule/operator
    silent_wideners: frozenset[str]         # missing-attribute violations
    counts: Mapping[str, int]               # change_kind histogram [REPO replay counts]
```

**Immutability discipline.** `PolicyVersion` documents are write-once (Invariant 5;
seed is write-once `[REPO]`). The counterfactual in §2 never mutates the proposed
policy in place — it takes `proposed.model_copy(deep=True)` and edits the *copy*
`[REPO constraints.py:157]`. `Decision` and (designed) `SemanticDelta` are `frozen`;
`AudienceRule` equality is *by value* (Pydantic structural equality via `model_dump`,
used for diffing `[REPO diff.py:56]`).

### 1.3 Domain events `[REPO — emitted via audit.append in replay.run_replay]`

`REPLAY_STARTED` → `CONSTRAINTS_EVALUATED` → `DECISION_RECORDED` (once per *changed*
session) → `FAILCLOSED_PROVEN` → `VERDICT_ISSUED`. These are the append-only spine of
the AuditTrail; each carries an HMAC so post-hoc tampering is detectable (Invariant 8).

---

## 2. The Semantic Change Compiler — precise algorithm

### 2.1 Signature

```
compile(base: Policy,
        proposed: Policy,
        corpus: list[SessionSnapshot])  ->  SemanticDelta
```

**Input.** Two immutable policy versions + a corpus of `N` event-time snapshots
(`[REPO sessions.generate_sessions]`, seeded → reproducible, ~18% with `cc_bin`
intentionally absent).
**Output.** A `SemanticDelta`: the set of sessions whose *meaning* (decision) changed,
each attributed to the operator responsible, with the silent-widening subset isolated.

### 2.2 Algorithm (step by step)

```
Let R  = number of eligibility rules in a policy
Let N  = |corpus|
Let L  = max size of any rule's `value` list (for `in` / *_is_in / *_not_in`)
Let F  = number of rules whose operator flip is risk="missing_attribute_flip"

STEP 1  Evaluate both versions over the corpus.          [REPO replay.py:46-47]
        base_dec[s]  = evaluate(s.attrs, base)     for each s in corpus
        prop_dec[s]  = evaluate(s.attrs, proposed) for each s in corpus
        # evaluate = ordered rule scan, SHORT-CIRCUIT on first failing rule.
        #            [REPO evaluator.evaluate:71-76]

STEP 2  Structural diff of the two policy documents.     [REPO diff.diff_policies]
        - scalar fields compared directly (latency, fallback, cap, offer.category)
        - rules keyed by id into two maps; iterate sorted(union of ids)
        - classify each id: added | removed | modified(op/value/flags)
        - tag risk per change (missing_attribute_flip, eligibility_widened, ...)
          [REPO diff._risk_for_rule_change]

STEP 3  Raw decision delta (the "what changed").
        changed = { s : base_dec[s].decision != prop_dec[s].decision }
        change_kind(s) in {unchanged, nothing_to_offer, offer_to_nothing}
          [REPO replay._change_kind]

STEP 4  COUNTERFACTUAL ISOLATION (the "why"/attribution).  [REPO constraints.py:140-168]
        flip_ids = rule ids where diff tagged missing_attribute_flip on `.op`
        for each rid in flip_ids:
            reverted := proposed.model_copy(deep=True)      # never mutate proposed
            set reverted.rule(rid).op := base.rule(rid).op  # revert ONE operator
            for each session s with attribute(rid) MISSING:  # only missing matter
                if prop_dec[s]=offer AND base_dec[s]=no_offer
                   AND evaluate(s.attrs, reverted)=no_offer:
                    silent_wideners.add(s)   # the flip is the NECESSARY cause
                    attributions[s] := (rid, "include_is_not_in -> exclude_is_in")

STEP 5  Assemble SemanticDelta(changed, attributions, silent_wideners, counts).
```

**Why STEP 4 is *counterfactual isolation* and not correlation.** A raw diff can tell
you a session flipped `no_offer → offer` while the operator also changed — but a policy
edit usually touches several fields at once, so correlation is not causation. STEP 4
holds *everything else in the proposed policy fixed* and reverts exactly one operator.
If the offer then disappears (`reverted = no_offer`), that operator is a **but-for
cause** of the widening for that session — the strongest attribution a deterministic
system can make without an online experiment. This is the algorithmic form of Rubin
counterfactual "hold all else equal; toggle the treatment." `[REPO constraints.py]`

### 2.3 Data structures used

- **Two hash maps** `base_dec`, `prop_dec : session_id → Decision` — O(1) lookup for
  the pairwise delta and the counterfactual `[REPO replay.py:46-47]`.
- **Two hash maps** `base_rules`, `prop_rules : rule_id → Rule` for the structural
  diff; iteration over `sorted(set|set)` for a deterministic, id-ordered change list
  `[REPO diff.py:44-46]`.
- **`by_id : session_id → snapshot`** map built once for the counterfactual
  `[REPO constraints.py:161]`.
- **Sets**: `changed`, `flip_ids`, `silent_wideners` — set membership + union.
- **Context graph** `[DESIGNED]`: rule → {attribute, operator, value-list}. In the repo
  this is implicit in `Rule`; making it an explicit DAG (attribute nodes → rule nodes →
  policy) lets attribution walk edges instead of re-scanning, and is the natural place
  to extend beyond the single documented flip.

### 2.4 Complexity (justified — no hand-waving)

| Phase | Time | Justification |
|---|---|---|
| STEP 1 evaluate ×2 | **O(N · R · L)** | For each of `N` sessions, `evaluate` scans up to `R` rules `[REPO evaluator.evaluate:71]`; a list-membership op (`in`, `*_is_in/not_in`) costs O(L) `[REPO evaluator.eval_rule:50-58]`. Short-circuit only *lowers* the constant. |
| STEP 2 diff | **O(R log R)** | `sorted(set(base)∪set(prop))` dominates the id walk `[REPO diff.py:46]`; each rule's `model_dump()` compare is O(fields)=O(1). Scalars O(1). |
| STEP 3 delta | **O(N)** | one pass over `prop_dec` comparing to `base_dec`, O(1) each `[REPO replay.py:56-73]`. |
| STEP 4 counterfactual | **O(F · N · R · L)** | for each of `F` flipped operators, one `evaluate` over the missing-attribute sessions (≤ N), each O(R·L) `[REPO constraints.py:148-168]`. `F` is tiny (usually 1); `model_copy(deep=True)` is O(R) per flip, dominated. |
| **Total** | **O(N · R · L)** for practical F | Base+proposed evaluation dominates; the counterfactual adds a small constant factor `F` (≈1). |

**Space.** **O(N · A)** for the corpus (`A` = attributes/session) + **O(N)** for the two
decision maps + **O(C)** for the change list (`C` = number of diff changes) + **O(N)** for
the audit `DECISION_RECORDED` events (only *changed* sessions are logged
`[REPO replay.py:74-76]`, so ≤ N). Total **O(N · A)**.

---

## 3. The missing-attribute matrix (the centerpiece) — exhaustive

Fix one rule with attribute `a` and value list `L`. A session's attribute `a` falls in
exactly one of three input classes. `_present(attrs, a)` is **true iff `a` is a key AND
its value is not `None`** `[REPO evaluator._present:32-33]` — so **absent key and `None`
are the same class (MISSING)**; an empty string `""` is **present**.

Rule predicates as shipped `[REPO evaluator.eval_rule:51-58]`:
- `include_is_not_in` ≡ `present AND (value ∉ L)`
- `exclude_is_in`     ≡ `(NOT present) OR (value ∉ L)`

Result = **INCLUDED** means the rule *passes* (session stays eligible); **EXCLUDED**
means the rule *fails* (→ `no_offer` by short-circuit).

| Input class | `value ∈ L`? | `include_is_not_in` | `exclude_is_in` | Diverge? |
|---|---|---|---|---|
| **present, matches** (value ∈ L) | yes | `present ∧ ¬(∈L)` = **EXCLUDED** | `¬present ∨ ¬(∈L)` = `F ∨ F` = **EXCLUDED** | no — identical |
| **present, differs** (value ∉ L) | no | `present ∧ (∉L)` = **INCLUDED** | `¬present ∨ (∉L)` = `F ∨ T` = **INCLUDED** | no — identical |
| **MISSING** (absent key or `None`) | n/a | `present`=F ⇒ **EXCLUDED** | `¬present`=T ⇒ **INCLUDED** | **YES — the flip** |

**Airtight conclusion.** The two operators are **behaviourally identical on every
input except MISSING**. On MISSING they are exact opposites: `include_is_not_in`
**EXCLUDES**, `exclude_is_in` **INCLUDES**. Therefore switching
`include_is_not_in → exclude_is_in` can only ever *widen* eligibility, and it does so on
exactly the population `{ s : a is absent or None }` — a set that is **invisible in a
present-only test corpus**. This is verified by the shipped unit tests
`test_include_is_not_in_excludes_missing` and `test_exclude_is_in_includes_missing`
`[REPO test_domain.py:32-44]`.

**How the compiler detects the silent widening.** STEP 4 does *not* trust the diff
alone. It (1) confirms the operator flip via `diff` risk tag, then (2) for every session
with `a` MISSING, checks the exact three-way condition
`prop=offer ∧ base=no_offer ∧ reverted=no_offer`. Only sessions that were *previously
excluded and are now eligible **because of** the flip* land in `silent_wideners`
`[REPO constraints.py:164-168]`. If ≥1 such session exists → constraint
`missing_attribute_semantics` = **FAIL** → verdict **BLOCKED**
`[REPO constraints.py:170-174, verdict.decide:36-39]`. If the operator flipped but the
corpus happened to contain no affected missing session → **WARN** (honest: the trap
exists but this corpus didn't exercise it) `[REPO constraints.py:175-177]`.

Concrete instance: seed `aurora_v17.json` rule `r4` is
`customer.cc_bin / include_is_not_in / ["411111","511111"]` `[REPO seed]`. Flipping `r4`
to `exclude_is_in` makes every one of the ~18% sessions with no `cc_bin` eligible — the
exact scenario `test_constraints_catch_trap_and_warn` asserts FAIL on
`[REPO test_domain.py:94-100]`.

---

## 4. Exhaustive edge cases (input → expected behaviour)

Each row cites the shipped code path that produces the behaviour, or marks `[DESIGNED]`
where the repo leaves it implicit / to be hardened.

| # | Edge case | Input | Expected behaviour | Cite |
|---|---|---|---|---|
| E1 | **Empty audience** | `eligibility_rules = []` | `evaluate` loops zero rules → returns `offer` for *every* session. base==proposed empty ⇒ no change ⇒ `INSUFFICIENT_EVIDENCE` ("nothing to validate"). | `[REPO evaluator.evaluate:71-76; verdict.decide:58-60]` |
| E2 | **All-missing attribute** | corpus where `cc_bin` absent in 100% of sessions, flip `include→exclude` | *Every* session silently widened; `silent_wideners = all`; `missing_attribute_semantics` FAIL → **BLOCKED**. Maximal-blast-radius case. | `[REPO constraints.py:164-174]` |
| E3 | **Contradictory rules** | `age gte 25` AND `age lte 20` on same attr | No session can pass both ⇒ all `no_offer` deterministically. If both versions contradictory ⇒ no change ⇒ `INSUFFICIENT_EVIDENCE`. Not an error — a satisfiable-set of ∅. | `[REPO evaluator.evaluate short-circuit]` |
| E4 | **No affected sessions (thin support)** | `changed_count` between 1 and 29 | `ope.support_guard`: `ess=changed_count < MIN_ESS(30)` ⇒ `support="THIN"`, `refuses_estimate=True`. It **refuses to emit a lift number** and defers to the holdout. (Verdict is decided independently; thin support alone does not block.) | `[REPO ope.support_guard:16-35]` |
| E4b | **Zero changed** | `changed_count == 0` | `ope` `support="NONE"`; verdict `INSUFFICIENT_EVIDENCE` ("no decisions changed; nothing to test"). | `[REPO ope.py:22-25; verdict.decide:58-60]` |
| E5 | **Duplicate / idempotent request** | same `Idempotency-Key` re-POSTed | Returns the *same* stored job; never re-run (Invariant 7). Financial state dedupes on `conversiontype:confirmationref`, updated once (Invariant 6). | `[REPO replay.py router; TRANSACTION_INVARIANTS.md 6-7]` |
| E6 | **Huge diff** | thousands of rule changes | Compiler is O(N·R·L); no arbitrary cap in code — degrades linearly. Diff list is O(C). `[DESIGNED]` add a change-count guard for UI paging. | `[REPO diff.py; §2.4]` |
| E7 | **Float / normalization in numeric thresholds** | `gte` value `25.0000001` vs `25`; lowered `gte`/raised `lte` | `_risk_for_rule_change` casts with `float()` and compares exactly (`a < b`); lowered `gte` or raised `lte` ⇒ risk `eligibility_widened`. **No epsilon** ⇒ representation error is possible. `[DESIGNED]` use `Decimal` or a documented tolerance. | `[REPO diff.py:13-21]` |
| E8 | **Boolean in numeric compare** | `customer.age = True`, rule `gte 25` | `_num` explicitly rejects `bool` (subclass of `int`) → raises `ValueError`. **Uncaught inside pure `evaluate`**; only the `failclosed` guard catches exceptions. `[DESIGNED]` decide whether the core should fail-closed on such data. | `[REPO evaluator._num:62-65; failclosed._guarded_decide]` |
| E8b | **Non-numeric string in `gte/lte`** | `age = "twenty"`, rule `gte 25` | `_num` returns the string; `str >= int` → `TypeError`, uncaught in core (same caveat as E8). | `[REPO evaluator.eval_rule:45-48]` |
| E9 | **Unicode / case in string match** | `seat_type = "Premium"` vs rule `equals "premium"` | Exact Python `==` / `in` — **case-sensitive, codepoint-exact, no NFC normalization**. `"Premium" ≠ "premium"`; composed vs decomposed `é` differ. Deterministic by design. `[DESIGNED]` normalize at ingestion if case-insensitivity is desired. | `[REPO evaluator.eval_rule:41-50]` |
| E10 | **null vs empty vs absent** | `a` absent · `a = None` · `a = ""` | absent and `None` ⇒ **MISSING** (`_present` false); `""` ⇒ **present**. So `""` under `include_is_not_in` with `"" ∉ L` ⇒ INCLUDED, but `None` ⇒ EXCLUDED. This trio is the subtlest correctness surface. | `[REPO evaluator._present:32-33]` |
| E11 | **Unknown operator** | `op = "regex_match"` | `eval_rule` raises `ValueError(f"unknown operator")` — fail-loud on an out-of-contract policy. | `[REPO evaluator.eval_rule:59]` |
| E12 | **Duplicate rule ids** | two rules `id="r4"` | Policy construction rejected: validator raises `"eligibility_rules must have unique ids"`. Aggregate invariant enforced at the boundary. | `[REPO policy._rule_ids_unique:72-77]` |
| E13 | **Below minimum corpus** | `session_count < 50` | Verdict `INSUFFICIENT_EVIDENCE` regardless of clean checks (`MIN_SESSIONS=50`). | `[REPO verdict.decide:41-45]` |
| E14 | **Counterfactual false-negative** | operator flipped, but corpus has *zero* missing-`a` sessions | `flip_ids` non-empty but `silent_wideners` empty ⇒ **WARN**, not FAIL. Honest: the trap is latent; this corpus can't prove it. Motivates the seed's forced ~18% missing. | `[REPO constraints.py:175-177; sessions.py:32-36]` |

### The 5 nastiest (ranked)

1. **E10 null vs "" vs absent.** `_present` collapses absent and `None` into MISSING but
   treats `""` as present — so `None` and `""` take *opposite* branches of the
   missing-attribute matrix. A single upstream serializer that emits `""` for "unknown"
   instead of dropping the key would flip the entire trap's population.
2. **E2 all-missing flip.** The maximum-blast-radius silent widening: 100% of the
   audience becomes eligible from one operator character-change; correctly BLOCKED.
3. **E8 / E8b boolean & non-numeric in `gte/lte`.** The only place the *pure core* can
   raise instead of returning a `Decision`; exceptions are only caught by `failclosed`,
   not by `evaluate` — a real determinism/robustness seam to decide on explicitly.
4. **E14 counterfactual false-negative.** The compiler is only as strong as the corpus's
   coverage of missing values; a present-only corpus downgrades a genuine trap to WARN.
   The seeded 18%-missing generator exists precisely to defeat this.
5. **E7 float threshold with no epsilon.** Exact `float()` comparison for widen-detection
   means a `25` vs `25.0` vs `24.9999999` edit can be mis-attributed; needs `Decimal` or
   a stated tolerance to be bit-safe across serializers.

---

## 5. Determinism & correctness argument

**Why `compile` is a pure function.** `evaluate` performs no I/O, no randomness, no
wall-clock read — it is a fold over an ordered rule list against a captured attribute
map `[REPO evaluator.py docstring + body]`. The corpus is produced by a *seeded* PRNG,
so `(seed, count)` fixes the snapshots exactly `[REPO sessions.generate_sessions:22]`.
The diff, counterfactual, constraints, and verdict are all deterministic reductions over
those values. Therefore `compile(base, proposed, corpus)` depends *only* on its inputs.

**Why it replays bit-for-bit.** Given identical `(base, proposed, seed, count,
injections)`, every intermediate — decisions, diff, `silent_wideners`, verdict, and the
ordered audit event stream — is reproduced identically. This is asserted by
`test_evaluate_determinism` and `test_replay_deterministic` `[REPO test_domain.py:59,174]`
and is the foundation of Invariant 3.

**Property-based tests that must always hold** (`[DESIGNED]` where not yet in the suite):

- **P1 Monotone widening.** For any corpus, flipping `include_is_not_in →
  exclude_is_in` on a rule never *removes* an eligible session:
  `offers(proposed) ⊇ offers(base)` restricted to that rule's effect. (Direct corollary
  of §3.)
- **P2 Counterfactual soundness.** Every `s ∈ silent_wideners` satisfies
  `base=no_offer ∧ proposed=offer ∧ reverted=no_offer` and has attribute MISSING — no
  false positives. `[REPO constraints.py:164-168]`
- **P3 Present-invariance.** For any two operators that only differ on MISSING, decisions
  agree on all present-attribute sessions. (The two identical rows of §3.)
- **P4 Determinism.** `compile(x) == compile(x)` and `evaluate(a,p) == evaluate(a,p)` for
  all inputs. `[REPO test_domain.py:59]`
- **P5 Fail-closed totality.** For every injection kind, the proof resolves to
  `no_offer`, checkout preserved, no offer state created. `[REPO failclosed.prove:39-46;
  test_domain.py:128]`
- **P6 Verdict lattice.** Any FAIL ⇒ BLOCKED; else any WARN or `count<50` ⇒
  INSUFFICIENT_EVIDENCE; else ≥1 change ⇒ ELIGIBLE_FOR_HOLDOUT; else
  INSUFFICIENT_EVIDENCE. No other outputs are reachable. `[REPO verdict.decide]`
- **P7 Idempotent id-ordering.** The diff change list is ordered by `sorted` rule ids, so
  it is stable across runs. `[REPO diff.py:46]`

---

## 6. Where an LLM must NOT be (ADR-002 in algorithmic terms)

**The decision path is a pure, total function; models live only at the edges.**
`[REPO ADR-002]`

- **On-path (LLM forbidden):** `evaluate`, `eval_rule`, `diff_policies`, the
  counterfactual isolation in `evaluate_constraints`, `support_guard`, `decide`, and the
  `AuditTrail` HMAC. Every one is a deterministic reduction with a stated Big-O and a
  reproducibility guarantee. Inserting a language model here would break P4 (determinism),
  void bit-for-bit replay, and make the audit trail non-verifiable — it would also blow
  the sub-200ms latency budget the policy contract enforces `[REPO POLICY_SCHEMA.md]`.
- **Off-path (LLM permitted, and only advisory):** a plain-language *summary* of an
  already-computed `SemanticDelta` / verdict. It must **degrade to nothing** — if the
  model is unavailable or wrong, the verdict, the blocked/eligible decision, and the
  audit are entirely unaffected. The correctness of Threshold **does not depend on a
  language model**, by construction. `[REPO ADR-002 Decision + Consequences]`

Algorithmic litmus test for any proposed AI feature: *"If this model returns garbage,
can it change a BLOCKED into an ELIGIBLE, or alter a recorded decision?"* If yes, it is
on-path and forbidden by ADR-002. If no, it is edge decoration.
