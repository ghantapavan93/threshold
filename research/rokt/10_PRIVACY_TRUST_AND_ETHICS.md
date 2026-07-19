# 10 — Privacy, Trust, Ethics & Brand-Safety Guardrails

**Agent:** 10 — Privacy, Trust, Ethics & Brand-Safety Researcher
**Mission:** Establish the privacy/trust guardrails any Rokt-adjacent product MUST respect, define the red lines that disqualify a concept, and identify where TRUST itself can be a product advantage.
**Retrieval date:** 2026-07-18
**Grounding:** Public sources only (Rokt Trust Center, docs.rokt.com, rokt.com policies/DPAs, mParticle governance pages, FTC, and authoritative privacy/clean-room references).
**Evidence labels:** [VERIFIED-PUBLIC] = directly stated in a cited public source; [INFERENCE] = reasoned from cited facts; [HYPOTHESIS] = forward-looking product idea not asserted by any source.

---

## 0. Why this matters (framing)

Rokt's own positioning is that it is "The Most Trusted Partner in Ecommerce Technology" [VERIFIED-PUBLIC — go.rokt.com/most-trusted]. Trust is not a compliance tax on the Rokt model — it is the load-bearing wall. Rokt inserts commerce media into the **transaction moment** (post-purchase, checkout confirmation) on behalf of partners who are lending their most valuable, highest-intent surface. If that trust breaks — via a privacy incident, a deceptive offer, or a degraded checkout — the partner's core business (their own conversion) is damaged, and Rokt loses the placement. Therefore any Rokt-adjacent product inherits a trust model where **the partner's customer experience and the consumer's agency outrank short-term monetization**.

---

## 1. HARD GUARDRAILS (a legitimate Rokt-adjacent product MUST honor)

Each guardrail cites the public basis it is grounded in.

### G1 — Customer (partner) agency & data ownership
- Rokt states clients "maintain 100% ownership and control of their data, a legally binding guarantee"; "Partners control how experiences show up, and they keep ownership of their first-party data." [VERIFIED-PUBLIC — rokt.com blog / most-trusted]
- In the US Advertiser DPA, the Advertiser is the **"Business"** and Rokt is a **"Service Provider"**; Rokt processes data "strictly in accordance with the documented instructions of the Advertiser." [VERIFIED-PUBLIC — rokt.com US DPA §1, §4.1]
- **Guardrail:** A Rokt-adjacent product must treat partner/advertiser first-party data as owned by the partner. The product is a processor/service provider acting on documented instructions — never a self-directed data controller repurposing that data. Data ownership and control must be contractually guaranteed and technically enforced.

### G2 — Purpose limitation (no repurposing, no cross-combination)
- Rokt "shall not… retain, use, or disclose Advertiser Personal Data for any purpose other than the Permitted Purpose" and cannot "combine Advertiser Personal Data with personal data that it receives from other sources." [VERIFIED-PUBLIC — rokt.com US DPA §4.1]
- "Rokt acts as a trusted intermediary and never sells or repurpose[s] data. Client data is never shared, sold, or used." [VERIFIED-PUBLIC — rokt.com blog]
- **Guardrail:** Data collected for one partner/purpose must not silently power another. No covert enrichment by joining a partner's data against other clients' data.

### G3 — No sale / no cross-context behavioral advertising of partner data
- "Rokt shall not: (i) sell or share for purposes of cross-context behavioral advertising any Advertiser Personal Data for monetary or other consideration." [VERIFIED-PUBLIC — rokt.com US DPA §4.1]
- **Guardrail:** The product must not monetize partner PII by selling/sharing it for cross-context behavioral advertising. Any consumer "Do Not Sell or Share" signal must be honored end-to-end. [VERIFIED-PUBLIC — rokt.com privacy policy]

### G4 — Client separation / multi-tenant isolation
- "Clients' data is logically and physically separated in distinct AWS clusters, with data at-rest encrypted using 256-bit AES." [VERIFIED-PUBLIC — Rokt security summary via Trust Center materials]
- Web SDK: Rokt pushes functionality into "sandboxed cross-origin iframes" and relies on same-origin policy so "the partner's code cannot interact with Rokt iframed content and vice versa." [VERIFIED-PUBLIC — docs.rokt.com Web SDK security]
- **Guardrail:** Strict tenant isolation (logical + physical). One partner must never be able to reach another's data; the embed must not read the host page's DOM/PII, and the host must not reach into the embed.

