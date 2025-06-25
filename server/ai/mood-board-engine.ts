import OpenAI from 'openai';
import { storage } from '../storage';
import { Product } from '@shared/schema';

interface MoodTheme {
  id: string;
  name: string;
  description: string;
  keywords: string[];
  colors: string[];
  styles: string[];
  occasions: string[];
  season?: string;
}

interface OutfitSuggestion {
  id: string;
  theme: string;
  name: string;
  description: string;
  products: {
    category: 'tops' | 'bottoms' | 'dresses' | 'shoes' | 'accessories';
    product: Product;
    reasoning: string;
  }[];
  colorPalette: string[];
  styleScore: number;
  totalPrice: number;
}

interface MoodBoardResponse {
  theme: MoodTheme;
  outfits: OutfitSuggestion[];
  colorPalette: string[];
  styleInsights: string[];
  customizationOptions: string[];
}

export class MoodBoardEngine {
  private openai: OpenAI;
  private predefinedThemes: MoodTheme[] = [];

  constructor() {
    if (!process.env.OPENAI_API_KEY) {
      throw new Error('OPENAI_API_KEY is required for mood board functionality');
    }
    
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    this.initializePredefinedThemes();
  }

  private initializePredefinedThemes() {
    this.predefinedThemes = [
      {
        id: 'streetwear',
        name: 'Urban Streetwear',
        description: 'Edgy, casual street-inspired fashion with attitude',
        keywords: ['urban', 'casual', 'edgy', 'comfortable', 'trendy'],
        colors: ['black', 'white', 'gray', 'denim', 'neon'],
        styles: ['oversized', 'graphic', 'sneakers', 'hoodies', 'caps'],
        occasions: ['casual', 'hanging out', 'city walks', 'creative work']
      },
      {
        id: 'minimalist',
        name: 'Minimalist Chic',
        description: 'Clean, simple lines with neutral tones and timeless pieces',
        keywords: ['clean', 'simple', 'neutral', 'timeless', 'elegant'],
        colors: ['white', 'black', 'beige', 'gray', 'navy'],
        styles: ['tailored', 'structured', 'sleek', 'understated'],
        occasions: ['work', 'meetings', 'dinner', 'everyday']
      },
      {
        id: 'boho',
        name: 'Bohemian Spirit',
        description: 'Free-spirited, artistic style with flowing fabrics and earth tones',
        keywords: ['bohemian', 'artistic', 'flowing', 'natural', 'relaxed'],
        colors: ['earth tones', 'brown', 'rust', 'olive', 'cream'],
        styles: ['flowing', 'layered', 'textured', 'ethnic', 'vintage'],
        occasions: ['festivals', 'art events', 'casual outings', 'vacation']
      },
      {
        id: 'formal',
        name: 'Professional Power',
        description: 'Sharp, sophisticated looks for the boardroom and beyond',
        keywords: ['professional', 'sophisticated', 'sharp', 'polished', 'confident'],
        colors: ['navy', 'black', 'white', 'charcoal', 'burgundy'],
        styles: ['tailored', 'structured', 'crisp', 'classic', 'elegant'],
        occasions: ['work', 'presentations', 'formal events', 'interviews']
      },
      {
        id: 'summer-casual',
        name: 'Summer Essentials',
        description: 'Light, breezy pieces perfect for warm weather adventures',
        keywords: ['light', 'breezy', 'comfortable', 'fresh', 'relaxed'],
        colors: ['white', 'light blue', 'coral', 'yellow', 'mint'],
        styles: ['flowing', 'sleeveless', 'lightweight', 'airy', 'breathable'],
        occasions: ['beach', 'vacation', 'outdoor events', 'summer parties'],
        season: 'summer'
      },
      {
        id: 'cozy-winter',
        name: 'Cozy Winter',
        description: 'Warm, comfortable layers that keep you stylish in cold weather',
        keywords: ['warm', 'cozy', 'layered', 'comfortable', 'snug'],
        colors: ['burgundy', 'forest green', 'cream', 'brown', 'charcoal'],
        styles: ['knitted', 'layered', 'textured', 'warm', 'soft'],
        occasions: ['winter walks', 'coffee dates', 'indoor gatherings', 'holidays'],
        season: 'winter'
      },
      {
        id: 'date-night',
        name: 'Date Night Glam',
        description: 'Sophisticated, alluring pieces for romantic evenings',
        keywords: ['romantic', 'sophisticated', 'alluring', 'elegant', 'chic'],
        colors: ['black', 'red', 'navy', 'gold', 'deep purple'],
        styles: ['fitted', 'elegant', 'sophisticated', 'glamorous', 'refined'],
        occasions: ['dinner dates', 'romantic evenings', 'special occasions', 'theater']
      },
      {
        id: 'athleisure',
        name: 'Active Lifestyle',
        description: 'Stylish athletic wear that transitions from gym to street',
        keywords: ['athletic', 'comfortable', 'versatile', 'modern', 'functional'],
        colors: ['black', 'gray', 'white', 'bright accents', 'navy'],
        styles: ['sporty', 'fitted', 'stretchy', 'modern', 'sleek'],
        occasions: ['gym', 'running errands', 'casual meetups', 'travel']
      }
    ];
  }

