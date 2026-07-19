"use client";

import { useState, type ReactNode } from "react";
import { ClipReveal, MaskText, Reveal, StaggerGroup } from "./anim";
import {
  BuildItem,
  BuildList,
  Cite,
  Disclosure,
  HonestyTag,
  SceneDepth,
  TaggedNote,
} from "./depth";
import {
  CollaborationLoopScene,
  DecisionGateScene,
  IncrementalityScene,
  LifecycleTimelineScene,
  ScalingPipelineScene,
  ToolConstellationScene,
} from "./illustrations";

/* ────────────────────────────────────────────────────────────────────────────
   The six "What You'll Do" scenes. Each: a poetic one-liner (masked reveal), a
   compact Proof chip-row of real projects, a short "Executable idea for Rokt",
   an interactive AI-tools row (each tool → a one-line "how I'd use it"), and an
   original animated workflow illustration. Concise copy — the visual carries it.
   Nothing fabricated: real projects, real tools, qualitative diagrams only.
   ──────────────────────────────────────────────────────────────────────────── */

type Tool = { name: string; how: string };

// ── AI-tools row: chips reveal a one-line "how I'd use it" (tap or hover) ─────
function ToolRow({ label, tools }: { label: string; tools: Tool[] }) {
  const [active, setActive] = useState(0);
  const current = tools[active] ?? tools[0];
  return (
    <div className="mt-6">
      <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-muted">{label}</p>
      <div className="mt-2 flex flex-wrap gap-2">
        {tools.map((t, i) => {
          const on = i === active;
          return (
            <button
              key={t.name}
              type="button"
              aria-pressed={on}
              onClick={() => setActive(i)}
              onMouseEnter={() => setActive(i)}
              className={
                "inline-flex min-h-[44px] items-center rounded-full border px-3 py-1 font-mono text-xs transition-[color,background-color,border-color,transform] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal active:scale-[0.97] sm:min-h-0 " +
                (on
                  ? "border-teal/50 bg-teal/10 text-teal"
                  : "border-border bg-surface-2/50 text-muted hover:text-text")
              }
            >
              {t.name}
            </button>
          );
        })}
      </div>
      <p
        aria-live="polite"
        className="mt-3 min-h-[2.5rem] rounded-lg bg-surface-2/40 px-3 py-2 text-sm leading-relaxed text-text"
      >
        {current ? (
          <>
            <span className="font-semibold text-teal">{current.name}: </span>
            {current.how}
          </>
        ) : null}
      </p>
    </div>
  );
}

// ── Proof chip-row + short proof line ────────────────────────────────────────
function ProofRow({ projects, text }: { projects: string[]; text: string }) {
  return (
    <div className="mt-5">
      <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-teal">Proof</p>
      <div className="mt-2 flex flex-wrap gap-2">
        {projects.map((p) => (
          <span
            key={p}
            className="thr-edge inline-flex items-center rounded-md bg-surface-2/60 px-2.5 py-1 font-mono text-xs font-semibold text-text"
          >
            {p}
          </span>
        ))}
      </div>
      <p className="mt-3 text-sm leading-relaxed text-muted">{text}</p>
    </div>
  );
}

function ExecutableIdea({ children }: { children: ReactNode }) {
  return (
    <div className="mt-5 rounded-xl border border-offer-blue/30 bg-offer-blue/[0.06] p-4">
      <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-offer-blue">
        Executable idea for Rokt
      </p>
      <p className="mt-1.5 text-sm leading-relaxed text-text">{children}</p>
    </div>
  );
}

function SceneRule({ n, label }: { n: string; label: string }) {
  return (
    <div className="flex items-center gap-3">
      <span className="font-mono text-sm font-semibold text-teal">{n}</span>
      <span aria-hidden className="h-px flex-1 bg-border" />
      <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-muted">{label}</span>
    </div>
  );
}

function IllustrationFrame({ children }: { children: ReactNode }) {
  return (
    <div className="holo-card rounded-2xl p-5 sm:p-6">
      <div className="mx-auto max-w-lg">{children}</div>
    </div>
  );
}

