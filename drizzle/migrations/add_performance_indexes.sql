-- Performance Optimization Indexes for Titan Fleet
-- Created: 2026-01-29
-- Purpose: Improve query performance for frequently accessed data

-- ============================================================================
-- Inspections Table Indexes
-- ============================================================================

-- Index for vehicle inspections lookup
CREATE INDEX IF NOT EXISTS idx_inspections_vehicle_id 
ON inspections(vehicle_id);

-- Index for driver inspections lookup
CREATE INDEX IF NOT EXISTS idx_inspections_driver_id 
ON inspections(driver_id);

-- Index for company inspections lookup
CREATE INDEX IF NOT EXISTS idx_inspections_company_id 
ON inspections(company_id);

-- Composite index for date range queries
CREATE INDEX IF NOT EXISTS idx_inspections_company_created 
ON inspections(company_id, created_at DESC);

-- Index for status filtering
CREATE INDEX IF NOT EXISTS idx_inspections_status 
ON inspections(status);

-- ============================================================================
-- Defects Table Indexes
-- ============================================================================

-- Index for vehicle defects lookup
CREATE INDEX IF NOT EXISTS idx_defects_vehicle_id 
ON defects(vehicle_id);

-- Index for assigned mechanic lookup
CREATE INDEX IF NOT EXISTS idx_defects_assigned_to 
ON defects(assigned_to) WHERE assigned_to IS NOT NULL;

-- Index for defect status filtering
CREATE INDEX IF NOT EXISTS idx_defects_status 
ON defects(status);

-- Index for severity filtering
CREATE INDEX IF NOT EXISTS idx_defects_severity 
ON defects(severity);

-- Composite index for company and status
CREATE INDEX IF NOT EXISTS idx_defects_company_status 
ON defects(company_id, status);

-- Index for reporter lookup
CREATE INDEX IF NOT EXISTS idx_defects_reported_by 
ON defects(reported_by);

-- ============================================================================
-- Timesheets Table Indexes
-- ============================================================================

-- Index for driver timesheets lookup
CREATE INDEX IF NOT EXISTS idx_timesheets_driver_id 
ON timesheets(driver_id);

-- Index for company timesheets lookup
CREATE INDEX IF NOT EXISTS idx_timesheets_company_id 
ON timesheets(company_id);

-- Index for vehicle timesheets lookup
CREATE INDEX IF NOT EXISTS idx_timesheets_vehicle_id 
ON timesheets(vehicle_id);

-- Composite index for date range queries
CREATE INDEX IF NOT EXISTS idx_timesheets_company_clock_in 
ON timesheets(company_id, clock_in DESC);

-- Index for status filtering
CREATE INDEX IF NOT EXISTS idx_timesheets_status 
ON timesheets(status);

-- Index for active timesheets (no clock out)
CREATE INDEX IF NOT EXISTS idx_timesheets_active 
ON timesheets(driver_id, clock_out) WHERE clock_out IS NULL;

-- ============================================================================
-- Reminders Table Indexes
-- ============================================================================

-- Index for vehicle reminders lookup
CREATE INDEX IF NOT EXISTS idx_reminders_vehicle_id 
ON reminders(vehicle_id);

-- Index for company reminders lookup
CREATE INDEX IF NOT EXISTS idx_reminders_company_id 
ON reminders(company_id);

-- Index for due date queries
CREATE INDEX IF NOT EXISTS idx_reminders_due_date 
ON reminders(due_date);

-- Composite index for active reminders by due date
CREATE INDEX IF NOT EXISTS idx_reminders_status_due 
ON reminders(status, due_date) WHERE status = 'ACTIVE';

-- Index for reminder type filtering
CREATE INDEX IF NOT EXISTS idx_reminders_type 
ON reminders(type);

-- ============================================================================
-- Audit Logs Table Indexes
-- ============================================================================

-- Index for company audit logs lookup
CREATE INDEX IF NOT EXISTS idx_audit_logs_company_id 
ON audit_logs(company_id);

-- Index for user activity lookup
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id 
ON audit_logs(user_id);

-- Composite index for timestamp queries
CREATE INDEX IF NOT EXISTS idx_audit_logs_company_timestamp 
ON audit_logs(company_id, timestamp DESC);

-- Index for entity lookups
CREATE INDEX IF NOT EXISTS idx_audit_logs_entity 
ON audit_logs(entity_type, entity_id);

-- Index for action filtering
CREATE INDEX IF NOT EXISTS idx_audit_logs_action 
ON audit_logs(action);

-- ============================================================================
-- Vehicles Table Indexes
-- ============================================================================

-- Index for company vehicles lookup
CREATE INDEX IF NOT EXISTS idx_vehicles_company_id 
ON vehicles(company_id);

-- Index for registration lookup (unique searches)
CREATE INDEX IF NOT EXISTS idx_vehicles_registration 
ON vehicles(registration);

-- Index for status filtering
CREATE INDEX IF NOT EXISTS idx_vehicles_status 
ON vehicles(status);

-- Index for vehicle type filtering
CREATE INDEX IF NOT EXISTS idx_vehicles_type 
ON vehicles(type);

-- ============================================================================
-- Users Table Indexes
-- ============================================================================

-- Index for company users lookup
CREATE INDEX IF NOT EXISTS idx_users_company_id 
ON users(company_id);

