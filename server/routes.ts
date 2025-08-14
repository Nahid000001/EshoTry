import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import chatbotRoutes from "./routes/chatbot";
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
import { enhancedVirtualTryOnEngine } from "./ai/enhanced-virtual-tryon";
import { 
  createRateLimitMiddleware, 
  generalRateLimiter, 
  aiRateLimiter, 
  uploadRateLimiter,
  getRateLimitStats 
} from "./middleware/rateLimiter";
import { 
  errorHandler, 
  asyncHandler, 
  notFoundHandler, 
  securityHeaders,
  requestLogger,
  validateRequest,
  AIProcessingError,
  ValidationError,
  NotFoundError
} from "./middleware/errorHandler";

export async function registerRoutes(app: Express): Promise<Server> {
  // Apply security headers to all routes
  app.use(securityHeaders);
  
  // Apply request logging
  app.use(requestLogger);
  
  // Apply general rate limiting
  app.use(createRateLimitMiddleware(generalRateLimiter));

  // Auth middleware
  await setupAuth(app);

  // Chatbot routes
  app.use('/api/chatbot', chatbotRoutes);

  // Auth routes
  app.get("/api/auth/user", isAuthenticated, asyncHandler(async (req: any, res) => {
    const userId = req.user.claims.sub;
    const user = await storage.getUser(userId);
    res.json(user);
  }));

  // Category routes
  app.get("/api/categories", asyncHandler(async (req, res) => {
    const categories = await storage.getCategories();
    res.json(categories);
  }));

  app.get("/api/categories/:slug", asyncHandler(async (req, res) => {
    const category = await storage.getCategoryBySlug(req.params.slug);
    if (!category) {
      throw new NotFoundError('Category');
    }
    res.json(category);
  }));

  // Product routes
  app.get("/api/products", asyncHandler(async (req, res) => {
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
  }));

  app.get("/api/products/:id", asyncHandler(async (req, res) => {
    const id = parseInt(req.params.id);
    const product = await storage.getProductById(id);
    if (!product) {
      throw new NotFoundError('Product');
    }
    res.json(product);
  }));

  // Enhanced AI Virtual Try-On route
  app.post("/api/virtual-tryon", 
    createRateLimitMiddleware(aiRateLimiter),
    validateRequest(z.object({
      userImage: z.string().min(1, 'User image is required'),
      garmentImage: z.string().min(1, 'Garment image is required'),
      garmentType: z.enum(['top', 'bottom', 'dress', 'shoes', 'accessories']),
      userId: z.string().min(1, 'User ID is required'),
      autoDelete: z.boolean().optional()
    })),
    asyncHandler(async (req: any, res) => {
      try {
        const { userImage, garmentImage, garmentType, userId, autoDelete = true } = req.body;

        // Validate image format
        if (!userImage.startsWith('data:image/')) {
          throw new ValidationError('Invalid user image format. Must be a valid base64 image.');
        }

        if (!garmentImage.startsWith('data:image/')) {
          throw new ValidationError('Invalid garment image format. Must be a valid base64 image.');
        }

        // Process virtual try-on with enhanced engine
        const result = await enhancedVirtualTryOnEngine.processVirtualTryOn({
          userImage,
          garmentImage,
          garmentType,
          userId,
          autoDelete
        });

        res.json(result);
      } catch (error) {
        if (error instanceof Error) {
          throw new AIProcessingError(error.message, { garmentType: req.body.garmentType });
        }
        throw error;
      }
    })
  );

  // Enhanced size recommendation route
  app.get("/api/size-recommendation/:productId", 
    createRateLimitMiddleware(aiRateLimiter),
    asyncHandler(async (req: any, res) => {
      const productId = parseInt(req.params.productId);
      const userId = req.user?.claims?.sub;

      if (!userId) {
        throw new ValidationError('User ID is required for size recommendations');
      }

      const recommendation = await enhancedVirtualTryOnEngine.getSizeRecommendation(userId, productId);
      res.json(recommendation);
    })
  );

  // AI Recommendations route
  app.get("/api/recommendations", 
    createRateLimitMiddleware(aiRateLimiter),
    asyncHandler(async (req: any, res) => {
      const userId = req.user?.claims?.sub;
      const limit = parseInt(req.query.limit as string) || 10;

      if (!userId) {
        throw new ValidationError('User ID is required for recommendations');
      }

      const recommendations = await recommendationEngine.getPersonalizedRecommendations(userId, limit);
      res.json(recommendations);
    })
  );

  // Similar products route
  app.get("/api/products/:id/similar", 
    createRateLimitMiddleware(aiRateLimiter),
    asyncHandler(async (req, res) => {
      const productId = parseInt(req.params.id);
      const limit = parseInt(req.query.limit as string) || 5;

      const product = await storage.getProductById(productId);
      if (!product) {
        throw new NotFoundError('Product');
      }

      const similarProducts = await recommendationEngine.getSimilarProducts(productId, limit);
      res.json(similarProducts);
    })
  );

  // Cart routes
  app.get("/api/cart", isAuthenticated, asyncHandler(async (req: any, res) => {
    const userId = req.user.claims.sub;
    const cartItems = await storage.getCartItems(userId);
    res.json(cartItems);
  }));

  app.post("/api/cart", 
    isAuthenticated,
    createRateLimitMiddleware(uploadRateLimiter),
    validateRequest(insertCartItemSchema),
    asyncHandler(async (req: any, res) => {
      const userId = req.user.claims.sub;
      const cartItem = await storage.addToCart(userId, req.body);
      res.status(201).json(cartItem);
    })
  );

  app.put("/api/cart/:id", 
    isAuthenticated,
    validateRequest(z.object({
      quantity: z.number().min(1).max(99)
    })),
    asyncHandler(async (req: any, res) => {
      const userId = req.user.claims.sub;
      const cartItemId = parseInt(req.params.id);
      const { quantity } = req.body;

      const updatedItem = await storage.updateCartItem(userId, cartItemId, quantity);
      res.json(updatedItem);
    })
  );

  app.delete("/api/cart/:id", 
    isAuthenticated,
    asyncHandler(async (req: any, res) => {
      const userId = req.user.claims.sub;
      const cartItemId = parseInt(req.params.id);
      
      await storage.removeFromCart(userId, cartItemId);
      res.status(204).send();
    })
  );

  // Order routes
  app.get("/api/orders", isAuthenticated, asyncHandler(async (req: any, res) => {
    const userId = req.user.claims.sub;
    const orders = await storage.getOrders(userId);
    res.json(orders);
  }));

  app.post("/api/orders", 
    isAuthenticated,
    validateRequest(insertOrderSchema),
    asyncHandler(async (req: any, res) => {
      const userId = req.user.claims.sub;
      const order = await storage.createOrder(userId, req.body);
      res.status(201).json(order);
    })
  );

  app.get("/api/orders/:id", 
    isAuthenticated,
    asyncHandler(async (req: any, res) => {
      const userId = req.user.claims.sub;
      const orderId = parseInt(req.params.id);
      
      const order = await storage.getOrderById(userId, orderId);
      if (!order) {
        throw new NotFoundError('Order');
      }
      
      res.json(order);
    })
  );

  // Admin routes
  app.get("/api/admin/analytics", 
    isAuthenticated,
    asyncHandler(async (req: any, res) => {
      // Check if user is admin (you would implement this check)
      const isAdmin = req.user.claims.role === 'admin';
      if (!isAdmin) {
        throw new Error('Admin access required');
      }

      const analytics = {
        totalUsers: await storage.getTotalUsers(),
        totalOrders: await storage.getTotalOrders(),
        totalRevenue: await storage.getTotalRevenue(),
        aiMetrics: enhancedVirtualTryOnEngine.getPerformanceMetrics(),
        rateLimitStats: getRateLimitStats(req, res)
      };

      res.json(analytics);
    })
  );

  app.get("/api/admin/product-performance", 
    isAuthenticated,
    asyncHandler(async (req: any, res) => {
      const isAdmin = req.user.claims.role === 'admin';
      if (!isAdmin) {
        throw new Error('Admin access required');
      }

      const performance = await storage.getProductPerformance();
      res.json(performance);
    })
  );

  // Health check route
  app.get("/api/health", (req, res) => {
    res.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV || 'development',
      version: process.env.npm_package_version || '1.0.0'
    });
  });

  // Rate limit stats (admin only)
  app.get("/api/admin/rate-limits", 
    isAuthenticated,
    asyncHandler(async (req: any, res) => {
      const isAdmin = req.user.claims.role === 'admin';
      if (!isAdmin) {
        throw new Error('Admin access required');
      }

      getRateLimitStats(req, res);
    })
  );

  // 404 handler for API routes
  app.use('/api/*', notFoundHandler);

  const server = createServer(app);

  // Global error handler (must be last)
  app.use(errorHandler(process.env.NODE_ENV === 'development'));

  return server;
}
