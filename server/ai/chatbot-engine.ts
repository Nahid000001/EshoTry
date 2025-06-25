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
  language?: string;
  sessionMemory?: SessionMemory;
}

interface SessionMemory {
  recentSearches: string[];
  viewedProducts: Product[];
  preferredCategories: string[];
  lastActivity: Date;
  userPreferences: Record<string, any>;
}

interface ChatbotResponse {
  message: string;
  intent: string;
  confidence: number;
  actions?: string[];
  suggestedQueries?: string[];
  productRecommendations?: Product[];
  requiresEscalation?: boolean;
  language?: string;
  proactivePrompt?: boolean;
}

export class EshoTryAIChatbot {
  private openai: OpenAI;
  private systemPrompt: string;
  private knowledgeBase: Map<string, any> = new Map();
  private translations: Map<string, Record<string, string>> = new Map();
  private sessionMemories: Map<string, SessionMemory> = new Map();

  constructor() {
    if (!process.env.OPENAI_API_KEY) {
      throw new Error('OPENAI_API_KEY is required for chatbot functionality');
    }
    
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    this.systemPrompt = this.buildSystemPrompt();
    this.initializeKnowledgeBase();
    this.initializeTranslations();
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

  private initializeTranslations() {
    // English translations (base)
    this.translations.set('en', {
      welcome: 'Hi! I\'m EshoBot, your AI fashion assistant.',
      help_intro: 'I can help you with:',
      product_search: 'Product search and recommendations',
      virtual_tryon: 'Virtual Try-On and AI features',
      size_help: 'Sizing and fit guidance',
      order_tracking: 'Order tracking',
      fashion_advice: 'Fashion advice and styling',
      what_help: 'What can I help you with today?',
      found_products: 'Found {count} matching product{s}:',
      in_stock: 'in stock',
      out_of_stock: 'Out of stock',
      available_purchase: 'available for immediate purchase',
      try_virtual: 'Want to see how any of these look on you? Try our Virtual Try-On feature!',
      no_products: 'I couldn\'t find any products matching your request.',
      browse_categories: 'Browse categories',
      show_featured: 'Show featured items',
      contact_support: 'Contact support',
      language_changed: 'Language changed to English',
      session_memory_note: 'I remember our previous conversation.',
      proactive_suggestion: 'While you\'re here, you might like these trending items:',
      voice_ready: 'Voice input ready - speak your question!'
    });

    // Bangla translations
    this.translations.set('bn', {
      welcome: 'হ্যালো! আমি এশোবট, আপনার এআই ফ্যাশন সহায়ক।',
      help_intro: 'আমি আপনাকে সাহায্য করতে পারি:',
      product_search: 'পণ্য অনুসন্ধান এবং সুপারিশ',
      virtual_tryon: 'ভার্চুয়াল ট্রাই-অন এবং এআই বৈশিষ্ট্য',
      size_help: 'সাইজ এবং ফিট গাইড',
      order_tracking: 'অর্ডার ট্র্যাকিং',
      fashion_advice: 'ফ্যাশন পরামর্শ এবং স্টাইলিং',
      what_help: 'আজ আমি আপনাকে কীভাবে সাহায্য করতে পারি?',
      found_products: '{count}টি মিলে যাওয়া পণ্য পাওয়া গেছে:',
      in_stock: 'স্টকে আছে',
      out_of_stock: 'স্টকে নেই',
      available_purchase: 'তাৎক্ষণিক কেনাকাটার জন্য উপলব্ধ',
      try_virtual: 'এগুলোর মধ্যে কোনটি আপনার উপর কেমন দেখাবে জানতে চান? আমাদের ভার্চুয়াল ট্রাই-অন ব্যবহার করুন!',
      no_products: 'আপনার অনুরোধের সাথে মিলে এমন কোনো পণ্য পাইনি।',
      browse_categories: 'ক্যাটাগরি ব্রাউজ করুন',
      show_featured: 'বিশেষ পণ্যগুলো দেখুন',
      contact_support: 'সাপোর্টে যোগাযোগ করুন',
      language_changed: 'ভাষা বাংলায় পরিবর্তিত হয়েছে',
      session_memory_note: 'আমি আমাদের আগের কথোপকথন মনে রেখেছি।',
      proactive_suggestion: 'আপনি এখানে থাকতে থাকতে, এই ট্রেন্ডিং পণ্যগুলো পছন্দ করতে পারেন:',
      voice_ready: 'ভয়েস ইনপুট প্রস্তুত - আপনার প্রশ্ন বলুন!'
    });
  }

  private detectLanguage(message: string): string {
    // Simple language detection for Bangla vs English
    const banglaPattern = /[\u0980-\u09FF]/;
    return banglaPattern.test(message) ? 'bn' : 'en';
  }

  private translate(key: string, language: string = 'en', params: Record<string, any> = {}): string {
    const translations = this.translations.get(language) || this.translations.get('en')!;
    let text = translations[key] || key;
    
    // Replace parameters in translation
    Object.keys(params).forEach(param => {
      text = text.replace(`{${param}}`, params[param].toString());
    });
    
    return text;
  }

  private getOrCreateSessionMemory(sessionId: string): SessionMemory {
    if (!this.sessionMemories.has(sessionId)) {
      this.sessionMemories.set(sessionId, {
        recentSearches: [],
        viewedProducts: [],
        preferredCategories: [],
        lastActivity: new Date(),
        userPreferences: {}
      });
    }
    
    const memory = this.sessionMemories.get(sessionId)!;
    memory.lastActivity = new Date();
    return memory;
  }

  private updateSessionMemory(sessionId: string, update: Partial<SessionMemory>) {
    const memory = this.getOrCreateSessionMemory(sessionId);
    Object.assign(memory, update);
  }

  private cleanupOldSessions() {
    const now = new Date();
    const maxAge = 60 * 60 * 1000; // 1 hour
    
    for (const [sessionId, memory] of this.sessionMemories.entries()) {
      if (now.getTime() - memory.lastActivity.getTime() > maxAge) {
        this.sessionMemories.delete(sessionId);
      }
    }
  }

  async generateProactiveSuggestion(context: ChatContext): Promise<ChatbotResponse | null> {
    try {
      const memory = this.getOrCreateSessionMemory(context.sessionId);
      const language = context.language || 'en';
      
      // Get trending or featured products
      const products = await storage.getProducts({ featured: true, limit: 3 });
      
      if (products.length === 0) return null;
      
      const productList = products.map(p => 
        `• ${p.name} - $${p.price}`
      ).join('\n');
      
      return {
        message: this.translate('proactive_suggestion', language) + '\n\n' + productList + '\n\n' + 
                this.translate('try_virtual', language),
        intent: 'proactive_suggestion',
        confidence: 0.8,
        productRecommendations: products,
        actions: ['virtual_tryon', 'view_details'],
        suggestedQueries: [
          language === 'bn' ? 'ভার্চুয়াল ট্রাই-অন করুন' : 'Try virtual fitting',
          language === 'bn' ? 'আরো দেখুন' : 'Show more details'
        ],
        language,
        proactivePrompt: true
      };
      
    } catch (error) {
      console.error('Proactive suggestion error:', error);
      return null;
    }
  }

  async processMessage(
    message: string,
    context: ChatContext
  ): Promise<ChatbotResponse> {
    try {
      // Clean up old sessions periodically
      if (Math.random() < 0.1) {
        this.cleanupOldSessions();
      }
      
      // Detect language and update context
      const detectedLanguage = this.detectLanguage(message);
      context.language = context.language || detectedLanguage;
      
      // Handle language change commands
      if (message.toLowerCase().includes('switch to english') || message.toLowerCase().includes('change language english')) {
        context.language = 'en';
        return {
          message: this.translate('language_changed', 'en'),
          intent: 'language_change',
          confidence: 1.0,
          language: 'en'
        };
      }
      
      if (message.toLowerCase().includes('বাংলায় পরিবর্তন') || message.toLowerCase().includes('switch to bangla')) {
        context.language = 'bn';
        return {
          message: this.translate('language_changed', 'bn'),
          intent: 'language_change',
          confidence: 1.0,
          language: 'bn'
        };
      }
      
      // Get or create session memory
      context.sessionMemory = this.getOrCreateSessionMemory(context.sessionId);
      
      // Analyze intent and extract entities
      const intent = await this.analyzeIntent(message, context.language);
      const entities = await this.extractEntities(message, intent);
      
      // Update session memory with search terms
      if (entities.searchTerms && entities.searchTerms.length > 0) {
        const memory = context.sessionMemory;
        memory.recentSearches = [...new Set([...entities.searchTerms, ...memory.recentSearches])].slice(0, 10);
        this.updateSessionMemory(context.sessionId, { recentSearches: memory.recentSearches });
      }
      
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

      // Add language to response
      response.language = context.language;
      
      // Update session memory with viewed products
      if (response.productRecommendations && response.productRecommendations.length > 0) {
        const memory = context.sessionMemory;
        memory.viewedProducts = [...response.productRecommendations, ...memory.viewedProducts].slice(0, 20);
        this.updateSessionMemory(context.sessionId, { viewedProducts: memory.viewedProducts });
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

  private async analyzeIntent(message: string, language: string = 'en'): Promise<string> {
    const messageLower = message.toLowerCase();
    
    // Bangla pattern recognition
    if (language === 'bn') {
      if (messageLower.includes('কত') || messageLower.includes('স্টক') || messageLower.includes('পণ্য') || messageLower.includes('আছে')) {
        return 'stock_check';
      }
      if (messageLower.includes('ভার্চুয়াল') || messageLower.includes('ট্রাই') || messageLower.includes('পরে দেখ')) {
        return 'virtual_tryon_help';
      }
      if (messageLower.includes('সাইজ') || messageLower.includes('মাপ') || messageLower.includes('ফিট')) {
        return 'size_help';
      }
      if (messageLower.includes('খুঁজ') || messageLower.includes('দেখা') || messageLower.includes('পণ্য')) {
        return 'product_inquiry';
      }
    }
    
    // Priority patterns for stock queries (check first)
    if (messageLower.match(/\b(how many|total|count|number of|কত|কতটি)\b.*\b(item|product|stock|available|inventory|পণ্য|স্টক)\b/)) {
      return 'stock_check';
    }
    
    if (messageLower.match(/\b(do you have|is.*available|any.*left|.*in stock|.*available|.*inventory|আছে|পাওয়া যায়)\b/)) {
      return 'stock_check';
    }
    
    if (messageLower.match(/\b(stock|inventory|available|availability|স্টক|পণ্য)\b/)) {
      return 'stock_check';
    }
    
    // Enhanced intent recognition with better keyword matching
    const intents = {
      virtual_tryon_help: [
        'try on', 'virtual', 'fitting', 'how does it look', 'upload photo',
        'avatar', 'try it', 'see how', 'wear it', 'fit me',
        'ভার্চুয়াল', 'ট্রাই', 'পরে দেখ', 'ফিটিং'
      ],
      size_help: [
        'size', 'fit', 'sizing', 'measurements', 'too big', 'too small', 
        'what size', 'size guide', 'size chart', 'fit guide',
        'সাইজ', 'মাপ', 'ফিট', 'বড়', 'ছোট'
      ],
      order_tracking: [
        'order', 'delivery', 'shipping', 'track', 'status', 'when will',
        'my order', 'tracking', 'shipped', 'delivered'
      ],
      ai_features_help: [
        '3d', 'ar', 'augmented reality', 'recommendations', 'wardrobe analysis',
        'features', 'ai', 'artificial intelligence', 'smart', 'technology'
      ],
      product_inquiry: [
        'product', 'item', 'clothes', 'clothing', 'shirt', 'dress', 'shoes', 
        'buy', 'purchase', 'looking for', 'find', 'search', 'show me',
        'pants', 'trouser', 'jacket', 'coat', 'top', 'bottom',
        'পণ্য', 'কাপড়', 'শার্ট', 'প্যান্ট', 'জুতা', 'খুঁজ', 'দেখা', 'কিন'
      ],
      general_fashion_advice: [
        'style', 'outfit', 'fashion', 'what to wear', 'looks good', 'match',
        'styling', 'coordinate', 'combination', 'trend'
      ]
    };

    // Check for intent patterns with priority
    const intentOrder = ['virtual_tryon_help', 'size_help', 'order_tracking', 'ai_features_help', 'product_inquiry', 'general_fashion_advice'];
    
    for (const intent of intentOrder) {
      const keywords = intents[intent as keyof typeof intents];
      if (keywords.some(keyword => messageLower.includes(keyword))) {
        return intent;
      }
    }
    
    // Product inquiry patterns
    if (messageLower.match(/\b(find|search|looking for|want|need|show me)\b.*\b(product|item|clothes|clothing)\b/)) {
      return 'product_inquiry';
    }
    
    return 'general_query';
  }

  private async extractEntities(message: string, intent: string): Promise<Record<string, any>> {
    const entities: Record<string, any> = {};
    const messageLower = message.toLowerCase();
    
    // Enhanced category extraction with synonyms
    const categoryMappings = {
      'tops': ['top', 'shirt', 'blouse', 'tee', 't-shirt', 'tank', 'sweater', 'hoodie'],
      'bottoms': ['bottom', 'pants', 'trouser', 'jean', 'short', 'skirt', 'legging'],
      'dresses': ['dress', 'gown', 'frock'],
      'shoes': ['shoe', 'boot', 'sneaker', 'heel', 'sandal', 'flat'],
      'accessories': ['accessory', 'bag', 'hat', 'scarf', 'jewelry', 'belt', 'watch']
    };
    
    for (const [category, synonyms] of Object.entries(categoryMappings)) {
      if (synonyms.some(synonym => messageLower.includes(synonym))) {
        entities.category = category;
        break;
      }
    }
    
    // Enhanced color extraction
    const colors = ['red', 'blue', 'green', 'black', 'white', 'yellow', 'pink', 'purple', 'brown', 'grey', 'gray', 'orange', 'navy', 'beige', 'khaki'];
    const foundColor = colors.find(color => messageLower.includes(color));
    if (foundColor) entities.color = foundColor;
    
    // Enhanced size extraction
    const sizes = ['xs', 's', 'm', 'l', 'xl', 'xxl', 'small', 'medium', 'large', 'extra small', 'extra large'];
    const foundSize = sizes.find(size => messageLower.includes(size));
    if (foundSize) entities.size = foundSize;
    
    // Extract gender preferences
    const genderTerms = {
      'mens': ['men', 'male', 'guy', 'gentleman'],
      'womens': ['women', 'female', 'lady', 'girl'],
      'unisex': ['unisex', 'gender neutral']
    };
    
    for (const [gender, terms] of Object.entries(genderTerms)) {
      if (terms.some(term => messageLower.includes(term))) {
        entities.gender = gender;
        break;
      }
    }
    
    // Extract search terms for fuzzy matching
    const searchTerms = message.match(/\b\w{2,}\b/g) || [];
    entities.searchTerms = searchTerms.filter(term => 
      !['the', 'and', 'for', 'with', 'how', 'what', 'where', 'when', 'why', 'can', 'you', 'help', 'show', 'find', 'are', 'have', 'any', 'all', 'many', 'total', 'items', 'products'].includes(term.toLowerCase())
    );
    
    return entities;
  }

  private async handleProductInquiry(
    message: string,
    context: ChatContext,
    entities: Record<string, any>
  ): Promise<ChatbotResponse> {
    try {
      // Enhanced product search with fuzzy matching
      const products = await this.searchProductsWithFuzzyMatching(entities, message);
      
      if (products.length === 0) {
        // Try broader search with relaxed criteria
        const fallbackProducts = await storage.getProducts({
          featured: true,
          limit: 5
        });
        
        if (fallbackProducts.length === 0) {
          return {
            message: "I couldn't find any products matching your request. Our catalog might be updating. Would you like me to help you browse by category or contact our support team?",
            intent: 'product_inquiry',
            confidence: 0.6,
            suggestedQueries: [
              "Browse by category",
              "Show featured items",
              "Contact support"
            ]
          };
        }
        
        return {
          message: `I couldn't find exact matches for "${message}", but here are some popular items you might like:\n\n${fallbackProducts.map(p => `• ${p.name} - $${p.price} ${p.stock > 0 ? '✅ In Stock' : '❌ Out of Stock'}`).join('\n')}\n\nTry refining your search or browse our categories. I can also help you with Virtual Try-On!`,
          intent: 'product_inquiry',
          confidence: 0.7,
          productRecommendations: fallbackProducts,
          actions: ['refine_search', 'browse_categories', 'virtual_tryon'],
          suggestedQueries: [
            "Refine my search",
            "Browse categories",
            "Try virtual fitting"
          ]
        };
      }
      
      const inStockProducts = products.filter(p => p.stock > 0);
      const productList = products.map(p => 
        `• ${p.name} - $${p.price} ${p.stock > 0 ? `✅ ${p.stock} in stock` : '❌ Out of stock'}`
      ).join('\n');
      
      let responseMessage = `Found ${products.length} matching product${products.length > 1 ? 's' : ''}:\n\n${productList}\n\n`;
      
      if (inStockProducts.length > 0) {
        responseMessage += `🎯 **${inStockProducts.length} available for immediate purchase**\n\n`;
        responseMessage += "Want to see how any of these look on you? Try our Virtual Try-On feature!";
      } else {
        responseMessage += "All items are currently out of stock. Would you like me to suggest similar alternatives or notify you when they're back?";
      }
      
      return {
        message: responseMessage,
        intent: 'product_inquiry',
        confidence: 0.9,
        productRecommendations: products,
        actions: inStockProducts.length > 0 ? ['virtual_tryon', 'view_details', 'add_to_cart'] : ['find_alternatives', 'notify_restock'],
        suggestedQueries: inStockProducts.length > 0 ? [
          "Try virtual fitting",
          "Show more details",
          "Find similar items"
        ] : [
          "Find alternatives",
          "Notify when restocked",
          "Browse similar categories"
        ]
      };
    } catch (error) {
      console.error('Product inquiry error:', error);
      return {
        message: "I'm experiencing technical difficulties accessing our product catalog. Let me connect you with our support team to help you find what you're looking for.",
        intent: 'product_inquiry',
        confidence: 0.5,
        requiresEscalation: true
      };
    }
  }

  private async searchProductsWithFuzzyMatching(entities: Record<string, any>, originalMessage: string): Promise<Product[]> {
    // Get all products for comprehensive search
    const allProducts = await storage.getProducts({ limit: 1000 });
    let matchedProducts: Product[] = [];
    
    // Category-based filtering
    let categoryFilteredProducts = allProducts;
    if (entities.category) {
      const categoryMap: Record<string, number> = {
        'tops': 1,
        'bottoms': 2, 
        'dresses': 3,
        'shoes': 4,
        'accessories': 5
      };
      const categoryId = categoryMap[entities.category];
      if (categoryId) {
        categoryFilteredProducts = allProducts.filter(p => p.categoryId === categoryId);
      }
    }
    
    // If we have search terms, perform fuzzy matching
    if (entities.searchTerms && entities.searchTerms.length > 0) {
      const searchWords = entities.searchTerms.map((term: string) => term.toLowerCase());
      
      // Score each product based on relevance
      const scoredProducts = categoryFilteredProducts.map(product => {
        const productWords = product.name.toLowerCase().split(/\s+/);
        let score = 0;
        
        // Check for exact matches (highest score)
        searchWords.forEach(searchWord => {
          productWords.forEach(productWord => {
            if (productWord === searchWord) {
              score += 10;
            } else if (productWord.includes(searchWord) || searchWord.includes(productWord)) {
              score += 8;
            } else if (searchWord.length >= 3 && this.calculateLevenshteinDistance(searchWord, productWord) <= 1) {
              score += 6;
            } else if (searchWord.length >= 4 && this.calculateLevenshteinDistance(searchWord, productWord) <= 2) {
              score += 4;
            }
          });
        });
        
        // Bonus for color matches
        if (entities.color && product.name.toLowerCase().includes(entities.color.toLowerCase())) {
          score += 5;
        }
        
        return { product, score };
      });
      
      // Filter products with any score and sort by relevance
      matchedProducts = scoredProducts
        .filter(item => item.score > 0)
        .sort((a, b) => b.score - a.score)
        .map(item => item.product)
        .slice(0, 8);
    } else {
      // No search terms, return category filtered or featured products
      matchedProducts = categoryFilteredProducts.slice(0, 8);
    }
    
    return matchedProducts;
  }

  private calculateLevenshteinDistance(str1: string, str2: string): number {
    const matrix = Array(str2.length + 1).fill(null).map(() => Array(str1.length + 1).fill(null));
    
    for (let i = 0; i <= str1.length; i++) matrix[0][i] = i;
    for (let j = 0; j <= str2.length; j++) matrix[j][0] = j;
    
    for (let j = 1; j <= str2.length; j++) {
      for (let i = 1; i <= str1.length; i++) {
        const indicator = str1[i - 1] === str2[j - 1] ? 0 : 1;
        matrix[j][i] = Math.min(
          matrix[j][i - 1] + 1,
          matrix[j - 1][i] + 1,
          matrix[j - 1][i - 1] + indicator
        );
      }
    }
    
    return matrix[str2.length][str1.length];
  }

  private async handleStockCheck(
    message: string,
    context: ChatContext,
    entities: Record<string, any>
  ): Promise<ChatbotResponse> {
    try {
      const messageLower = message.toLowerCase();
      
      // Check for general stock inquiry
      if (messageLower.includes('how many') || messageLower.includes('total') || messageLower.includes('overall stock')) {
        return await this.handleGeneralStockInquiry();
      }
      
      // Specific product stock check
      if (entities.searchTerms && entities.searchTerms.length > 0) {
        const products = await this.searchProductsWithFuzzyMatching(entities, message);
        
        if (products.length === 0) {
          return {
            message: "I couldn't find that specific item. Could you provide more details about the product you're looking for? I can check stock for any item in our catalog.",
            intent: 'stock_check',
            confidence: 0.7,
            suggestedQueries: [
              "Show me all available items",
              "Browse by category",
              "Check featured products"
            ]
          };
        }
        
        if (products.length === 1) {
          const product = products[0];
          return {
            message: `📦 **${product.name}** - $${product.price}\n\n${product.stock > 0 ? `✅ **${product.stock} units in stock**` : '❌ **Currently out of stock**'}\n\n${product.stock > 0 ? 'Available for immediate purchase and Virtual Try-On!' : 'Would you like me to suggest similar alternatives or notify you when it\'s back in stock?'}`,
            intent: 'stock_check',
            confidence: 0.95,
            productRecommendations: [product],
            actions: product.stock > 0 ? ['virtual_tryon', 'add_to_cart', 'view_details'] : ['find_alternatives', 'notify_restock'],
            suggestedQueries: product.stock > 0 ? [
              "Try it on virtually",
              "Add to cart",
              "Show more details"
            ] : [
              "Find similar items",
              "Notify when available",
              "Browse alternatives"
            ]
          };
        }
        
        // Multiple products found
        const inStockCount = products.filter(p => p.stock > 0).length;
        const productList = products.slice(0, 5).map(p => 
          `• ${p.name} - ${p.stock > 0 ? `✅ ${p.stock} in stock` : '❌ Out of stock'}`
        ).join('\n');
        
        return {
          message: `Found ${products.length} matching items:\n\n${productList}\n\n📊 **${inStockCount} of ${products.length} currently available**\n\nWhich specific item would you like to check, or would you like to try any available items virtually?`,
          intent: 'stock_check',
          confidence: 0.9,
          productRecommendations: products.filter(p => p.stock > 0).slice(0, 3),
          actions: ['virtual_tryon', 'specific_check', 'browse_available'],
          suggestedQueries: [
            "Check specific item",
            "Try virtual fitting",
            "Show only available items"
          ]
        };
      }
      
      // Fallback for vague stock requests
      return {
        message: "I can check real-time stock for any specific item! Just tell me:\n\n• Product name (even partial names work)\n• Category you're interested in\n• Or browse our catalog\n\nI'll give you exact availability including sizes and variants. What would you like to check?",
        intent: 'stock_check',
        confidence: 0.8,
        suggestedQueries: [
          "Check all available items",
          "Browse by category",
          "Search specific product"
        ]
      };
      
    } catch (error) {
      console.error('Stock check error:', error);
      return {
        message: "I'm having trouble accessing our inventory system. Let me connect you with our support team for immediate stock information.",
        intent: 'stock_check',
        confidence: 0.5,
        requiresEscalation: true
      };
    }
  }

  private async handleGeneralStockInquiry(): Promise<ChatbotResponse> {
    try {
      // Get comprehensive stock data
      const allProducts = await storage.getProducts({ limit: 1000 });
      const categories = await storage.getCategories();
      
      const totalProducts = allProducts.length;
      const inStockProducts = allProducts.filter(p => p.stock > 0);
      const totalStock = allProducts.reduce((sum, p) => sum + p.stock, 0);
      
      // If no products exist, return appropriate message
      if (totalProducts === 0) {
        return {
          message: "Our catalog is currently being updated. Please check back soon or contact our support team for assistance.",
          intent: 'stock_check',
          confidence: 0.9,
          requiresEscalation: true,
          suggestedQueries: [
            "Contact support",
            "Check back later",
            "Browse featured items"
          ]
        };
      }
      
      // Category breakdown
      const categoryStats = categories.map(cat => {
        const categoryProducts = allProducts.filter(p => p.categoryId === cat.id);
        const categoryInStock = categoryProducts.filter(p => p.stock > 0);
        return {
          name: cat.name,
          total: categoryProducts.length,
          available: categoryInStock.length,
          stock: categoryProducts.reduce((sum, p) => sum + p.stock, 0)
        };
      }).filter(stat => stat.total > 0);
      
      // Featured products
      const featuredProducts = allProducts.filter(p => p.featured && p.stock > 0).slice(0, 3);
      
      let responseMessage = `Current Inventory Overview\n\n`;
      responseMessage += `${totalProducts} total products (${inStockProducts.length} available)\n`;
      responseMessage += `${totalStock} total units in stock\n\n`;
      
      if (categoryStats.length > 0) {
        responseMessage += `By Category:\n`;
        categoryStats.forEach(stat => {
          responseMessage += `• ${stat.name}: ${stat.available}/${stat.total} available (${stat.stock} units)\n`;
        });
        responseMessage += '\n';
      }
      
      if (featuredProducts.length > 0) {
        responseMessage += `Featured Items Currently Available:\n`;
        featuredProducts.forEach(product => {
          responseMessage += `• ${product.name} - $${product.price} (${product.stock} in stock)\n`;
        });
        responseMessage += '\n';
      }
      
      responseMessage += `Want to explore our catalog or try items virtually?`;
      
      return {
        message: responseMessage,
        intent: 'stock_check',
        confidence: 0.95,
        productRecommendations: featuredProducts,
        actions: ['browse_categories', 'virtual_tryon', 'view_featured'],
        suggestedQueries: [
          "Browse categories",
          "Show featured items",
          "Try virtual fitting"
        ]
      };
      
    } catch (error) {
      console.error('General stock inquiry error:', error);
      return {
        message: "I'm having trouble generating the complete inventory report. Let me get you specific stock information instead. What particular items or categories are you interested in?",
        intent: 'stock_check',
        confidence: 0.6,
        suggestedQueries: [
          "Check specific category",
          "Search for item",
          "Contact support"
        ]
      };
    }
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
      // Use OpenAI for general queries with platform context (without JSON format for older models)
      const completion = await this.openai.chat.completions.create({
        model: "gpt-4", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
        messages: [
          { role: "system", content: this.systemPrompt + "\n\nProvide helpful, specific responses about the EshoTry platform. Be concise but informative." },
          ...context.conversationHistory.slice(-5), // Last 5 messages for context
          { role: "user", content: message }
        ],
        max_tokens: 400,
        temperature: 0.7
      });

      const responseContent = completion.choices[0].message.content || '';
      
      // Extract confidence from response length and content quality
      const confidence = Math.min(0.9, 0.6 + (responseContent.length / 1000));
      
      return {
        message: responseContent || "I understand you're asking about our platform. Could you be more specific about what you'd like to know? I can help with products, AI features, orders, or general fashion advice.",
        intent: 'general_query',
        confidence: confidence,
        suggestedQueries: [
          "Tell me about Virtual Try-On",
          "Help me find products",
          "Explain AI features"
        ]
      };
    } catch (error) {
      console.error('OpenAI API error:', error);
      return {
        message: "I'm here to help with your EshoTry experience! I can assist with:\n\n• **Product Search**: Find items with partial names, colors, sizes\n• **Stock Information**: Real-time availability and inventory\n• **Virtual Try-On**: Realistic fitting with AI technology\n• **AI Features**: 3D visualization, AR, smart recommendations\n• **Size Guidance**: Perfect fit recommendations\n• **Order Support**: Tracking and delivery information\n• **Fashion Advice**: Styling tips and outfit suggestions\n\nWhat would you like to explore?",
        intent: 'general_query',
        confidence: 0.8,
        suggestedQueries: [
          "Check stock availability",
          "Find products",
          "Try Virtual Try-On"
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