# 05 — Partner & Advertiser Operations: Pain & Workflow-Around Opportunities

**Agent 5 — Partner & Advertiser Operations Researcher**
**Retrieval date:** 2026-07-18
**Scope:** What Rokt's partners and operators (ecommerce partners, advertisers, campaign teams, catalog suppliers/brands, payment providers, lifecycle marketers, data teams) must *do* around the platform, and where operational friction lives. Grounded in public docs + reputable industry sources.

**Framing note:** This document does NOT claim Rokt's tooling is deficient. Rokt's platform is highly automated (AI optimization, fast onboarding). The opportunities below live in the **workflow around** the automation — the manual judgment, cross-team handoffs, repetitive analysis, and governance work that operators still own. Each is framed as a governed, testable, human-in-the-loop "workflow-around" opportunity.

**Evidence labels:** [VERIFIED-PUBLIC] = stated in Rokt/mParticle public docs; [INDUSTRY-PROBLEM] = documented adtech/martech operational pain from reputable sources; [INFERENCE] = reasoned from public workflow evidence; [HYPOTHESIS] = proposed tooling opportunity, unproven.

---

## Operator roles referenced

| Role | What they own |
|---|---|
| **Advertiser / campaign operator** | Campaign setup, budget/caps, audiences, creatives, conversion attribution ("close the loop"), experiment interpretation |
| **Ecommerce partner (publisher)** | Layout/placement config, offer controls (category/brand blocking), SDK integration, close-the-loop cart alignment |
| **Catalog brand (supplier)** | Product feed onboarding, EDI test scenarios, inventory sync, order fulfillment, reconciliation |
| **Catalog partner (retailer/curator)** | Product selection, listing curation, order routing |
| **Data / lifecycle marketer** | Audience lists, suppression/seed data, mParticle data plans, governance, conversion-signal freshness |
| **Rokt ops (internal, referenced)** | Creative/offer approval, policy moderation — the counterparty to operator handoffs |

---

## PAIN 1 — Creative & offer approval is a manual, policy-dense, back-and-forth handoff

**Owner:** Advertiser / campaign operator (submits); Rokt ops team (reviews).

**Current public workflow [VERIFIED-PUBLIC]:**
- Every campaign and creative "need to be approved by the Rokt before going live... usually within 24 hours," then launches automatically.
- Submitted items "will be examined by Rokt's operations teams to determine if they comply with all Rokt's policies."
- The Rokt Ads Policies page enumerates a **dense, granular rule set** operators must self-comply with before submission, e.g.:
  - Titles need a minimum of three words; if exactly three words, "the title must not include the customer's first name."
  - Customer name referenced at most once; no "hard-coded text, such as 'Your order,' 'Your payment.'"
  - No all-caps (even "FREE"), no italic/bold emphasis, no "gimmicky or emoticon-style punctuation (e.g., ';-)', '<3')."
  - Prohibited: "Manipulative, shaming, or emotionally coercive language," references to other brands without licensing.
  - Vertical-specific: gambling/gaming needs "age restriction... in the creative copy" plus "Responsible gaming language and hotline information"; alcohol needs 21+/18+ age targeting; paid cashback needs a cost disclaimer; credit cards cannot use "advanced targeting features based on protected classes or proxies."

**Friction [INFERENCE]:** The rules are numerous, conditional, and vertical-specific. An operator drafting many creatives must mentally apply dozens of conditional rules; a single overlooked rule triggers a rejection, a ~24h re-review cycle, and a delayed launch. Public docs do not state a documented SLA for rejections or specific rejection-reason feedback loops, so iteration cost is uncertain but plausibly high for high-volume advertisers.

**Evidence strength:** Strong for the workflow and rule density (docs). Moderate for the cost of the rejection loop (inferred).

**Workflow-around opportunity [HYPOTHESIS]:** A governed, human-in-the-loop "pre-submission compliance linter" that checks a draft creative against the published Rokt Ads policy rules *before* submission — flagging the specific rule at risk (e.g., "title is 3 words and contains a first-name token") with the exact policy citation, and surfacing vertical-specific required disclaimers. It would not auto-approve (Rokt ops stays the decision-maker); it reduces avoidable rejection round-trips. Testable via rejection-rate before/after.

---

## PAIN 2 — Partner brand-safety / offer controls are an ongoing balancing act, not a one-time setup

