import { storage } from '../storage';
import { Product, User, Order } from '@shared/schema';

interface PersonalizationProfile {
  userId: string;
  preferences: {
    categories: Record<string, number>; // category preferences with weights
    colors: Record<string, number>;
    brands: Record<string, number>;
    priceRange: { min: number; max: number };
    sizes: string[];
    styles: Record<string, number>;
  };
  purchaseHistory: {
    totalSpent: number;
    averageOrderValue: number;
    frequentCategories: string[];
    seasonalTrends: Record<string, number>;
  };
  wardrobeGaps: {
    missingEssentials: string[];
    underrepresentedCategories: string[];
    colorGaps: string[];
    seasonalNeeds: string[];
  };
  behaviorMetrics: {
    browsingSessions: number;
    virtualTryOnUsage: number;
    returnRate: number;
    engagementScore: number;
  };
}

interface PersonalizedRecommendation {
  product: Product;
  relevanceScore: number;
  reasoning: string[];
  category: 'trending' | 'wardrobe_gap' | 'similar_style' | 'price_match' | 'seasonal';
  confidence: number;
}

export class PersonalizationEngine {
  private profiles = new Map<string, PersonalizationProfile>();

  async buildUserProfile(userId: string): Promise<PersonalizationProfile> {
    try {
      // Get user's order history
      const orders = await storage.getOrdersByUserId(userId);
      const user = await storage.getUser(userId);
      
      // Initialize profile
      const profile: PersonalizationProfile = {
        userId,
        preferences: {
          categories: {},
          colors: {},
          brands: {},
          priceRange: { min: 0, max: 1000 },
          sizes: [],
          styles: {}
        },
        purchaseHistory: {
          totalSpent: 0,
          averageOrderValue: 0,
          frequentCategories: [],
          seasonalTrends: {}
        },
        wardrobeGaps: {
          missingEssentials: [],
          underrepresentedCategories: [],
          colorGaps: [],
          seasonalNeeds: []
        },
        behaviorMetrics: {
          browsingSessions: 0,
          virtualTryOnUsage: 0,
          returnRate: 0,
          engagementScore: 0
        }
      };

      if (orders.length === 0) {
        // New user - return basic profile
        profile.wardrobeGaps.missingEssentials = [
          'Classic White Shirt',
          'Blue Jeans', 
          'Black T-Shirt',
          'Casual Shoes'
        ];
        this.profiles.set(userId, profile);
        return profile;
      }

      // Analyze purchase history
      let totalSpent = 0;
      const categoryCount: Record<string, number> = {};
      const colorCount: Record<string, number> = {};
      const brandCount: Record<string, number> = {};
      const pricePoints: number[] = [];

      for (const order of orders) {
        totalSpent += parseFloat(order.total.toString());
        pricePoints.push(parseFloat(order.total.toString()));
        
        // Note: In a real implementation, you'd get order items and analyze them
        // For now, we'll simulate based on order data
        const simulatedCategories = ['tops', 'bottoms', 'shoes', 'accessories'];
        const randomCategory = simulatedCategories[Math.floor(Math.random() * simulatedCategories.length)];
        categoryCount[randomCategory] = (categoryCount[randomCategory] || 0) + 1;
      }

      // Build preferences based on purchase patterns
      profile.purchaseHistory.totalSpent = totalSpent;
      profile.purchaseHistory.averageOrderValue = totalSpent / orders.length;
      
      // Set price range based on purchase history
      profile.preferences.priceRange = {
        min: Math.min(...pricePoints),
        max: Math.max(...pricePoints)
      };

      // Category preferences
      profile.preferences.categories = categoryCount;
      profile.purchaseHistory.frequentCategories = Object.entries(categoryCount)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 3)
        .map(([category]) => category);

      // Identify wardrobe gaps
      await this.identifyWardrobeGaps(profile);

      // Calculate engagement metrics
      profile.behaviorMetrics.engagementScore = this.calculateEngagementScore(profile);

      // Cache profile
      this.profiles.set(userId, profile);
      return profile;

    } catch (error) {
      console.error('Error building user profile:', error);
      throw new Error('Failed to build personalization profile');
    }
  }

  private async identifyWardrobeGaps(profile: PersonalizationProfile): Promise<void> {
    // Essential items every wardrobe should have
    const essentials = [
      { category: 'tops', items: ['White Shirt', 'Black T-Shirt', 'Casual Blouse'] },
      { category: 'bottoms', items: ['Blue Jeans', 'Black Pants', 'Khaki Trousers'] },
      { category: 'shoes', items: ['Casual Sneakers', 'Dress Shoes', 'Comfortable Flats'] },
      { category: 'accessories', items: ['Belt', 'Watch', 'Handbag'] }
    ];

    // Check for missing essentials
    const ownedCategories = Object.keys(profile.preferences.categories);
    
    for (const essential of essentials) {
      const categoryOwnership = profile.preferences.categories[essential.category] || 0;
      
      if (categoryOwnership < 2) { // Less than 2 items in category
        profile.wardrobeGaps.missingEssentials.push(...essential.items);
      }
      
      if (categoryOwnership === 0) {
        profile.wardrobeGaps.underrepresentedCategories.push(essential.category);
      }
    }

    // Seasonal gap analysis
    const currentMonth = new Date().getMonth();
    const currentSeason = this.getCurrentSeason(currentMonth);
    
    const seasonalNeeds: Record<string, string[]> = {
      'spring': ['Light Jacket', 'Spring Dress', 'Casual Sneakers'],
      'summer': ['T-Shirts', 'Shorts', 'Sandals', 'Summer Dress'],
      'fall': ['Sweater', 'Jacket', 'Boots', 'Warm Pants'],
      'winter': ['Coat', 'Warm Sweater', 'Winter Boots', 'Scarf']
    };

    profile.wardrobeGaps.seasonalNeeds = seasonalNeeds[currentSeason] || [];

    // Color gap analysis - suggest balancing colors
    const colorBalance = ['black', 'white', 'navy', 'gray', 'brown'];
    const ownedColors = Object.keys(profile.preferences.colors);
    
    profile.wardrobeGaps.colorGaps = colorBalance.filter(color => 
      !ownedColors.includes(color)
    );
  }

  private getCurrentSeason(month: number): string {
    if (month >= 2 && month <= 4) return 'spring';
    if (month >= 5 && month <= 7) return 'summer';
    if (month >= 8 && month <= 10) return 'fall';
    return 'winter';
  }

  private calculateEngagementScore(profile: PersonalizationProfile): number {
    let score = 0;
    
    // Purchase frequency
    if (profile.purchaseHistory.totalSpent > 0) score += 30;
    if (profile.purchaseHistory.averageOrderValue > 100) score += 20;
    
    // Category diversity
    const categoryCount = Object.keys(profile.preferences.categories).length;
    score += Math.min(categoryCount * 10, 30);
    
    // Behavior metrics
    score += Math.min(profile.behaviorMetrics.virtualTryOnUsage * 5, 20);
    
    return Math.min(score, 100);
  }

  async generatePersonalizedRecommendations(
    userId: string, 
    count: number = 8
  ): Promise<PersonalizedRecommendation[]> {
    try {
      // Get or build user profile
      let profile = this.profiles.get(userId);
      if (!profile) {
        profile = await this.buildUserProfile(userId);
      }

      // Get available products
      const allProducts = await storage.getProducts({ limit: 1000 });
      const availableProducts = allProducts.filter(p => p.stock > 0);

      if (availableProducts.length === 0) {
        return [];
      }

      // Score products based on personalization factors
      const scoredProducts = availableProducts.map(product => {
        return this.scoreProductForUser(product, profile!);
      });

      // Sort by relevance score and take top results
      const recommendations = scoredProducts
        .sort((a, b) => b.relevanceScore - a.relevanceScore)
        .slice(0, count);

      return recommendations;

    } catch (error) {
      console.error('Error generating personalized recommendations:', error);
      throw new Error('Failed to generate recommendations');
    }
  }

  private scoreProductForUser(
    product: Product, 
    profile: PersonalizationProfile
  ): PersonalizedRecommendation {
    let score = 0;
    const reasoning: string[] = [];
    let category: PersonalizedRecommendation['category'] = 'similar_style';
    
    const productName = product.name.toLowerCase();
    const productPrice = parseFloat(product.price.toString());

    // Category preference scoring
    const categoryMatch = this.getCategoryFromProduct(product);
    const categoryPreference = profile.preferences.categories[categoryMatch] || 0;
    if (categoryPreference > 0) {
      score += categoryPreference * 15;
      reasoning.push(`Matches your ${categoryMatch} preferences`);
    }

    // Wardrobe gap scoring (highest priority)
    if (profile.wardrobeGaps.missingEssentials.some(essential => 
        productName.includes(essential.toLowerCase())
    )) {
      score += 40;
      reasoning.push('Fills a gap in your wardrobe');
      category = 'wardrobe_gap';
    }

    if (profile.wardrobeGaps.underrepresentedCategories.includes(categoryMatch)) {
      score += 30;
      reasoning.push(`Adds to your ${categoryMatch} collection`);
      category = 'wardrobe_gap';
    }

    // Seasonal relevance
    if (profile.wardrobeGaps.seasonalNeeds.some(need => 
        productName.includes(need.toLowerCase())
    )) {
      score += 25;
      reasoning.push('Perfect for current season');
      category = 'seasonal';
    }

    // Price range matching
    const { min, max } = profile.preferences.priceRange;
    if (productPrice >= min && productPrice <= max) {
      score += 20;
      reasoning.push('Within your typical price range');
      category = 'price_match';
    } else if (productPrice < min) {
      score += 10; // Budget-friendly option
      reasoning.push('Great value option');
    }

    // Color gap filling
    profile.wardrobeGaps.colorGaps.forEach(color => {
      if (productName.includes(color)) {
        score += 15;
        reasoning.push(`Adds ${color} to your wardrobe`);
      }
    });

    // Trending items boost
    if (product.featured) {
      score += 10;
      reasoning.push('Currently trending');
      category = 'trending';
    }

    // Engagement score influence
    const engagementMultiplier = profile.behaviorMetrics.engagementScore / 100;
    score *= (0.8 + 0.4 * engagementMultiplier); // 0.8 to 1.2 multiplier

    // Calculate confidence (0-1 scale)
    const confidence = Math.min(score / 100, 1);

    return {
      product,
      relevanceScore: score,
      reasoning: reasoning.slice(0, 3), // Top 3 reasons
      category,
      confidence
    };
  }

  private getCategoryFromProduct(product: Product): string {
    // Map product category ID to category name
    const categoryMap: Record<number, string> = {
      1: 'tops',
      2: 'bottoms', 
      3: 'dresses',
      4: 'shoes',
      5: 'accessories'
    };
    
    return categoryMap[product.categoryId] || 'unknown';
  }

  async updateUserInteraction(
    userId: string, 
    action: 'view' | 'purchase' | 'virtual_tryon' | 'cart_add',
    productId?: number
  ): Promise<void> {
    try {
      let profile = this.profiles.get(userId);
      if (!profile) {
        profile = await this.buildUserProfile(userId);
      }

      // Update behavior metrics based on action
      switch (action) {
        case 'virtual_tryon':
          profile.behaviorMetrics.virtualTryOnUsage += 1;
          break;
        case 'view':
          profile.behaviorMetrics.browsingSessions += 1;
          break;
        case 'purchase':
          // Purchase behavior is tracked through order history
          break;
        case 'cart_add':
          // Positive engagement signal
          profile.behaviorMetrics.engagementScore += 1;
          break;
      }

      // Recalculate engagement score
      profile.behaviorMetrics.engagementScore = this.calculateEngagementScore(profile);

      // Update cached profile
      this.profiles.set(userId, profile);

    } catch (error) {
      console.error('Error updating user interaction:', error);
    }
  }

  getProfileSummary(userId: string): any {
    const profile = this.profiles.get(userId);
    if (!profile) return null;

    return {
      totalSpent: profile.purchaseHistory.totalSpent,
      favoriteCategories: profile.purchaseHistory.frequentCategories,
      wardrobeGaps: profile.wardrobeGaps.missingEssentials.length,
      engagementScore: profile.behaviorMetrics.engagementScore,
      seasonalNeeds: profile.wardrobeGaps.seasonalNeeds.length
    };
  }
}

export const personalizationEngine = new PersonalizationEngine();