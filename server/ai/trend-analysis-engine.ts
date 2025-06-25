import OpenAI from 'openai';
import { storage } from '../storage';
import { Product, Category } from '@shared/schema';

interface TrendInsight {
  category: string;
  trendScore: number;
  growthRate: number;
  seasonalFactor: number;
  keywords: string[];
  demandForecast: 'rising' | 'stable' | 'declining';
}

interface SeasonalTrend {
  season: string;
  categories: string[];
  colors: string[];
  styles: string[];
  demandMultiplier: number;
}

interface InventoryRecommendation {
  category: string;
  action: 'increase' | 'maintain' | 'reduce';
  priority: 'high' | 'medium' | 'low';
  reasoning: string;
  suggestedQuantity?: number;
}

export class TrendAnalysisEngine {
  private openai: OpenAI;
  private trendCache = new Map<string, TrendInsight[]>();
  private lastUpdate: Date | null = null;

  constructor() {
    if (!process.env.OPENAI_API_KEY) {
      throw new Error('OPENAI_API_KEY is required for trend analysis');
    }
    
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  }

  async analyzeFashionTrends(): Promise<TrendInsight[]> {
    try {
      // Check cache freshness (update every 6 hours)
      if (this.lastUpdate && Date.now() - this.lastUpdate.getTime() < 6 * 60 * 60 * 1000) {
        return this.trendCache.get('current') || [];
      }

      const currentSeason = this.getCurrentSeason();
      const categories = await storage.getCategories();
      const products = await storage.getProducts({ limit: 1000 });

      // Analyze current catalog performance
      const catalogInsights = this.analyzeCatalogPerformance(products);

      // Get AI-powered trend analysis
      const aiTrends = await this.getAITrendAnalysis(currentSeason, categories);

      // Combine insights
      const combinedTrends = this.combineTrendInsights(catalogInsights, aiTrends);

      // Cache results
      this.trendCache.set('current', combinedTrends);
      this.lastUpdate = new Date();

      return combinedTrends;

    } catch (error) {
      console.error('Trend analysis error:', error);
      // Return fallback trends based on season
      return this.getFallbackTrends();
    }
  }

  private getCurrentSeason(): string {
    const month = new Date().getMonth();
    if (month >= 2 && month <= 4) return 'spring';
    if (month >= 5 && month <= 7) return 'summer';
    if (month >= 8 && month <= 10) return 'fall';
    return 'winter';
  }

  private analyzeCatalogPerformance(products: Product[]): TrendInsight[] {
    // Analyze product performance by category
    const categoryStats = new Map<number, { total: number, featured: number, avgPrice: number }>();
    
    products.forEach(product => {
      const existing = categoryStats.get(product.categoryId) || { total: 0, featured: 0, avgPrice: 0 };
      existing.total++;
      if (product.featured) existing.featured++;
      existing.avgPrice += parseFloat(product.price.toString());
      categoryStats.set(product.categoryId, existing);
    });

    // Convert to trend insights
    const categoryMap: Record<number, string> = {
      1: 'tops',
      2: 'bottoms',
      3: 'dresses',
      4: 'shoes',
      5: 'accessories'
    };

    return Array.from(categoryStats.entries()).map(([categoryId, stats]) => {
      const featuredRatio = stats.featured / stats.total;
      const avgPrice = stats.avgPrice / stats.total;
      
      return {
        category: categoryMap[categoryId] || 'unknown',
        trendScore: Math.min(featuredRatio * 100, 95),
        growthRate: this.calculateGrowthRate(stats.total, featuredRatio),
        seasonalFactor: this.getSeasonalFactor(categoryMap[categoryId]),
        keywords: this.getCategoryKeywords(categoryMap[categoryId]),
        demandForecast: featuredRatio > 0.3 ? 'rising' : featuredRatio > 0.1 ? 'stable' : 'declining'
      };
    });
  }

  private calculateGrowthRate(total: number, featuredRatio: number): number {
    // Simulate growth rate based on product diversity and featured ratio
    const baseGrowth = Math.min(total / 10, 20); // More products = higher growth potential
    const featuredBoost = featuredRatio * 30;
    return Math.min(baseGrowth + featuredBoost, 50);
  }

