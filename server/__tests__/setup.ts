import { vi } from 'vitest';

// Mock environment variables
process.env.DATABASE_URL = 'postgresql://test:test@localhost:5432/test';
process.env.NODE_ENV = 'test';

// Mock database connection
vi.mock('../storage', () => ({
  storage: {
    // User methods
    getUser: vi.fn(),
    updateUser: vi.fn(),
    getUsersByCompany: vi.fn(),
    
    // Reminder methods
    createReminder: vi.fn(),
    getReminder: vi.fn(),
    getRemindersByCompany: vi.fn(),
    updateReminder: vi.fn(),
    deleteReminder: vi.fn(),
    getDueReminders: vi.fn(),
    
    // Defect methods
    getDefect: vi.fn(),
    updateDefect: vi.fn(),
    getDefectsByReporter: vi.fn(),
    assignDefectToMechanic: vi.fn(),
    
    // Rectification methods
    createRectification: vi.fn(),
    getRectificationsByDefect: vi.fn(),
    
    // Audit log methods
    createAuditLog: vi.fn(),
    getAuditLogs: vi.fn(),
    verifyAuditLogIntegrity: vi.fn(),
    
    // Inspection methods
    getInspectionsByDriver: vi.fn(),
    
    // Timesheet methods
    getTimesheetsByDriver: vi.fn(),
    
    // Notification methods
    getNotificationsByUser: vi.fn(),
    
    // Shift check methods
    getShiftChecksByDriver: vi.fn(),
  },
}));

// Global test utilities
global.console = {
  ...console,
  error: vi.fn(), // Suppress error logs in tests
  warn: vi.fn(), // Suppress warning logs in tests
};
