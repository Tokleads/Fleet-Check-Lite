import { storage } from "./storage";
import { Request } from "express";
import type { InsertAuditLog } from "@shared/schema";

export type AuditAction = 'LOGIN' | 'LOGOUT' | 'CREATE' | 'UPDATE' | 'DELETE' | 'VIEW' | 'EXPORT';
export type AuditEntity = 'USER' | 'VEHICLE' | 'INSPECTION' | 'DEFECT' | 'FUEL' | 'SETTINGS' | 'SESSION' | 'TRAILER' | 'DOCUMENT';

interface AuditLogParams {
  companyId: number;
  userId?: number | null;
  action: AuditAction;
  entity: AuditEntity;
  entityId?: number | null;
  details?: Record<string, unknown>;
  req?: Request;
}

function getClientIp(req?: Request): string | undefined {
  if (!req) return undefined;
  const forwarded = req.headers['x-forwarded-for'];
  if (forwarded) {
    return Array.isArray(forwarded) ? forwarded[0] : forwarded.split(',')[0].trim();
  }
  return req.socket?.remoteAddress || undefined;
}

function getUserAgent(req?: Request): string | undefined {
  if (!req) return undefined;
  return req.headers['user-agent'] || undefined;
}

export async function logAudit(params: AuditLogParams): Promise<void> {
  try {
    const log: InsertAuditLog = {
      companyId: params.companyId,
      userId: params.userId || null,
      action: params.action,
      entity: params.entity,
      entityId: params.entityId || null,
      details: params.details || null,
      ipAddress: getClientIp(params.req) || null,
      userAgent: getUserAgent(params.req) || null,
    };
    
    await storage.createAuditLog(log);
  } catch (error) {
    console.error("Failed to create audit log:", error);
  }
}

export function formatAuditAction(action: string): string {
  const actionLabels: Record<string, string> = {
    'LOGIN': 'Logged in',
    'LOGOUT': 'Logged out',
    'CREATE': 'Created',
    'UPDATE': 'Updated',
    'DELETE': 'Deleted',
    'VIEW': 'Viewed',
    'EXPORT': 'Exported',
  };
  return actionLabels[action] || action;
}

export function formatAuditEntity(entity: string): string {
  const entityLabels: Record<string, string> = {
    'USER': 'User',
    'VEHICLE': 'Vehicle',
    'INSPECTION': 'Inspection',
    'DEFECT': 'Defect',
    'FUEL': 'Fuel Entry',
    'SETTINGS': 'Settings',
    'SESSION': 'Session',
    'TRAILER': 'Trailer',
    'DOCUMENT': 'Document',
  };
  return entityLabels[entity] || entity;
}
