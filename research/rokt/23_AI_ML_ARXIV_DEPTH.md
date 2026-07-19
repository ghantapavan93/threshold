# 23 — AI/ML Cutting-Edge Depth for Rokt's Transaction Moment

**Purpose:** Deep, current, and *honest* map of the AI/ML techniques and papers that genuinely apply to Rokt's real-time offer-decisioning problem (the "Transaction Moment": sub-200ms offer selection at ecommerce checkout, billions of transactions, incrementality/holdout-proven revenue). Written to enrich the "Builder" page of Pavan's Threshold portfolio.

**Retrieval date:** 2026-07-18
**Discipline used:** Every citation below was resolved to a real primary source (arXiv abstract page, journal DOI, or PMLR/ACL proceedings) and the arXiv ID / venue was verified during research. Any paper that could not be verified was omitted. Application claims are explicitly labelled **INFERENCE** (a defensible technical extrapolation) or **HYPOTHESIS** (plausible but unproven). No performance number is invented — every quantitative figure is the paper's own reported number, attributed to that paper.

**How Threshold connects to all of this:** Threshold is a *Policy Change Safety Gate* — before a new offer-selection policy ships, estimate its impact from logged data and block regressions. That thesis sits squarely on **Area 2 (off-policy evaluation)** as its core, with **Area 1 (bandits)** as the policy class it evaluates, **Area 4 (incrementality/experiment design)** as the ground-truth it must agree with, **Area 3 (uplift)** as the value signal it optimizes, and **Areas 5–7** as the surrounding production surface.

---

## Source list (all verified)

### Area 1 — Contextual bandits / Thompson sampling
- Li, Chu, Langford, Schapire (2010). *A Contextual-Bandit Approach to Personalized News Article Recommendation.* WWW 2010. arXiv:1003.0146 — https://arxiv.org/abs/1003.0146
- Agrawal, Goyal (2013). *Thompson Sampling for Contextual Bandits with Linear Payoffs.* ICML 2013 (PMLR v28, 127–135). arXiv:1209.3352 — https://arxiv.org/abs/1209.3352
- Zhang, Zhou, Li, Gu (2021). *Neural Thompson Sampling.* ICLR 2021. arXiv:2010.00827 — https://arxiv.org/abs/2010.00827

### Area 2 — Off-policy evaluation (Threshold's core)
- Dudík, Langford, Li (2011). *Doubly Robust Policy Evaluation and Learning.* ICML 2011. arXiv:1103.4601 — https://arxiv.org/abs/1103.4601
- Swaminathan, Joachims (2015). *The Self-Normalized Estimator for Counterfactual Learning (SNIPS).* NeurIPS 2015 — https://papers.nips.cc/paper/5748-the-self-normalized-estimator-for-counterfactual-learning
- Su, Dimakopoulou, Krishnamurthy, Dudík (2020). *Doubly Robust Off-Policy Evaluation with Shrinkage.* ICML 2020 (PMLR v119). arXiv:1907.09623 — https://arxiv.org/abs/1907.09623
- Saito, Joachims (2022). *Off-Policy Evaluation for Large Action Spaces via Embeddings (MIPS).* ICML 2022 (PMLR v162). arXiv:2202.06317 — https://arxiv.org/abs/2202.06317
- Saito, Aihara, Matsutani, Narita (2020/2021). *Open Bandit Dataset and Pipeline.* NeurIPS 2021 Datasets & Benchmarks. arXiv:2008.07146 — https://arxiv.org/abs/2008.07146

### Area 3 — Uplift / CATE / persuadables
- Künzel, Sekhon, Bickel, Yu (2019). *Metalearners for estimating heterogeneous treatment effects using machine learning (S/T/X-learner).* PNAS 116(10):4156–4165. arXiv:1706.03461 — https://arxiv.org/abs/1706.03461
- Wager, Athey (2018). *Estimation and Inference of Heterogeneous Treatment Effects using Random Forests (causal forest).* JASA 113(523). arXiv:1510.04342 — https://arxiv.org/abs/1510.04342
- Shi, Blei, Veitch (2019). *Adapting Neural Networks for the Estimation of Treatment Effects (DragonNet).* NeurIPS 2019. arXiv:1906.02120 — https://arxiv.org/abs/1906.02120
- Liu et al. (2024). *Benchmarking for Deep Uplift Modeling in Online Marketing.* arXiv:2406.00335 — https://arxiv.org/abs/2406.00335

