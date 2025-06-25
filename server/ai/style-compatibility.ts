import * as tf from '@tensorflow/tfjs-node';
import { Product } from '@shared/schema';

interface StyleFeatures {
  colorHarmony: number[];
  styleCategory: number[];
  seasonality: number[];
  formalityLevel: number;
  textureProfile: number[];
}

interface OutfitCombination {
  items: Product[];
  compatibilityScore: number;
  styleReasoning: string[];
  recommendedOccasions: string[];
}

export class StyleCompatibilityEngine {
  private model: tf.LayersModel | null = null;
  private colorHarmonyRules: Map<string, string[]> = new Map();
  private styleCategories: Map<string, number> = new Map();
  private isInitialized = false;

  constructor() {
    this.initializeEngine();
  }

  private async initializeEngine() {
    try {
      console.log('Initializing Style Compatibility Engine...');
      
      // Initialize color harmony rules
      this.setupColorHarmonyRules();
      
      // Initialize style categories
      this.setupStyleCategories();
      
      // Create and train style compatibility model
      await this.createCompatibilityModel();
      
      this.isInitialized = true;
      console.log('Style Compatibility Engine initialized successfully');
    } catch (error) {
      console.error('Failed to initialize Style Compatibility Engine:', error);
      // Continue in fallback mode
      this.isInitialized = true;
    }
  }

  private setupColorHarmonyRules() {
    // Color harmony based on color theory
    this.colorHarmonyRules.set('complementary', ['red-green', 'blue-orange', 'yellow-purple']);
    this.colorHarmonyRules.set('analogous', ['red-orange-yellow', 'blue-green-teal', 'purple-pink-red']);
    this.colorHarmonyRules.set('triadic', ['red-yellow-blue', 'orange-green-purple']);
    this.colorHarmonyRules.set('monochromatic', ['light-medium-dark']);
    this.colorHarmonyRules.set('neutral', ['black-white-gray', 'beige-brown-cream']);
  }

  private setupStyleCategories() {
    // Style category mappings for compatibility scoring
    this.styleCategories.set('casual', 1);
    this.styleCategories.set('business', 2);
    this.styleCategories.set('formal', 3);
    this.styleCategories.set('sporty', 1);
    this.styleCategories.set('bohemian', 1);
    this.styleCategories.set('minimalist', 2);
    this.styleCategories.set('vintage', 1);
    this.styleCategories.set('edgy', 1);
  }

  private async createCompatibilityModel() {
    // Create a neural network for style compatibility scoring
    this.model = tf.sequential({
      layers: [
        tf.layers.dense({
          inputShape: [20], // Feature vector size
          units: 64,
          activation: 'relu'
        }),
        tf.layers.dropout({ rate: 0.3 }),
        tf.layers.dense({
          units: 32,
          activation: 'relu'
        }),
        tf.layers.dense({
          units: 16,
          activation: 'relu'
        }),
        tf.layers.dense({
          units: 1,
          activation: 'sigmoid' // Output compatibility score 0-1
        })
      ]
    });

    this.model.compile({
      optimizer: tf.train.adam(0.001),
      loss: 'meanSquaredError',
      metrics: ['accuracy']
    });

    // Train with synthetic data (in production, use real user feedback)
    await this.trainWithSyntheticData();
  }

  private async trainWithSyntheticData() {
    // Generate synthetic training data for style compatibility
    const trainingSize = 1000;
    const features: number[][] = [];
    const labels: number[] = [];

    for (let i = 0; i < trainingSize; i++) {
      const feature = this.generateSyntheticStyleFeature();
      const label = this.calculateSyntheticCompatibility(feature);
      
      features.push(feature);
      labels.push(label);
    }

    const xs = tf.tensor2d(features);
    const ys = tf.tensor1d(labels);

    await this.model!.fit(xs, ys, {
      epochs: 50,
      batchSize: 32,
      validationSplit: 0.2,
      verbose: 0
    });

    xs.dispose();
    ys.dispose();
  }

  private generateSyntheticStyleFeature(): number[] {
    // Generate realistic style feature vectors
    return Array.from({ length: 20 }, () => Math.random());
  }

  private calculateSyntheticCompatibility(features: number[]): number {
    // Simple rule-based compatibility calculation for training
    const colorHarmony = features.slice(0, 5).reduce((sum, val) => sum + val, 0) / 5;
    const styleConsistency = 1 - Math.abs(features[5] - features[6]);
    const seasonalMatch = features.slice(7, 10).reduce((sum, val) => sum + val, 0) / 3;
    
    return (colorHarmony + styleConsistency + seasonalMatch) / 3;
  }

