const assert = require("node:assert/strict");
const test = require("node:test");
const { castkaNaSlova } = require("./index.js");

test("jednička v řádu tisíců se říká, kromě samotné tisícovky", () => {
    const pripady = [
        [1000, "tisíc korun českých"],
        [21000, "dvacet jeden tisíc korun českých"],
        [31500, "třicet jeden tisíc pět set korun českých"],
        [101000, "sto jeden tisíc korun českých"],
        [11000, "jedenáct tisíc korun českých"],
        [2000, "dva tisíce korun českých"],
        [22000, "dvacet dva tisíc korun českých"],
        [1001000, "jeden milion tisíc korun českých"],
    ];
    for (const [castka, slova] of pripady) {
        assert.equal(castkaNaSlova(castka), slova, `castka ${castka}`);
    }
});