  async generateMoodBoard(themeId: string, customPreferences?: {
    colors?: string[];
    budget?: { min: number; max: number };
    occasions?: string[];
    bodyType?: string;
  }): Promise<MoodBoardResponse> {
    try {
      const theme = this.predefinedThemes.find(t => t.id === themeId);
      if (!theme) {
        throw new Error(`Theme ${themeId} not found`);
      }

      // Get products from catalog
      const allProducts = await storage.getProducts({ limit: 1000 });
      const availableProducts = allProducts.filter(p => p.stock > 0);

      // Generate AI-powered outfit suggestions
      const outfits = await this.generateOutfitSuggestions(theme, availableProducts, customPreferences);

      // Create comprehensive color palette
      const colorPalette = this.generateColorPalette(theme, customPreferences?.colors);

      // Generate style insights
      const styleInsights = await this.generateStyleInsights(theme, outfits);

      // Create customization options
      const customizationOptions = this.generateCustomizationOptions(theme);

      return {
        theme,
        outfits,
        colorPalette,
        styleInsights,
        customizationOptions
      };

    } catch (error) {
      console.error('Mood board generation error:', error);
      throw new Error('Failed to generate mood board');
    }
  }

  private async generateOutfitSuggestions(
    theme: MoodTheme, 
    products: Product[], 
    preferences?: any
  ): Promise<OutfitSuggestion[]> {
    try {
      // Categorize products
      const categoryMap: Record<number, 'tops' | 'bottoms' | 'dresses' | 'shoes' | 'accessories'> = {
        1: 'tops',
        2: 'bottoms',
        3: 'dresses',
        4: 'shoes',
        5: 'accessories'
      };

      const categorizedProducts = products.reduce((acc, product) => {
        const category = categoryMap[product.categoryId];
        if (category) {
          if (!acc[category]) acc[category] = [];
          acc[category].push(product);
        }
        return acc;
      }, {} as Record<string, Product[]>);

      // Score products for theme compatibility
      const scoredProducts = Object.entries(categorizedProducts).reduce((acc, [category, categoryProducts]) => {
        acc[category] = categoryProducts.map(product => ({
          product,
          score: this.calculateThemeCompatibility(product, theme, preferences)
        })).sort((a, b) => b.score - a.score);
        return acc;
      }, {} as Record<string, { product: Product; score: number }[]>);

      // Generate multiple outfit combinations
      const outfits: OutfitSuggestion[] = [];

      // Outfit 1: Dress-focused (if available)
      if (scoredProducts.dresses?.length > 0) {
        const dress = scoredProducts.dresses[0];
        const shoes = scoredProducts.shoes?.[0];
        const accessories = scoredProducts.accessories?.[0];

        if (dress && shoes) {
          outfits.push({
            id: `${theme.id}-dress-outfit`,
            theme: theme.id,
            name: `${theme.name} Dress Look`,
            description: `Elegant dress-centered outfit perfect for ${theme.occasions[0]}`,
            products: [
              { category: 'dresses', product: dress.product, reasoning: 'Statement piece matching theme aesthetic' },
              { category: 'shoes', product: shoes.product, reasoning: 'Complements dress style and occasion' },
              ...(accessories ? [{ category: 'accessories' as const, product: accessories.product, reasoning: 'Adds finishing touch to complete the look' }] : [])
            ],
            colorPalette: this.extractOutfitColors([dress.product, shoes.product, accessories?.product].filter(Boolean)),
            styleScore: (dress.score + shoes.score + (accessories?.score || 0)) / (accessories ? 3 : 2),
            totalPrice: [dress.product, shoes.product, accessories?.product].filter(Boolean).reduce((sum, p) => sum + parseFloat(p!.price.toString()), 0)
          });
        }
      }

      // Outfit 2: Separates (tops + bottoms)
      if (scoredProducts.tops?.length > 0 && scoredProducts.bottoms?.length > 0) {
        const top = scoredProducts.tops[0];
        const bottom = scoredProducts.bottoms[0];
        const shoes = scoredProducts.shoes?.[1] || scoredProducts.shoes?.[0];
        const accessories = scoredProducts.accessories?.[1] || scoredProducts.accessories?.[0];

        if (top && bottom && shoes) {
          outfits.push({
            id: `${theme.id}-separates-outfit`,
            theme: theme.id,
            name: `${theme.name} Coordinated Set`,
            description: `Versatile separates perfect for ${theme.occasions.join(' or ')}`,
            products: [
              { category: 'tops', product: top.product, reasoning: 'Perfectly embodies theme style and color palette' },
              { category: 'bottoms', product: bottom.product, reasoning: 'Coordinates beautifully with top choice' },
              { category: 'shoes', product: shoes.product, reasoning: 'Completes the outfit with style harmony' },
              ...(accessories ? [{ category: 'accessories' as const, product: accessories.product, reasoning: 'Enhances overall aesthetic appeal' }] : [])
            ],
            colorPalette: this.extractOutfitColors([top.product, bottom.product, shoes.product, accessories?.product].filter(Boolean)),
            styleScore: (top.score + bottom.score + shoes.score + (accessories?.score || 0)) / (accessories ? 4 : 3),
            totalPrice: [top.product, bottom.product, shoes.product, accessories?.product].filter(Boolean).reduce((sum, p) => sum + parseFloat(p!.price.toString()), 0)
          });
        }
      }

      // Outfit 3: Alternative combination
      if (scoredProducts.tops?.length > 1 && scoredProducts.bottoms?.length > 1) {
        const altTop = scoredProducts.tops[1];
        const altBottom = scoredProducts.bottoms[1];
        const altShoes = scoredProducts.shoes?.[2] || scoredProducts.shoes?.[0];

        if (altTop && altBottom && altShoes) {
          outfits.push({
            id: `${theme.id}-alternative-outfit`,
            theme: theme.id,
            name: `${theme.name} Alternative`,
            description: `Another great option for ${theme.occasions[0]} with a fresh perspective`,
            products: [
              { category: 'tops', product: altTop.product, reasoning: 'Alternative style within theme parameters' },
              { category: 'bottoms', product: altBottom.product, reasoning: 'Creates different but cohesive aesthetic' },
              { category: 'shoes', product: altShoes.product, reasoning: 'Adds unique flair to the combination' }
            ],
            colorPalette: this.extractOutfitColors([altTop.product, altBottom.product, altShoes.product]),
            styleScore: (altTop.score + altBottom.score + altShoes.score) / 3,
            totalPrice: [altTop.product, altBottom.product, altShoes.product].reduce((sum, p) => sum + parseFloat(p.price.toString()), 0)
          });
        }
      }

      return outfits.slice(0, 3); // Return top 3 outfits

    } catch (error) {
      console.error('Outfit generation error:', error);
      return [];
    }
  }