  async generateOutfitRecommendations(
    baseItem: Product,
    availableItems: Product[],
    userPreferences?: any
  ): Promise<OutfitCombination[]> {
    if (!this.isInitialized) {
      await this.initializeEngine();
    }

    const outfitCombinations: OutfitCombination[] = [];
    
    // Filter items by category to create complete outfits
    const tops = availableItems.filter(item => this.isTopCategory(item.category));
    const bottoms = availableItems.filter(item => this.isBottomCategory(item.category));
    const shoes = availableItems.filter(item => this.isShoeCategory(item.category));
    const accessories = availableItems.filter(item => this.isAccessoryCategory(item.category));

    // Generate outfit combinations
    for (const top of tops.slice(0, 5)) {
      for (const bottom of bottoms.slice(0, 5)) {
        for (const shoe of shoes.slice(0, 3)) {
          const outfit = [top, bottom, shoe];
          
          // Add accessories (optional)
          if (accessories.length > 0 && Math.random() > 0.5) {
            outfit.push(accessories[Math.floor(Math.random() * accessories.length)]);
          }
          
          const compatibility = await this.calculateOutfitCompatibility(outfit);
          
          if (compatibility.compatibilityScore > 0.6) {
            outfitCombinations.push(compatibility);
          }
        }
      }
    }

    // Sort by compatibility score and return top combinations
    return outfitCombinations
      .sort((a, b) => b.compatibilityScore - a.compatibilityScore)
      .slice(0, 10);
  }

  async calculateOutfitCompatibility(items: Product[]): Promise<OutfitCombination> {
    if (!this.isInitialized) {
      await this.initializeEngine();
    }

    const features = this.extractOutfitFeatures(items);
    let compatibilityScore = 0;
    
    if (this.model) {
      try {
        const prediction = this.model.predict(tf.tensor2d([features])) as tf.Tensor;
        const score = await prediction.data();
        compatibilityScore = score[0];
        prediction.dispose();
      } catch (error) {
        console.error('Model prediction failed, using fallback:', error);
        compatibilityScore = this.calculateFallbackCompatibility(items);
      }
    } else {
      compatibilityScore = this.calculateFallbackCompatibility(items);
    }

    const styleReasoning = this.generateStyleReasoning(items, compatibilityScore);
    const recommendedOccasions = this.determineOccasions(items, compatibilityScore);

    return {
      items,
      compatibilityScore,
      styleReasoning,
      recommendedOccasions
    };
  }

  private extractOutfitFeatures(items: Product[]): number[] {
    const features: number[] = [];
    
    // Color harmony features (5 dimensions)
    const colors = items.map(item => this.extractColor(item));
    const colorHarmony = this.calculateColorHarmony(colors);
    features.push(...colorHarmony);
    
    // Style consistency features (3 dimensions)
    const styles = items.map(item => this.extractStyle(item));
    const styleConsistency = this.calculateStyleConsistency(styles);
    features.push(...styleConsistency);
    
    // Seasonal appropriateness (4 dimensions)
    const seasonalFeatures = this.calculateSeasonalFeatures(items);
    features.push(...seasonalFeatures);
    
    // Formality level consistency (3 dimensions)
    const formalityFeatures = this.calculateFormalityFeatures(items);
    features.push(...formalityFeatures);
    
    // Price point consistency (2 dimensions)
    const priceFeatures = this.calculatePriceConsistency(items);
    features.push(...priceFeatures);
    
    // Brand synergy (3 dimensions)
    const brandFeatures = this.calculateBrandSynergy(items);
    features.push(...brandFeatures);
    
    // Ensure exactly 20 features
    while (features.length < 20) {
      features.push(0);
    }
    
    return features.slice(0, 20);
  }

  private calculateColorHarmony(colors: string[]): number[] {
    // Simplified color harmony calculation
    const uniqueColors = [...new Set(colors)];
    const harmonyScore = uniqueColors.length <= 3 ? 1 : Math.max(0, 1 - (uniqueColors.length - 3) * 0.2);
    
    return [
      harmonyScore,
      this.hasNeutralBase(colors) ? 1 : 0,
      this.hasAccentColor(colors) ? 1 : 0,
      this.hasComplementaryColors(colors) ? 1 : 0,
      this.isMonochromatic(colors) ? 1 : 0
    ];
  }

