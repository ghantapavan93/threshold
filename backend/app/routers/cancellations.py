"""Cancellation state transition — models Rokt Cart API /v1/confirmation/cancel
linked by itemReservationId (VERIFIED). Deterministic; NO refund/settlement math
(no refund endpoint exists publicly)."""
from fastapi import APIRouter

from ..schemas import CancellationRequest

router = APIRouter(prefix="/api/v1/merchants/{merchant_id}")


@router.post("/cancellations")
def cancel_confirmation(merchant_id: str, req: CancellationRequest) -> dict:
    return {
        "itemReservationId": req.itemReservationId,
        "state_transition": ["reserved", "confirmed", "canceled"],
        "final_state": "canceled",
        "reversible": False,
    }
