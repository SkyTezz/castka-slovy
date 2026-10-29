"""castka_na_slova against hand-written cases (cases.json, shared with the JS tests) and an
independent reader that turns the words back into a number, checking gender and plural forms.

Before 1.0.1 every thousands group ending in 1 lost its "jeden": 21 000 read "dvacet tisíc".
"""

import itertools
import json
from pathlib import Path

import pytest

from castka_slovy import castka_na_slova

CASES = json.loads((Path(__file__).parents[2] / "cases.json").read_text(encoding="utf-8"))["cases"]

# Independent reader: Czech number words back to an integer (whole part, before the currency word).
_UNITS = {"nula": 0, "jeden": 1, "jedna": 1, "jedno": 1, "dva": 2, "dvě": 2, "tři": 3, "čtyři": 4,
          "pět": 5, "šest": 6, "sedm": 7, "osm": 8, "devět": 9}
_TEENS = {"deset": 10, "jedenáct": 11, "dvanáct": 12, "třináct": 13, "čtrnáct": 14, "patnáct": 15,
          "šestnáct": 16, "sedmnáct": 17, "osmnáct": 18, "devatenáct": 19}
_TENS = {"dvacet": 20, "třicet": 30, "čtyřicet": 40, "padesát": 50, "šedesát": 60, "sedmdesát": 70,
         "osmdesát": 80, "devadesát": 90}
_HUNDRED_SUFFIXES = {"stě", "sta", "set"}
# scale -> (forms for 1, 2-4, 5+), the unit words its count may NOT use (grammatical gender)
_SCALES = {
    1_000_000_000: (("miliarda", "miliardy", "miliard"), {"jeden", "dva", "jedno"}),
    1_000_000: (("milion", "miliony", "milionů"), {"jedna", "dvě", "jedno"}),
    1_000: (("tisíc", "tisíce", "tisíc"), {"jedna", "dvě", "jedno"}),
}
_SCALE_OF_WORD = {form: scale for scale, (forms, _) in _SCALES.items() for form in forms}
_CZK_FORMS = ("koruna česká", "koruny české", "korun českých")


def _form_for(count: int, forms: tuple[str, str, str]) -> str:
    if count == 1:
        return forms[0]
    if 2 <= count <= 4:
        return forms[1]
    return forms[2]


def _read_czk(text: str) -> int:
    """Parse "<number words> <koruna form>" and check every grammar rule on the way."""
    whole_words = next(text[: -len(f) - 1] for f in _CZK_FORMS if text.endswith(" " + f) or text == f)
    tokens = whole_words.split() if whole_words else []
    total, group, group_tokens = 0, 0, []
    for token in tokens:
        if token in _SCALE_OF_WORD:
            scale = _SCALE_OF_WORD[token]
            forms, forbidden = _SCALES[scale]
            count = group or 1
            assert not (group == 1 and scale == 1_000 and group_tokens), f"bare 1000 says 'tisíc' alone: {text!r}"
            assert not (set(group_tokens[-1:]) & forbidden), f"wrong gender before {token!r}: {text!r}"
            assert token == _form_for(count, forms), f"{count} × {scale} needs {_form_for(count, forms)!r}: {text!r}"
            total += count * scale
            group, group_tokens = 0, []
        elif token == "sto":
            group += 100
            group_tokens.append(token)
        elif token in _HUNDRED_SUFFIXES:
            group = group * 100
            group_tokens.append(token)
        elif token in _UNITS or token in _TEENS or token in _TENS:
            group += _UNITS.get(token, 0) + _TEENS.get(token, 0) + _TENS.get(token, 0)
            group_tokens.append(token)
        else:
            raise AssertionError(f"unknown word {token!r} in {text!r}")
    assert not (set(group_tokens[-1:]) & {"jeden", "jedno", "dva"}), f"crowns are feminine: {text!r}"
    total += group
    assert text.endswith(_form_for(total, _CZK_FORMS)), f"currency form for {total}: {text!r}"
    return total


def _group_patterns() -> list[int]:
    """Whole amounts whose every 3-digit group hits the edge values (1, 2, 21, 101 …)."""
    edges = (0, 1, 2, 4, 5, 11, 21, 22, 101, 111, 999)
    return [b * 10**9 + m * 10**6 + t * 10**3 + u
            for b, m, t, u in itertools.product((0, 1, 2), edges, edges, edges)]


@pytest.mark.parametrize("case", CASES, ids=lambda c: f"{c['amount']}-{c['currency']}")
def test_castka_na_slova_matches_shared_cases(case):
    assert castka_na_slova(case["amount"], case["currency"]) == case["words"]


def test_every_amount_up_to_150000_reads_back_to_itself():
    for amount in range(0, 150_001):
        assert _read_czk(castka_na_slova(amount)) == amount


def test_every_group_edge_pattern_up_to_billions_reads_back_to_itself():
    patterns = _group_patterns()
    assert len(patterns) == 3 * 11**3
    for amount in patterns:
        assert _read_czk(castka_na_slova(amount)) == amount




