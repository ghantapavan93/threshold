# 2-Minute Walkthrough Script

For a screen recording of the live console (`localhost:3000`). Calm, confident, no hype. Timestamps are a guide.

---

**[0:00–0:15] What I noticed**
> "While reading Rokt's public audience docs, one line stuck with me: 'Include (is not in)' and 'Exclude (is in)' behave differently **only when a value is missing**. So a one-character operator change on a targeting rule looks cosmetic in a diff — but it can silently make every session with a missing attribute eligible for an offer. I built Threshold to catch exactly that, before a change ships."

*[On screen: the Hero — "Prove a checkout-policy change is safe before a single customer sees it." Click **Play the story**.]*

**[0:15–0:40] The change**
> "An operator proposes a policy change — V17 to V18. Lower the age gate, raise the frequency cap, and flip one rule's operator. Threshold replays it across 200 event-time sessions."

*[The Policy Diff shows the three changes; the r4 operator flip is tagged "missing-attribute risk."]*

**[0:40–1:05] The catch**
> "Here's the moment. The constraint heatmap lights up: the missing-attribute tile **fails**. It replayed the change and found that flip silently widened 21 sessions with a missing card BIN from excluded to eligible — and it isolated *exactly* those 21 with a counterfactual, not the ones the age change touched. The exact Rokt doc it violates is cited right on the tile."

*[The crimson missing-attribute tile pulses; the decision-diff timeline shows the violation marks.]*

**[1:05–1:25] Fail-closed + verdict**
> "It also proves safety under failure: inject a timeout and the decision resolves to 'No Offer Rendered' while the checkout timeline stays green — the offer path can never block checkout. Verdict: **BLOCKED** — never 'safe to launch.'"

*[Fail-closed lane drops to No Offer Rendered; checkout stays green. Scroll to the crimson BLOCKED verdict.]*

**[1:25–1:45] The fix**
> "Now watch the fix. Revert just the operator — keep the intended age change. Re-run. Every check passes, and the verdict is **eligible for a controlled 5% holdout** — Threshold hands off to Rokt's real approval queue and holdout; it never claims to launch."

*[Click **Now watch the fix →**; land on the teal ELIGIBLE FOR HOLDOUT card with the 5% config.]*

**[1:45–2:00] What I'd validate**
> "It's deterministic — no AI in the critical path — with a full test suite and a tamper-evident audit you can verify. It's a hypothesis, not a claim about Rokt's internals. I'd love ten minutes with an engineer to hear where it's wrong."

*[End on the tamper-evident audit / Verify integrity, or the /vision keynote title.]*

---

**Delivery notes:** let the UI do the talking; pause on the crimson FAIL tile and the verdict flip. Never say "gap" or "guaranteed." One idea per breath.
