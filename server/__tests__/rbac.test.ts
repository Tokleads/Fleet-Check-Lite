import { describe, it, expect } from 'vitest';
import { UserRole, Permission, hasPermission, hasAnyPermission, hasAllPermissions } from '../../shared/rbac';

describe('RBAC System', () => {
  describe('Role Definitions', () => {
    it('should define all required roles', () => {
      expect(UserRole.ADMIN).toBe('ADMIN');
      expect(UserRole.TRANSPORT_MANAGER).toBe('TRANSPORT_MANAGER');
      expect(UserRole.DRIVER).toBe('DRIVER');
      expect(UserRole.MECHANIC).toBe('MECHANIC');
      expect(UserRole.AUDITOR).toBe('AUDITOR');
    });

    it('should have 5 distinct roles', () => {
      const roleValues = Object.values(UserRole);
      const uniqueRoles = new Set(roleValues);
      expect(uniqueRoles.size).toBe(5);
    });
  });

  describe('Permission Definitions', () => {
    it('should define inspection permissions', () => {
      expect(Permission.INSPECTION_VIEW_ALL).toBe('INSPECTION_VIEW_ALL');
      expect(Permission.INSPECTION_VIEW_OWN).toBe('INSPECTION_VIEW_OWN');
      expect(Permission.INSPECTION_CREATE).toBe('INSPECTION_CREATE');
    });

    it('should define defect permissions', () => {
      expect(Permission.DEFECT_VIEW_ALL).toBe('DEFECT_VIEW_ALL');
      expect(Permission.DEFECT_VIEW_ASSIGNED).toBe('DEFECT_VIEW_ASSIGNED');
      expect(Permission.DEFECT_CREATE).toBe('DEFECT_CREATE');
      expect(Permission.DEFECT_ASSIGN).toBe('DEFECT_ASSIGN');
      expect(Permission.DEFECT_VERIFY).toBe('DEFECT_VERIFY');
      expect(Permission.DEFECT_CLOSE).toBe('DEFECT_CLOSE');
    });

    it('should define user management permissions', () => {
      expect(Permission.USER_VIEW).toBe('USER_VIEW');
      expect(Permission.USER_CREATE).toBe('USER_CREATE');
      expect(Permission.USER_EDIT).toBe('USER_EDIT');
      expect(Permission.USER_DELETE).toBe('USER_DELETE');
      expect(Permission.USER_ASSIGN_ROLE).toBe('USER_ASSIGN_ROLE');
    });

    it('should define vehicle permissions', () => {
      expect(Permission.VEHICLE_VIEW).toBe('VEHICLE_VIEW');
      expect(Permission.VEHICLE_CREATE).toBe('VEHICLE_CREATE');
      expect(Permission.VEHICLE_EDIT).toBe('VEHICLE_EDIT');
      expect(Permission.VEHICLE_DELETE).toBe('VEHICLE_DELETE');
    });

    it('should define reminder permissions', () => {
      expect(Permission.REMINDER_VIEW).toBe('REMINDER_VIEW');
      expect(Permission.REMINDER_CREATE).toBe('REMINDER_CREATE');
      expect(Permission.REMINDER_EDIT).toBe('REMINDER_EDIT');
      expect(Permission.REMINDER_DELETE).toBe('REMINDER_DELETE');
    });

    it('should define report permissions', () => {
      expect(Permission.REPORT_VIEW).toBe('REPORT_VIEW');
      expect(Permission.REPORT_EXPORT).toBe('REPORT_EXPORT');
      expect(Permission.REPORT_SCHEDULE).toBe('REPORT_SCHEDULE');
    });

    it('should define audit log permissions', () => {
      expect(Permission.AUDIT_LOG_VIEW).toBe('AUDIT_LOG_VIEW');
      expect(Permission.AUDIT_LOG_EXPORT).toBe('AUDIT_LOG_EXPORT');
    });
  });

  describe('Admin Permissions', () => {
    const adminRole = 'ADMIN' as const;

    it('should have all inspection permissions', () => {
      expect(hasPermission(adminRole, Permission.INSPECTION_VIEW_ALL)).toBe(true);
      expect(hasPermission(adminRole, Permission.INSPECTION_APPROVE)).toBe(true);
    });

    it('should have all defect permissions', () => {
      expect(hasPermission(adminRole, Permission.DEFECT_VIEW_ALL)).toBe(true);
      expect(hasPermission(adminRole, Permission.DEFECT_ASSIGN)).toBe(true);
      expect(hasPermission(adminRole, Permission.DEFECT_VERIFY)).toBe(true);
      expect(hasPermission(adminRole, Permission.DEFECT_CLOSE)).toBe(true);
    });

    it('should have all user management permissions', () => {
      expect(hasPermission(adminRole, Permission.USER_VIEW)).toBe(true);
      expect(hasPermission(adminRole, Permission.USER_CREATE)).toBe(true);
      expect(hasPermission(adminRole, Permission.USER_DELETE)).toBe(true);
      expect(hasPermission(adminRole, Permission.USER_ASSIGN_ROLE)).toBe(true);
    });

    it('should have all vehicle permissions', () => {
      expect(hasPermission(adminRole, Permission.VEHICLE_VIEW)).toBe(true);
      expect(hasPermission(adminRole, Permission.VEHICLE_CREATE)).toBe(true);
      expect(hasPermission(adminRole, Permission.VEHICLE_DELETE)).toBe(true);
    });

    it('should have all reminder permissions', () => {
      expect(hasPermission(adminRole, Permission.REMINDER_VIEW)).toBe(true);
      expect(hasPermission(adminRole, Permission.REMINDER_CREATE)).toBe(true);
      expect(hasPermission(adminRole, Permission.REMINDER_DELETE)).toBe(true);
    });

    it('should have all report permissions', () => {
      expect(hasPermission(adminRole, Permission.REPORT_VIEW)).toBe(true);
      expect(hasPermission(adminRole, Permission.REPORT_EXPORT)).toBe(true);
      expect(hasPermission(adminRole, Permission.REPORT_SCHEDULE)).toBe(true);
    });

    it('should have audit log permissions', () => {
      expect(hasPermission(adminRole, Permission.AUDIT_LOG_VIEW)).toBe(true);
      expect(hasPermission(adminRole, Permission.AUDIT_LOG_EXPORT)).toBe(true);
    });
  });

  describe('Transport Manager Permissions', () => {
    const managerRole = 'TRANSPORT_MANAGER' as const;

    it('should have inspection view and management permissions', () => {
      expect(hasPermission(managerRole, Permission.INSPECTION_VIEW_ALL)).toBe(true);
      expect(hasPermission(managerRole, Permission.INSPECTION_APPROVE)).toBe(true);
    });

    it('should have defect management permissions', () => {
      expect(hasPermission(managerRole, Permission.DEFECT_VIEW_ALL)).toBe(true);
      expect(hasPermission(managerRole, Permission.DEFECT_ASSIGN)).toBe(true);
      expect(hasPermission(managerRole, Permission.DEFECT_VERIFY)).toBe(true);
    });

    it('should have vehicle management permissions', () => {
      expect(hasPermission(managerRole, Permission.VEHICLE_VIEW)).toBe(true);
      expect(hasPermission(managerRole, Permission.VEHICLE_CREATE)).toBe(true);
      expect(hasPermission(managerRole, Permission.VEHICLE_EDIT)).toBe(true);
    });

    it('should have reminder permissions', () => {
      expect(hasPermission(managerRole, Permission.REMINDER_VIEW)).toBe(true);
      expect(hasPermission(managerRole, Permission.REMINDER_CREATE)).toBe(true);
    });

    it('should have report permissions', () => {
      expect(hasPermission(managerRole, Permission.REPORT_VIEW)).toBe(true);
      expect(hasPermission(managerRole, Permission.REPORT_EXPORT)).toBe(true);
    });

    it('should NOT have user deletion permission', () => {
      expect(hasPermission(managerRole, Permission.USER_DELETE)).toBe(false);
    });

    it('should NOT have vehicle deletion permission', () => {
      expect(hasPermission(managerRole, Permission.VEHICLE_DELETE)).toBe(false);
    });
  });

  describe('Driver Permissions', () => {
    const driverRole = 'DRIVER' as const;

    it('should have own inspection permissions', () => {
      expect(hasPermission(driverRole, Permission.INSPECTION_VIEW_OWN)).toBe(true);
      expect(hasPermission(driverRole, Permission.INSPECTION_CREATE)).toBe(true);
    });

    it('should have defect creation permission', () => {
      expect(hasPermission(driverRole, Permission.DEFECT_CREATE)).toBe(true);
    });

    it('should have own timesheet permissions', () => {
      expect(hasPermission(driverRole, Permission.TIMESHEET_VIEW_OWN)).toBe(true);
      expect(hasPermission(driverRole, Permission.TIMESHEET_CLOCK_IN)).toBe(true);
      expect(hasPermission(driverRole, Permission.TIMESHEET_CLOCK_OUT)).toBe(true);
    });

    it('should NOT have inspection view all permission', () => {
      expect(hasPermission(driverRole, Permission.INSPECTION_VIEW_ALL)).toBe(false);
    });

    it('should NOT have defect assignment permission', () => {
      expect(hasPermission(driverRole, Permission.DEFECT_ASSIGN)).toBe(false);
    });

    it('should NOT have user management permissions', () => {
      expect(hasPermission(driverRole, Permission.USER_CREATE)).toBe(false);
      expect(hasPermission(driverRole, Permission.USER_DELETE)).toBe(false);
    });

    it('should NOT have vehicle management permissions', () => {
      expect(hasPermission(driverRole, Permission.VEHICLE_CREATE)).toBe(false);
      expect(hasPermission(driverRole, Permission.VEHICLE_DELETE)).toBe(false);
    });
  });

  describe('Mechanic Permissions', () => {
    const mechanicRole = 'MECHANIC' as const;

    it('should have assigned defect permissions', () => {
      expect(hasPermission(mechanicRole, Permission.DEFECT_VIEW_ASSIGNED)).toBe(true);
      expect(hasPermission(mechanicRole, Permission.RECTIFICATION_CREATE)).toBe(true);
      expect(hasPermission(mechanicRole, Permission.RECTIFICATION_UPDATE)).toBe(true);
      expect(hasPermission(mechanicRole, Permission.RECTIFICATION_COMPLETE)).toBe(true);
    });

    it('should have vehicle view permission', () => {
      expect(hasPermission(mechanicRole, Permission.VEHICLE_VIEW)).toBe(true);
    });

    it('should have parts management permission', () => {
      expect(hasPermission(mechanicRole, Permission.PARTS_MANAGE)).toBe(true);
    });

    it('should NOT have defect assignment permission', () => {
      expect(hasPermission(mechanicRole, Permission.DEFECT_ASSIGN)).toBe(false);
    });

    it('should NOT have defect verification permission', () => {
      expect(hasPermission(mechanicRole, Permission.DEFECT_VERIFY)).toBe(false);
    });

    it('should NOT have user management permissions', () => {
      expect(hasPermission(mechanicRole, Permission.USER_CREATE)).toBe(false);
    });
  });

  describe('Auditor Permissions', () => {
    const auditorRole = 'AUDITOR' as const;

    it('should have read-only inspection permissions', () => {
      expect(hasPermission(auditorRole, Permission.INSPECTION_VIEW_ALL)).toBe(true);
      expect(hasPermission(auditorRole, Permission.INSPECTION_CREATE)).toBe(false);
      expect(hasPermission(auditorRole, Permission.INSPECTION_APPROVE)).toBe(false);
    });

    it('should have read-only defect permissions', () => {
      expect(hasPermission(auditorRole, Permission.DEFECT_VIEW_ALL)).toBe(true);
      expect(hasPermission(auditorRole, Permission.DEFECT_ASSIGN)).toBe(false);
      expect(hasPermission(auditorRole, Permission.DEFECT_VERIFY)).toBe(false);
    });

    it('should have report permissions', () => {
      expect(hasPermission(auditorRole, Permission.REPORT_VIEW)).toBe(true);
      expect(hasPermission(auditorRole, Permission.REPORT_EXPORT)).toBe(true);
    });

    it('should have audit log permissions', () => {
      expect(hasPermission(auditorRole, Permission.AUDIT_LOG_VIEW)).toBe(true);
      expect(hasPermission(auditorRole, Permission.AUDIT_LOG_EXPORT)).toBe(true);
    });

    it('should have compliance report permissions', () => {
      expect(hasPermission(auditorRole, Permission.COMPLIANCE_REPORT_VIEW)).toBe(true);
      expect(hasPermission(auditorRole, Permission.COMPLIANCE_REPORT_EXPORT)).toBe(true);
    });

    it('should NOT have write permissions', () => {
      expect(hasPermission(auditorRole, Permission.INSPECTION_CREATE)).toBe(false);
      expect(hasPermission(auditorRole, Permission.DEFECT_CREATE)).toBe(false);
      expect(hasPermission(auditorRole, Permission.USER_CREATE)).toBe(false);
      expect(hasPermission(auditorRole, Permission.VEHICLE_CREATE)).toBe(false);
    });
  });

  describe('Permission Helper Functions', () => {
    it('should check if user has any of multiple permissions', () => {
      const driverRole = 'DRIVER' as const;
      const permissions = [
        Permission.INSPECTION_VIEW_ALL,
        Permission.INSPECTION_VIEW_OWN,
      ];

      expect(hasAnyPermission(driverRole, permissions)).toBe(true);
    });

    it('should check if user has all of multiple permissions', () => {
      const adminRole = 'ADMIN' as const;
      const permissions = [
        Permission.USER_CREATE,
        Permission.USER_EDIT,
        Permission.USER_DELETE,
      ];

      expect(hasAllPermissions(adminRole, permissions)).toBe(true);
    });

    it('should return false if user lacks any required permission', () => {
      const driverRole = 'DRIVER' as const;
      const permissions = [
        Permission.INSPECTION_CREATE,
        Permission.USER_CREATE, // Driver doesn't have this
      ];

      expect(hasAllPermissions(driverRole, permissions)).toBe(false);
    });
  });
});
