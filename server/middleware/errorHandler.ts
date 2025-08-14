import { Request, Response, NextFunction } from 'express';

export interface AppError extends Error {
  statusCode?: number;
  isOperational?: boolean;
  code?: string;
  details?: any;
}

export class CustomError extends Error implements AppError {
  public statusCode: number;
  public isOperational: boolean;
  public code: string;
  public details?: any;

  constructor(message: string, statusCode: number = 500, code: string = 'INTERNAL_ERROR', details?: any) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;
    this.code = code;
    this.details = details;

    Error.captureStackTrace(this, this.constructor);
  }
}

export class ValidationError extends CustomError {
  constructor(message: string, details?: any) {
    super(message, 400, 'VALIDATION_ERROR', details);
  }
}

export class AuthenticationError extends CustomError {
  constructor(message: string = 'Authentication required') {
    super(message, 401, 'AUTHENTICATION_ERROR');
  }
}

export class AuthorizationError extends CustomError {
  constructor(message: string = 'Insufficient permissions') {
    super(message, 403, 'AUTHORIZATION_ERROR');
  }
}

export class NotFoundError extends CustomError {
  constructor(resource: string = 'Resource') {
    super(`${resource} not found`, 404, 'NOT_FOUND_ERROR');
  }
}

export class ConflictError extends CustomError {
  constructor(message: string, details?: any) {
    super(message, 409, 'CONFLICT_ERROR', details);
  }
}

export class RateLimitError extends CustomError {
  constructor(message: string = 'Rate limit exceeded') {
    super(message, 429, 'RATE_LIMIT_ERROR');
  }
}

export class AIProcessingError extends CustomError {
  constructor(message: string = 'AI processing failed', details?: any) {
    super(message, 500, 'AI_PROCESSING_ERROR', details);
  }
}

// Error logging function
const logError = (error: AppError, req: Request) => {
  const errorLog = {
    timestamp: new Date().toISOString(),
    method: req.method,
    url: req.url,
    ip: req.ip || req.connection.remoteAddress,
    userAgent: req.get('User-Agent'),
    userId: (req as any).user?.id,
    error: {
      message: error.message,
      stack: error.stack,
      code: error.code,
      statusCode: error.statusCode,
      details: error.details
    }
  };

  // In production, this would be sent to a logging service
  console.error('Error Log:', JSON.stringify(errorLog, null, 2));
};

// Error response formatter
const formatErrorResponse = (error: AppError, isDevelopment: boolean = false) => {
  const response: any = {
    error: {
      message: error.message,
      code: error.code || 'UNKNOWN_ERROR',
      statusCode: error.statusCode || 500
    }
  };

  // Add details in development or for operational errors
  if (isDevelopment || error.isOperational) {
    if (error.details) {
      response.error.details = error.details;
    }
    if (isDevelopment && error.stack) {
      response.error.stack = error.stack;
    }
  }

  // Add timestamp
  response.timestamp = new Date().toISOString();

  return response;
};

// Main error handling middleware
export const errorHandler = (isDevelopment: boolean = false) => {
  return (error: AppError, req: Request, res: Response, next: NextFunction) => {
    // Log the error
    logError(error, req);

    // Set default values if not provided
    const statusCode = error.statusCode || 500;
    const message = error.message || 'Internal Server Error';

    // Handle specific error types
    if (error.name === 'ValidationError') {
      return res.status(400).json(formatErrorResponse(new ValidationError(message, error.details), isDevelopment));
    }

    if (error.name === 'CastError') {
      return res.status(400).json(formatErrorResponse(new ValidationError('Invalid ID format'), isDevelopment));
    }

    if (error.name === 'MongoError' && (error as any).code === 11000) {
      return res.status(409).json(formatErrorResponse(new ConflictError('Duplicate entry found'), isDevelopment));
    }

    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json(formatErrorResponse(new AuthenticationError('Invalid token'), isDevelopment));
    }

    if (error.name === 'TokenExpiredError') {
      return res.status(401).json(formatErrorResponse(new AuthenticationError('Token expired'), isDevelopment));
    }

    // Handle AI-specific errors
    if (error.code === 'AI_PROCESSING_ERROR') {
      return res.status(500).json(formatErrorResponse(new AIProcessingError(message, error.details), isDevelopment));
    }

    // Handle rate limiting errors
    if (error.code === 'RATE_LIMIT_ERROR') {
      return res.status(429).json(formatErrorResponse(new RateLimitError(message), isDevelopment));
    }

    // Handle unknown errors
    const isOperational = error.isOperational || false;
    
    if (!isOperational) {
      // For non-operational errors, don't leak internal details
      return res.status(500).json(formatErrorResponse(new CustomError('Internal Server Error', 500, 'INTERNAL_ERROR'), isDevelopment));
    }

    // Return the error response
    res.status(statusCode).json(formatErrorResponse(error, isDevelopment));
  };
};

// Async error wrapper
export const asyncHandler = (fn: Function) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

// 404 handler
export const notFoundHandler = (req: Request, res: Response) => {
  const error = new NotFoundError(`Route ${req.method} ${req.url}`);
  res.status(404).json(formatErrorResponse(error, process.env.NODE_ENV === 'development'));
};

// Request validation middleware
export const validateRequest = (schema: any) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      const { error, value } = schema.validate(req.body, {
        abortEarly: false,
        stripUnknown: true
      });

      if (error) {
        const details = error.details.map((detail: any) => ({
          field: detail.path.join('.'),
          message: detail.message,
          value: detail.context?.value
        }));

        throw new ValidationError('Validation failed', details);
      }

      req.body = value;
      next();
    } catch (error) {
      next(error);
    }
  };
};

// Security headers middleware
export const securityHeaders = (req: Request, res: Response, next: NextFunction) => {
  // Prevent clickjacking
  res.setHeader('X-Frame-Options', 'DENY');
  
  // Prevent MIME type sniffing
  res.setHeader('X-Content-Type-Options', 'nosniff');
  
  // Enable XSS protection
  res.setHeader('X-XSS-Protection', '1; mode=block');
  
  // Strict transport security
  if (process.env.NODE_ENV === 'production') {
    res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  }
  
  // Content security policy
  res.setHeader('Content-Security-Policy', "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:;");
  
  next();
};

// Request logging middleware
export const requestLogger = (req: Request, res: Response, next: NextFunction) => {
  const start = Date.now();
  
  res.on('finish', () => {
    const duration = Date.now() - start;
    const logLevel = res.statusCode >= 400 ? 'error' : 'info';
    
    console[logLevel](`${req.method} ${req.url} ${res.statusCode} - ${duration}ms`);
  });
  
  next();
};