type SceneData = {
  id: string;
  n: string;
  label: string;
  headline: { text: string; className?: string }[];
  proof: { projects: string[]; text: string };
  idea: ReactNode;
  tools: { label: string; items: Tool[] };
  illustration: ReactNode;
  side: "left" | "right";
  depth?: ReactNode;
};

// ── One split scene (text + illustration) ────────────────────────────────────
function SplitScene({ s }: { s: SceneData }) {
  const text = (
    <div>
      <SceneRule n={s.n} label={s.label} />
      <MaskText
        as="h3"
        id={`${s.id}-h`}
        className="mt-4 max-w-xl text-2xl font-semibold leading-[1.12] tracking-tight sm:text-3xl"
        segments={s.headline}
      />
      <ProofRow projects={s.proof.projects} text={s.proof.text} />
      <ExecutableIdea>{s.idea}</ExecutableIdea>
      <ToolRow label={s.tools.label} tools={s.tools.items} />
    </div>
  );
  const art = (
    <ClipReveal>
      <IllustrationFrame>{s.illustration}</IllustrationFrame>
    </ClipReveal>
  );
  return (
    <section
      id={s.id}
      aria-labelledby={`${s.id}-h`}
      className="mx-auto max-w-6xl scroll-mt-24 px-4 py-14 sm:px-6 sm:py-20"
    >
      <div className="grid items-center gap-8 lg:grid-cols-2 lg:gap-14">
        {s.side === "left" ? (
          <>
            <div className="order-2 lg:order-1">{art}</div>
            <div className="order-1 lg:order-2">{text}</div>
          </>
        ) : (
          <>
            <div className="order-1">{text}</div>
            <div className="order-2">{art}</div>
          </>
        )}
      </div>
      {s.depth}
    </section>
  );
}

// ── Portfolio evidence grid (scene 3) ────────────────────────────────────────
type Evidence = { name: string; shipped: string; patterns: string[] };

const PORTFOLIO: Evidence[] = [
  {
    name: "Threshold",
    shipped: "A deterministic policy-change safety gate for the Transaction Moment.",
    patterns: ["deterministic core", "transactional outbox", "tamper-evident audit", "38 tests"],
  },
  {
    name: "ShelfTrace",
    shipped: "A retail pricing execution-integrity control plane.",
    patterns: ["cross-surface reconciliation", "canary containment", "plausibility guard", "Postgres concurrency tests"],
  },
  {
    name: "Dreamship",
    shipped: "An order-exception & launch-reliability platform.",
    patterns: ["idempotency at the money boundary", "immutable audit", "dead-letter + replay", "row-locking", "120 backend tests"],
  },
  {
    name: "Krowd Guide",
    shipped: "Real-time AI operational intelligence.",
    patterns: ["event-driven pipelines", "low-latency inference", "structured outputs + confidence", "human-in-the-loop"],
  },
  {
    name: "100 Miles of Summer",
    shipped: "A customer fitness platform across connected integrations.",
    patterns: ["idempotency", "dedup", "reconciliation", "account-state correctness"],
  },
  {
    name: "NexusWatch",
    shipped: "Invoice anomaly review with a human in the loop.",
    patterns: ["review queue", "per-field confidence", "layered OCR intake"],
  },
  {
    name: "Efficast",
    shipped: "A verified-recovery agent.",
    patterns: ["hash-chained + HMAC audit", "tamper localization", "legal-transition state machine", "LLM proposes, never actuates"],
  },
  {
    name: "Fan Flow",
    shipped: "Scenario/persona fixtures that double as tests + a live debug toolbar.",
    patterns: ["fixtures-as-tests", "debug toolbar", "“why this decision” panel"],
  },
];

