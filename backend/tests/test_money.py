"""Money — ISO 4217 minor units, enforced. The staff-engineer question "JPY has no
minor unit, BHD has three" answered by working code, not a promise."""
from decimal import Decimal

import pytest

from app.domain.money import (
    CurrencyMismatchError,
    Money,
    MoneyError,
    exponent,
    supported_currencies,
)


def test_exponents_match_iso_4217():
    assert exponent("USD") == 2   # cents
    assert exponent("JPY") == 0   # no minor unit
    assert exponent("BHD") == 3   # fils
    assert exponent("bhd") == 3   # case-insensitive


def test_unknown_currency_is_refused_not_assumed():
    for bad in ("ZZZ", "US", "", "bitcoin"):
        with pytest.raises(MoneyError):
            Money(minor=100, currency=bad)
        with pytest.raises(MoneyError):
            Money.from_major("1.00", bad)
    assert "USD" in supported_currencies()


@pytest.mark.parametrize("bad", [12.34, True, False, "100", None])
def test_minor_must_be_a_whole_integer(bad):
    # a float rounds, a bool is a flag, a string isn't a number.
    with pytest.raises((MoneyError, TypeError)):
        Money(minor=bad, currency="USD")  # type: ignore[arg-type]


def test_from_major_scales_by_currency_exponent():
    assert Money.from_major("12.34", "USD").minor == 1234   # 2 digits
    assert Money.from_major("12.5", "USD").minor == 1250
    assert Money.from_major("12", "USD").minor == 1200
    assert Money.from_major("1234", "JPY").minor == 1234    # 0 digits — whole yen
    assert Money.from_major("5000", "JPY").minor == 5000
    assert Money.from_major("1.234", "BHD").minor == 1234   # 3 digits — fils
    assert Money.from_major("1.2", "BHD").minor == 1200
    assert Money.from_major(Decimal("0.010"), "USD").minor == 1


def test_from_major_refuses_more_precision_than_the_currency_allows():
    with pytest.raises(MoneyError):
        Money.from_major("12.345", "USD")   # USD has 2 minor digits
    with pytest.raises(MoneyError):
        Money.from_major("1234.5", "JPY")   # JPY has none
    with pytest.raises(MoneyError):
        Money.from_major("1.2345", "BHD")   # BHD has 3


def test_from_major_rejects_float_and_nonfinite():
    with pytest.raises(MoneyError):
        Money.from_major(12.34, "USD")      # float is imprecise
    with pytest.raises(MoneyError):
        Money.from_major("nan", "USD")
    with pytest.raises(MoneyError):
        Money.from_major("inf", "USD")


def test_major_and_format_round_trip():
    assert Money(1234, "USD").major() == Decimal("12.34")
    assert Money(1234, "USD").format() == "12.34 USD"
    assert Money(5000, "JPY").format() == "5000 JPY"        # no decimal point
    assert Money(1234, "BHD").format() == "1.234 BHD"
    assert Money(-1234, "USD").format() == "-12.34 USD"
    # round-trip: major -> minor -> major is exact for each exponent
    for cur, s in [("USD", "12.34"), ("JPY", "7000"), ("BHD", "1.234")]:
        assert str(Money.from_major(s, cur).major()) == s


def test_addition_is_same_currency_only():
    assert (Money(1000, "USD") + Money(250, "USD")).minor == 1250
    with pytest.raises(CurrencyMismatchError):
        Money(1000, "USD") + Money(1000, "JPY")


def test_frozen_value_object_is_hashable_and_equal():
    a, b = Money(1234, "usd"), Money(1234, "USD")
    assert a == b and hash(a) == hash(b)  # currency normalised to upper-case
    assert Money(1234, "USD").as_dict()["exponent"] == 2
