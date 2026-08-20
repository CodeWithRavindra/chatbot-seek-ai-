import express from 'express';
import jwt from 'jsonwebtoken';
import SearchResult from '../models/SearchResult.js';

const router = express.Router();

// Middleware to verify token
const verifyToken = (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = decoded.id;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Invalid token' });
  }
};

// @route   POST /api/search
// @desc    Perform a search (mock implementation)
// @access  Private
router.post('/', verifyToken, async (req, res) => {
  try {
    const { query } = req.body;

    if (!query) {
      return res.status(400).json({ error: 'Query is required' });
    }

    // Mock search results - replace with real search API
    const mockResults = [
      {
        title: `Result for "${query}" - 1`,
        url: `https://example.com/search?q=${encodeURIComponent(query)}&result=1`,
        description: 'This is a mock search result. Connect your search API here.',
        source: 'example.com',
      },
      {
        title: `Result for "${query}" - 2`,
        url: `https://example.com/search?q=${encodeURIComponent(query)}&result=2`,
        description: 'Replace this with your real search API (Bing, Google, Tavily, etc.)',
        source: 'example.com',
      },
    ];

    // Save search result
    const searchResult = await SearchResult.create({
      userId: req.userId,
      query,
      results: mockResults,
      summary: `Search summary for "${query}"`,
    });

    res.json({
      success: true,
      results: mockResults,
      summary: `Search summary for "${query}"`,
      searchId: searchResult._id,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// @route   GET /api/search/history
// @desc    Get search history
// @access  Private
router.get('/history', verifyToken, async (req, res) => {
  try {
    const searches = await SearchResult.find({ userId: req.userId })
      .select('_id query createdAt')
      .sort({ createdAt: -1 })
      .limit(20);

    res.json({
      success: true,
      searches,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
