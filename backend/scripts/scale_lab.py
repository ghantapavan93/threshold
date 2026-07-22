"""Scale Lab — a real, local load test of the deterministic decision path.

Times the actual `evaluate(attrs, policy)` call (the hot path a policy change runs
through) over many real generated sessions, and reports measured percentiles and
throughput. It also times a full `run_replay` at two sizes. These are MEASURED
numbers on one process, one thread — not a distributed benchmark. The honest
signal is knowing exactly what was measured and where the first cost lives.

Run:  python -m scripts.scale_lab
Writes: scale_lab_result.json  (the Scale Chamber's "MEASURED" tier can cite this)
"""
from __future__ import annotations

import json
import statistics
import time
from pathlib import Path

from app.db import SessionLocal, init_db
from app.domain.evaluator import evaluate
from app.domain.replay import run_replay
from app.domain.sessions import generate_sessions
from app.routers.common import load_policy
from app.seed import seed_policies

MERCHANT = "aurora-tickets"


def _pct(sorted_ns: list[int], q: float) -> float:
    if not sorted_ns:
        return 0.0
    i = min(len(sorted_ns) - 1, int(q * len(sorted_ns)))
    return sorted_ns[i] / 1000.0  # ns -> microseconds


def time_decision(policy, sessions: list[dict], repeats: int) -> dict:
    # warm up caches first (not measured)
    for s in sessions:
        evaluate(s["attributes"], policy)
    durations: list[int] = []
    for _ in range(repeats):
        for s in sessions:
            t0 = time.perf_counter_ns()
            evaluate(s["attributes"], policy)
            durations.append(time.perf_counter_ns() - t0)
    durations.sort()
    mean_ns = statistics.fmean(durations)
    return {
        "samples": len(durations),
        "p50_us": round(_pct(durations, 0.50), 3),
        "p90_us": round(_pct(durations, 0.90), 3),
        "p99_us": round(_pct(durations, 0.99), 3),
        "p999_us": round(_pct(durations, 0.999), 3),
        "mean_us": round(mean_ns / 1000.0, 3),
        "throughput_decisions_per_s": round(1e9 / mean_ns),
    }


def time_replay(base, proposed, count: int) -> dict:
    t0 = time.perf_counter_ns()
    run_replay(base, proposed, session_seed=42, session_count=count, injections=["timeout"], audit_secret="scale-lab")
    total_ms = (time.perf_counter_ns() - t0) / 1e6
    return {"sessions": count, "wall_ms": round(total_ms, 2), "per_session_us": round(total_ms * 1000 / count, 2)}


def main() -> None:
    init_db()
    seed_policies()
    db = SessionLocal()
    try:
        base = load_policy(db, MERCHANT, "V17")
        proposed = load_policy(db, MERCHANT, "V18")
    finally:
        db.close()

    sessions = generate_sessions(42, 200)
    decision = time_decision(proposed, sessions, repeats=200)  # 40k measured calls
    replays = [time_replay(base, proposed, n) for n in (200, 2000)]

    result = {
        "measured_on": "single process, single thread, local",
        "decision_path": decision,
        "full_replay": replays,
        "note": "MEASURED. Regional/global figures in the Scale Chamber remain MODELED/HYPOTHESIS.",
    }

    out = Path(__file__).resolve().parent.parent / "scale_lab_result.json"
    out.write_text(json.dumps(result, indent=2))

    d = decision
    print("Scale Lab — measured decision path")
    print(f"  samples      {d['samples']:,}")
    print(f"  p50 / p99    {d['p50_us']} us / {d['p99_us']} us")
    print(f"  p99.9        {d['p999_us']} us")
    print(f"  throughput   {d['throughput_decisions_per_s']:,} decisions/s")
    for r in replays:
        print(f"  replay {r['sessions']:>5} sessions  {r['wall_ms']} ms  ({r['per_session_us']} us/session)")
    print(f"  wrote {out.name}")


if __name__ == "__main__":
    main()
