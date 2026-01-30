/**
 * Error Handling Middleware
 * Centralized error handling with proper logging and user-friendly messages
 */

import type { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';

/**
 * Custom error class for application errors
 */
export class AppError extends Error {
  constructor(
    public statusCode: number,
    public message: string,
    public isOperational: boolean = true,
    public details?: any
  ) {
    super(message);
    Object.setPrototypeOf(this, AppError.prototype);
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Error types for better categorization
 */
export enum ErrorType {
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  AUTHENTICATION_ERROR = 'AUTHENTICATION_ERROR',
  AUTHORIZATION_ERROR = 'AUTHORIZATION_ERROR',
  NOT_FOUND_ERROR = 'NOT_FOUND_ERROR',
  CONFLICT_ERROR = 'CONFLICT_ERROR',
  DATABASE_ERROR = 'DATABASE_ERROR',
  EXTERNAL_API_ERROR = 'EXTERNAL_API_ERROR',
  INTERNAL_ERROR = 'INTERNAL_ERROR',
}

/**
 * Structured error response
 */
interface ErrorResponse {
  error: {
    type: ErrorType;
    message: string;
    details?: any;
    timestamp: string;
    path: string;
    requestId?: string;
  };
}

/**
 * Log error with appropriate level
 */
const logError = (error: Error | AppError, req: Request) => {
  const errorLog = {
    timestamp: new Date().toISOString(),
    method: req.method,
    path: req.path,
    query: req.query,
    body: req.body,
    user: (req as any).user?.id,
    ip: req.ip,
    userAgent: req.get('user-agent'),
    error: {
      name: error.name,
      message: error.message,
      stack: error.stack,
    },
  };
  
  if (error instanceof AppError && error.statusCode < 500) {
    // Client errors (4xx) - log as warning
    console.warn('[CLIENT_ERROR]', errorLog);
  } else {
    // Server errors (5xx) - log as error
    console.error('[SERVER_ERROR]', errorLog);
  }
};

/**
 * Convert Zod validation errors to user-friendly format
 */
const formatZodError = (error: ZodError): { message: string; details: any } => {
  const details = error.errors.map(err => ({
    field: err.path.join('.'),
    message: err.message,
  }));
  
  return {
    message: 'Validation failed',
    details,
  };
};

/**
 * Main error handling middleware
 */
export const errorHandler = (
  err: Error | AppError,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // Log the error
  logError(err, req);
  
  // Default error response
  let statusCode = 500;
  let errorType = ErrorType.INTERNAL_ERROR;
  let message = 'An unexpected error occurred';
  let details: any = undefined;
  
  // Handle specific error types
  if (err instanceof AppError) {
    statusCode = err.statusCode;
    message = err.message;
    details = err.details;
    
    // Determine error type based on status code
    if (statusCode === 400) errorType = ErrorType.VALIDATION_ERROR;
    else if (statusCode === 401) errorType = ErrorType.AUTHENTICATION_ERROR;
    else if (statusCode === 403) errorType = ErrorType.AUTHORIZATION_ERROR;
    else if (statusCode === 404) errorType = ErrorType.NOT_FOUND_ERROR;
    else if (statusCode === 409) errorType = ErrorType.CONFLICT_ERROR;
  } else if (err instanceof ZodError) {
    // Zod validation errors
    statusCode = 400;
    errorType = ErrorType.VALIDATION_ERROR;
    const formatted = formatZodError(err);
    message = formatted.message;
    details = formatted.details;
  } else if (err.name === 'UnauthorizedError') {
    // JWT authentication errors
    statusCode = 401;
    errorType = ErrorType.AUTHENTICATION_ERROR;
    message = 'Invalid or expired token';
  } else if (err.name === 'JsonWebTokenError') {
    statusCode = 401;
    errorType = ErrorType.AUTHENTICATION_ERROR;
    message = 'Invalid token';
  } else if (err.name === 'TokenExpiredError') {
    statusCode = 401;
    errorType = ErrorType.AUTHENTICATION_ERROR;
    message = 'Token expired';
  } else if (err.message.includes('duplicate key')) {
    // Database unique constraint violations
    statusCode = 409;
    errorType = ErrorType.CONFLICT_ERROR;
    message = 'Resource already exists';
  } else if (err.message.includes('foreign key constraint')) {
    // Database foreign key violations
    statusCode = 400;
    errorType = ErrorType.VALIDATION_ERROR;
    message = 'Invalid reference to related resource';
  }
  
  // Build error response
  const errorResponse: ErrorResponse = {
    error: {
      type: errorType,
      message,
      details,
      timestamp: new Date().toISOString(),
      path: req.path,
    },
  };
  
  // Don't send stack trace in production
  if (process.env.NODE_ENV !== 'production') {
    (errorResponse.error as any).stack = err.stack;
  }
  
  res.status(statusCode).json(errorResponse);
};

/**
 * 404 handler for undefined routes
 */
export const notFoundHandler = (req: Request, res: Response) => {
  res.status(404).json({
    error: {
      type: ErrorType.NOT_FOUND_ERROR,
      message: 'Route not found',
      path: req.path,
      timestamp: new Date().toISOString(),
    },
  });
};

/**
 * Async error wrapper
 * Catches errors in async route handlers
 */
export const asyncHandler = (fn: Function) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

/**
 * Common error factories
 */
export const errors = {
  badRequest: (message: string, details?: any) => 
    new AppError(400, message, true, details),
  
  unauthorized: (message: string = 'Authentication required') => 
    new AppError(401, message, true),
  
  forbidden: (message: string = 'Insufficient permissions') => 
    new AppError(403, message, true),
  
  notFound: (resource: string = 'Resource') => 
    new AppError(404, `${resource} not found`, true),
  
  conflict: (message: string) => 
    new AppError(409, message, true),
  
  internal: (message: string = 'Internal server error') => 
    new AppError(500, message, false),
  
  serviceUnavailable: (service: string) => 
    new AppError(503, `${service} is temporarily unavailable`, true),
};

/**
 * Validation error helper
 */
export const validationError = (field: string, message: string) => {
  return new AppError(400, 'Validation failed', true, [{
    field,
    message,
  }]);
};
