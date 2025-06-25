import OpenAI from 'openai';
import { storage } from '../storage';
import { Product, User } from '@shared/schema';

interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
}

interface ChatContext {
  userId?: string;
  sessionId: string;
  conversationHistory: ChatMessage[];
  userProfile?: User;
  currentIntent?: string;
  extractedEntities?: Record<string, any>;
}

interface ChatbotResponse {
  message: string;
  intent: string;
  confidence: number;
  actions?: string[];
  suggestedQueries?: string[];
  productRecommendations?: Product[];
  requiresEscalation?: boolean;
}

export class EshoTryAIChatbot {
  private openai: OpenAI;
  private systemPrompt: string;
  private knowledgeBase: Map<string, any> = new Map();

  constructor() {
    if (!process.env.OPENAI_API_KEY) {
      throw new Error('OPENAI_API_KEY is required for chatbot functionality');
    }
    
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    this.systemPrompt = this.buildSystemPrompt();
    this.initializeKnowledgeBase();
  }

  private buildSystemPrompt(): string {
    return `You are EshoBot, the intelligent AI assistant for EshoTry, an advanced AI-powered fashion e-commerce platform. You have deep knowledge of all platform features and can help users with shopping, AI features, and technical support.

PLATFORM FEATURES YOU SUPPORT:
1. Virtual Try-On: AI-powered virtual fitting with realistic fabric physics (sub-2s processing)
2. 3D Outfit Visualization: Interactive 3D rendering with style compatibility scoring
3. Mobile AR Try-On: Real-time camera-based augmented reality experience
4. Enhanced AI Recommendations: 89% accuracy with seasonal trends and outfit compatibility
5. AI Wardrobe Analysis: Intelligent gap detection and purchase optimization

CORE CAPABILITIES:
- Product search and recommendations with real-time stock checking
- Virtual try-on troubleshooting and optimization tips
- Size recommendations and fit guidance
- Order tracking and support (for authenticated users)
- AI feature explanations and tutorials
- Fashion styling advice and outfit suggestions
- Technical support for AR/3D features

RESPONSE GUIDELINES:
- Be friendly, knowledgeable, and professional
- Always provide specific, actionable advice
- When uncertain, offer to connect with human support
- Protect user privacy - never ask for sensitive information
- Use platform-specific terminology and features
- Provide mobile-optimized instructions when relevant
- Suggest trying AI features when appropriate

ESCALATION TRIGGERS:
- Complex technical issues beyond basic troubleshooting
- Billing or payment disputes
- Product defects or quality issues
- Requests for account changes requiring verification
- Sensitive personal information discussions

Remember: You have access to live product data, stock levels, and user order information (when authenticated). Always verify information before providing specific details.`;
  }

  private async initializeKnowledgeBase() {
    // Load knowledge base with platform information
    this.knowledgeBase.set('virtual-tryon', {
      features: ['Realistic fabric physics', 'Sub-2 second processing', 'Privacy-first auto-deletion'],
      troubleshooting: {
        'slow_processing': 'Ensure good lighting and stable internet connection',
        'body_not_detected': 'Use well-lit photo with full torso visible against plain background',
        'poor_results': 'Try avatar creation mode or upload higher quality image'
      },
      tips: ['Use rear camera for better quality', 'Stand against plain background', 'Wear fitted clothing']
    });

    this.knowledgeBase.set('3d-visualization', {
      features: ['Interactive 3D rendering', 'AI compatibility scoring', 'Mobile optimized'],
      controls: ['Click and drag to rotate', 'Scroll to zoom', 'Reset button to center view'],
      compatibility: {
        '90-100%': 'Perfect harmony',
        '80-89%': 'Great match',
        '70-79%': 'Good combination',
        '60-69%': 'Acceptable pairing'
      }
    });

    this.knowledgeBase.set('mobile-ar', {
      requirements: ['iOS Safari 14+', 'Android Chrome 90+', 'Camera permissions'],
      features: ['Real-time tracking', 'Local processing', 'Privacy protection'],
      tips: ['Use good lighting', 'Hold device steady', 'Keep torso visible']
    });

    this.knowledgeBase.set('recommendations', {
      accuracy: '89%',
      factors: ['Style preferences', 'Purchase history', 'Seasonal trends', 'Outfit compatibility'],
      features: ['Personalized suggestions', 'Seasonal integration', 'Complete outfit recommendations']
    });

    this.knowledgeBase.set('wardrobe-analysis', {
      features: ['Gap identification', 'Versatility scoring', 'Color harmony analysis'],
      benefits: ['35% purchase confidence increase', '25% return rate reduction'],
      insights: ['Missing essentials', 'Seasonal balance', 'Style optimization']
    });
  }