### G5 — Encryption in transit and at rest
- TLS encrypts data in transit; certificate pinning prevents interception; data at rest uses 256-bit AES. [VERIFIED-PUBLIC — Rokt security materials]
- Assets served over `https`; "the SSL protocol guarantees that the files originate from our internal services." [VERIFIED-PUBLIC — docs.rokt.com Web SDK security]
- **Guardrail:** Encrypt everywhere (TLS in transit, AES-256 at rest), integrity-verify delivered code, and never transmit PII over unencrypted channels or in URLs/query strings.

### G6 — Consent, legal basis & granular opt-out enforcement
- Rokt's basis is "legitimate interest and consent"; "separate consent may be required by law… (for example… cookies or other tracking technology)." [VERIFIED-PUBLIC — rokt.com privacy policy]
- SDK flags: `noFunctional` disables device/browser identifiers and writes no cookies/storage; `noTargeting` disables cross-site targeting/personalization. [VERIFIED-PUBLIC — docs.rokt.com Web SDK security]
- mParticle provides consent management, "real-time consent state propagation," data masking, filters, and forwards Data Subject Requests (DSRs) downstream. [VERIFIED-PUBLIC — mparticle.com / rokt.com data-governance]
- **Guardrail:** Consent state must be captured, propagated in real time, and technically enforced (suppress identifiers/targeting when withheld). Opt-outs must flow downstream automatically. Consent must be specific, informed, and revocable — never bundled or assumed.

### G7 — Consumer rights & transparency (GDPR / CCPA / CPRA / APPI)
- Rokt is subject to GDPR, CCPA, CPRA, and Japan's APPI, and (as of 2026-07-13) certifies under the EU-U.S., UK, and Swiss-U.S. Data Privacy Frameworks. [VERIFIED-PUBLIC — docs.rokt.com Trust Center]
- Consumer rights supported: access, rectification, deletion, restriction, objection, and opt-out of profiling/automated decision-making; responses "not later than one month." [VERIFIED-PUBLIC — rokt.com privacy policy]
- **Guardrail:** Provide accessible access/deletion/objection mechanisms, honor DSRs within statutory windows, and disclose profiling/automated decisioning with an opt-out.

### G8 — PII minimization & de-identification
- Where no ongoing legitimate need exists, Rokt "will take all reasonable steps to destroy the information and/or ensure that the information is de-identified or anonymized." [VERIFIED-PUBLIC — rokt.com privacy policy]
- Note the SDK caveat: browser-identifier opt-outs "apply only to browser-based identifiers. Other identifiers—such as email addresses or phone numbers—may still be provided." [VERIFIED-PUBLIC — docs.rokt.com Web SDK security] — i.e., direct-identifier PII needs its own governance, not just cookie flags.
- **Guardrail:** Collect the minimum PII necessary, govern direct identifiers (email/phone) separately from cookie controls, and de-identify/delete when the purpose ends.

### G9 — Third-party / subprocessor governance
- Subprocessors act "in accordance with our written instructions under a duty of confidentiality" and must implement "appropriate technical and administrative measures." [VERIFIED-PUBLIC — docs.rokt.com Trust Center]
- Advertisers get notice of subprocessor changes and "a reasonable opportunity to object." [VERIFIED-PUBLIC — rokt.com US DPA §4.3]
- **Guardrail:** Flow all obligations down to vendors; give partners visibility and objection rights over new subprocessors.

### G10 — Protect checkout / core transaction completion
- Rokt's stated objective: "ensure that each and every Customer receives the most relevant ecommerce experience for any transaction moment powered by Rokt," using quality-score thresholds, "removing low relevance offers," and suppression rather than saturation. [VERIFIED-PUBLIC — docs.rokt.com protecting-the-customer-experience]
- Frequency caps suppress repeat placements; "Smart Interactions" suppresses on low-interactivity moments to "maximize long term value." [VERIFIED-PUBLIC — docs.rokt.com controls]
- **Guardrail (the cardinal rule):** The product must never interfere with the partner's primary conversion. Placements are post-transaction/non-blocking, must not delay or divert checkout, and must degrade gracefully (fail closed to "show nothing") rather than break the page.

