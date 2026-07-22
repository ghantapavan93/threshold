"""Money — a currency-aware whole value with ISO 4217 minor units enforced.

A staff engineer's question: "you say 'whole values' — but JPY has no minor unit
and BHD has three." This is the enforced answer, not a promise.

Money carries an integer count of MINOR units plus its currency, and the currency's
ISO 4217 exponent decides what a minor unit means: cents for USD (exp 2), whole yen
for JPY (exp 0), fils for BHD (exp 3). The rules, all fail-closed:

  - the currency must be known (an unknown currency is refused, never assumed 2);
  - the minor amount must be an integer (a float is imprecise; a bool is not money);
  - converting a MAJOR-unit amount refuses more precision than the currency allows
    (USD "12.345" and BHD "1.2345" are errors; JPY "1234.5" is an error);
  - two Money values add only within the same currency, else CurrencyMismatchError —
    the same whole-value discipline the conversion Unit Wall uses for counts.

Pure and deterministic; Decimal throughout, never float, so nothing rounds behind
your back.
"""
from __future__ import annotations

from dataclasses import dataclass
from decimal import Decimal, InvalidOperation

# ISO 4217 minor-unit exponents. Representative, not exhaustive; an unknown code is
# refused rather than silently assumed to be 2 — assuming would mis-scale JPY/BHD.
_MINOR_UNITS: dict[str, int] = {
    # exponent 2 — the common case (a "cent")
    "USD": 2, "EUR": 2, "GBP": 2, "CAD": 2, "AUD": 2, "NZD": 2, "CHF": 2,
    "CNY": 2, "INR": 2, "SGD": 2, "HKD": 2, "SEK": 2, "NOK": 2, "DKK": 2,
    "PLN": 2, "MXN": 2, "BRL": 2, "ZAR": 2, "AED": 2, "SAR": 2, "TRY": 2,
    # exponent 0 — no minor unit at all
    "JPY": 0, "KRW": 0, "CLP": 0, "VND": 0, "ISK": 0, "PYG": 0,
    "XAF": 0, "XOF": 0, "XPF": 0, "RWF": 0, "UGX": 0, "DJF": 0,
    # exponent 3 — three minor digits
    "BHD": 3, "KWD": 3, "OMR": 3, "JOD": 3, "TND": 3, "IQD": 3, "LYD": 3,
}


class MoneyError(ValueError):
    """Invalid money: an unknown currency, a non-integer minor amount, or a
    major-unit amount with more precision than the currency's minor unit allows."""


class CurrencyMismatchError(TypeError):
    """Raised when two Money values in DIFFERENT currencies are combined without a
    conversion — adding USD to JPY is a category error, not arithmetic."""


def supported_currencies() -> frozenset[str]:
    return frozenset(_MINOR_UNITS)


def exponent(currency: str) -> int:
    """ISO 4217 minor-unit exponent for a currency (fail-closed on unknown)."""
    cur = _norm(currency)
    return _MINOR_UNITS[cur]


def _norm(currency: str) -> str:
    if not isinstance(currency, str):
        raise MoneyError(f"currency must be a 3-letter code string, got {type(currency).__name__}")
    cur = currency.strip().upper()
    if cur not in _MINOR_UNITS:
        raise MoneyError(f"unknown currency {currency!r} — refusing to assume a minor unit")
    return cur


@dataclass(frozen=True)
class Money:
    minor: int       # integer count of minor units (cents/yen/fils), may be negative
    currency: str    # ISO 4217 code, normalised to upper-case

    def __post_init__(self) -> None:
        cur = _norm(self.currency)
        # bool is an int subclass — a flag is not an amount.
        if not isinstance(self.minor, int) or isinstance(self.minor, bool):
            raise MoneyError(f"minor units must be a whole integer, got {self.minor!r}")
        object.__setattr__(self, "currency", cur)

    @property
    def exponent(self) -> int:
        return _MINOR_UNITS[self.currency]

    @classmethod
    def from_minor(cls, minor: int, currency: str) -> "Money":
        return cls(minor=minor, currency=currency)

    @classmethod
    def from_major(cls, amount: str | int | Decimal, currency: str) -> "Money":
        """Parse a MAJOR-unit amount ("12.34", 12, Decimal('1.234')) into minor units
        for `currency`, refusing more precision than the currency allows. Floats are
        rejected — pass a string or Decimal so nothing rounds silently."""
        cur = _norm(currency)
        exp = _MINOR_UNITS[cur]
        if isinstance(amount, float):
            raise MoneyError("a float amount is imprecise — pass a string or Decimal")
        try:
            d = amount if isinstance(amount, Decimal) else Decimal(str(amount))
        except InvalidOperation as exc:
            raise MoneyError(f"not a valid amount: {amount!r}") from exc
        if not d.is_finite():
            raise MoneyError(f"amount must be finite, got {amount!r}")
        scaled = d * (Decimal(10) ** exp)
        if scaled != scaled.to_integral_value():
            raise MoneyError(
                f"{cur} has {exp} minor digit(s); {amount!r} carries more precision than that")
        return cls(minor=int(scaled), currency=cur)

    def major(self) -> Decimal:
        """The amount in major units as an exact Decimal (12.34, 1234, 1.234)."""
        return Decimal(self.minor).scaleb(-self.exponent)

    def format(self) -> str:
        """Human string with exactly the currency's minor digits: '12.34 USD',
        '5000 JPY', '1.234 BHD'."""
        m = self.major()
        sign = "-" if m < 0 else ""
        body = f"{m.copy_abs():.{self.exponent}f}"
        return f"{sign}{body} {self.currency}"

    def add(self, other: "Money") -> "Money":
        if not isinstance(other, Money):
            raise CurrencyMismatchError("can only add Money to Money")
        if other.currency != self.currency:
            raise CurrencyMismatchError(
                f"cannot add {self.currency} + {other.currency}: different currencies "
                "must be converted first, or the sum is meaningless")
        return Money(minor=self.minor + other.minor, currency=self.currency)

    def __add__(self, other: object) -> "Money":
        if not isinstance(other, Money):
            return NotImplemented
        return self.add(other)

    def as_dict(self) -> dict:
        return {
            "minor": self.minor,
            "currency": self.currency,
            "exponent": self.exponent,
            "major": str(self.major()),
            "display": self.format(),
        }
