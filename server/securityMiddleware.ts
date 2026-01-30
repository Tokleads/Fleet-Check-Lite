/**
 * Security Middleware
 * Implements OWASP Top 10 protections and security best practices
 */

import helmet from 'helmet';
import type { Request, Response, NextFunction } from 'express';

/**
 * Helmet configuration for security headers
 * Protects against common web vulnerabilities
 */
export const helmetConfig = helmet({
  // Content Security Policy
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"], // Needed for React
      styleSrc: ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
      fontSrc: ["'self'", 'https://fonts.gstatic.com'],
      imgSrc: ["'self'", 'data:', 'https:', 'blob:'],
      connectSrc: ["'self'", 'https://storage.googleapis.com'],
      frameSrc: ["'none'"],
      objectSrc: ["'none'"],
      upgradeInsecureRequests: [],
    },
  },
  
  // Strict Transport Security (HSTS)
  hsts: {
    maxAge: 31536000, // 1 year
    includeSubDomains: true,
    preload: true,
  },
  
  // Prevent clickjacking
  frameguard: {
    action: 'deny',
  },
  
  // Prevent MIME type sniffing
  noSniff: true,
  
  // XSS Protection
  xssFilter: true,
  
  // Hide X-Powered-By header
  hidePoweredBy: true,
  
  // Referrer Policy
  referrerPolicy: {
    policy: 'strict-origin-when-cross-origin',
  },
});

/**
 * CORS configuration
 * Restricts cross-origin requests to trusted domains
 */
export const corsConfig = {
  origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
    // Allow requests with no origin (mobile apps, Postman, etc.)
    if (!origin) {
      return callback(null, true);
    }
    
    // In production, restrict to your domain
    const allowedOrigins = [
      'http://localhost:5000',
      'http://localhost:3000',
      process.env.FRONTEND_URL,
    ].filter(Boolean);
    
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  maxAge: 86400, // 24 hours
};

/**
 * Input sanitization middleware
 * Removes potentially dangerous characters from user input
 */
export const sanitizeInput = (req: Request, res: Response, next: NextFunction) => {
  const sanitize = (obj: any): any => {
    if (typeof obj === 'string') {
      // Remove null bytes
      obj = obj.replace(/\0/g, '');
      
      // Remove control characters except newline and tab
      obj = obj.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '');
      
      return obj;
    }
    
    if (Array.isArray(obj)) {
      return obj.map(sanitize);
    }
    
    if (obj !== null && typeof obj === 'object') {
      const sanitized: any = {};
      for (const key in obj) {
        if (Object.prototype.hasOwnProperty.call(obj, key)) {
          sanitized[key] = sanitize(obj[key]);
        }
      }
      return sanitized;
    }
    
    return obj;
  };
  
  if (req.body) {
    req.body = sanitize(req.body);
  }
  
  if (req.query) {
    req.query = sanitize(req.query);
  }
  
  if (req.params) {
    req.params = sanitize(req.params);
  }
  
  next();
};

/**
 * SQL Injection protection middleware
 * Validates that IDs are integers (Drizzle ORM provides additional protection)
 */
export const validateIds = (req: Request, res: Response, next: NextFunction) => {
  const checkId = (value: any, name: string): boolean => {
    if (value === undefined) return true; // Optional parameter
    
    const id = parseInt(value, 10);
    if (isNaN(id) || id <= 0 || id.toString() !== value.toString()) {
      res.status(400).json({
        error: 'Invalid ID',
        message: `${name} must be a positive integer`,
      });
      return false;
    }
    return true;
  };
  
  // Check common ID parameters
  const idParams = ['id', 'userId', 'vehicleId', 'inspectionId', 'defectId', 'companyId', 'driverId', 'mechanicId'];
  
  for (const param of idParams) {
    if (req.params[param] && !checkId(req.params[param], param)) {
      return;
    }
    if (req.query[param] && !checkId(req.query[param], param)) {
      return;
    }
    if (req.body && req.body[param] && !checkId(req.body[param], param)) {
      return;
    }
  }
  
  next();
};

