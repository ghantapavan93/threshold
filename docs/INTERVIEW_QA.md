# Staff-Engineer Q&A (honest answers)

Prep for the hardest questions. The goal is not to sound impressive — it is to be defensible and candid.

**Q1. "Isn't this just a re-skin of Rokt Brain / a constrained recommender + an audit log?"**
No. The decision engine is deliberately *boring and deterministic* — it doesn't select offers or rank anything. The product is the **change-safety layer**: diff a proposed policy, replay it over event-time sessions, prove it fails closed and doesn't silently widen eligibility, and gate it to a holdout. Brain decides *which* offer; Threshold proves a *policy change* is safe to even test.

**Q2. "Why no ML / OPE (SNIPS, doubly-robust)?"**
Two reasons. First, honesty: OPE needs logged action propensities, and there's no public evidence Rokt exposes those — I won't fake counterfactual validity on synthetic data. Second, correctness: a *release-safety* verdict shouldn't estimate lift at all; the online holdout is the causal mechanism. I designed the interface so an OPE pre-screen (that can return `INSUFFICIENT_EVIDENCE` and *refuse* on thin support) could slot in later, but it never replaces the mandatory holdout.

**Q3. "How do you catch the missing-attribute bug without false positives?"**
Counterfactual isolation. When a rule's operator changes `include_is_not_in → exclude_is_in` (the two differ *only* on missing values, per Rokt's own audience docs), I revert **just that operator** and re-evaluate. A session is flagged only if (a) its attribute is missing, (b) it's `no_offer` under base and `offer` under proposed, and (c) reverting the operator makes the proposed offer disappear. So it flags exactly the sessions the flip is *necessary* for — not ones widened by the age change. *(constraints.py)*

**Q4. "Why HMAC and not a hash chain / blockchain?"**
A local hash chain stored next to the data doesn't survive its own threat model — whoever can edit a record can recompute the chain. A per-record HMAC keyed by a secret the DB actor lacks gives real tamper-*evidence* against a non-privileged tamperer. I call it "tamper-evident," never "tamper-proof," and I document that a key-holder can forge and that it doesn't prove semantic truth. *(THREAT_MODEL.md)*

**Q5. "Exactly-once? Really?"**
No — I say **effectively-once state over at-least-once delivery**. Conversions dedupe on `conversiontype:confirmationref` (verified Rokt keys) via a unique DB constraint; a duplicate delivery updates state exactly once and returns the same id. That's an idempotent effectively-once *state transition*, not exactly-once network delivery.

**Q6. "Your replay runs in one transaction. What happens at 10,000 sessions?"**
The MVP is synchronous (fine for a few hundred). At scale I'd move to an async worker pulling jobs via a transactional outbox, batch evaluations, and only write the verdict once all batches commit. The pure evaluator is embarrassingly parallel because it's side-effect-free. The invariants (idempotent job, atomic verdict) hold either way.

**Q7. "Synthetic data proves nothing."**
Correct for *impact*. It proves *logic*: rules evaluate correctly, timeouts resolve to No Offer Rendered, the missing-attribute flip widens eligibility. Real-world impact needs the online holdout, which is why the best verdict is `ELIGIBLE_FOR_HOLDOUT`. I state this in the UI, the verdict copy, and LIMITATIONS.

**Q8. "How is this different from Integration Monitor / experiments / feature flags?"**
Integration Monitor validates *live* integration health post-hoc; experiments measure performance; feature flags toggle rollout. Threshold validates a *proposed policy change pre-release* for *safety* (checkout preservation, missing-attribute widening, consent reference) and outputs holdout-eligibility. Different moment, different question.

**Q9. "Where could this harm checkout?"**
It can't, by construction: Threshold is offline/pre-release and never sits in the live serving path. The property it *proves* is that the real placement path fails closed; it doesn't add a dependency to checkout.

**Q10. "What would you change with internal data access?"**
Replay against real (anonymized) event-time logs instead of synthetic; wire the actual policy schema from One Platform; confirm the real change-management workflow and approval owners; add the OPE pre-screen with logged propensities; and add live latency/drift monitoring. I'd also want to confirm which of these safety checks already exist internally so Threshold complements rather than duplicates.

**Q11. "What's the smallest honest version?"**
Base V17 → proposed V18, one replay, the missing-attribute FAIL, one fail-closed proof, the BLOCKED verdict, and the append-only audit. Everything else (compare-to-V18-safe, conversion dedup, the self-driving demo) is layered on that spine.

**Q12. "What are you least sure about?"**
The primary-user/workflow premise — whether a standalone pre-release gate is something a Rokt engineer actually wants versus code-review + CI + existing tooling. I've gathered partial public evidence but treat it as a hypothesis, not a fact.