  private calculateThemeCompatibility(product: Product, theme: MoodTheme, preferences?: any): number {
    let score = 0;
    const productName = product.name.toLowerCase();
    const productDesc = product.description?.toLowerCase() || '';
    const productPrice = parseFloat(product.price.toString());

    // Keyword matching
    theme.keywords.forEach(keyword => {
      if (productName.includes(keyword.toLowerCase()) || productDesc.includes(keyword.toLowerCase())) {
        score += 20;
      }
    });

    // Style matching
    theme.styles.forEach(style => {
      if (productName.includes(style.toLowerCase()) || productDesc.includes(style.toLowerCase())) {
        score += 15;
      }
    });

    // Color matching
    theme.colors.forEach(color => {
      if (productName.includes(color.toLowerCase()) || productDesc.includes(color.toLowerCase())) {
        score += 10;
      }
    });

    // Budget consideration
    if (preferences?.budget) {
      const { min, max } = preferences.budget;
      if (productPrice >= min && productPrice <= max) {
        score += 10;
      } else if (productPrice > max) {
        score -= 15;
      }
    }

    // Featured products get bonus
    if (product.featured) {
      score += 5;
    }

    // Stock availability
    if (product.stock > 10) {
      score += 5;
    } else if (product.stock < 3) {
      score -= 10;
    }

    return Math.max(0, Math.min(100, score));
  }