**Owner:** Ecommerce partner (publisher) governance/monetization team.

**Current public workflow [VERIFIED-PUBLIC]:**
- Partners configure **Network Controls** (restrict advertisers "categorized according to their industry vertical and sub-vertical") and **brand domain blocking** ("identified by their website URL").
- The platform frames this explicitly as a tradeoff: partners must balance "maximizing the value of your layout and creating a competitive network, while also ensuring competitor offers do not show to customers on your site."
- Rokt categorizes each brand/campaign (content) and each partner/placement (source); "Sensitive Categories are blocked by default" and the platform limits "only one offer per sensitive category within a single auction."
- Docs describe this as "configuring the rules for what advertisers are allowed to show on a layout" — an **ongoing balancing act rather than a one-time setup.**

**Friction [INFERENCE + INDUSTRY-PROBLEM]:** Partners must manually decide, and periodically revisit, which verticals/sub-verticals/brand domains to allow or block — trading off revenue (more allowed offers) against brand safety and competitor exclusion. New advertisers and new brand domains continuously enter the network, so a static block list drifts stale. There is no public evidence of a recommendation layer that proposes block/allow changes based on the partner's own performance or complaint signals.

**Evidence strength:** Strong (docs explicitly call it a balancing act). Revenue-vs-safety tension is a well-documented [INDUSTRY-PROBLEM].

**Workflow-around opportunity [HYPOTHESIS]:** A governed advisor that periodically surfaces "controls hygiene" recommendations to the partner — e.g., new brand domains entering the network that match an existing block pattern, categories driving low engagement or customer complaints on their layout, or competitor domains not yet blocked — presented as reviewable suggestions the partner accepts/rejects. Human-in-the-loop; every change is partner-approved and logged. Testable via revenue-per-impression and complaint-rate deltas.

---

## PAIN 3 — Custom audience / suppression management is repetitive, format-fragile, and freshness-dependent

**Owner:** Data / lifecycle marketer; advertiser ops.

**Current public workflow [VERIFIED-PUBLIC]:**
- Seven import pathways (CSV UI, SFTP, Web SDK, LiveRamp, mParticle, Segment, Custom Audience API), each with distinct steps.
- Strict format rules: single column, no header, UTF-8, "Email addresses as plain text or SHA-256 hashed (lowercase, trimmed before hashing)," "Do not mix plain and hashed email addresses per file," max 200MB, inclusion audiences need ≥1,000 individuals.
- **Data-quality dependencies:** "Failed format validation results in automatic file rejection"; SFTP temp files with "." prefix "will not be processed until they are renamed"; email normalization required before hashing.
- **Freshness dependency:** conversion signals should be shared "with high frequency to ensure freshness"; LiveRamp adds latency ("Allow 2–4 days... approximately 24 hours for Rokt to ingest"); mParticle audiences available "in under 24 hours."
- SFTP setup itself is a handoff: "Request access from Account Manager," decrypt a `.pem` key, configure FileZilla, and place files in exact directory paths (`/upload/custom-audience/include/` or `/exclude/`).

**Friction [INFERENCE + INDUSTRY-PROBLEM]:** Recurring manual list preparation with fragile formatting and silent-ish failure modes (rejected files, unrenamed temp files) is classic ad-ops toil. Suppression/seed lists must be refreshed continuously to stay fresh, but there is no public evidence of automated staleness alerts on the *content* of a list (e.g., "your suppression list hasn't been refreshed in N days"). Industry sources note manual list reconciliation across tools is a recurring "coordination tax."

**Evidence strength:** Strong (docs enumerate exact format/freshness constraints). Toil cost is [INDUSTRY-PROBLEM]-supported.

**Workflow-around opportunity [HYPOTHESIS]:** A governed "audience prep + freshness" assistant that (a) pre-validates a list against Rokt's exact format rules and normalizes/hashes emails before upload, catching rejections client-side; and (b) tracks each audience's last-refresh date and flags suppression/seed lists that have gone stale relative to a configurable threshold. Human confirms every upload. Testable via file-rejection rate and suppression-freshness lag.

---

## PAIN 4 — Experiment interpretation requires statistical judgment and patience that invites error

**Owner:** Advertiser / campaign operator (and ecommerce partner running holdouts).

