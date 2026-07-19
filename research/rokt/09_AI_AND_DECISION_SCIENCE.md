# 09 — AI & Decision-Science Techniques for Rokt-Adjacent Problems

**Agent 9 — AI & Decision-Science Researcher**
**Retrieval date:** 2026-07-18
**Mandate:** Assess which AI/decision-science techniques genuinely fit Rokt-adjacent problems (personalizing/monetizing the e-commerce "transaction moment"), and — critically — flag where deterministic logic or classical ML beats an LLM, and which techniques can be prototyped convincingly **without** proprietary Rokt data.

**Labeling convention:**
- `[VERIFIED-PUBLIC]` — supported by a cited public/technical source.
- `[INFERENCE]` — reasoned conclusion from cited facts + domain knowledge.
- `[HYPOTHESIS]` — plausible but unverified; flagged for validation.

**Bias check up front:** The default assumption in 2026 is often "wrap it in an LLM." For Rokt's core problem — real-time ranking of offers on tabular/behavioral signals under tight latency and revenue constraints — **that default is usually wrong.** Gradient-boosted trees, bandits, and calibrated propensity models dominate. LLMs/agents add real value only in specific, bounded places (creative generation, unstructured-data enrichment, internal tooling). This report is structured to make that boundary explicit.

**What Rokt actually is (context for grounding):** Rokt personalizes and monetizes the "Transaction Moment" (cart → confirmation page). Its engine ("Rokt Brain") is described publicly as trained on billions of transactions annually, selecting the most relevant offer/creative/layout per user in real time from first-party data and behavioral signals. `[VERIFIED-PUBLIC]` (Rokt blog; Forbes 2021; AWS blog). This is a **real-time ranking + decisioning + auction** problem, not a generative-language problem.

---

## PART A — THE DECISION GUIDE (problem shape → right technique)

| Problem shape | Right technique | Is an LLM/agent the right tool? | Deterministic sufficient? |
|---|---|---|---|
| "Which offer to show this user now?" (score & sort candidates) | **Learning-to-rank (GBDT/DLRM)** + calibration | No — decorative. Tabular ML wins. | No — too many interactions |
| "Explore new offers while earning revenue" (cold start, adaptivity) | **Contextual bandits** | No | No |
| "Sequence of touches over a journey, delayed reward" | **RL / bandits with delayed credit** (use cautiously) | No | Partial (rules for guardrails) |
| "Who is *persuadable* by this offer?" (incremental effect) | **Uplift modeling / CATE** | No | No |
| "Did this campaign actually cause lift?" | **Causal inference (DiD, PSM, DML)** | No | No |
| "Estimate a new policy's value from logs before shipping" | **Off-policy / counterfactual evaluation (IPS/SNIPS/DR)** | No | No |
| "Balance revenue vs. relevance vs. advertiser caps" | **Multi-objective + constrained optimization** | No | Partial (hard constraints ARE rules) |
| "Trust the score enough to bid/threshold on it" | **Probability calibration** | No | No |
| "Will this user churn / what's their LTV?" | **GBDT (churn), GBDT or BG/NBD (LTV)** | No | No |
| "Don't over-message this user" | **Offer-fatigue modeling + frequency-cap rules** | No | **Yes, mostly** (rules + a decay model) |
| "Enforce advertiser/legal/brand-safety constraints" | **Deterministic rules / constraint solver** | No | **YES — deterministic required** |
| "Detect model degradation over time" | **Monitoring: PSI/KS drift + performance tracking** | No | Yes (statistical tests) |
| "Generate/vary ad creative copy at scale" | **LLM (generation) + human review** | **YES — real value** | No |
| "Enrich messy unstructured merchant/offer metadata" | **LLM extraction + structured outputs** | **YES — real value** | Partial |
| "Let analysts query campaign knowledge in NL" | **RAG over internal docs** | **YES — bounded value** | No |
| "Multi-step internal ops automation w/ tools" | **Tool-using / agentic workflow** | **Maybe — often over-engineered** | Often yes |

