# VER_03 — Experiments, One Platform, Sandbox, Integration Monitor & Org/Strategy

**Retrieval date:** 2026-07-18
**Method:** WebSearch + WebFetch on docs.rokt.com, rokt.com, prnewswire.com, and named trade press. No fabricated URLs/quotes/people.

Verdict key: **VERIFIED** (primary source + exact quote) · **UNVERIFIED** (looked, not found) · **CONTRADICTED**

---

## Claim 1 — Page Holdout Experiments (One Platform)

| Sub-claim | Verdict | Source URL | Exact quote | Page date |
|---|---|---|---|---|
| Page Holdout Experiments exist | VERIFIED | https://docs.rokt.com/user-guides/rokt-ecommerce/experiments/how-to/holdout-tests/ | "The purpose of a holdout test is to compare the performance of a webpage or set of pages without Rokt's integration to the performance of the same page with Rokt." | Oct 11, 2024 |
| Recommended 5% control | VERIFIED | (same) | "We recommend a 5% control to measure the impact of Rokt's optimization." | Oct 11, 2024 |
| Variant option 1 — page without Rokt | VERIFIED | (same) | "Display the page without Rokt … if you do not intend to show a Rokt layout to customers assigned to the holdout group." | Oct 11, 2024 |
| Variant option 2 — Rokt layout to replicate | VERIFIED | (same) | "Display a Rokt layout to replicate an existing experience … if you want to configure a Rokt layout to replace some content on your page." | Oct 11, 2024 |
| Success metric + secondary metric + minimum uplift % | VERIFIED | (same) + https://docs.rokt.com/user-guides/rokt-ads/experiments/how-to/building-experiments/ | "Select a primary metric (and optional secondary metrics)…" ; "Minimum uplift is the smallest relative percentage change you want to detect in the primary success metric." | Oct 11, 2024 / Oct 24, 2023 |
| Experiments live within ~5 minutes | VERIFIED | (same) | "Most experiments go live within five minutes." | Oct 11, 2024 |

**Note:** The Rokt Ads "Build an experiment" page uses a slider for cohort % (not a fixed 5%); the 5% recommendation is specific to the ecommerce/Thanks Holdout Test page. Both are consistent, not contradictory.

---

## Claim 2 — Audience Include/Exclude semantics (CC BIN) & custom rules

| Sub-claim | Verdict | Source URL | Exact quote | Page date |
|---|---|---|---|---|
| "Include (is not in)" semantics for CC BIN | VERIFIED | https://docs.rokt.com/user-guides/rokt-ads/audiences/resources/by-attribute/ | "Include (is not in): The audience is only included if the partner has provided value for CC BIN, and we can confidently say that it is not in the list." | Oct 24, 2023 |
| "Exclude (is in)" semantics for CC BIN | VERIFIED | (same) | "Exclude (is in): The audience is included if the partner has provided a value for CC BIN and it is not in the list, but it is also included if the partner has not provided a value for CC BIN." | Oct 24, 2023 |
| Custom attribute rules require Rokt staff | VERIFIED | (same) | "Only Rokt staff can add, edit, or delete custom rules. All users can view the rule, but for general users the fields are read-only." | Oct 24, 2023 |

The subtle difference (missing-value handling differs between the two operators) is real and documented. Multiple rules combine with AND logic.

---

## Claim 3 — Sandbox environment

| Sub-claim | Verdict | Source URL | Exact quote | Page date |
|---|---|---|---|---|
| Sandbox follows production config | VERIFIED | https://docs.rokt.com/developers/integration-guides/ios/how-to/sandbox/ | "The sandbox environment follows a normal offers, bidding, and matching process against your production configuration." | Apr 9, 2026 |
| Does not charge advertisers | VERIFIED | (same) | "While a sandbox environment is part of the Rokt production environment, it does not charge advertisers or generate revenue." | Apr 9, 2026 |
| Docs "contact your account manager" | PARTIAL / UNVERIFIED on this page | (same) | The sandbox page contains no "contact your account manager" statement. The phrase does appear broadly across other Rokt docs, but was not verified as a sandbox-page specific claim. | Apr 9, 2026 |

---

## Claim 4 — Integration Monitor

| Sub-claim | Verdict | Source URL | Exact quote | Page date |
|---|---|---|---|---|
| Integration Monitor validates events / flags missing purchase data / health checks | VERIFIED | https://docs.rokt.com/developers/integration-guides/integration-monitor/ | "A discrepancy between the session numbers would imply something has gone wrong and can alert Rokt to conduct an investigation." (case study: "uncovered 5M transactions where the Rokt SDK was not firing") | Jun 13, 2025 |
| Uses Workato | VERIFIED | (same) | "we will then invite you to a system called Workato to help finalize the connection between your analytics platform and Rokt's system." | Jun 13, 2025 |
| Uses GA reconciliation | VERIFIED | (same) | "Rokt can integrate with GA to receive the number of sessions or page views on the confirmation page to be checked against Rokt's records from the Rokt Web SDK." | Jun 13, 2025 |

