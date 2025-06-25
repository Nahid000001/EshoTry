import { useState, useCallback, useRef } from 'react';
import { useAuth } from '@/hooks/useAuth';

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  intent?: string;
  confidence?: number;
  actions?: string[];
  suggestedQueries?: string[];
  quickReplies?: string[];
  productRecommendations?: any[];
  requiresEscalation?: boolean;
}

interface ChatbotState {
  isOpen: boolean;
  isMinimized: boolean;
  messages: ChatMessage[];
  isLoading: boolean;
  sessionId: string | null;
  isTyping: boolean;
}

interface ChatbotActions {
  openChatbot: () => void;
  closeChatbot: () => void;
  minimizeChatbot: () => void;
  maximizeChatbot: () => void;
  sendMessage: (message: string) => Promise<void>;
  clearChat: () => void;
  handleQuickReply: (reply: string) => void;
  getWelcomeMessage: () => ChatMessage;
}

export function useChatbot(): ChatbotState & ChatbotActions {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [isTyping, setIsTyping] = useState(false);
  
  const { user } = useAuth();
  const abortControllerRef = useRef<AbortController | null>(null);

  const getWelcomeMessage = useCallback((): ChatMessage => {
    return {
      role: 'assistant',
      content: `Hi${user ? ` ${user.firstName || ''}` : ''}! 👋 I'm EshoBot, your AI fashion assistant.\n\nI can help you with:\n\n• **Product Search**: Find exactly what you're looking for\n• **Virtual Try-On**: Troubleshooting and tips for best results\n• **AI Features**: 3D visualization, AR, recommendations\n• **Sizing Help**: Perfect fit guidance and size recommendations\n• **Order Tracking**: Check your order status${user ? '' : ' (sign in required)'}\n• **Fashion Advice**: Styling tips and outfit suggestions\n\nWhat would you like to explore today?`,
      timestamp: new Date().toISOString(),
      intent: 'welcome',
      confidence: 1.0,
      quickReplies: [
        "Show me AI features",
        "Help me find products",
        "Virtual try-on help",
        "Size guidance"
      ]
    };
  }, [user]);

  const sendMessage = useCallback(async (message: string) => {
    if (!message.trim()) return;

    // Cancel any ongoing request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    // Create new abort controller
    abortControllerRef.current = new AbortController();

    const userMessage: ChatMessage = {
      role: 'user',
      content: message,
      timestamp: new Date().toISOString()
    };

    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);
    setIsTyping(true);

    try {
      const response = await fetch('/api/chatbot/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message,
          sessionId
        }),
        credentials: 'include',
        signal: abortControllerRef.current.signal
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      // Update session ID if new
      if (data.sessionId && !sessionId) {
        setSessionId(data.sessionId);
      }

      const assistantMessage: ChatMessage = {
        role: 'assistant',
        content: data.message,
        timestamp: data.timestamp,
        intent: data.intent,
        confidence: data.confidence,
        actions: data.actions,
        suggestedQueries: data.suggestedQueries,
        quickReplies: data.quickReplies,
        productRecommendations: data.productRecommendations,
        requiresEscalation: data.requiresEscalation
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        // Request was cancelled, do nothing
        return;
      }
      
      console.error('Error sending message:', error);
      const errorMessage: ChatMessage = {
        role: 'assistant',
        content: "I'm sorry, I'm having trouble connecting right now. Please check your internet connection and try again, or contact our support team for immediate assistance.",
        timestamp: new Date().toISOString(),
        intent: 'error',
        confidence: 0,
        requiresEscalation: true
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
      setIsTyping(false);
      abortControllerRef.current = null;
    }
  }, [sessionId]);

  const openChatbot = useCallback(() => {
    setIsOpen(true);
    setIsMinimized(false);
    
    if (messages.length === 0) {
      setMessages([getWelcomeMessage()]);
    }
  }, [messages.length, getWelcomeMessage]);

  const closeChatbot = useCallback(() => {
    setIsOpen(false);
    setIsMinimized(false);
    
    // Cancel any ongoing request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    
    setIsLoading(false);
    setIsTyping(false);
  }, []);

  const minimizeChatbot = useCallback(() => {
    setIsMinimized(true);
  }, []);

  const maximizeChatbot = useCallback(() => {
    setIsMinimized(false);
  }, []);

  const clearChat = useCallback(() => {
    setMessages([getWelcomeMessage()]);
    setSessionId(null);
    setIsLoading(false);
    setIsTyping(false);
    
    // Cancel any ongoing request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
  }, [getWelcomeMessage]);

  const handleQuickReply = useCallback((reply: string) => {
    sendMessage(reply);
  }, [sendMessage]);

  return {
    // State
    isOpen,
    isMinimized,
    messages,
    isLoading,
    sessionId,
    isTyping,
    
    // Actions
    openChatbot,
    closeChatbot,
    minimizeChatbot,
    maximizeChatbot,
    sendMessage,
    clearChat,
    handleQuickReply,
    getWelcomeMessage
  };
}