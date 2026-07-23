"""Conversion integrity — dedup on conversiontype + confirmationref (VERIFIED
Rokt Event & Audience API dedup keys). No settlement / no money movement."""
import json

from fastapi import APIRouter, Depends, Response
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from ..db import get_db
from ..models import ConversionRow
from ..schemas import ConversionRequest

router = APIRouter(prefix="/api/v1/merchants/{merchant_id}")


@router.post("/conversions")
def record_conversion(
    merchant_id: str, req: ConversionRequest, response: Response, db: Session = Depends(get_db)
) -> dict:
    # Injective key: a raw "type:ref" concat collides (e.g. ("a","b:c") vs ("a:b","c")).
    # JSON-encode the pair so distinct conversions never dedupe into one another.
    dedup_key = json.dumps([req.conversiontype, req.confirmationref], separators=(",", ":"))
    existing = (
        db.query(ConversionRow).filter_by(merchant_id=merchant_id, dedup_key=dedup_key).first()
    )
    if existing:
        return {"status": "deduplicated", "conversion_id": existing.id, "dedup_key": dedup_key}

    seq = db.query(ConversionRow).filter_by(merchant_id=merchant_id).count()
    row = ConversionRow(
        merchant_id=merchant_id, dedup_key=dedup_key, conversiontype=req.conversiontype,
        confirmationref=req.confirmationref, amount=req.amount, currency=req.currency, seq=seq,
    )
    db.add(row)
    try:
        db.commit()
    except IntegrityError:  # effectively-once under concurrent at-least-once delivery
        db.rollback()
        existing = (
            db.query(ConversionRow).filter_by(merchant_id=merchant_id, dedup_key=dedup_key).first()
        )
        return {"status": "deduplicated", "conversion_id": existing.id, "dedup_key": dedup_key}
    db.refresh(row)
    response.status_code = 201
    return {"status": "processed", "conversion_id": row.id, "dedup_key": dedup_key}
