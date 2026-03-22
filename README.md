# castka-slovy

Převod číselné peněžní částky na česká slova. Podporuje CZK, EUR a USD.

Convert monetary amounts to Czech words. Supports CZK, EUR and USD.

Konvertiert Geldbeträge in tschechische Wörter. Unterstützt CZK, EUR und USD.

---

## JavaScript

```js
const { castkaNaSlova } = require('./javascript/index');

castkaNaSlova(1);              // "jedna koruna česká"
castkaNaSlova(1234.56);        // "jeden tisíc dvě stě třicet čtyři koruny české padesát šest haléřů"
castkaNaSlova(1, 'EUR');       // "jedno euro"
castkaNaSlova(1.99, 'EUR');    // "jedno euro devadesát devět centů"
castkaNaSlova(1, 'USD');       // "jeden americký dolar"
```

## Python

```python
from castka_slovy import castka_na_slova

castka_na_slova(1)             # "jedna koruna česká"
castka_na_slova(1234.56)       # "jeden tisíc dvě stě třicet čtyři koruny české padesát šest haléřů"
castka_na_slova(1, 'EUR')      # "jedno euro"
castka_na_slova(1.99, 'EUR')   # "jedno euro devadesát devět centů"
castka_na_slova(1, 'USD')      # "jeden americký dolar"
```

## Licence / License / Lizenz

MIT
