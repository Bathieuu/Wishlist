const { createClient } = require('@supabase/supabase-js');

exports.handler = async (event, context) => {
  // CORS headers
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Content-Type': 'application/json',
  };

  // Handle preflight OPTIONS request
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
    const { url } = JSON.parse(event.body);
    
    if (!url) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ ok: false, errors: ['URL is required'] }),
      };
    }

    // Simple URL validation
    let parsedUrl;
    try {
      parsedUrl = new URL(url);
    } catch {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ ok: false, errors: ['Invalid URL format'] }),
      };
    }

    // For local development, return mock data based on the domain
    const domain = parsedUrl.hostname;
    let mockData;

    if (domain.includes('amazon')) {
      mockData = {
        url: url,
        domain: domain,
        title: 'MacBook Air M2 13 pouces',
        imageUrl: 'https://m.media-amazon.com/images/I/71jG+e7roXL._AC_SX679_.jpg',
        priceCents: 129900,
        currency: 'EUR'
      };
    } else if (domain.includes('fnac')) {
      mockData = {
        url: url,
        domain: domain,
        title: 'iPhone 15 Pro Max 256GB',
        imageUrl: 'https://static.fnac-static.com/multimedia/Images/FR/NR/ab/d1/7d/8250795-1505-1540-1.jpg',
        priceCents: 149900,
        currency: 'EUR'
      };
    } else {
      mockData = {
        url: url,
        domain: domain,
        title: `Produit de ${domain}`,
        imageUrl: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=400&h=300&fit=crop',
        priceCents: 4999,
        currency: 'EUR'
      };
    }

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        ok: true,
        data: mockData
      }),
    };

  } catch (error) {
    console.error('Error in resolve function:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ 
        ok: false, 
        errors: ['Internal server error: ' + error.message] 
      }),
    };
  }
};
