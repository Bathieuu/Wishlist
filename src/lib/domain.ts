/**
 * Domain utilities for URL processing and validation
 */

/**
 * Extract domain from URL
 * @param url - URL string
 * @returns Domain name or null if invalid
 */
export function extractDomain(url: string): string | null {
  try {
    const urlObj = new URL(url);
    return urlObj.hostname.toLowerCase();
  } catch {
    return null;
  }
}

/**
 * Get favicon URL for a domain
 * @param domain - Domain name
 * @returns Favicon URL
 */
export function getFaviconUrl(domain: string): string {
  return `https://www.google.com/s2/favicons?domain=${encodeURIComponent(domain)}&sz=32`;
}

/**
 * Check if URL is valid and safe
 * @param url - URL string to validate
 * @returns True if URL is valid and safe
 */
export function isValidUrl(url: string): boolean {
  try {
    const urlObj = new URL(url);
    
    // Only allow http and https
    if (!['http:', 'https:'].includes(urlObj.protocol)) {
      return false;
    }

    // Block private IP ranges and localhost
    const hostname = urlObj.hostname.toLowerCase();
    
    // Block localhost variants
    if (['localhost', '127.0.0.1', '::1'].includes(hostname)) {
      return false;
    }

    // Block private IP ranges
    const ipv4Regex = /^(\d{1,3}\.){3}\d{1,3}$/;
    if (ipv4Regex.test(hostname)) {
      const parts = hostname.split('.').map(Number);
      
      // Private ranges: 10.0.0.0/8, 172.16.0.0/12, 192.168.0.0/16
      if (
        parts[0] === 10 ||
        (parts[0] === 172 && parts[1] >= 16 && parts[1] <= 31) ||
        (parts[0] === 192 && parts[1] === 168) ||
        parts[0] === 169 && parts[1] === 254 // Link-local
      ) {
        return false;
      }
    }

    // Check URL length
    if (url.length > 2048) {
      return false;
    }

    return true;
  } catch {
    return false;
  }
}

/**
 * Normalize URL by adding protocol if missing and removing fragments
 * @param url - URL string to normalize
 * @returns Normalized URL
 */
export function normalizeUrl(url: string): string {
  let normalized = url.trim();
  
  // Add protocol if missing
  if (!/^https?:\/\//i.test(normalized)) {
    normalized = `https://${normalized}`;
  }

  try {
    const urlObj = new URL(normalized);
    
    // Remove fragment
    urlObj.hash = '';
    
    // Sort query parameters for consistency
    urlObj.searchParams.sort();
    
    return urlObj.toString();
  } catch {
    return normalized;
  }
}

/**
 * Get display name for common domains
 * @param domain - Domain name
 * @returns Display name or domain
 */
export function getDomainDisplayName(domain: string): string {
  const displayNames: Record<string, string> = {
    'amazon.com': 'Amazon',
    'amazon.fr': 'Amazon France',
    'amazon.co.uk': 'Amazon UK',
    'amazon.de': 'Amazon Germany',
    'ebay.com': 'eBay',
    'ebay.fr': 'eBay France',
    'ikea.com': 'IKEA',
    'ikea.fr': 'IKEA France',
    'zalando.fr': 'Zalando',
    'cdiscount.com': 'Cdiscount',
    'fnac.com': 'Fnac',
    'darty.com': 'Darty',
    'leclerc.com': 'E.Leclerc',
    'carrefour.fr': 'Carrefour',
    'auchan.fr': 'Auchan',
    'etsy.com': 'Etsy',
    'aliexpress.com': 'AliExpress',
    'wish.com': 'Wish',
    'shopify.com': 'Shopify',
  };

  return displayNames[domain.toLowerCase()] || domain;
}
