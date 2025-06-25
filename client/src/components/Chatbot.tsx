import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/hooks/useAuth';
import { 
  MessageCircle, 
  X, 
  Send, 
  Bot, 
  User, 
  Loader2,
  Minimize2,
  Maximize2,
  RotateCcw,
  ExternalLink
} from 'lucide-react';

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

interface ChatbotProps {
  className?: string;
}

export function Chatbot({ className }: ChatbotProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [isTyping, setIsTyping] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const { user } = useAuth();

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Focus input when chatbot opens
  useEffect(() => {
    if (isOpen && !isMinimized && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen, isMinimized]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const sendMessage = async (message: string) => {
    if (!message.trim()) return;

    const userMessage: ChatMessage = {
      role: 'user',
      content: message,
      timestamp: new Date().toISOString()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
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
        credentials: 'include'
      });

      if (!response.ok) {
        throw new Error('Failed to send message');
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
      console.error('Error sending message:', error);
      const errorMessage: ChatMessage = {
        role: 'assistant',
        content: "I'm sorry, I'm having trouble connecting right now. Please try again or contact our support team.",
        timestamp: new Date().toISOString()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
      setIsTyping(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(inputValue);
  };

  const handleQuickReply = (reply: string) => {
    sendMessage(reply);
  };

  const openChatbot = () => {
    setIsOpen(true);
    if (messages.length === 0) {
      // Add welcome message
      const welcomeMessage: ChatMessage = {
        role: 'assistant',
        content: `Hi${user ? ` ${user.firstName || ''}` : ''}! 👋 I'm EshoBot, your AI fashion assistant. I can help you with:\n\n• Product search and recommendations\n• Virtual Try-On and AI features\n• Sizing and fit guidance\n• Order tracking${user ? '' : ' (sign in required)'}\n• Fashion advice and styling\n\nWhat can I help you with today?`,
        timestamp: new Date().toISOString(),
        quickReplies: [
          "Show me AI features",
          "Help me find products",
          "Virtual try-on help"
        ]
      };
      setMessages([welcomeMessage]);
    }
  };

  const closeChatbot = () => {
    setIsOpen(false);
    setIsMinimized(false);
  };

  const clearChat = () => {
    setMessages([]);
    setSessionId(null);
    openChatbot(); // Restart with welcome message
  };

  const getMessageIcon = (role: string) => {
    return role === 'user' ? (
      <User className="h-5 w-5" />
    ) : (
      <Bot className="h-5 w-5 text-blue-600" />
    );
  };

  const formatMessage = (content: string) => {
    // Simple formatting for markdown-like content
    return content
      .split('\n')
      .map((line, index) => {
        if (line.startsWith('•')) {
          return (
            <div key={index} className="flex items-start gap-2 ml-4">
              <span className="text-blue-600 mt-1">•</span>
              <span>{line.substring(1).trim()}</span>
            </div>
          );
        }
        if (line.startsWith('**') && line.endsWith('**')) {
          return (
            <div key={index} className="font-semibold">
              {line.replace(/\*\*/g, '')}
            </div>
          );
        }
        if (line.trim() === '') {
          return <div key={index} className="h-2" />;
        }
        return <div key={index}>{line}</div>;
      });
  };

  if (!isOpen) {
    return (
      <Button
        onClick={openChatbot}
        className={`fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 bg-blue-600 hover:bg-blue-700 ${className}`}
        aria-label="Open chat"
      >
        <MessageCircle className="h-6 w-6" />
      </Button>
    );
  }

  return (
    <Card className={`fixed bottom-6 right-6 w-96 h-[600px] shadow-xl transition-all duration-300 ${
      isMinimized ? 'h-16' : 'h-[600px]'
    } ${className}`}>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Bot className="h-5 w-5 text-blue-600" />
            EshoBot
            <Badge variant="outline" className="text-xs">
              Online
            </Badge>
          </CardTitle>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsMinimized(!isMinimized)}
              className="h-8 w-8 p-0"
            >
              {isMinimized ? <Maximize2 className="h-4 w-4" /> : <Minimize2 className="h-4 w-4" />}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={clearChat}
              className="h-8 w-8 p-0"
            >
              <RotateCcw className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={closeChatbot}
              className="h-8 w-8 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>

      {!isMinimized && (
        <CardContent className="flex flex-col h-[520px] p-4 pt-0">
          {/* Messages */}
          <div className="flex-1 overflow-y-auto space-y-4 mb-4">
            {messages.map((message, index) => (
              <div
                key={index}
                className={`flex gap-3 ${
                  message.role === 'user' ? 'flex-row-reverse' : 'flex-row'
                }`}
              >
                <div className={`flex-shrink-0 ${
                  message.role === 'user' 
                    ? 'bg-blue-100 text-blue-600' 
                    : 'bg-gray-100 text-gray-600'
                } rounded-full p-2`}>
                  {getMessageIcon(message.role)}
                </div>
                <div className={`flex-1 ${
                  message.role === 'user' ? 'text-right' : 'text-left'
                }`}>
                  <div className={`inline-block p-3 rounded-lg max-w-[85%] ${
                    message.role === 'user'
                      ? 'bg-blue-600 text-white rounded-br-sm'
                      : 'bg-gray-100 text-gray-900 rounded-bl-sm'
                  }`}>
                    <div className="text-sm">
                      {formatMessage(message.content)}
                    </div>
                    {message.confidence && (
                      <div className="text-xs opacity-70 mt-1">
                        Confidence: {Math.round(message.confidence * 100)}%
                      </div>
                    )}
                  </div>
                  
                  {/* Quick Replies */}
                  {message.quickReplies && message.quickReplies.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-2">
                      {message.quickReplies.map((reply, i) => (
                        <Button
                          key={i}
                          variant="outline"
                          size="sm"
                          className="text-xs"
                          onClick={() => handleQuickReply(reply)}
                        >
                          {reply}
                        </Button>
                      ))}
                    </div>
                  )}
                  
                  {/* Product Recommendations */}
                  {message.productRecommendations && message.productRecommendations.length > 0 && (
                    <div className="mt-3 space-y-2">
                      <div className="text-xs font-medium text-gray-600">Recommended Products:</div>
                      {message.productRecommendations.slice(0, 3).map((product, i) => (
                        <div key={i} className="flex items-center gap-2 p-2 bg-white rounded border">
                          <div className="flex-1">
                            <div className="text-sm font-medium">{product.name}</div>
                            <div className="text-xs text-gray-600">${product.price}</div>
                          </div>
                          <Button size="sm" variant="outline" className="text-xs">
                            View
                            <ExternalLink className="h-3 w-3 ml-1" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                  
                  {/* Escalation Notice */}
                  {message.requiresEscalation && (
                    <div className="mt-2 p-2 bg-orange-50 border border-orange-200 rounded text-xs">
                      <div className="font-medium text-orange-800">Need more help?</div>
                      <div className="text-orange-700">Our support team is ready to assist you.</div>
                      <Button size="sm" variant="outline" className="mt-2 text-xs">
                        Contact Support
                      </Button>
                    </div>
                  )}
                  
                  <div className="text-xs text-gray-500 mt-1">
                    {new Date(message.timestamp).toLocaleTimeString([], { 
                      hour: '2-digit', 
                      minute: '2-digit' 
                    })}
                  </div>
                </div>
              </div>
            ))}
            
            {/* Typing Indicator */}
            {isTyping && (
              <div className="flex gap-3">
                <div className="bg-gray-100 text-gray-600 rounded-full p-2">
                  <Bot className="h-5 w-5" />
                </div>
                <div className="bg-gray-100 text-gray-900 rounded-lg rounded-bl-sm p-3">
                  <div className="flex gap-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <form onSubmit={handleSubmit} className="flex gap-2">
            <Input
              ref={inputRef}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Ask me about products, AI features, or get help..."
              disabled={isLoading}
              className="flex-1"
            />
            <Button 
              type="submit" 
              disabled={isLoading || !inputValue.trim()}
              className="px-3"
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </Button>
          </form>
          
          {/* Footer */}
          <div className="text-xs text-gray-500 text-center mt-2">
            Powered by AI • GDPR Compliant • {user ? 'Authenticated' : 'Guest Mode'}
          </div>
        </CardContent>
      )}
    </Card>
  );
}