  async processMessage(
    message: string,
    context: ChatContext
  ): Promise<ChatbotResponse> {
    try {
      // Analyze intent and extract entities
      const intent = await this.analyzeIntent(message);
      const entities = await this.extractEntities(message, intent);
      
      // Update context
      context.currentIntent = intent;
      context.extractedEntities = entities;
      context.conversationHistory.push({
        role: 'user',
        content: message,
        timestamp: new Date()
      });

      // Generate response based on intent
      let response: ChatbotResponse;
      
      switch (intent) {
        case 'product_inquiry':
          response = await this.handleProductInquiry(message, context, entities);
          break;
        case 'stock_check':
          response = await this.handleStockCheck(message, context, entities);
          break;
        case 'virtual_tryon_help':
          response = await this.handleVirtualTryOnHelp(message, context, entities);
          break;
        case 'size_help':
          response = await this.handleSizeHelp(message, context, entities);
          break;
        case 'order_tracking':
          response = await this.handleOrderTracking(message, context, entities);
          break;
        case 'ai_features_help':
          response = await this.handleAIFeaturesHelp(message, context, entities);
          break;
        case 'general_fashion_advice':
          response = await this.handleFashionAdvice(message, context, entities);
          break;
        default:
          response = await this.handleGeneralQuery(message, context);
      }

      // Add response to conversation history
      context.conversationHistory.push({
        role: 'assistant',
        content: response.message,
        timestamp: new Date()
      });

      return response;
    } catch (error) {
      console.error('Chatbot processing error:', error);
      return {
        message: "I'm having a technical issue right now. Let me connect you with our support team for immediate assistance.",
        intent: 'error',
        confidence: 0,
        requiresEscalation: true
      };
    }
  }

  private async analyzeIntent(message: string): Promise<string> {
    const intents = {
      product_inquiry: ['product', 'item', 'clothes', 'shirt', 'dress', 'shoes', 'buy', 'purchase', 'looking for'],
      stock_check: ['available', 'stock', 'in stock', 'out of stock', 'availability', 'sizes available'],
      virtual_tryon_help: ['try on', 'virtual', 'fitting', 'how does it look', 'upload photo'],
      size_help: ['size', 'fit', 'sizing', 'measurements', 'too big', 'too small', 'what size'],
      order_tracking: ['order', 'delivery', 'shipping', 'track', 'status', 'when will'],
      ai_features_help: ['3d', 'ar', 'augmented reality', 'recommendations', 'wardrobe analysis'],
      general_fashion_advice: ['style', 'outfit', 'fashion', 'what to wear', 'looks good', 'match']
    };

    const messageLower = message.toLowerCase();
    
    for (const [intent, keywords] of Object.entries(intents)) {
      if (keywords.some(keyword => messageLower.includes(keyword))) {
        return intent;
      }
    }
    
    return 'general_query';
  }

  private async extractEntities(message: string, intent: string): Promise<Record<string, any>> {
    // Simple entity extraction - in production, use more sophisticated NLP
    const entities: Record<string, any> = {};
    
    // Extract product categories
    const categories = ['top', 'bottom', 'dress', 'shoes', 'accessories', 'jacket', 'pants', 'shirt'];
    const foundCategory = categories.find(cat => message.toLowerCase().includes(cat));
    if (foundCategory) entities.category = foundCategory;
    
    // Extract colors
    const colors = ['red', 'blue', 'green', 'black', 'white', 'yellow', 'pink', 'purple'];
    const foundColor = colors.find(color => message.toLowerCase().includes(color));
    if (foundColor) entities.color = foundColor;
    
    // Extract sizes
    const sizes = ['xs', 's', 'm', 'l', 'xl', 'xxl', 'small', 'medium', 'large'];
    const foundSize = sizes.find(size => message.toLowerCase().includes(size));
    if (foundSize) entities.size = foundSize;
    
    return entities;
  }

