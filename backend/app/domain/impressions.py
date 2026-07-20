"""Impression fidelity — the third whole-value, and the Case C seam made typed.

PURE, deterministic, no I/O / no LLM / no wall-clock — mirrors `translation.py` /
`reconciliation.py` discipline exactly. This module completes W3 of the
self-critique in docs/MOMENT_FORGE_INTEGRATION_CASES.md: after it, all three
polysemic terms carry their owning context in a type — `ConversionKind`
(translation.py), `RewardStatus` (reconciliation.py), and `ImpressionFidelity`
(here) — so a cross-context assignment REQUIRES a translation instead of being a
silent copy.

The seam (Case C):

    BC-7 Agent-Mediation                BC-5 Measurement
    "an offer was 'shown' by an         "an impression is a faithful rendering
     LLM shopping agent — imagery        seen by a human — the atomic unit
     stripped, value prop truncated,     incrementality assumes"
     maybe buried"          ── ACL ──▶

The ACL here does something different from Case A's subtraction: it REFUSES TO
CONFORM. A degraded agent rendering is not a smaller impression — it is a
DIFFERENT UNIT, and the honest translation refuses to count it as the atom BC-5
measures, listing it separately instead. The Conformist path blends both under
one word and the count silently stops meaning what every downstream consumer
thinks it means: exposure ≠ exposure.

HONESTY — this is the weakest-grounded of the four cases and says so loudly.
What is real: the agent-checkout framing and the blunt lesson of near-zero
agentic-checkout sales are [VERIFIED-PUBLIC] (research 26 #2/#3); the type, the
refuse-translation, and every count returned are computed live by this code.
What is NOT claimed: any real degradation rate, any presentation model, any lift
or conversion effect — `agent_share` and `degraded_fraction` are [SYNTHETIC],
labelled exactly like sessions.py "~18% omit cc_bin", and the audit returns
COUNTS of a labelled synthetic corpus only. The point is the unit mismatch,
shown qualitatively — never a fabricated rate.
"""
from __future__ import annotations

import random
from dataclasses import dataclass
from enum import Enum
from typing import Sequence

SEAM = "BC-7 Agent-Mediation → BC-5 Measurement"
UPSTREAM_MEANING = (
    "'shown' by an LLM shopping agent — possibly stripped, truncated, reordered, buried"
)
DOWNSTREAM_MEANING = (
    "a faithful rendering seen by a human — the atomic unit incrementality assumes"
)
PATTERN = "Anticorruption Layer (refuse-to-conform)"
GROUNDING = (
    "Agent-mediated checkout and its near-zero sales lesson are public (research 26 "
    "#2/#3); everything else here is a modelling claim. The ACL refuses to count a "
    "degraded rendering as the measurement atom — it does not estimate anything, and "
    "no degradation rate is asserted: both fractions are labelled synthetic inputs."
)

# THE SYNTHETIC INPUTS — labelled like sessions.py "~18% of sessions omit cc_bin".
DEFAULT_AGENT_SHARE = 0.35        # share of the corpus arriving via an agent channel
DEFAULT_DEGRADED_FRACTION = 0.80  # share of agent renderings that lose fidelity

_SYNTHETIC_LABEL = (
    "[SYNTHETIC] corpus parameter. No public number exists for this; it is seeded "
    "only so the mechanism is bit-for-bit replayable — labelled exactly like the "
    "engine's '~18% omit cc_bin' synthetic. No Rokt-internal number is asserted."
)


class ImpressionFidelity(str, Enum):
    """Whole-value discriminator (the W3 fix): fidelity is stamped in the type, so
    'impression' can never hide WHICH unit you hold."""

    FAITHFUL = "faithful"  # rendered as designed, seen by a human — BC-5's atom
    DEGRADED = "degraded"  # agent-echoed: imagery stripped / value prop truncated


class Channel(str, Enum):
    HUMAN = "human"
    AGENT = "agent"


@dataclass(frozen=True)
class Impression:
    """One rendering event, carrying its channel and its fidelity. Frozen — an
    impression is history, not a mutable tally."""

    fidelity: ImpressionFidelity
    channel: Channel
    count: int = 1


