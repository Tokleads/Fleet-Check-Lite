# Database Optimization Guide

## Overview
This document outlines the database optimization strategies implemented for Titan Fleet to ensure optimal performance at scale.

---

## Indexes Created

### Primary Indexes (60+ indexes)

#### Inspections (5 indexes)
- `idx_inspections_vehicle_id` - Vehicle lookup
- `idx_inspections_driver_id` - Driver lookup
- `idx_inspections_company_id` - Company lookup
- `idx_inspections_company_created` - Date range queries
- `idx_inspections_status` - Status filtering

#### Defects (6 indexes)
- `idx_defects_vehicle_id` - Vehicle lookup
- `idx_defects_assigned_to` - Mechanic assignment
- `idx_defects_status` - Status filtering
- `idx_defects_severity` - Severity filtering
- `idx_defects_company_status` - Composite company/status
- `idx_defects_reported_by` - Reporter lookup

#### Timesheets (6 indexes)
- `idx_timesheets_driver_id` - Driver lookup
- `idx_timesheets_company_id` - Company lookup
- `idx_timesheets_vehicle_id` - Vehicle lookup
- `idx_timesheets_company_clock_in` - Date range queries
- `idx_timesheets_status` - Status filtering
- `idx_timesheets_active` - Active timesheets (partial index)

#### Reminders (5 indexes)
- `idx_reminders_vehicle_id` - Vehicle lookup
- `idx_reminders_company_id` - Company lookup
- `idx_reminders_due_date` - Due date queries
- `idx_reminders_status_due` - Active reminders (partial index)
- `idx_reminders_type` - Type filtering

#### Audit Logs (5 indexes)
- `idx_audit_logs_company_id` - Company lookup
- `idx_audit_logs_user_id` - User activity
- `idx_audit_logs_company_timestamp` - Date range queries
- `idx_audit_logs_entity` - Entity lookups
- `idx_audit_logs_action` - Action filtering

#### Vehicles (4 indexes)
- `idx_vehicles_company_id` - Company lookup
- `idx_vehicles_registration` - Registration search
- `idx_vehicles_status` - Status filtering
- `idx_vehicles_type` - Type filtering

#### Users (4 indexes)
- `idx_users_company_id` - Company lookup
- `idx_users_email` - Email search
- `idx_users_role` - Role filtering
- `idx_users_active` - Active users (partial index)

#### Driver Locations (3 indexes)
- `idx_driver_locations_driver_id` - Driver history
- `idx_driver_locations_vehicle_id` - Vehicle history
- `idx_driver_locations_driver_timestamp` - Latest location

#### Geofences (3 indexes)
- `idx_geofences_company_id` - Company lookup
- `idx_geofences_active` - Active geofences (partial index)
- `idx_geofences_type` - Type filtering

#### Rectifications (4 indexes)
- `idx_rectifications_defect_id` - Defect lookup
- `idx_rectifications_mechanic_id` - Mechanic lookup
- `idx_rectifications_company_id` - Company lookup
- `idx_rectifications_status` - Status filtering

#### Notifications (4 indexes)
- `idx_notifications_user_id` - User lookup
- `idx_notifications_company_id` - Company lookup
- `idx_notifications_unread` - Unread notifications (partial index)
- `idx_notifications_user_created` - Date range queries

#### Storage Files (3 indexes)
- `idx_storage_files_entity` - Entity lookup
- `idx_storage_files_company_id` - Company lookup
- `idx_storage_files_expiry` - Expiry cleanup (partial index)

#### Shift Checks (4 indexes)
- `idx_shift_checks_driver_id` - Driver lookup
- `idx_shift_checks_vehicle_id` - Vehicle lookup
- `idx_shift_checks_company_id` - Company lookup
- `idx_shift_checks_company_created` - Date range queries

---

## Index Types