  private calculateStyleConsistency(styles: string[]): number[] {
    const uniqueStyles = [...new Set(styles)];
    const consistency = uniqueStyles.length === 1 ? 1 : Math.max(0, 1 - (uniqueStyles.length - 1) * 0.3);
    
    return [
      consistency,
      this.hasCohesiveAesthetic(styles) ? 1 : 0,
      this.hasBalancedFormality(styles) ? 1 : 0
    ];
  }

  private calculateSeasonalFeatures(items: Product[]): number[] {
    const currentSeason = this.getCurrentSeason();
    const seasonalAppropriate = items.filter(item => 
      this.isSeasonallyAppropriate(item, currentSeason)
    ).length / items.length;
    
    return [
      seasonalAppropriate,
      this.hasSeasonalColors(items, currentSeason) ? 1 : 0,
      this.hasSeasonalFabrics(items, currentSeason) ? 1 : 0,
      this.hasSeasonalLayering(items, currentSeason) ? 1 : 0
    ];
  }

  private calculateFormalityFeatures(items: Product[]): number[] {
    const formalityLevels = items.map(item => this.getFormalityLevel(item));
    const avgFormality = formalityLevels.reduce((sum, level) => sum + level, 0) / formalityLevels.length;
    const formalityVariance = this.calculateVariance(formalityLevels);
    
    return [
      avgFormality / 5, // Normalized to 0-1
      1 - formalityVariance, // Lower variance = better consistency
      this.isOccasionAppropriate(formalityLevels) ? 1 : 0
    ];
  }

  private calculatePriceConsistency(items: Product[]): number[] {
    const prices = items.map(item => item.price);
    const maxPrice = Math.max(...prices);
    const minPrice = Math.min(...prices);
    const priceRange = maxPrice - minPrice;
    const avgPrice = prices.reduce((sum, price) => sum + price, 0) / prices.length;
    
    return [
      Math.min(1, priceRange / avgPrice), // Price spread normalized
      this.hasPriceBalance(prices) ? 1 : 0
    ];
  }

  private calculateBrandSynergy(items: Product[]): number[] {
    const brands = items.map(item => item.brand || 'unknown');
    const uniqueBrands = [...new Set(brands)];
    const brandDiversity = uniqueBrands.length / items.length;
    
    return [
      1 - brandDiversity, // Lower diversity can be better for cohesion
      this.hasComplementaryBrands(brands) ? 1 : 0,
      this.hasLuxuryMix(brands) ? 1 : 0
    ];
  }

  private calculateFallbackCompatibility(items: Product[]): number {
    // Rule-based fallback compatibility calculation
    let score = 0.5; // Base score
    
    // Color harmony check
    const colors = items.map(item => this.extractColor(item));
    if (this.hasGoodColorHarmony(colors)) score += 0.2;
    
    // Style consistency check
    const styles = items.map(item => this.extractStyle(item));
    if (this.hasConsistentStyle(styles)) score += 0.2;
    
    // Seasonal appropriateness
    if (this.isSeasonallyAppropriate(items[0], this.getCurrentSeason())) score += 0.1;
    
    return Math.min(1, score);
  }

  private generateStyleReasoning(items: Product[], score: number): string[] {
    const reasoning: string[] = [];
    
    if (score > 0.8) {
      reasoning.push("Excellent color harmony and style cohesion");
      reasoning.push("Perfect for sophisticated occasions");
    } else if (score > 0.6) {
      reasoning.push("Good overall compatibility");
      reasoning.push("Minor adjustments could improve harmony");
    } else {
      reasoning.push("Consider adjusting color coordination");
      reasoning.push("Style elements could be more cohesive");
    }
    
    // Add specific recommendations
    const colors = items.map(item => this.extractColor(item));
    if (colors.length > 3) {
      reasoning.push("Consider reducing color variety for better harmony");
    }
    
    return reasoning;
  }

  private determineOccasions(items: Product[], score: number): string[] {
    const formalityLevels = items.map(item => this.getFormalityLevel(item));
    const avgFormality = formalityLevels.reduce((sum, level) => sum + level, 0) / formalityLevels.length;
    
    const occasions: string[] = [];
    
    if (avgFormality >= 4) {
      occasions.push("Formal events", "Business meetings", "Evening occasions");
    } else if (avgFormality >= 3) {
      occasions.push("Business casual", "Date nights", "Social gatherings");
    } else if (avgFormality >= 2) {
      occasions.push("Casual outings", "Weekend activities", "Lunch meetings");
    } else {
      occasions.push("Leisure activities", "Home comfort", "Exercise");
    }
    
    return occasions;
  }

