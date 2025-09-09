import { Handler, HandlerEvent } from '@netlify/functions';
import { fetch } from 'undici';
import { parseHTML } from 'linkedom';
import { extractDomain, isValidUrl, normalizeUrl } from '../../src/lib/domain';
import { extractMetadata } from '../../src/lib/meta';

// Rate limiting storage (in-memory, could be replaced with Redis/KV)
const rateLimits = new Map<string, { count: number; resetTime: number }>();

// Configuration
const RATE_LIMIT_WINDOW = parseInt(process.env.RATE_LIMIT_WINDOW || '600000'); // 10 minutes
const RATE_LIMIT_MAX = parseInt(process.env.RATE_LIMIT_MAX || '30'); // 30 requests
const MAX_RESPONSE_SIZE = 2 * 1024 * 1024; // 2MB
const FETCH_TIMEOUT = 10000; // 10 seconds

interface ResolveRequest {
  url: string;
}

interface ResolveResponse {
  ok: boolean;
  data?: {
    url: string;
    domain: string;
    title: string;
    imageUrl: string | null;
    priceCents: number | null;
    currency: string | null;
  };
  errors?: string[];
}

/**
 * Check and update rate limit for IP
 */
function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const key = ip;
  
  let limit = rateLimits.get(key);
  
  if (!limit || now > limit.resetTime) {
    // Reset or create new limit window
    rateLimits.set(key, {
      count: 1,
      resetTime: now + RATE_LIMIT_WINDOW,
    });
    return true;
  }
  
  if (limit.count >= RATE_LIMIT_MAX) {
    return false;
  }
  
  limit.count++;
  return true;
}

/**
 * Fetch webpage with security checks
 */
async function fetchWebpage(url: string): Promise<{ html: string; finalUrl: string }> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), FETCH_TIMEOUT);

  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
        'Accept-Encoding': 'gzip, deflate',
        'DNT': '1',
        'Connection': 'keep-alive',
        'Upgrade-Insecure-Requests': '1',
      },
      signal: controller.signal,
      redirect: 'follow',
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('text/html')) {
      throw new Error('Response is not HTML');
    }

    const contentLength = response.headers.get('content-length');
    if (contentLength && parseInt(contentLength) > MAX_RESPONSE_SIZE) {
      throw new Error('Response too large');
    }

    const html = await response.text();
    
    if (html.length > MAX_RESPONSE_SIZE) {
      throw new Error('Response too large');
    }

    return { html, finalUrl: response.url };
  } catch (error) {
    clearTimeout(timeoutId);
    throw error;
  }
}

/**
 * Main resolve handler
 */
export const handler: Handler = async (event: HandlerEvent) => {
  // CORS headers
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Content-Type': 'application/json',
  };

  // Handle preflight
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ ok: false, errors: ['Method not allowed'] }),
    };
  }

  try {
    // Get client IP for rate limiting
    const clientIP = event.headers['x-forwarded-for']?.split(',')[0]?.trim() || 
                    event.headers['x-real-ip'] || 
                    'unknown';

    // Check rate limit
    if (!checkRateLimit(clientIP)) {
      return {
        statusCode: 429,
        headers,
        body: JSON.stringify({ 
          ok: false, 
          errors: ['Rate limit exceeded. Please try again later.'] 
        }),
      };
    }

    // Parse request body
    if (!event.body) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ ok: false, errors: ['Request body is required'] }),
      };
    }

    const { url }: ResolveRequest = JSON.parse(event.body);

    if (!url || typeof url !== 'string') {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ ok: false, errors: ['URL is required'] }),
      };
    }

    // Normalize and validate URL
    const normalizedUrl = normalizeUrl(url);
    
    if (!isValidUrl(normalizedUrl)) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ ok: false, errors: ['Invalid or blocked URL'] }),
      };
    }

    const domain = extractDomain(normalizedUrl);
    if (!domain) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ ok: false, errors: ['Could not extract domain from URL'] }),
      };
    }

    // Fetch and parse webpage
    const { html, finalUrl } = await fetchWebpage(normalizedUrl);
    
    // Extract metadata
    const metadata = extractMetadata(html);

    const response: ResolveResponse = {
      ok: true,
      data: {
        url: finalUrl,
        domain,
        title: metadata.title || 'Untitled',
        imageUrl: metadata.imageUrl,
        priceCents: metadata.priceCents,
        currency: metadata.currency,
      },
    };

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify(response),
    };

  } catch (error) {
    console.error('Resolve error:', error);
    
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ 
        ok: false, 
        errors: [`Failed to process URL: ${errorMessage}`] 
      }),
    };
  }
};
