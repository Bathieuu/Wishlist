import { describe, it, expect } from 'vitest';
import { parsePrice, formatPrice, normalizeCurrency } from '@/lib/price';

describe('parsePrice', () => {
  it('should parse French format prices', () => {
    expect(parsePrice('1 299,99 €')).toEqual({ priceCents: 129999, currency: 'EUR' });
    expect(parsePrice('15,50€')).toEqual({ priceCents: 1550, currency: 'EUR' });
    expect(parsePrice('999€')).toEqual({ priceCents: 99900, currency: 'EUR' });
  });

  it('should parse US format prices', () => {
    expect(parsePrice('$1,299.99')).toEqual({ priceCents: 129999, currency: 'USD' });
    expect(parsePrice('$ 15.50')).toEqual({ priceCents: 1550, currency: 'USD' });
    expect(parsePrice('$999')).toEqual({ priceCents: 99900, currency: 'USD' });
  });

  it('should parse UK format prices', () => {
    expect(parsePrice('£1,299.99')).toEqual({ priceCents: 129999, currency: 'GBP' });
    expect(parsePrice('£15.50')).toEqual({ priceCents: 1550, currency: 'GBP' });
    expect(parsePrice('£999')).toEqual({ priceCents: 99900, currency: 'GBP' });
  });

  it('should parse currency codes', () => {
    expect(parsePrice('1299.99 USD')).toEqual({ priceCents: 129999, currency: 'USD' });
    expect(parsePrice('CHF 1299.99')).toEqual({ priceCents: 129999, currency: 'CHF' });
  });

  it('should handle complex text with prices', () => {
    const text = 'Product price: 1 299,99 € (includes VAT)';
    expect(parsePrice(text)).toEqual({ priceCents: 129999, currency: 'EUR' });
  });

  it('should return null for invalid input', () => {
    expect(parsePrice('')).toBeNull();
    expect(parsePrice('no price here')).toBeNull();
    expect(parsePrice('€')).toBeNull();
  });

  it('should handle edge cases', () => {
    expect(parsePrice('0€')).toBeNull(); // Zero price should be ignored
    expect(parsePrice('1.999,99 €')).toEqual({ priceCents: 199999, currency: 'EUR' }); // German style with dots
  });
});

describe('formatPrice', () => {
  it('should format prices correctly', () => {
    // Test with actual browser locale behavior - may vary by system
    const formatted = formatPrice(129999, 'EUR');
    expect(formatted).toContain('1,299.99'); // Should contain the basic price with comma separator
    expect(formatted).toContain('€'); // Should contain Euro symbol
    
    const formattedUSD = formatPrice(1550, 'USD');
    expect(formattedUSD).toContain('15.50');
    expect(formattedUSD).toContain('$');
  });

  it('should handle null values', () => {
    expect(formatPrice(null, 'EUR')).toBe('—');
    expect(formatPrice(undefined as any, 'EUR')).toBe('—');
  });

  it('should handle missing currency', () => {
    expect(formatPrice(129999, null)).toBe('1299.99');
  });

  it('should handle invalid currency gracefully', () => {
    expect(formatPrice(129999, 'INVALID')).toBe('1299.99 INVALID');
  });
});

describe('normalizeCurrency', () => {
  it('should normalize currency symbols', () => {
    expect(normalizeCurrency('€')).toBe('EUR');
    expect(normalizeCurrency('$')).toBe('USD');
    expect(normalizeCurrency('£')).toBe('GBP');
    expect(normalizeCurrency('¥')).toBe('JPY');
  });

  it('should keep valid currency codes', () => {
    expect(normalizeCurrency('USD')).toBe('USD');
    expect(normalizeCurrency('EUR')).toBe('EUR');
    expect(normalizeCurrency('CHF')).toBe('CHF');
  });

  it('should uppercase currency codes', () => {
    expect(normalizeCurrency('usd')).toBe('USD');
    expect(normalizeCurrency('eur')).toBe('EUR');
  });
});
