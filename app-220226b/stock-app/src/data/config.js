// ─── src/data/config.js ───────────────────────────────────────────────────────
// Single source of truth untuk konfigurasi mata uang dan kurs.
// DEFAULT_* digunakan sebagai initial state di ConfigScreen.
// Konvensi kurs: 1 [mata_uang] = X IDR
// ─────────────────────────────────────────────────────────────────────────────

export const DEFAULT_CURRENCIES = [
  { code: 'USD', name: 'US Dollar',       symbol: '$'  },
  { code: 'CNY', name: 'Yuan Tiongkok',   symbol: '¥'  },
  { code: 'JPY', name: 'Yen Jepang',      symbol: '¥'  },
  { code: 'SGD', name: 'Dolar Singapura', symbol: 'S$' },
  { code: 'AUD', name: 'Dolar Australia', symbol: 'A$' },
];

export const DEFAULT_KURS = {
  USD: 16285.00,
  CNY:  2185.50,
  JPY:   110.23,
  SGD: 11950.00,
  AUD: 10320.00,
};

// Re-export dengan nama lama agar tidak breaking import di products.js
export const CURRENCIES = DEFAULT_CURRENCIES;
export const KURS       = DEFAULT_KURS;

// ─── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Konversi nilai mata uang asing ke IDR menggunakan kurs yang diberikan.
 * @param {number} amount
 * @param {string} currencyCode
 * @param {object} kurs — object kurs aktif (bisa dari state, bukan hanya DEFAULT_KURS)
 * @returns {number|null}
 */
export function toIDR(amount, currencyCode, kurs = DEFAULT_KURS) {
  const rate = kurs[currencyCode];
  if (rate == null) return null;
  return amount * rate;
}

/**
 * Ambil simbol mata uang dari list currencies yang diberikan.
 * @param {string} currencyCode
 * @param {Array}  currencies — bisa dari state aktif
 * @returns {string}
 */
export function getCurrencySymbol(currencyCode, currencies = DEFAULT_CURRENCIES) {
  const currency = currencies.find(c => c.code === currencyCode);
  return currency ? currency.symbol : currencyCode;
}

/**
 * Format nilai mata uang asing dengan simbol.
 * @param {number} amount
 * @param {string} currencyCode
 * @param {Array}  currencies
 * @returns {string}
 */
export function formatForeign(amount, currencyCode, currencies = DEFAULT_CURRENCIES) {
  const symbol = getCurrencySymbol(currencyCode, currencies);
  return `${symbol} ${amount.toLocaleString('id-ID')}`;
}

/**
 * Format angka ke Rupiah.
 * @param {number} amount
 * @returns {string}
 */
export function formatRp(amount) {
  return 'Rp ' + amount.toLocaleString('id-ID');
}