  private getSeasonalFactor(category: string): number {
    const season = this.getCurrentSeason();
    const seasonalBoosts: Record<string, Record<string, number>> = {
      'spring': { 'dresses': 1.3, 'tops': 1.2, 'shoes': 1.1, 'accessories': 1.0, 'bottoms': 0.9 },
      'summer': { 'dresses': 1.4, 'tops': 1.1, 'shoes': 1.2, 'accessories': 1.1, 'bottoms': 0.8 },
      'fall': { 'bottoms': 1.3, 'tops': 1.2, 'shoes': 1.1, 'accessories': 1.0, 'dresses': 0.9 },
      'winter': { 'tops': 1.4, 'bottoms': 1.2, 'accessories': 1.1, 'shoes': 1.0, 'dresses': 0.8 }
    };
    
    return seasonalBoosts[season]?.[category] || 1.0;
  }

  private getCategoryKeywords(category: string): string[] {
    const keywords: Record<string, string[]> = {
      'tops': ['versatile', 'layering', 'comfort', 'style'],
      'bottoms': ['fit', 'durable', 'versatile', 'comfort'],
      'dresses': ['elegant', 'versatile', 'feminine', 'occasion'],
      'shoes': ['comfort', 'style', 'durable', 'versatile'],
      'accessories': ['statement', 'complement', 'functional', 'trendy']
    };
    
    return keywords[category] || ['fashionable', 'quality', 'trendy'];
  }

  private async getAITrendAnalysis(season: string, categories: Category[]): Promise<TrendInsight[]> {
    try {
      const prompt = `As a fashion trend analyst, provide current fashion trends for ${season} 2025. 
      
      Focus on these categories: ${categories.map(c => c.name).join(', ')}
      
      For each category, analyze:
      - Current trend strength (0-100)
      - Growth trajectory (rising/stable/declining)
      - Key style keywords
      - Seasonal relevance factor
      
      Respond in JSON format with an array of trend insights.`;

      const response = await this.openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: "You are a fashion industry expert specializing in trend forecasting and market analysis. Provide data-driven insights based on current fashion movements."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        max_tokens: 1000,
        response_format: { type: "json_object" }
      });

      const aiInsights = JSON.parse(response.choices[0].message.content || '{"trends": []}');
      