### Area 4 — Incrementality & experiment design
- Deng, Xu, Kohavi, Walker (2013). *Improving the Sensitivity of Online Controlled Experiments by Utilizing Pre-Experiment Data (CUPED).* WSDM 2013 — https://dl.acm.org/doi/10.1145/2433396.2433413
- Vaver, Koehler (2011). *Measuring Ad Effectiveness Using Geo Experiments.* Google Research — https://research.google/pubs/measuring-ad-effectiveness-using-geo-experiments/
- Johnson, Lewis, Nubbemeyer (2017). *Ghost Ads: Improving the Economics of Measuring Online Ad Effectiveness.* J. Marketing Research 54(6):867–884 — https://journals.sagepub.com/doi/10.1509/jmr.15.0297
- Guo et al. (2021). *Machine Learning for Variance Reduction in Online Experiments (MLRATE).* NeurIPS 2021. arXiv:2106.07263 — https://arxiv.org/abs/2106.07263

### Area 5 — Real-time / sequential recsys
- Kang, McAuley (2018). *Self-Attentive Sequential Recommendation (SASRec).* ICDM 2018. arXiv:1808.09781 — https://arxiv.org/abs/1808.09781
- Zhai et al. (2024). *Actions Speak Louder than Words: Trillion-Parameter Sequential Transducers for Generative Recommendations (HSTU).* ICML 2024. arXiv:2402.17152 — https://arxiv.org/abs/2402.17152

### Area 6 — LLM evaluation & guardrails
- Liang, Bommasani, Lee et al. (2022). *Holistic Evaluation of Language Models (HELM).* arXiv:2211.09110 — https://arxiv.org/abs/2211.09110
- Manakul, Liusie, Gales (2023). *SelfCheckGPT: Zero-Resource Black-Box Hallucination Detection.* EMNLP 2023. arXiv:2303.08896 — https://arxiv.org/abs/2303.08896
- Rebedea, Dinu, Sreedhar, Parisien, Cohen (2023). *NeMo Guardrails: A Toolkit for Controllable and Safe LLM Applications with Programmable Rails.* EMNLP 2023 (Demo). arXiv:2310.10501 — https://arxiv.org/abs/2310.10501

### Area 7 — Fatigue / frequency capping / "show nothing"
- Moriwaki, Fujita, Yasui, Hoshino (2019). *A Contextual Bandit Algorithm for Ad Creative under Ad Fatigue (a.k.a. Fatigue-Aware Ad Creative Selection).* arXiv:1908.08936 — https://arxiv.org/abs/1908.08936
- (Frequency capping, recent) *Reach Measurement, Optimization and Frequency Capping in Targeted Online Advertising Under k-Anonymity* (2025). arXiv:2501.04882 — https://arxiv.org/abs/2501.04882

---

## Area 1 — Contextual bandits / Thompson sampling for real-time offer selection

