const express = require('express');
const router = express.Router();
const axios = require('axios');
const cheerio = require('cheerio');

router.get('/link-preview', async (req, res) => {
  const { url } = req.query;
  
  if (!url) {
    return res.status(400).json({ error: 'URL is required' });
  }
  
  try {
    
    // Fetch the webpage content with a timeout
    const response = await axios.get(url, { 
      timeout: 10000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    });
    
    const html = response.data;
    const $ = cheerio.load(html);
    
    // Extract metadata with fallbacks
    const metadata = {
      title: $('meta[property="og:title"]').attr('content') || 
             $('title').text() || 
             '',
      description: $('meta[property="og:description"]').attr('content') || 
                  $('meta[name="description"]').attr('content') || 
                  $('p').first().text().substring(0, 100) || 
                  '',
      image: $('meta[property="og:image"]').attr('content') || 
             $('meta[property="twitter:image"]').attr('content') || 
             $('img').first().attr('src') || 
             '',
      siteName: $('meta[property="og:site_name"]').attr('content') || 
               new URL(url).hostname
    };
    
    // If image URL is relative, convert to absolute
    if (metadata.image && !metadata.image.startsWith('http')) {
      const urlObj = new URL(url);
      metadata.image = `${urlObj.protocol}//${urlObj.host}${metadata.image.startsWith('/') ? '' : '/'}${metadata.image}`;
    }
    
    res.json(metadata);
  } catch (error) {
    console.error('Error fetching link preview:', error);
    res.status(500).json({ error: 'Failed to fetch link preview', details: error.message });
  }
});

module.exports = router;