**Current public workflow [VERIFIED-PUBLIC]:**
- Run "until at least one variant has a 95% probability (or less than 5%) to beat the original baseline."
- "Waiting at least two weeks to receive data before drawing any conclusions"; results should not be called before the two-week minimum.
- Interpretation is visual/probabilistic: credible interval graph "starts out wide," narrows over time; operators look for "minimal or no overlap between the different lines (variants)."
- Docs explicitly ask for manual depth: "take time to analyze the results and learn about your customers. The deeper you dive into the results... the more you will be able to learn" — including watching secondary metrics for "unintended negative impacts."
- Holdout tests add a second experiment type with its own long-duration control group.

**Friction [INFERENCE + INDUSTRY-PROBLEM]:** Bayesian "probability to beat baseline" and credible-interval reading are easy to misinterpret — the classic adtech failure modes are peeking/calling early, ignoring overlap, and optimizing a primary metric while a secondary metric silently regresses. The docs explicitly warn against early calls and ask for manual secondary-metric analysis, i.e., the judgment burden is on the operator. Repetitive across every experiment.

**Evidence strength:** Strong (docs). Misinterpretation risk is a well-documented [INDUSTRY-PROBLEM].

**Workflow-around opportunity [HYPOTHESIS]:** A governed "experiment readout" companion that, given a running Rokt experiment, states plainly whether the 95%/two-week gates are met, flags premature-call attempts, checks the specified secondary metrics for regressions, and drafts a plain-language interpretation ("Variant B has 96% probability to beat baseline after 15 days; secondary metric X down 3% — investigate before rollout"). It advises; the human decides rollout. Testable against decision-quality / regretted-rollout rate.

---

## PAIN 5 — Catalog onboarding is an EDI-heavy, multi-system, multi-handoff project

**Owner:** Catalog brand (supplier) ops / IT; retailer/curator partner on the other side.

**Current public workflow [VERIFIED-PUBLIC]:**
- Marketing claim: onboardings "up to 6× faster than legacy platforms, with AI-driven ingestion and streamlined QA to eliminate manual work" — but the help docs reveal substantial residual manual/technical steps.
- In-app onboarding requires: brand info, **EDI credentials (ISA ID and ISA ID Qualifier)**, contact roles, "Partner commission" (typically 35–40%), shipping/fulfillment-time policy.
- Product import via either **CSV** ("Do not edit the CSV format when adding your products — this causes the upload to fail") **or EDI** (832 catalog + 846 inventory).
- **Pre-launch test scenarios are mandatory and span the full order lifecycle:** 846 (Inventory), 850 (PO), 860 (PO Change), 856 (ASN) all "[required]"; plus 855 acknowledgment and invoice; optional cancellation/rejection tests recommended.
- **Cross-system handoff:** onboarding sequentially moves to **Orderful** (a separate EDI platform); go-live requires toggling status to "Live" in "Orderful's Relationships page," importing products via 832, syncing inventory via 846, and setting "inventory frequency to daily."
- Platform-specific onboarding variants exist (Shopify brand vs. Shopify partner, WooCommerce, BigCommerce, API).

**Friction [INFERENCE + INDUSTRY-PROBLEM]:** Despite AI ingestion, a brand still must: obtain/enter EDI identifiers, pass a battery of EDI test transactions across two systems (Catalog + Orderful), maintain rigid CSV formatting, and coordinate go-live toggles across platforms. This is a classic B2B EDI onboarding project involving IT, ops, and finance — the kind of multi-week, multi-handoff work martech teams cite as slow and error-prone. Failure modes are silent (CSV format edits "cause the upload to fail").

**Evidence strength:** Strong (help docs enumerate the exact EDI test set and the Orderful handoff).

**Workflow-around opportunity [HYPOTHESIS]:** A governed onboarding "co-pilot / checklist runner" that walks a brand through the required EDI test scenarios (846/850/860/856/855/invoice), validates CSV feeds against Catalog's exact format before upload, tracks which scenarios have passed across both Catalog and Orderful, and flags the remaining go-live gates. It orchestrates and validates; humans execute each EDI/system action. Testable via time-to-live and test-scenario failure rate.

---

## PAIN 6 — Order fulfillment & invoice reconciliation is a 3-way-match dispute surface

**Owner:** Catalog brand (supplier) finance/ops; retailer AP on the counterparty side.

