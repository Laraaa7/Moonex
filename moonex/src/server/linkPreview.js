const express = require('express');
const router = express.Router();
const axios = require('axios');

const LINK_PREVIEW_API_KEY = process.env.LINK_PREVIEW_API_KEY;

// Cache en memoria
const vistaPreviaCache = new Map();

router.get('/link-preview', async (req, res) => {
  const { url } = req.query;
  if (!url) return res.status(400).json({ error: 'URL is required' });

  // Si ya existe en cache, se devuelve directo
  if (vistaPreviaCache.has(url)) {
    return res.json(vistaPreviaCache.get(url));
  }

  try {
    const response = await axios.get(`https://api.linkpreview.net/?key=${LINK_PREVIEW_API_KEY}&q=${encodeURIComponent(url)}`);
    const data = response.data;

    const vista = {
      title: data.title || 'Enlace externo',
      description: data.description || '',
      image: data.image || '',
      siteName: new URL(data.url).hostname
    };

    // Guardar en cache
    vistaPreviaCache.set(url, vista);

    res.json(vista);
  } catch (error) {
    console.error('LinkPreview error:', error.message);

    const fallback = {
      title: 'Enlace externo',
      description: '',
      image: '',
      siteName: new URL(url).hostname
    };

    vistaPreviaCache.set(url, fallback);

    res.status(200).json(fallback);
  }
});

module.exports = router;