  // Helper methods
  private isTopCategory(category: string): boolean {
    return ['shirt', 'blouse', 'top', 'jacket', 'sweater', 'dress'].includes(category.toLowerCase());
  }

  private isBottomCategory(category: string): boolean {
    return ['pants', 'jeans', 'trousers', 'skirt', 'shorts'].includes(category.toLowerCase());
  }

  private isShoeCategory(category: string): boolean {
    return ['shoes', 'boots', 'sneakers', 'sandals', 'heels'].includes(category.toLowerCase());
  }

  private isAccessoryCategory(category: string): boolean {
    return ['bag', 'jewelry', 'watch', 'hat', 'scarf', 'belt'].includes(category.toLowerCase());
  }

  private extractColor(item: Product): string {
    // Extract primary color from product (simplified)
    return item.color || 'neutral';
  }

  private extractStyle(item: Product): string {
    // Extract style category from product
    return item.style || 'casual';
  }

  private getCurrentSeason(): string {
    const month = new Date().getMonth();
    if (month >= 2 && month <= 4) return 'spring';
    if (month >= 5 && month <= 7) return 'summer';
    if (month >= 8 && month <= 10) return 'fall';
    return 'winter';
  }

  private getFormalityLevel(item: Product): number {
    // Return formality level 1-5
    const category = item.category?.toLowerCase() || '';
    if (category.includes('formal') || category.includes('suit')) return 5;
    if (category.includes('business') || category.includes('dress')) return 4;
    if (category.includes('casual') || category.includes('smart')) return 3;
    if (category.includes('leisure') || category.includes('weekend')) return 2;
    return 1;
  }

  private calculateVariance(numbers: number[]): number {
    const mean = numbers.reduce((sum, num) => sum + num, 0) / numbers.length;
    const squaredDiffs = numbers.map(num => Math.pow(num - mean, 2));
    return squaredDiffs.reduce((sum, diff) => sum + diff, 0) / numbers.length;
  }

  // Simplified helper methods for demonstration
  private hasNeutralBase(colors: string[]): boolean {
    return colors.some(color => ['black', 'white', 'gray', 'beige', 'navy'].includes(color));
  }

  private hasAccentColor(colors: string[]): boolean {
    return colors.length >= 2;
  }

  private hasComplementaryColors(colors: string[]): boolean {
    // Simplified complementary color check
    return colors.includes('red') && colors.includes('green') ||
           colors.includes('blue') && colors.includes('orange');
  }

  private isMonochromatic(colors: string[]): boolean {
    return new Set(colors).size === 1;
  }

  private hasCohesiveAesthetic(styles: string[]): boolean {
    return new Set(styles).size <= 2;
  }

  private hasBalancedFormality(styles: string[]): boolean {
    return !styles.some(style => style === 'formal') || styles.every(style => style === 'formal');
  }

  private isSeasonallyAppropriate(item: Product, season: string): boolean {
    // Simplified seasonal check
    return true; // In a real implementation, check fabric, color, style
  }

  private hasSeasonalColors(items: Product[], season: string): boolean {
    return true; // Implement seasonal color logic
  }

  private hasSeasonalFabrics(items: Product[], season: string): boolean {
    return true; // Implement seasonal fabric logic
  }

  private hasSeasonalLayering(items: Product[], season: string): boolean {
    return season === 'winter' ? items.length >= 3 : true;
  }

  private isOccasionAppropriate(formalityLevels: number[]): boolean {
    const range = Math.max(...formalityLevels) - Math.min(...formalityLevels);
    return range <= 1; // Formality levels shouldn't vary too much
  }

  private hasPriceBalance(prices: number[]): boolean {
    const maxPrice = Math.max(...prices);
    const minPrice = Math.min(...prices);
    return maxPrice / minPrice <= 3; // No item should be more than 3x another
  }

  private hasComplementaryBrands(brands: string[]): boolean {
    // Check if brands work well together
    return true; // Implement brand compatibility logic
  }

  private hasLuxuryMix(brands: string[]): boolean {
    // Check for luxury/mass market mix
    return true; // Implement luxury brand detection
  }

  private hasGoodColorHarmony(colors: string[]): boolean {
    return colors.length <= 3 || this.hasNeutralBase(colors);
  }

  private hasConsistentStyle(styles: string[]): boolean {
    return new Set(styles).size <= 2;
  }
}

export const styleCompatibilityEngine = new StyleCompatibilityEngine();