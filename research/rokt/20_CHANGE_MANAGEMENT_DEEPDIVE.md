# 20 — Rokt Change-Management Deep-Dive (shoring up the load-bearing assumption)

**Date:** 2026-07-18 · Retrieval date 2026-07-18 · Primary sources only (docs.rokt.com).
**Purpose:** Threshold's one load-bearing premise is that a Rokt operator has a **change → review → approve** workflow where a pre-release safety gate fits. Earlier synthesis rated this "partially verified / mostly inference." This pass tests it against primary docs.

## Evidence table

| # | Claim | Verdict | Source | Quote |
|---|---|---|---|---|
| 1 | Rokt has a **manual approval queue** for campaign edits | **VERIFIED** | [Manage a campaign](https://docs.rokt.com/user-guides/rokt-ads/campaigns/how-to/managing/) | "the campaign and its new edits should then be placed in the **queue for manual approval by the Rokt operations team**." |
| 2 | **Every** upsell/creative/campaign/audience is reviewed for policy compliance before going live | **VERIFIED** | [Campaign Policies overview](https://docs.rokt.com/user-guides/rokt-ads/campaign-policies/overview/) | "Every upsell, creative, campaign, and audience is submitted into an approvals platform and is checked for compliance … by a member of the Rokt team before it is approved and eligible to be shown." |
| 3 | **Material changes re-trigger** approval | **VERIFIED** | Campaign Policies / Manage a campaign | "Material changes to a campaign's privacy policy, disclaimers, or terms and conditions trigger the approval process"; "certain changes might move your campaign to 'pending approval'." |
| 4 | Creatives have **pending / disapproved** states; editable only in those | **VERIFIED** | [Build a creative](https://docs.rokt.com/user-guides/rokt-ecommerce/campaigns/how-to/build-a-creative/) | "An existing creative can only be edited if it's in **pending** status … or **disapproved** status." |
| 5 | Some fields are **immutable** (require a new campaign) | **VERIFIED** | Manage a campaign | Objective, Country, Language, Time zone: "you need to create a new campaign and pause the existing campaign." |
| 6 | Campaign live states = **Active / Paused** | **VERIFIED** | Manage a campaign | green = Active, orange = Paused. |
| 7 | **Custom audience rules** are Rokt-staff-only; Include/Exclude invert per-rule logic | **VERIFIED** | [Attribute targeting](https://docs.rokt.com/user-guides/rokt-ads/audiences/resources/by-attribute/) | "only Rokt staff can add, edit, or delete custom rules … for general users the fields are read-only"; "Include/Exclude invert the logic for that particular rule." (The missing-value divergence for CC BIN is verified verbatim on this same page — the basis of Threshold's centerpiece.) |
| 8 | **Integration Monitor** = Workato-connected, Rokt QA + monitors + alerting | **VERIFIED** | [Integration monitor](https://docs.rokt.com/developers/integration-guides/integration-monitor/) | "invited to Workato to finalize the connection … Rokt will perform QA as well as configure monitors and the relevant alerting systems." |
| 9 | Event validation exposes **`unprocessedRecords`** | **VERIFIED** | [Event API](https://docs.rokt.com/developers/api-reference/event-api/) | "make sure there are no events returned in `unprocessedRecords`." |
| 10 | Conversion dedup = `conversiontype` + `confirmationref` | **VERIFIED (re-confirmed)** | Conversions overview / Event API | "confirmation reference serves as a deduplication key." |

## Verdict on the assumption
**Substantially supported — upgraded from "mostly inference."** Rokt runs an explicit **edit → "Save and Edit" → manual-approval-queue → Rokt-operations review → approved/pending/disapproved** pipeline, with **material changes re-triggering** review and **immutable fields** forcing a new campaign. That is exactly the kind of pre-production change flow where a **pre-flight safety gate** is a natural fit: it runs *before* a change enters the human approval queue (or a holdout), catching silent eligibility-widening, missing-attribute flips, and checkout-risk **before** a reviewer or a customer ever sees it. It reduces rejection churn (verified pain: creatives bounce between pending/disapproved) rather than duplicating the human review.

**Honest caveat:** the *public* workflow is documented for **campaigns/creatives/audiences** (advertiser + ecommerce), not for a distinct "placement-policy engineer publishing eligibility policy" as Threshold frames it. The mapping (campaign/audience change ≈ policy change) is a reasonable **inference**, not a verbatim match. Threshold's operator persona is therefore *well-motivated by a real, documented approval pipeline*, while the exact "policy-as-code publish" surface remains modeled.

## New grounded capabilities worth adding to the constraint catalog
1. **`requires_reapproval` detector** *(VERIFIED grounding #3)* — flag when a change touches privacy policy / disclaimers / T&Cs (or an immutable field), i.e. "this change will re-enter Rokt's manual approval queue." A real, cited constraint that ties Threshold directly to the documented workflow.
2. **`immutable_field_guard`** *(#5)* — block edits to objective/country/language/timezone with "these require a new campaign, not an edit."
3. **`unprocessed_records` integrity note** *(#9)* — extend the conversion-integrity story: a change that would push events into `unprocessedRecords` is an integrity risk (grounds the dedup/So-what beyond duplicates).
4. **Approval-state model** *(#4, #6)* — reflect real states (pending/disapproved for creatives; Active/Paused for campaigns) in the evidence trail so the verdict reads as "eligible to *enter* review/holdout," matching Rokt's own lifecycle.

## Recommended next build step (small, high-payoff)
Add constraints **#1 and #2** to `backend/app/domain/constraints.py` (both are pure deterministic checks with verbatim grounding strings) and surface them as two more heatmap tiles. This makes Threshold visibly *plug into Rokt's documented approval pipeline*, not just a generic safety toy — the single cheapest credibility upgrade available.
