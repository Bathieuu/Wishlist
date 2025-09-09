import express from 'express';
import cors from 'cors';
import * as cheerio from 'cheerio';
import { parsePrice } from './src/lib/price.js';
import { extractDomain, normalizeUrl } from './src/lib/domain.js';

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

// Fonction pour scraper les données d'une URL
async function scrapeUrl(url) {
  try {
    console.log('Scraping:', url);
    
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
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
    
    // Sélecteurs spécifiques par domaine
    if (domain.includes('amazon')) {
      title = $('#productTitle').text().trim() || 
              $('h1.a-size-large').text().trim() ||
              $('h1').first().text().trim();
      
      imageUrl = $('#landingImage').attr('src') ||
                $('#imgBlkFront').attr('src') ||
                $('.a-dynamic-image').first().attr('src');
      
      priceText = $('.a-price-whole').first().text() + '€' ||
                 $('.a-price .a-offscreen').first().text() ||
                 $('.a-price-symbol').parent().text();
      
    } else if (domain.includes('fnac')) {
      title = $('h1.f-productHeader-Title').text().trim() ||
              $('h1').first().text().trim();
      
      imageUrl = $('.f-productVisuals-mainPicture img').attr('src') ||
                $('.ProductVisuals-module__picture img').attr('src');
      
      priceText = $('.f-priceBox-price').text() ||
                 $('.price').first().text();
      
    } else if (domain.includes('cdiscount')) {
      title = $('h1').first().text().trim();
      imageUrl = $('.zoomContainer img').attr('src') ||
                $('.product-picture img').attr('src');
      priceText = $('.price').first().text();
      
    } else {
      // Sélecteurs génériques
      title = $('h1').first().text().trim() ||
              $('title').text().trim() ||
              $('[data-testid="product-title"]').text().trim();
      
      imageUrl = $('meta[property="og:image"]').attr('content') ||
                $('img').first().attr('src');
      
      priceText = $('.price').first().text() ||
                 $('[data-testid="price"]').text() ||
                 $('.prix').text();
    }
    
    // Nettoyage des données
    title = title.replace(/\s+/g, ' ').trim();
    if (imageUrl && !imageUrl.startsWith('http')) {
      const baseUrl = new URL(url).origin;
      imageUrl = new URL(imageUrl, baseUrl).href;
    }
    
    // Parsing du prix
    const parsedPrice = parsePrice(priceText);
    
    return {
      url: normalizeUrl(url),
      domain: domain,
      title: title || 'Produit sans titre',
      imageUrl: imageUrl || null,
      priceCents: parsedPrice?.priceCents || null,
      currency: parsedPrice?.currency || null
    };
    
  } catch (error) {
    console.error('Erreur scraping:', error);
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
    console.error('Error:', error);
    res.status(500).json({ 
      ok: false, 
      errors: [error.message] 
    });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Serveur de scraping démarré sur http://localhost:${PORT}`);
  console.log('📡 Endpoint: POST http://localhost:3001/api/resolve');
});
