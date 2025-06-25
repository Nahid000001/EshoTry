import { Router } from 'express';
import { eshoTryChatbot } from '../ai/chatbot-engine';
import { storage } from '../storage';
import { isAuthenticated } from '../replitAuth';

const router = Router();

interface ChatSession {
  sessionId: string;
  userId?: string;
  messages: Array<{
    role: 'user' | 'assistant';
    content: string;
    timestamp: Date;
  }>;
  createdAt: Date;
  lastActivity: Date;
}

// In-memory session storage (in production, use Redis or database)
const chatSessions = new Map<string, ChatSession>();

// Generate session ID
function generateSessionId(): string {
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
}

// Get or create chat session
function getOrCreateSession(sessionId: string, userId?: string): ChatSession {
  if (chatSessions.has(sessionId)) {
    const session = chatSessions.get(sessionId)!;
    session.lastActivity = new Date();
    if (userId) session.userId = userId;
    return session;
  }

  const newSession: ChatSession = {
    sessionId,
    userId,
    messages: [],
    createdAt: new Date(),
    lastActivity: new Date()
  };

  chatSessions.set(sessionId, newSession);
  return newSession;
}

// Clean up old sessions (run periodically)
function cleanupOldSessions() {
  const now = new Date();
  const maxAge = 24 * 60 * 60 * 1000; // 24 hours

  for (const [sessionId, session] of chatSessions.entries()) {
    if (now.getTime() - session.lastActivity.getTime() > maxAge) {
      chatSessions.delete(sessionId);
    }
  }
}

// Clean up every hour
setInterval(cleanupOldSessions, 60 * 60 * 1000);

// Visual search endpoint
router.post('/visual-search', async (req, res) => {
  try {
    const { image, sessionId = generateSessionId(), language = 'en' } = req.body;
    
    if (!image) {
      return res.status(400).json({
        error: 'Image data is required'
      });
    }

    // Get user info if authenticated
    let userId: string | undefined;
    if (req.isAuthenticated && req.isAuthenticated()) {
      userId = (req.user as any)?.claims?.sub;
    }

    // Get or create session
    const session = getOrCreateSession(sessionId, userId);

    // Prepare context for visual search
    const context = {
      userId,
      sessionId,
      conversationHistory: session.messages.map(msg => ({
        role: msg.role,
        content: msg.content,
        timestamp: msg.timestamp
      })),
      language
    };

    // Process visual search
    const response = await eshoTryChatbot.processVisualSearch(image, context);

    // Update session
    session.messages.push({
      role: 'user',
      content: '[Image uploaded for visual search]',
      timestamp: new Date()
    });

    session.messages.push({
      role: 'assistant',
      content: response.message,
      timestamp: new Date()
    });

    // Keep only last 20 messages
    if (session.messages.length > 20) {
      session.messages = session.messages.slice(-20);
    }

    res.json({
      sessionId,
      message: response.message,
      intent: response.intent,
      confidence: response.confidence,
      actions: response.actions,
      suggestedQueries: response.suggestedQueries,
      productRecommendations: response.productRecommendations,
      language: response.language || language,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Visual search endpoint error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: "I'm having trouble processing the image. Please try again or contact our support team."
    });
  }
});

// Enhanced recommendations endpoint
router.post('/recommendations', async (req, res) => {
  try {
    const { sessionId, userId, language = 'en' } = req.body;
    
    // Get user info if authenticated
    let authenticatedUserId: string | undefined;
    if (req.isAuthenticated && req.isAuthenticated()) {
      authenticatedUserId = (req.user as any)?.claims?.sub;
    }
    
    const targetUserId = userId || authenticatedUserId;
    
    const context = {
      userId: targetUserId,
      sessionId: sessionId || generateSessionId(),
      conversationHistory: [],
      language
    };

    const response = await eshoTryChatbot.generateEnhancedRecommendations(targetUserId, context);

    res.json({
      message: response.message,
      intent: response.intent,
      confidence: response.confidence,
      productRecommendations: response.productRecommendations,
      actions: response.actions,
      suggestedQueries: response.suggestedQueries,
      language: response.language
    });

  } catch (error) {
    console.error('Enhanced recommendations error:', error);
    res.status(500).json({
      error: 'Internal server error'
    });
  }
});