**Current public workflow [VERIFIED-PUBLIC / INDUSTRY-PROBLEM]:**
- Catalog's order cycle uses the standard retail EDI chain: 850 PO → 855 acknowledgment → 856 ASN → 810 invoice (test scenarios confirm 850/855/856 + invoice are required).
- Industry standard: the buyer's AP performs **3-way matching** (PO qty/price from 850, received qty from 856, billed qty/price from 810). "Invoicing for quantities that differ from what was confirmed received in the 856 is the most common cause of invoice disputes." Errors/chargebacks trigger an **EDI 812 adjustment** referencing the original invoice with a reason code.
- Commission (35–40%) and fulfillment-time commitments are set at onboarding, so payout reconciliation layers on top of the goods reconciliation.

**Friction [INFERENCE + INDUSTRY-PROBLEM]:** Any mismatch across 850/856/810 (short-ships, price deltas, timing) becomes a manual dispute with chargebacks and 812 adjustments — a well-documented, labor-intensive reconciliation surface in dropship/marketplace commerce. For a Catalog brand selling through many partners, reconciling orders, shipments, invoices, returns, chargebacks, and commission payouts is repetitive and error-prone. Public Rokt docs describe the transaction dashboard but not an automated discrepancy-detection layer.

**Evidence strength:** Moderate–strong. EDI chain is verified in Catalog docs; the *dispute/reconciliation pain* is [INDUSTRY-PROBLEM] mapped onto Rokt's confirmed transaction set (not Rokt-specific evidence of disputes).

**Workflow-around opportunity [HYPOTHESIS]:** A governed reconciliation assistant that ingests a brand's 850/856/810 (and 812) records, runs the 3-way match, and surfaces only the exceptions — quantity/price mismatches, missing ASNs, commission-payout deltas — as a prioritized worklist with the likely root cause. Finance approves each resolution. Testable via dispute rate and days-to-resolve.

---

## PAIN 7 — mParticle data governance is continuous, cross-functional, and high-stakes (blocking = data loss)

**Owner:** Data governance team, developers, marketers, privacy team (mParticle is now "mParticle by Rokt").

**Current public workflow [VERIFIED-PUBLIC]:**
- **Data Master / Data Plans** create "a shared understanding of how all customer data points are collected, named, and processed" via a "centralized data dictionary" and a "collaborative data plan."
- Plans are authored across roles: developers (QA feedback), product managers (collection control), marketers ("preventing bad data to partners"), privacy and governance teams. Authoring spans mParticle UI, a "Google Sheet-based Data Plan Builder," or a Data Planning API under source control.
- Runtime validation flags "Unplanned events/attributes," "Invalid attributes," and "Unplanned user attributes or identities"; violations reports update within "up to 5 minutes."
- **High-stakes governance:** "Enabling blocking will impact your data stream and can lead to data loss. Work closely with your mParticle representative"; and "You cannot replay blocked data through the UI" unless a Quarantine Connection to S3 was configured in advance.

**Friction [INFERENCE + INDUSTRY-PROBLEM]:** Data quality is a **continuous monitoring + triage burden** — teams must regularly review violation reports, decide whether each is an implementation bug or a plan gap, and coordinate fixes across engineering/marketing. Blocking is powerful but irreversible-by-default, so teams tread carefully. Gartner's 2025 survey (martech utilization at 49%) reflects the broader reality that governance tooling often outpaces teams' capacity to operate it.

**Evidence strength:** Strong (mParticle docs). Utilization gap is [INDUSTRY-PROBLEM].

**Workflow-around opportunity [HYPOTHESIS]:** A governed "data-quality triage" assistant over mParticle violation reports that clusters recurring violations, proposes a root-cause classification (implementation bug vs. plan-needs-update), drafts the data-plan diff or the developer ticket, and simulates the blast radius of a proposed blocking rule *before* it's enabled (guarding against the "cannot replay blocked data" trap). Humans approve every plan change and every block. Testable via violation-recurrence and mean-time-to-triage.

---

## PAIN 8 — Partner SDK integration & close-the-loop is a technical, verification-heavy handoff

**Owner:** Ecommerce partner engineering; advertiser engineering (for conversion attribution).

