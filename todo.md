# Titan Fleet Dashboard - TODO

## Current Status
The project already has:
- [x] Basic manager dashboard with KPI cards
- [x] Inspections, defects, fuel log, fleet management
- [x] Settings page with team management
- [x] DVSA integration
- [x] PDF generation for inspections
- [x] Google Drive integration

## Dashboard Enhancements Needed

### Real-Time GPS Tracking & Map View
- [x] Add Google Maps integration to Dashboard
- [x] Create real-time driver location tracking system
- [x] Implement 5-minute GPS ping mechanism
- [x] Display driver locations on interactive map
- [x] Show driver speed and heading on map markers
- [x] Add driver status indicators (active, idle, stagnant)

### Geofencing System
- [x] Create geofence management interface
- [x] Add 3 depot locations (Head Office, Clay Lane, Woodlands)
- [x] Implement 250m radius detection logic
- [x] Build automatic timesheet creation on geofence entry
- [x] Build automatic timesheet closure on geofence exit
- [x] Calculate totalMinutes for completed timesheets

### Stagnation Alert System
- [x] Implement stagnation detection (30 min threshold)
- [x] Create stagnation alerts table/interface
- [x] Add red alert indicators on dashboard
- [x] Show stagnant drivers on map with warning markers
- [x] Build alert acknowledgment system
- [ ] Add resolution notes for stagnation incidents

### Timesheet Management
- [x] Create timesheet management page
- [x] Display active and completed timesheets
- [x] Show arrival/departure times per depot
- [x] Calculate duration automatically
- [x] Add manual timesheet override capability
- [x] Build timesheet history view

### Titan Command Broadcast System
- [x] Create Titan Command messaging interface
- [x] Implement broadcast to all drivers
- [x] Add individual driver messaging
- [x] Build notification priority system (low/normal/high/urgent)
- [ ] Create driver notification inbox
- [x] Add read/unread status tracking
- [ ] Implement push notification delivery

### CSV Export Features
- [x] Build CSV export for timesheets
- [x] Format with columns: Arrival, Departure, Depot Name, Duration
- [x] Add date range filter for exports
- [x] Include driver name and vehicle registration
- [x] Add export button to timesheet page

### Command Center Aesthetic
- [ ] Update color scheme to Navy/Slate/Titan Blue
- [ ] Enhance dashboard with command center styling
- [ ] Add real-time status indicators
- [ ] Improve map visualization with custom markers
- [ ] Add alert animations for stagnation warnings
- [ ] Implement dark theme for command center feel

### Backend API Endpoints
- [x] POST /api/driver/location - Submit GPS location
- [x] GET /api/manager/driver-locations/:companyId - Get all driver locations
- [x] POST /api/geofences - Create geofence
- [x] GET /api/geofences/:companyId - List geofences
- [x] PATCH /api/geofences/:id - Update geofence
- [x] GET /api/timesheets/:companyId - Get timesheets
- [x] POST /api/timesheets/export - Export timesheets as CSV
- [x] PATCH /api/timesheets/:id - Manual timesheet override
- [x] GET /api/stagnation-alerts/:companyId - Get stagnation alerts
- [x] PATCH /api/stagnation-alerts/:id - Acknowledge alert
- [x] POST /api/notifications/broadcast - Send broadcast message
- [x] POST /api/notifications/individual - Send individual message
- [x] GET /api/notifications/:driverId - Get driver notifications
- [x] PATCH /api/notifications/:id/read - Mark notification as read

### Testing
- [ ] Test GPS tracking accuracy
- [ ] Verify geofence detection at 250m radius
- [ ] Test stagnation alert triggering
- [ ] Validate timesheet auto-creation/closure
- [ ] Test CSV export format
- [ ] Verify broadcast messaging delivery
- [ ] Test mobile responsiveness


