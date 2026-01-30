/**
 * RBAC Middleware for Express
 * Enforces role-based access control on API endpoints
 */

import { Request, Response, NextFunction } from 'express';
import { hasPermission, hasAnyPermission, hasAllPermissions, Permission, UserRole } from '../shared/rbac';

/**
 * Extend Express Request to include user info
 */
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: number;
        companyId: number;
        email: string;
        name: string;
        role: UserRole;
      };
    }
  }
}

/**
 * Middleware to require authentication
 * Should be applied before any RBAC middleware
 */
export function requireAuth(req: Request, res: Response, next: NextFunction) {
  if (!req.user) {
    return res.status(401).json({
      error: 'Unauthorized',
      message: 'Authentication required'
    });
  }
  next();
}

/**
 * Middleware to require a specific permission
 * Usage: app.get('/api/users', requireAuth, requirePermission(Permission.USER_VIEW), handler)
 */
export function requirePermission(permission: Permission) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'Authentication required'
      });
    }

    if (!hasPermission(req.user.role, permission)) {
      return res.status(403).json({
        error: 'Forbidden',
        message: `You do not have permission to perform this action. Required: ${permission}`,
        requiredPermission: permission,
        userRole: req.user.role
      });
    }

    next();
  };
}

/**
 * Middleware to require any of the specified permissions
 * Usage: app.get('/api/defects', requireAuth, requireAnyPermission([Permission.DEFECT_VIEW_OWN, Permission.DEFECT_VIEW_ALL]), handler)
 */
export function requireAnyPermission(permissions: Permission[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'Authentication required'
      });
    }

    if (!hasAnyPermission(req.user.role, permissions)) {
      return res.status(403).json({
        error: 'Forbidden',
        message: `You do not have permission to perform this action. Required: one of ${permissions.join(', ')}`,
        requiredPermissions: permissions,
        userRole: req.user.role
      });
    }

    next();
  };
}

/**
 * Middleware to require all of the specified permissions
 * Usage: app.post('/api/defects/verify', requireAuth, requireAllPermissions([Permission.DEFECT_VIEW_ALL, Permission.DEFECT_VERIFY]), handler)
 */
export function requireAllPermissions(permissions: Permission[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'Authentication required'
      });
    }

    if (!hasAllPermissions(req.user.role, permissions)) {
      return res.status(403).json({
        error: 'Forbidden',
        message: `You do not have permission to perform this action. Required: all of ${permissions.join(', ')}`,
        requiredPermissions: permissions,
        userRole: req.user.role
      });
    }

    next();
  };
}

/**
 * Middleware to require a specific role
 * Usage: app.get('/api/admin/settings', requireAuth, requireRole(UserRole.ADMIN), handler)
 */
export function requireRole(role: UserRole) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'Authentication required'
      });
    }

    if (req.user.role !== role) {
      return res.status(403).json({
        error: 'Forbidden',
        message: `This action requires ${role} role`,
        requiredRole: role,
        userRole: req.user.role
      });
    }

    next();
  };
}

/**
 * Middleware to require any of the specified roles
 * Usage: app.get('/api/management', requireAuth, requireAnyRole([UserRole.ADMIN, UserRole.TRANSPORT_MANAGER]), handler)
 */
export function requireAnyRole(roles: UserRole[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'Authentication required'
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        error: 'Forbidden',
        message: `This action requires one of these roles: ${roles.join(', ')}`,
        requiredRoles: roles,
        userRole: req.user.role
      });
    }

    next();
  };
}

/**
 * Helper to check if user owns a resource
 * Used for checking if a driver can view their own inspections/timesheets
 */
export function isResourceOwner(userId: number, resourceOwnerId: number): boolean {
  return userId === resourceOwnerId;
}

/**
 * Middleware factory for resource ownership checks
 * Usage: app.get('/api/timesheets/:id', requireAuth, requireResourceOwnership('driverId'), handler)
 */
export function requireResourceOwnership(ownerIdField: string) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'Authentication required'
      });
    }

    // Admin and Transport Manager can access all resources
    if (req.user.role === UserRole.ADMIN || req.user.role === UserRole.TRANSPORT_MANAGER) {
      return next();
    }

    // Check if user owns the resource
    const resourceOwnerId = req.params[ownerIdField] || req.body[ownerIdField];
    if (!resourceOwnerId || parseInt(resourceOwnerId) !== req.user.id) {
      return res.status(403).json({
        error: 'Forbidden',
        message: 'You can only access your own resources'
      });
    }

    next();
  };
}
