import { Request, Response, NextFunction } from 'express';

interface RateLimitConfig {
  windowMs: number;
  maxRequests: number;
  message: string;
  statusCode: number;
}

interface RateLimitStore {
  [key: string]: {
    count: number;
    resetTime: number;
  };
}

class RateLimiter {
  private store: RateLimitStore = {};
  private config: RateLimitConfig;

  constructor(config: RateLimitConfig) {
    this.config = config;
    this.cleanup();
  }

  private getClientKey(req: Request): string {
    // Use IP address as default, but can be extended to use user ID for authenticated requests
    return req.ip || req.connection.remoteAddress || 'unknown';
  }

  private cleanup(): void {
    const now = Date.now();
    Object.keys(this.store).forEach(key => {
      if (this.store[key].resetTime < now) {
        delete this.store[key];
      }
    });
    
    // Run cleanup every minute
    setTimeout(() => this.cleanup(), 60000);
  }

  middleware() {
    return (req: Request, res: Response, next: NextFunction) => {
      const key = this.getClientKey(req);
      const now = Date.now();

      // Initialize or get existing record
      if (!this.store[key] || this.store[key].resetTime < now) {
        this.store[key] = {
          count: 0,
          resetTime: now + this.config.windowMs
        };
      }

      // Increment request count
      this.store[key].count++;

      // Check if limit exceeded
      if (this.store[key].count > this.config.maxRequests) {
        return res.status(this.config.statusCode).json({
          error: 'Rate limit exceeded',
          message: this.config.message,
          retryAfter: Math.ceil((this.store[key].resetTime - now) / 1000)
        });
      }

      // Add rate limit headers
      res.set({
        'X-RateLimit-Limit': this.config.maxRequests.toString(),
        'X-RateLimit-Remaining': Math.max(0, this.config.maxRequests - this.store[key].count).toString(),
        'X-RateLimit-Reset': new Date(this.store[key].resetTime).toISOString()
      });

      next();
    };
  }

  // Get current rate limit status for a client
  getStatus(clientKey: string) {
    const record = this.store[clientKey];
    if (!record) {
      return {
        remaining: this.config.maxRequests,
        resetTime: Date.now() + this.config.windowMs,
        limit: this.config.maxRequests
      };
    }

    return {
      remaining: Math.max(0, this.config.maxRequests - record.count),
      resetTime: record.resetTime,
      limit: this.config.maxRequests
    };
  }

  // Reset rate limit for a specific client (useful for admin operations)
  reset(clientKey: string): boolean {
    if (this.store[clientKey]) {
      delete this.store[clientKey];
      return true;
    }
    return false;
  }

  // Get statistics
  getStats() {
    const now = Date.now();
    const activeClients = Object.keys(this.store).filter(key => 
      this.store[key].resetTime > now
    ).length;

    return {
      activeClients,
      totalClients: Object.keys(this.store).length,
      windowMs: this.config.windowMs,
      maxRequests: this.config.maxRequests
    };
  }
}

// Create different rate limiters for different endpoints
export const generalRateLimiter = new RateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  maxRequests: 100,
  message: 'Too many requests from this IP, please try again later.',
  statusCode: 429
});

export const authRateLimiter = new RateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  maxRequests: 5,
  message: 'Too many authentication attempts, please try again later.',
  statusCode: 429
});

export const aiRateLimiter = new RateLimiter({
  windowMs: 60 * 1000, // 1 minute
  maxRequests: 10,
  message: 'AI processing rate limit exceeded, please try again later.',
  statusCode: 429
});

export const uploadRateLimiter = new RateLimiter({
  windowMs: 60 * 1000, // 1 minute
  maxRequests: 5,
  message: 'Too many upload attempts, please try again later.',
  statusCode: 429
});

// Middleware factory for different rate limits
export const createRateLimitMiddleware = (limiter: RateLimiter) => {
  return limiter.middleware();
};

// Admin endpoint to get rate limit statistics
export const getRateLimitStats = (req: Request, res: Response) => {
  res.json({
    general: generalRateLimiter.getStats(),
    auth: authRateLimiter.getStats(),
    ai: aiRateLimiter.getStats(),
    upload: uploadRateLimiter.getStats()
  });
};
