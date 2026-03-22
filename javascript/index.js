'use strict';

const RADY = [
    ["", "", ""],                          // 0: Jednotky
    ["tisíc",   "tisíc",    "tisíce" ],    // 1: Tisíce  [5+, 1, 2-4]
    ["milionů", "milion",   "miliony"],    // 2: Miliony  [5+, 1, 2-4]
    ["miliard", "miliarda", "miliardy"],   // 3: Miliardy [5+, 1, 2-4]
];

const STOVKY = ["", "sto", "dvě stě", "tři sta", "čtyři sta", "pět set", "šest set", "sedm set", "osm set", "devět set"];
const DESITKY = ["", "deset", "dvacet", "třicet", "čtyřicet", "padesát", "šedesát", "sedmdesát", "osmdesát", "devadesát"];
const NACTI = ["deset", "jedenáct", "dvanáct", "třináct", "čtrnáct", "patnáct", "šestnáct", "sedmnáct", "osmnáct", "devatenáct"];
const JEDNOTKY = ["", "jeden", "dva", "tři", "čtyři", "pět", "šest", "sedm", "osm", "devět"];

const MENY = {
    'CZK': { cele: ['korun českých', 'koruna česká', 'koruny české'], rodC: 'F', drobne: ['haléřů', 'haléř', 'haléře'], rodD: 'M' },
    'EUR': { cele: ['eur', 'euro', 'eura'], rodC: 'N', drobne: ['centů', 'cent', 'centy'], rodD: 'M' },
    'USD': { cele: ['amerických dolarů', 'americký dolar', 'americké dolary'], rodC: 'M', drobne: ['centů', 'cent', 'centy'], rodD: 'M' }
};

function sklonujSlovo(cislo, tvary) {
    if (cislo === 1) return tvary[1];
    if (cislo >= 2 && cislo <= 4) return tvary[2];
    return tvary[0];
}

function ziskejJednotku(cislo, indexRadu, rod) {
    if (cislo === 0) return "";
    if (indexRadu === 1 && cislo === 1) return ""; // Neříkáme "jeden tisíc"

    if (cislo === 1) {
        if (indexRadu === 3 || (indexRadu === 0 && rod === 'F')) return "jedna";
        if (indexRadu === 0 && rod === 'N') return "jedno";
        return "jeden";
    }
    if (cislo === 2) {
        if (indexRadu === 3 || (indexRadu === 0 && (rod === 'F' || rod === 'N'))) return "dvě";
        return "dva";
    }

    return JEDNOTKY[cislo];
}

function zpracujTrojcisli(cislo, indexRadu, rod = 'M') {
    if (cislo === 0) return "";

    let slova = [];
    let pocetStovek = Math.floor(cislo / 100);
    let zbytek = cislo % 100;

    if (pocetStovek > 0) slova.push(STOVKY[pocetStovek]);

    if (zbytek >= 10 && zbytek < 20) {
        slova.push(NACTI[zbytek - 10]);
    } else {
        let pocetDesitek = Math.floor(zbytek / 10);
        let pocetJednotek = zbytek % 10;

        if (pocetDesitek > 0) slova.push(DESITKY[pocetDesitek]);
        if (pocetJednotek > 0) {
            let textJednotky = ziskejJednotku(pocetJednotek, indexRadu, rod);
            if (textJednotky) slova.push(textJednotky);
        }
    }

    return slova.join(" ");
}

function castkaNaSlova(castka, kodMeny = 'CZK') {
    if (typeof castka === 'string') castka = parseFloat(castka.replace(/\s/g, "").replace(",", "."));
    if (isNaN(castka)) return "";

    let mena = MENY[kodMeny] || MENY['CZK'];
    let zaporne = castka < 0;
    castka = Math.abs(castka);

    // Převod na haléře eliminuje chyby plovoucí desetinné čárky
    let celkemHaleru = Math.round(castka * 100);
    let celeCislo = Math.floor(celkemHaleru / 100);
    let desetinneCislo = celkemHaleru % 100;

    let vysledekPole = [];
    let zbyvajiciCislo = celeCislo;
    let aktualniRad = 0;

    if (celeCislo === 0) {
        vysledekPole.push("nula");
    } else {
        while (zbyvajiciCislo > 0) {
            let trojcisli = zbyvajiciCislo % 1000;
            if (trojcisli > 0) {
                let slovaTrojcisli = zpracujTrojcisli(trojcisli, aktualniRad, mena.rodC);
                let tvarRadu = aktualniRad > 0 ? sklonujSlovo(trojcisli, RADY[aktualniRad]) : "";

                vysledekPole.unshift(`${slovaTrojcisli} ${tvarRadu}`.trim());
            }
            zbyvajiciCislo = Math.floor(zbyvajiciCislo / 1000);
            aktualniRad++;
        }
    }

    let text = vysledekPole.join(" ").trim() + " " + sklonujSlovo(celeCislo, mena.cele);

    if (desetinneCislo > 0) {
        let slovaDesetinne = zpracujTrojcisli(desetinneCislo, 0, mena.rodD);
        text += " " + slovaDesetinne + " " + sklonujSlovo(desetinneCislo, mena.drobne);
    }

    if (zaporne) text = "mínus " + text;

    return text.replace(/\s+/g, ' ').trim();
}

module.exports = { castkaNaSlova };