**Headline:** LLMs/agents earn their keep in **content generation, unstructured-data enrichment, and internal knowledge tooling** — the periphery. The **core decisioning loop is classical ML + optimization + causal/counterfactual evaluation.** `[INFERENCE]`

---

## PART B — TECHNIQUE-BY-TECHNIQUE ASSESSMENT

Each entry: problem solved · why deterministic is insufficient (or sufficient) · data needed · evaluation · failure modes · latency · privacy · **prototype-feasibility-without-private-data (High/Med/Low)**.

### 1. Ranking (Learning-to-Rank)
- **Problem:** Order N candidate offers by expected value (pClick × pConvert × value) for a given context. The heart of Rokt's decision. `[INFERENCE]`
- **Deterministic?** Insufficient. Hand-tuned scoring rules can't capture high-order feature interactions across users×offers×context; industry uses GBDT/DLRM ranking. `[VERIFIED-PUBLIC]` (multi-objective LTR literature).
- **Data:** Impression/click/conversion logs with features + labels; ideally with logged propensities.
- **Evaluation:** Offline NDCG/AUC/logloss; online A/B on revenue-per-impression & CTR. Offline↔online gap is the known risk.
- **Failure modes:** Position/selection bias in logs; popularity feedback loops; miscalibration breaking downstream bidding.
- **Latency:** Must score many candidates in <~50–100ms. Tree ensembles and compact NN rankers are chosen precisely for this. `[INFERENCE]`
- **Privacy:** Behavioral features; PII minimization, first-party scope.
- **Prototype without private data: HIGH.** Public rec datasets (MovieLens, RecSys/ZOZO Open Bandit) + synthetic offer catalogs demo ranking convincingly.

### 2. Contextual Bandits
- **Problem:** Choose an offer while balancing exploration (learn) vs exploitation (earn); solves cold-start on new offers/users. `[VERIFIED-PUBLIC]`
- **Deterministic?** No — static rules never explore, so they never discover better offers; bandits "tackle the cold-start problem head on" by dynamically balancing explore/exploit. `[VERIFIED-PUBLIC]` (Eppo).
- **Data:** Context features + realized rewards; **logged action probabilities** are gold (enable OPE).
- **Evaluation:** Cumulative regret; off-policy replay; online reward.
- **Failure modes:** Non-stationarity; delayed/attributed rewards; variance when propensities small.
- **Latency:** Low — linear/logistic Thompson/LinUCB score in microseconds–ms.
- **Privacy:** Same as ranking.
- **Prototype without private data: HIGH.** LinUCB/Thompson on synthetic contexts is a textbook, visually compelling demo (regret curves). Open Bandit Pipeline ships synthetic generators. `[VERIFIED-PUBLIC]`

### 3. Reinforcement Learning (full RL)
- **Problem:** Optimize long-horizon cumulative value across a multi-touch journey (sequential decisions, delayed reward).
- **Deterministic?** No, if sequencing genuinely matters — but **caution:** full RL is often overkill vs. contextual bandits. RL adds off-policy training, large action spaces, and evaluation difficulty. `[VERIFIED-PUBLIC]`
- **Data:** Large sequential interaction logs; a reliable simulator or strong OPE.
- **Evaluation:** OPE (hard); simulator; guarded online. Offline RL is fragile.
- **Failure modes:** Reward hacking; distribution shift; unstable/unsafe policies; brutal sample complexity.
- **Latency:** Inference cheap; the risk is training/eval, not serving.
- **Privacy:** Sequential user trajectories are more re-identifying — higher risk.
- **Prototype without private data: MED.** Simulated environments demo the idea, but "convincing for Rokt" requires realistic dynamics that synthetic data may not capture. Recommend bandits over RL for demos. `[INFERENCE]`

