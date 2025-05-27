const express = require('express');
const router = express.Router();
const axios = require('axios');

const LINK_PREVIEW_API_KEY = process.env.LINK_PREVIEW_API_KEY;

router.get('/link-preview', async (req, res) => {
  const { url } = req.query;
  if (!url) return res.status(400).json({ error: 'URL is required' });

  try {
    const response = await axios.get(`https://api.linkpreview.net/?key=${LINK_PREVIEW_API_KEY}&q=${encodeURIComponent(url)}`);
    const data = response.data;

    res.json({
      title: data.title || 'Enlace externo',
      description: data.description || '',
      image: data.image || '',
      siteName: new URL(data.url).hostname
    });

  } catch (error) {
    console.error('LinkPreview error:', error.message);
    res.status(200).json({
      title: 'Enlace externo',
      description: '',
      image: '',
      siteName: new URL(url).hostname
    });
  }
});

module.exports = router;
