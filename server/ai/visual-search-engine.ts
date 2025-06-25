import OpenAI from 'openai';
import { storage } from '../storage';
import { Product } from '@shared/schema';

interface VisualSearchResult {
  products: Product[];
  confidence: number;
  searchMeta: {
    detectedItems: string[];
    colors: string[];
    style: string;
    category: string;
  };
}

interface ImageAnalysis {
  description: string;
  items: string[];
  colors: string[];
  style: string;
  category: string;
  gender: string;
  occasion: string;
}

export class VisualSearchEngine {
  private openai: OpenAI;

  constructor() {
    if (!process.env.OPENAI_API_KEY) {
      throw new Error('OPENAI_API_KEY is required for visual search');
    }
    
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  }

  async analyzeImage(base64Image: string): Promise<ImageAnalysis> {
    try {
      const response = await this.openai.chat.completions.create({
        model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
        messages: [
          {
            role: "system",
            content: `You are a fashion AI expert. Analyze clothing images and extract detailed information.
            
            Respond in JSON format with these fields:
            - description: Brief description of the image
            - items: Array of clothing items visible (e.g., ["shirt", "jeans", "shoes"])
            - colors: Array of primary colors (e.g., ["blue", "white", "black"])
            - style: Style category (e.g., "casual", "formal", "sporty", "trendy")
            - category: Main category (e.g., "tops", "bottoms", "dresses", "shoes", "accessories")
            - gender: Target gender ("mens", "womens", "unisex")
            - occasion: Suitable occasions (e.g., "everyday", "work", "party", "sport")
            
            Be specific and accurate. Focus on fashion-relevant details.`
          },
          {
            role: "user",
            content: [
              {
                type: "text",
                text: "Analyze this fashion image and extract all relevant details for product matching."
              },
              {
                type: "image_url",
                image_url: {
                  url: `data:image/jpeg;base64,${base64Image}`
                }
              }
            ]
          }
        ],
        max_tokens: 800,
        response_format: { type: "json_object" }
      });

      const analysis = JSON.parse(response.choices[0].message.content || '{}');
      
      return {
        description: analysis.description || 'Fashion item',
        items: analysis.items || [],
        colors: analysis.colors || [],
        style: analysis.style || 'casual',
        category: analysis.category || 'tops',
        gender: analysis.gender || 'unisex',
        occasion: analysis.occasion || 'everyday'
      };

    } catch (error) {
      console.error('Image analysis error:', error);
      throw new Error('Failed to analyze image');
    }
  }

  async findSimilarProducts(analysis: ImageAnalysis): Promise<VisualSearchResult> {
    try {
      // Get all products for comprehensive matching
      const allProducts = await storage.getProducts({ limit: 1000 });
      
      // Score products based on similarity to analyzed image
      const scoredProducts = allProducts.map(product => {
        let score = 0;
        const productName = product.name.toLowerCase();
        const productDesc = product.description?.toLowerCase() || '';
        
        // Category matching (highest weight)
        const categoryMap: Record<string, string[]> = {
          'tops': ['shirt', 'blouse', 'top', 'tee', 't-shirt', 'sweater', 'hoodie'],
          'bottoms': ['pants', 'jeans', 'trouser', 'short', 'skirt', 'legging'],
          'dresses': ['dress', 'gown', 'frock'],
          'shoes': ['shoe', 'boot', 'sneaker', 'heel', 'sandal', 'flat'],
          'accessories': ['bag', 'hat', 'scarf', 'jewelry', 'belt', 'watch']
        };
        
        const categoryKeywords = categoryMap[analysis.category] || [];
        if (categoryKeywords.some(keyword => productName.includes(keyword) || productDesc.includes(keyword))) {
          score += 40;
        }
        
        // Item type matching
        analysis.items.forEach(item => {
          const itemLower = item.toLowerCase();
          if (productName.includes(itemLower) || productDesc.includes(itemLower)) {
            score += 20;
          }
        });
        
        // Color matching
        analysis.colors.forEach(color => {
          const colorLower = color.toLowerCase();
          if (productName.includes(colorLower) || productDesc.includes(colorLower)) {
            score += 15;
          }
        });
        
        // Style matching
        const styleLower = analysis.style.toLowerCase();
        if (productName.includes(styleLower) || productDesc.includes(styleLower)) {
          score += 10;
        }
        
        // Gender matching
        const genderKeywords: Record<string, string[]> = {
          'mens': ['men', 'male', 'guy'],
          'womens': ['women', 'female', 'lady', 'girl'],
          'unisex': ['unisex']
        };
        
        const genderTerms = genderKeywords[analysis.gender] || [];
        if (genderTerms.some(term => productName.includes(term) || productDesc.includes(term))) {
          score += 10;
        }
        
        // Occasion matching
        const occasionLower = analysis.occasion.toLowerCase();
        if (productName.includes(occasionLower) || productDesc.includes(occasionLower)) {
          score += 5;
        }
        
        return { product, score };
      });
      
      // Filter and sort by score
      const matchedProducts = scoredProducts
        .filter(item => item.score > 0)
        .sort((a, b) => b.score - a.score)
        .slice(0, 8)
        .map(item => item.product);
      
      // Calculate overall confidence
      const maxPossibleScore = 100;
      const bestScore = scoredProducts.length > 0 ? Math.max(...scoredProducts.map(item => item.score)) : 0;
      const confidence = Math.min(bestScore / maxPossibleScore, 1);
      
      return {
        products: matchedProducts,
        confidence,
        searchMeta: {
          detectedItems: analysis.items,
          colors: analysis.colors,
          style: analysis.style,
          category: analysis.category
        }
      };

    } catch (error) {
      console.error('Product matching error:', error);
      throw new Error('Failed to find similar products');
    }
  }

  async processVisualSearch(base64Image: string): Promise<VisualSearchResult> {
    // Analyze the uploaded image
    const analysis = await this.analyzeImage(base64Image);
    
    // Find similar products based on analysis
    const result = await this.findSimilarProducts(analysis);
    
    // Note: Image is automatically garbage collected as it's not stored
    // This ensures GDPR compliance with auto-deletion
    
    return result;
  }
}

export const visualSearchEngine = new VisualSearchEngine();