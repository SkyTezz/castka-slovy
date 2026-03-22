export type KodMeny = 'CZK' | 'EUR' | 'USD';

/**
 * Převede číselnou částku na česká slova.
 * Converts a monetary amount to Czech words.
 *
 * @param castka  - Číselná hodnota (např. 1234.56)
 * @param kodMeny - Kód měny: 'CZK' (výchozí), 'EUR' nebo 'USD'
 * @returns Textová reprezentace částky v češtině
 *
 * @example
 * castkaNaSlova(1);             // "jedna koruna česká"
 * castkaNaSlova(1234.56);       // "jeden tisíc dvě stě třicet čtyři koruny české padesát šest haléřů"
 * castkaNaSlova(1, 'EUR');      // "jedno euro"
 * castkaNaSlova(1, 'USD');      // "jeden americký dolar"
 */
export function castkaNaSlova(castka: number | string, kodMeny?: KodMeny): string;
