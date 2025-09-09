const express = require('express');
const cors = require('cors');

const app = express();
const port = 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Endpoint pour rechercher une image via Google Images
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
    // Construire l'URL de recherche Google Images
    const searchQuery = encodeURIComponent(query.trim());
    const googleUrl = `https://www.google.com/search?q=${searchQuery}&tbm=isch&safe=off`;

    console.log(`🌐 URL de recherche: ${googleUrl}`);

    const response = await fetch(googleUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'fr-FR,fr;q=0.9,en;q=0.8',
        'Accept-Encoding': 'gzip, deflate, br',
        'DNT': '1',
        'Connection': 'keep-alive',
        'Upgrade-Insecure-Requests': '1',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const html = await response.text();
    console.log(`📄 Page reçue, taille: ${html.length} caractères`);

    // Rechercher les URLs d'images dans le HTML
    const imageUrlRegex = /"ou":"([^"]+)"/g;
    const matches = [];
    let match;

    while ((match = imageUrlRegex.exec(html)) !== null && matches.length < 10) {
      const imageUrl = match[1];
      // Décoder l'URL qui peut être encodée
      try {
        const decodedUrl = decodeURIComponent(imageUrl);
        // Vérifier que c'est une URL d'image valide
        if (decodedUrl.match(/\.(jpg|jpeg|png|webp|gif)(\?|$)/i) || 
            decodedUrl.includes('images') || 
            decodedUrl.includes('img')) {
          matches.push(decodedUrl);
        }
      } catch (e) {
        // Ignore les URLs qui ne peuvent pas être décodées
        continue;
      }
    }

    console.log(`🖼️ Images trouvées: ${matches.length}`);
    if (matches.length > 0) {
      console.log(`✅ Première image: ${matches[0]}`);
    }

    // Retourner la première image trouvée ou null
    const imageUrl = matches.length > 0 ? matches[0] : null;
    
    res.json({
      success: true,
      imageUrl,
      query,
      totalFound: matches.length
    });

  } catch (error) {
    console.error('❌ Erreur lors de la recherche d\'image:', error.message);
    res.json({
      success: false,
      error: error.message,
      imageUrl: null
    });
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    service: 'Image Search API',
    timestamp: new Date().toISOString()
  });
});

app.listen(port, () => {
  console.log(`🚀 Serveur de recherche d'images démarré sur http://localhost:${port}`);
  console.log(`📡 Endpoint: POST http://localhost:${port}/api/search-image`);
  console.log(`🖼️ Prêt à rechercher des images Google !`);
});