---

## Claim 5 — Creative/offer approval workflow

| Sub-claim | Verdict | Source URL | Exact quote | Page date |
|---|---|---|---|---|
| Approval workflow exists (human/ops review) | VERIFIED | https://docs.rokt.com/user-guides/rokt-ecommerce/campaigns/how-to/build-a-creative/ | "Once items are submitted, they will [be] examined by Rokt's operations teams to determine if they comply with all Rokt's policies for creatives." | Apr 30, 2024 |
| ~24 hour turnaround | VERIFIED | https://docs.rokt.com/user-guides/rokt-ecommerce/campaigns/resources/policies/ (Rokt Thanks policies) | "All campaigns and creatives need to be approved by … Rokt before going live, usually within 24 hours." | (Thanks policies) |
| Prohibited categories | VERIFIED | https://docs.rokt.com/user-guides/rokt-policies/rokt-ads/ | Prohibits "Obscene or profane language…", "Manipulative, shaming, or emotionally coercive language", etc. | May 7, 2026 |
| Sensitive categories (explicit consent, blocked by default) | VERIFIED | https://docs.rokt.com/user-guides/rokt-policies/protecting-the-customer-experience/ | "Sensitive categories are blocked by default… Sensitive categories currently include, but are not limited to: Online gaming, casinos, sports betting, fantasy sports and lottery." | (policies) |
| Disclaimer rules | VERIFIED | https://docs.rokt.com/user-guides/rokt-policies/rokt-ads/ | "Disclaimers must be fewer than 100 characters in length with grammatically correct punctuation…" | May 7, 2026 |
| **AI + human review** | **UNVERIFIED / CONTRADICTED** | (creative & ads policy pages) | Docs describe **human/operations-team** review only. **No mention of AI review** was found. The "AI + human review" characterization is not supported by public docs. | — |

---

## Claim 6 — Org / Strategy signals

| Sub-claim | Verdict | Source URL | Exact quote | Date |
|---|---|---|---|---|
| Sam Dozor = CTO (real person, ex-mParticle) | VERIFIED | https://www.rokt.com/blog/rokt-appoints-mparticle-leader-sam-dozor-as-chief-technology-officer ; https://www.prnewswire.com/news-releases/rokt-appoints-mparticle-leader-sam-dozor-as-chief-technology-officer-302781960.html | "Rokt has appointed Sam Dozor as Chief Technology Officer…" (founding mParticle engineer since 2014) | May 26, 2026 |
| Claire Southey = Chief AI Officer (real person) | VERIFIED | https://aithority.com/interviews/aithority-interview-with-claire-southey-chief-ai-officer-at-rokt/ ; https://theorg.com/org/rokt/org-chart/claire-southey | "Claire Southey is a Chief AI Officer at Rokt" (joined May 2024 as SVP Engineering, later CAIO) | Jan 28, 2026 |
| Rokt Brain v4 | VERIFIED (secondary trade press only) | https://www.tipranks.com/news/private-companies/rokt-unveils-brain-v4-ai-engine-to-enhance-transaction-moment-relevance | Reported as "the latest evolution of its AI-powered Rokt Brain engine… built over a two-week engineering sprint." **No official rokt.com/prnewswire primary press release located**; treat with mild caution. | ~June 2026 (TipRanks) |
| Match Boost | VERIFIED | https://www.prnewswire.com/news-releases/rokt-mparticle-introduces-match-boost-to-improve-audience-match-rates-across-major-ad-platforms-302677156.html | "Match Boost… enriches first-party audiences at the point of activation to improve audience match rates… across major ad platforms." | 2026 |
| Hybrid CDP | VERIFIED | https://www.prnewswire.com/news-releases/rokt-mparticle-launches-performance-engine-led-by-audience-agent-302810947.html | "The Performance Engine is built on a hybrid CDP foundation that has powered real-time and composable use cases… for more than a decade." | Jun 25, 2026 |
| Performance Engine / Audience Agent (June 2026) | VERIFIED | (same PR above) | "the new Audience Agent turns it into the right audience… available to select clients today." Launched June 25, 2026. | Jun 25, 2026 |
| Kubeflow / MLOps / feature store in job postings | VERIFIED | https://echojobs.io/job/rokt-senior-machine-learning-engineer-rpd-rokt-brain-30set ; https://startup.jobs/senior-machine-learning-engineer-rokt-2130846 ; datasciencejobs.com Staff MLE listing | Rokt MLE postings list "Kubernetes, Kubeflow, TFX and Feature Store in a production environment" as "a massive plus." | 2026 listings |

---

## Overall

Nearly every Rokt-doc specific is VERIFIED verbatim. Two caveats: sandbox "contact your account manager" is not on the sandbox page, and the approval "AI + human review" claim is **NOT supported** — docs describe human/operations review only. Sam Dozor (CTO) and Claire Southey (CAIO) are both real, titled, and verified via official/primary sources. Brain v4 is verifiable only through trade press (TipRanks), with no located official primary release.
