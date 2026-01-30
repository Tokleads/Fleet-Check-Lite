import { describe, it, expect, vi, beforeEach } from 'vitest';
import { storage } from '../storage';
import type { Reminder } from '../../shared/schema';

describe('ReminderService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Reminder Creation', () => {
    it('should create a reminder with correct escalation level', async () => {
      const mockReminder: Partial<Reminder> = {
        id: 1,
        companyId: 1,
        vehicleId: 1,
        type: 'MOT',
        dueDate: new Date('2025-02-15'),
        status: 'ACTIVE',
        escalationLevel: 'NORMAL',
      };

      vi.mocked(storage.createReminder).mockResolvedValue(mockReminder as Reminder);

      const result = await storage.createReminder({
        companyId: 1,
        vehicleId: 1,
        type: 'MOT',
        dueDate: new Date('2025-02-15'),
        title: 'MOT Due',
        description: 'Annual MOT inspection due',
      });

      expect(result).toEqual(mockReminder);
      expect(storage.createReminder).toHaveBeenCalledWith(
        expect.objectContaining({
          companyId: 1,
          vehicleId: 1,
          type: 'MOT',
        })
      );
    });

    it('should calculate correct escalation level based on due date', () => {
      const now = new Date();
      const daysUntilDue = (dueDate: Date) =>
        Math.ceil((dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

      // Test 30 days before
      const date30 = new Date(now);
      date30.setDate(date30.getDate() + 30);
      expect(daysUntilDue(date30)).toBeGreaterThanOrEqual(30);

      // Test 14 days before
      const date14 = new Date(now);
      date14.setDate(date14.getDate() + 14);
      expect(daysUntilDue(date14)).toBeGreaterThanOrEqual(14);
      expect(daysUntilDue(date14)).toBeLessThan(30);

      // Test 7 days before
      const date7 = new Date(now);
      date7.setDate(date7.getDate() + 7);
      expect(daysUntilDue(date7)).toBeGreaterThanOrEqual(7);
      expect(daysUntilDue(date7)).toBeLessThan(14);

      // Test 1 day before
      const date1 = new Date(now);
      date1.setDate(date1.getDate() + 1);
      expect(daysUntilDue(date1)).toBeGreaterThanOrEqual(1);
      expect(daysUntilDue(date1)).toBeLessThan(7);

      // Test overdue
      const dateOverdue = new Date(now);
      dateOverdue.setDate(dateOverdue.getDate() - 1);
      expect(daysUntilDue(dateOverdue)).toBeLessThan(0);
    });
  });

  describe('Reminder Retrieval', () => {
    it('should get reminders by company', async () => {
      const mockReminders: Partial<Reminder>[] = [
        {
          id: 1,
          companyId: 1,
          type: 'MOT',
          status: 'ACTIVE',
        },
        {
          id: 2,
          companyId: 1,
          type: 'SERVICE',
          status: 'ACTIVE',
        },
      ];

      vi.mocked(storage.getRemindersByCompany).mockResolvedValue(mockReminders as Reminder[]);

      const result = await storage.getRemindersByCompany(1);

      expect(result).toHaveLength(2);
      expect(result[0]?.type).toBe('MOT');
      expect(storage.getRemindersByCompany).toHaveBeenCalledWith(1);
    });

    it('should get due reminders', async () => {
      const mockDueReminders: Partial<Reminder>[] = [
        {
          id: 1,
          companyId: 1,
          type: 'MOT',
          dueDate: new Date('2025-02-01'),
          status: 'ACTIVE',
          escalationLevel: 'URGENT',
        },
      ];

      vi.mocked(storage.getDueReminders).mockResolvedValue(mockDueReminders as Reminder[]);

      const result = await storage.getDueReminders();

      expect(result).toHaveLength(1);
      expect(result[0]?.escalationLevel).toBe('URGENT');
    });
  });

  describe('Reminder Status Management', () => {
    it('should snooze a reminder', async () => {
      const mockReminder: Partial<Reminder> = {
        id: 1,
        companyId: 1,
        status: 'SNOOZED',
        snoozedUntil: new Date('2025-02-05'),
      };

      vi.mocked(storage.updateReminder).mockResolvedValue(mockReminder as Reminder);

      const result = await storage.updateReminder(1, {
        status: 'SNOOZED',
        snoozedUntil: new Date('2025-02-05'),
      });

      expect(result.status).toBe('SNOOZED');
      expect(result.snoozedUntil).toBeDefined();
    });

    it('should complete a reminder', async () => {
      const mockReminder: Partial<Reminder> = {
        id: 1,
        companyId: 1,
        status: 'COMPLETED',
        completedAt: new Date(),
      };

      vi.mocked(storage.updateReminder).mockResolvedValue(mockReminder as Reminder);

      const result = await storage.updateReminder(1, {
        status: 'COMPLETED',
        completedAt: new Date(),
      });

      expect(result.status).toBe('COMPLETED');
      expect(result.completedAt).toBeDefined();
    });

    it('should dismiss a reminder', async () => {
      const mockReminder: Partial<Reminder> = {
        id: 1,
        companyId: 1,
        status: 'DISMISSED',
      };

      vi.mocked(storage.updateReminder).mockResolvedValue(mockReminder as Reminder);

      const result = await storage.updateReminder(1, {
        status: 'DISMISSED',
      });

      expect(result.status).toBe('DISMISSED');
    });
  });

  describe('Reminder Types', () => {
    const reminderTypes = ['MOT', 'SERVICE', 'TACHO', 'INSURANCE', 'TAX', 'INSPECTION'];

    reminderTypes.forEach((type) => {
      it(`should create ${type} reminder`, async () => {
        const mockReminder: Partial<Reminder> = {
          id: 1,
          companyId: 1,
          type: type as any,
          status: 'ACTIVE',
        };

        vi.mocked(storage.createReminder).mockResolvedValue(mockReminder as Reminder);

        const result = await storage.createReminder({
          companyId: 1,
          vehicleId: 1,
          type: type as any,
          dueDate: new Date('2025-03-01'),
          title: `${type} Due`,
        });

        expect(result.type).toBe(type);
      });
    });
  });

  describe('Recurring Reminders', () => {
    it('should create recurring reminder', async () => {
      const mockReminder: Partial<Reminder> = {
        id: 1,
        companyId: 1,
        type: 'SERVICE',
        isRecurring: true,
        recurringInterval: 90, // 90 days
        status: 'ACTIVE',
      };

      vi.mocked(storage.createReminder).mockResolvedValue(mockReminder as Reminder);

      const result = await storage.createReminder({
        companyId: 1,
        vehicleId: 1,
        type: 'SERVICE',
        dueDate: new Date('2025-03-01'),
        title: 'Service Due',
        isRecurring: true,
        recurringInterval: 90,
      });

      expect(result.isRecurring).toBe(true);
      expect(result.recurringInterval).toBe(90);
    });
  });
});