**Seminal — LinUCB (Li, Chu, Langford, Schapire, WWW 2010, arXiv:1003.0146).**
Method: models each recommendation as a contextual bandit where the expected reward of an arm is linear in a shared feature vector, and picks the arm maximizing an upper-confidence bound (mean + exploration bonus) so uncertain arms get tried. On the Yahoo! Front Page dataset (>33M events) the paper reports a **12.5% click lift over a context-free bandit** (paper's own number), and it also introduced the replay/rejection-sampling trick for unbiased *offline* evaluation of a bandit on uniformly-random logged traffic.

**Seminal — Thompson Sampling for linear payoffs (Agrawal & Goyal, ICML 2013, arXiv:1209.3352).**
Method: instead of a UCB bonus, maintain a Bayesian posterior over the linear reward parameters, sample one draw each round, and act greedily w.r.t. the sample — exploration falls out of posterior variance. They gave the first rigorous regret bound (Õ(d^{3/2}√T)) for contextual Thompson sampling; empirically TS often matches or beats UCB while being trivial to implement and naturally handling delayed/batched feedback.

**Recent — Neural Thompson Sampling (Zhang, Zhou, Li, Gu, ICLR 2021, arXiv:2010.00827).**
Method: replaces the linear reward mean with a neural network and derives the posterior variance from the network's neural-tangent-kernel features, giving deep-model expressiveness with calibrated exploration. This is the bridge from linear bandits to the deep representations a real production stack (like Rokt's) actually uses. *(Note: 2021, not 2023–2026; it is the most-cited principled deep-bandit method. A genuinely 2023 pointer for non-stationary settings is arXiv:2310.07786, "Non-Stationary Contextual Bandit Learning via Neural Predictive Ensemble Sampling," which is newer but far less battle-tested — cite it as frontier, not foundation.)*

**How this applies to Rokt's Transaction Moment:**
The offer-selection step *is* a contextual bandit: context = checkout signals (basket, merchant, user features, page), arms = candidate offers, reward = click/conversion/revenue. **INFERENCE:** Thompson sampling is a strong fit for Rokt because sampling one posterior draw per request is O(actions) cheap and fits a sub-200ms budget, and because TS degrades gracefully under the delayed, batched reward logging that a payments/checkout flow inevitably has. **INFERENCE:** LinUCB's replay evaluation idea is the historical ancestor of Threshold's whole thesis — "evaluate the policy offline before shipping."

**Synthetic-data demonstrable?** Yes, cleanly. Simulate a reward function reward(context, arm), stream synthetic checkout contexts, and run LinUCB / linear-TS / a small neural bandit against an oracle-best and a random baseline; plot cumulative regret. No real data needed.

---

## Area 2 — Off-policy evaluation (THRESHOLD'S CORE — go deep)

This is the heart of Threshold: given logs from the *currently deployed* policy (context, action taken, propensity, reward), estimate what a *new candidate* policy would have earned — **without shipping it**. The estimator family trades bias against variance.

**Seminal — IPS and the bias/variance problem.**
Inverse Propensity Scoring reweights each logged reward by 1/(logging propensity) to correct for the fact that the old policy chose actions non-uniformly. IPS is *unbiased* if propensities are known and every action the new policy might take had nonzero logging probability (overlap/positivity), but its **variance explodes** when the new policy diverges from the logging policy (large importance weights). This variance blow-up is exactly the failure mode a safety gate must detect and bound.

**Seminal — Doubly Robust (Dudík, Langford, Li, ICML 2011, arXiv:1103.4601).**
Method: combine a reward *model* (low variance, possibly biased) with an IPS *correction* on the model's residuals (removes bias), so the estimator is consistent if *either* the model *or* the propensities are right. DR is the workhorse: it keeps IPS's unbiasedness guarantee while cutting variance by using the model where data is thin — the natural default estimator for a production safety gate.

**Seminal — SNIPS / self-normalized IPS (Swaminathan & Joachims, NeurIPS 2015).**
Method: divide the IPS estimate by the mean of the importance weights instead of by n, which removes IPS's notorious sensitivity to weight scale (the "propensity overfitting" pathology in counterfactual learning). Small, almost-free bias in exchange for large variance reduction — a standard robustness upgrade over vanilla IPS.

**Recent — DR with Shrinkage (Su, Dimakopoulou, Krishnamurthy, Dudík, ICML 2020, arXiv:1907.09623).**
Method: directly *shrink* the importance weights to minimize an MSE bound, yielding a tunable family (weight clipping, the new shrinkage estimator, and the first shrinkage estimator for combinatorial actions) that beats plain DR in finite samples. **INFERENCE:** this is the class of estimator Threshold should default to — it explicitly optimizes the finite-sample bias/variance tradeoff a gate lives or dies on.

