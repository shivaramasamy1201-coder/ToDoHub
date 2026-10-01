import express from 'express';
import { requireAuth } from '../middleware/authMiddleware.js';
import { generateAssistantResponse } from '../services/geminiService.js';
import { handleLocalAssistantQuery } from '../services/localAssistantService.js';

const router = express.Router();

/**
 * POST /api/assistant/chat
 * Send a message to ToDoHub AI assistant powered by Google Gemini
 * with Local Productivity & Web Search Fallback
 */
router.post('/chat', requireAuth, async (req, res) => {
  const { message, history } = req.body;

  // 1. Message presence validation
  if (!message || typeof message !== 'string' || !message.trim()) {
    return res.status(400).json({
      success: false,
      error: 'Message cannot be empty.'
    });
  }

  const trimmedMessage = message.trim();

  // 2. Message length validation (Max 4000 characters)
  if (trimmedMessage.length > 4000) {
    return res.status(400).json({
      success: false,
      error: 'Message exceeds the maximum length of 4000 characters.'
    });
  }

  // 3. Authenticated user context
  const userContext = {
    userId: req.user.id,
    authToken: req.headers.authorization
  };

  // 4. Try Gemini AI Service first
  try {
    const result = await generateAssistantResponse(trimmedMessage, history, userContext);
    const messageText = typeof result === 'string' ? result : result.message;
    const toolsUsed = typeof result === 'object' && Array.isArray(result.toolsUsed) ? result.toolsUsed : [];

    return res.status(200).json({
      success: true,
      message: messageText,
      toolsUsed,
      source: 'gemini'
    });
  } catch (geminiError) {
    console.warn('Gemini API Unavailable, falling back to Local Productivity Assistant:', geminiError.message);

    // 5. Fallback to Local Productivity Assistant (with web search support)
    try {
      const localResult = await handleLocalAssistantQuery(trimmedMessage, userContext);
      return res.status(200).json({
        success: true,
        message: localResult.message,
        fallback: true,
        intent: localResult.intent,
        source: localResult.intent === 'web_search' ? 'web_search' : 'local'
      });
    } catch (localError) {
      console.error('Local Assistant Fallback Error:', localError.message);
      return res.status(200).json({
        success: true,
        message: "Gemini AI is temporarily unavailable. I can still help with your tasks, deadlines, categories, and productivity statistics. Try asking: \"Show my tasks\" or \"Show my productivity statistics\".",
        fallback: true,
        source: 'local'
      });
    }
  }
});

export default router;
