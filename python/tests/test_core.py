import pytest

from castka_slovy import castka_na_slova


@pytest.mark.parametrize(
    ("castka", "slova"),
    [
        (1000, "tisíc korun českých"),
        (21000, "dvacet jeden tisíc korun českých"),
        (31500, "třicet jeden tisíc pět set korun českých"),
        (101000, "sto jeden tisíc korun českých"),
        (11000, "jedenáct tisíc korun českých"),
        (2000, "dva tisíce korun českých"),
        (22000, "dvacet dva tisíc korun českých"),
        (1001000, "jeden milion tisíc korun českých"),
        (1, "jedna koruna česká"),
    ],
)
def test_castka_na_slova_czk(castka, slova):
    assert castka_na_slova(castka) == slova
