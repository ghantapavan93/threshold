# Moment Forge — Context-Integration Failures: A Critical DDD Deepening

**Date:** 2026-07-19 · **Retrieval date:** 2026-07-19
**Author lens:** senior domain modeller (Evans/Vernon lineage) doing an adversarial
self-review of the Moment Forge domain model before it ships in the Threshold
proof-of-work.
**Companion docs:** `research/rokt/27_DDD_DOMAIN_MODEL.md` (the model under review),
`docs/MOMENT_FORGE_ALGORITHMS.md` (tactical spine), `docs/MOMENT_FORGE_ARCHITECTURE.md`
and `docs/MOMENT_FORGE_SYSTEM_ARCHITECTURE.md` (build), `docs/MOMENT_FORGE_EXPERIENCE.md`
(UI grammar). Engine read in full: `backend/app/domain/{evaluator,diff,constraints,
verdict,ope,contexts,policy}.py`, `backend/app/outbox.py`, `backend/app/routers/conversions.py`.

**Labels (carried from the corpus):** `[VERIFIED-PUBLIC]` Rokt public docs/blog ·
`[REPO]` built + tested here (file named) · `[INFERENCE]` reasoned from cited facts ·
`[HYPOTHESIS]` plausible, explicitly unverified.

**DDD citations** are to Evans, *Domain-Driven Design* (2003, "Blue Book"); Vernon,
*Implementing Domain-Driven Design* (2013, "Red Book") and his *Effective Aggregate
Design* essays (dddcommunity.org); Ward Cunningham, *The CHECKS Pattern Language*
(Whole Value); Fowler's bliki. Pattern definitions re-verified 2026-07-19 against
martinfowler.com/bliki/BoundedContext.html and informit.com's Red Book aggregate-rules
excerpts.

---

## 0. The critique in one paragraph (read this first)

The current model claims the Transaction Moment is *several models that share a
vocabulary but not a meaning*, and that the disease worth catching is meaning breaking
**across a boundary**. But the **one failure it actually demonstrates in running code —
the missing-attribute inversion — never crosses a boundary.** It lives entirely inside a
single `evaluate(attrs, policy)` function over a single `Policy` aggregate
(`[REPO evaluator.py]`). `contexts.py` does not translate anything; it *buckets rule
attributes by namespace prefix* (`customer.*`, `purchase.*`) and rolls up a diff
(`[REPO contexts.py:62-89]`). There is no second model, no anticorruption layer, no term
that means two different things in two different pieces of code. So the page's strategic
thesis (integration failures) is presently evidenced only by a **tactical, intra-context
ubiquitous-language collision** (operator polysemy on missing values). That gap — between
the *claim* (cross-boundary corruption) and the *proof* (within-model operator flip) — is
the single most important thing a senior DDD reviewer would name, and it is the through-line
of this document. Below: four genuinely cross-boundary integration cases, the tactical
rigor missing to model them, a buildable "Translation Map" that makes at least one of them
**real deterministic code** (closing the gap honestly), and a ranked self-critique.

---

## 1. Context-integration cases — meaning breaking ACROSS a boundary

The missing-attribute fracture (doc 27 §4.1) is a **within-context** collision: two
operators in *one* model disagree on one input class. The cases below are different in
kind — the **same term is authoritative in two different models**, and the corruption
happens **in the translation step between them** (or in its absence). Evans' name for the
governing construct is the **Anticorruption Layer**: a translation layer that keeps an
upstream model's meaning from leaking into and corrupting a downstream model (Blue Book
ch. 14). Fowler restates the need precisely: different bounded contexts hold "completely
different models of common concepts with mechanisms to **map between these polysemic
concepts** for integration" (BoundedContext, retrieved 2026-07-19). Where that mapping is
left implicit, the downstream silently becomes a **Conformist** — it adopts the upstream
term as-is, inheriting a meaning it was never designed for.

