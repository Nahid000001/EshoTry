import { storage } from '../storage';
import { Product } from '@shared/schema';

interface SustainabilityMetrics {
  materialScore: number; // 0-100, higher is better
  sourcingScore: number; // 0-100, higher is better
  impactScore: number; // 0-100, higher is better
  overallScore: number; // 0-100, average of above
  certifications: string[];
  impactFactors: string[];
  ecoAlternatives?: Product[];
}

interface EcoRecommendation {
  product: Product;
  sustainability: SustainabilityMetrics;
  reasoning: string[];
  greenAlternative?: {
    product: Product;
    improvementAreas: string[];
    benefits: string[];
  };
}

export class SustainabilityEngine {
  private sustainabilityCache = new Map<number, SustainabilityMetrics>();

  async analyzeSustainability(product: Product): Promise<SustainabilityMetrics> {
    // Check cache first
    if (this.sustainabilityCache.has(product.id)) {
      return this.sustainabilityCache.get(product.id)!;
    }

    const metrics = await this.calculateSustainabilityMetrics(product);
    this.sustainabilityCache.set(product.id, metrics);
    return metrics;
  }

  private async calculateSustainabilityMetrics(product: Product): Promise<SustainabilityMetrics> {
    const productName = product.name.toLowerCase();
    const productDesc = product.description?.toLowerCase() || '';
    const productText = productName + ' ' + productDesc;

    // Material analysis
    const materialScore = this.analyzeMaterials(productText);
    
    // Sourcing analysis
    const sourcingScore = this.analyzeSourcing(productText);
    
    // Environmental impact analysis
    const impactScore = this.analyzeImpact(productText);
    
    // Overall score
    const overallScore = (materialScore + sourcingScore + impactScore) / 3;

    // Identify certifications
    const certifications = this.identifyCertifications(productText);
    
    // Impact factors
    const impactFactors = this.identifyImpactFactors(productText, overallScore);

    return {
      materialScore,
      sourcingScore,
      impactScore,
      overallScore,
      certifications,
      impactFactors
    };
  }

  private analyzeMaterials(productText: string): number {
    let score = 50; // Base score

    // Sustainable materials (bonus points)
    const sustainableMaterials = [
      { term: 'organic cotton', points: 25 },
      { term: 'bamboo', points: 20 },
      { term: 'hemp', points: 20 },
      { term: 'linen', points: 15 },
      { term: 'recycled', points: 25 },
      { term: 'eco-friendly', points: 20 },
      { term: 'sustainable', points: 20 },
      { term: 'tencel', points: 20 },
      { term: 'modal', points: 15 },
      { term: 'wool', points: 10 },
      { term: 'cotton', points: 5 }
    ];

    // Unsustainable materials (penalty points)
    const unsustainableMaterials = [
      { term: 'polyester', points: -15 },
      { term: 'acrylic', points: -20 },
      { term: 'nylon', points: -15 },
      { term: 'synthetic', points: -10 },
      { term: 'plastic', points: -25 }
    ];

    // Check for sustainable materials
    sustainableMaterials.forEach(material => {
      if (productText.includes(material.term)) {
        score += material.points;
      }
    });

    // Check for unsustainable materials
    unsustainableMaterials.forEach(material => {
      if (productText.includes(material.term)) {
        score += material.points; // Already negative
      }
    });

    return Math.max(0, Math.min(100, score));
  }

  private analyzeSourcing(productText: string): number {
    let score = 50; // Base score

    // Positive sourcing indicators
    const positiveSourcing = [
      { term: 'fair trade', points: 25 },
      { term: 'ethically made', points: 20 },
      { term: 'locally sourced', points: 20 },
      { term: 'small batch', points: 15 },
      { term: 'artisan made', points: 15 },
      { term: 'handmade', points: 10 },
      { term: 'made in usa', points: 10 },
      { term: 'made in europe', points: 10 },
      { term: 'transparent supply', points: 20 }
    ];

    // Check for positive indicators
    positiveSourcing.forEach(indicator => {
      if (productText.includes(indicator.term)) {
        score += indicator.points;
      }
    });

    // Brand reputation factors (simplified)
    if (productText.includes('premium') || productText.includes('luxury')) {
      score += 5; // Assumption: premium brands often have better sourcing
    }

    return Math.max(0, Math.min(100, score));
  }