**Current public workflow [VERIFIED-PUBLIC]:**
- Web SDK+ init script "should be included on every page of your site."
- `selectPlacements` must be called "as early as possible, and once all required attributes are available," passing at minimum "email, firstname, lastname, billingzipcode and confirmationref."
- Interstitial placements need two coordinated pieces on the confirmation page: the `<rokt-thank-you>` wrapper and the `selectPlacements` call.
- Multiple event types logged via distinct methods (PLP impressions, cart views, site searches via dedicated methods; everything else via `logProductAction`).
- **Close-the-loop cart alignment:** "A message is sent back to the partner from the placement... to ensure both carts are aligned."
- Verification is manual: "open your browser's developer tools panel and go to the Network tab and type experiences into the filter bar to confirm the SDK+ initializes and events log correctly."
- Advertiser-side attribution ("close the loop") depends on the Web SDK capturing "email and order value, directly from the confirmation page."

**Friction [INFERENCE]:** Correct integration requires passing the right attributes, on the right pages, in the right order, and then manually verifying via network inspection. Missing/misformatted attributes silently degrade match rates and attribution quality — and attribution quality feeds the AI optimization, so integration errors have outsized downstream impact. This is a per-partner, per-platform engineering handoff with no public evidence of an automated integration-health monitor beyond manual devtools checks.

**Evidence strength:** Strong (integration docs). Downstream impact is [INFERENCE].

**Workflow-around opportunity [HYPOTHESIS]:** A governed "integration health" checker that validates, on a partner's staging/confirmation page, that `selectPlacements` fires with all required attributes present and well-formed, that the `<rokt-thank-you>` wrapper is wired correctly, and that close-the-loop cart messages round-trip — replacing manual devtools spot-checks with a repeatable, shareable report. Advisory; the partner's engineers fix issues. Testable via attribution match-rate and integration-defect escape rate.

---

## Cross-cutting themes

1. **Handoffs to Rokt ops and to external systems (Orderful, LiveRamp, EDI VANs) are the friction concentrators** — approval, EDI test scenarios, SFTP access, and data ingestion all involve waiting on a counterparty [VERIFIED-PUBLIC].
2. **Silent failure modes recur** — rejected audience files, unrenamed SFTP temp files, CSV-format-edit upload failures, blocked-and-unrecoverable data, missing SDK attributes. Client-side pre-validation is the common opportunity [VERIFIED-PUBLIC].
3. **Repetitive statistical/policy judgment is pushed to the operator** — experiment interpretation, creative policy compliance, controls balancing, data-violation triage. Governed advisory layers (never auto-decide) are the pattern [INFERENCE].
4. **Freshness is a standing obligation, not a one-time task** — conversion signals, suppression lists, inventory (daily), audiences all decay [VERIFIED-PUBLIC].

Every opportunity above is deliberately scoped as **human-in-the-loop and governed**: the tool validates, recommends, drafts, or flags; the operator (or Rokt ops) retains the decision. None require or assume that Rokt's existing automation is inadequate — they target the manual workflow *around* it.

---

## Sources (retrieved 2026-07-18)

**Rokt documentation**
- Rokt Ads overview — https://docs.rokt.com/user-guides/rokt-ads/overview/
- Create a campaign — https://docs.rokt.com/user-guides/rokt-ads/campaigns/how-to/creating/
- Quick start (self-service) — https://docs.rokt.com/user-guides/rokt-ads/self-service/user-guide/
- Import custom audiences — https://docs.rokt.com/user-guides/rokt-ads/audiences/how-to/import-custom-audiences/
- Controls overview (ecommerce) — https://docs.rokt.com/user-guides/rokt-ecommerce/controls/overview/
- Rokt Ads Policies — https://docs.rokt.com/user-guides/rokt-policies/rokt-ads/
- Rokt Policies overview — https://docs.rokt.com/user-guides/rokt-policies/overview/
- Protecting the customer experience — https://docs.rokt.com/user-guides/rokt-policies/protecting-the-customer-experience/
- Experiments — measuring success & analyzing results — https://docs.rokt.com/user-guides/rokt-ads/experiments/resources/measure-success-and-analyze-results-/
- Experiments overview (ecommerce) — https://docs.rokt.com/user-guides/rokt-ecommerce/experiments/overview/
- Build an experiment — https://docs.rokt.com/user-guides/rokt-ads/experiments/how-to/building-experiments/
- Create a holdout test — https://docs.rokt.com/user-guides/rokt-ecommerce/experiments/how-to/holdout-tests/
- Ecommerce Web SDK+ integration — https://docs.rokt.com/developers/integration-guides/getting-started/ecommerce/ecommerce-sdk-integration/
- Advertisers Web SDK integration — https://docs.rokt.com/developers/integration-guides/getting-started/advertisers/ads-sdk-integration/
- Layouts overview — https://docs.rokt.com/docs/user-guides/rokt-ecommerce/placements

