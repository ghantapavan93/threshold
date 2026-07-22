"use client";

import { useEffect, useRef, useState } from "react";
import Matter from "matter-js";
import { useReducedMotion } from "framer-motion";

/* Silent widening, as physics. A representative SAMPLE of the replay drops into two
   bins split by the eligibility boundary: known-value sessions settle the same
   under both policies; the missing-attribute band settles on the ineligible side
   under V17 but crosses to the eligible side — crimson — under V18.

   Matter.js only *visualises* the deterministic result: which side each body targets
   comes from the classification (data), never from the physics. The policy verdict
   is never computed here. Under reduced motion the simulation is skipped and the
   final resting state is drawn once. The engine is fully torn down on unmount.

   Honest framing: this is a labelled SYNTHETIC sample; the widened share (5/48 ≈
   10%) mirrors the recorded 21/200 result — no count is inflated for drama. */

const TEAL = "#22e6c8";
const CRIMSON = "#ff4d63";
const MUTED = "#8b93a7";
const BLUE = "#5b8cff";
const H = 260;

type Kind = "eligible" | "restricted" | "missing";
// 48-session sample: 22 known-eligible, 21 known-restricted, 5 missing-attribute.
const SAMPLE: Kind[] = [
  ...Array<Kind>(22).fill("eligible"),
  ...Array<Kind>(21).fill("restricted"),
  ...Array<Kind>(5).fill("missing"),
];

export function SilentWidening() {
  const reduced = useReducedMotion();
  const [policy, setPolicy] = useState<"V17" | "V18">("V17");
  const wrapRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const policyRef = useRef(policy);
  policyRef.current = policy;

  // widened sample count crossing under the current policy
  const widened = policy === "V18" ? SAMPLE.filter((k) => k === "missing").length : 0;

  useEffect(() => {
    const canvas = canvasRef.current;
    const wrap = wrapRef.current;
    if (!canvas || !wrap) return;
    const W = Math.max(280, Math.min(wrap.clientWidth, 640));
    canvas.width = W;
    canvas.height = H;
    const ctx = canvas.getContext("2d")!;
    const mid = W / 2;

    const engine = Matter.Engine.create();
    engine.gravity.y = 1;
    const wallOpts = { isStatic: true } as const;
    const walls = [
      Matter.Bodies.rectangle(W / 2, H + 20, W, 40, wallOpts), // floor
      Matter.Bodies.rectangle(-20, H / 2, 40, H, wallOpts), // left
      Matter.Bodies.rectangle(W + 20, H / 2, 40, H, wallOpts), // right
      Matter.Bodies.rectangle(mid, H - 55, 3, 110, wallOpts), // centre divider (lower half)
    ];
    Matter.Composite.add(engine.world, walls);

    // where each kind lands, per policy — data, not physics
    const targetSide = (k: Kind, p: "V17" | "V18"): "L" | "R" =>
      k === "eligible" ? "R" : k === "restricted" ? "L" : p === "V18" ? "R" : "L";
    const colorFor = (k: Kind, side: "L" | "R"): string =>
      k === "missing" && side === "R" ? CRIMSON : k === "eligible" ? BLUE : k === "restricted" ? MUTED : TEAL;

    let bodies: { body: Matter.Body; color: string }[] = [];
    const drop = () => {
      bodies.forEach((b) => Matter.Composite.remove(engine.world, b.body));
      bodies = SAMPLE.map((k, i) => {
        const side = targetSide(k, policyRef.current);
        const [z0, z1] = side === "L" ? [16, mid - 16] : [mid + 16, W - 16];
        const jitter = Math.abs((Math.sin(i * 12.9898) * 43758.5) % 1);
        const x = z0 + jitter * (z1 - z0);
        const body = Matter.Bodies.circle(x, -20 - (i % 8) * 26, 6, { restitution: 0.25, friction: 0.6 });
        return { body, color: colorFor(k, side) };
      });
      Matter.Composite.add(engine.world, bodies.map((b) => b.body));
    };

    const render = () => {
      ctx.clearRect(0, 0, W, H);
      // the eligibility boundary
      ctx.strokeStyle = "rgba(139,147,167,0.35)";
      ctx.lineWidth = 1;
      ctx.setLineDash([4, 5]);
      ctx.beginPath();
      ctx.moveTo(mid, 8);
      ctx.lineTo(mid, H - 4);
      ctx.stroke();
      ctx.setLineDash([]);
      // bin labels
      ctx.font = "10px ui-monospace, monospace";
      ctx.fillStyle = "rgba(139,147,167,0.7)";
      ctx.textAlign = "center";
      ctx.fillText("INELIGIBLE", mid / 2, 18);
      ctx.fillText("ELIGIBLE", mid + mid / 2, 18);
      // bodies
      bodies.forEach(({ body, color }) => {
        ctx.beginPath();
        ctx.arc(body.position.x, body.position.y, 6, 0, Math.PI * 2);
        ctx.fillStyle = color;
        ctx.shadowColor = color === CRIMSON ? CRIMSON : "transparent";
        ctx.shadowBlur = color === CRIMSON ? 8 : 0;
        ctx.fill();
        ctx.shadowBlur = 0;
      });
    };

    drop();

    if (reduced) {
      // settle synchronously, draw one frame, no loop
      for (let i = 0; i < 140; i++) Matter.Engine.update(engine, 1000 / 60);
      render();
      return () => Matter.Engine.clear(engine);
    }

    // timer-driven so it animates reliably (survives a throttled/background tab)
    const id = window.setInterval(() => {
      Matter.Engine.update(engine, 1000 / 60);
      render();
    }, 1000 / 45);

    return () => {
      window.clearInterval(id);
      Matter.Composite.clear(engine.world, false);
      Matter.Engine.clear(engine);
    };
    // re-run the whole sim when the policy flips (clean teardown + fresh drop)
  }, [policy, reduced]);

  return (
    <div className="mx-auto max-w-3xl">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
        <div
          role="radiogroup"
          aria-label="Policy version"
          className="inline-flex overflow-hidden rounded-lg border border-border"
        >
          {(["V17", "V18"] as const).map((v) => (
            <button
              key={v}
              type="button"
              role="radio"
              aria-checked={policy === v}
              onClick={() => setPolicy(v)}
              className="px-4 py-1.5 text-sm font-semibold transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-teal"
              style={
                policy === v
                  ? { backgroundColor: v === "V18" ? "color-mix(in srgb, var(--c-crimson) 15%, transparent)" : "color-mix(in srgb, var(--c-teal) 15%, transparent)", color: v === "V18" ? "var(--c-crimson)" : "var(--c-teal)" }
                  : { color: "var(--c-muted)" }
              }
            >
              {v}
            </button>
          ))}
        </div>
        <span className="font-mono text-xs text-muted">
          <span style={{ color: widened ? "var(--c-crimson)" : "var(--c-teal)" }}>{widened}</span> of 5 missing-attribute
          sessions crossed the boundary
        </span>
      </div>

      <div ref={wrapRef} className="overflow-hidden rounded-2xl border border-border bg-base/60">
        <canvas ref={canvasRef} className="block w-full" aria-hidden style={{ height: H }} />
      </div>

      <p className="mt-3 text-xs text-muted">
        A labelled <span className="font-mono text-text">SYNTHETIC</span> sample. Known-value sessions settle the same
        under both policies; the missing-attribute band crosses into <span style={{ color: "var(--c-crimson)" }}>eligible</span>
        {" "}only under V18. The widened share mirrors the recorded 21/200 result — physics shows it, it doesn&apos;t decide it.
      </p>
    </div>
  );
}
