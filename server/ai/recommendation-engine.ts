import * as tf from '@tensorflow/tfjs-node';
import { Matrix } from 'ml-matrix';
import { storage } from '../storage';
import type { Product, User } from '@shared/schema';

interface UserProfile {
  userId: string;
  preferences: {
    categories: number[];
    priceRange: [number, number];
    brands: string[];
    colors: string[];
    styles: string[];
  };
  purchaseHistory: {
    productId: number;
    rating: number;
    category: number;
    price: number;
  }[];
  viewHistory: {
    productId: number;
    duration: number;
    timestamp: Date;
  }[];
}

interface ProductFeatures {
  id: number;
  category: number;
  price: number;
  brand: string;
  colors: string[];
  rating: number;
  features: number[]; // Encoded features vector
}

export class AIRecommendationEngine {
  private model: tf.LayersModel | null = null;
  private productFeatures: Map<number, ProductFeatures> = new Map();
  private userProfiles: Map<string, UserProfile> = new Map();
  private isInitialized = false;

  constructor() {
    this.initializeEngine();
  }

  private async initializeEngine() {
    try {
      // Initialize TensorFlow.js backend
      await tf.ready();
      
      // Create a simple neural network for collaborative filtering
      this.model = tf.sequential({
        layers: [
          tf.layers.dense({ inputShape: [100], units: 64, activation: 'relu' }),
          tf.layers.dropout({ rate: 0.3 }),
          tf.layers.dense({ units: 32, activation: 'relu' }),
          tf.layers.dropout({ rate: 0.2 }),
          tf.layers.dense({ units: 16, activation: 'relu' }),
          tf.layers.dense({ units: 1, activation: 'sigmoid' })
        ]
      });

      this.model.compile({
        optimizer: tf.train.adam(0.001),
        loss: 'meanSquaredError',
        metrics: ['mae']
      });

      await this.loadProductFeatures();
      this.isInitialized = true;
      
      console.log('AI Recommendation Engine initialized successfully');
    } catch (error) {
      console.error('Failed to initialize AI Recommendation Engine:', error);
    }
  }

  private async loadProductFeatures() {
    try {
      const products = await storage.getProducts();
      
      for (const product of products) {
        const features = this.extractProductFeatures(product);
        this.productFeatures.set(product.id, features);
      }
    } catch (error) {
      console.error('Failed to load product features:', error);
    }
  }

  private extractProductFeatures(product: Product): ProductFeatures {
    // Create feature vector from product attributes
    const features: number[] = [];
    
    // Price normalization (0-1 scale)
    const priceNorm = Math.min(parseFloat(product.price) / 1000, 1);
    features.push(priceNorm);
    
    // Category encoding (one-hot style)
    features.push(product.categoryId || 0);
    
    // Rating
    features.push(parseFloat(product.rating || '0') / 5);
    
    // Brand encoding (hash to number)
    const brandHash = this.hashString(product.brand || '') % 100;
    features.push(brandHash / 100);
    
    // Color diversity
    const colorCount = product.colors ? product.colors.length : 0;
    features.push(Math.min(colorCount / 10, 1));
    
    // Size diversity
    const sizeCount = product.sizes ? product.sizes.length : 0;
    features.push(Math.min(sizeCount / 10, 1));
    
    // Featured flag
    features.push(product.isFeatured ? 1 : 0);
    
    // Stock availability
    features.push(Math.min((product.stock || 0) / 100, 1));
    
    // Pad to 100 features with zeros
    while (features.length < 100) {
      features.push(0);
    }

    return {
      id: product.id,
      category: product.categoryId || 0,
      price: parseFloat(product.price),
      brand: product.brand || '',
      colors: product.colors || [],
      rating: parseFloat(product.rating || '0'),
      features: features.slice(0, 100)
    };
  }