function FullStackScene() {
  return (
    <section
      id="scene-fullstack"
      aria-labelledby="scene-fullstack-h"
      className="mx-auto max-w-6xl scroll-mt-24 px-4 py-14 sm:px-6 sm:py-20"
    >
      <SceneRule n="03" label="Full-stack product ownership" />
      <MaskText
        as="h3"
        id="scene-fullstack-h"
        className="mt-4 max-w-2xl text-2xl font-semibold leading-[1.12] tracking-tight sm:text-3xl"
        segments={[{ text: "Cradle to grave — " }, { text: "including the unglamorous parts.", className: "gradient-text" }]}
      />
      <Reveal delay={0.05}>
        <p className="mt-4 max-w-2xl text-sm leading-relaxed text-muted">
          Eight products, each shipped end-to-end: backend, frontend, tests, demo. Migrations,
          observability, rollback — not just the happy path. Same spine every time.
        </p>
      </Reveal>

      {/* the shared stack */}
      <Reveal delay={0.1}>
        <div className="mt-5 flex flex-wrap gap-2">
          {["FastAPI", "Next.js", "Postgres", "Redis", "Kafka", "Docker", "GitHub Actions", "OpenTelemetry"].map(
            (t) => (
              <span
                key={t}
                className="thr-edge inline-flex items-center rounded-md bg-surface-2/60 px-2.5 py-1 font-mono text-xs text-text"
              >
                {t}
              </span>
            ),
          )}
        </div>
      </Reveal>

      {/* lifecycle band */}
      <ClipReveal className="mt-8">
        <div className="holo-card rounded-2xl p-5 sm:p-6">
          <p className="mb-3 font-mono text-[11px] uppercase tracking-[0.18em] text-muted">
            The lifecycle I run — every time
          </p>
          <LifecycleTimelineScene />
        </div>
      </ClipReveal>

      <SceneDepth>
        <Disclosure label="How I'd build it — the feature lifecycle">
          <div className="mb-3 flex flex-wrap items-center gap-2">
            <HonestyTag kind="DESIGNED" />
            <span className="text-xs text-muted">machinery over a real seam</span>
          </div>
          <BuildList>
            <BuildItem>
              <strong className="text-text">Problem</strong> — a real seam (
              <code className="font-mono text-text">/placements/any</code>,{" "}
              <code className="font-mono text-text">PLACEMENT_FAILURE</code>).
            </BuildItem>
            <BuildItem>
              <strong className="text-text">Design</strong> — write the invariants first.{" "}
              <strong className="text-text">Build</strong> — FastAPI · Next · Postgres · Redis ·
              outbox · OTel. <strong className="text-text">Test</strong> — determinism / property,
              fail-closed proofs, real-DB concurrency.
            </BuildItem>
            <BuildItem>
              <strong className="text-text">Ship</strong> behind a flag, never touching
              checkout&apos;s critical path → <strong className="text-text">Measure</strong> with a
              Page Holdout (~5% control — report net-new, never a claimed lift) →{" "}
              <strong className="text-text">Recover</strong>: rollback, dead-letter drain, drift
              alert.
            </BuildItem>
          </BuildList>
          <TaggedNote kind="SHIPPED">
            Hard guardrail: checkout completion is never a KPI to trade — if treatment regresses it,
            the experiment auto-stops.
          </TaggedNote>
        </Disclosure>
      </SceneDepth>

      {/* evidence grid */}
      <StaggerGroup className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3" stagger={0.06}>
        {PORTFOLIO.map((e) => (
          <article key={e.name} className="holo-card flex h-full flex-col rounded-2xl p-5">
            <h4 className="text-base font-semibold text-text">{e.name}</h4>
            <p className="mt-1.5 flex-1 text-sm leading-relaxed text-muted">{e.shipped}</p>
            <div className="mt-3 flex flex-wrap gap-1.5">
              {e.patterns.map((p) => (
                <span
                  key={p}
                  className="inline-flex items-center rounded-md border border-teal/25 bg-teal/[0.06] px-2 py-0.5 font-mono text-[10px] text-teal"
                >
                  {p}
                </span>
              ))}
            </div>
          </article>
        ))}
      </StaggerGroup>
    </section>
  );
}

