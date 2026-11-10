"""Custom Python keyword library for ShopLab tests (Module 12: extending Robot Framework).

Put logic that is awkward in Robot syntax (maths, dates, parsing, random data) in Python,
and keep .robot files readable for non-programmers.
"""
import random
import re
import string
from datetime import date, timedelta

from robot.api import logger
from robot.api.deco import keyword, library


def _round2(n: float) -> float:
    return round(n + 1e-9, 2)


@library(scope="GLOBAL", auto_keywords=False)
class ShopLabLibrary:
    """Helpers: money parsing, pricing oracle, unique test data."""

    @keyword("Parse Money")
    def parse_money(self, text: str) -> float:
        """Converts ``฿1,016.50`` to ``1016.5``. ``FREE`` becomes ``0``."""
        text = (text or "").strip()
        if text.upper() == "FREE":
            return 0.0
        cleaned = re.sub(r"[^\d.\-]", "", text)
        if not cleaned:
            raise ValueError(f"Cannot parse money from '{text}'")
        return float(cleaned)

    @keyword("Expected Quote")
    def expected_quote(self, subtotal, discount=0, shipping_method="standard", free_ship_coupon=False):
        """Independent oracle for REQ-PRC-01..07. Returns a dictionary with subtotal, discount, shipping, vat, total."""
        subtotal, discount = float(subtotal), float(discount)
        free_ship_coupon = str(free_ship_coupon).lower() in ("true", "1", "yes")
        after = _round2(subtotal - discount)
        if subtotal == 0:
            shipping = 0.0
        elif shipping_method == "express":
            shipping = 120.0
        else:
            shipping = 0.0 if (after >= 1000 or free_ship_coupon) else 50.0
        vat = _round2((after + shipping) * 0.07)
        result = {"subtotal": subtotal, "discount": discount, "shipping": shipping, "vat": vat, "total": _round2(after + shipping + vat)}
        logger.info(f"Expected quote: {result}")
        return result

    @keyword("Unique Username")
    def unique_username(self, prefix: str = "rf") -> str:
        suffix = "".join(random.choices(string.ascii_lowercase + string.digits, k=8))
        return f"{prefix}_{suffix}"[:20]

    @keyword("Random Sku")
    def random_sku(self) -> str:
        return "".join(random.choices(string.ascii_uppercase, k=4)) + "-" + f"{random.randint(0, 999):03d}"

    @keyword("Birth Date For Age")
    def birth_date_for_age(self, years, extra_days=0) -> str:
        """YYYY-MM-DD for someone who is exactly ``years`` old today (shifted by ``extra_days``)."""
        today = date.today()
        try:
            d = today.replace(year=today.year - int(years))
        except ValueError:  # 29 Feb
            d = today.replace(year=today.year - int(years), day=28)
        return (d + timedelta(days=int(extra_days))).isoformat()

    @keyword("Should Be Sorted")
    def should_be_sorted(self, values, descending=False):
        """Fails if ``values`` (numbers or strings) is not sorted."""
        descending = str(descending).lower() in ("true", "1", "yes")
        expected = sorted(values, reverse=descending)
        if list(values) != expected:
            raise AssertionError(f"List is not sorted {'descending' if descending else 'ascending'}:\n{values}")