**Rokt Catalog help (shopcanalhelp.zendesk.com)**
- Onboarding to Catalog — https://shopcanalhelp.zendesk.com/hc/en-us/articles/18447878906523
- Pre-Launch steps & Test Scenarios — https://shopcanalhelp.zendesk.com/hc/en-us/articles/18459809102619-Pre-Launch-steps-Test-Scenarios
- Setting up Catalog via API — https://shopcanalhelp.zendesk.com/hc/en-us/articles/15563989494683-Setting-up-Catalog-via-API
- Onboarding to Catalog as a Brand on Shopify — https://shopcanalhelp.zendesk.com/hc/en-us/articles/14451075986203-Onboarding-to-Catalog-as-a-Brand-on-Shopify

**Rokt product pages**
- Rokt Catalog for Brands — https://www.rokt.com/products/rokt-catalog-for-brands
- Unlocking the Transaction Moment for Ecommerce Partners — https://www.rokt.com/blog/unlocking-the-transaction-moment-tm-for-ecommerce-partners

**mParticle (by Rokt) docs & product**
- Data Plans / Data Planning — https://docs.mparticle.com/guides/platform-guide/data-planning/
- Audiences overview — https://docs.mparticle.com/guides/segmentation/audiences/overview/
- Data Master — https://www.mparticle.com/platform/detail/data-master/
- Data Governance — https://www.mparticle.com/platform/data-governance/
- Rokt Thanks and Pay+ (mParticle integration) — https://docs.mparticle.com/integrations/rokt/partners/

**Industry / EDI / adtech-martech operations**
- Umbrex — Adtech & Martech Industry Primer — https://umbrex.com/resources/industry-primers/media-entertainment-industry-primers/adtech-martech-industry-primer/
- Silverbullet — Blurring MarTech/AdTech 2025 — https://wearesilverbullet.com/datatalks/blurring-the-lines-between-martech-and-adtech-in-2025/
- AI Digital — AI Marketing Platform vs Martech Stack (Gartner 2025 utilization stat) — https://www.aidigital.com/blog/ai-marketing-platform-vs-traditional-martech-stack
- 3PLGuys — EDI 850/856/810 Explained — https://3plguys.com/articles/edi-850-856-810-explained
- Celigo — EDI 810 invoice — https://www.celigo.com/blog/edi-810/
- Celigo — EDI 856 ASN — https://www.celigo.com/blog/edi-856/
- CDP Institute / mParticle — Data quality with data planning — https://www.cdpinstitute.org/mparticle/improve-data-quality-with-mparticles-data-planning-infrastructure/

---

## Freshness & Confidence

- **Retrieval date:** 2026-07-18. All URLs accessed this date via WebSearch/WebFetch.
- **Confidence — HIGH:** Existence and shape of the workflows (campaign setup, creative approval, custom-audience import, experiments, catalog onboarding/EDI, mParticle data plans, SDK integration) are directly stated in current public Rokt/mParticle docs.
- **Confidence — MEDIUM:** The *cost/severity* of each pain (rejection-loop time, reconciliation dispute volume, governance burden) is partly inferred and partly supported by industry sources rather than Rokt-specific metrics. Labeled [INFERENCE]/[INDUSTRY-PROBLEM] accordingly.
- **Confidence — LOW / SPECULATIVE:** All tooling opportunities are [HYPOTHESIS] — unvalidated with users, offered as workflow-around directions, not claims about gaps in Rokt's product.
- **Known limitations:** Some doc pages were read via summarization (WebFetch), so exact SLA numbers and edge-case rules may differ from quoted paraphrases; several quotes are as returned by the fetch tool. Approval-loop timing and dispute rates are not published by Rokt and are inferred from general adtech/EDI practice. mParticle content reflects the post-acquisition "mParticle by Rokt" product.
- **No fabrication:** Where evidence was absent (e.g., documented rejection SLAs, Rokt-specific dispute rates), this is stated rather than invented.