### 4. Uplift Modeling / CATE
- **Problem:** Target users whose behavior is *changed* by the offer (persuadables), not those who'd convert anyway — "the statistical backbone of incrementality." `[VERIFIED-PUBLIC]`
- **Deterministic?** No — you cannot observe individual treatment effect directly; requires modeling the *difference* between treat/no-treat, learned from RCT/quasi-experimental data. `[VERIFIED-PUBLIC]`
- **Data:** Treatment/control labels (ideally randomized A/B), outcomes, features.
- **Evaluation:** Qini/uplift curves, AUUC — **not** standard accuracy.
- **Failure modes:** SUTVA violations (cannibalization across offers in a marketplace); weak signal (uplift << base rate); needs randomized data.
- **Latency:** Scoring cheap; can be precomputed.
- **Privacy:** Standard behavioral.
- **Prototype without private data: HIGH.** Synthetic RCTs with a designed treatment effect + Qini curves are a clean, persuasive demo; `causalml`/`scikit-uplift` support it. `[VERIFIED-PUBLIC]`

### 5. Causal Inference (DiD, PSM, DML)
- **Problem:** Answer "did X *cause* the lift?" from observational or quasi-experimental data (e.g., a placement change, a campaign).
- **Deterministic?** No — correlation ≠ causation; needs identification strategy (DiD, propensity matching, double ML). `[VERIFIED-PUBLIC]` (DoWhy/EconML).
- **Data:** Treatment assignment, outcomes, confounders; pre/post periods for DiD.
- **Evaluation:** Refutation/robustness tests (placebo, sensitivity) — DoWhy formalizes this.
- **Failure modes:** Unobserved confounding; bad overlap/positivity; ML nuisance overfitting in DiD (mitigated by DML). `[VERIFIED-PUBLIC]`
- **Latency:** Offline/analytical — not a serving concern.
- **Privacy:** Aggregate-friendly; lower risk.
- **Prototype without private data: HIGH.** Synthetic DGP with known ground-truth effect → show recovery via DoWhy + refutations. Very demonstrable and honest. `[VERIFIED-PUBLIC]`

### 6. Counterfactual / Off-Policy Evaluation (OPE)
- **Problem:** Estimate how a *new* ranking/bandit policy would perform **from existing logs**, before risking an A/B or live traffic. Directly de-risks Rokt-style deployment. `[VERIFIED-PUBLIC]`
- **Deterministic?** No — logs only contain rewards for actions the old policy took; you must reweight (IPS) or model (DR).
- **Methods:** IPS → **SNIPS** (self-normalized, lowest error, no tuning) → Clipped IPS → **Doubly Robust**. `[VERIFIED-PUBLIC]` (eugeneyan; Amazon Science).
- **Data:** Logged contexts, actions, rewards, **and logged propensities** (critical).
- **Evaluation:** Compare estimator variance/bias; validate against held-out A/B.
- **Failure modes:** **Insufficient support** (new policy shows items old never showed → divide-by-zero); **high variance** from tiny propensities (100× weights from single clicks). `[VERIFIED-PUBLIC]`
- **Latency:** Offline.
- **Privacy:** Log-based; standard.
- **Prototype without private data: HIGH.** **Open Bandit Pipeline** (st-tech/zr-obp) provides synthetic + real ZOZO logs *and* the estimators — a turnkey, credible OPE demo. `[VERIFIED-PUBLIC]`

### 7. Multi-Objective Optimization
- **Problem:** Jointly optimize revenue (RPM), user engagement (CTR), advertiser ROAS, and experience — conflicting objectives. `[VERIFIED-PUBLIC]`
- **Deterministic?** Partial — the *trade-off weighting* needs optimization (scalarization/Pareto), but **hard business constraints are deterministic rules** layered on top.
- **Data:** Multi-label outcomes per objective.
- **Evaluation:** Pareto front analysis; per-objective A/B lifts (recent CGR work reports +6.8% RPM, +4.9% CTR from constraint-aware reranking). `[VERIFIED-PUBLIC]`
- **Failure modes:** One objective dominating; unstable weights; gaming a single metric.
- **Latency:** Scalarized scoring is cheap; combinatorial reranking costs more.
- **Privacy:** Standard.
- **Prototype without private data: HIGH.** Synthetic multi-objective offer set + Pareto-front visualization is compelling.