// ── Drive-revenue scene (full width, centered viz) ───────────────────────────
function RevenueScene() {
  return (
    <section
      id="scene-revenue"
      aria-labelledby="scene-revenue-h"
      className="mx-auto max-w-4xl scroll-mt-24 px-4 py-14 text-center sm:px-6 sm:py-20"
    >
      <div className="mx-auto max-w-2xl text-left">
        <SceneRule n="06" label="Drive revenue growth" />
      </div>
      <MaskText
        as="h3"
        id="scene-revenue-h"
        className="mx-auto mt-4 max-w-2xl text-2xl font-semibold leading-[1.12] tracking-tight sm:text-3xl"
        segments={[{ text: "Revenue is the point — " }, { text: "proven, not claimed.", className: "gradient-text" }]}
      />
      <div className="mx-auto mt-6 max-w-2xl text-left">
        <ProofRow
          projects={["Threshold"]}
          text="Helped generate revenue for pre-launch companies before the thing was even built; Threshold's whole thesis protects incremental revenue before a change can distort it."
        />
        <ExecutableIdea>
          Ship features that safely raise <strong className="text-text">incremental</strong> revenue —
          targeted at persuadables (uplift), gated by a real holdout. Never a claimed lift; always a
          measured one.
        </ExecutableIdea>
      </div>
      <ClipReveal className="mt-8">
        <div className="holo-card rounded-2xl p-6">
          <IncrementalityScene className="mx-auto max-w-xl" />
        </div>
      </ClipReveal>
      <div className="mx-auto mt-4 max-w-2xl text-left">
        <ToolRow
          label="AI tools I'd wield"
          tools={[
            { name: "causalml", how: "uplift modeling — target the persuadables, not the sure things." },
            { name: "scikit-uplift", how: "quick uplift baselines and evaluation curves before committing." },
            { name: "SNIPS / Doubly-Robust", how: "off-policy pre-screen that refuses on thin support — no false confidence." },
            { name: "holdout design", how: "the experiment that turns a claimed lift into a measured one." },
          ]}
        />
      </div>

      <div className="mx-auto mt-8 max-w-2xl text-left">
        <SceneDepth>
          <Disclosure label="The science — Threshold's academic spine">
            <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-teal">
              Off-policy evaluation lineage
            </p>
            <div className="mt-2 flex flex-wrap gap-2">
              <Cite name="Doubly-Robust" meta="Dudík et al. · ICML 2011 · arXiv:1103.4601" />
              <Cite name="SNIPS" meta="Swaminathan & Joachims · NeurIPS 2015" />
              <Cite name="DR-Shrinkage" meta="Su et al. · ICML 2020 · arXiv:1907.09623" />
              <Cite name="MIPS (large action spaces)" meta="Saito & Joachims · ICML 2022 · arXiv:2202.06317" />
              <Cite name="Open Bandit Pipeline" meta="Saito et al. · NeurIPS 2021 · arXiv:2008.07146" />
            </div>
            <p className="mt-4 font-mono text-[11px] uppercase tracking-[0.18em] text-teal">
              Uplift / persuadables — metric is Qini / AUUC, never accuracy
            </p>
            <div className="mt-2 flex flex-wrap gap-2">
              <Cite name="X-learner" meta="Künzel et al. · PNAS 2019 · arXiv:1706.03461" />
              <Cite name="Causal forest" meta="Wager & Athey · JASA 2018 · arXiv:1510.04342" />
              <Cite name="DragonNet" meta="Shi et al. · NeurIPS 2019 · arXiv:1906.02120" />
            </div>
            <p className="mt-4 font-mono text-[11px] uppercase tracking-[0.18em] text-teal">
              Incrementality machinery
            </p>
            <div className="mt-2 flex flex-wrap gap-2">
              <Cite name="CUPED" meta="Deng et al. · WSDM 2013" />
              <Cite name="Ghost Ads" meta="Johnson et al. · JMR 2017" />
              <Cite name="MLRATE" meta="Guo et al. · NeurIPS 2021 · arXiv:2106.07263" />
            </div>
            <TaggedNote kind="HYPOTHESIS">
              Honest gaps kept visible: HSTU generative recsys (arXiv:2402.17152) is state-of-the-art
              awareness, likely overkill for one checkout slot; the &ldquo;show-nothing&rdquo; /
              fatigue literature is genuinely thin (closest: arXiv:1908.08936) — engineering judgment
              leads there.
            </TaggedNote>
          </Disclosure>
          <Disclosure label="How I'd build it">
            <BuildList>
              <BuildItem>
                Uplift / CATE offline → an{" "}
                <strong className="text-text">OPE support-guard that refuses on thin support</strong>{" "}
                (<code className="font-mono text-text">ope.py</code>, <HonestyTag kind="SHIPPED" />:{" "}
                <code className="font-mono text-text">refuses_estimate=true</code> below{" "}
                <code className="font-mono text-text">MIN_ESS</code>).
              </BuildItem>
              <BuildItem>
                A <strong className="text-text">Page Holdout is the only causal proof</strong> (
                <code className="font-mono text-text">ADR-005</code>). A positive pre-screen ={" "}
                <em>eligible for a holdout</em>, never &ldquo;proven lift.&rdquo;
              </BuildItem>
            </BuildList>
            <TaggedNote kind="TO VALIDATE">
              Does Rokt expose logged action propensities? Without them only the deterministic guard
              is honest — which is exactly why the repo ships the guard, not a fake estimator.
            </TaggedNote>
          </Disclosure>
        </SceneDepth>
      </div>
    </section>
  );
}