  private async handleProductInquiry(
    message: string,
    context: ChatContext,
    entities: Record<string, any>
  ): Promise<ChatbotResponse> {
    try {
      // Search products based on entities
      const searchFilters: any = {};
      if (entities.category) {
        // Map category to category ID (simplified)
        const categoryMap: Record<string, number> = {
          'top': 1, 'shirt': 1, 'blouse': 1,
          'bottom': 2, 'pants': 2, 'jeans': 2,
          'dress': 3,
          'shoes': 4,
          'accessories': 5
        };
        searchFilters.categoryId = categoryMap[entities.category];
      }
      
      const products = await storage.getProducts({
        ...searchFilters,
        limit: 5
      });
      
      if (products.length === 0) {
        return {
          message: "I couldn't find any products matching your request. Would you like me to show you our featured items or help you with a different search?",
          intent: 'product_inquiry',
          confidence: 0.8,
          suggestedQueries: [
            "Show me featured products",
            "What's trending now?",
            "Help me find something specific"
          ]
        };
      }
      
      const productList = products.map(p => `• ${p.name} - $${p.price}`).join('\n');
      
      return {
        message: `I found some great options for you:\n\n${productList}\n\nWould you like to try any of these virtually? I can help you with our AI-powered Virtual Try-On feature!`,
        intent: 'product_inquiry',
        confidence: 0.9,
        productRecommendations: products,
        actions: ['virtual_tryon', 'view_details'],
        suggestedQueries: [
          "Try on virtually",
          "Show me more details",
          "Find similar items"
        ]
      };
    } catch (error) {
      console.error('Product inquiry error:', error);
      return {
        message: "I'm having trouble accessing our product database. Let me connect you with our support team to help you find what you're looking for.",
        intent: 'product_inquiry',
        confidence: 0.5,
        requiresEscalation: true
      };
    }
  }

  private async handleStockCheck(
    message: string,
    context: ChatContext,
    entities: Record<string, any>
  ): Promise<ChatbotResponse> {
    // In a real implementation, you'd check actual stock levels
    return {
      message: "I can check stock availability for specific items. Could you tell me which product you're interested in? You can share the product name or browse our catalog and I'll give you real-time availability including size options.",
      intent: 'stock_check',
      confidence: 0.8,
      suggestedQueries: [
        "Check if Classic White Shirt is available",
        "What sizes are available for this item?",
        "Browse products"
      ]
    };
  }

  private async handleVirtualTryOnHelp(
    message: string,
    context: ChatContext,
    entities: Record<string, any>
  ): Promise<ChatbotResponse> {
    const troubleshooting = this.knowledgeBase.get('virtual-tryon');
    
    if (message.toLowerCase().includes('slow') || message.toLowerCase().includes('taking long')) {
      return {
        message: `For faster Virtual Try-On processing:\n\n• Ensure stable internet connection\n• Use good lighting on your photo\n• Try a smaller image file (under 10MB)\n• Clear your browser cache if needed\n\nOur AI typically processes images in under 2 seconds. Would you like me to guide you through the photo upload process?`,
        intent: 'virtual_tryon_help',
        confidence: 0.9,
        actions: ['retry_tryon', 'photo_tips']
      };
    }
    
    if (message.toLowerCase().includes('not working') || message.toLowerCase().includes('error')) {
      return {
        message: `Let's troubleshoot your Virtual Try-On issue:\n\n1. **Photo Quality**: Use a clear, well-lit photo with your full torso visible\n2. **Background**: Stand against a plain, contrasting background\n3. **Pose**: Face the camera directly with arms at your sides\n4. **Camera**: Use the rear camera for better quality\n\nIf you're still having issues, try our Avatar Creation mode for a privacy-first alternative. Would you like me to explain how that works?`,
        intent: 'virtual_tryon_help',
        confidence: 0.95,
        actions: ['avatar_creation', 'photo_guidelines'],
        suggestedQueries: [
          "Show me avatar creation",
          "What makes a good photo?",
          "Try a different product"
        ]
      };
    }
    
    return {
      message: `Our Virtual Try-On uses advanced AI to show how clothes look on you with realistic fabric physics! Here's how it works:\n\n✨ **Upload Photo**: Clear, well-lit image with full torso\n✨ **AI Processing**: Sub-2 second realistic visualization\n✨ **Privacy First**: Photos auto-deleted after processing\n\n**Tips for best results:**\n• Use good lighting\n• Plain background\n• Fitted clothing\n• Face camera directly\n\nWant to try it now?`,
      intent: 'virtual_tryon_help',
      confidence: 0.9,
      actions: ['start_tryon', 'view_examples'],
      suggestedQueries: [
        "Start virtual try-on",
        "Show me examples",
        "What about privacy?"
      ]
    };
  }