### 8. Calibrated Uncertainty / Probability Calibration
- **Problem:** Make predicted probabilities *mean* what they say, so they can be safely used in bidding/thresholds/expected-value math. Essential when GBDTs distort probabilities. `[VERIFIED-PUBLIC]`
- **Deterministic?** No — needs Platt/isotonic/monotonic calibration fit on held-out data.
- **Data:** Held-out predictions + true labels.
- **Evaluation:** Reliability diagrams, ECE, Brier score. Note: isotonic most consistently helps; Platt can worsen some models. `[VERIFIED-PUBLIC]`
- **Failure modes:** Calibration drift; miscalibration under undersampling; too little data for isotonic.
- **Latency:** Negligible (post-hoc map).
- **Privacy:** None added.
- **Prototype without private data: HIGH.** Reliability-diagram before/after on any classifier is a clean visual.

### 9. Propensity Scoring
- **Problem:** Estimate probability of treatment/exposure — powers both causal matching (confounding control) and OPE reweighting. `[VERIFIED-PUBLIC]`
- **Deterministic?** No — it's a learned probability model.
- **Data:** Covariates + treatment indicator.
- **Evaluation:** Overlap/balance diagnostics; calibration of the propensity itself.
- **Failure modes:** Poor overlap; extreme propensities → high-variance weights; misspecification.
- **Latency:** Offline typically.
- **Privacy:** Standard.
- **Prototype without private data: HIGH** (bundled with causal/OPE demos).

### 10. Churn Prediction
- **Problem:** Flag users likely to lapse → target retention.
- **Deterministic?** No — but this is a **classic tabular ML** task. **GBDT (XGBoost/LightGBM/CatBoost) is the right tool, not an LLM.** `[VERIFIED-PUBLIC]`
- **Data:** Historical behavior, recency/frequency, labels.
- **Evaluation:** AUC/PR-AUC, lift; but tie to *actionable* uplift (churn ≠ persuadable).
- **Failure modes:** Label leakage; predicting inevitable churn you can't prevent; class imbalance.
- **Latency:** Batch/precomputed usually fine.
- **Privacy:** Behavioral profiling — data-minimization matters.
- **Prototype without private data: HIGH.** Telco churn / synthetic datasets are abundant.

### 11. LTV Prediction
- **Problem:** Predict customer lifetime value → budget/targeting decisions.
- **Deterministic?** No. Options: probabilistic **BG/NBD + Gamma-Gamma** (interpretable, few features) vs **GBDT** (captures nonlinear interactions, usually more accurate). `[VERIFIED-PUBLIC]` No LLM needed.
- **Data:** Transaction recency/frequency/monetary histories.
- **Evaluation:** MAE/RMSE on future spend; calibration of predicted vs actual; decile lift.
- **Failure modes:** Survivorship bias / censored data (BG/NBD limitation); heavy-tailed spend; distribution shift.
- **Latency:** Batch.
- **Privacy:** Transaction data — sensitive.
- **Prototype without private data: HIGH.** Public retail (Online Retail II) + `lifetimes` library.

### 12. Journey Orchestration
- **Problem:** Coordinate the sequence/timing of offers across touchpoints.
- **Deterministic?** **Partial and often sufficient at the guardrail layer** — many orchestration systems are rules/state-machines with ML scoring inside each step. Full sequential-RL orchestration is rarely justified. `[INFERENCE]`
- **Data:** Cross-session journey logs.
- **Evaluation:** Journey-level conversion, incremental lift; OPE for sequential policies (hard).
- **Failure modes:** Attribution ambiguity; combinatorial state; over-orchestration hurting UX.
- **Latency:** Depends; per-step scoring cheap.
- **Privacy:** Cross-session linkage → higher re-identification risk.
- **Prototype without private data: MED.** Rules + per-step bandit on synthetic journeys demos, but realism is limited.