### G11 — Brand safety & partner content controls
- "Partners have full control over advertiser categories, brands, creatives, and campaign types, and can approve, block, or prioritize content while maintaining brand safety and compliance." [VERIFIED-PUBLIC — rokt.com solutions]
- Advertiser/vertical block rules and network controls set which advertisers are eligible. [VERIFIED-PUBLIC — docs.rokt.com controls]
- Restricted verticals (betting/casino, credit/loans, alcohol, sweepstakes, cashback) carry targeting, age-restriction, and disclosure requirements. [VERIFIED-PUBLIC — docs.rokt.com Rokt Ads policies]
- **Guardrail:** Partners must retain approve/block/prioritize control; sensitive verticals gate on age/targeting/disclosure; only one offer per sensitive category per auction. [VERIFIED-PUBLIC — docs.rokt.com protecting-the-customer-experience]

### G12 — Frequency management & suppression as user-respect
- Frequency caps (e.g., 72-hour suppression window) and layout/offer limits prevent over-exposure. [VERIFIED-PUBLIC — docs.rokt.com controls]
- **Guardrail:** Cap exposure per user/session; suppress in low-engagement states; treat consumer attention as finite and protected.

### G13 — Truthful, non-manipulative creative
- Rokt Ads policy bans "manipulative, shaming, or emotionally coercive language," unsubstantiated urgency/exclusivity ("Limited time offer" unless reflected on the landing page), fake conditional pricing, and unsupported health/financial/performance claims. Landing-page claims must match the ad. [VERIFIED-PUBLIC — docs.rokt.com Rokt Ads policies]
- Enforcement: minimum Quality Score cutoff, bounce-rate pausing, and campaign pause at 2% unsubscribe rate (min 2,500 sends). [VERIFIED-PUBLIC — docs.rokt.com Rokt Ads policies]
- **Guardrail:** Creative must be accurate, substantiated, and non-coercive; claims must match the destination; enforce with automated quality gates.

### G14 — Long-term-trust optimization over short-term yield
- "Smart Interactions… attempts to maximize long term value by not showing content on low interactivity placements." [VERIFIED-PUBLIC — docs.rokt.com controls]
- Rokt returns "$7 of every $8 of value generated to partners, with clear and transparent terms." [VERIFIED-PUBLIC — rokt.com blog]
- **Guardrail:** Optimize for lifetime/relationship value and transparent economics, not per-impression extraction.

### G15 — Accessibility (WCAG) — REQUIRED, but a documented gap to close
- Rokt Ads and customer-experience policy documents reviewed **do not explicitly cite WCAG or accessibility standards** [VERIFIED-PUBLIC — docs.rokt.com Rokt Ads policies; protecting-the-customer-experience — absence of mention]. This is a **gap**, not a permission.
- **Guardrail:** Any consumer-facing embed MUST meet WCAG 2.1/2.2 AA (contrast, keyboard operability, screen-reader semantics, focus management, touch-target size, no focus traps). Embedded overlays are high-risk for accessibility failures and must be explicitly tested. [INFERENCE — industry baseline; [HYPOTHESIS] that formalizing this is a differentiator, see §3]

---

## 2. RED LINES (auto-reject any concept that does these)

A concept touching **any** item below is disqualified regardless of projected revenue. These are grounded in Rokt's own policies and in FTC/consumer-protection law.