# --------------------------------------------------------------------------- #
# The seeded corpus (reuses the sessions.py seeding discipline)
# --------------------------------------------------------------------------- #
def generate_impression_corpus(
    seed: int,
    count: int,
    agent_share: float = DEFAULT_AGENT_SHARE,
    degraded_fraction: float = DEFAULT_DEGRADED_FRACTION,
) -> list[Impression]:
    """Deterministic corpus: human-channel impressions are FAITHFUL by definition
    of the classical unit; agent-channel impressions lose fidelity at the seeded
    rate (some agents do render faithfully — the type allows it, the ACL passes it)."""
    rng = random.Random(seed)
    corpus: list[Impression] = []
    for _ in range(count):
        if rng.random() < agent_share:
            fidelity = (
                ImpressionFidelity.DEGRADED
                if rng.random() < degraded_fraction
                else ImpressionFidelity.FAITHFUL
            )
            corpus.append(Impression(fidelity=fidelity, channel=Channel.AGENT))
        else:
            corpus.append(Impression(fidelity=ImpressionFidelity.FAITHFUL, channel=Channel.HUMAN))
    return corpus


# --------------------------------------------------------------------------- #
# The two translations across BC-7 → BC-5
# --------------------------------------------------------------------------- #
def conformist_count(corpus: Sequence[Impression]) -> int:
    """THE BUG (Conformist). Every 'shown' event counts as the measurement atom,
    fidelity ignored. The blended number silently stops meaning 'a human saw the
    offer as designed' — exposure ≠ exposure, and no downstream consumer can tell."""
    return sum(i.count for i in corpus)


def acl_count(corpus: Sequence[Impression]) -> dict:
    """THE ACL (refuse-to-conform). Only FAITHFUL impressions cross the seam as
    BC-5's atom; DEGRADED units are refused — listed, visible, and explicitly NOT
    counted. Refusal is not estimation: nothing is scaled, corrected or imputed."""
    counted = sum(i.count for i in corpus if i.fidelity is ImpressionFidelity.FAITHFUL)
    refused = sum(i.count for i in corpus if i.fidelity is ImpressionFidelity.DEGRADED)
    return {"counted": counted, "refused": refused}


# --------------------------------------------------------------------------- #
# The audit: both translations over the seeded corpus, plus the unit wall
# --------------------------------------------------------------------------- #
def audit_impressions(
    seed: int,
    count: int,
    agent_share: float = DEFAULT_AGENT_SHARE,
    degraded_fraction: float = DEFAULT_DEGRADED_FRACTION,
) -> dict:
    """Run both translations over the seeded corpus and return the blend the
    Conformist path hides. Counts only — computed live, never asserted; the unit
    mismatch is the claim, not any rate."""
    corpus = generate_impression_corpus(seed, count, agent_share, degraded_fraction)

    per_channel = {c.value: 0 for c in Channel}
    per_fidelity = {f.value: 0 for f in ImpressionFidelity}
    for i in corpus:
        per_channel[i.channel.value] += i.count
        per_fidelity[i.fidelity.value] += i.count

    conformist = conformist_count(corpus)
    acl = acl_count(corpus)

    return {
        "term": "impression",
        "seam": SEAM,
        "upstream_meaning": UPSTREAM_MEANING,
        "downstream_meaning": DOWNSTREAM_MEANING,
        "pattern": PATTERN,
        "seed": seed,
        "count": count,
        "per_channel": per_channel,
        "per_fidelity": per_fidelity,
        "conformist_result": {"kind": "impression (blended — the lie)", "count": conformist},
        "acl_result": acl,
        "blended_units": conformist - acl["counted"],
        "synthetic_inputs": [
            {"name": "agent_share", "value": agent_share, "label": _SYNTHETIC_LABEL},
            {"name": "degraded_fraction", "value": degraded_fraction, "label": _SYNTHETIC_LABEL},
        ],
        "grounding": GROUNDING,
        "note": (
            f"Of {count} 'impressions', {acl['refused']} are a different unit "
            "(agent-degraded renderings). The Conformist path counts "
            f"{conformist}; the ACL counts {acl['counted']} and refuses "
            f"{acl['refused']} — visibly, without estimating anything. The channel "
            "and degradation fractions are [SYNTHETIC]; the unit mismatch is the "
            "claim, not a rate."
        ),
    }