// ── The five split/standard scenes' data (3 and 6 are custom above) ──────────
const SCENE_1: SceneData = {
  id: "scene-design",
  n: "01",
  label: "Design & build innovative products",
  headline: [{ text: "Start from the customer and a real seam — " }, { text: "then ship the whole thing.", className: "gradient-text" }],
  proof: {
    projects: ["Threshold"],
    text: "I read Rokt's own audience docs, found where a one-operator edit silently widens a missing-attribute audience, and built the whole safety gate end-to-end.",
  },
  idea: (
    <>
      A <strong className="text-text">right-moment, trust-aware Transaction-Moment layer</strong> —
      decide whether/when to place an offer (including &ldquo;show nothing&rdquo;), scoring net-new
      value minus a fatigue penalty; and loyalty-safe change control as Shopper Rewards grows.
    </>
  ),
  tools: {
    label: "AI tools I'd wield",
    items: [
      { name: "Claude Code", how: "agentic building — spec → engine → tests, with me steering the judgment." },
      { name: "Cursor", how: "fast in-editor iteration on the tricky, deterministic core." },
      { name: "v0", how: "scaffold the UI shell quickly, then hand-craft the parts that matter." },
      { name: "Open Bandit Pipeline", how: "a contextual-bandit / GBDT core for the decision itself." },
      { name: "Structured-output LLMs", how: "only at the edges — copy + metadata feeding the deterministic ranker." },
    ],
  },
  illustration: <DecisionGateScene />,
  side: "right",
  depth: (
    <SceneDepth>
      <Disclosure label="The science">
        <p className="text-sm leading-relaxed text-muted">
          Contextual bandits are the offer slot.
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          <Cite name="LinUCB" meta="Li et al. · WWW 2010 · arXiv:1003.0146" />
          <Cite name="Thompson Sampling for linear payoffs" meta="Agrawal & Goyal · ICML 2013 · arXiv:1209.3352" />
          <Cite name="Neural Thompson Sampling" meta="Zhang et al. · ICLR 2021 · arXiv:2010.00827" />
        </div>
        <TaggedNote kind="INFERENCE">
          TS fits a sub-200ms budget (one posterior draw per request) and degrades gracefully under
          delayed checkout rewards.
        </TaggedNote>
      </Disclosure>
      <Disclosure label="How I'd build it">
        <div className="mb-3 flex flex-wrap items-center gap-2">
          <HonestyTag kind="DESIGNED" />
          <span className="text-xs text-muted">reuses shipped patterns</span>
        </div>
        <BuildList>
          <BuildItem>
            Hot path — a <strong className="text-text">placement-gate service</strong>: (1) a
            deterministic hard filter (consent / brand-safety / frequency — the{" "}
            <code className="font-mono text-text">constraints.py</code> pattern,{" "}
            <HonestyTag kind="SHIPPED" />
            ), (2) a fatigue read from Redis counters, (3) a calibrated GBDT for{" "}
            <code className="font-mono text-text">p(engage)·E[value]</code>, (4) a deterministic
            net-value gate: place iff{" "}
            <code className="font-mono text-text">E[value] − λ·fatigue &gt; θ</code>, else{" "}
            <strong className="text-text">show nothing</strong>.
          </BuildItem>
          <BuildItem>
            Determinism lives at steps 1 &amp; 4 — the score can be a model; the decision to suppress
            is a pure, auditable function.
          </BuildItem>
          <BuildItem>
            Fail-closed: gate timeout / model down → show nothing (the trust-preserving default),
            with a signed reason to the audit.
          </BuildItem>
        </BuildList>
        <TaggedNote kind="TO VALIDATE">
          Does Rokt want &ldquo;whether/when&rdquo; as a distinct pre-ranking gate, or folded into
          the Brain as a null-offer candidate? The single biggest design fork.
        </TaggedNote>
      </Disclosure>
    </SceneDepth>
  ),
};

