import { describe, it, expect } from 'vitest';
import { extractJsonLd, extractOpenGraph, extractTitle, extractImage } from '@/lib/meta';

describe('extractJsonLd', () => {
  it('should extract product data from JSON-LD', () => {
    const html = `
      <html>
        <head>
          <script type="application/ld+json">
          {
            "@context": "https://schema.org",
            "@type": "Product",
            "name": "Test Product",
            "image": "https://example.com/image.jpg",
            "offers": {
              "@type": "Offer",
              "price": "299.99",
              "priceCurrency": "EUR"
            }
          }
          </script>
        </head>
      </html>
    `;

    const result = extractJsonLd(html);
    expect(result).toEqual({
      title: 'Test Product',
      imageUrl: 'https://example.com/image.jpg',
      priceCents: 29999,
      currency: 'EUR',
    });
  });

  it('should handle multiple JSON-LD scripts', () => {
    const html = `
      <html>
        <head>
          <script type="application/ld+json">
          {
            "@type": "WebSite",
            "name": "Example Site"
          }
          </script>
          <script type="application/ld+json">
          {
            "@type": "Product",
            "name": "Test Product",
            "offers": {
              "price": "199.99",
              "priceCurrency": "USD"
            }
          }
          </script>
        </head>
      </html>
    `;

    const result = extractJsonLd(html);
    expect(result?.title).toBe('Test Product');
    expect(result?.priceCents).toBe(19999);
    expect(result?.currency).toBe('USD');
  });

  it('should return null for invalid JSON-LD', () => {
    const html = `
      <html>
        <head>
          <script type="application/ld+json">
          { invalid json }
          </script>
        </head>
      </html>
    `;

    const result = extractJsonLd(html);
    expect(result).toBeNull();
  });

  it('should return null when no product found', () => {
    const html = `
      <html>
        <head>
          <script type="application/ld+json">
          {
            "@type": "WebSite",
            "name": "Example Site"
          }
          </script>
        </head>
      </html>
    `;

    const result = extractJsonLd(html);
    expect(result).toBeNull();
  });
});

describe('extractOpenGraph', () => {
  it('should extract Open Graph data', () => {
    const html = `
      <html>
        <head>
          <meta property="og:title" content="Test Product" />
          <meta property="og:image" content="https://example.com/image.jpg" />
        </head>
      </html>
    `;

    const result = extractOpenGraph(html);
    expect(result).toEqual({
      title: 'Test Product',
      imageUrl: 'https://example.com/image.jpg',
      priceCents: null,
      currency: null,
    });
  });

  it('should fallback to Twitter Cards', () => {
    const html = `
      <html>
        <head>
          <meta name="twitter:title" content="Twitter Title" />
          <meta name="twitter:image" content="https://example.com/twitter-image.jpg" />
        </head>
      </html>
    `;

    const result = extractOpenGraph(html);
    expect(result).toEqual({
      title: 'Twitter Title',
      imageUrl: 'https://example.com/twitter-image.jpg',
      priceCents: null,
      currency: null,
    });
  });

  it('should prefer Open Graph over Twitter Cards', () => {
    const html = `
      <html>
        <head>
          <meta property="og:title" content="OG Title" />
          <meta name="twitter:title" content="Twitter Title" />
          <meta property="og:image" content="https://example.com/og-image.jpg" />
          <meta name="twitter:image" content="https://example.com/twitter-image.jpg" />
        </head>
      </html>
    `;

    const result = extractOpenGraph(html);
    expect(result).toEqual({
      title: 'OG Title',
      imageUrl: 'https://example.com/og-image.jpg',
      priceCents: null,
      currency: null,
    });
  });

  it('should return null when no title found', () => {
    const html = `
      <html>
        <head>
          <meta property="og:image" content="https://example.com/image.jpg" />
        </head>
      </html>
    `;

    const result = extractOpenGraph(html);
    expect(result).toBeNull();
  });
});

describe('extractTitle', () => {
  it('should extract title from HTML', () => {
    const html = `
      <html>
        <head>
          <title>Test Page Title</title>
        </head>
      </html>
    `;

    const result = extractTitle(html);
    expect(result).toBe('Test Page Title');
  });

  it('should handle titles with extra whitespace', () => {
    const html = `
      <html>
        <head>
          <title>   Test Title   </title>
        </head>
      </html>
    `;

    const result = extractTitle(html);
    expect(result).toBe('Test Title');
  });

  it('should return null when no title found', () => {
    const html = '<html><head></head></html>';
    const result = extractTitle(html);
    expect(result).toBeNull();
  });
});

describe('extractImage', () => {
  it('should extract first relevant image', () => {
    const html = `
      <html>
        <body>
          <img src="https://example.com/logo.svg" alt="logo" />
          <img src="https://example.com/product.jpg" width="300" height="300" alt="product" />
        </body>
      </html>
    `;

    const result = extractImage(html);
    expect(result).toBe('https://example.com/product.jpg');
  });

  it('should skip small images', () => {
    const html = `
      <html>
        <body>
          <img src="https://example.com/small.jpg" width="50" height="50" alt="small" />
          <img src="https://example.com/large.jpg" width="400" height="400" alt="large" />
        </body>
      </html>
    `;

    const result = extractImage(html);
    expect(result).toBe('https://example.com/large.jpg');
  });

  it('should skip logos and icons', () => {
    const html = `
      <html>
        <body>
          <img src="https://example.com/logo.png" alt="logo" />
          <img src="https://example.com/icon.png" alt="icon" />
          <img src="https://example.com/product.jpg" alt="product" />
        </body>
      </html>
    `;

    const result = extractImage(html);
    expect(result).toBe('https://example.com/product.jpg');
  });

  it('should handle protocol-relative URLs', () => {
    const html = `
      <html>
        <body>
          <img src="//example.com/image.jpg" width="300" height="300" alt="product" />
        </body>
      </html>
    `;

    const result = extractImage(html);
    expect(result).toBe('https://example.com/image.jpg');
  });

  it('should return null when no suitable image found', () => {
    const html = `
      <html>
        <body>
          <img src="https://example.com/logo.svg" alt="logo" />
          <img src="data:image/gif;base64,..." alt="inline" />
        </body>
      </html>
    `;

    const result = extractImage(html);
    expect(result).toBeNull();
  });
});
