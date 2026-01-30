# RBAC Routes Documentation

This document maps API endpoints to required permissions for implementing role-based access control.

## Authentication Strategy

All routes should use the `requireAuth` middleware to ensure the user is logged in.
Then apply specific permission checks based on the operation.

## Route Permission Mapping

### Company Management

| Method | Endpoint | Permission | Notes |
|--------|----------|------------|-------|
| GET | `/api/company/:code` | `COMPANY_VIEW` | Public for login, no auth needed |
| PATCH | `/api/company/:id` | `COMPANY_EDIT` | Admin only |

### User Management

| Method | Endpoint | Permission | Notes |
|--------|----------|------------|-------|
| GET | `/api/users` | `USER_VIEW` | List all users in company |
| POST | `/api/users` | `USER_CREATE` | Create new user |
| PATCH | `/api/users/:id` | `USER_EDIT` | Update user details |
| DELETE | `/api/users/:id` | `USER_DELETE` | Soft delete user |
| PATCH | `/api/users/:id/role` | `USER_ASSIGN_ROLE` | Change user role |

### Vehicle Management

| Method | Endpoint | Permission | Notes |
|--------|----------|------------|-------|
| GET | `/api/vehicles` | `VEHICLE_VIEW` | List all vehicles |
| GET | `/api/vehicles/search` | `VEHICLE_VIEW` | Search vehicles |
| GET | `/api/vehicles/recent` | `VEHICLE_VIEW` | Driver's recent vehicles |
| GET | `/api/vehicles/:id` | `VEHICLE_VIEW` | Get vehicle details |
| POST | `/api/vehicles` | `VEHICLE_CREATE` | Add new vehicle |
| PATCH | `/api/vehicles/:id` | `VEHICLE_EDIT` | Update vehicle |
| DELETE | `/api/vehicles/:id` | `VEHICLE_DELETE` | Remove vehicle |

### Inspections

| Method | Endpoint | Permission | Notes |
|--------|----------|------------|-------|
| GET | `/api/inspections` | `INSPECTION_VIEW_ALL` or `INSPECTION_VIEW_OWN` | Drivers see own, managers see all |
| GET | `/api/inspections/:id` | `INSPECTION_VIEW_ALL` or `INSPECTION_VIEW_OWN` | Check ownership |
| POST | `/api/inspections` | `INSPECTION_CREATE` | Drivers create inspections |
| PATCH | `/api/inspections/:id/approve` | `INSPECTION_APPROVE` | Managers approve |
| GET | `/api/inspections/:id/pdf` | `INSPECTION_VIEW_ALL` or `INSPECTION_VIEW_OWN` | Export PDF |

### Defects

| Method | Endpoint | Permission | Notes |
|--------|----------|------------|-------|
| GET | `/api/defects` | `DEFECT_VIEW_ALL`, `DEFECT_VIEW_OWN`, or `DEFECT_VIEW_ASSIGNED` | Role-based filtering |
| GET | `/api/defects/:id` | `DEFECT_VIEW_ALL`, `DEFECT_VIEW_OWN`, or `DEFECT_VIEW_ASSIGNED` | Check ownership/assignment |
| POST | `/api/defects` | `DEFECT_CREATE` | Drivers report defects |
| PATCH | `/api/defects/:id/assign` | `DEFECT_ASSIGN` | Managers assign to mechanics |
| PATCH | `/api/defects/:id/verify` | `DEFECT_VERIFY` | Managers verify fixes |
| PATCH | `/api/defects/:id/close` | `DEFECT_CLOSE` | Managers close defects |

### Rectifications (Mechanic Workflow)

| Method | Endpoint | Permission | Notes |
|--------|----------|------------|-------|
| GET | `/api/rectifications` | `DEFECT_VIEW_ASSIGNED` | Mechanics see assigned defects |
| POST | `/api/rectifications` | `RECTIFICATION_CREATE` | Start rectification work |
| PATCH | `/api/rectifications/:id` | `RECTIFICATION_UPDATE` | Update progress |
| PATCH | `/api/rectifications/:id/complete` | `RECTIFICATION_COMPLETE` | Mark as fixed |
| POST | `/api/rectifications/:id/parts` | `PARTS_MANAGE` | Add parts used |

### Timesheets

| Method | Endpoint | Permission | Notes |
|--------|----------|------------|-------|
| GET | `/api/timesheets` | `TIMESHEET_VIEW_ALL` or `TIMESHEET_VIEW_OWN` | Role-based filtering |
| POST | `/api/timesheets/clock-in` | `TIMESHEET_CLOCK_IN` | Drivers clock in |
| POST | `/api/timesheets/clock-out` | `TIMESHEET_CLOCK_OUT` | Drivers clock out |
| PATCH | `/api/timesheets/:id` | `TIMESHEET_EDIT` | Managers edit timesheets |
| POST | `/api/timesheets/export` | `TIMESHEET_EXPORT` | Export CSV for wages |

### Live Tracking & Geofences

| Method | Endpoint | Permission | Notes |
|--------|----------|------------|-------|
| GET | `/api/driver-locations/:companyId` | `LIVE_TRACKING_VIEW` | Managers see live locations |
| POST | `/api/driver/location` | No permission needed | Drivers submit GPS pings |
| GET | `/api/geofences/:companyId` | `GEOFENCE_MANAGE` | List geofences |
| POST | `/api/geofences` | `GEOFENCE_MANAGE` | Create geofence |
| PATCH | `/api/geofences/:id` | `GEOFENCE_MANAGE` | Update geofence |

### Notifications (Titan Command)

