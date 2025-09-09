/**
 * Metadata extraction utilities for HTML parsing
 * Used by backend functions to extract product information
 */

import { parsePrice, normalizeCurrency } from './price.js';

export interface ProductMetadata {
  title: string;
  imageUrl: string | null;
  priceCents: number | null;
  currency: string | null;
}

/**
 * Extract JSON-LD structured data from HTML
 * @param html - HTML content
 * @returns Product metadata or null
 */
export function extractJsonLd(html: string): ProductMetadata | null {
  try {
    // Find all JSON-LD script tags
    const jsonLdRegex = /<script[^>]*type=["']application\/ld\+json["'][^>]*>(.*?)<\/script>/gis;
    const matches = [...html.matchAll(jsonLdRegex)];

    for (const match of matches) {
      try {
        const jsonData = JSON.parse(match[1]);
        const product = findProductInJsonLd(jsonData);
        
        if (product) {
          return {
            title: product.name || '',
            imageUrl: extractImageFromJsonLd(product),
            priceCents: extractPriceFromJsonLd(product)?.priceCents || null,
            currency: extractPriceFromJsonLd(product)?.currency || null,
          };
        }
      } catch {
        continue;
      }
    }
  } catch {
    // Ignore parsing errors
  }
  
  return null;
}

/**
 * Find Product type in JSON-LD data (handles arrays and nested objects)
 */
function findProductInJsonLd(data: any): any {
  if (!data) return null;

  if (Array.isArray(data)) {
    for (const item of data) {
      const product = findProductInJsonLd(item);
      if (product) return product;
    }
    return null;
  }

  if (typeof data === 'object') {
    if (data['@type'] === 'Product') {
      return data;
    }

    // Check nested properties
    for (const value of Object.values(data)) {
      const product = findProductInJsonLd(value);
      if (product) return product;
    }
  }

  return null;
}

/**
 * Extract image URL from JSON-LD product data
 */
function extractImageFromJsonLd(product: any): string | null {
  if (!product.image) return null;

  if (typeof product.image === 'string') {
    return product.image;
  }

  if (Array.isArray(product.image)) {
    return product.image[0]?.url || product.image[0] || null;
  }

  if (typeof product.image === 'object') {
    return product.image.url || product.image['@id'] || null;
  }

  return null;
}

/**
 * Extract price from JSON-LD product data
 */
function extractPriceFromJsonLd(product: any): { priceCents: number; currency: string } | null {
  if (!product.offers) return null;

  const offers = Array.isArray(product.offers) ? product.offers : [product.offers];
  
  for (const offer of offers) {
    if (offer.price && offer.priceCurrency) {
      const price = parseFloat(offer.price);
      if (!isNaN(price)) {
        return {
          priceCents: Math.round(price * 100),
          currency: normalizeCurrency(offer.priceCurrency),
        };
      }
    }
  }

  return null;
}

/**
 * Extract Open Graph metadata from HTML
 */
export function extractOpenGraph(html: string): ProductMetadata | null {
  const ogTitle = extractMetaContent(html, 'og:title');
  const ogImage = extractMetaContent(html, 'og:image');
  
  // Twitter Cards fallback
  const twitterTitle = extractMetaContent(html, 'twitter:title');
  const twitterImage = extractMetaContent(html, 'twitter:image');

  const title = ogTitle || twitterTitle;
  const imageUrl = ogImage || twitterImage;

  if (!title) return null;

  return {
    title,
    imageUrl,
    priceCents: null,
    currency: null,
  };
}

/**
 * Extract meta content by property or name
 */
function extractMetaContent(html: string, property: string): string | null {
  const patterns = [
    new RegExp(`<meta[^>]*property=["']${property}["'][^>]*content=["']([^"']+)["']`, 'i'),
    new RegExp(`<meta[^>]*name=["']${property}["'][^>]*content=["']([^"']+)["']`, 'i'),
    new RegExp(`<meta[^>]*content=["']([^"']+)["'][^>]*property=["']${property}["']`, 'i'),
    new RegExp(`<meta[^>]*content=["']([^"']+)["'][^>]*name=["']${property}["']`, 'i'),
  ];

  for (const pattern of patterns) {
    const match = html.match(pattern);
    if (match) {
      return match[1].trim();
    }
  }

  return null;
}

/**
 * Extract title from HTML
 */
export function extractTitle(html: string): string | null {
  const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
  return titleMatch ? titleMatch[1].trim() : null;
}

/**
 * Extract first relevant image from HTML
 * Avoids logos and small images
 */
export function extractImage(html: string): string | null {
  // Look for img tags with product-related attributes
  const imgRegex = /<img[^>]*src=["']([^"']+)["'][^>]*>/gi;
  const matches = [...html.matchAll(imgRegex)];

  for (const match of matches) {
    const imgTag = match[0];
    const src = match[1];

    // Skip if likely a logo or icon
    if (
      /logo|icon|favicon/i.test(src) ||
      /logo|icon|favicon/i.test(imgTag) ||
      src.includes('data:image') ||
      src.includes('.svg')
    ) {
      continue;
    }

    // Check for size indicators that suggest it's a product image
    const widthMatch = imgTag.match(/width=["']?(\d+)/i);
    const heightMatch = imgTag.match(/height=["']?(\d+)/i);
    
    if (widthMatch && heightMatch) {
      const width = parseInt(widthMatch[1]);
      const height = parseInt(heightMatch[1]);
      
      // Skip very small images (likely icons)
      if (width < 100 || height < 100) {
        continue;
      }
    }

    // Return first suitable image
    return src.startsWith('//') ? `https:${src}` : src;
  }

  return null;
}

/**
 * Extract price from HTML text using regex patterns
 */
export function extractPriceFromText(html: string): { priceCents: number; currency: string } | null {
  // Remove HTML tags and get plain text
  const text = html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ');
  
  return parsePrice(text);
}

/**
 * Complete metadata extraction from HTML
 * Tries different methods in order of priority
 */
export function extractMetadata(html: string): ProductMetadata {
  // Try JSON-LD first (most reliable)
  const jsonLdData = extractJsonLd(html);
  if (jsonLdData && jsonLdData.title) {
    return jsonLdData;
  }

  // Try Open Graph
  const ogData = extractOpenGraph(html);
  const title = ogData?.title || extractTitle(html) || '';
  const imageUrl = ogData?.imageUrl || extractImage(html);

  // Extract price from text
  const priceData = extractPriceFromText(html);

  return {
    title,
    imageUrl,
    priceCents: priceData?.priceCents || null,
    currency: priceData?.currency || null,
  };
}
