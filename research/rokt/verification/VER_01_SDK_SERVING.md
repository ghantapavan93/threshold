# VER_01 — SDK & Serving/Fallback Claims Verification

**Retrieval date:** 2026-07-18
**Sources restricted to:** docs.rokt.com, rokt.com / go.rokt.com, official Rokt press release (PR Newswire), plus corroborating exec sources (AiThority interview, LinkedIn/TheOrg) for #6.
**Method:** WebSearch + WebFetch, direct fetch of primary pages, cross-verified the two highest-risk claims (#2, #6) with a second independent fetch to guard against summarizer error.

---

## Claim-by-claim table

| # | Claim | Verdict | Primary source URL | Exact quote / evidence | Page date |
|---|-------|---------|--------------------|------------------------|-----------|
| 1a | Placement lifecycle events exposed (`PLACEMENT_*`, engagement, close) | **VERIFIED** | https://docs.rokt.com/developers/integration-guides/web/advanced/event-based-integration/ | Documented events: `OFFER_ENGAGEMENT`, `POSITIVE_ENGAGEMENT`, `PLACEMENT_CLOSED`, `PLACEMENT_COMPLETED`, `PLACEMENT_INTERACTIVE`, `PLACEMENT_READY`, `PLACEMENT_RESIZE`, `PLACEMENT_FAILURE`. Methods: `Selection.on()`, `Selection.getPlacements()` | Updated Feb 2, 2026 |
| 1b | `selectPlacements()` exists | **VERIFIED** | https://docs.rokt.com/developers/integration-guides/web/library/select-placements-options/ | `selectPlacements` is the core Web SDK+ selection method (dedicated options page) | — |
| 1c | `onEvent` / `onUnload` callbacks | **UNVERIFIED** | (event-based-integration page) | Not present. Web SDK uses `Selection.on(event, handler)`, not an `onEvent`/`onUnload` callback name | — |
| 1d | Close/event reasons `TIMEOUT`, `NO_OFFERS`, `NETWORK_ERROR`, `INIT_FAILED`, `NO_WIDGET` | **UNVERIFIED** | (event-based-integration page) | None of these enum names appear. Failure is surfaced generically as `PLACEMENT_FAILURE`. The specific reason strings were not found in public docs. | — |
| 2 | `<rokt-thank-you>` element with `fallback-timeout` attr defaulting to 5000ms | **VERIFIED** | https://docs.rokt.com/developers/integration-guides/getting-started/ecommerce/ecommerce-sdk-integration/ | Table row: `fallback-timeout` — "Duration in milliseconds before placement selection times out and the native confirmation page renders." Default `5000`. Element: `<rokt-thank-you loader fallback-timeout partner-opt-in partner-opt-out>` (confirmed via 2nd independent fetch) | Updated Jul 15, 2026 |
| 3 | `onShouldHideLoadingIndicator` fires on success OR failure response | **VERIFIED** | https://docs.rokt.com/developers/integration-guides/cordova/how-to/add_a_placement/ | "The `onShouldHideLoadingIndicator` callback will be called when the SDK obtains a success or failure response from the Rokt backend." | — |
| 4 | Partner can skip/hide upsell when no offer; checkout continues unaffected | **VERIFIED (concept)** | https://docs.rokt.com/developers/integration-guides/getting-started/ecommerce/ecommerce-sdk-integration/ | "If no offer is eligible, the wrapped content renders normally." `partner-opt-out` attribute force-skips the interstitial; on timeout the native confirmation page renders. | Updated Jul 15, 2026 |
| 4b | Specific `/placements/any` boolean endpoint | **UNVERIFIED** | — | No such named endpoint found. The no-offer path is documented via the `<rokt-thank-you>` wrapper fallback behavior, not a `/placements/any` boolean. | — |
| 5 | "Show the right content or show nothing" principle; "no offer" as first-class outcome | **VERIFIED** | https://www.prnewswire.com/news-releases/ai-powered-relevance-transforms-checkout-rokts-measurement-first-approach-302691080.html | Principle heading: "Quality thresholds: 'show the right content or show nothing'." Rokt "may choose not to show any offer if it cannot meet a minimum reserve quality threshold." | Feb 18, 2026 |
| 5b | Literal `SHOW_NOTHING` technical variable/enum | **UNVERIFIED** | — | The phrase "show nothing" is a stated principle, NOT a documented code constant/enum named `SHOW_NOTHING`. | — |
| 6 | Principle attributed to Claire Southey, Chief AI Officer at Rokt; person/title/quote real | **VERIFIED** | https://www.prnewswire.com/news-releases/ai-powered-relevance-transforms-checkout-rokts-measurement-first-approach-302691080.html ; https://aithority.com/interviews/aithority-interview-with-claire-southey-chief-ai-officer-at-rokt/ | Person is real; title confirmed "Claire Southey, Chief AI Officer at Rokt" (AiThority headline/byline, Jan 28, 2026; corroborated by LinkedIn, TheOrg, PR Newswire leadership release). Attributed quote in the Feb 18 release: "The best thing is to get out of the customer's way and let them complete the purchase." | Jan 28 / Feb 18, 2026 |
| 7a | "30+ real-time signals" | **VERIFIED** | https://go.rokt.com/most-trusted | "30+ real-time signals used in AI decisioning" | — |
| 7b | "sub-200ms latency" | **VERIFIED** | https://go.rokt.com/most-trusted | "Sub-200ms latency" (also "99.99% uptime") | — |
| 7c | "minimum reserve quality threshold" | **VERIFIED** | https://www.prnewswire.com/news-releases/ai-powered-relevance-transforms-checkout-rokts-measurement-first-approach-302691080.html | "may choose not to show any offer if it cannot meet a minimum reserve quality threshold" | Feb 18, 2026 |
| 7d | "thousands of signals" | **UNVERIFIED** | — | Not found on Rokt Brain product page or other public pages. Product page gives client/transaction/brand counts, not a "thousands of signals" figure. The documented figure is "30+", not "thousands". | — |
| 8a | CSP directives documented | **VERIFIED** | https://docs.rokt.com/developers/integration-guides/data-and-security/web-security/ | Allow-list incl. `script-src https://apps.rokt.com https://apps.rokt-api.com https://apps.roktecommerce.com ...; frame-src https://apps.rokt.com ...`; prevents inline scripts and eval | — |
| 8b | Client-side PII encryption documented | **VERIFIED** | https://docs.rokt.com/developers/integration-guides/data-and-security/encryption/ | "RSA/ECB/OAEPWithSHA-256AndMGF1Padding" for first name, last name, email, phone (`firstNameEnc`, `lastNameEnc`, `emailEnc`, `mobileEnc`) | Updated Oct 24, 2023 |
| 8c | Consent flags `noFunctional` / `noTargeting` documented | **VERIFIED** | https://docs.rokt.com/developers/integration-guides/web/cookie-consent-flags/ | "`noFunctional` — Controls the use of browser identifiers for functional tracking." "`noTargeting` — Controls the use of browser identifiers for targeting tracking." | Updated Mar 19, 2026 |

---

## Notes / caveats
- Claim 1: The *category* (placement lifecycle events) is real and well-documented, but the specific failure-reason enum strings a candidate might name (`TIMEOUT`, `NO_OFFERS`, `NETWORK_ERROR`, `INIT_FAILED`, `NO_WIDGET`) are **not** in public docs. Failure is surfaced as `PLACEMENT_FAILURE`. `onEvent`/`onUnload` are not the documented callback names (`Selection.on` is).
- Claim 4/5: The *behavior* (skip on no-offer, checkout continues, "show nothing") is documented, but the invented-looking specifics (`/placements/any` boolean, `SHOW_NOTHING` constant) are not.
- Claim 6 is fully verified — the exec, title, and a real attributed quote all check out. Not a hallucination.