**Recent — MIPS / OPE for large action spaces (Saito & Joachims, ICML 2022, arXiv:2202.06317).**
Method: when there are many actions, IPS-style weights degrade catastrophically; MIPS instead reweights by the marginal distribution of **action embeddings** (unbiased if the embedding mediates the action's entire effect on reward), sharply cutting variance. **INFERENCE:** Rokt's offer catalog is a large, changing action space, so an embedding-based estimator is the realistic path — plain IPS over raw offer IDs would be uselessly noisy.

**Tooling — Open Bandit Dataset & Pipeline (Saito et al., NeurIPS 2021 D&B, arXiv:2008.07146).**
An open Python library (`obp`) plus a real logged-bandit dataset from ZOZOTOWN that lets you benchmark IPS/SNIPS/DR/DR-shrinkage/MIPS against each other reproducibly. **INFERENCE:** Threshold can be built *directly on top of, or benchmarked against,* `obp` — it is the closest thing to an industry-standard OPE reference implementation, which is a credibility multiplier for a portfolio project.

**How this applies to Rokt's Transaction Moment:**
Rokt already logs propensity-weighted decisions and proves incrementality via holdouts; OPE is the pre-holdout screen. **HYPOTHESIS:** a policy that looks like a regression under DR-shrinkage OPE should never reach a live holdout — Threshold's value proposition is to catch that offline, saving experiment budget and protecting revenue. The gate should also report an **overlap/effective-sample-size diagnostic** and refuse to certify when the candidate policy strays outside logged support (the positivity assumption fails) rather than emit a confidently-wrong number.

**Synthetic-data demonstrable?** Yes — this is the *ideal* synthetic demo. Define a known ground-truth reward, generate logs under a known logging policy (so true propensities and the true value of any evaluation policy are both computable), then show IPS vs SNIPS vs DR vs DR-shrinkage estimates converging to (or diverging from) the *known* true value, with honest confidence intervals. You can inject distribution shift and watch which estimators break — a compelling, self-contained artifact.

---

## Area 3 — Uplift / CATE / persuadables modeling

The point: don't rank users by *who converts*, rank by *who converts because of the offer* (the persuadables). This is CATE = E[reward | treated] − E[reward | not treated], conditional on context.

**Seminal — Metalearners: S/T/X-learner (Künzel, Sekhon, Bickel, Yu, PNAS 2019, arXiv:1706.03461).**
Method: repurpose *any* supervised learner into a CATE estimator — S-learner (one model with treatment as a feature), T-learner (separate treated/control models), and the paper's **X-learner**, which imputes individual treatment effects and is efficient when treatment groups are very unbalanced. The X-learner is the go-to when the treated (offer-shown) group is small relative to control — common in incrementality setups with large holdouts.

**Seminal — Causal forest (Wager & Athey, JASA 2018, arXiv:1510.04342).**
Method: a random-forest variant with "honest" splitting (one subsample chooses splits, another estimates leaf effects) that is pointwise-consistent for the true treatment effect and yields asymptotically normal estimates *with confidence intervals*. The confidence-interval property matters: it lets you say not just "this segment is persuadable" but "and here's the uncertainty."

**Recent — DragonNet (Shi, Blei, Veitch, NeurIPS 2019, arXiv:1906.02120).**
Method: a three-headed neural net that predicts propensity and both potential outcomes from a shared representation, plus "targeted regularization" that gives it near-optimal asymptotic (double-robust-flavored) properties out of the box. It is the deep-learning entry point to CATE and pairs naturally with the DR ideas in Area 2.

**Recent — Deep Uplift benchmark (Liu et al., 2024, arXiv:2406.00335).**
Method: a systematic benchmark of deep uplift models for online marketing, standardizing datasets/metrics (e.g., Qini/AUUC) and comparing representation-balancing approaches (EUEN, DESCN, TARNet-style nets, etc.). **INFERENCE:** this is the current "what actually works at scale" reference for uplift in exactly Rokt's advertising/marketing setting, and its evaluation metrics (Qini curve, AUUC) are what a Rokt-facing project should report.

**How this applies to Rokt's Transaction Moment:**
**INFERENCE:** the offer worth showing is the one with the highest *incremental* expected revenue for this specific checkout, i.e., the argmax of a CATE model over candidate offers — not the highest predicted conversion. **HYPOTHESIS:** uplift ranking is what lets Rokt honestly claim incrementality-proven revenue rather than taking credit for conversions that would have happened anyway; CATE is the value signal that feeds both the bandit's reward (Area 1) and the "show nothing" decision (Area 7).

**Synthetic-data demonstrable?** Yes. Simulate potential outcomes Y(0) and Y(1) per user (so true CATE is known), fit S/T/X-learner + causal forest + DragonNet, and score them on Qini/AUUC and on error against the *known* CATE. Because you control the DGP you can plant explicit persuadable / sure-thing / lost-cause / sleeping-dog segments and show which learner recovers them.

---

## Area 4 — Incrementality measurement & experiment design

The ground truth that OPE (Area 2) must ultimately agree with. Rokt's differentiator is holdout-proven, incremental revenue — so the measurement machinery is core, not peripheral.

**Seminal — CUPED (Deng, Xu, Kohavi, Walker, WSDM 2013).**
Method: use pre-experiment data (a covariate correlated with the outcome but independent of treatment) to subtract off predictable variance from the metric, so the same experiment reaches significance with far fewer samples. CUPED is the single most widely deployed variance-reduction technique in industry A/B testing — it makes small, real effects detectable inside a fixed traffic budget.

**Seminal — Geo experiments (Vaver & Koehler, Google, 2011).**
Method: randomize *geographic regions* (not users) to treatment/control and use geo-targeted delivery, then estimate the incremental effect via regression — useful when user-level randomization is impossible (privacy, cross-device, media buys). Open-source R implementation exists (`GeoexperimentsResearch`).

**Seminal — Ghost Ads (Johnson, Lewis, Nubbemeyer, JMR 2017).**
Method: instead of showing control users a PSA, *identify* the counterfactual control users who *would have been* shown the ad in a real-time auction, so exposed and control groups are matched on intent; the "predicted ghost ad" variant runs at scale (the paper reports **>100M predicted ghost ads/day**). This is the cleanest way to measure ad incrementality on modern optimized delivery platforms — directly relevant to a checkout-offer auction.

**Recent — MLRATE (Guo et al., NeurIPS 2021, arXiv:2106.07263).**
Method: CUPED's ML-powered successor — use an arbitrary ML model's prediction of the outcome as the adjustment covariate, with cross-fitting to avoid overfitting bias, provably no worse than difference-in-means and much better when predictions are good. The paper reports **>70% lower variance than difference-in-means on 48 Facebook A/A metrics** (paper's own number). **INFERENCE:** for Rokt, MLRATE-style adjustment means holdout experiments can certify smaller revenue lifts faster — directly compounding the value of Threshold's offline screen.

**How this applies to Rokt's Transaction Moment:**
**INFERENCE:** Threshold's offline OPE estimate and the online holdout must be reconciled — a mature version of the project would report both and flag disagreement (OPE says +X%, holdout says +Y%), which is exactly the kind of measurement-integrity story Rokt cares about. **INFERENCE:** ghost-ads-style counterfactual logging is what makes the logged propensities in Area 2 trustworthy in the first place.

**Synthetic-data demonstrable?** Yes. Simulate a metric with a known treatment effect plus a pre-period covariate; show that plain difference-in-means, CUPED, and an MLRATE-style adjusted estimator all recover the true effect but with shrinking confidence intervals — a clean variance-reduction demo. Geo/ghost-ad designs can be illustrated on simulated region- or auction-level data.

---

## Area 5 — Real-time / sequential recsys for checkout-moment personalization

**Seminal — SASRec (Kang & McAuley, ICDM 2018, arXiv:1808.09781).**
Method: a self-attention (Transformer-style) model over a user's action history that adaptively weights past items to predict the next one, capturing long-range dependencies on dense histories and recent-activity focus on sparse ones. It is an order of magnitude more efficient than the CNN/RNN sequence models it replaced — the reference architecture for sequential recommendation. *(BERT4Rec, CIKM 2019, is the well-known bidirectional-masking sibling.)*

**Recent — HSTU / Generative Recommenders (Zhai et al., Meta, ICML 2024, arXiv:2402.17152).**
Method: reframes recommendation as *sequential transduction* (generative next-action prediction) with a new attention architecture (HSTU) built for high-cardinality, non-stationary streaming data. Paper's own numbers: **up to 65.8% NDCG over baselines**, **5.3×–15.2× faster than FlashAttention2 Transformers on 8192-length sequences**, and **+12.4% in online A/B tests** at 1.5T parameters. This is the current frontier of large-scale industrial recsys.

**How this applies to Rokt's Transaction Moment:**
**INFERENCE:** the checkout moment has a short but information-rich session sequence (browse → cart → checkout), so a compact sequential encoder is a natural candidate-generator/context-encoder feeding the bandit in Area 1. **HYPOTHESIS:** full generative-recommender scale (HSTU) is overkill for a single-offer checkout slot and its latency/infra cost likely conflicts with a sub-200ms budget — the *ideas* (sequence context, efficient attention) transfer even if the trillion-parameter model does not. Be honest about this in the portfolio: cite HSTU as state-of-the-art awareness, not as "what I'd deploy."

**Synthetic-data demonstrable?** Partially. You can train SASRec on a synthetic or public sequential dataset (e.g., MovieLens-style) and show next-item ranking metrics (HR@k, NDCG@k). HSTU-scale results are *not* reproducible without industrial infra — represent it as literature awareness, and demo the small model.

---

## Area 6 — LLM evaluation & guardrails for production

Framing for Rokt: an LLM might *enrich copy* (headline, tone) but must **never** touch money, eligibility, or the offer-selection decision. So the relevant literature is evaluation harnesses + guardrails + hallucination detection, not "put an LLM in the loop."

**Seminal (eval harness) — HELM (Liang, Bommasani, Lee et al., 2022, arXiv:2211.09110).**
Method: a standardized, multi-metric benchmark that evaluates models across many scenarios on 7 metrics (accuracy, calibration, robustness, fairness, bias, toxicity, efficiency) rather than accuracy alone. The lesson for production is process, not leaderboard: define scenarios and desiderata *before* trusting a model, and measure the non-accuracy axes (bias, toxicity, calibration) that matter for customer-facing copy.

**Recent — SelfCheckGPT (Manakul, Liusie, Gales, EMNLP 2023, arXiv:2303.08896).**
Method: a zero-resource, black-box hallucination detector — sample the model several times for the same prompt; if the samples agree the content is likely grounded, if they diverge/contradict it is likely hallucinated, requiring no external DB or logits. **INFERENCE:** for LLM-generated offer copy, a self-consistency check is a cheap automated gate to catch fabricated claims (fake discounts, invented product attributes) before they reach a shopper.

**Recent — NeMo Guardrails (Rebedea et al., EMNLP 2023 Demo, arXiv:2310.10501).**
Method: an open toolkit that adds *programmable rails* to an LLM app — user-defined dialogue/topic/safety rules (expressed in a modeling language, Colang) enforced at runtime independent of the underlying model. **INFERENCE:** this is the concrete mechanism for the hard constraint "LLM may phrase, but rails forbid it from stating prices, eligibility, or anything that alters the decision" — the copy path is sandboxed away from the money path.

**How this applies to Rokt's Transaction Moment:**
**HYPOTHESIS:** the defensible architecture is a strict separation — deterministic, auditable code owns eligibility/pricing/selection (Areas 1–4), while any LLM sits *outside* that boundary generating only presentation text, wrapped in guardrails (NeMo-style) and screened by a hallucination check (SelfCheckGPT-style) with a template fallback on failure. This mirrors Pavan's deterministic-core / idempotency / audit strengths and is a strong story: *AI where it helps, never where it can silently cost money.*

**Synthetic-data demonstrable?** Yes, lightweight. Build a small harness that generates offer copy, runs a self-consistency check, and enforces a rail that rejects any output containing a price/eligibility claim, falling back to a safe template — demonstrable end-to-end without touching a real offer system.

---

## Area 7 — Fatigue / frequency capping / "show nothing" optimization

The honest caveat up front: this area has the **thinnest peer-reviewed literature** of the seven — much of the practice lives in industry blogs and patents, not archival papers. Present it as an area where Pavan's engineering judgment fills a genuine research gap, and cite carefully.

**Closest seminal fit — Fatigue-Aware Ad Creative Selection (Moriwaki, Fujita, Yasui, Hoshino, 2019, arXiv:1908.08936).**
Method: a contextual bandit for creative selection that explicitly models *wear-in / wear-out* (an offer's effectiveness rises then decays with repeated exposure) via a sequential choice model where a user can accept, skip, or **abandon** the platform. The "abandon" outcome is the formal hook for "showing the wrong/too-frequent offer has a real cost" — which is what justifies a "show nothing" action.

**Recent — Frequency capping under k-anonymity (2025, arXiv:2501.04882).**
Method: formalizes reach measurement, optimization, and frequency capping in targeted advertising, including *probabilistic discounting* (a soft, probabilistic version of a hard frequency cap) under privacy constraints. Relevant as the modern, privacy-aware framing of "how often is too often."

**The "show nothing" idea (conceptual, honestly labelled).**
There is no single canonical paper for "the optimal action is no offer." **INFERENCE:** it falls out naturally from Area 3 — if the best available offer's *uplift* (CATE) is below zero (a sleeping-dog / annoyance effect) or below the fatigue-adjusted cost of using the slot, the value-maximizing action is the null/abstain arm. This connects fatigue modeling (this area) to uplift (Area 3) and to the bandit's action set (Area 1, add a "no-offer" arm with its own reward).

**How this applies to Rokt's Transaction Moment:**
**HYPOTHESIS:** a checkout offer slot has a non-trivial cost to fire — user annoyance, fatigue, erosion of the merchant's trust — so the correct objective is *incremental value minus fatigue cost*, and sometimes the argmax is "show nothing." Modeling the null action explicitly is both a UX and an incrementality-integrity feature, and it is exactly the kind of "restraint as a first-class decision" story that reads as senior judgment.

**Synthetic-data demonstrable?** Yes. Simulate per-user offer-response with an exposure-count fatigue decay and a negative-uplift ("sleeping dog") segment; add a null arm to the bandit and show that a fatigue+uplift-aware policy (a) caps repeat exposures and (b) chooses "no offer" for negative-uplift users, beating an always-show baseline on cumulative incremental reward.

---

## Cross-cutting synthesis (for the Builder page narrative)

1. **Threshold's spine is Area 2.** OPE (DR → DR-shrinkage → MIPS) is the one place to go deepest; everything else orbits it. The `obp` library (arXiv:2008.07146) is a credible foundation/benchmark.
2. **The full loop is coherent and demonstrable on synthetic data end-to-end:** bandit policy (A1) → optimize incremental value via uplift (A3) → screen offline with OPE (A2) → confirm with variance-reduced holdout (A4) → know when to show nothing (A7), with LLM copy safely sandboxed (A6). Every stage above is individually demonstrable on a simulator with a *known* ground truth — which is the honest, verifiable way to prove the ideas without Rokt's data.
3. **Honesty differentiators to keep:** flag positivity/overlap failures instead of emitting confident-but-wrong OPE numbers; reconcile OPE against holdouts rather than replacing them; keep LLMs off the money path; and treat "show nothing" as a real action. These are the judgment signals that distinguish an engineer from a model-dropper.