const SCENE_2: SceneData = {
  id: "scene-ai",
  n: "02",
  label: "Accelerate development with AI",
  headline: [{ text: "AI as leverage — " }, { text: "plus the judgment of when not to reach for it.", className: "gradient-text" }],
  proof: {
    projects: ["Threshold"],
    text: "This repo was built with a multi-agent research → verify → build pipeline, and an AST-based fitness test enforces no LLM in the correctness path. Speed with guarantees.",
  },
  idea: (
    <>
      A team dev-velocity loop — agentic coding + PR-review agents + eval harnesses gating prompts +
      LLM observability — so builders ship faster <em>without</em> shipping non-determinism into
      money or eligibility.
    </>
  ),
  tools: {
    label: "AI tools I'd wield",
    items: [
      { name: "Claude Code", how: "the primary agentic builder across research, code, and tests." },
      { name: "Cursor", how: "tight edit-loop for the deterministic core." },
      { name: "Copilot coding agent", how: "delegated PR-scoped tasks — boilerplate, never the correctness path." },
      { name: "Aider", how: "git-as-truth, auditable diffs — philosophically aligned with Threshold." },
      { name: "v0", how: "scaffold the UI shell fast, then hand-craft what matters." },
      { name: "promptfoo", how: "now part of OpenAI (still open-source, MIT) — my CI eval + prompt-injection red-team gate." },
      { name: "Ragas", how: "retrieval/answer quality scoring where RAG is involved." },
      { name: "DeepEval", how: "assertion-style LLM tests that sit in the same CI gate." },
      { name: "Langfuse", how: "traces + costs per call — on OpenTelemetry, so the backend stays swappable." },
      { name: "DSPy", how: "prompts as evaluable, version-controlled code — optimized, not hand-tuned." },
      { name: "Windsurf → Devin Desktop", how: "now Devin Desktop under Cognition (Cascade EOL ~Jul 2026) — I name it accurately, not as a stable pick." },
      { name: "arXiv", how: "read weekly — off-policy eval, uplift, recsys, RLHF." },
    ],
  },
  illustration: <ToolConstellationScene />,
  side: "left",
  depth: (
    <SceneDepth>
      <Disclosure label="The stack, named accurately">
        <div className="rounded-xl border border-teal/30 bg-teal/[0.06] p-4">
          <div className="mb-2 flex flex-wrap items-center gap-2">
            <HonestyTag kind="SHIPPED" />
            <span className="text-sm font-semibold text-text">The load-bearing beat</span>
          </div>
          <p className="text-sm leading-relaxed text-text">
            An <strong>AST fitness test</strong> fails the build if an LLM / network / clock / RNG
            import becomes reachable from{" "}
            <code className="font-mono text-teal">app/domain/*</code>. &ldquo;No AI in the
            money/eligibility path&rdquo; is a <em>checkable invariant</em>, not a promise — I use AI
            aggressively <em>and</em> encode, in an automated test, exactly where it isn&apos;t
            allowed to go.
          </p>
        </div>
        <p className="mt-4 font-mono text-[11px] uppercase tracking-[0.18em] text-muted">
          Named right — because I track the market
        </p>
        <BuildList>
          <BuildItem>
            <strong className="text-text">promptfoo is now part of OpenAI</strong> (still open-source,
            MIT) — my CI eval + injection red-team gate.
          </BuildItem>
          <BuildItem>
            <strong className="text-text">Windsurf → Devin Desktop under Cognition</strong> (Cascade
            EOL ~Jul 2026) — named as &ldquo;now Devin Desktop,&rdquo; not as a stable pick.
          </BuildItem>
          <BuildItem>
            Standardize LLM telemetry on <strong className="text-text">OpenTelemetry GenAI</strong>{" "}
            conventions → the observability backend (Langfuse / Phoenix) becomes swappable. The
            anti-lock-in decision.
          </BuildItem>
          <BuildItem>
            <strong className="text-text">MLflow&apos;s stage-gated model registry</strong>{" "}
            (Staging → Production behind an approval) is the MLOps cousin of Threshold&apos;s gate — a
            clean bridge from my project to Rokt-scale MLOps.
          </BuildItem>
        </BuildList>
      </Disclosure>
    </SceneDepth>
  ),
};

const SCENE_4: SceneData = {
  id: "scene-collab",
  n: "04",
  label: "Collaborate & innovate",
  headline: [{ text: "Build for a conversation, " }, { text: "not a verdict.", className: "gradient-text" }],
  proof: {
    projects: ["Krowd Guide", "Threshold"],
    text: "Krowd Guide — built with operators and stakeholders, translating fuzzy requirements into shipped intelligence; plus this repo's honest LIMITATIONS and its “tear it apart” framing.",
  },
  idea: (
    <>
      Partner with PM/design/eng on AI-driven UX — a shared &ldquo;why this decision&rdquo; surface
      so decisions are legible to everyone in the room, not just the engineer who built them.
    </>
  ),
  tools: {
    label: "Tools & practices",
    items: [
      { name: "Figma", how: "design handoff — specs the whole team can read and push back on." },
      { name: "Design skills (Emil/impeccable/taste)", how: "premium UI craft applied consistently, not per-page guesswork." },
      { name: "Linear", how: "the delivery loop — small, legible, reviewable increments." },
      { name: "Notion", how: "decision docs + honest limitations, written to be corrected." },
    ],
  },
  illustration: <CollaborationLoopScene />,
  side: "right",
  depth: (
    <SceneDepth>
      <Disclosure label="The honest gap, as a strength">
        <p className="text-sm leading-relaxed text-muted">
          Rokt&apos;s own engineering writes that review has shifted to{" "}
          <span className="text-text">
            &ldquo;governing a fleet of agents … watching for drift&rdquo;
          </span>
          , measuring defect rates. Collaboration in 2026 includes collaborating <em>with</em> agents
          under human governance.
        </p>
        <TaggedNote kind="SHIPPED">
          Efficast&apos;s &ldquo;LLM proposes, never actuates&rdquo; is exactly that discipline —
          already shipped: an agent graph where the model proposes but a human owns every
          irreversible step.
        </TaggedNote>
      </Disclosure>
    </SceneDepth>
  ),
};

const SCENE_5: SceneData = {
  id: "scene-scale",
  n: "05",
  label: "Optimize & scale",
  headline: [{ text: "Find the bottleneck with data; " }, { text: "hold the invariants at scale.", className: "gradient-text" }],
  proof: {
    projects: ["ShelfTrace", "Dreamship", "Threshold"],
    text: "ShelfTrace's cross-system reconciliation + canary; Dreamship's row-locking, replay, N+1 guards and 120 tests; Threshold's transactional outbox with backoff + dead-lettering.",
  },
  idea: (
    <>
      Scale decisioning to <strong className="text-text">billions of transactions</strong> — enqueue →
      async worker → transactional outbox → batched evaluation → single commit, from a read replica;
      sub-200ms p99; drift monitoring.
    </>
  ),
  tools: {
    label: "AI tools I'd wield",
    items: [
      { name: "Kafka / Redpanda", how: "stream event-time snapshots into a horizontal worker pool." },
      { name: "Ray", how: "parallel evaluation — the pure engine fans out with no shared state." },
      { name: "Triton / vLLM", how: "low-latency model serving when a model is on the path." },
      { name: "ONNX", how: "portable, fast inference artifacts across the fleet." },
      { name: "Evidently", how: "drift monitoring on the input distribution feeding decisions." },
      { name: "Feast", how: "a feature store so training and serving see the same values." },
      { name: "OpenTelemetry", how: "traces + profiling to find the real bottleneck, not the guessed one." },
    ],
  },
  illustration: <ScalingPipelineScene />,
  side: "left",
  depth: (
    <SceneDepth>
      <Disclosure label="How I'd build it">
        <div className="mb-3 flex flex-wrap items-center gap-2">
          <HonestyTag kind="DESIGNED" />
          <span className="text-xs text-muted">on a shipped spine</span>
        </div>
        <BuildList>
          <BuildItem>
            Kafka / Redpanda ingress → idempotent enqueue → a stateless worker pool reading from a{" "}
            <strong className="text-text">read replica</strong>.
          </BuildItem>
          <BuildItem>
            The pure evaluator batches safely — parallelism is safe by construction:{" "}
            <code className="font-mono text-text">run_replay(seed) == run_replay(seed)</code> (
            <HonestyTag kind="SHIPPED" />
            ). Accumulate, commit nothing → a <strong className="text-text">single atomic verdict
            commit</strong>.
          </BuildItem>
          <BuildItem>
            A <strong className="text-text">transactional outbox</strong> drains the fan-out with
            backoff + jitter, <code className="font-mono text-text">FOR UPDATE SKIP LOCKED</code>, and
            dead-letters after 5 (<HonestyTag kind="SHIPPED" />,{" "}
            <code className="font-mono text-text">test_outbox.py</code>) → an Evidently drift sidecar
            (PSI / KS, deterministic stats).
          </BuildItem>
          <BuildItem>
            Models served via ONNX / Triton / vLLM-class for the hot path — but the scale machinery
            here is <strong className="text-text">systems, not ML</strong>.
          </BuildItem>
        </BuildList>
        <TaggedNote kind="DESIGNED">
          The outbox / backoff / dead-letter / SKIP-LOCKED path is already built and tested; the
          Kafka / replica / Ray layer is designed, not built — I won&apos;t claim otherwise.
        </TaggedNote>
        <TaggedNote kind="TO VALIDATE">
          Is Rokt&apos;s real path decision-per-request (hot) vs certification / replay (async)? The
          exact boundary and the p99 budget are internal.
        </TaggedNote>
      </Disclosure>
    </SceneDepth>
  ),
};

export function Scenes() {
  return (
    <div id="what-ill-do">
      <div className="mx-auto max-w-6xl px-4 pt-12 sm:px-6 sm:pt-16">
        <Reveal>
          <p className="font-mono text-xs uppercase tracking-[0.22em] text-teal">What I&apos;ll do</p>
        </Reveal>
        <MaskText
          as="h2"
          id="scenes-title"
          className="mt-3 max-w-3xl text-3xl font-semibold tracking-tight sm:text-4xl"
          segments={[{ text: "Six dimensions — " }, { text: "each a scene, each proven.", className: "gradient-text" }]}
        />
      </div>

      <SplitScene s={SCENE_1} />
      <SplitScene s={SCENE_2} />
      <FullStackScene />
      <SplitScene s={SCENE_4} />
      <SplitScene s={SCENE_5} />
      <RevenueScene />
    </div>
  );
}