  private extractOutfitColors(products: Product[]): string[] {
    const colors = new Set<string>();
    const commonColors = ['black', 'white', 'blue', 'red', 'green', 'yellow', 'pink', 'purple', 'brown', 'gray', 'navy', 'beige'];

    products.forEach(product => {
      const text = (product.name + ' ' + (product.description || '')).toLowerCase();
      commonColors.forEach(color => {
        if (text.includes(color)) {
          colors.add(color);
        }
      });
    });

    return Array.from(colors).slice(0, 5);
  }

  private generateColorPalette(theme: MoodTheme, preferredColors?: string[]): string[] {
    const basePalette = [...theme.colors];
    
    if (preferredColors) {
      // Blend preferred colors with theme colors
      const blended = [...new Set([...preferredColors, ...basePalette])];
      return blended.slice(0, 6);
    }

    return basePalette.slice(0, 6);
  }

  private async generateStyleInsights(theme: MoodTheme, outfits: OutfitSuggestion[]): Promise<string[]> {
    try {
      const avgPrice = outfits.reduce((sum, outfit) => sum + outfit.totalPrice, 0) / outfits.length;
      const topColors = [...new Set(outfits.flatMap(o => o.colorPalette))].slice(0, 3);

      return [
        `${theme.name} style emphasizes ${theme.keywords.slice(0, 3).join(', ')} aesthetics`,
        `Perfect for ${theme.occasions.join(', ')} with an average outfit cost of $${avgPrice.toFixed(0)}`,
        `Key colors: ${topColors.join(', ')} creating cohesive visual harmony`,
        `This mood captures ${theme.description.toLowerCase()}`,
        `Style versatility allows for ${outfits.length} distinct outfit interpretations`
      ];

    } catch (error) {
      return [
        `${theme.name} offers a distinctive aesthetic approach`,
        `Curated for ${theme.occasions[0]} and similar occasions`,
        `Features harmonious color combinations`,
        'Versatile pieces that work together seamlessly'
      ];
    }
  }

  private generateCustomizationOptions(theme: MoodTheme): string[] {
    return [
      'Swap colors to match personal preferences',
      'Adjust formality level for different occasions',
      'Mix textures for added visual interest',
      'Layer pieces for seasonal adaptability',
      'Customize accessories to reflect personality',
      'Modify silhouettes for body type preferences'
    ];
  }

  async getAvailableThemes(): Promise<MoodTheme[]> {
    return this.predefinedThemes;
  }

  async customizeMoodBoard(
    themeId: string, 
    customizations: {
      colorSwaps?: { from: string; to: string }[];
      productReplacements?: { category: string; productId: number }[];
      budgetConstraints?: { min: number; max: number };
    }
  ): Promise<MoodBoardResponse> {
    // Generate base mood board
    const baseMoodBoard = await this.generateMoodBoard(themeId, {
      budget: customizations.budgetConstraints
    });

    // Apply customizations
    if (customizations.productReplacements) {
      for (const replacement of customizations.productReplacements) {
        const product = await storage.getProductById(replacement.productId);
        if (product) {
          baseMoodBoard.outfits.forEach(outfit => {
            const targetProduct = outfit.products.find(p => p.category === replacement.category);
            if (targetProduct) {
              targetProduct.product = product;
              targetProduct.reasoning = 'User-selected customization';
            }
          });
        }
      }
    }

    // Apply color swaps
    if (customizations.colorSwaps) {
      customizations.colorSwaps.forEach(swap => {
        const index = baseMoodBoard.colorPalette.indexOf(swap.from);
        if (index !== -1) {
          baseMoodBoard.colorPalette[index] = swap.to;
        }
      });
    }

    return baseMoodBoard;
  }
}

export const moodBoardEngine = new MoodBoardEngine();