### 13. Offer-Fatigue Modeling
- **Problem:** Avoid over-messaging (diminishing returns / annoyance).
- **Deterministic?** **Largely YES.** Frequency caps and time-decay rules handle most of it; a learned fatigue/decay model is a refinement, not a replacement. Good example of "deterministic first, ML only if it pays." `[HYPOTHESIS]`
- **Data:** Exposure counts, recency, response decay.
- **Evaluation:** CTR/conversion vs exposure count curves; long-run engagement.
- **Failure modes:** Confounding fatigue with targeting; per-user heterogeneity.
- **Latency:** Trivial (counters + decay).
- **Privacy:** Exposure counters — low.
- **Prototype without private data: HIGH.** Synthetic exposure-response decay curves.

### 14. Constraint-Aware Decisioning
- **Problem:** Enforce advertiser budgets/pacing, exclusivity, brand-safety, legal/geo eligibility inside the decision.
- **Deterministic?** **YES — the hard constraints MUST be deterministic and auditable.** Regulated/contractual rules require deterministic behavior and auditability; an LLM here is a liability. `[VERIFIED-PUBLIC]` (rules-vs-ML guidance). ML/optimization handles the soft trade-offs *within* the feasible set. `[INFERENCE]`
- **Data:** Constraint definitions + live budget/pacing state.
- **Evaluation:** Constraint-violation rate (must be ~0) + objective under constraints.
- **Failure modes:** Infeasibility; constraint conflicts; stale budget state.
- **Latency:** Filtering is fast; combinatorial solving can be costly — often approximated.
- **Privacy:** Low (business rules).
- **Prototype without private data: HIGH.** Synthetic constraints + solver/greedy is very demonstrable.

### 15. Human-in-the-Loop (HITL)
- **Problem:** Human review/approval where stakes or ambiguity are high (creative approval, policy exceptions, model-decision audits).
- **Deterministic?** N/A — it's a *process*, gating automation with confidence thresholds.
- **Data:** Model confidence + reviewer feedback (also becomes training labels).
- **Evaluation:** Escalation precision/recall; reviewer throughput; error caught rate.
- **Failure modes:** Reviewer fatigue/rubber-stamping; feedback bias.
- **Latency:** Async — not serving-path.
- **Privacy:** Reviewer access controls.
- **Prototype without private data: MED.** Demonstrable as a workflow/threshold UI, but value is organizational, not algorithmic.

### 16. Agentic Workflows
- **Problem:** Multi-step tasks requiring runtime-decided control flow, tool orchestration, multi-hop reasoning. `[VERIFIED-PUBLIC]`
- **Where it adds real value:** *Internal* ops — e.g., "which SKUs have open recalls in 90 days?" requiring catalog lookup → regulatory search → synthesis. `[VERIFIED-PUBLIC]`
- **Where it's decorative:** The real-time offer-ranking loop. Adding an agent there adds latency, cost, non-determinism, and auditability problems for zero ranking-quality gain. **A bandit/GBDT is faster, cheaper, deterministic, and better.** `[INFERENCE]`
- **Data:** Tool APIs + eval traces.
- **Evaluation:** Task success rate; step efficiency; cost/latency per task.
- **Failure modes:** Compounding errors over steps; loops; runaway cost; hard to guarantee behavior.
- **Latency:** Seconds — **disqualifying for the serving path.**
- **Privacy:** Tool access widens the data surface → higher risk.
- **Prototype without private data: MED.** Impressive demos exist but risk conflating "cool" with "needed."

### 17. RAG (Retrieval-Augmented Generation)
- **Problem:** Let staff query internal knowledge (campaign playbooks, advertiser docs, policies) in natural language.
- **Deterministic?** No — but scope is **internal tooling, not decisioning.**
- **Value:** Real but bounded. Standard single-index RAG handles most queries; "agentic RAG" only for genuine multi-hop needs. `[VERIFIED-PUBLIC]`
- **Data:** Internal doc corpus + embeddings.
- **Evaluation:** Retrieval hit-rate, faithfulness/groundedness, answer accuracy.
- **Failure modes:** Hallucination when retrieval misses; stale index; over-engineering to "agentic" when unneeded.
- **Latency:** Sub-second–seconds — fine for internal Q&A, not serving.
- **Privacy:** Corpus may contain confidential advertiser data → access control critical.
- **Prototype without private data: HIGH.** RAG over public docs demos the pattern fully.

