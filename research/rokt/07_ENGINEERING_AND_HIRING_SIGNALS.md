# 07 — Rokt Engineering, Culture & Hiring Signals

**Agent 7 — Engineering, Culture & Hiring Researcher**
**Retrieval date:** 2026-07-18
**Purpose:** Determine what a proof-of-work prototype must DEMONSTRATE to resonate with Rokt's engineering hiring bar and culture, especially for a **Junior Software Engineer (NYC)**. Grounded in public evidence.

**Evidence labels:** `[VERIFIED-PUBLIC]` = direct quote/claim from a Rokt-owned or reputable public page · `[INFERENCE]` = reasoned from verified evidence · `[HYPOTHESIS]` = plausible but unverified.

---

## 1. Rokt's Stated Values (verified wording)

Rokt publishes **eight core values**. Exact wording captured from rokt.com/company/culture (retrieved 2026-07-18): `[VERIFIED-PUBLIC]`

| # | Value | Exact stated definition |
|---|-------|------------------------|
| 1 | **Start with the customer** | "We work backwards from the customer, where value is created when we unlock relevance." |
| 2 | **Own the outcome** | "We're all owners and take accountability for delivering results." |
| 3 | **Bias for action** | "We're driven by progress, understanding most decisions are reversible and better ways are found by doing." |
| 4 | **Conquer new frontiers** | "We're curious explorers always looking for new and better ways." |
| 5 | **Raise the bar** | "We look to stretch ourselves and set higher standards." |
| 6 | **Smart with humility** | "We empower through transparency, robustly challenge and never let egos get in the way." |
| 7 | **Better together** | "We love what we do, enjoy the ride and thrive knowing great things come from working together." |
| 8 | **Force for good** | "We fight for a fairer world, actively investing in our people, communities and culture to unlock possibilities." |

> **Note on the task's candidate list:** The task pre-supplied values "Start with the customer / Own the outcome / Bias for action / Conquer new frontiers / Raise the bar / Smart with humility / Better together." All seven are **confirmed verbatim**. There is an **eighth verified value not in the task list: "Force for good."** `[VERIFIED-PUBLIC]`

---

## 2. The Junior Software Engineer (NYC) Role — Actual Responsibilities & Expectations

Source: Rokt careers posting (apply.workable.com/rokt/j/783A754DDB) and mirrored Built In / Welcome to the Jungle listings, retrieved 2026-07-18. `[VERIFIED-PUBLIC]`

**Framing:** "This is an entry-level/early career role designed to help you grow as a **Builder**" — Rokt calls engineers "Builders," not "developers." You "gain hands-on experience building a diversity of services, from internal tools through to Rokt's internet scale production systems," and "build broad knowledge and experience across systems, software, data, and data science."

**Key responsibilities (verified):**
- **Design & Build Innovative Products** — "leveraging your computer science fundamentals and **AI tooling** to create & improve intelligent, personalized ecommerce experiences."
- **Accelerate Development with AI** — "Leverage AI tools and automation to speed up coding, testing, and deployment, so you and other builders can focus on creative problem-solving and quality."
- **Full-Stack Ownership** — work across the entire product lifecycle from ideation through continuous improvement.
- **Collaboration** — partner with product managers, designers, and engineers on AI-driven solutions.
- **Optimize & Scale** — "identify performance bottlenecks and use data insights to refine interfaces and optimize algorithms."
- **Revenue Growth** — develop features "that directly drive growth of the business."

**Desired traits (verified):** AI-enthusiast and quick learner; problem solver with **first-principles thinking**; **entrepreneurial mindset with ownership mentality**; collaborative team player; driven and results-oriented.

**Compensation (NYC, verified):** Target total comp **$90,000–$170,000** (fixed salary $85,000–$150,000 + employee equity grant + benefits). All Rokt'stars have equity. In-office role (NYC); Rokt operates ~4 days in office with limited remote flexibility.

---

## 3. Recurring Themes Across Roles & Culture Material

`[VERIFIED-PUBLIC]` unless noted.