| # | Red line | Why it's a red line |
|---|----------|---------------------|
| R1 | **Dark patterns** — pre-checked boxes, confusing/tricked consent, buried decline, "confirmshaming," roach-motel flows | FTC treats deceptive design as unfair/deceptive under Section 5; enforcement continues even post-*Click-to-Cancel* vacatur [VERIFIED-PUBLIC — FTC; 8th Cir. 2025]. Rokt bans coercive/shaming language [VERIFIED-PUBLIC — docs.rokt.com] |
| R2 | **Fake pricing / false urgency / phantom scarcity** — countdown timers, "limited time," conditional prices not disclosed | Rokt rejects unsubstantiated urgency and unclear conditional pricing [VERIFIED-PUBLIC — docs.rokt.com Rokt Ads policies] |
| R3 | **Misleading cancellation / hard-to-cancel subscriptions / negative options** without easy, symmetric opt-out | FTC negative-option principles: cancel must be as easy as sign-up; misrepresentation prohibited [VERIFIED-PUBLIC — FTC Negative Option / Click-to-Cancel] |
| R4 | **Forced or bundled consent** — service conditioned on accepting non-essential tracking; no real "no" | GDPR requires freely-given, specific, informed, revocable consent; Rokt SDK is built to honor withheld consent [VERIFIED-PUBLIC — rokt.com privacy; docs.rokt.com] |
| R5 | **Surveillance / covert tracking / cross-context profiling of partner data** | Violates Rokt's "never sell/repurpose," no-combination, and no-cross-context-advertising commitments [VERIFIED-PUBLIC — rokt.com US DPA; blog] |
| R6 | **Selling/sharing PII** or ignoring "Do Not Sell or Share" | Prohibited by DPA and CCPA/CPRA opt-out [VERIFIED-PUBLIC — rokt.com US DPA; privacy policy] |
| R7 | **Interfering with checkout/transaction completion** — blocking, delaying, or diverting the primary purchase | Contradicts Rokt's core customer-experience objective [VERIFIED-PUBLIC — docs.rokt.com] |
| R8 | **Impersonating the partner's own brand / add-to-purchase deception** implying the offer is tied to their purchase without partner consent | Explicitly banned [VERIFIED-PUBLIC — docs.rokt.com Rokt Ads policies] |
| R9 | **Implying knowledge of protected attributes** ("Hello parent," "Welcome, student") | Explicitly banned [VERIFIED-PUBLIC — docs.rokt.com Rokt Ads policies] |
| R10 | **Cross-tenant data leakage** — any design where one client can see/benefit from another's raw data | Violates logical/physical separation and no-combination rules [VERIFIED-PUBLIC — Rokt security; US DPA] |
| R11 | **Sensitive-vertical violations** — betting/credit/alcohol/etc. without age-gating, targeting limits, disclosures | Restricted-vertical rules [VERIFIED-PUBLIC — docs.rokt.com Rokt Ads policies] |
| R12 | **Inaccessible experiences** — overlays that fail keyboard/screen-reader/contrast requirements | Consumer-protection + WCAG baseline [INFERENCE] |
| R13 | **Raw PII sharing between parties** in any "collaboration" feature | Clean-room norm: user-level records never cross the boundary; only aggregated privacy-enforced outputs [VERIFIED-PUBLIC — IAB Tech Lab / clean-room references] |

---

## 3. TRUST AS A PRODUCT ADVANTAGE (opportunities — all [HYPOTHESIS])

Where regulation forces everyone to do the minimum, making trust **visible, controllable, and verifiable** can be a wedge. All items below are hypotheses, not asserted by any cited source.

1. **Consumer-visible consent & "why am I seeing this?" panel** [HYPOTHESIS] — an inline, one-tap disclosure on every placement showing what data (if any) informed it and a live toggle to opt out of personalization. Turns G6/G7 obligations into a visible trust signal that lifts engagement quality rather than hiding controls.

2. **Partner "trust console" / control transparency dashboard** [HYPOTHESIS] — surface the block/approve/prioritize controls (G11), frequency caps (G12), suppression logic, subprocessor list (G9), and data-flow lineage in one auditable UI. Rokt already has the controls; making them legible and self-serve is a differentiator versus black-box networks. Builds on mParticle's "Observability… trace all your data flows end-to-end." [VERIFIED-PUBLIC basis; product framing HYPOTHESIS]

3. **Verifiable data-ownership guarantee** [HYPOTHESIS] — turn the "100% ownership, legally binding" claim into a technical attestation (export logs, deletion receipts, "your data was never combined" proofs). Trust you can verify beats trust you're asked to assume.

4. **Privacy-safe activation without raw-data movement** [HYPOTHESIS] — lean into the federated-learning / trusted-intermediary posture ("no party shares raw first-party data") and clean-room-style PETs so partners collaborate on outcomes without exposing PII. Market it as "clean-room results without clean-room complexity" (mParticle already claims data ownership "without the cost or complexity of clean rooms" [VERIFIED-PUBLIC]).

5. **Real-time DSR / consent propagation as a feature, not a chore** [HYPOTHESIS] — expose the automated DSR-forwarding and consent-state propagation (G6) as a partner-facing compliance product: "opt-outs enforced across your whole stack in real time," with proof.

6. **Accessibility as a trust guarantee** [HYPOTHESIS] — because Rokt's public ad policies don't yet cite WCAG (G15 gap), a documented, tested "WCAG 2.2 AA certified placements" commitment would be both a genuine gap-closer and a marketable differentiator, especially for regulated/public-sector partners.

7. **Truthful-offer / anti-dark-pattern certification** [HYPOTHESIS] — productize the Quality-Score/accuracy/landing-page-match enforcement (G13) into a partner-facing "no dark patterns" guarantee, positioning Rokt as the safe alternative to yield-maximizing networks.