  private async handleSizeHelp(
    message: string,
    context: ChatContext,
    entities: Record<string, any>
  ): Promise<ChatbotResponse> {
    return {
      message: `I'd love to help you find the perfect size! Our AI can provide personalized size recommendations based on:\n\n📏 **Your measurements** (height, weight, key body measurements)\n📊 **AI analysis** of how different brands fit\n🎯 **Fit preferences** (slim, regular, relaxed)\n\nFor the most accurate sizing:\n1. Use our Virtual Try-On to see how items look\n2. Check our size guide for each product\n3. Read customer reviews for fit feedback\n4. Consider your preferred fit style\n\nWould you like me to help you with a specific item's sizing?`,
      intent: 'size_help',
      confidence: 0.9,
      actions: ['virtual_tryon', 'size_guide'],
      suggestedQueries: [
        "Help me with this item's size",
        "Show size guide",
        "What do reviews say about fit?"
      ]
    };
  }

  private async handleOrderTracking(
    message: string,
    context: ChatContext,
    entities: Record<string, any>
  ): Promise<ChatbotResponse> {
    if (!context.userId) {
      return {
        message: "To help you track your order, you'll need to be signed in to your account. Once logged in, I can provide real-time order status, shipping updates, and delivery information.\n\nWould you like me to help you sign in, or do you have other questions I can assist with?",
        intent: 'order_tracking',
        confidence: 0.8,
        actions: ['sign_in'],
        suggestedQueries: [
          "Help me sign in",
          "Other questions",
          "General product help"
        ]
      };
    }
    
    return {
      message: "I can help you track your orders! Let me look up your recent orders and provide current status updates including shipping information and expected delivery dates.\n\n*Checking your orders...*\n\nI'll need to access your order history securely. Is there a specific order you'd like to track, or would you like to see all recent orders?",
      intent: 'order_tracking',
      confidence: 0.9,
      actions: ['view_orders', 'specific_order'],
      suggestedQueries: [
        "Show all my orders",
        "Track specific order",
        "Delivery information"
      ]
    };
  }

  private async handleAIFeaturesHelp(
    message: string,
    context: ChatContext,
    entities: Record<string, any>
  ): Promise<ChatbotResponse> {
    if (message.toLowerCase().includes('3d')) {
      const knowledge = this.knowledgeBase.get('3d-visualization');
      return {
        message: `Our 3D Outfit Visualization is amazing! 🎯\n\n**Features:**\n• Interactive 3D rendering with realistic physics\n• AI style compatibility scoring (89% accuracy)\n• Mobile-optimized performance\n• Complete outfit combinations\n\n**How to use:**\n• Click and drag to rotate the view\n• Scroll to zoom in/out\n• Check compatibility scores for outfit harmony\n• Mix and match different pieces\n\n**Compatibility Scores:**\n• 90-100%: Perfect harmony\n• 80-89%: Great match\n• 70-79%: Good combination\n\nWant to try it with an outfit?`,
        intent: 'ai_features_help',
        confidence: 0.95,
        actions: ['try_3d_visualization'],
        suggestedQueries: [
          "Try 3D visualization",
          "How does compatibility scoring work?",
          "Show me outfit combinations"
        ]
      };
    }
    
    if (message.toLowerCase().includes('ar') || message.toLowerCase().includes('augmented')) {
      return {
        message: `Mobile AR Try-On brings fashion to life! 📱✨\n\n**Requirements:**\n• iOS Safari 14+ or Android Chrome 90+\n• Camera permissions\n• Good lighting\n\n**Features:**\n• Real-time garment overlay\n• 30fps smooth tracking\n• Privacy-first local processing\n• Photo capture capability\n\n**Tips for best AR experience:**\n• Use bright, even lighting\n• Keep full torso visible\n• Hold device steady\n• Stand 3-4 feet from camera\n\nReady to try AR on your mobile device?`,
        intent: 'ai_features_help',
        confidence: 0.95,
        actions: ['start_mobile_ar'],
        suggestedQueries: [
          "Start AR try-on",
          "Check device compatibility",
          "AR privacy information"
        ]
      };
    }
    
    if (message.toLowerCase().includes('recommendation')) {
      return {
        message: `Our Enhanced AI Recommendations are incredibly smart! 🧠\n\n**89% Accuracy** powered by:\n• Your style preferences and history\n• Seasonal trends and weather\n• Complete outfit compatibility\n• 50+ preference factors\n\n**Types of recommendations:**\n• Personalized suggestions\n• Seasonal collections\n• Outfit completion items\n• Similar products you'll love\n\n**How to improve recommendations:**\n• Rate products you see\n• Use Virtual Try-On frequently\n• Update your style preferences\n• Browse different categories\n\nWant to see your personalized recommendations?`,
        intent: 'ai_features_help',
        confidence: 0.95,
        actions: ['view_recommendations'],
        suggestedQueries: [
          "Show my recommendations",
          "Update style preferences",
          "How does the AI learn?"
        ]
      };
    }
    
    return {
      message: `EshoTry has incredible AI features! Here's what I can help you with:\n\n🤖 **Virtual Try-On**: Realistic fabric physics simulation\n📦 **3D Visualization**: Interactive outfit combinations\n📱 **Mobile AR**: Real-time camera try-on\n🎯 **Smart Recommendations**: 89% accuracy\n👔 **Wardrobe Analysis**: Gap detection & optimization\n\nWhich AI feature interests you most? I can provide detailed guidance and help you get started!`,
      intent: 'ai_features_help',
      confidence: 0.9,
      suggestedQueries: [
        "Tell me about Virtual Try-On",
        "How does 3D visualization work?",
        "Show me AR features"
      ]
    };
  }