| Method | Endpoint | Permission | Notes |
|--------|----------|------------|-------|
| POST | `/api/notifications/broadcast` | `NOTIFICATION_BROADCAST` | Send to all drivers |
| POST | `/api/notifications/individual` | `NOTIFICATION_BROADCAST` | Send to one driver |
| GET | `/api/notifications/:driverId` | No permission needed | Drivers get own notifications |
| PATCH | `/api/notifications/:id/read` | No permission needed | Mark as read |

### Audit Logs

| Method | Endpoint | Permission | Notes |
|--------|----------|------------|-------|
| GET | `/api/audit-logs` | `AUDIT_LOG_VIEW` | View audit trail |
| GET | `/api/audit-logs/export` | `AUDIT_LOG_EXPORT` | Export audit logs |

### Reminders

| Method | Endpoint | Permission | Notes |
|--------|----------|------------|-------|
| GET | `/api/reminders` | `REMINDER_VIEW` | List reminders |
| POST | `/api/reminders` | `REMINDER_CREATE` | Create reminder |
| PATCH | `/api/reminders/:id` | `REMINDER_EDIT` | Update reminder |
| DELETE | `/api/reminders/:id` | `REMINDER_DELETE` | Delete reminder |

### Reports

| Method | Endpoint | Permission | Notes |
|--------|----------|------------|-------|
| GET | `/api/reports/compliance` | `COMPLIANCE_REPORT_VIEW` | DVSA compliance report |
| GET | `/api/reports/compliance/export` | `COMPLIANCE_REPORT_EXPORT` | Export compliance report |
| GET | `/api/reports/:type` | `REPORT_VIEW` | Generic reports |
| POST | `/api/reports/:type/export` | `REPORT_EXPORT` | Export reports |

### Settings

| Method | Endpoint | Permission | Notes |
|--------|----------|------------|-------|
| GET | `/api/settings` | `SETTINGS_VIEW` | View company settings |
| PATCH | `/api/settings` | `SETTINGS_EDIT` | Update settings |

### Shift Checks (End-of-Shift)

| Method | Endpoint | Permission | Notes |
|--------|----------|------------|-------|
| POST | `/api/shift-checks` | `INSPECTION_CREATE` | Drivers create shift checks |
| POST | `/api/shift-checks/:id/item` | `INSPECTION_CREATE` | Add check item |
| POST | `/api/shift-checks/:id/complete` | `INSPECTION_CREATE` | Complete & clock out |
| GET | `/api/shift-checks/:companyId` | `INSPECTION_VIEW_ALL` | Managers view all checks |
| GET | `/api/shift-checks/driver/:driverId` | `INSPECTION_VIEW_OWN` | Drivers view own checks |

## Implementation Priority

### Phase 1: Critical Endpoints (Immediate)
1. User management endpoints (prevent unauthorized role changes)
2. Defect assignment/verification (ensure proper workflow)
3. Timesheet editing (prevent unauthorized changes)
4. Settings management (protect company config)

### Phase 2: Operational Endpoints (Week 1)
1. Vehicle management
2. Inspection approval
3. Geofence management
4. Notification broadcasting

### Phase 3: Reporting & Audit (Week 2)
1. Audit log access
2. Compliance reports
3. Data exports

## Example Implementation

```typescript
import { requireAuth, requirePermission, requireAnyPermission } from './rbacMiddleware';
import { Permission } from '../shared/rbac';

// User management - Admin/Manager only
app.post("/api/users", 
  requireAuth, 
  requirePermission(Permission.USER_CREATE), 
  async (req, res) => {
    // Handler code
  }
);

// Defect viewing - Drivers see own, Managers/Mechanics see all
app.get("/api/defects", 
  requireAuth, 
  requireAnyPermission([
    Permission.DEFECT_VIEW_ALL,
    Permission.DEFECT_VIEW_OWN,
    Permission.DEFECT_VIEW_ASSIGNED
  ]), 
  async (req, res) => {
    // Filter based on user role
    if (req.user.role === 'DRIVER') {
      // Return only defects created by this driver
    } else if (req.user.role === 'MECHANIC') {
      // Return only defects assigned to this mechanic
    } else {
      // Return all defects
    }
  }
);

// Defect assignment - Manager only
app.patch("/api/defects/:id/assign", 
  requireAuth, 
  requirePermission(Permission.DEFECT_ASSIGN), 
  async (req, res) => {
    // Handler code
  }
);
```

## Testing RBAC

### Test Cases
1. **Driver tries to assign defect** → 403 Forbidden
2. **Mechanic tries to create user** → 403 Forbidden
3. **Auditor tries to edit timesheet** → 403 Forbidden
4. **Driver views own inspection** → 200 OK
5. **Driver views another driver's inspection** → 403 Forbidden
6. **Manager views any inspection** → 200 OK
7. **Admin performs any action** → 200 OK

### Test Script
```bash
# Test as driver
curl -H "Authorization: Bearer DRIVER_TOKEN" \
  -X PATCH http://localhost:3000/api/defects/1/assign
# Expected: 403 Forbidden

# Test as manager
curl -H "Authorization: Bearer MANAGER_TOKEN" \
  -X PATCH http://localhost:3000/api/defects/1/assign \
  -d '{"mechanicId": 5}'
# Expected: 200 OK
```

## Migration Strategy

1. **Add requireAuth to all routes** (no breaking changes)
2. **Apply permission checks to critical endpoints** (Phase 1)
3. **Test with all 5 roles**
4. **Gradually add permissions to remaining endpoints**
5. **Monitor 403 errors in production** (adjust permissions if needed)

## Notes

- **Backward Compatibility**: Existing routes without RBAC will still work, but won't enforce permissions
- **Gradual Rollout**: Apply RBAC incrementally to avoid breaking existing functionality
- **Error Handling**: All permission denials return 403 with clear error messages
- **Audit Trail**: Log all permission denials for security monitoring
