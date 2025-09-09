const express = require('express');
const cors = require('cors');

const app = express();
const port = 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Endpoint pour rechercher une image
app.post('/api/search-image', async (req, res) => {
  const { query } = req.body;

  if (!query || typeof query !== 'string') {
    return res.status(400).json({
      success: false,
      error: 'Query is required and must be a string'
    });
  }

  console.log(`🔍 Recherche d'image pour: "${query}"`);

  try {
    // Méthode 1: Essayer Google Images avec plusieurs patterns
    const googleImageUrl = await searchGoogleImages(query);
    if (googleImageUrl) {
      return res.json({
        success: true,
        imageUrl: googleImageUrl,
        query,
        source: 'google'
      });
    }

    // Méthode 2: Fallback avec Unsplash API (gratuite)
    const unsplashImageUrl = await searchUnsplashImages(query);
    if (unsplashImageUrl) {
      return res.json({
        success: true,
        imageUrl: unsplashImageUrl,
        query,
        source: 'unsplash'
      });
    }

    // Méthode 3: Utiliser une image par défaut basée sur des mots-clés
    const defaultImageUrl = getDefaultImageByKeywords(query);
    
    res.json({
      success: true,
      imageUrl: defaultImageUrl,
      query,
      source: 'default'
    });

  } catch (error) {
    console.error('❌ Erreur lors de la recherche d\'image:', error.message);
    
    // Même en cas d'erreur, retourner une image par défaut
    const defaultImageUrl = getDefaultImageByKeywords(query);
    
    res.json({
      success: true,
      imageUrl: defaultImageUrl,
      query,
      source: 'default',
      note: 'Image par défaut utilisée en cas d\'erreur'
    });
  }
});

// Fonction de recherche Google Images améliorée
async function searchGoogleImages(query) {
  try {
    const searchQuery = encodeURIComponent(query.trim());
    const googleUrl = `https://www.google.com/search?q=${searchQuery}&tbm=isch&safe=off`;

    console.log(`🌐 Tentative Google Images: ${googleUrl}`);

    const response = await fetch(googleUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'fr-FR,fr;q=0.9,en;q=0.8',
      },
    });

    if (!response.ok) {
      console.log(`⚠️ Google Images failed: ${response.status}`);
      return null;
    }

    const html = await response.text();
    console.log(`📄 Page Google reçue, taille: ${html.length} caractères`);

    // Patterns de recherche multiples
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
            console.log(`✅ Image Google trouvée: ${imageUrl.substring(0, 100)}...`);
            return imageUrl;
          }
        } catch (e) {
          continue;
        }
      }
    }

    console.log('⚠️ Aucune image trouvée dans Google Images');
    return null;
  } catch (error) {
    console.log(`❌ Erreur Google Images: ${error.message}`);
    return null;
  }
}

// Fonction de recherche Unsplash (API gratuite)
async function searchUnsplashImages(query) {
  try {
    // Utiliser l'API publique Unsplash (pas besoin de clé pour les requêtes de base)
    const searchQuery = encodeURIComponent(query.trim());
    const unsplashUrl = `https://source.unsplash.com/800x600/?${searchQuery}`;
    
    console.log(`🖼️ Tentative Unsplash: ${unsplashUrl}`);
    
    // Vérifier si l'URL répond
    const response = await fetch(unsplashUrl, { method: 'HEAD' });
    if (response.ok) {
      console.log(`✅ Image Unsplash trouvée`);
      return unsplashUrl;
    }
    
    return null;
  } catch (error) {
    console.log(`❌ Erreur Unsplash: ${error.message}`);
    return null;
  }
}

// Images par défaut basées sur des mots-clés
function getDefaultImageByKeywords(query) {
  const lowerQuery = query.toLowerCase();
  
  // Mapping de mots-clés vers des images par défaut
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
  
  // Chercher des mots-clés correspondants
  for (const [keyword, imageUrl] of Object.entries(keywordMappings)) {
    if (lowerQuery.includes(keyword)) {
      console.log(`📷 Image par défaut sélectionnée pour "${keyword}"`);
      return imageUrl;
    }
  }
  
  // Image générique par défaut
  console.log(`📷 Image générique par défaut`);
  return 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=800&h=600&fit=crop&q=80';
}

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    service: 'Multi-Source Image Search API',
    timestamp: new Date().toISOString()
  });
});

app.listen(port, () => {
  console.log(`🚀 Serveur multi-sources d'images démarré sur http://localhost:${port}`);
  console.log(`📡 Endpoint: POST http://localhost:${port}/api/search-image`);
  console.log(`🎯 Sources: Google Images → Unsplash → Images par défaut`);
});