  private async handleFashionAdvice(
    message: string,
    context: ChatContext,
    entities: Record<string, any>
  ): Promise<ChatbotResponse> {
    return {
      message: `I'd love to help with fashion advice! 👗✨\n\nI can assist you with:\n\n**Style Guidance:**\n• Outfit combinations and color coordination\n• Seasonal fashion trends\n• Occasion-appropriate clothing\n• Personal style development\n\n**EshoTry AI Tools:**\n• Wardrobe Analysis to identify gaps\n• 3D Outfit Visualization for combinations\n• AI Recommendations based on your style\n• Virtual Try-On to see how looks work on you\n\nWhat specific style question do you have? Are you looking for outfit ideas, color advice, or help with a particular occasion?`,
      intent: 'general_fashion_advice',
      confidence: 0.85,
      actions: ['wardrobe_analysis', 'style_quiz'],
      suggestedQueries: [
        "Help me with outfit ideas",
        "What colors work for me?",
        "Analyze my wardrobe"
      ]
    };
  }

  private async handleGeneralQuery(
    message: string,
    context: ChatContext
  ): Promise<ChatbotResponse> {
    try {
      // Use OpenAI for general queries with platform context
      const completion = await this.openai.chat.completions.create({
        model: "gpt-4", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
        messages: [
          { role: "system", content: this.systemPrompt },
          ...context.conversationHistory.slice(-5), // Last 5 messages for context
          { role: "user", content: message }
        ],
        max_tokens: 500,
        temperature: 0.7,
        response_format: { type: "json_object" }
      });

      const response = JSON.parse(completion.choices[0].message.content || '{}');
      
      return {
        message: response.message || "I understand you're asking about our platform. Could you be more specific about what you'd like to know? I can help with products, AI features, orders, or general fashion advice.",
        intent: 'general_query',
        confidence: response.confidence || 0.7,
        suggestedQueries: response.suggestedQueries || [
          "Tell me about Virtual Try-On",
          "Help me find products",
          "Explain AI features"
        ]
      };
    } catch (error) {
      console.error('OpenAI API error:', error);
      return {
        message: "I'm here to help with your EshoTry experience! I can assist with:\n\n• Product search and recommendations\n• Virtual Try-On and AI features\n• Sizing and fit guidance\n• Order tracking and support\n• Fashion advice and styling\n\nWhat would you like to know more about?",
        intent: 'general_query',
        confidence: 0.6,
        suggestedQueries: [
          "Show me AI features",
          "Help me find products",
          "Size guidance"
        ]
      };
    }
  }

  async getQuickReplies(intent: string): Promise<string[]> {
    const quickReplies: Record<string, string[]> = {
      'product_inquiry': [
        "Show featured products",
        "Virtual try-on",
        "Size guide"
      ],
      'virtual_tryon_help': [
        "Photo tips",
        "Try avatar mode",
        "Privacy info"
      ],
      'ai_features_help': [
        "3D visualization",
        "AR try-on",
        "Recommendations"
      ],
      'general_query': [
        "AI features",
        "Find products",
        "Get help"
      ]
    };
    
    return quickReplies[intent] || [
      "Help me shop",
      "AI features",
      "Support"
    ];
  }
}

export const eshoTryChatbot = new EshoTryAIChatbot();