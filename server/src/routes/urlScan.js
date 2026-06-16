import express from 'express';
import { verifyToken } from '../middleware/clerk.js';
import urlScanner from '../services/urlScanner.js';

const router = express.Router();

// Scan a single URL
router.post('/scan', verifyToken, async (req, res) => {
  try {
    const { url } = req.body;

    if (!url) {
      return res.status(400).json({ error: 'URL is required' });
    }

    // Validate URL format
    try {
      new URL(url);
    } catch {
      return res.status(400).json({ error: 'Invalid URL format' });
    }

    const result = await urlScanner.scanURL(url);

    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error('URL scan error:', error);
    res.status(500).json({
      error: 'Failed to scan URL',
      message: error.message,
    });
  }
});

// Extract and scan URLs from text
router.post('/extract-and-scan', verifyToken, async (req, res) => {
  try {
    const { text } = req.body;

    if (!text) {
      return res.status(400).json({ error: 'Text is required' });
    }

    // Extract URLs
    const urls = urlScanner.extractURLs(text);

    if (urls.length === 0) {
      return res.json({
        success: true,
        urls: [],
        results: [],
      });
    }

    // Scan all URLs
    const results = await urlScanner.scanMultipleURLs(urls);

    res.json({
      success: true,
      urls,
      results,
      hasMalicious: results.some((r) => r.isMalicious),
    });
  } catch (error) {
    console.error('URL extraction/scan error:', error);
    res.status(500).json({
      error: 'Failed to scan URLs',
      message: error.message,
    });
  }
});

export default router;
