/**
 * Utility functions for parsing and formatting prices
 */

// Common currency symbols and their ISO codes
const CURRENCY_MAP: Record<string, string> = {
  '€': 'EUR',
  '$': 'USD',
  '£': 'GBP',
  '¥': 'JPY',
  '₹': 'INR',
  '₽': 'RUB',
  'CHF': 'CHF',
  'CAD': 'CAD',
  'AUD': 'AUD',
  'SEK': 'SEK',
  'NOK': 'NOK',
  'DKK': 'DKK',
};

// Regex patterns for different price formats
const PRICE_PATTERNS = [
  // French format: 1 299,99 € or 1.299,99€
  /(?:^|\s)([\d\s.]+)[,](\d{2})\s*€/g,
  // US format: $1,299.99
  /\$\s*([\d,]+)\.(\d{2})/g,
  // UK format: £1,299.99
  /£\s*([\d,]+)\.(\d{2})/g,
  // General format with currency symbol at end: 1299.99 USD
  /([\d,]+)\.(\d{2})\s*([A-Z]{3})/g,
  // General format with currency symbol at start: USD 1299.99
  /([A-Z]{3})\s*([\d,]+)\.(\d{2})/g,
  // Simple number with currency at start: $1299, €1299
  /([€$£¥₹₽])\s*([\d,]+)(?:\.(\d{2}))?/g,
  // Simple number with currency at end: 1299€, 1299$
  /([\d,]+)\s*€/g,
  /([\d,]+)\s*\$/g,
  // CHF special case: CHF 1299.99
  /CHF\s*([\d,]+)\.(\d{2})/g,
];

/**
 * Extract price information from a text string
 * @param text - Text to parse for price information
 * @returns Object with price in cents and currency, or null if no price found
 */
export function parsePrice(text: string): { priceCents: number; currency: string } | null {
  if (!text) return null;

  // Clean text and normalize spaces
  const cleanText = text.replace(/\s+/g, ' ').trim();

  for (const pattern of PRICE_PATTERNS) {
    pattern.lastIndex = 0; // Reset regex state
    let match;
    while ((match = pattern.exec(cleanText)) !== null) {
      try {
        let priceCents: number = 0;
        let currency: string = '';

        if (pattern === PRICE_PATTERNS[0]) {
          // French format: 1 299,99 €
          const wholePart = match[1].replace(/\s/g, '').replace(/\./g, '');
          const decimalPart = match[2];
          priceCents = parseInt(wholePart) * 100 + parseInt(decimalPart);
          currency = 'EUR';
        } else if (pattern === PRICE_PATTERNS[1]) {
          // US format: $1,299.99
          const wholePart = match[1].replace(/,/g, '');
          const decimalPart = match[2];
          priceCents = parseInt(wholePart) * 100 + parseInt(decimalPart);
          currency = 'USD';
        } else if (pattern === PRICE_PATTERNS[2]) {
          // UK format: £1,299.99
          const wholePart = match[1].replace(/,/g, '');
          const decimalPart = match[2];
          priceCents = parseInt(wholePart) * 100 + parseInt(decimalPart);
          currency = 'GBP';
        } else if (pattern === PRICE_PATTERNS[3]) {
          // Format: 1299.99 USD
          const wholePart = match[1].replace(/,/g, '');
          const decimalPart = match[2];
          priceCents = parseInt(wholePart) * 100 + parseInt(decimalPart);
          currency = match[3];
        } else if (pattern === PRICE_PATTERNS[4]) {
          // Format: USD 1299.99
          const wholePart = match[2].replace(/,/g, '');
          const decimalPart = match[3];
          priceCents = parseInt(wholePart) * 100 + parseInt(decimalPart);
          currency = match[1];
        } else if (pattern === PRICE_PATTERNS[5]) {
          // Simple format with symbol
          const symbol = match[1];
          const wholePart = match[2].replace(/,/g, '');
          const decimalPart = match[3] || '00'; // Default to 00 if no decimal part
          priceCents = parseInt(wholePart) * 100 + parseInt(decimalPart);
          currency = CURRENCY_MAP[symbol] || symbol;
        } else if (pattern === PRICE_PATTERNS[6]) {
          // Simple Euro at end: 999€
          const wholePart = match[1].replace(/,/g, '');
          priceCents = parseInt(wholePart) * 100;
          currency = 'EUR';
        } else if (pattern === PRICE_PATTERNS[7]) {
          // Simple Dollar at end: 999$
          const wholePart = match[1].replace(/,/g, '');
          priceCents = parseInt(wholePart) * 100;
          currency = 'USD';
        } else if (pattern === PRICE_PATTERNS[8]) {
          // CHF format
          const wholePart = match[1].replace(/,/g, '');
          const decimalPart = match[2];
          priceCents = parseInt(wholePart) * 100 + parseInt(decimalPart);
          currency = 'CHF';
        }

        if (priceCents > 0 && currency) {
          return { priceCents, currency };
        }
      } catch (error) {
        // Continue to next match if parsing fails
        continue;
      }
    }
  }

  return null;
}

/**
 * Format price in cents to a human-readable string
 * @param priceCents - Price in cents
 * @param currency - Currency code
 * @param locale - Locale for formatting (defaults to browser locale)
 * @returns Formatted price string
 */
export function formatPrice(
  priceCents: number | null,
  currency: string | null,
  locale?: string
): string {
  if (priceCents === null || priceCents === undefined) {
    return '—';
  }

  const price = priceCents / 100;
  
  if (!currency) {
    return price.toFixed(2);
  }

  try {
    return new Intl.NumberFormat(locale || navigator.language, {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(price);
  } catch (error) {
    // Fallback if currency is not supported
    return `${price.toFixed(2)} ${currency}`;
  }
}

/**
 * Normalize currency code to ISO 4217 standard when possible
 * @param currency - Currency symbol or code
 * @returns Normalized currency code
 */
export function normalizeCurrency(currency: string): string {
  return CURRENCY_MAP[currency] || currency.toUpperCase();
}