  private hashString(str: string): number {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash);
  }

  async updateUserProfile(userId: string, interaction: {
    type: 'view' | 'purchase' | 'cart' | 'wishlist';
    productId: number;
    duration?: number;
    rating?: number;
  }) {
    try {
      const product = await storage.getProductById(interaction.productId);
      if (!product) return;

      let profile = this.userProfiles.get(userId);
      if (!profile) {
        profile = {
          userId,
          preferences: {
            categories: [],
            priceRange: [0, 1000],
            brands: [],
            colors: [],
            styles: []
          },
          purchaseHistory: [],
          viewHistory: []
        };
        this.userProfiles.set(userId, profile);
      }

      // Update interaction history
      switch (interaction.type) {
        case 'view':
          profile.viewHistory.push({
            productId: interaction.productId,
            duration: interaction.duration || 0,
            timestamp: new Date()
          });
          break;
        case 'purchase':
          profile.purchaseHistory.push({
            productId: interaction.productId,
            rating: interaction.rating || 5,
            category: product.categoryId || 0,
            price: parseFloat(product.price)
          });
          break;
      }

      // Update preferences based on interactions
      this.updateUserPreferences(profile, product);
      
    } catch (error) {
      console.error('Failed to update user profile:', error);
    }
  }

  private updateUserPreferences(profile: UserProfile, product: Product) {
    // Update category preferences
    if (product.categoryId && !profile.preferences.categories.includes(product.categoryId)) {
      profile.preferences.categories.push(product.categoryId);
    }

    // Update brand preferences
    if (product.brand && !profile.preferences.brands.includes(product.brand)) {
      profile.preferences.brands.push(product.brand);
    }

    // Update color preferences
    if (product.colors) {
      for (const color of product.colors) {
        if (!profile.preferences.colors.includes(color)) {
          profile.preferences.colors.push(color);
        }
      }
    }

    // Update price range
    const price = parseFloat(product.price);
    if (price > profile.preferences.priceRange[1]) {
      profile.preferences.priceRange[1] = price;
    }
  }

  async getRecommendations(userId: string, limit: number = 10): Promise<Product[]> {
    if (!this.isInitialized || !this.model) {
      console.warn('AI Recommendation Engine not initialized, falling back to basic recommendations');
      return this.getFallbackRecommendations(limit);
    }

    try {
      const userProfile = this.userProfiles.get(userId);
      if (!userProfile) {
        return this.getFallbackRecommendations(limit);
      }

      // Get all products
      const allProducts = await storage.getProducts();
      const scores: { product: Product; score: number }[] = [];

      for (const product of allProducts) {
        const productFeatures = this.productFeatures.get(product.id);
        if (!productFeatures) continue;

        // Calculate recommendation score
        const score = await this.calculateRecommendationScore(userProfile, productFeatures);
        scores.push({ product, score });
      }

      // Sort by score and return top recommendations
      scores.sort((a, b) => b.score - a.score);
      return scores.slice(0, limit).map(item => item.product);

    } catch (error) {
      console.error('Failed to generate AI recommendations:', error);
      return this.getFallbackRecommendations(limit);
    }
  }

  private async calculateRecommendationScore(userProfile: UserProfile, productFeatures: ProductFeatures): Promise<number> {
    try {
      // Create user-product feature vector
      const userFeatureVector = this.createUserFeatureVector(userProfile, productFeatures);
      
      // Use the model to predict score
      const inputTensor = tf.tensor2d([userFeatureVector]);
      const prediction = this.model!.predict(inputTensor) as tf.Tensor;
      const score = await prediction.data();
      
      inputTensor.dispose();
      prediction.dispose();
      
      return score[0];
    } catch (error) {
      console.error('Failed to calculate recommendation score:', error);
      return this.calculateBasicScore(userProfile, productFeatures);
    }
  }

  private createUserFeatureVector(userProfile: UserProfile, productFeatures: ProductFeatures): number[] {
    const features: number[] = [];
    
    // User preference alignment
    const categoryMatch = userProfile.preferences.categories.includes(productFeatures.category) ? 1 : 0;
    features.push(categoryMatch);
    
    const brandMatch = userProfile.preferences.brands.includes(productFeatures.brand) ? 1 : 0;
    features.push(brandMatch);
    
    // Price preference alignment
    const [minPrice, maxPrice] = userProfile.preferences.priceRange;
    const priceInRange = productFeatures.price >= minPrice && productFeatures.price <= maxPrice ? 1 : 0;
    features.push(priceInRange);
    
    // Historical interaction score
    const viewCount = userProfile.viewHistory.filter(v => v.productId === productFeatures.id).length;
    features.push(Math.min(viewCount / 10, 1));
    
    const purchaseCount = userProfile.purchaseHistory.filter(p => p.productId === productFeatures.id).length;
    features.push(purchaseCount > 0 ? 1 : 0);
    
    // Product features
    features.push(...productFeatures.features.slice(0, 95));
    
    return features;
  }

  private calculateBasicScore(userProfile: UserProfile, productFeatures: ProductFeatures): number {
    let score = 0;
    
    // Category preference
    if (userProfile.preferences.categories.includes(productFeatures.category)) {
      score += 0.3;
    }
    
    // Brand preference
    if (userProfile.preferences.brands.includes(productFeatures.brand)) {
      score += 0.2;
    }
    
    // Price range
    const [minPrice, maxPrice] = userProfile.preferences.priceRange;
    if (productFeatures.price >= minPrice && productFeatures.price <= maxPrice) {
      score += 0.2;
    }
    
    // Product rating
    score += productFeatures.rating * 0.1;
    
    // Random factor for diversity
    score += Math.random() * 0.2;
    
    return Math.min(score, 1);
  }

  private async getFallbackRecommendations(limit: number): Promise<Product[]> {
    try {
      // Fallback to featured and high-rated products
      const products = await storage.getProducts({ featured: true, limit });
      if (products.length < limit) {
        const additionalProducts = await storage.getProducts({ 
          limit: limit - products.length 
        });
        products.push(...additionalProducts);
      }
      return products.slice(0, limit);
    } catch (error) {
      console.error('Failed to get fallback recommendations:', error);
      return [];
    }
  }

  async getSimilarProducts(productId: number, limit: number = 4): Promise<Product[]> {
    try {
      const targetProduct = await storage.getProductById(productId);
      if (!targetProduct) return [];

      const targetFeatures = this.productFeatures.get(productId);
      if (!targetFeatures) return [];

      const allProducts = await storage.getProducts();
      const similarities: { product: Product; similarity: number }[] = [];

      for (const product of allProducts) {
        if (product.id === productId) continue;
        
        const productFeatures = this.productFeatures.get(product.id);
        if (!productFeatures) continue;

        const similarity = this.calculateCosineSimilarity(
          targetFeatures.features,
          productFeatures.features
        );
        
        similarities.push({ product, similarity });
      }

      similarities.sort((a, b) => b.similarity - a.similarity);
      return similarities.slice(0, limit).map(item => item.product);

    } catch (error) {
      console.error('Failed to get similar products:', error);
      return [];
    }
  }

  private calculateCosineSimilarity(vecA: number[], vecB: number[]): number {
    const dotProduct = vecA.reduce((sum, a, i) => sum + a * vecB[i], 0);
    const magnitudeA = Math.sqrt(vecA.reduce((sum, a) => sum + a * a, 0));
    const magnitudeB = Math.sqrt(vecB.reduce((sum, b) => sum + b * b, 0));
    
    if (magnitudeA === 0 || magnitudeB === 0) return 0;
    return dotProduct / (magnitudeA * magnitudeB);
  }

  async trainModel(trainingData: { userId: string; productId: number; rating: number }[]) {
    if (!this.model || trainingData.length === 0) return;

    try {
      const features: number[][] = [];
      const labels: number[] = [];

      for (const data of trainingData) {
        const userProfile = this.userProfiles.get(data.userId);
        const productFeatures = this.productFeatures.get(data.productId);
        
        if (userProfile && productFeatures) {
          const featureVector = this.createUserFeatureVector(userProfile, productFeatures);
          features.push(featureVector);
          labels.push(data.rating / 5); // Normalize rating to 0-1
        }
      }

      if (features.length === 0) return;

      const xs = tf.tensor2d(features);
      const ys = tf.tensor2d(labels, [labels.length, 1]);

      await this.model.fit(xs, ys, {
        epochs: 10,
        batchSize: 32,
        validationSplit: 0.2,
        shuffle: true
      });

      xs.dispose();
      ys.dispose();

      console.log('Model training completed');
    } catch (error) {
      console.error('Failed to train model:', error);
    }
  }
}

export const recommendationEngine = new AIRecommendationEngine();