A note on demonstrability that governs all four cases: **the shipped engine has exactly
one domain model** (the policy evaluator). It has no measurement model, no reward ledger,
no incrementality estimator, no agent model in the *decision* path. Therefore none of
these cross-boundary cases is demonstrable with the *existing* `evaluate`/`diff`/`verdict`
core as-is. Each is either (a) demonstrable with a **new small pure module** in the exact
spirit of the engine (seeded, deterministic, testable, honest-labelled) — the **Translation
Map** of §3 does this for Case A — or (b) best kept as a **clearly-marked illustrative
interactive**. I say which, per case, and I never dress an illustrative case as engine
truth.

### Case A — "conversion": recorded event vs. revenue vs. causally-incremental ★ (the sharpest)

**The two (three) meanings.**
- **BC-5 Measurement** — a **conversion** is a *deduplicated recorded event*, identity
  `conversiontype:confirmationref`; the question it answers is "have we already counted
  this?" `[VERIFIED-PUBLIC]` dedup keys (`02` Stage 10); `[REPO conversions.py:18]` — the
  dedup key is literally `f"{req.conversiontype}:{req.confirmationref}"`.
- **BC-4 Loyalty / commerce** — a **conversion** is a *revenue/obligation event* (a
  purchase that may earn a reward). `[VERIFIED-PUBLIC]`/`[HYPOTHESIS]` (`26` #4).
- **BC-3 Incrementality** — a **conversion** is a *causally-incremental outcome*:
  treatment-minus-control, net of who would have converted anyway.
  `[VERIFIED-PUBLIC]` Rokt's incrementality standard + "Would Have Seen" holdout (`26` #1).

**The boundary + the governing Evans pattern.** BC-5 Measurement → BC-3 Incrementality.
The pattern that *must* govern it is an **Anticorruption Layer** (Blue Book ch. 14). A
secondary pattern applies to the interchange *format*: a **Published Language** — a
documented `ConversionEvent` schema carrying its own `kind` discriminator — is what lets
the ACL do its job. Rokt's own dedup key is a de-facto published identity for the
*recorded* meaning; there is no published identity for the *incremental* meaning, which is
exactly where the leak hides.

**The exact failure if the translation is implicit.** With no ACL, BC-3 becomes a
**Conformist** to BC-5: it treats "conversion count" as the incrementality input. Then
`lift = conversions(treatment) − conversions(control)` silently counts *non-incremental*
conversions (people who would have bought anyway) as lift. The number inflates upward — the
precise bias Rokt's incrementality standard exists to kill. The corruption is invisible
because *both sides use the word "conversion" and both are internally correct*; only the
**assignment across the seam** is wrong. This is the canonical Evans ACL failure, and it is
strictly *more* Evans-shaped than the missing-attribute inversion because it involves two
distinct models, not one operator.

**How to demonstrate it — honestly.**
- **Demonstrable with real (new) deterministic code** — this is the §3 build. A pure
  `translation.py` module defines a typed `ConversionEvent{kind}` whole-value and two
  translations across the BC-5→BC-3 seam: `conformist_translate` (identity — the bug) and
  `acl_translate` (subtracts a labelled baseline conversion rate to yield causally-
  incremental). Over a **seeded corpus** (reusing the `sessions.py` seeding discipline
  `[REPO sessions.py]`), the module computes `recorded_lift` vs `incremental_lift`; the
  **delta is the inflation**, a *real* number from *real* code. The one synthetic input
  (the would-have-converted-anyway baseline) is labelled exactly like the engine's existing
  "~18% of sessions omit `cc_bin`" synthetic `[REPO sessions.py]` — no Rokt-internal number
  is claimed.
- **Honest boundary:** the *translation math* is standard incrementality (VERIFIED-PUBLIC
  that Rokt bets on it); the *specific seam and the baseline value* are `[INFERENCE]`/
  synthetic and must be marked so on the page. The algorithmic move — *revert the ACL to
  identity and show what leaks* — is the **same counterfactual isolation** the engine
  already uses for the operator flip (`[REPO constraints.py:157-168]`), so it is cohesive,
  not bolted-on.

### Case B — "reward": earned vs. issued vs. redeemable, diverging under partial failure

**The two (three) meanings.**
- **earned** — the shopper *qualified* (completed the action). A fact in BC-4 Loyalty.
- **issued** — the reward is *materialized* (gift card generated, cashback posted) — a
  booked financial liability, owned by a **Fulfilment/Ledger** context (BC-4-adjacent).
- **redeemable** — the reward is *currently usable* (not expired, not clawed back).

**The boundary + the governing Evans pattern.** BC-4 Loyalty ⟷ Fulfilment/Ledger, with an
**ACL from BC-5 Measurement** so recording semantics don't silently define liability. The
deeper point a senior reviewer makes: `earned ⇒ issued ⇒ redeemable` is **not a
within-aggregate invariant** — it spans aggregates that *cannot* share a transaction
(Vernon, *Rule: Use Eventual Consistency Outside the Boundary* — "if executing a command on
one Aggregate requires business rules on one or more other Aggregates, use eventual
consistency … use domain events to … initiate a separate update within a new transaction",
Red Book, retrieved 2026-07-19). So the correct governing constructs are **Partnership**
(Loyalty + Fulfilment succeed/fail together) *plus* a **process manager / saga** driving the
lifecycle over domain events — not a shared field.

**The exact failure if the translation is implicit.** Collapse the three into one status
field (a **whole-value violation**, §2.2) and you *assume* the cross-aggregate invariant
instead of *checking* it. Under partial failure — the issuance call times out after the
earn is committed — `earned` and `issued` diverge: an **orphaned earn** (shopper qualified,
never received → support ticket, churn) or, on a naive retry without idempotency, a
**double-issue** (one earn, two liabilities). The word "reward" hides *which* of the three
states you hold, so no local check can see the divergence.

**How to demonstrate it — honestly, and this one has real repo grounding.** The repo
already ships the exact pattern that *prevents* this divergence: the **transactional
outbox** (`[REPO outbox.py]`) writes events in the *same* DB transaction as the job and a
worker drains them with capped backoff + dead-lettering (`outbox.py:28-80`); `events_for_job`
fans `VERDICT_ISSUED` out to `billing`, `analytics`, `partner`
(`[REPO outbox.py:83-91]`). So the reward case is **demonstrable by analogy against a real,
tested mechanism**: show a *dual-write* (earn committed, "issue" event lost on crash → the
two diverge) vs. the *transactional outbox* (earn and issue-intent are atomic; the worker
guarantees eventual issuance or a visible dead-letter). Honest labels: the **outbox is
`[REPO]`**; its **application to reward issuance is `[HYPOTHESIS]`** (`26` #4). Best rendered
as an illustrative interactive that *reuses the real outbox semantics* (PENDING → PUBLISHED
→ DEAD_LETTER states are real), not as a fabricated ledger.

### Case C — "impression": human vs. agent-mediated

**The two meanings.**
- **BC-5/BC-1 classical** — an **impression** is a *faithful rendering seen by a human* —
  the atomic unit incrementality assumes.
- **BC-7 Agent-Mediation** — an LLM shopping agent may "show" an offer while stripping
  imagery, truncating the value prop, reordering, or burying it — a **degraded/echoed
  impression**. Exposure ≠ exposure. `[VERIFIED-PUBLIC]` agent-checkout framing (`26` #3).

**The boundary + the governing Evans pattern.** BC-7 ⟷ BC-5/BC-1. BC-7 is a **Conformist**
toward the *external* agent-payment standards (AP2/ACP/UCP) — a *moving* upstream it cannot
control (`26` #2 notes ACP's product died in ~5 months) — and installs an **ACL** *inward*
so that a "shown" event from an agent is translated into a `PresentationIntegrity`-tagged
impression before BC-5 counts it.

**The exact failure if the translation is implicit.** BC-5 blends faithful and degraded
impressions under one "impression" whole-value. The incrementality atom is corrupted: lift
silently drops for reasons attribution cannot see, and "it converts (for humans)" is
mistaken for "it converts through a bot" — the blunt lesson of near-zero agentic-checkout
sales (`26` #3). No presentation-integrity translation ⇒ the impression count lies.

**How to demonstrate it — honestly.** **Illustrative only.** There is no presentation model
in the engine and building a faithful one is a large `[HYPOTHESIS]` surface. Render it as a
clearly-marked interactive: the same offer "impressed" through a **human** channel
(faithful) vs. an **agent** channel (fidelity-degraded), with an ACL toggle that either
*refuses to count* the degraded impression as the same unit (correct) or *conforms* and
counts it (the lie). No numbers claimed; the point is the **unit mismatch**, shown
qualitatively. This is the honest home for the weakest-grounded of the four cases.

### Case D — "holdout member / Would-Have-Seen": per-experiment label vs. global exclusion (the one the model under-rates)

Included because a senior reviewer would flag it as the **highest-stakes** integration
invariant in the whole map, and the current model lists it (doc 27 §4.5, Invariant 12) but
does not treat it as an integration *failure* to demonstrate.

**The two meanings.** (A) **statistical** — a member of the control group for one
experiment window; (B) **systems-integrity** — a WHS member "once a member, always a member
… excluded from all future opportunities" across *every* surface, forever
(`[VERIFIED-PUBLIC]` `26` #1).

**Boundary + pattern.** BC-3 Incrementality ⟷ BC-4 Loyalty ⟷ BC-6 Eligibility. The WHS
exclusion is a **Shared Kernel** (a small, jointly-owned "who is globally excluded" model)
that *must* be honored inside every surface. Adding a new surface (a reward placement)
without sharing that kernel is the fracture: excluded on surface A, exposed on surface B →
the experiment's validity dies silently and lift is biased upward. "Incrementality is a
systems-integrity problem before it's a statistics problem" (`26` #1).

**Demonstrability.** Illustrative (the map/RippleSim already models a new surface joining);
the honest addition is to *mark the WHS edge as a Shared Kernel* and let RippleSim show the
wave reaching a new surface that lacks the kernel. No engine change; no fabricated number.

**The unifying senior insight across A–D.** Each is a shared word (*conversion, reward,
impression, holdout*) that is authoritative in two models, crossing a seam that *should* be
an ACL / Shared Kernel / Partnership-with-a-process-manager but is implicitly a
**Conformist**. The missing-attribute inversion is the same disease *within* one model;
A–D are the disease *across* models — which is what the page claims but does not yet prove.

---

## 2. Tactical rigor a senior reviewer would want — and we're missing

The model's tactical layer (`docs/MOMENT_FORGE_ALGORITHMS.md`) is genuinely strong on the
*one* aggregate it exercises: `Policy` has real invariants (unique rule ids, positive
latency, ordered evaluation `[REPO policy.py:88-94]`), `Decision` is a frozen whole-value
with behaviour (`is_offer()`), and the counterfactual is rigorous. The gaps are all at the
**boundaries between aggregates** — exactly where the integration cases live.

### 2.1 Aggregate design + true invariant boundaries — the central gap

- **Only one aggregate does real work.** `Policy` is enforced; `SessionSnapshot`,
  `ReplayJob`, `AuditTrail` are documented aggregates but `SessionSnapshot` is a bare dict
  (`[REPO sessions.py]`; the algorithms doc admits `[DESIGNED over REPO sessions.py dict]`).
  So "no future-information leakage" (Invariant 4) is a *discipline*, not a *structurally
  enforced* consistency boundary. **Fix (content + small code):** make `SessionSnapshot` a
  frozen value object whose constructor is the only path to a snapshot, so immutability and
  event-time closure are enforced by the type, not by convention. Cite Vernon's *Design
  Small Aggregates*.
- **The load-bearing invariants span aggregates and have no home.** `earned ⇒ issued ⇒
  redeemable` (Case B), `recorded ≠ incremental` (Case A), and `WHS-exclusion-is-global`
  (Case D) are all cross-aggregate. Vernon is explicit that such rules must be **eventually
  consistent via domain events + a separate transaction**, not enforced in one aggregate
  (Red Book, *Use Eventual Consistency Outside the Boundary*). The model *names* these
  invariants (doc 27 §6) but has **no process manager / saga** consuming the outbox to
  enforce or *test* them. The transactional outbox exists (`[REPO outbox.py]`) but nothing
  reads it back to close a multi-step invariant. **Fix — BUILT (2026-07-19):** the
  **Reconciliation Process** (`[REPO reconciliation.py]`, a process manager, Red Book
  ch. 12) consumes the lifecycle event stream and *proves* `earned ⇒ exactly-one issued ∨
  visible dead-letter` by replay — the same seeded fault world under dual-write vs the
  transactional outbox, reconciled side by side (`POST /reconciliation-audit`), plus the
  same move over the REAL replay-job fan-out rows (`GET /reconciliation`,
  `[REPO test_reconciliation.py]`, incl. the 20-seed property that outbox divergence is
  never silent). On the page it is an explicit lane (Fig. 03c). This is the tactical
  construct that makes Cases A/B/D *modelable* rather than merely asserted.

### 2.2 Whole-value / value objects — the root cause of the whole disease class

The polysemic terms are **primitives**: a conversion is an `int` count, a reward would be a
`str` status, an impression does not exist as a type. Ward Cunningham's **Whole Value**
pattern (CHECKS) and Evans' **Value Object / Quantity** both say a domain quantity must
carry its meaning/unit so it cannot be silently combined with a different one. `recorded`
and `incremental` conversions are both `int`, so `recorded + incremental` type-checks —
that is *precisely* the "quantity without a unit" anti-pattern, and it is *why* the ACL can
be skipped without any compiler complaint. **Fix (highest-leverage tactical):** give each
polysemic term a typed whole-value with its **owning context stamped in the type** —
`ConversionEvent{kind: RECORDED|REVENUE|INCREMENTAL}`, `RewardStatus{EARNED|ISSUED|
REDEEMABLE}`, `ImpressionFidelity{FAITHFUL|DEGRADED}`. A cross-context assignment then
*requires* a translation function (the ACL) — an implicit conformist becomes a runtime
error at the seam. This single change hardens the model against A–D **and** is the exact
substrate the §3 Translation Map runs on. `Decision` already proves the team can do this
(`[REPO evaluator.py:26-39]`); extend the discipline to the boundary terms.

### 2.3 Domain events / event-storming — a catalog, not a choreography

Doc 27 §5 is a solid *event catalog* (past-tense facts, owning BC, evidence). But it is not
an **event-storming model** (Brandolini; Vernon Red Book ch. 8): there are no **commands**,
no **policies/reactions** ("when `ConversionRecorded` then attempt `RewardEarned`"), no
**read models**, and no marked **pivotal events**. The integration bugs live in the
**inter-BC choreography** — the `ConversionRecorded → RewardEarned → RewardIssued` handoff
chain — which the catalog does not draw. The *intra*-BC-2 flow is real and tested
(`REPLAY_STARTED → … → VERDICT_ISSUED`, fanned via the outbox `[REPO outbox.py:83-91]`), but
the *cross*-BC choreography is absent. **Fix:** add an event-storming **choreography strip**
that shows each cross-boundary handoff and annotates it with its translation (ACL present)
or its absence (implicit conformist) — turning the event list into the map of exactly where
A–D occur.

### 2.4 Factories / repositories — the minor, honest gap

Lower leverage, but name it for completeness. Policy construction *is* effectively a
factory (Pydantic validators reject duplicate ids / non-list membership values at the
boundary `[REPO policy.py:40-49,88-94]`), and `load_policy` is a repository. What's missing
is **reconstitution guarantees for cross-aggregate references**: a WHS-membership repository
and a reward-ledger repository that return *by identity* (Vernon, *Reference Other
Aggregates by Identity*) so no code can reach across a boundary and mutate another
aggregate transactionally. These are `[HYPOTHESIS]` extensions; call them out as the seams a
production build would need, don't pretend they exist.

---

## 3. A buildable "Context Integration" deepening — the **Translation Map**

**Thesis of the build:** make **at least one** polysemic term actually cross an **ACL in
real deterministic code**, so the page's integration claim is *evidenced*, not just
diagrammed. Case A (conversion recorded→incremental) is the right choice: most
VERIFIED-PUBLIC grounding, fully quantifiable, and it reuses the engine's existing
counterfactual identity. This is an **enhancement in the spirit of the existing
Compiler/Fracture**, not a new engine — it adds an inline-input surface and one small pure
module, exactly like the `semantic-compile`/`simulations` adapters already designed
(`docs/MOMENT_FORGE_ARCHITECTURE.md §2`).

### 3.1 What it is (and how it differs from the existing LanguageLens)

`LanguageLens` (Experience §3) already drags a *word* across a seam and morphs its
*qualitative* meaning — beautiful, but it shows **no consequence**. The **Translation Map**
adds the consequence: the term travels along a **real relationship edge** (BC-5 → BC-3), and
at the ACL glyph you toggle **"ACL present" vs "Conformist (identity)"**; with the ACL
absent, a **real number visibly inflates at the wall**. It is `LanguageLens` fused with
`CompilerConsole`'s real-output-only discipline.

### 3.2 Backend — one new pure module + one thin read-only adapter

**`backend/app/domain/translation.py`** `[DESIGNED]` — pure, deterministic, no I/O, no LLM;
mirrors `contexts.py`/`sessions.py` discipline exactly.

```python
# Typed whole-values (the §2.2 fix, minimal slice)
class ConversionKind(str, Enum): RECORDED="recorded"; INCREMENTAL="incremental"
@dataclass(frozen=True)
class ConversionEvent: kind: ConversionKind; count: int; seam: str

# The two translations across BC-5 Measurement -> BC-3 Incrementality
def conformist_translate(recorded: int) -> ConversionEvent:
    # THE BUG: identity. Downstream inherits "recorded" as if it were "incremental".
    return ConversionEvent(ConversionKind.INCREMENTAL, recorded, "BC5->BC3")

def acl_translate(treatment_recorded: int, control_recorded: int,
                  n_treatment: int, n_control: int) -> ConversionEvent:
    # THE ACL: causal translation. Incremental = treatment rate - control rate,
    # scaled to treatment population. Standard would-have-converted-anyway removal.
    lift_rate = (treatment_recorded / n_treatment) - (control_recorded / n_control)
    return ConversionEvent(ConversionKind.INCREMENTAL, round(lift_rate * n_treatment), "BC5->BC3")
```

- The **corpus** reuses a seeded generator (`sessions.py` style): a labelled synthetic
  `baseline_conversion_rate` (the would-have-converted-anyway rate) is the *only* invented
  input — flagged on the page exactly like the engine's "~18% omit `cc_bin`" synthetic
  `[REPO sessions.py]`. **No Rokt-internal number is asserted.**
- The **corruption metric** is `conformist_result.count − acl_result.count` — computed from
  running both functions, i.e. **real engine output over a synthetic corpus**, the same
  integrity posture as the entire Threshold engine.
- **Algorithmic cohesion:** "revert the ACL to identity and show what leaks" is structurally
  the *same counterfactual* as "revert the operator and show what widens"
  (`[REPO constraints.py:157-168]`). One idea, two applications.

**`POST …/translation-audit`** `[DESIGNED]` — thin, read-only, deterministic adapter (same
class as `semantic-compile`): body `{term:"conversion", baseline_rate, seed, count}` →
`{term, seam:"BC-5→BC-3", upstream_meaning, downstream_meaning, pattern:"ACL",
conformist_result, acl_result, corruption:{magnitude, direction:"inflation"}, grounding,
synthetic_inputs:[...]}`. No writes; idempotent; ADR-002 intact (pure core, at most a
read). Unit tests: `acl_result ≤ conformist_result` always (P: an ACL can only *remove*
non-incremental counts); identity-when-control-rate-zero; determinism.

### 3.3 Frontend — reuse, don't reinvent (all per `MOMENT_FORGE_EXPERIENCE.md` + MASTER)

- **`TranslationMap` plate** reuses `ContextMap` layout + `RelationshipEdge` (the ACL edge
  already has a "wall" glyph, Experience §2.3) + `LanguageLens`'s crossing-morph +
  `CompilerConsole`'s **real-output-only** states (idle/loading/ok/empty/error). The term
  chip travels the BC-5→BC-3 edge; an **ACL toggle** at the wall switches
  `acl_translate`↔`conformist_translate`; the result region shows the two counts and the
  **inflation delta from the live endpoint** (never fabricated — MASTER §0.4).
- **Severity + verdict vocabulary** reused from `contexts.py SEVERITY` and the PASS/WARN/FAIL
  chip grammar; the inflation reads as a `critical` meaning-change card, same shape as the
  existing `meaning_changes[]` (`[REPO contexts.py:209-230]`).
- **Reduced-motion / offline:** static two-column "recorded vs incremental" comparison table
  with a "crosses the ACL →" caption (mirrors `LanguageLens`'s reduced-motion table,
  Experience §3); offline path serves a recorded fixture with the visible "recorded engine
  output" banner (Architecture §3.C). No color-alone; the corruption carries glyph + text.
- **Honesty chrome (non-negotiable):** a persistent marginalia tag on the plate —
  *"Seam and baseline are `[INFERENCE]`/synthetic; the translation math is standard
  incrementality; the numbers are computed live, not asserted."* This is the exact honesty
  posture the Compiler console already commits to (Experience §4).

### 3.4 Why this is the right build

It is the **highest-leverage single change** because it converts the page's *strategic*
claim into *executable* proof with minimal new surface: one ~120-line pure module, one thin
adapter, and components that already exist. It reuses the counterfactual algorithm, the
seeding discipline, the whole-value pattern (`Decision`), the map/edge/lens/console
components, and the MASTER integrity laws. It leaves Cases B/C/D honestly illustrative
(B grounded in the real outbox, C/D qualitative), so the doc never over-claims. And it
directly closes the §0 gap: after this build, at least one term (*conversion*) genuinely
means two things in two pieces of running code, with the ACL as the thing that keeps them
straight.

---

## 4. Self-critique — the 3 weakest points of the CURRENT model, ranked

### W1 (strongest). The one demonstrated failure is intra-context; the integration thesis is un-evidenced.
The entire engine lives in a **single bounded context** (the `Policy` evaluator). `contexts.py`
buckets attributes by namespace and rolls up a diff (`[REPO contexts.py:62-89,169-240]`); it
performs **no translation**, has **no second model**, and installs **no ACL**. The
"context fracture" the page celebrates is really a *within-model* ubiquitous-language
collision (operator polysemy on missing values, `[REPO evaluator.py:73-79]`). A senior
reviewer's sharpest line: *"You wrote a monograph about meaning breaking across boundaries
and then proved it with a bug that never leaves one function."*
**Highest-leverage fix:** the §3 **Translation Map** — make *conversion* cross a real ACL in
real deterministic code. This is the single change that makes the page's central claim true
in the artifact, not just in the prose.

### W2. Cross-aggregate invariants are asserted but structurally unenforceable and untested. — CLOSED (2026-07-19)
`earned⇒issued⇒redeemable`, `recorded≠incremental`, and `WHS-exclusion-is-global` all span
aggregates. Vernon is explicit these must be **eventually consistent via domain events + a
separate transaction** (Red Book, *Use Eventual Consistency Outside the Boundary*), yet the
model listed them as invariants (doc 27 §6) with **no process manager / saga** to enforce or
test them. The transactional outbox existed and was tested (`[REPO outbox.py]`) but nothing
consumed it to close a multi-step invariant.
**The fix, now built:** the **Reconciliation Process** (`[REPO reconciliation.py]` +
`[REPO test_reconciliation.py]`) — a process manager that consumes lifecycle events and
proves Case B's `earned ⇒ exactly-one issued ∨ visible dead-letter` by replay, under
dual-write vs the transactional outbox over the same seeded fault world, AND over the real
replay-job fan-out rows (read-only). The reward *application* stays `[HYPOTHESIS]`; the
mechanism and the proof are `[REPO]`. This is exactly the "make the already-shipped outbox
do domain work" bonus: `GET /reconciliation` reads the rows the engine actually wrote.
WHS-exclusion-is-global remains `[HYPOTHESIS]` — one invariant proven, not all three claimed.

### W3. Polysemic terms are primitives, not whole-values — the silent root cause. — CLOSED (2026-07-19)
*conversion* is an `int`, *reward* a `str`, *impression* nonexistent, so a cross-context
assignment is a silent copy that type-checks. This is the Whole Value / Quantity anti-pattern
(Cunningham CHECKS; Evans Value Object) and it is *why* every ACL in §1 can be skipped with
zero compiler complaint. `Decision` proves the team can build proper frozen whole-values
(`[REPO evaluator.py:26-39]`) — the discipline just stops at the aggregate boundary.
**The fix, now built:** all three whole-values exist in running code with the owning
context stamped in the type — `ConversionKind` (`[REPO translation.py]`), `RewardStatus`
incl. REDEEMABLE-named-not-proven (`[REPO reconciliation.py]`), and `ImpressionFidelity`
(`[REPO impressions.py]`). The implicit conformist IS a runtime error at the seam:
`ConversionEvent.__add__` raises `UnitMismatchError` on a cross-kind addition, and
`POST /impression-audit` *performs* the illegal addition live and reports the caught error
(`[REPO test_wholevalues.py]`). Case C ships as its honest self: a refuse-to-conform ACL
over a labelled synthetic corpus (counts only, no rate claimed), drawn as Fig. 03d. W1's
fix and W3's fix are the same lever pulled at two altitudes.

---

## 5. Honesty ledger for this document

- **VERIFIED-PUBLIC:** conversion dedup keys (`conversiontype:confirmationref`,
  `[REPO conversions.py:18]` mirrors the Rokt Event API); the incrementality/WHS thesis and
  "all future opportunities" exclusion (`26` #1); Shopper Rewards/GWP (`26` #4);
  agent-checkout framing (`26` #2/#3); the transactional outbox pattern (standard) and the
  Vernon/Evans/Cunningham/Fowler pattern definitions (cited, re-verified 2026-07-19).
- **`[REPO]`:** the single-context evaluator, diff, counterfactual constraint, verdict,
  ope, contexts rollup, and the tested transactional outbox with `VERDICT_ISSUED` fan-out
  to billing/analytics/partner; the Translation Map (`translation.py`, `/translation-audit`),
  the Reconciliation Process (`reconciliation.py`, `/reconciliation-audit`,
  `/reconciliation`), and the whole-value slice (`impressions.py`, `UnitMismatchError`
  algebra, `/impression-audit`) with their test suites.
- **`[INFERENCE]`/`[HYPOTHESIS]` (mine, not Rokt's):** the seven bounded-context names; every
  context-map pattern assignment; the four integration cases as *modelling claims*; the
  `translation.py` module and its synthetic baseline; the reward/WHS/impression extensions.
- **Explicitly NOT claimed:** that Rokt's real architecture looks like this; that Rokt lacks
  any capability here; any performance or lift number not published by Rokt or *computed live
  from a labelled synthetic corpus* in this repo.

## Sources
- Evans, *Domain-Driven Design* (2003) — Anticorruption Layer, Conformist, Published
  Language, Shared Kernel, Partnership, Value Object/Quantity (ch. 14, Part II).
- Vernon, *Implementing Domain-Driven Design* (2013); *Effective Aggregate Design* I–III
  (dddcommunity.org) — Reference by Identity; Use Eventual Consistency Outside the Boundary;
  Design Small Aggregates; process managers (ch. 12). Rules excerpt re-verified via
  informit.com, 2026-07-19.
- Cunningham, *The CHECKS Pattern Language of Information Integrity* — Whole Value.
- Fowler, "BoundedContext" — https://martinfowler.com/bliki/BoundedContext.html
  (polysemy; "mechanisms to map between these polysemic concepts"), retrieved 2026-07-19.
- Rokt facts: `research/rokt/{02,09,20,25,26}`; `docs/TRANSACTION_INVARIANTS.md`,
  `docs/PRODUCT_THESIS.md`. Engine: `backend/app/domain/*`, `backend/app/outbox.py`,
  `backend/app/routers/conversions.py`.
```