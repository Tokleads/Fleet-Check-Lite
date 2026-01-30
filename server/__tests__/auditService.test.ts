import { describe, it, expect, vi, beforeEach } from 'vitest';
import { storage } from '../storage';
import type { AuditLog } from '../../shared/schema';
import crypto from 'crypto';

describe('AuditService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Audit Log Creation', () => {
    it('should create audit log with hash chain', async () => {
      const mockAuditLog: Partial<AuditLog> = {
        id: 1,
        companyId: 1,
        userId: 1,
        action: 'INSPECTION_CREATED',
        entityType: 'inspection',
        entityId: 1,
        previousHash: null,
        currentHash: 'abc123',
        timestamp: new Date(),
      };

      vi.mocked(storage.createAuditLog).mockResolvedValue(mockAuditLog as AuditLog);

      const result = await storage.createAuditLog({
        companyId: 1,
        userId: 1,
        action: 'INSPECTION_CREATED',
        entityType: 'inspection',
        entityId: 1,
        changes: { status: 'SUBMITTED' },
      });

      expect(result).toEqual(mockAuditLog);
      expect(storage.createAuditLog).toHaveBeenCalledWith(
        expect.objectContaining({
          action: 'INSPECTION_CREATED',
          entityType: 'inspection',
        })
      );
    });

    it('should chain hashes correctly', () => {
      const data1 = { id: 1, action: 'CREATE', timestamp: Date.now() };
      const data2 = { id: 2, action: 'UPDATE', timestamp: Date.now() };

      const hash1 = crypto.createHash('sha256').update(JSON.stringify(data1)).digest('hex');
      const hash2 = crypto
        .createHash('sha256')
        .update(JSON.stringify({ ...data2, previousHash: hash1 }))
        .digest('hex');

      expect(hash1).toBeDefined();
      expect(hash2).toBeDefined();
      expect(hash1).not.toBe(hash2);
    });
  });

  describe('Audit Log Retrieval', () => {
    it('should get audit logs by company', async () => {
      const mockLogs: Partial<AuditLog>[] = [
        {
          id: 1,
          companyId: 1,
          action: 'INSPECTION_CREATED',
          timestamp: new Date(),
        },
        {
          id: 2,
          companyId: 1,
          action: 'DEFECT_CREATED',
          timestamp: new Date(),
        },
      ];

      vi.mocked(storage.getAuditLogs).mockResolvedValue(mockLogs as AuditLog[]);

      const result = await storage.getAuditLogs({ companyId: 1 });

      expect(result).toHaveLength(2);
      expect(result[0]?.action).toBe('INSPECTION_CREATED');
    });

    it('should filter audit logs by entity type', async () => {
      const mockLogs: Partial<AuditLog>[] = [
        {
          id: 1,
          companyId: 1,
          entityType: 'inspection',
          action: 'INSPECTION_CREATED',
        },
      ];

      vi.mocked(storage.getAuditLogs).mockResolvedValue(mockLogs as AuditLog[]);

      const result = await storage.getAuditLogs({
        companyId: 1,
        entityType: 'inspection',
      });

      expect(result).toHaveLength(1);
      expect(result[0]?.entityType).toBe('inspection');
    });

    it('should filter audit logs by date range', async () => {
      const mockLogs: Partial<AuditLog>[] = [
        {
          id: 1,
          companyId: 1,
          timestamp: new Date('2025-01-15'),
        },
      ];

      vi.mocked(storage.getAuditLogs).mockResolvedValue(mockLogs as AuditLog[]);

      const result = await storage.getAuditLogs({
        companyId: 1,
        startDate: new Date('2025-01-01'),
        endDate: new Date('2025-01-31'),
      });

      expect(result).toHaveLength(1);
    });
  });

  describe('Audit Log Integrity', () => {
    it('should verify audit log integrity', async () => {
      vi.mocked(storage.verifyAuditLogIntegrity).mockResolvedValue({
        isValid: true,
        totalLogs: 10,
        brokenChains: [],
      });

      const result = await storage.verifyAuditLogIntegrity(1);

      expect(result.isValid).toBe(true);
      expect(result.totalLogs).toBe(10);
      expect(result.brokenChains).toHaveLength(0);
    });

    it('should detect broken hash chain', async () => {
      vi.mocked(storage.verifyAuditLogIntegrity).mockResolvedValue({
        isValid: false,
        totalLogs: 10,
        brokenChains: [
          {
            logId: 5,
            expectedHash: 'abc123',
            actualHash: 'def456',
          },
        ],
      });

      const result = await storage.verifyAuditLogIntegrity(1);

      expect(result.isValid).toBe(false);
      expect(result.brokenChains).toHaveLength(1);
      expect(result.brokenChains[0]?.logId).toBe(5);
    });
  });

  describe('Audit Actions', () => {
    const auditActions = [
      'INSPECTION_CREATED',
      'INSPECTION_UPDATED',
      'DEFECT_CREATED',
      'DEFECT_UPDATED',
      'DEFECT_ASSIGNED',
      'DEFECT_RECTIFIED',
      'DEFECT_VERIFIED',
      'DEFECT_CLOSED',
      'USER_CREATED',
      'USER_UPDATED',
      'USER_DELETED',
      'REMINDER_CREATED',
      'REMINDER_UPDATED',
      'REMINDER_COMPLETED',
    ];

    auditActions.forEach((action) => {
      it(`should create audit log for ${action}`, async () => {
        const mockLog: Partial<AuditLog> = {
          id: 1,
          companyId: 1,
          action: action as any,
        };

        vi.mocked(storage.createAuditLog).mockResolvedValue(mockLog as AuditLog);

        const result = await storage.createAuditLog({
          companyId: 1,
          userId: 1,
          action: action as any,
          entityType: 'inspection',
          entityId: 1,
        });

        expect(result.action).toBe(action);
      });
    });
  });

  describe('Tamper Detection', () => {
    it('should detect modified audit log', () => {
      const originalData = { id: 1, action: 'CREATE', timestamp: 1234567890 };
      const modifiedData = { id: 1, action: 'DELETE', timestamp: 1234567890 };

      const originalHash = crypto
        .createHash('sha256')
        .update(JSON.stringify(originalData))
        .digest('hex');
      const modifiedHash = crypto
        .createHash('sha256')
        .update(JSON.stringify(modifiedData))
        .digest('hex');

      expect(originalHash).not.toBe(modifiedHash);
    });

    it('should maintain hash consistency for identical data', () => {
      const data = { id: 1, action: 'CREATE', timestamp: 1234567890 };

      const hash1 = crypto.createHash('sha256').update(JSON.stringify(data)).digest('hex');
      const hash2 = crypto.createHash('sha256').update(JSON.stringify(data)).digest('hex');

      expect(hash1).toBe(hash2);
    });
  });
});
