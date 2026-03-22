import math
import re

RADY = [
    ["", "", ""],
    ["tisíc",   "tisíc",    "tisíce" ],
    ["milionů", "milion",   "miliony"],
    ["miliard", "miliarda", "miliardy"]
]

STOVKY = ["", "sto", "dvě stě", "tři sta", "čtyři sta", "pět set", "šest set", "sedm set", "osm set", "devět set"]
DESITKY = ["", "deset", "dvacet", "třicet", "čtyřicet", "padesát", "šedesát", "sedmdesát", "osmdesát", "devadesát"]
NACTI = ["deset", "jedenáct", "dvanáct", "třináct", "čtrnáct", "patnáct", "šestnáct", "sedmnáct", "osmnáct", "devatenáct"]
JEDNOTKY = ["", "jeden", "dva", "tři", "čtyři", "pět", "šest", "sedm", "osm", "devět"]

MENY = {
    'CZK': {'cele': ['korun českých', 'koruna česká', 'koruny české'], 'rodC': 'F', 'drobne': ['haléřů', 'haléř', 'haléře'], 'rodD': 'M'},
    'EUR': {'cele': ['eur', 'euro', 'eura'], 'rodC': 'N', 'drobne': ['centů', 'cent', 'centy'], 'rodD': 'M'},
    'USD': {'cele': ['amerických dolarů', 'americký dolar', 'americké dolary'], 'rodC': 'M', 'drobne': ['centů', 'cent', 'centy'], 'rodD': 'M'}
}

def sklonuj_slovo(cislo, tvary):
    if cislo == 1: return tvary[1]
    if 2 <= cislo <= 4: return tvary[2]
    return tvary[0]

def ziskej_jednotku(cislo, index_radu, rod):
    if cislo == 0: return ""
    if index_radu == 1 and cislo == 1: return "" 

    if cislo == 1:
        if index_radu == 3 or (index_radu == 0 and rod == 'F'): return "jedna"
        if index_radu == 0 and rod == 'N': return "jedno"
        return "jeden"

    if cislo == 2:
        if index_radu == 3 or (index_radu == 0 and rod in ['F', 'N']): return "dvě"
        return "dva"

    return JEDNOTKY[cislo]

def zpracuj_trojcisli(cislo, index_radu, rod='M'):
    if cislo == 0: return ""

    slova = []
    pocet_stovek = cislo // 100
    zbytek = cislo % 100

    if pocet_stovek > 0: slova.append(STOVKY[pocet_stovek])

    if 10 <= zbytek < 20:
        slova.append(NACTI[zbytek - 10])
    else:
        pocet_desitek = zbytek // 10
        pocet_jednotek = zbytek % 10

        if pocet_desitek > 0: slova.append(DESITKY[pocet_desitek])
        if pocet_jednotek > 0:
            text_jednotky = ziskej_jednotku(pocet_jednotek, index_radu, rod)
            if text_jednotky: slova.append(text_jednotky)

    return " ".join(slova)

def castka_na_slova(castka, kod_meny='CZK'):
    if isinstance(castka, str):
        try:
            castka = float(castka.replace(" ", "").replace(",", "."))
        except ValueError:
            return ""

    if not isinstance(castka, (int, float)): return ""

    mena = MENY.get(kod_meny, MENY['CZK'])
    zaporne = castka < 0
    castka = abs(castka)

    celkem_haleru = round(castka * 100)
    cele_cislo = celkem_haleru // 100
    desetinne_cislo = celkem_haleru % 100

    vysledek_pole = []
    zbyvajici_cislo = cele_cislo
    aktualni_rad = 0

    if cele_cislo == 0:
        vysledek_pole.append("nula")
    else:
        while zbyvajici_cislo > 0:
            trojcisli = zbyvajici_cislo % 1000
            if trojcisli > 0:
                slova_trojcisli = zpracuj_trojcisli(trojcisli, aktualni_rad, mena['rodC'])
                tvar_radu = sklonuj_slovo(trojcisli, RADY[aktualni_rad]) if aktualni_rad > 0 else ""

                vysledek_pole.insert(0, f"{slova_trojcisli} {tvar_radu}".strip())

            zbyvajici_cislo = zbyvajici_cislo // 1000
            aktualni_rad += 1

    text = " ".join(vysledek_pole).strip() + " " + sklonuj_slovo(cele_cislo, mena['cele'])

    if desetinne_cislo > 0:
        slova_desetinne = zpracuj_trojcisli(desetinne_cislo, 0, mena['rodD'])
        text += f" {slova_desetinne} " + sklonuj_slovo(desetinne_cislo, mena['drobne'])

    if zaporne: text = "mínus " + text

    return re.sub(r'\s+', ' ', text).strip()
