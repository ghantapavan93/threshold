# Threshold — The Operator Workflow & Where It Fits

> **One line:** Rokt's operations team approves a policy change and a holdout measures it. **Threshold proves, before that change enters the approval queue, that it fails closed, preserves checkout, and doesn't silently widen eligibility** — so a reviewer (and a holdout) never spend time on a change that a deterministic check could have caught.

Independent prototype inspired by Rokt's **public** workflow. No affiliation, no live integrations. Every claim maps to a test/endpoint here or a verified doc in `research/rokt/20_CHANGE_MANAGEMENT_DEEPDIVE.md`.

## Rokt's own change loop (from Rokt's docs — VERIFIED)

```
1 Edit        → operator edits a campaign / audience / eligibility rule in One Platform
2 Submit      → "Save and Edit" → "placed in the queue for MANUAL APPROVAL by the Rokt operations team"
3 Review      → "Every upsell, creative, campaign, and audience ... checked for compliance ...
                 by a member of the Rokt team before it is approved and eligible to be shown"
                 (creatives cycle pending ⇄ disapproved; material changes RE-TRIGGER approval)
4 Live        → approved → eligible to be shown (Active / Paused)
5 Measure     → Page Holdout (recommended 5% control) measures incrementality
```

That loop is excellent at **reviewing and measuring** a change. Threshold does not rebuild any of it — no approval console, no reviewer, no holdout engine, no Brain.

## The seam — between submit (2) and review (3)/holdout (5)

```
2 Submit  →  change enters the manual approval queue
                      │
                      │  ← nothing here PROVES, before a human looks, that the change
                      │     fails closed, preserves checkout, and hasn't silently
                      │     widened eligibility via a missing-attribute operator flip.
                      ▼
3 Review  →  a Rokt operator reviews for policy compliance
5 Measure →  a 5% holdout measures impact
```

Between **submit** and **review/holdout** there is a silent, load-bearing assumption: *that the proposed change is structurally safe to even put in front of a reviewer or a holdout.* A rule-operator change from `include_is_not_in` to `exclude_is_in` **looks cosmetic in a diff** but — per Rokt's own audience docs — flips every **missing-attribute** session from EXCLUDED to ELIGIBLE. That is invisible in a visual diff and easy for a reviewer to miss. **That seam is Threshold.**

## The single best argument
A manual approval queue is a scarce, expensive resource, and a holdout costs real traffic and time. Threshold is a **deterministic pre-flight** that (a) blocks a change that would silently widen eligibility or fail open, and (b) flags a change that will **re-enter** approval (`requires_reapproval`) or that touches an **immutable** field (`immutable_field_guard`) — *before* it consumes reviewer time or holdout traffic. It doesn't judge relevance or uplift; it proves structural safety and hands the reviewer a clean, evidenced verdict.

## What is genuinely Threshold's (no overlap with the loop)

| Capability | What it does | Evidence |
|---|---|---|
| **Missing-attribute isolation** | Catches the `include_is_not_in → exclude_is_in` flip via a counterfactual; flags only sessions the flip is *necessary* for | `constraints.py`, `test_domain::test_only_missing_attribute_sessions_flagged` |
| **Fail-closed proof** | Proves timeout/invalid/stale-identity → No Offer Rendered, checkout untouched | `failclosed.py`, `test_failclosed_always_no_offer` |
| **Event-time replay** | Replays the change over event-time snapshots; decision diff, not a chart | `replay.py`, `sessions.py` |
| **Re-approval / immutable guards** | Flags material-term change (re-enters approval) and immutable-field edits | `constraints.py` (grounded in doc 20) |
| **Holdout-eligibility verdict** | BLOCKED / INSUFFICIENT_EVIDENCE / ELIGIBLE_FOR_HOLDOUT — never "safe to launch" | `verdict.py` |
| **Tamper-evident evidence** | Append-only HMAC audit a reviewer can verify | `audit.py` |

## The one distinction to never blur
Rokt's **operations team already reviews** every change for policy compliance. So do **not** pitch Threshold as "we review policy and they don't." The honest, defensible line:
- **Rokt's review is a human compliance gate** at submission time (brand safety, disclaimers, sensitive categories).
- **Threshold is a deterministic structural pre-flight** that runs *before* submission — it proves fail-closed behavior, isolates missing-attribute widening, and predicts which changes will re-enter approval. Same goal (safe changes), different stage and different method: *human compliance review vs deterministic structural proof.* Blur it and the distinction collapses.

## Tie it to Rokt's own docs
- Rokt: *"Include (is not in)"* vs *"Exclude (is in)"* differ **only on missing values** → Threshold's centerpiece catches exactly this (21 sessions widened in the seed scenario).
- Rokt: *"Material changes to a campaign's privacy policy, disclaimers, or terms and conditions trigger the approval process"* → Threshold's `requires_reapproval` predicts it.
- Rokt: objective/country/language/timezone *"you need to create a new campaign"* → Threshold's `immutable_field_guard` blocks the illegal edit.

## Operator state machine (Threshold's slice)

```
DRAFT ──propose──▶ PRE-FLIGHT ──run replay──▶ ┌ BLOCKED ─────────▶ (fix; re-run)
                                              ├ INSUFFICIENT_EVIDENCE ▶ (add sessions / review warnings)
                                              └ ELIGIBLE_FOR_HOLDOUT ─▶ enter Rokt approval queue → 5% holdout → live
```
Threshold owns only the PRE-FLIGHT → verdict slice. It hands off to Rokt's real approval queue and holdout — it never claims to launch.

## Honest boundary (what Threshold is NOT)
- Not Rokt's approval console, not a reviewer, not the holdout engine, not Rokt Brain.
- Not a live integration — the policy-as-code publish surface is modeled; the mapping from "campaign/audience change" to "policy change" is a reasonable inference (see doc 20), not a verbatim Rokt product.
- Not an uplift/experimentation tool — the only positive verdict is *eligibility* for a holdout.
- Synthetic sessions demonstrate mechanism, not efficacy.

## The pitch, in three sentences
1. Rokt's operators review every policy change and a holdout measures it — but a rule-operator flip that silently widens a missing-attribute audience is invisible in a diff and easy to wave through.
2. Threshold is a deterministic pre-flight that proves a change fails closed, preserves checkout, and isolates exactly which sessions it silently widens — before it ever reaches a reviewer or a holdout.
3. It complements Rokt's approval loop and experimentation rather than competing with them: it makes the change that arrives at review provably safe to look at.