### 18. Structured Outputs
- **Problem:** Force LLM output into a schema (JSON) — the bridge that makes LLM enrichment usable by deterministic systems. `[VERIFIED-PUBLIC]`
- **Value:** Real, as an *enabler* — e.g., extracting {category, attributes} from messy offer metadata for the tabular ranker to consume.
- **Data:** Schema + few-shot examples.
- **Evaluation:** Schema-validity rate; field-level accuracy vs gold.
- **Failure modes:** Silent wrong-but-valid fields; schema drift.
- **Latency:** LLM-bound — batch/offline enrichment, not serving.
- **Privacy:** Depends on input data.
- **Prototype without private data: HIGH.** Public unstructured text → schema is trivially demoable.

### 19. Tool-Using Agents
- **Problem:** LLM calls external tools/APIs to act. (Overlaps #16.)
- **Value:** Real for internal automation with clear tools; **over-applied** as a general hammer.
- **Deterministic alternative:** If the flow is fixed, a **plain script/pipeline is more reliable than an agent.** `[INFERENCE]`
- **Evaluation:** Tool-call accuracy; end-task success.
- **Failure modes:** Wrong tool/args; error cascades.
- **Latency:** Seconds.
- **Privacy:** Broad tool access = broad exposure.
- **Prototype without private data: MED.**

### 20. Model Monitoring
- **Problem:** Detect performance degradation / silent failures in production models.
- **Deterministic?** Yes — statistical tests and thresholds, no LLM.
- **Data:** Live feature/prediction distributions + (delayed) labels.
- **Evaluation:** Track AUC/logloss/calibration over time; alerting.
- **Failure modes:** Alert fatigue; delayed labels hiding degradation; monitoring only inputs not outcomes.
- **Latency:** Async.
- **Privacy:** Aggregated stats — low.
- **Prototype without private data: HIGH.** Evidently AI on synthetic drifting streams. `[VERIFIED-PUBLIC]`

### 21. Drift (Data & Concept)
- **Problem:** Distinguish input-distribution change (data drift) from input→output relationship change (concept drift). `[VERIFIED-PUBLIC]`
- **Deterministic?** Yes — **PSI** (>0.2 = significant drift), KS, chi-square, KL. `[VERIFIED-PUBLIC]`
- **Data:** Reference vs current windows.
- **Evaluation:** Drift metric thresholds correlated with actual perf drops.
- **Failure modes:** False alarms on benign shifts; missing concept drift when inputs look stable.
- **Latency:** Async.
- **Privacy:** Low.
- **Prototype without private data: HIGH.** Inject synthetic drift, show PSI/KS firing.

### 22. Offline vs Online Evaluation
- **Problem:** Know when offline metrics can be trusted vs when you must A/B online. The offline↔online gap is *the* recurring RecSys pitfall.
- **Deterministic?** N/A — it's methodology: use OPE offline, graduate to online A/B; watch for divergence. `[VERIFIED-PUBLIC]` (eugeneyan).
- **Data:** Logs (offline) + live traffic (online).
- **Evaluation:** Correlation between offline estimate and online lift.
- **Failure modes:** Offline overfitting; feedback loops; Simpson's-paradox segment effects.
- **Latency:** N/A.
- **Privacy:** Standard.
- **Prototype without private data: HIGH** (demonstrate OPE→A/B alignment on Open Bandit data).

---

## PART C — WHERE THE LLM/AGENT IS REAL vs DECORATIVE

**Real value (keep):**
- **Creative/offer copy generation & variation** at scale (with HITL review). Generative by nature — genuinely LLM-shaped.
- **Unstructured-data enrichment** (offer/merchant metadata → structured attributes via structured outputs) feeding the tabular ranker.
- **Internal knowledge tooling** (RAG over playbooks/policies; bounded ops automation).

**Decorative / actively harmful in the core loop (avoid):**
- **LLM as the offer ranker / decision-maker.** Tabular ML beats LLMs on structured tasks while being faster, cheaper, and deterministic; the serving path needs <100ms and auditability. `[VERIFIED-PUBLIC]`
- **Agent orchestrating real-time decisions.** Seconds-scale latency, cost, non-determinism — disqualifying. `[INFERENCE]`
- **LLM for churn/LTV/propensity.** These are canonical GBDT problems. `[VERIFIED-PUBLIC]`

**Deterministic is the RIGHT answer (not a fallback):**
- Hard business/legal/brand-safety constraints (auditability required). `[VERIFIED-PUBLIC]`
- Frequency caps / basic offer-fatigue guardrails.
- Drift/monitoring thresholds (PSI/KS).

---

## PART D — WHAT DEMOS CONVINCINGLY ON SYNTHETIC DATA (feasibility ranking)

**HIGH (build these):** Contextual bandits (regret curves), Off-policy evaluation via **Open Bandit Pipeline**, Uplift/CATE (Qini curves), Causal inference w/ DoWhy refutations, Calibration (reliability diagrams), Ranking (public rec data), Multi-objective/Pareto, Churn & LTV (public datasets + `lifetimes`), Constraint-aware decisioning, Drift/monitoring (Evidently), Structured-output enrichment, RAG over public docs.

**MED (demoable but realism-limited or value-is-organizational):** Full RL, Journey orchestration, HITL, Agentic/tool-using workflows.

**LOW:** None are truly infeasible — but full RL and end-to-end journey orchestration are the *least* convincing on synthetic data because their value depends on realistic dynamics proprietary data would provide.

**Recommended flagship prototype `[INFERENCE]`:** A single synthetic-data narrative — *contextual bandit offer selector → calibrated scores → multi-objective + hard-constraint reranker → OPE (SNIPS/DR) to "safely" evaluate a new policy → drift monitor* — tells Rokt's entire decisioning story end-to-end, all on public/synthetic data, with **no LLM in the core loop** and LLM enrichment shown only as an offline feature-prep sidecar. This directly demonstrates the "right tool for the problem shape" thesis.

---

## SOURCES (retrieved 2026-07-18)

- Rokt — "Unlocking Value in the Transaction Moment." https://www.rokt.com/blog/unlocking-value-in-the-transaction-moment-rokts-distinctive-edge-in-ecommerce
- Rokt Products overview. https://www.rokt.com/products/product-overview
- Forbes (2021-12-17) — "Rokt, Which Personalizes Transactions With AI And Machine Learning, Raises $325 Million." https://www.forbes.com/sites/sharonedelson/2021/12/17/rokt-which-personalizes-transactions-with-ai-and-machine-learning-raises-325-million/
- AWS Blog — "Retail Partner Conversations: How Rokt is impacting the future of retail." https://aws.amazon.com/blogs/industries/retail-partner-conversations-how-rokt-is-impacting-the-future-of-retail/
- Eppo — "When Should I Use Contextual Bandit Algorithms vs. Recommendation Systems?" https://www.geteppo.com/blog/contextual-bandit-algorithms-vs-recommendation-systems
- applyingml — "Reinforcement Learning for Recommendation Systems." https://applyingml.com/resources/rl-for-recsys/
- Eugene Yan — "Counterfactual Evaluation for Recommendation Systems." https://eugeneyan.com/writing/counterfactual-evaluation/
- Saito et al. — "Open Bandit Dataset and Pipeline: Towards Realistic and Reproducible Off-Policy Evaluation." arXiv:2008.07146. https://arxiv.org/abs/2008.07146 ; code: https://github.com/st-tech/zr-obp
- Amazon Science — "Double Clipping: Less-Biased Variance Reduction in Off-Policy Evaluation." https://assets.amazon.science/b0/ef/809b37a242189ff2e16ff53b0d82/double-clipping-less-biased-variance-reduction-in-off-policy-evaluation.pdf
- Wikipedia — "Uplift modelling." https://en.wikipedia.org/wiki/Uplift_modelling
- arXiv:2607.05242 — "CanniUplift: Mitigating Seller and Incentive Cannibalization in E-commerce Uplift Modeling." https://arxiv.org/pdf/2607.05242
- arXiv:2007.12769 — "A unified survey of treatment effect heterogeneity modeling and uplift modeling." https://arxiv.org/pdf/2007.12769
- PyWhy / DoWhy documentation. https://www.pywhy.org/dowhy/v0.8/
- ML Journey — "Causal Inference in Machine Learning: DoWhy and EconML." https://mljourney.com/causal-inference-in-machine-learning-dowhy-and-econml/
- arXiv:2603.04227 — "Constraint-Aware Generative Re-ranking for Multi-Objective Optimization in Advertising Feeds." https://arxiv.org/html/2603.04227
- arXiv:2407.07181 — "Multi-objective Learning to Rank by Model Distillation." https://arxiv.org/html/2407.07181v1
- arXiv:2503.00334 — "MCNet: Monotonic Calibration Networks for Expressive Uncertainty Calibration in Online Advertising." https://arxiv.org/html/2503.00334
- Rohan Paul — "Probability Calibration: Platt Scaling & Isotonic Regression." https://www.rohan-paul.com/p/ml-interview-q-series-probability-95f
- Tryolabs — "Why LLMs struggle with your spreadsheet data." https://tryolabs.com/blog/why-llms-struggle-with-your-spreadsheet-data
- Built In — "Does Your Project Need an LLM, Machine Learning or Statistics?" https://builtin.com/articles/llm-vs-machine-learning-vs-statistics
- Institute PM — "Classification Systems: When to Use Rules, ML, or LLMs." https://www.institutepm.com/knowledge-hub/ai-classification-systems-guide
- ResearchGate — "Customer Lifetime Value Modelling with Gradient Boosting." https://www.researchgate.net/publication/392531005_Customer_Lifetime_Value_Modelling_with_Gradient_Boosting
- MDPI Mach. Learn. Knowl. Extr. — "Customer Churn Prediction: A Systematic Review." https://www.mdpi.com/2504-4990/7/3/105
- Evidently AI — "What is data drift in ML, and how to detect and handle it." https://www.evidentlyai.com/ml-in-production/data-drift
- Encord — "Monitoring and Managing Data Drift in Production ML Systems." https://encord.com/blog/monitoring-and-managing-data-drift-in-production-ml-systems/
- arXiv:2501.09136 — "Agentic Retrieval-Augmented Generation: A Survey on Agentic RAG." https://arxiv.org/html/2501.09136v4
- Microsoft Learn — "Develop an Agentic RAG Solution on Azure." https://learn.microsoft.com/en-us/azure/architecture/ai-ml/guide/rag/rag-agentic

---

## FRESHNESS & CONFIDENCE

- **Freshness:** All retrievals 2026-07-18. Technique fundamentals (bandits, uplift, calibration, causal inference, OPE, GBDT dominance on tabular) are stable and well-established; confidence **High**. Rokt-specific internals are drawn from public marketing/press, not engineering disclosures — treat "Rokt Brain" architecture claims as **Medium** confidence and directional only.
- **Confidence by claim type:** `[VERIFIED-PUBLIC]` items rest on cited sources (High). `[INFERENCE]` items combine cited facts with standard domain reasoning (Medium-High). `[HYPOTHESIS]` items (e.g., offer-fatigue being largely deterministic; the flagship-prototype recommendation) are reasoned but unvalidated (Medium) and should be confirmed against Rokt's actual constraints.
- **Key caveat:** No proprietary Rokt data was used or accessed. Prototype-feasibility ratings assume public/synthetic datasets (MovieLens, Open Bandit Dataset/Pipeline, Online Retail II, telco churn) and open libraries (`causalml`, `scikit-uplift`, `lifetimes`, DoWhy/EconML, Open Bandit Pipeline, Evidently AI).