### Frontend Components (Storage System)
- [x] FileUpload.tsx - Drag-and-drop file upload component
- [x] FileViewer.tsx - File gallery with download/view functionality
- [x] storageApi.ts - API utilities for storage operations
- [ ] Integrate FileUpload into inspection creation flow
- [ ] Add FileViewer to inspection detail pages
- [ ] Test file upload/download end-to-end


## Timesheet & Clock-In System (Wage Invoice Generation)

### Database & Backend
- [x] Verify timesheets table exists in schema
- [x] Add clock-in/out API endpoints
- [x] Implement geofence detection logic
- [x] Add automatic timesheet creation on geofence entry
- [x] Add automatic timesheet closure on geofence exit
- [x] Calculate total hours worked
- [x] Add manual clock-in/out override
- [x] Build weekly timesheet aggregation
- [x] Create CSV export endpoint for wage invoices

### Driver Interface (Mobile)
- [x] Create driver clock-in/out page
- [x] Add GPS location capture
- [x] Show current shift status (clocked in/out)
- [x] Display current location and nearest depot
- [x] Add manual clock-in button (if not at depot)
- [x] Show today's hours worked
- [ ] Add shift history view

### Manager Dashboard
- [x] Create timesheet management page
- [x] Add weekly/monthly timesheet view
- [x] Show all driver hours in table format
- [x] Add date range filters
- [x] Display total hours per driver
- [x] Add CSV export button
- [x] Show active shifts (currently clocked in)
- [x] Add manual timesheet editing capability
- [x] Display overtime calculations (>40 hours/week)
- [x] Show real-time stats (active shifts, total hours, drivers, overtime)

### CSV Export Features
- [x] Generate CSV with columns: Driver, Date, Clock In, Clock Out, Depot, Total Hours, Break Time, Net Hours
- [x] Add weekly summary per driver
- [x] Include date range in export filename
- [x] Calculate overtime (>40 hours/week)
- [x] Calculate break time (30 mins for shifts >6 hours)
- [x] Calculate net hours (total - break time)
- [x] Add daily overtime (>8 hours/day)


## End-of-Shift Vehicle Check System

### Database Schema
- [x] Create `shift_checks` table for end-of-shift inspections
- [x] Create `shift_check_items` table for individual check items
- [x] Create `company_check_templates` table for configurable checklists
- [x] Add relationships to timesheets and vehicles
- [ ] Run database migration

### Check Items Required
- [ ] Cab cleanliness check (with photo)
- [ ] Number plate in driver door pocket (with photo)
- [ ] Mileage reading (numeric input + photo)
- [ ] Fuel level check (percentage + photo)
- [ ] AdBlue level check (percentage + photo)
- [ ] Fuel card present check (with photo)

### Driver Interface
- [x] Create end-of-shift checklist page
- [x] Add photo capture for each check item
- [x] Add numeric inputs for mileage, fuel, AdBlue
- [x] Add pass/fail toggle for each item
- [x] Show progress indicator (X of 6 complete)
- [x] Add notes field for each item
- [x] Implement form validation
- [x] Add submit button (disabled until all complete)

### Automatic Clock-Out Integration
- [x] Trigger clock-out when all checks completed
- [x] Link shift_check to timesheet
- [x] Calculate final shift duration
- [x] Update timesheet status to COMPLETED
- [x] Store departure GPS location
- [ ] Send confirmation to driver

### Manager Verification Dashboard
- [ ] Create shift checks review page
- [ ] Display all submitted checks with photos
- [ ] Add filtering by driver, date, status
- [ ] Show pass/fail status for each item
- [ ] Add manager approval/rejection workflow
- [ ] Flag incomplete or failed checks
- [ ] Export shift check reports

### Company Configuration
- [ ] Create check template management page
- [ ] Allow enabling/disabling specific checks per company
- [ ] Add custom check items per company
- [ ] Set pass/fail thresholds (e.g., fuel must be >25%)
- [ ] Configure photo requirements per check