  private analyzeImpact(productText: string): number {
    let score = 50; // Base score

    // Positive impact indicators
    const positiveImpact = [
      { term: 'carbon neutral', points: 25 },
      { term: 'zero waste', points: 20 },
      { term: 'biodegradable', points: 20 },
      { term: 'low impact', points: 15 },
      { term: 'water-efficient', points: 15 },
      { term: 'renewable', points: 15 },
      { term: 'recyclable', points: 10 },
      { term: 'durable', points: 10 },
      { term: 'long-lasting', points: 10 }
    ];

    // Negative impact indicators
    const negativeImpact = [
      { term: 'fast fashion', points: -25 },
      { term: 'disposable', points: -20 },
      { term: 'single use', points: -20 }
    ];

    // Check for positive indicators
    positiveImpact.forEach(indicator => {
      if (productText.includes(indicator.term)) {
        score += indicator.points;
      }
    });

    // Check for negative indicators
    negativeImpact.forEach(indicator => {
      if (productText.includes(indicator.term)) {
        score += indicator.points; // Already negative
      }
    });

    return Math.max(0, Math.min(100, score));
  }

  private identifyCertifications(productText: string): string[] {
    const certifications: string[] = [];
    
    const certificationPatterns = [
      { pattern: /gots|global organic textile/i, cert: 'GOTS Certified' },
      { pattern: /oeko.tex/i, cert: 'OEKO-TEX Certified' },
      { pattern: /fair trade/i, cert: 'Fair Trade Certified' },
      { pattern: /organic/i, cert: 'Organic Certified' },
      { pattern: /recycled/i, cert: 'Recycled Materials' },
      { pattern: /sustainable/i, cert: 'Sustainable Production' },
      { pattern: /eco.friendly/i, cert: 'Eco-Friendly' },
      { pattern: /carbon neutral/i, cert: 'Carbon Neutral' }
    ];

    certificationPatterns.forEach(({ pattern, cert }) => {
      if (pattern.test(productText)) {
        certifications.push(cert);
      }
    });

    return certifications;
  }

  private identifyImpactFactors(productText: string, overallScore: number): string[] {
    const factors: string[] = [];

    if (overallScore >= 80) {
      factors.push('Excellent sustainability profile');
      factors.push('Minimal environmental impact');
    } else if (overallScore >= 60) {
      factors.push('Good sustainability practices');
      factors.push('Moderate environmental footprint');
    } else if (overallScore >= 40) {
      factors.push('Average sustainability rating');
      factors.push('Room for improvement in eco-practices');
    } else {
      factors.push('Limited sustainability information');
      factors.push('Consider more eco-friendly alternatives');
    }

    // Specific factors based on content
    if (productText.includes('organic')) {
      factors.push('Made with organic materials');
    }
    if (productText.includes('recycled')) {
      factors.push('Contains recycled content');
    }
    if (productText.includes('durable')) {
      factors.push('Built for longevity');
    }

    return factors;
  }

  async getEcoFriendlyProducts(limit: number = 20): Promise<Product[]> {
    try {
      const allProducts = await storage.getProducts({ limit: 1000 });
      const ecoProducts: { product: Product; score: number }[] = [];

      for (const product of allProducts) {
        const sustainability = await this.analyzeSustainability(product);
        if (sustainability.overallScore >= 60) { // Only include reasonably sustainable products
          ecoProducts.push({ product, score: sustainability.overallScore });
        }
      }

      return ecoProducts
        .sort((a, b) => b.score - a.score)
        .slice(0, limit)
        .map(item => item.product);

    } catch (error) {
      console.error('Error getting eco-friendly products:', error);
      return [];
    }
  }

  async generateEcoRecommendations(
    originalProducts: Product[], 
    userPreferences?: { budgetRange?: { min: number; max: number }; categories?: string[] }
  ): Promise<EcoRecommendation[]> {
    try {
      const recommendations: EcoRecommendation[] = [];

      for (const product of originalProducts) {
        const sustainability = await this.analyzeSustainability(product);
        
        // Find greener alternatives if current product isn't very sustainable
        let greenAlternative: EcoRecommendation['greenAlternative'];
        
        if (sustainability.overallScore < 70) {
          const alternative = await this.findGreenerAlternative(product, userPreferences);
          if (alternative) {
            const altSustainability = await this.analyzeSustainability(alternative);
            greenAlternative = {
              product: alternative,
              improvementAreas: this.getImprovementAreas(sustainability, altSustainability),
              benefits: this.getSustainabilityBenefits(altSustainability)
            };
          }
        }

        recommendations.push({
          product,
          sustainability,
          reasoning: this.generateSustainabilityReasoning(sustainability),
          greenAlternative
        });
      }

      return recommendations;

    } catch (error) {
      console.error('Error generating eco recommendations:', error);
      return [];
    }
  }

