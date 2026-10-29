// castkaNaSlova against cases.json (shared with the Python tests) and an independent reader.
// Before 1.0.1 every thousands group ending in 1 lost its "jeden": 21 000 read "dvacet tisíc".
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const test = require("node:test");

const { castkaNaSlova } = require("./index.js");
const CASES = JSON.parse(fs.readFileSync(path.join(__dirname, "..", "cases.json"), "utf8")).cases;

// Independent reader: Czech number words back to an integer, checking gender and plural forms.
const UNITS = { nula: 0, jeden: 1, jedna: 1, jedno: 1, dva: 2, "dvě": 2, "tři": 3, "čtyři": 4, "pět": 5, "šest": 6, sedm: 7, osm: 8, "devět": 9 };
const TEENS = { deset: 10, "jedenáct": 11, "dvanáct": 12, "třináct": 13, "čtrnáct": 14, "patnáct": 15, "šestnáct": 16, "sedmnáct": 17, "osmnáct": 18, "devatenáct": 19 };
const TENS = { dvacet: 20, "třicet": 30, "čtyřicet": 40, "padesát": 50, "šedesát": 60, "sedmdesát": 70, "osmdesát": 80, "devadesát": 90 };
const HUNDRED_SUFFIXES = new Set(["stě", "sta", "set"]);
const SCALES = [
    [1e9, ["miliarda", "miliardy", "miliard"], new Set(["jeden", "dva", "jedno"])],
    [1e6, ["milion", "miliony", "milionů"], new Set(["jedna", "dvě", "jedno"])],
    [1e3, ["tisíc", "tisíce", "tisíc"], new Set(["jedna", "dvě", "jedno"])],
];
const CZK_FORMS = ["koruna česká", "koruny české", "korun českých"];

function formFor(count, forms) {
    if (count === 1) return forms[0];
    if (count >= 2 && count <= 4) return forms[1];
    return forms[2];
}

function check(ok, message) {
    if (!ok) assert.fail(message());
}

function readCzk(text) {
    const czk = CZK_FORMS.find(f => text.endsWith(" " + f));
    check(czk, () => `no currency word: ${text}`);
    const tokens = text.slice(0, -czk.length - 1).split(" ").filter(Boolean);
    let total = 0, group = 0, groupTokens = [];
    for (const token of tokens) {
        const scale = SCALES.find(([, forms]) => forms.includes(token));
        if (scale) {
            const [base, forms, forbidden] = scale;
            const count = group || 1;
            check(!(base === 1e3 && group === 1 && groupTokens.length), () => `bare 1000 says "tisíc" alone: ${text}`);
            check(!forbidden.has(groupTokens[groupTokens.length - 1]), () => `wrong gender before ${token}: ${text}`);
            check(token === formFor(count, forms), () => `${count} x ${base} needs ${formFor(count, forms)}: ${text}`);
            total += count * base;
            group = 0; groupTokens = [];
        } else if (token === "sto") {
            group += 100; groupTokens.push(token);
        } else if (HUNDRED_SUFFIXES.has(token)) {
            group *= 100; groupTokens.push(token);
        } else if (token in UNITS || token in TEENS || token in TENS) {
            group += (UNITS[token] || 0) + (TEENS[token] || 0) + (TENS[token] || 0); groupTokens.push(token);
        } else {
            check(false, () => `unknown word ${token} in ${text}`);
        }
    }
    check(!["jeden", "jedno", "dva"].includes(groupTokens[groupTokens.length - 1]), () => `crowns are feminine: ${text}`);
    total += group;
    check(czk === formFor(total, CZK_FORMS), () => `currency form for ${total}: ${text}`);
    return total;
}

function groupPatterns() {
    const edges = [0, 1, 2, 4, 5, 11, 21, 22, 101, 111, 999];
    const out = [];
    for (const b of [0, 1, 2]) for (const m of edges) for (const t of edges) for (const u of edges) {
        out.push(b * 1e9 + m * 1e6 + t * 1e3 + u);
    }
    return out;
}

test("castkaNaSlova matches the shared parity cases", () => {
    for (const c of CASES) {
        assert.equal(castkaNaSlova(c.amount, c.currency), c.words, `${c.amount} ${c.currency}`);
    }
});

test("every amount up to 150 000 reads back to itself", () => {
    for (let amount = 1; amount <= 150000; amount++) {
        const words = castkaNaSlova(amount);
        check(readCzk(words) === amount, () => `${amount} reads back as ${readCzk(words)}: ${words}`);
    }
});

test("every group edge pattern up to billions reads back to itself", () => {
    const patterns = groupPatterns().filter(n => n > 0);
    assert.equal(patterns.length, 3 * 11 ** 3 - 1);
    for (const amount of patterns) {
        const words = castkaNaSlova(amount);
        check(readCzk(words) === amount, () => `${amount} reads back as ${readCzk(words)}: ${words}`);
    }
});