      return aiInsights.trends || [];

    } catch (error) {
      console.error('AI trend analysis error:', error);
      return [];
    }
  }

  private combineTrendInsights(catalogInsights: TrendInsight[], aiInsights: any[]): TrendInsight[] {
    const combined = [...catalogInsights];

    // Enhance with AI insights
    aiInsights.forEach(aiInsight => {
      const existing = combined.find(c => c.category.toLowerCase() === aiInsight.category?.toLowerCase());
      if (existing) {
        // Blend scores
        existing.trendScore = (existing.trendScore + (aiInsight.trendScore || 50)) / 2;
        existing.keywords = [...new Set([...existing.keywords, ...(aiInsight.keywords || [])])];
      } else if (aiInsight.category) {
        combined.push({
          category: aiInsight.category,
          trendScore: aiInsight.trendScore || 50,
          growthRate: aiInsight.growthRate || 10,
          seasonalFactor: aiInsight.seasonalFactor || 1.0,
          keywords: aiInsight.keywords || [],
          demandForecast: aiInsight.demandForecast || 'stable'
        });
      }
    });

    return combined.sort((a, b) => b.trendScore - a.trendScore);
  }

  private getFallbackTrends(): TrendInsight[] {
    const season = this.getCurrentSeason();
    const seasonalTrends: Record<string, TrendInsight[]> = {
      'spring': [
        { category: 'dresses', trendScore: 85, growthRate: 25, seasonalFactor: 1.3, keywords: ['floral', 'light', 'feminine'], demandForecast: 'rising' },
        { category: 'tops', trendScore: 75, growthRate: 20, seasonalFactor: 1.2, keywords: ['layering', 'versatile'], demandForecast: 'stable' }
      ],
      'summer': [
        { category: 'dresses', trendScore: 90, growthRate: 30, seasonalFactor: 1.4, keywords: ['breathable', 'bright', 'casual'], demandForecast: 'rising' },
        { category: 'shoes', trendScore: 80, growthRate: 22, seasonalFactor: 1.2, keywords: ['sandals', 'comfort'], demandForecast: 'stable' }
      ],
      'fall': [
        { category: 'bottoms', trendScore: 85, growthRate: 25, seasonalFactor: 1.3, keywords: ['warm', 'layering'], demandForecast: 'rising' },
        { category: 'tops', trendScore: 82, growthRate: 23, seasonalFactor: 1.2, keywords: ['sweaters', 'cozy'], demandForecast: 'stable' }
      ],
      'winter': [
        { category: 'tops', trendScore: 88, growthRate: 27, seasonalFactor: 1.4, keywords: ['warm', 'layering', 'cozy'], demandForecast: 'rising' },
        { category: 'accessories', trendScore: 78, growthRate: 20, seasonalFactor: 1.1, keywords: ['scarves', 'hats'], demandForecast: 'stable' }
      ]
    };

    return seasonalTrends[season] || seasonalTrends['spring'];
  }

  async generateInventoryRecommendations(): Promise<InventoryRecommendation[]> {
    try {
      const trends = await this.analyzeFashionTrends();
      const products = await storage.getProducts({ limit: 1000 });
      
      return trends.map(trend => {
        const categoryProducts = products.filter(p => {
          const categoryMap: Record<number, string> = { 1: 'tops', 2: 'bottoms', 3: 'dresses', 4: 'shoes', 5: 'accessories' };
          return categoryMap[p.categoryId] === trend.category;
        });

        const avgStock = categoryProducts.reduce((sum, p) => sum + p.stock, 0) / categoryProducts.length || 0;
        const inStockRatio = categoryProducts.filter(p => p.stock > 0).length / categoryProducts.length || 0;

        let action: 'increase' | 'maintain' | 'reduce' = 'maintain';
        let priority: 'high' | 'medium' | 'low' = 'medium';
        let reasoning = `Current trend score: ${trend.trendScore}`;

        if (trend.demandForecast === 'rising' && trend.trendScore > 70) {
          action = 'increase';
          priority = trend.trendScore > 85 ? 'high' : 'medium';
          reasoning = `Rising demand with ${trend.trendScore}% trend score. ${trend.keywords.join(', ')} styles trending.`;
        } else if (trend.demandForecast === 'declining' || trend.trendScore < 40) {
          action = 'reduce';
          priority = 'low';
          reasoning = `Declining trend (${trend.trendScore}%). Consider reducing inventory.`;
        } else if (inStockRatio < 0.5) {
          action = 'increase';
          priority = 'medium';
          reasoning = `Low stock availability (${Math.round(inStockRatio * 100)}% in stock) for stable category.`;
        }

        return {
          category: trend.category,
          action,
          priority,
          reasoning,
          suggestedQuantity: action === 'increase' ? Math.ceil(avgStock * 1.5) : undefined
        };
      });

    } catch (error) {
      console.error('Inventory recommendations error:', error);
      return [];
    }
  }

  async getTrendingStyles(): Promise<{ category: string; styles: string[]; confidence: number }[]> {
    const trends = await this.analyzeFashionTrends();
    
    return trends.filter(t => t.trendScore > 60).map(trend => ({
      category: trend.category,
      styles: trend.keywords,
      confidence: trend.trendScore / 100
    }));
  }

  async getSeasonalRecommendations(): Promise<{ products: Product[]; reasoning: string }> {
    try {
      const season = this.getCurrentSeason();
      const trends = await this.analyzeFashionTrends();
      const products = await storage.getProducts({ featured: true, limit: 20 });
      
      // Filter products based on seasonal trends
      const seasonalProducts = products.filter(product => {
        const categoryMap: Record<number, string> = { 1: 'tops', 2: 'bottoms', 3: 'dresses', 4: 'shoes', 5: 'accessories' };
        const productCategory = categoryMap[product.categoryId];
        const trend = trends.find(t => t.category === productCategory);
        
        return trend && trend.seasonalFactor > 1.0;
      });

      const reasoning = `Curated for ${season} based on trending categories: ${trends
        .filter(t => t.seasonalFactor > 1.0)
        .map(t => t.category)
        .join(', ')}`;

      return {
        products: seasonalProducts.slice(0, 8),
        reasoning
      };

    } catch (error) {
      console.error('Seasonal recommendations error:', error);
      return {
        products: [],
        reasoning: 'Unable to generate seasonal recommendations'
      };
    }
  }
}

export const trendAnalysisEngine = new TrendAnalysisEngine();