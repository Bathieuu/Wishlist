import { Handler } from '@netlify/functions';

interface SearchImageRequest {
  query: string;
}

/**
 * Recherche d'images via Google Images (méthode simplifiée)
 */
async function searchGoogleImages(query: string): Promise<string | null> {
  try {
    const searchQuery = encodeURIComponent(query.trim());
    const googleUrl = `https://www.google.com/search?q=${searchQuery}&tbm=isch&safe=off`;

    const response = await fetch(googleUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'fr-FR,fr;q=0.9,en;q=0.8',
      },
    });

    if (!response.ok) {
      return null;
    }

    const html = await response.text();

    // Patterns de recherche multiples pour extraire les URLs d'images
    const imagePatterns = [
      /"ou":"([^"]+)"/g,
      /"url":"([^"]+)"/g,
      /\["(https:\/\/[^"]*\.(?:jpg|jpeg|png|webp|gif)[^"]*)"[,\]]/gi,
      /"(https:\/\/encrypted-tbn0\.gstatic\.com\/images[^"]+)"/g,
      /"(https:\/\/[^"]*\.googleusercontent\.com[^"]*\.(?:jpg|jpeg|png|webp|gif)[^"]*)"/g
    ];

    for (const pattern of imagePatterns) {
      let match;
      while ((match = pattern.exec(html)) !== null) {
        try {
          const imageUrl = decodeURIComponent(match[1]);
          if (imageUrl.match(/\.(jpg|jpeg|png|webp|gif)(\?|$)/i) || 
              imageUrl.includes('gstatic.com/images') ||
              imageUrl.includes('googleusercontent.com')) {
            return imageUrl;
          }
        } catch (e) {
          continue;
        }
      }
    }

    return null;
  } catch (error) {
    console.error('Google Images search error:', error);
    return null;
  }
}

/**
 * Recherche d'images via Unsplash (fallback)
 */
async function searchUnsplashImages(query: string): Promise<string | null> {
  try {
    const searchQuery = encodeURIComponent(query.trim());
    const unsplashUrl = `https://source.unsplash.com/800x600/?${searchQuery}`;
    
    const response = await fetch(unsplashUrl, { method: 'HEAD' });
    if (response.ok) {
      return unsplashUrl;
    }
    
    return null;
  } catch (error) {
    return null;
  }
}

/**
 * Images par défaut basées sur des mots-clés
 */
function getDefaultImageByKeywords(query: string): string {
  const lowerQuery = query.toLowerCase();
  
  const keywordMappings = {
    'phone': 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=800&h=600&fit=crop',
    'iphone': 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=800&h=600&fit=crop',
    'samsung': 'https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=800&h=600&fit=crop',
    'laptop': 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=800&h=600&fit=crop',
    'macbook': 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800&h=600&fit=crop',
    'robot': 'https://images.unsplash.com/photo-1546776230-bb86256870ee?w=800&h=600&fit=crop',
    'aspirateur': 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&h=600&fit=crop',
    'car': 'https://images.unsplash.com/photo-1494976388531-d1058494cdd8?w=800&h=600&fit=crop',
    'watch': 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&h=600&fit=crop',
    'book': 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=800&h=600&fit=crop',
    'camera': 'https://images.unsplash.com/photo-1502920917128-1aa500764cbd?w=800&h=600&fit=crop'
  };
  
  for (const [keyword, imageUrl] of Object.entries(keywordMappings)) {
    if (lowerQuery.includes(keyword)) {
      return imageUrl;
    }
  }
  
  // Image générique par défaut
  return 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=800&h=600&fit=crop&q=80';
}

/**
 * Handler principal
 */
export const handler: Handler = async (event) => {
  // CORS headers
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
  };

  // Handle preflight requests
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: '',
    };
  }

  // Only allow POST requests
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({
        success: false,
        error: 'Method not allowed'
      }),
    };
  }

  try {
    const requestData: SearchImageRequest = JSON.parse(event.body || '{}');

    if (!requestData.query || typeof requestData.query !== 'string') {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({
          success: false,
          error: 'Query is required and must be a string'
        }),
      };
    }

    console.log(`🔍 Searching image for: "${requestData.query}"`);

    // Essayer Google Images en premier
    const googleImageUrl = await searchGoogleImages(requestData.query);
    if (googleImageUrl) {
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          success: true,
          imageUrl: googleImageUrl,
          query: requestData.query,
          source: 'google'
        }),
      };
    }

    // Fallback vers Unsplash
    const unsplashImageUrl = await searchUnsplashImages(requestData.query);
    if (unsplashImageUrl) {
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          success: true,
          imageUrl: unsplashImageUrl,
          query: requestData.query,
          source: 'unsplash'
        }),
      };
    }

    // Dernier recours : image par défaut basée sur des mots-clés
    const defaultImageUrl = getDefaultImageByKeywords(requestData.query);
    
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        imageUrl: defaultImageUrl,
        query: requestData.query,
        source: 'default'
      }),
    };

  } catch (error) {
    console.error('Search image error:', error);
    
    // Même en cas d'erreur, retourner une image par défaut
    const defaultImageUrl = getDefaultImageByKeywords('product');
    
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        imageUrl: defaultImageUrl,
        query: 'fallback',
        source: 'error_fallback',
        note: 'Default image used due to error'
      }),
    };
  }
};