// Chat endpoint
router.post('/chat', async (req, res) => {
  try {
    const { message, sessionId = generateSessionId(), language = 'en' } = req.body;
    
    if (!message || typeof message !== 'string') {
      return res.status(400).json({
        error: 'Message is required and must be a string'
      });
    }

    // Get user info if authenticated
    let userId: string | undefined;
    let userProfile;
    
    if (req.isAuthenticated && req.isAuthenticated()) {
      userId = (req.user as any)?.claims?.sub;
      if (userId) {
        try {
          userProfile = await storage.getUser(userId);
        } catch (error) {
          console.log('Could not fetch user profile:', error);
        }
      }
    }

    // Get or create session
    const session = getOrCreateSession(sessionId, userId);

    // Prepare chat context
    const context = {
      userId,
      sessionId,
      conversationHistory: session.messages.map(msg => ({
        role: msg.role,
        content: msg.content,
        timestamp: msg.timestamp
      })),
      userProfile,
      language
    };

    // Process message with chatbot
    const response = await eshoTryChatbot.processMessage(message, context);

    // Update session with new messages
    session.messages.push({
      role: 'user',
      content: message,
      timestamp: new Date()
    });

    session.messages.push({
      role: 'assistant',
      content: response.message,
      timestamp: new Date()
    });

    // Keep only last 20 messages to prevent memory issues
    if (session.messages.length > 20) {
      session.messages = session.messages.slice(-20);
    }

    // Get quick replies for next interaction
    const quickReplies = await eshoTryChatbot.getQuickReplies(response.intent);

    res.json({
      sessionId,
      message: response.message,
      intent: response.intent,
      confidence: response.confidence,
      actions: response.actions,
      suggestedQueries: response.suggestedQueries,
      quickReplies,
      productRecommendations: response.productRecommendations,
      requiresEscalation: response.requiresEscalation,
      language: response.language || language,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Chat endpoint error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: "I'm experiencing technical difficulties. Please try again or contact our support team."
    });
  }
});

// Get chat history
router.get('/history/:sessionId', async (req, res) => {
  try {
    const { sessionId } = req.params;
    
    if (!chatSessions.has(sessionId)) {
      return res.status(404).json({
        error: 'Session not found'
      });
    }

    const session = chatSessions.get(sessionId)!;
    
    // Only return history if user owns the session (or if not authenticated)
    let canAccess = true;
    
    if (req.isAuthenticated && req.isAuthenticated()) {
      const currentUserId = (req.user as any)?.claims?.sub;
      if (session.userId && currentUserId !== session.userId) {
        canAccess = false;
      }
    }

    if (!canAccess) {
      return res.status(403).json({
        error: 'Access denied'
      });
    }

    res.json({
      sessionId,
      messages: session.messages,
      createdAt: session.createdAt,
      lastActivity: session.lastActivity
    });

  } catch (error) {
    console.error('Chat history error:', error);
    res.status(500).json({
      error: 'Internal server error'
    });
  }
});

// Clear chat session
router.delete('/session/:sessionId', async (req, res) => {
  try {
    const { sessionId } = req.params;
    
    if (chatSessions.has(sessionId)) {
      chatSessions.delete(sessionId);
    }

    res.json({
      success: true,
      message: 'Session cleared'
    });

  } catch (error) {
    console.error('Clear session error:', error);
    res.status(500).json({
      error: 'Internal server error'
    });
  }
});

// Proactive suggestion endpoint
router.post('/proactive-suggestion', async (req, res) => {
  try {
    const { sessionId, language = 'en' } = req.body;
    
    if (!sessionId) {
      return res.status(400).json({ error: 'Session ID required' });
    }

    // Get session context
    const session = getOrCreateSession(sessionId);
    const context = {
      sessionId,
      conversationHistory: session.messages.map(msg => ({
        role: msg.role,
        content: msg.content,
        timestamp: msg.timestamp
      })),
      language
    };

    // Generate proactive suggestion
    const suggestion = await eshoTryChatbot.generateProactiveSuggestion(context);
    
    if (suggestion) {
      // Add to session history
      session.messages.push({
        role: 'assistant',
        content: suggestion.message,
        timestamp: new Date()
      });

      res.json({
        message: suggestion.message,
        productRecommendations: suggestion.productRecommendations,
        quickReplies: suggestion.suggestedQueries,
        language: suggestion.language
      });
    } else {
      res.json({ message: null });
    }

  } catch (error) {
    console.error('Proactive suggestion error:', error);
    res.status(500).json({
      error: 'Internal server error'
    });
  }
});

// Get chatbot status and capabilities
router.get('/status', async (req, res) => {
  try {
    res.json({
      status: 'online',
      capabilities: {
        productInquiry: true,
        stockCheck: true,
        virtualTryOnHelp: true,
        sizeHelp: true,
        orderTracking: req.isAuthenticated && req.isAuthenticated(),
        aiFeaturesHelp: true,
        fashionAdvice: true,
        generalSupport: true,
        multilingualSupport: true,
        sessionMemory: true,
        proactiveSuggestions: true,
        voiceInput: true
      },
      features: [
        'Multilingual support (English, Bangla)',
        'Session memory and context awareness',
        'Proactive product suggestions',
        'Voice input for mobile devices',
        'Natural language processing',
        'Product search and recommendations',
        'Virtual Try-On troubleshooting',
        'AI features guidance',
        'Order tracking (authenticated users)',
        'Size and fit assistance',
        'Fashion styling advice'
      ],
      languages: ['en', 'bn'],
      activeSessions: chatSessions.size,
      uptime: process.uptime()
    });
  } catch (error) {
    console.error('Status endpoint error:', error);
    res.status(500).json({
      error: 'Internal server error'
    });
  }
});

export default router;