  private async findGreenerAlternative(
    originalProduct: Product, 
    preferences?: any
  ): Promise<Product | null> {
    try {
      const allProducts = await storage.getProducts({ limit: 1000 });
      
      // Filter products in same category
      const sameCategoryProducts = allProducts.filter(p => 
        p.categoryId === originalProduct.categoryId && 
        p.id !== originalProduct.id &&
        p.stock > 0
      );

      // Apply budget filter if specified
      let candidateProducts = sameCategoryProducts;
      if (preferences?.budgetRange) {
        const { min, max } = preferences.budgetRange;
        candidateProducts = sameCategoryProducts.filter(p => {
          const price = parseFloat(p.price.toString());
          return price >= min && price <= max;
        });
      }

      if (candidateProducts.length === 0) return null;

      // Score candidates for sustainability
      const scoredCandidates: { product: Product; sustainabilityScore: number }[] = [];
      
      for (const candidate of candidateProducts.slice(0, 20)) { // Limit to prevent too many API calls
        const sustainability = await this.analyzeSustainability(candidate);
        scoredCandidates.push({
          product: candidate,
          sustainabilityScore: sustainability.overallScore
        });
      }

      // Return the most sustainable alternative
      const bestAlternative = scoredCandidates
        .filter(c => c.sustainabilityScore > 60) // Only suggest if reasonably sustainable
        .sort((a, b) => b.sustainabilityScore - a.sustainabilityScore)[0];

      return bestAlternative?.product || null;

    } catch (error) {
      console.error('Error finding greener alternative:', error);
      return null;
    }
  }

  private getImprovementAreas(original: SustainabilityMetrics, alternative: SustainabilityMetrics): string[] {
    const improvements: string[] = [];

    if (alternative.materialScore > original.materialScore) {
      improvements.push('Better material choices');
    }
    if (alternative.sourcingScore > original.sourcingScore) {
      improvements.push('More ethical sourcing');
    }
    if (alternative.impactScore > original.impactScore) {
      improvements.push('Lower environmental impact');
    }

    return improvements;
  }

  private getSustainabilityBenefits(sustainability: SustainabilityMetrics): string[] {
    const benefits: string[] = [];

    if (sustainability.overallScore >= 80) {
      benefits.push('Excellent eco-friendly choice');
    }
    if (sustainability.certifications.length > 0) {
      benefits.push(`Certified: ${sustainability.certifications.join(', ')}`);
    }
    if (sustainability.materialScore >= 70) {
      benefits.push('Sustainable materials used');
    }
    if (sustainability.sourcingScore >= 70) {
      benefits.push('Ethically sourced');
    }

    return benefits;
  }

  private generateSustainabilityReasoning(sustainability: SustainabilityMetrics): string[] {
    const reasoning: string[] = [];

    if (sustainability.overallScore >= 80) {
      reasoning.push('Excellent sustainability rating across all metrics');
    } else if (sustainability.overallScore >= 60) {
      reasoning.push('Good sustainability practices with room for improvement');
    } else {
      reasoning.push('Limited sustainability information - consider eco-alternatives');
    }

    if (sustainability.certifications.length > 0) {
      reasoning.push(`Certified sustainable: ${sustainability.certifications.join(', ')}`);
    }

    reasoning.push(...sustainability.impactFactors.slice(0, 2));

    return reasoning;
  }

  async filterProductsBySustainability(
    products: Product[], 
    minSustainabilityScore: number = 60
  ): Promise<Product[]> {
    const sustainableProducts: Product[] = [];

    for (const product of products) {
      const sustainability = await this.analyzeSustainability(product);
      if (sustainability.overallScore >= minSustainabilityScore) {
        sustainableProducts.push(product);
      }
    }

    return sustainableProducts;
  }

  getSustainabilityLabel(score: number): { label: string; color: string; description: string } {
    if (score >= 80) {
      return {
        label: 'Excellent',
        color: 'green',
        description: 'Outstanding sustainability practices'
      };
    } else if (score >= 60) {
      return {
        label: 'Good',
        color: 'lightgreen',
        description: 'Good environmental practices'
      };
    } else if (score >= 40) {
      return {
        label: 'Fair',
        color: 'yellow',
        description: 'Average sustainability rating'
      };
    } else {
      return {
        label: 'Limited',
        color: 'orange',
        description: 'Limited sustainability information'
      };
    }
  }
}

export const sustainabilityEngine = new SustainabilityEngine();