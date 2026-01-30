# Load Testing & Performance Benchmarking

This directory contains load testing and performance benchmarking tools for Titan Fleet.

## Tools

### 1. Artillery (Comprehensive Load Testing)
Artillery provides advanced load testing with multiple phases and complex scenarios.

**Configuration:** `artillery-config.yml`

**Features:**
- Multi-phase load testing (warm-up, ramp-up, sustained, peak, cool-down)
- Multiple user scenarios (authentication, inspections, defects, GPS, dashboard)
- Weighted scenario distribution
- CSV payload support
- Detailed metrics and reporting

**Usage:**
```bash
# Install Artillery globally (if not already installed)
npm install -g artillery

# Run load test
artillery run artillery-config.yml

# Run with custom target
artillery run --target http://staging.titanfleet.app artillery-config.yml

# Generate HTML report
artillery run --output report.json artillery-config.yml
artillery report report.json
```

### 2. Autocannon (Simple Load Testing)
Autocannon provides quick and easy load testing for individual endpoints.

**Script:** `simple-load-test.js`

**Features:**
- Fast and lightweight
- Multiple test scenarios
- Real-time progress tracking
- Performance assessment

**Usage:**
```bash
# Run specific scenario
node simple-load-test.js health
node simple-load-test.js inspections
node simple-load-test.js vehicles
node simple-load-test.js defects
node simple-load-test.js mixed

# Run all scenarios
node simple-load-test.js all

# Use custom URL
API_URL=https://staging.titanfleet.app node simple-load-test.js mixed
```

### 3. Performance Benchmarking
Custom benchmarking script for detailed performance analysis.

**Script:** `benchmark.js`

**Features:**
- Warm-up phase to stabilize performance
- Statistical analysis (min, max, mean, median, P95, P99)
- Performance grading
- Multiple endpoint testing

**Usage:**
```bash
# Run benchmarks
node benchmark.js

# Use custom URL
API_URL=https://staging.titanfleet.app node benchmark.js
```

## Test Scenarios

### Authentication Flow
- Login
- Get current user
- Logout

**Weight:** 20%

### Vehicle Inspection Flow
- Login
- Get vehicles
- Create inspection

**Weight:** 30%

### Defect Management Flow
- Login as mechanic
- Get open defects
- Update defect status

**Weight:** 20%

### GPS Tracking Flow
- Login as driver
- Update GPS location

**Weight:** 15%

### Dashboard Data Retrieval
- Login as manager
- Get dashboard stats
- Get recent inspections
- Get active defects
- Get reminders

**Weight:** 15%

## Performance Targets

### Response Time
- **Excellent:** < 100ms average
- **Good:** < 500ms average
- **Warning:** < 1000ms average
- **Poor:** > 1000ms average

### Throughput
- **High:** > 1000 req/sec
- **Good:** > 500 req/sec
- **Low:** < 500 req/sec

### Error Rate
- **Target:** 0% errors
- **Acceptable:** < 0.1% errors
- **Warning:** < 1% errors
- **Critical:** > 1% errors

## Load Testing Phases

### 1. Warm-up (60s)
- 5 users/sec
- Stabilize system
- Prime caches

### 2. Ramp-up (120s)
- 5 → 50 users/sec
- Gradual increase
- Identify breaking points

### 3. Sustained Load (300s)
- 50 users/sec constant
- Test stability
- Monitor resource usage

### 4. Peak Load (120s)
- 50 → 100 users/sec
- Test maximum capacity
- Identify bottlenecks

### 5. Cool-down (60s)
- 100 → 5 users/sec
- Gradual decrease
- Check recovery

## Metrics to Monitor

### Application Metrics
- Response time (mean, P95, P99)
- Throughput (req/sec)
- Error rate
- Timeout rate

### System Metrics
- CPU usage
- Memory usage
- Database connections
- Network I/O

### Database Metrics
- Query execution time
- Connection pool usage
- Cache hit ratio
- Slow queries

## Best Practices

### Before Load Testing
1. **Test in staging first** - Never load test production without warning
2. **Warm up the system** - Run a few requests before starting
3. **Monitor resources** - Watch CPU, memory, database
4. **Set up alerts** - Get notified of issues
5. **Have a rollback plan** - Be ready to revert changes

### During Load Testing
1. **Monitor in real-time** - Watch dashboards
2. **Check logs** - Look for errors
3. **Track metrics** - Record performance data
4. **Note anomalies** - Document unexpected behavior
5. **Be ready to stop** - Kill test if system degrades

### After Load Testing
1. **Analyze results** - Review all metrics
2. **Identify bottlenecks** - Find slow queries, endpoints
3. **Document findings** - Write up results
4. **Create action items** - Plan optimizations
5. **Retest after changes** - Verify improvements

## Common Issues & Solutions

### High Response Times
**Causes:**
- Slow database queries
- Missing indexes
- N+1 query problems
- Inefficient algorithms

**Solutions:**
- Add database indexes
- Optimize queries
- Implement caching
- Use connection pooling

### High Error Rates
**Causes:**
- Rate limiting
- Database connection exhaustion
- Memory leaks
- Unhandled exceptions

**Solutions:**
- Increase rate limits
- Increase connection pool
- Fix memory leaks
- Add error handling

### Low Throughput
**Causes:**
- Single-threaded bottlenecks
- Synchronous operations
- Blocking I/O
- Resource contention

**Solutions:**
- Use async/await
- Implement worker threads
- Optimize I/O operations
- Scale horizontally

## Integration with CI/CD

Add load testing to your CI/CD pipeline:

```yaml
# .github/workflows/load-test.yml
name: Load Test

on:
  schedule:
    - cron: '0 2 * * *'  # Daily at 2 AM
  workflow_dispatch:

jobs:
  load-test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Run load test
        run: |
          npm install -g artillery
          artillery run load-tests/artillery-config.yml
      
      - name: Upload results
        uses: actions/upload-artifact@v4
        with:
          name: load-test-results
          path: report.json
```

## Resources

- [Artillery Documentation](https://www.artillery.io/docs)
- [Autocannon Documentation](https://github.com/mcollina/autocannon)
- [Load Testing Best Practices](https://www.artillery.io/docs/guides/guides/load-testing-best-practices)
- [Performance Testing Guide](https://www.artillery.io/docs/guides/guides/performance-testing-guide)

---

**Last Updated:** January 29, 2026  
**Version:** 1.0.0