/**
 * File upload validation middleware
 * Validates file type, size, and prevents malicious uploads
 */
export const validateFileUpload = (req: Request, res: Response, next: NextFunction) => {
  const file = (req as any).file;
  
  if (!file) {
    return next();
  }
  
  // Allowed MIME types
  const allowedMimeTypes = [
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/webp',
    'application/pdf',
  ];
  
  if (!allowedMimeTypes.includes(file.mimetype)) {
    return res.status(400).json({
      error: 'Invalid file type',
      message: 'Only JPEG, PNG, WebP, and PDF files are allowed',
    });
  }
  
  // Maximum file size: 50MB
  const maxSize = 50 * 1024 * 1024;
  if (file.size > maxSize) {
    return res.status(400).json({
      error: 'File too large',
      message: 'Maximum file size is 50MB',
    });
  }
  
  // Validate file extension matches MIME type
  const ext = file.originalname.split('.').pop()?.toLowerCase();
  const mimeToExt: Record<string, string[]> = {
    'image/jpeg': ['jpg', 'jpeg'],
    'image/png': ['png'],
    'image/webp': ['webp'],
    'application/pdf': ['pdf'],
  };
  
  const validExts = mimeToExt[file.mimetype];
  if (!validExts || !ext || !validExts.includes(ext)) {
    return res.status(400).json({
      error: 'File extension mismatch',
      message: 'File extension does not match file type',
    });
  }
  
  next();
};

/**
 * Request logging middleware for security monitoring
 */
export const securityLogger = (req: Request, res: Response, next: NextFunction) => {
  const start = Date.now();
  
  res.on('finish', () => {
    const duration = Date.now() - start;
    const user = (req as any).user;
    
    // Log suspicious activity
    if (res.statusCode === 401 || res.statusCode === 403) {
      console.warn('[SECURITY]', {
        timestamp: new Date().toISOString(),
        method: req.method,
        path: req.path,
        status: res.statusCode,
        ip: req.ip,
        userId: user?.id,
        userAgent: req.get('user-agent'),
        duration,
      });
    }
    
    // Log slow requests (potential DoS)
    if (duration > 5000) {
      console.warn('[PERFORMANCE]', {
        timestamp: new Date().toISOString(),
        method: req.method,
        path: req.path,
        duration,
        ip: req.ip,
        userId: user?.id,
      });
    }
  });
  
  next();
};

/**
 * Prevent parameter pollution
 * Ensures query parameters are not arrays when they shouldn't be
 */
export const preventParameterPollution = (req: Request, res: Response, next: NextFunction) => {
  const singleValueParams = ['id', 'page', 'limit', 'sortBy', 'sortOrder'];
  
  for (const param of singleValueParams) {
    if (Array.isArray(req.query[param])) {
      req.query[param] = req.query[param][0];
    }
  }
  
  next();
};

/**
 * CSRF protection for state-changing operations
 * Validates that requests come from the same origin
 */
export const csrfProtection = (req: Request, res: Response, next: NextFunction) => {
  // Skip CSRF for GET, HEAD, OPTIONS
  if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) {
    return next();
  }
  
  const origin = req.get('origin');
  const referer = req.get('referer');
  
  // In production, validate origin/referer
  if (process.env.NODE_ENV === 'production') {
    const allowedOrigins = [process.env.FRONTEND_URL, process.env.API_URL].filter(Boolean);
    
    if (!origin && !referer) {
      return res.status(403).json({
        error: 'Forbidden',
        message: 'Missing origin or referer header',
      });
    }
    
    const requestOrigin = origin || new URL(referer!).origin;
    if (!allowedOrigins.some(allowed => requestOrigin === allowed)) {
      return res.status(403).json({
        error: 'Forbidden',
        message: 'Invalid origin',
      });
    }
  }
  
  next();
};
