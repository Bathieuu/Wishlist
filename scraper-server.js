import express from 'express';
import cors from 'cors';
import * as cheerio from 'cheerio';

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

// Fonction simple pour parser les prix
function parsePrice(text) {
  if (!text) return null;
  
  const cleanText = text.replace(/\s+/g, ' ').trim();
  
  // Regex pour différents formats de prix
  const patterns = [
    /(\d{1,3}(?:[,\s]\d{3})*)[,.](\d{2})\s*€/,  // 1 234,56 €
    /(\d+)[,.](\d{2})\s*€/,                     // 123,45 €
    /(\d+)\s*€/,                                // 123 €
    /€\s*(\d+[,.]?\d*)/,                        // € 123,45
  ];
  
  for (const pattern of patterns) {
    const match = cleanText.match(pattern);
    if (match) {
      const wholePart = match[1] ? match[1].replace(/[,\s]/g, '') : '0';
      const decimalPart = match[2] || '00';
      const priceCents = parseInt(wholePart) * 100 + parseInt(decimalPart);
      return { priceCents, currency: 'EUR' };
    }
  }
  
  return null;
}

// Fonction pour extraire le domaine
function extractDomain(url) {
  try {
    return new URL(url).hostname;
  } catch {
    return '';
  }
}

// Fonction pour scraper les données d'une URL
async function scrapeUrl(url) {
  try {
    console.log('🔍 Scraping:', url);
    
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'fr-FR,fr;q=0.9,en;q=0.8',
        'Accept-Encoding': 'gzip, deflate, br',
        'DNT': '1',
        'Connection': 'keep-alive',
        'Upgrade-Insecure-Requests': '1'
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const html = await response.text();
    const $ = cheerio.load(html);
    
    // Extraction des données
    let title = '';
    let imageUrl = '';
    let priceText = '';
    
    const domain = extractDomain(url);
    console.log('🌐 Domaine détecté:', domain);
    
    // Sélecteurs spécifiques par domaine
    if (domain.includes('amazon')) {
      // Multiples sélecteurs pour Amazon
      const titleSelectors = [
        '#productTitle',
        'h1.a-size-large',
        'h1[data-automation-id="product-title"]',
        '.product-title',
        'h1',
        '.a-size-large'
      ];
      
      for (const selector of titleSelectors) {
        const foundTitle = $(selector).text().trim();
        if (foundTitle) {
          title = foundTitle;
          console.log(`📝 Titre trouvé avec ${selector}:`, title.substring(0, 100) + '...');
          break;
        }
      }
      
      // Multiples sélecteurs pour les images
      const imageSelectors = [
        '#landingImage',
        '#imgBlkFront', 
        '.a-dynamic-image',
        '.a-button-thumbnail img',
        '.imgTagWrapper img',
        '#altImages img'
      ];
      
      for (const selector of imageSelectors) {
        const foundImage = $(selector).attr('src') || $(selector).attr('data-src');
        if (foundImage) {
          imageUrl = foundImage;
          console.log(`🖼️  Image trouvée avec ${selector}:`, imageUrl);
          break;
        }
      }
      
      // Multiples sélecteurs pour les prix
      const priceSelectors = [
        '.a-price .a-offscreen',
        '.a-price-whole',
        '.a-price-symbol',
        '.a-price',
        '.pricePerUnit',
        '.a-price-range'
      ];
      
      for (const selector of priceSelectors) {
        const foundPrice = $(selector).text().trim();
        if (foundPrice && foundPrice.includes('€')) {
          priceText = foundPrice;
          console.log(`💰 Prix trouvé avec ${selector}:`, priceText);
          break;
        }
      }
      
      // Si pas de prix trouvé, chercher dans le texte
      if (!priceText) {
        const bodyText = $('body').text();
        const priceMatch = bodyText.match(/(\d+[,.]?\d*)\s*€/);
        if (priceMatch) {
          priceText = priceMatch[0];
          console.log('💰 Prix trouvé dans le texte:', priceText);
        }
      }
      
    } else {
      // Sélecteurs génériques pour autres sites
      title = $('h1').first().text().trim() ||
              $('title').text().trim() ||
              $('[data-testid="product-title"]').text().trim();
      
      imageUrl = $('meta[property="og:image"]').attr('content') ||
                $('img').first().attr('src');
      
      priceText = $('.price').first().text() ||
                 $('[data-testid="price"]').text() ||
                 $('.prix').text();
    }
    
    // Debug: afficher ce qui a été trouvé
    console.log('🔍 Éléments détectés sur la page:');
    console.log('  - Titre h1:', $('h1').length, 'éléments');
    console.log('  - Images:', $('img').length, 'éléments');
    console.log('  - Éléments avec "price":', $('.price, [class*="price"], [id*="price"]').length, 'éléments');
    
    // Nettoyage des données
    title = title.replace(/\s+/g, ' ').trim();
    if (imageUrl && !imageUrl.startsWith('http')) {
      const baseUrl = new URL(url).origin;
      imageUrl = new URL(imageUrl, baseUrl).href;
    }
    
    // Parsing du prix
    const parsedPrice = parsePrice(priceText);
    
    console.log('✅ Données finales extraites:');
    console.log('  Titre:', title || 'NON TROUVÉ');
    console.log('  Prix brut:', priceText || 'NON TROUVÉ');
    console.log('  Prix parsé:', parsedPrice || 'NON TROUVÉ');
    console.log('  Image:', imageUrl ? 'TROUVÉE' : 'NON TROUVÉE');
    
    return {
      url: url,
      domain: domain,
      title: title || `Produit de ${domain}`,
      imageUrl: imageUrl || null,
      priceCents: parsedPrice?.priceCents || null,
      currency: parsedPrice?.currency || null
    };
    
  } catch (error) {
    console.error('❌ Erreur scraping:', error);
    throw error;
  }
}

// Route pour scraper une URL
app.post('/api/resolve', async (req, res) => {
  try {
    const { url } = req.body;
    
    if (!url) {
      return res.status(400).json({ 
        ok: false, 
        errors: ['URL is required'] 
      });
    }
    
    const data = await scrapeUrl(url);
    
    res.json({ 
      ok: true, 
      data 
    });
    
  } catch (error) {
    console.error('❌ Error:', error);
    res.status(500).json({ 
      ok: false, 
      errors: [error.message] 
    });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Serveur de scraping démarré sur http://localhost:${PORT}`);
  console.log('📡 Endpoint: POST http://localhost:3001/api/resolve');
  console.log('🔥 Prêt à scraper les vrais produits !');
});
