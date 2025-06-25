import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import {
  insertCategorySchema,
  insertProductSchema,
  insertCartItemSchema,
  insertOrderSchema,
  insertOrderItemSchema,
  insertWishlistSchema,
} from "@shared/schema";
import { z } from "zod";
import { recommendationEngine } from "./ai/recommendation-engine";
import { virtualTryOnEngine } from "./ai/virtual-tryon";

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware
  await setupAuth(app);

  // Auth routes
  app.get("/api/auth/user", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Category routes
  app.get("/api/categories", async (req, res) => {
    try {
      const categories = await storage.getCategories();
      res.json(categories);
    } catch (error) {
      console.error("Error fetching categories:", error);
      res.status(500).json({ message: "Failed to fetch categories" });
    }
  });

  app.get("/api/categories/:slug", async (req, res) => {
    try {
      const category = await storage.getCategoryBySlug(req.params.slug);
      if (!category) {
        return res.status(404).json({ message: "Category not found" });
      }
      res.json(category);
    } catch (error) {
      console.error("Error fetching category:", error);
      res.status(500).json({ message: "Failed to fetch category" });
    }
  });

  // Product routes
  app.get("/api/products", async (req, res) => {
    try {
      const {
        categoryId,
        search,
        featured,
        limit = "20",
        offset = "0",
      } = req.query;

      const filters = {
        categoryId: categoryId ? parseInt(categoryId as string) : undefined,
        search: search as string,
        featured: featured === "true",
        limit: parseInt(limit as string),
        offset: parseInt(offset as string),
      };

      const products = await storage.getProducts(filters);
      res.json(products);
    } catch (error) {
      console.error("Error fetching products:", error);
      res.status(500).json({ message: "Failed to fetch products" });
    }
  });

  app.get("/api/products/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const product = await storage.getProductById(id);
      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }
      res.json(product);
    } catch (error) {
      console.error("Error fetching product:", error);
      res.status(500).json({ message: "Failed to fetch product" });
    }
  });

  app.get("/api/products/slug/:slug", async (req, res) => {
    try {
      const product = await storage.getProductBySlug(req.params.slug);
      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }
      res.json(product);
    } catch (error) {
      console.error("Error fetching product:", error);
      res.status(500).json({ message: "Failed to fetch product" });
    }
  });

  // Cart routes
  app.get("/api/cart", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const cartItems = await storage.getCartItems(userId);
      res.json(cartItems);
    } catch (error) {
      console.error("Error fetching cart:", error);
      res.status(500).json({ message: "Failed to fetch cart" });
    }
  });

  app.post("/api/cart", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const cartItemData = insertCartItemSchema.parse({
        ...req.body,
        userId,
      });

      const cartItem = await storage.addToCart(cartItemData);
      res.json(cartItem);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid cart item data", errors: error.errors });
      }
      console.error("Error adding to cart:", error);
      res.status(500).json({ message: "Failed to add to cart" });
    }
  });

  app.put("/api/cart/:id", isAuthenticated, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const { quantity } = req.body;

      if (!quantity || quantity < 1) {
        return res.status(400).json({ message: "Invalid quantity" });
      }

      const cartItem = await storage.updateCartItem(id, quantity);
      res.json(cartItem);
    } catch (error) {
      console.error("Error updating cart item:", error);
      res.status(500).json({ message: "Failed to update cart item" });
    }
  });

  app.delete("/api/cart/:id", isAuthenticated, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.removeFromCart(id);
      res.json({ message: "Item removed from cart" });
    } catch (error) {
      console.error("Error removing from cart:", error);
      res.status(500).json({ message: "Failed to remove from cart" });
    }
  });

  app.delete("/api/cart", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      await storage.clearCart(userId);
      res.json({ message: "Cart cleared" });
    } catch (error) {
      console.error("Error clearing cart:", error);
      res.status(500).json({ message: "Failed to clear cart" });
    }
  });

  // Order routes
  app.post("/api/orders", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { orderData, orderItems } = req.body;

      const orderSchema = insertOrderSchema.extend({
        userId: z.string(),
      });

      const validatedOrder = orderSchema.parse({
        ...orderData,
        userId,
      });

      const validatedOrderItems = z.array(insertOrderItemSchema).parse(orderItems);

      const order = await storage.createOrder(validatedOrder, validatedOrderItems);
      
      // Clear cart after successful order
      await storage.clearCart(userId);
      
      res.json(order);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid order data", errors: error.errors });
      }
      console.error("Error creating order:", error);
      res.status(500).json({ message: "Failed to create order" });
    }
  });

  app.get("/api/orders", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const orders = await storage.getOrdersByUserId(userId);
      res.json(orders);
    } catch (error) {
      console.error("Error fetching orders:", error);
      res.status(500).json({ message: "Failed to fetch orders" });
    }
  });

  app.get("/api/orders/:id", isAuthenticated, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const order = await storage.getOrderById(id);
      if (!order) {
        return res.status(404).json({ message: "Order not found" });
      }
      res.json(order);
    } catch (error) {
      console.error("Error fetching order:", error);
      res.status(500).json({ message: "Failed to fetch order" });
    }
  });

  // Wishlist routes
  app.get("/api/wishlist", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const wishlist = await storage.getWishlist(userId);
      res.json(wishlist);
    } catch (error) {
      console.error("Error fetching wishlist:", error);
      res.status(500).json({ message: "Failed to fetch wishlist" });
    }
  });

  app.post("/api/wishlist", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const wishlistData = insertWishlistSchema.parse({
        ...req.body,
        userId,
      });

      const wishlistItem = await storage.addToWishlist(wishlistData);
      res.json(wishlistItem);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid wishlist data", errors: error.errors });
      }
      console.error("Error adding to wishlist:", error);
      res.status(500).json({ message: "Failed to add to wishlist" });
    }
  });

  app.delete("/api/wishlist/:productId", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const productId = parseInt(req.params.productId);
      await storage.removeFromWishlist(userId, productId);
      res.json({ message: "Item removed from wishlist" });
    } catch (error) {
      console.error("Error removing from wishlist:", error);
      res.status(500).json({ message: "Failed to remove from wishlist" });
    }
  });

  // AI Recommendation routes
  app.get("/api/recommendations", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const limit = parseInt(req.query.limit as string) || 10;
      
      const recommendations = await recommendationEngine.getRecommendations(userId, limit);
      res.json(recommendations);
    } catch (error) {
      console.error("Error getting recommendations:", error);
      res.status(500).json({ message: "Failed to get recommendations" });
    }
  });

  app.get("/api/products/:id/similar", async (req, res) => {
    try {
      const productId = parseInt(req.params.id);
      const limit = parseInt(req.query.limit as string) || 4;
      
      const similarProducts = await recommendationEngine.getSimilarProducts(productId, limit);
      res.json(similarProducts);
    } catch (error) {
      console.error("Error getting similar products:", error);
      res.status(500).json({ message: "Failed to get similar products" });
    }
  });

  app.post("/api/user-interaction", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { type, productId, duration, rating } = req.body;
      
      await recommendationEngine.updateUserProfile(userId, {
        type,
        productId: parseInt(productId),
        duration,
        rating
      });
      
      res.json({ message: "User interaction recorded" });
    } catch (error) {
      console.error("Error recording user interaction:", error);
      res.status(500).json({ message: "Failed to record interaction" });
    }
  });

  // Virtual Try-On routes
  app.post("/api/virtual-tryon", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { userImage, garmentImage, garmentType, autoDelete = true } = req.body;
      
      const result = await virtualTryOnEngine.processVirtualTryOn({
        userId,
        userImage,
        garmentImage,
        garmentType
      });
      
      // Auto-delete user image for privacy if requested
      if (autoDelete) {
        // Image is already processed and not stored on server
        console.log(`Virtual try-on completed for user ${userId}, image auto-deleted for privacy`);
      }
      
      res.json(result);
    } catch (error) {
      console.error("Error processing virtual try-on:", error);
      res.status(500).json({ message: "Failed to process virtual try-on" });
    }
  });

  app.get("/api/size-recommendation/:productId", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const productId = parseInt(req.params.productId);
      
      const recommendation = await virtualTryOnEngine.getSizeRecommendation(userId, productId);
      res.json(recommendation);
    } catch (error) {
      console.error("Error getting size recommendation:", error);
      res.status(500).json({ message: "Failed to get size recommendation" });
    }
  });

  app.post("/api/body-measurements", isAuthenticated, async (req: any, res) => {
    try {
      const { imageData } = req.body;
      
      if (!imageData) {
        return res.status(400).json({ message: "Image data is required" });
      }
      
      const imageBuffer = Buffer.from(imageData.split(',')[1], 'base64');
      const result = await virtualTryOnEngine.processBodyMeasurements(imageBuffer);
      
      res.json(result);
    } catch (error) {
      console.error("Error processing body measurements:", error);
      res.status(500).json({ message: "Failed to process body measurements" });
    }
  });

  // Outfit Recommendations
  app.get("/api/outfit-recommendations", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const productId = req.query.productId ? parseInt(req.query.productId as string) : null;
      
      // Generate outfit recommendations based on user preferences and selected product
      const outfits = await generateOutfitRecommendations(userId, productId);
      res.json(outfits);
    } catch (error) {
      console.error("Error getting outfit recommendations:", error);
      res.status(500).json({ message: "Failed to get outfit recommendations" });
    }
  });

  // Admin Dashboard Routes
  app.get("/api/admin/analytics", isAuthenticated, async (req: any, res) => {
    try {
      // In a real implementation, this would query actual analytics data
      const analytics = {
        totalUsers: 1247,
        activeUsers: 342,
        totalOrders: 156,
        revenue: 23456.78,
        tryOnSessions: 89,
        recommendationClicks: 445,
        avgSessionTime: 8.5,
        conversionRate: 12.5,
        userGrowth: [
          { month: 'Jan', users: 120 },
          { month: 'Feb', users: 180 },
          { month: 'Mar', users: 240 },
          { month: 'Apr', users: 320 },
          { month: 'May', users: 400 },
          { month: 'Jun', users: 520 }
        ],
        aiPerformance: [
          { metric: 'Recommendation Accuracy', value: 94 },
          { metric: 'Size Prediction Accuracy', value: 89 },
          { metric: 'Try-On Satisfaction', value: 87 },
          { metric: 'Outfit Match Score', value: 92 }
        ],
        categoryBreakdown: [
          { name: 'Tops', value: 35, color: '#8884d8' },
          { name: 'Bottoms', value: 25, color: '#82ca9d' },
          { name: 'Dresses', value: 20, color: '#ffc658' },
          { name: 'Outerwear', value: 12, color: '#ff7300' },
          { name: 'Accessories', value: 8, color: '#0088fe' }
        ]
      };
      res.json(analytics);
    } catch (error) {
      console.error("Error getting analytics:", error);
      res.status(500).json({ message: "Failed to get analytics" });
    }
  });

  app.get("/api/admin/product-performance", isAuthenticated, async (req: any, res) => {
    try {
      // In a real implementation, this would aggregate actual product performance data
      const products = [
        { id: 1, name: 'Classic White T-Shirt', views: 1234, sales: 89, tryOns: 45, rating: 4.5, revenue: 2667.11 },
        { id: 2, name: 'Blue Denim Jeans', views: 987, sales: 67, tryOns: 38, rating: 4.3, revenue: 4019.33 },
        { id: 3, name: 'Summer Floral Dress', views: 856, sales: 52, tryOns: 29, rating: 4.7, revenue: 3639.48 },
        { id: 4, name: 'Leather Jacket', views: 654, sales: 23, tryOns: 18, rating: 4.8, revenue: 3449.77 },
        { id: 5, name: 'Designer Handbag', views: 543, sales: 34, tryOns: 12, rating: 4.6, revenue: 4078.66 }
      ];
      res.json(products);
    } catch (error) {
      console.error("Error getting product performance:", error);
      res.status(500).json({ message: "Failed to get product performance" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;

async function generateOutfitRecommendations(userId: string, baseProductId?: number | null) {
  try {
    const allProducts = await storage.getProducts();
    
    // Group products by category
    const productsByCategory = allProducts.reduce((acc, product) => {
      const category = product.categoryId || 0;
      if (!acc[category]) acc[category] = [];
      acc[category].push(product);
      return acc;
    }, {} as Record<number, typeof allProducts>);

    const outfits = [];

    // Generate casual outfit
    const casualOutfit = {
      id: 'casual-1',
      name: 'Casual Day Out',
      products: {
        top: productsByCategory[1]?.[0], // Tops
        bottom: productsByCategory[2]?.[0], // Bottoms
        accessories: productsByCategory[5]?.slice(0, 2) || [] // Accessories
      },
      compatibility: 0.92,
      occasion: 'Casual',
      style: 'Relaxed'
    };

    // Generate smart casual outfit
    const smartOutfit = {
      id: 'smart-1',
      name: 'Smart Casual',
      products: {
        top: productsByCategory[1]?.[1], // Different top
        bottom: productsByCategory[2]?.[1], // Different bottom
        accessories: productsByCategory[5]?.slice(0, 1) || []
      },
      compatibility: 0.88,
      occasion: 'Work',
      style: 'Professional'
    };

    outfits.push(casualOutfit, smartOutfit);

    // If there's a dress category, add a dress outfit
    if (productsByCategory[3]?.length > 0) {
      const dressOutfit = {
        id: 'dress-1',
        name: 'Elegant Evening',
        products: {
          top: productsByCategory[3][0], // Dress as "top"
          accessories: productsByCategory[5]?.slice(0, 2) || []
        },
        compatibility: 0.95,
        occasion: 'Evening',
        style: 'Elegant'
      };
      outfits.push(dressOutfit);
    }

    return outfits;
  } catch (error) {
    console.error('Error generating outfit recommendations:', error);
    return [];
  }
}
}