### B-Tree Indexes (Default)
Used for most indexes. Optimal for:
- Equality comparisons (`WHERE column = value`)
- Range queries (`WHERE column > value`)
- Sorting (`ORDER BY column`)
- Pattern matching (`WHERE column LIKE 'prefix%'`)

### Partial Indexes
Used for frequently queried subsets:
- `idx_timesheets_active` - Only active timesheets
- `idx_reminders_status_due` - Only active reminders
- `idx_users_active` - Only active users
- `idx_notifications_unread` - Only unread notifications
- `idx_storage_files_expiry` - Only files with expiry dates

**Benefits:**
- Smaller index size
- Faster queries on filtered data
- Reduced maintenance overhead

### Composite Indexes
Used for multi-column queries:
- `idx_inspections_company_created` - Company + timestamp
- `idx_defects_company_status` - Company + status
- `idx_timesheets_company_clock_in` - Company + clock in
- `idx_audit_logs_company_timestamp` - Company + timestamp
- `idx_driver_locations_driver_timestamp` - Driver + timestamp
- `idx_notifications_user_created` - User + timestamp

**Benefits:**
- Single index serves multiple query patterns
- Reduces number of indexes needed
- Improves query performance

---

## Query Optimization Strategies

### 1. Use Indexes Effectively
```sql
-- Good: Uses idx_inspections_company_created
SELECT * FROM inspections 
WHERE company_id = 1 
ORDER BY created_at DESC 
LIMIT 20;

-- Bad: Full table scan
SELECT * FROM inspections 
WHERE EXTRACT(YEAR FROM created_at) = 2025;
```

### 2. Avoid SELECT *
```sql
-- Good: Select only needed columns
SELECT id, vehicle_id, status FROM inspections;

-- Bad: Fetches all columns
SELECT * FROM inspections;
```

### 3. Use LIMIT for Large Result Sets
```sql
-- Good: Limits results
SELECT * FROM audit_logs 
WHERE company_id = 1 
ORDER BY timestamp DESC 
LIMIT 100;

-- Bad: Fetches all rows
SELECT * FROM audit_logs 
WHERE company_id = 1;
```

### 4. Use EXISTS Instead of IN for Subqueries
```sql
-- Good: Uses EXISTS
SELECT * FROM vehicles v
WHERE EXISTS (
  SELECT 1 FROM defects d 
  WHERE d.vehicle_id = v.id 
  AND d.status = 'OPEN'
);

-- Bad: Uses IN with subquery
SELECT * FROM vehicles 
WHERE id IN (
  SELECT vehicle_id FROM defects 
  WHERE status = 'OPEN'
);
```

### 5. Avoid Functions on Indexed Columns
```sql
-- Good: Uses index
SELECT * FROM users 
WHERE email = 'user@example.com';

-- Bad: Prevents index usage
SELECT * FROM users 
WHERE LOWER(email) = 'user@example.com';
```

---

## Connection Pooling

### Configuration
```typescript
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 20,                    // Maximum connections
  min: 5,                     // Minimum connections
  idleTimeoutMillis: 30000,   // Close idle connections after 30s
  connectionTimeoutMillis: 2000, // Timeout for new connections
});
```

### Best Practices
- Use connection pooling (already configured in Drizzle ORM)
- Set appropriate pool size (20 for production)
- Monitor connection usage
- Close connections properly

---

## Query Performance Monitoring

### Slow Query Log
Enable PostgreSQL slow query logging:
```sql
-- Set in postgresql.conf
log_min_duration_statement = 1000  -- Log queries > 1 second
```

### Query Analysis
```sql
-- Explain query plan
EXPLAIN ANALYZE 
SELECT * FROM inspections 
WHERE company_id = 1 
ORDER BY created_at DESC 
LIMIT 20;
```

### Index Usage Statistics
```sql
-- Check index usage
SELECT 
  schemaname,
  tablename,
  indexname,
  idx_scan,
  idx_tup_read,
  idx_tup_fetch
FROM pg_stat_user_indexes
WHERE schemaname = 'public'
ORDER BY idx_scan DESC;
```

