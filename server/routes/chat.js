import express from 'express';
import jwt from 'jsonwebtoken';
import Chat from '../models/Chat.js';
import aiService from '../services/ai/index.js';

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

// @route   GET /api/chat
// @desc    Get all chats for user
// @access  Private
router.get('/', verifyToken, async (req, res) => {
  try {
    const chats = await Chat.find({ userId: req.userId })
      .select('_id title createdAt updatedAt')
      .sort({ updatedAt: -1 });

    res.json({
      success: true,
      chats,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// @route   GET /api/chat/:id
// @desc    Get specific chat
// @access  Private
router.get('/:id', verifyToken, async (req, res) => {
  try {
    const chat = await Chat.findOne({
      _id: req.params.id,
      userId: req.userId,
    });

    if (!chat) {
      return res.status(404).json({ error: 'Chat not found' });
    }

    res.json({
      success: true,
      chat,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// @route   POST /api/chat
// @desc    Create new chat
// @access  Private
router.post('/', verifyToken, async (req, res) => {
  try {
    const { title } = req.body;

    const chat = await Chat.create({
      userId: req.userId,
      title: title || 'New Chat',
      messages: [],
    });

    res.status(201).json({
      success: true,
      chat,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// @route   POST /api/chat/:id/message
// @desc    Add message to chat and get AI response
// @access  Private
router.post('/:id/message', verifyToken, async (req, res) => {
  try {
    const { content, role } = req.body;

    if (!content || !role) {
      return res.status(400).json({ error: 'Content and role are required' });
    }

    const chat = await Chat.findOne({
      _id: req.params.id,
      userId: req.userId,
    });

    if (!chat) {
      return res.status(404).json({ error: 'Chat not found' });
    }

    // Add user message
    chat.messages.push({
      role,
      content,
    });

    // If it's a user message, get AI response
    if (role === 'user') {
      try {
        const formattedMessages = chat.messages.map(msg => ({
          role: msg.role,
          content: msg.content
        }));
        const aiResponse = await aiService.sendMessage(formattedMessages);

        // Add AI response
        chat.messages.push({
          role: 'assistant',
          content: aiResponse,
        });
      } catch (error) {
        console.error('AI Service Error:', error.message);
        // Add error message to chat
        chat.messages.push({
          role: 'assistant',
          content: `Sorry, I encountered an error: ${error.message}`,
        });
      }
    }

    await chat.save();

    res.json({
      success: true,
      chat,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// @route   DELETE /api/chat/:id
// @desc    Delete chat
// @access  Private
router.delete('/:id', verifyToken, async (req, res) => {
  try {
    const chat = await Chat.findOneAndDelete({
      _id: req.params.id,
      userId: req.userId,
    });

    if (!chat) {
      return res.status(404).json({ error: 'Chat not found' });
    }

    res.json({
      success: true,
      message: 'Chat deleted',
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