- **"Builder" / "Builder DNA"** — Rokt's central engineering identity. Defined publicly as "**a bias for action, ownership, humility, and the courage to raise the bar**." Builders are "curious, accountable, and driven to make ecommerce smarter and more human."
- **AI as co-pilot / AI-first development** — Rokt explicitly describes **AI as its "co-pilot."** Company framing: "**AI is embraced as a force multiplier, not a replacement for ownership or creativity**," with all employees expected to be **AI-literate**. The JSE role bakes AI into daily coding, testing, and deployment. `[VERIFIED-PUBLIC]`
- **High talent density / "hire hard"** — Rokt publishes a blog, *"Why We Hire Hard."* The **Bar Raiser** (a senior leader from a different team) exists to "ensure each new hire raises, not just meets, our talent density" and **can veto** offers to "prevent panic hiring and reinforce the culture." `[VERIFIED-PUBLIC]`
- **Ownership + measurable impact** — success is "meaningful ownership and impact"; "You want to drive outcomes and see the direct impact of your work." Features should "directly drive growth of the business." `[VERIFIED-PUBLIC]`
- **Win or Learn mindset** — a "**Win or Learn**" culture that "rewards progress, encourages transparency, and strengthens how teams solve complex problems." Ties to "Bias for action" (most decisions reversible). `[VERIFIED-PUBLIC]`
- **Learning agility over static knowledge** — they screen for "your ability to stay resourceful as things shift, learn quickly, and adapt with confidence." `[VERIFIED-PUBLIC]`
- **Flat, fast, autonomous** — "flat structure, wide spans of control, and minimal hierarchy," fast decisions, rapid internal mobility. `[VERIFIED-PUBLIC]`
- **Rokt'athon** — a 24-hour company-wide hackathon; employees vote on favorite ideas for implementation. Signals reward for shipping working prototypes fast. `[VERIFIED-PUBLIC]`
- **Career ladder + coaching + feedback** — transparent, competency-based career ladder shared company-wide; **LevelUp** training program, mentorship, and "consistent feedback loops." `[VERIFIED-PUBLIC]` (Specific "6-week feedback" cadence: **not verified in public sources** — `[HYPOTHESIS]`; treat any 6-week claim as unconfirmed.)
- **Scale context** — Rokt "powers 10 billion+ transactions annually." Performance and scale literacy matter. `[VERIFIED-PUBLIC]`
- **Hiring stages (verified):** CCAT cognitive aptitude test (15 min) → one-way video interview → Bar Raiser (values) → offer. Screens for **agility** ("process information, adapt, and think under pressure"), **intentionality**, and **autonomy fit**. `[VERIFIED-PUBLIC]`

---

## 4. DELIVERABLE — What a Prototype Must SHOW per Value/Expectation

For each value, concrete, demonstrable prototype evidence. `[INFERENCE]` (grounded in the verified values/role above).

| Value / Expectation | What the prototype should concretely SHOW |
|---|---|
| **Start with the customer** | A clearly named end-user + a relevance/personalization mechanism ("the moment that matters"). Show a before/after of user experience; a one-line problem statement written from the customer's POV; a metric that proxies customer value (conversion, relevance, time-to-value). |
| **Own the outcome** | End-to-end ownership visible: a **deliberate failure path + graceful recovery + audit trail/log**. Error handling, retries, fallbacks, and a "what I'd do next / known limitations" section. Show you own the whole lifecycle, not just the happy path. |
| **Bias for action** | Ship something working over something perfect. A live/runnable demo, a short build-log or commit history showing rapid iteration, and evidence you made reversible calls fast and documented the trade-off. |
| **Conquer new frontiers** | Use a technique/tool you hadn't before; a short "what I learned in N hours" note. First-principles reasoning about an approach rather than copy-paste boilerplate. |
| **Raise the bar** | Tests, CI, linting, a README, performance numbers. Go one notch beyond "works": measure it, benchmark it, and state the standard you held yourself to. |
| **Smart with humility** | An honest "trade-offs & what I'd change" section; cite where AI or a source helped; invite critique ("play the ball, not the person"). Data-backed decisions over opinion. |
| **Better together** | Clean, readable code others can extend; docs/comments enabling a teammate to run it in minutes; clear commit messages. Show it's built to be handed off. |
| **Force for good** | (Optional differentiator) Note fairness/accessibility/privacy considerations, or a positive-sum framing of who benefits. |
| **AI as co-pilot (role expectation)** | Show AI **in the workflow**, not as a gimmick: prompt/agent scaffolding, AI-assisted tests or codegen, and a note on where you *verified/overrode* the AI. Demonstrates AI-literacy **plus** ownership of correctness. |
| **Impact / drives business growth** | Tie the prototype to a measurable outcome (a KPI, funnel step, or revenue proxy). Instrument it — show the metric moving. |
| **Scale literacy** | Acknowledge internet-scale realities: latency budget, a load consideration, caching, or a note on how it would behave at 10B+ events. |
| **Learning agility** | A visible learning artifact: a decision log, "assumptions I revised," or a pivot mid-build. |

