# Outreach

Tone: humble, specific, evidence-first. Never "I found a gap in Rokt." Always "while studying Rokt's public product direction, I became interested in…" It's a product hypothesis, not a claim about Rokt's internal roadmap.

## The 30-second explanation
> Rokt's operators review every policy change and a holdout measures it — but a one-line rule-operator edit (`include_is_not_in` → `exclude_is_in`) *looks cosmetic in a diff* while, per Rokt's own audience docs, it silently makes every **missing-attribute** session eligible. I built **Threshold**: a deterministic pre-flight that replays a proposed policy change over event-time sessions, proves it **fails closed** and never silently widens eligibility, and clears it **only** for a controlled holdout — before it ever reaches a reviewer or a customer. No AI in the critical path.

## Outreach note (to a Rokt engineer / recruiter)

> Subject: A small pre-flight safety gate I built while reading your public docs
>
> Hi [name],
>
> While studying Rokt's public product direction — the Transaction Moment, the audience-targeting docs, the Page Holdout flow — I got interested in a narrow question: *before* a policy change reaches your operations review or a holdout, what proves it won't silently widen who gets an offer or affect checkout?
>
> One thing stuck with me: your own audience docs note that "Include (is not in)" and "Exclude (is in)" differ **only on missing values**. So a one-character operator change looks cosmetic in a diff but can quietly make every missing-attribute session eligible. That's exactly the kind of thing a deterministic pre-flight could catch.
>
> So I built **Threshold** — a small, deterministic policy-change safety gate. It replays a proposed change over event-time sessions, proves it fails closed to "no offer rendered," isolates exactly which sessions a rule flip silently widens (via a counterfactual), and returns a verdict that's only ever *eligible for a controlled holdout* — never "safe to launch." No AI in the hot path; every check is grounded in a public Rokt doc; there's a full test suite and a two-minute self-driving demo.
>
> **No one asked me to build this** — I built it because the problem genuinely interested me, and because it let me show how I think about safety at the Transaction Moment. It's a *hypothesis*, not a claim about what Rokt does or doesn't already have internally — I'm sure your teams have thought hard about this. I'd love **ten minutes** with an engineer to hear what I got right and (more usefully) wrong.
>
> Two-minute demo + architecture decisions are linked below. I'm interested in becoming a long-term Rokt Builder, not collecting a company name — so tear it apart.
>
> — Pavan

## What NOT to say
- "Rokt is missing / has a flaw / hasn't solved…" — never.
- "This will increase revenue by X" / "guaranteed" — never.
- "You need this." — never. It's *"here's how I'd approach it; correct me."*

## The three assets to attach
1. **2-minute walkthrough** — see `VIDEO_SCRIPT.md` (the self-driving demo: the trap → BLOCKED → the fix → ELIGIBLE).
2. **10-minute technical walkthrough** — see `TECHNICAL_WALKTHROUGH.md`.
3. **The repo** — README + the honest `LIMITATIONS.md` up front.