### API Endpoints
- [x] POST /api/shift-checks - Create new shift check
- [x] POST /api/shift-checks/:id/item - Add check item with photo
- [x] POST /api/shift-checks/:id/complete - Complete and clock out
- [x] GET /api/shift-checks/:companyId - List all checks
- [x] GET /api/shift-checks/driver/:driverId - Driver's check history
- [ ] GET /api/company-check-templates/:companyId - Get template

### Storage Integration
- [x] Upload check photos to Object Storage
- [x] Link photos to shift_check_items
- [x] Apply 15-month retention to check photos
- [ ] Generate signed URLs for manager viewing


## Phase 2: Reminders & Compliance (Current)

### Reminder System
- [x] Create reminders table (type, vehicle_id, due_date, status, escalation_level)
- [x] Add reminder types (MOT, SERVICE, TACHO, INSURANCE, TAX, INSPECTION)
- [x] Build reminder management UI for managers
- [x] Implement background job for daily reminder checks
- [ ] Add email notification system using Resend (placeholder ready)
- [x] Create reminder dashboard with stats
- [x] Add reminder snooze/dismiss functionality
- [x] Implement reminder escalation (30/14/7/1 days before due date)
- [x] Add reminder history tracking
- [x] Add API routes for all reminder operations
- [ ] Test reminder notifications

### Compliance Reporting
- [ ] Install PDFKit for PDF generation
- [ ] Create PDF template for vehicle inspections
- [ ] Implement PDF export endpoint for inspections
- [ ] Build DVSA compliance report generator
- [ ] Add defect trend analysis report
- [ ] Create fleet utilization report
- [ ] Add driver performance report
- [ ] Implement report scheduling (weekly/monthly email)
- [ ] Add report history and download
- [ ] Test all report types

### GDPR Features
- [ ] Add data export functionality (JSON/CSV format)
- [ ] Implement user anonymization on account deletion
- [ ] Create privacy policy page
- [ ] Add terms of service page
- [ ] Implement cookie consent banner
- [ ] Add data retention policy enforcement
- [ ] Create GDPR admin dashboard
- [ ] Add right-to-be-forgotten workflow
- [ ] Test GDPR compliance features


## Phase 3: Security & Testing (Production Hardening)

### Testing Suite
- [ ] Set up Vitest testing framework
- [ ] Write unit tests for all services (reminderService, pdfService, gdprService, auditService)
- [ ] Write unit tests for RBAC permissions
- [ ] Write integration tests for API endpoints
- [ ] Write E2E tests for critical user flows
- [ ] Add test coverage reporting
- [ ] Set up CI/CD pipeline for automated testing
- [ ] Achieve 80%+ code coverage

### Security Hardening
- [ ] Implement rate limiting on all API endpoints
- [ ] Add input validation with Zod schemas
- [ ] Sanitize user inputs to prevent XSS
- [ ] Implement SQL injection prevention
- [ ] Add CSRF protection
- [ ] Implement secure session management
- [ ] Add helmet.js for security headers
- [ ] Implement API authentication tokens
- [ ] Add brute force protection for login
- [ ] Conduct OWASP Top 10 audit
- [ ] Implement content security policy (CSP)
- [ ] Add secure file upload validation

### Error Handling
- [ ] Implement global error handler
- [ ] Add user-friendly error messages
- [ ] Implement error logging service
- [ ] Add retry logic for failed operations
- [ ] Implement graceful degradation
- [ ] Add validation error messages
- [ ] Implement API error responses standardization
- [ ] Add frontend error boundaries
- [ ] Implement offline error handling

### Performance Optimization
- [ ] Add database indexes for frequently queried fields
- [ ] Implement query optimization
- [ ] Add Redis caching for frequently accessed data
- [ ] Implement pagination for large lists
- [ ] Optimize PDF generation performance
- [ ] Add lazy loading for images
- [ ] Implement code splitting
- [ ] Optimize bundle size
- [ ] Add performance monitoring
- [ ] Implement database connection pooling