---

## 5. Interview-Conversation Hooks a Strong Prototype Should Create

`[INFERENCE]` — design the prototype so these questions naturally arise:

1. **"Walk me through a decision you reversed."** — Have a visible pivot / decision log ready (Bias for action + Win or Learn).
2. **"What broke, and how did you recover?"** — The intentional failure + recovery + audit trail becomes the story (Own the outcome).
3. **"Where did AI help, and where did you overrule it?"** — Concrete example of verifying/correcting AI output (AI co-pilot + Smart with humility).
4. **"How would this hold up at 10B transactions?"** — A latency/scale note invites a systems-design conversation.
5. **"How does this create customer value?"** — A crisp customer-POV problem statement + metric (Start with the customer).
6. **"What would you do with two more days?"** — An honest limitations/roadmap section (Raise the bar + humility).
7. **"How would a teammate extend this?"** — README + clean handoff demonstrates Better together.
8. **"Why this problem?"** — Shows intentionality (a screened Bar-Raiser signal).

**Highest-signal prototype attributes (if forced to prioritize):**
1. Working, runnable demo (Bias for action) — beats a polished spec.
2. Visible failure → recovery → audit trail (Own the outcome) — the single most differentiating engineering signal.
3. AI genuinely in the loop **with human verification** (matches the exact JSE mandate).
4. A measurable outcome/metric tied to customer or business value.
5. Honest trade-offs / limitations section (Smart with humility) — Bar Raisers reward this.

---

## Sources (retrieved 2026-07-18)

- Rokt — Culture & Values (eight values, exact wording; AI co-pilot; Rokt'athon): https://www.rokt.com/company/culture `[VERIFIED-PUBLIC]`
- Rokt — Careers (Builder culture, Bar Raiser, learning & development): https://www.rokt.com/company/careers `[VERIFIED-PUBLIC]`
- Rokt — Junior Software Engineer posting (responsibilities, AI mandate, comp): https://apply.workable.com/rokt/j/783A754DDB `[VERIFIED-PUBLIC]`
- Built In — Junior Software Engineer (mirrored full JD): https://builtin.com/job/junior-software-engineer/9074165 `[VERIFIED-PUBLIC]`
- Rokt Blog — "Why We Hire Hard: A Transparent Look at the Rokt Candidate Experience" (Bar Raiser, hiring stages, Builder DNA): https://www.rokt.com/blog/why-we-hire-hard-a-transparent-look-at-the-rokt-candidate-experience `[VERIFIED-PUBLIC]`
- Rokt Blog — "What is it Like to Work at Rokt? A Candid Look at Our Culture" (Win or Learn, learning agility, ownership): https://www.rokt.com/blog/what-is-it-like-to-work-at-rokt-a-candid-look-at-our-culture `[VERIFIED-PUBLIC]`
- Built In — Rokt Company Culture & Values FAQ (values list, flat structure, AI force-multiplier, pair programming, career frameworks): https://builtin.com/company/rokt/faq/culture-values `[VERIFIED-PUBLIC]`
- Rokt Blog — "Views on our Values: There's no 'I' in Rokt" (Smart with humility framing): https://www.rokt.com/blog/rokt-values-smart-with-humility `[VERIFIED-PUBLIC — page returned limited detail on fetch]`

---

## Freshness / Confidence

- **Freshness:** All primary sources are current Rokt-owned pages or active 2026 job listings, retrieved 2026-07-18. The JSE posting was live/recently posted at retrieval.
- **Confidence — HIGH:** The eight values (verbatim), "Builder" identity, AI-as-co-pilot mandate in the JSE role, Bar Raiser veto mechanism, Rokt'athon, and flat/fast/high-talent-density culture. All corroborated by Rokt-owned pages.
- **Confidence — MEDIUM:** Specific tooling (Google Chat/Asana/Jira, pair programming, async-first) and "LevelUp"/career-ladder specifics — from Built In aggregation of Rokt-supplied content; likely accurate but secondary.
- **Confidence — LOW / UNVERIFIED:** A specific **"6-week feedback"** cadence — not found in public sources; do not assert it. `[HYPOTHESIS]`
- **Caveat:** Section 4 & 5 (prototype prescriptions and interview hooks) are `[INFERENCE]` — analytically derived from verified values/role, not quoted from Rokt.