### Find Unused Indexes
```sql
-- Find indexes that are never used
SELECT 
  schemaname,
  tablename,
  indexname
FROM pg_stat_user_indexes
WHERE idx_scan = 0
  AND schemaname = 'public'
  AND indexname NOT LIKE '%_pkey';
```

---

## Maintenance Tasks

### Regular VACUUM
```sql
-- Reclaim storage and update statistics
VACUUM ANALYZE;

-- Full vacuum (requires table lock)
VACUUM FULL;
```

### Update Statistics
```sql
-- Update query planner statistics
ANALYZE;

-- Analyze specific table
ANALYZE inspections;
```

### Reindex (if needed)
```sql
-- Rebuild all indexes on a table
REINDEX TABLE inspections;

-- Rebuild specific index
REINDEX INDEX idx_inspections_company_created;
```

---

## Caching Strategy

### Application-Level Caching
- Cache frequently accessed data (vehicles, users)
- Use Redis for session storage
- Implement query result caching

### Database-Level Caching
- PostgreSQL has built-in query cache
- Increase `shared_buffers` for better caching
- Monitor cache hit ratio

---

## Scaling Strategies

### Vertical Scaling
- Increase CPU/RAM for database server
- Upgrade to faster storage (SSD)
- Optimize PostgreSQL configuration

### Horizontal Scaling
- Read replicas for read-heavy workloads
- Connection pooling with PgBouncer
- Database sharding for very large datasets

### Partitioning
Consider partitioning large tables:
```sql
-- Partition audit_logs by month
CREATE TABLE audit_logs_2025_01 PARTITION OF audit_logs
FOR VALUES FROM ('2025-01-01') TO ('2025-02-01');
```

---

## Performance Benchmarks

### Expected Performance
- Simple queries: <10ms
- Complex queries: <100ms
- Report generation: <5s
- Bulk operations: <30s

### Monitoring Metrics
- Query execution time
- Connection pool usage
- Cache hit ratio
- Index usage
- Table bloat

---

## Troubleshooting

### Slow Queries
1. Run `EXPLAIN ANALYZE` on the query
2. Check if indexes are being used
3. Look for sequential scans
4. Consider adding indexes
5. Optimize query structure

### High CPU Usage
1. Check for missing indexes
2. Look for inefficient queries
3. Review connection pool settings
4. Consider query result caching

### High Memory Usage
1. Reduce connection pool size
2. Optimize query result sets
3. Implement pagination
4. Increase server RAM

### Deadlocks
1. Keep transactions short
2. Access tables in consistent order
3. Use appropriate isolation levels
4. Monitor deadlock logs

---

## Best Practices

### Query Design
- Use prepared statements (Drizzle ORM does this)
- Implement pagination for large result sets
- Use appropriate data types
- Avoid N+1 queries

### Schema Design
- Normalize data appropriately
- Use foreign keys for referential integrity
- Choose appropriate column types
- Use constraints for data validation

### Index Design
- Index foreign keys
- Index columns used in WHERE clauses
- Index columns used in ORDER BY
- Don't over-index (slows writes)

### Monitoring
- Set up query performance monitoring
- Monitor connection pool usage
- Track slow queries
- Review index usage regularly

---

## Migration Checklist

Before applying indexes to production:

- [ ] Test indexes in staging environment
- [ ] Measure query performance before/after
- [ ] Check index size and maintenance overhead
- [ ] Verify no negative impact on write performance
- [ ] Monitor index usage after deployment
- [ ] Document any schema changes

---

## Resources

- [PostgreSQL Performance Tuning](https://www.postgresql.org/docs/current/performance-tips.html)
- [Drizzle ORM Documentation](https://orm.drizzle.team)
- [Use The Index, Luke](https://use-the-index-luke.com/)
- [PostgreSQL Index Types](https://www.postgresql.org/docs/current/indexes-types.html)

---

**Last Updated:** January 29, 2026  
**Version:** 1.0.0