-- Index for email lookup (unique searches)
CREATE INDEX IF NOT EXISTS idx_users_email 
ON users(email);

-- Index for role filtering
CREATE INDEX IF NOT EXISTS idx_users_role 
ON users(role);

-- Index for active users
CREATE INDEX IF NOT EXISTS idx_users_active 
ON users(is_active) WHERE is_active = true;

-- ============================================================================
-- Driver Locations Table Indexes
-- ============================================================================

-- Index for driver location history
CREATE INDEX IF NOT EXISTS idx_driver_locations_driver_id 
ON driver_locations(driver_id);

-- Index for vehicle location history
CREATE INDEX IF NOT EXISTS idx_driver_locations_vehicle_id 
ON driver_locations(vehicle_id);

-- Composite index for latest location queries
CREATE INDEX IF NOT EXISTS idx_driver_locations_driver_timestamp 
ON driver_locations(driver_id, timestamp DESC);

-- Spatial index for geofencing queries (if PostGIS is available)
-- CREATE INDEX IF NOT EXISTS idx_driver_locations_coords 
-- ON driver_locations USING GIST (ST_MakePoint(longitude, latitude));

-- ============================================================================
-- Geofences Table Indexes
-- ============================================================================

-- Index for company geofences lookup
CREATE INDEX IF NOT EXISTS idx_geofences_company_id 
ON geofences(company_id);

-- Index for active geofences
CREATE INDEX IF NOT EXISTS idx_geofences_active 
ON geofences(is_active) WHERE is_active = true;

-- Index for geofence type filtering
CREATE INDEX IF NOT EXISTS idx_geofences_type 
ON geofences(type);

-- ============================================================================
-- Rectifications Table Indexes
-- ============================================================================

-- Index for defect rectifications lookup
CREATE INDEX IF NOT EXISTS idx_rectifications_defect_id 
ON rectifications(defect_id);

-- Index for mechanic rectifications lookup
CREATE INDEX IF NOT EXISTS idx_rectifications_mechanic_id 
ON rectifications(mechanic_id);

-- Index for company rectifications lookup
CREATE INDEX IF NOT EXISTS idx_rectifications_company_id 
ON rectifications(company_id);

-- Index for status filtering
CREATE INDEX IF NOT EXISTS idx_rectifications_status 
ON rectifications(status);

-- ============================================================================
-- Notifications Table Indexes
-- ============================================================================

-- Index for user notifications lookup
CREATE INDEX IF NOT EXISTS idx_notifications_user_id 
ON notifications(user_id);

-- Index for company notifications lookup
CREATE INDEX IF NOT EXISTS idx_notifications_company_id 
ON notifications(company_id);

-- Index for unread notifications
CREATE INDEX IF NOT EXISTS idx_notifications_unread 
ON notifications(user_id, is_read) WHERE is_read = false;

-- Composite index for timestamp queries
CREATE INDEX IF NOT EXISTS idx_notifications_user_created 
ON notifications(user_id, created_at DESC);

-- ============================================================================
-- Storage Files Table Indexes
-- ============================================================================

-- Index for entity files lookup
CREATE INDEX IF NOT EXISTS idx_storage_files_entity 
ON storage_files(entity_type, entity_id);

-- Index for company files lookup
CREATE INDEX IF NOT EXISTS idx_storage_files_company_id 
ON storage_files(company_id);

-- Index for expiry date (for cleanup jobs)
CREATE INDEX IF NOT EXISTS idx_storage_files_expiry 
ON storage_files(expiry_date) WHERE expiry_date IS NOT NULL;

-- ============================================================================
-- Shift Checks Table Indexes
-- ============================================================================

-- Index for driver shift checks lookup
CREATE INDEX IF NOT EXISTS idx_shift_checks_driver_id 
ON shift_checks(driver_id);

-- Index for vehicle shift checks lookup
CREATE INDEX IF NOT EXISTS idx_shift_checks_vehicle_id 
ON shift_checks(vehicle_id);

-- Index for company shift checks lookup
CREATE INDEX IF NOT EXISTS idx_shift_checks_company_id 
ON shift_checks(company_id);

-- Composite index for date range queries
CREATE INDEX IF NOT EXISTS idx_shift_checks_company_created 
ON shift_checks(company_id, created_at DESC);

-- ============================================================================
-- Performance Statistics
-- ============================================================================

-- Analyze tables to update statistics for query planner
ANALYZE inspections;
ANALYZE defects;
ANALYZE timesheets;
ANALYZE reminders;
ANALYZE audit_logs;
ANALYZE vehicles;
ANALYZE users;
ANALYZE driver_locations;
ANALYZE geofences;
ANALYZE rectifications;
ANALYZE notifications;
ANALYZE storage_files;
ANALYZE shift_checks;

-- ============================================================================
-- Index Usage Monitoring
-- ============================================================================

-- To monitor index usage, run this query periodically:
-- SELECT 
--   schemaname,
--   tablename,
--   indexname,
--   idx_scan,
--   idx_tup_read,
--   idx_tup_fetch
-- FROM pg_stat_user_indexes
-- WHERE schemaname = 'public'
-- ORDER BY idx_scan DESC;

-- To find unused indexes:
-- SELECT 
--   schemaname,
--   tablename,
--   indexname
-- FROM pg_stat_user_indexes
-- WHERE idx_scan = 0
--   AND schemaname = 'public'
--   AND indexname NOT LIKE '%_pkey';