8. **Non-interference SLA for checkout** [HYPOTHESIS] — a measurable, contractual "we never reduce your primary conversion" guarantee (G10) with monitoring, converting the cardinal guardrail into a sales advantage.

---

## 4. Design test (apply to every Rokt-adjacent concept)

1. Does it protect the partner's primary conversion? (G10 / R7) — if no, reject.
2. Does the partner own and control their data, with no repurposing/combination? (G1–G3, R5–R6, R10) — if no, reject.
3. Is consent specific, informed, revocable, and enforced downstream? (G6–G7, R4) — if no, reject.
4. Is every claim accurate, non-coercive, and free of dark patterns/fake urgency? (G13, R1–R3) — if no, reject.
5. Is it isolated, encrypted, minimized, and accessible? (G4, G5, G8, G15) — if no, fix before ship.
6. Does it make trust more visible/controllable? (§3) — if yes, that's the wedge.

---

## Sources (retrieved 2026-07-18)

**Rokt primary**
- Trust Center — https://docs.rokt.com/trust-center/
- Privacy Policy & Notice at Collection — https://www.rokt.com/policies/privacy-policy
- US Data Processing Agreement (Advertisers) — https://www.rokt.com/policies/data-processing-agreement-advertisers-us
- Web SDK security — https://docs.rokt.com/developers/integration-guides/data-and-security/web-security/
- Rokt Ads Policies — https://docs.rokt.com/user-guides/rokt-policies/rokt-ads/
- Protecting the customer experience — https://docs.rokt.com/user-guides/rokt-policies/protecting-the-customer-experience/
- Controls overview — https://docs.rokt.com/user-guides/rokt-ecommerce/controls/overview/
- Advertiser & vertical block rules — https://docs.rokt.com/user-guides/rokt-ecommerce/controls/resources/advertiser-vertical-block-rules/
- "Most Trusted Partner in Ecommerce Technology" — https://www.go.rokt.com/most-trusted
- Rokt blog (data ownership / differentiation) — https://www.rokt.com/blog/what-features-differentiate-rokt-from-other-ecommerce-monetization-tools

**mParticle by Rokt**
- Rokt mParticle Data Governance — https://www.rokt.com/rokt-mparticle/products/data-governance
- mParticle Data Governance — https://www.mparticle.com/platform/data-governance/
- Rokt mParticle product — https://www.rokt.com/products/rokt-mparticle
- Rokt mParticle security — https://www.rokt.com/rokt-mparticle/security

**Regulatory / authoritative references**
- FTC "Click-to-Cancel" final rule (Oct 2024) — https://www.ftc.gov/news-events/news/press-releases/2024/10/federal-trade-commission-announces-final-click-cancel-rule-making-it-easier-consumers-end-recurring
- Federal Register — Negative Option Rule — https://www.federalregister.gov/documents/2024/11/15/2024-25534/negative-option-rule
- IAB Tech Lab — Data Clean Rooms Guidance — https://iabtechlab.com/datacleanrooms/
- Decentriq — What is a data clean room — https://www.decentriq.com/article/what-is-a-data-clean-room

---

## Freshness & Confidence

- **Freshness:** All sources retrieved 2026-07-18. Rokt's Data Privacy Framework certification note is dated 2026-07-13 (current). FTC Click-to-Cancel rule was vacated by the 8th Circuit (July 2025) on procedural grounds; **its principles remain enforceable under FTC Act §5** and the FTC reopened rulemaking in 2026 — treat the substance as live even though the specific rule is not in force. [VERIFIED-PUBLIC]
- **Confidence:**
  - HIGH — data ownership, purpose limitation, no-sale, client separation, encryption, consent flags, consumer rights, creative/brand-safety policies, frequency/suppression, checkout-protection intent (all directly quoted from Rokt/mParticle/FTC sources).
  - MEDIUM — specific encryption depth (AES-256/TLS/cert-pinning appear in Rokt security summaries but the Trust Center page itself lacked granular crypto detail; corroborated across search + docs).
  - GAP (flagged, not assumed) — **WCAG/accessibility is not explicitly cited in the Rokt Ads or customer-experience policy pages reviewed.** Treated as a required guardrail (G15) and a differentiation opportunity (§3.6), labeled [INFERENCE]/[HYPOTHESIS] accordingly.
  - All §3 opportunities are [HYPOTHESIS] — product ideas, not claims about existing Rokt features.
