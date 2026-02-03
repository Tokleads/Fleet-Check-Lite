# Titan Fleet - Replit Deployment Guide
**Date:** February 2, 2026  
**Status:** Ready for Final Deployment

---

## 🎯 Overview

This guide provides step-by-step instructions to complete the Titan Fleet deployment in your Replit environment. All code is ready - you just need to configure environment variables and run the database migration.

---

## ✅ What's Already Done

### 1. Sentry Error Tracking
- ✅ Backend integration configured
- ✅ Error tracking tested and working
- ✅ DSN: `https://578ece1d50d0a9ac8ea62f5140300b0b@o4510817437614080.ingest.de.sentry.io/4510817445412944`

### 2. Resend Email Integration
- ✅ Email service implemented in `server/notificationService.ts`
- ✅ Professional HTML email templates
- ✅ API Key: (configured in Replit Secrets)
- ✅ Resend package installed

### 3. Wage Calculation System
- ✅ Database schema defined (`payRates`, `bankHolidays`, `wageCalculations`)
- ✅ Wage calculation service implemented
- ✅ Pay rate management UI created
- ✅ CSV export with wage breakdowns
- ⏳ **Needs database migration in Replit**

### 4. Service Worker & PWA
- ✅ Full offline support
- ✅ Background sync for GPS data
- ✅ Push notifications
- ✅ Installable on mobile/desktop

---

## 🚀 Deployment Steps in Replit

### Step 1: Add Environment Variables

In your Replit project, go to **Secrets** (lock icon in sidebar) and add:

```bash
# Sentry Error Tracking
SENTRY_DSN=https://578ece1d50d0a9ac8ea62f5140300b0b@o4510817437614080.ingest.de.sentry.io/4510817445412944

# Resend Email Service
RESEND_API_KEY=your_resend_api_key_here
```

### Step 2: Pull Latest Code from GitHub

In Replit Shell:

```bash
cd /home/runner/YOUR_PROJECT_NAME
git pull origin main
```

This will pull all the latest changes including:
- Resend email integration
- Wage calculation system
- Updated notification service
- Service worker improvements

### Step 3: Install Dependencies

```bash
npm install
```

This will install the `resend` package and any other new dependencies.

### Step 4: Run Database Migration

**⚠️ IMPORTANT:** This is the step that failed before. Here's the correct way to do it:

```bash
# Method 1: Using npm script (recommended)
npm run db:push

# Method 2: Direct drizzle-kit command
npx drizzle-kit push
```

This will create the following new tables:
- `pay_rates` - Pay rate configurations
- `bank_holidays` - UK bank holidays
- `wage_calculations` - Cached wage breakdowns

**If you get "serial type does not exist" error:**

This means your PostgreSQL version doesn't support the `serial` type syntax. Use this manual SQL instead:

```sql
-- Create pay_rates table
CREATE TABLE IF NOT EXISTS pay_rates (
  id SERIAL PRIMARY KEY,
  company_id INTEGER NOT NULL REFERENCES companies(id),
  driver_id INTEGER REFERENCES users(id),
  base_rate VARCHAR(10) NOT NULL DEFAULT '12.00',
  night_rate VARCHAR(10) NOT NULL DEFAULT '15.00',
  weekend_rate VARCHAR(10) NOT NULL DEFAULT '18.00',
  bank_holiday_rate VARCHAR(10) NOT NULL DEFAULT '24.00',
  overtime_multiplier VARCHAR(10) NOT NULL DEFAULT '1.5',
  night_start_hour INTEGER NOT NULL DEFAULT 22,
  night_end_hour INTEGER NOT NULL DEFAULT 6,
  daily_overtime_threshold INTEGER NOT NULL DEFAULT 480,
  weekly_overtime_threshold INTEGER NOT NULL DEFAULT 2400,
  is_active BOOLEAN NOT NULL DEFAULT true,
  effective_from TIMESTAMP NOT NULL DEFAULT NOW(),
  effective_to TIMESTAMP,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Create bank_holidays table
CREATE TABLE IF NOT EXISTS bank_holidays (
  id SERIAL PRIMARY KEY,
  company_id INTEGER NOT NULL REFERENCES companies(id),
  name VARCHAR(100) NOT NULL,
  date TIMESTAMP NOT NULL,
  is_recurring BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Create wage_calculations table
CREATE TABLE IF NOT EXISTS wage_calculations (
  id SERIAL PRIMARY KEY,
  timesheet_id INTEGER NOT NULL UNIQUE,
  company_id INTEGER NOT NULL REFERENCES companies(id),
  driver_id INTEGER NOT NULL REFERENCES users(id),
  pay_rate_id INTEGER NOT NULL REFERENCES pay_rates(id),
  regular_minutes INTEGER NOT NULL DEFAULT 0,
  night_minutes INTEGER NOT NULL DEFAULT 0,
  weekend_minutes INTEGER NOT NULL DEFAULT 0,
  bank_holiday_minutes INTEGER NOT NULL DEFAULT 0,
  overtime_minutes INTEGER NOT NULL DEFAULT 0,
  regular_pay VARCHAR(10) NOT NULL DEFAULT '0.00',
  night_pay VARCHAR(10) NOT NULL DEFAULT '0.00',
  weekend_pay VARCHAR(10) NOT NULL DEFAULT '0.00',
  bank_holiday_pay VARCHAR(10) NOT NULL DEFAULT '0.00',
  overtime_pay VARCHAR(10) NOT NULL DEFAULT '0.00',
  total_pay VARCHAR(10) NOT NULL DEFAULT '0.00',
  calculated_at TIMESTAMP NOT NULL DEFAULT NOW(),
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);
```

You can run this SQL in:
- Replit Database tab
- Or using `psql` command line
- Or through any PostgreSQL client

### Step 5: Restart the Server

In Replit:
1. Click **Stop** button
2. Click **Run** button
3. Wait for server to start

### Step 6: Verify Everything Works

Check these endpoints:

```bash
# 1. Health check
curl https://YOUR_REPLIT_URL.repl.co/api/health

# 2. Test Sentry error tracking
curl https://YOUR_REPLIT_URL.repl.co/api/test-sentry

# 3. Check if pay rates API works
curl https://YOUR_REPLIT_URL.repl.co/api/pay-rates
```

---

## 📧 Email Configuration in Resend

### Verify Domain (Optional but Recommended)

To send emails from your own domain instead of `notifications@titanfleet.co.uk`:

1. Go to https://resend.com/domains
2. Click **Add Domain**
3. Add your domain (e.g., `titanfleet.co.uk`)
4. Add the DNS records Resend provides:
   - SPF record
   - DKIM record
   - DMARC record (optional)
5. Wait for verification (usually 5-30 minutes)

Once verified, update the `from` address in `server/notificationService.ts`:

```typescript
from: 'Titan Fleet <notifications@yourdomain.com>',
```

### Test Email Sending

In Replit Shell:

```bash
curl -X POST https://YOUR_REPLIT_URL.repl.co/api/notifications/test \
  -H "Content-Type: application/json" \
  -d '{"email":"your-email@example.com"}'
```

You should receive a test email within seconds.

---

## 🧪 Load Testing

Once everything is deployed, run load tests to verify 100+ user capacity:

```bash
cd /home/ubuntu/titan-fleet
./scripts/run-load-test.sh
```

This will:
- Test 7 realistic scenarios
- Simulate 100+ concurrent users
- Generate 15,000-20,000 requests
- Measure P95 and P99 response times

**Expected Results:**
- P95 response time: <1000ms
- P99 response time: <2000ms
- 0% error rate

---

## 🎯 New Features Now Available

### 1. Wage Calculation System

**Manager Dashboard → Pay Rates**

- Set company-wide default pay rates
- Set individual driver pay rates
- Configure night shift hours (default: 10 PM - 6 AM)
- Set weekend rates (Saturday/Sunday)
- Set bank holiday rates
- Configure overtime thresholds

**Timesheet CSV Export:**

Now includes detailed wage breakdown columns:
- Regular Hours & Pay
- Night Hours & Pay
- Weekend Hours & Pay
- Bank Holiday Hours & Pay
- Overtime Hours & Pay
- Total Pay

### 2. Bank Holiday Management

**Manager Dashboard → Bank Holidays**

- Add UK bank holidays
- Mark recurring holidays
- Automatic wage calculation on bank holidays

### 3. Email Notifications

All notifications now send real emails via Resend:
- MOT expiry alerts (30, 14, 7 days before)
- Tax expiry alerts (30, 14, 7 days before)
- Service due reminders (7 days before)
- License expiry alerts
- VOR status notifications

**Automatic Daily Checks:**

The notification scheduler runs daily at 9 AM to check for:
- Expiring MOTs
- Expiring Tax
- Service due dates
- License expiries

### 4. Sentry Error Tracking

All errors are now automatically tracked in Sentry:
- Backend errors with full stack traces
- API endpoint failures
- Database query errors
- Email sending failures

**View Errors:**
https://sentry.io/organizations/YOUR-ORG/projects/

---

## 🔧 Troubleshooting

### Database Migration Fails

**Error:** `type "serial" does not exist`

**Solution:** Use the manual SQL provided in Step 4 above.

### Email Not Sending

**Check:**
1. RESEND_API_KEY is set in Replit Secrets
2. Server was restarted after adding the secret
3. Check server logs for Resend errors

**Test:**
```bash
curl -X POST https://YOUR_URL/api/notifications/test \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com"}'
```

### Sentry Not Tracking Errors

**Check:**
1. SENTRY_DSN is set in Replit Secrets
2. Server was restarted
3. Visit `/api/test-sentry` to trigger a test error

### Service Worker Not Working

**Check:**
1. App is running in production mode (not dev)
2. HTTPS is enabled (required for service workers)
3. Clear browser cache and reload
4. Check browser console for service worker errors

---

## 📊 Performance Monitoring

### Built-in Performance Dashboard

**Access:** https://YOUR_URL/admin/performance

**Features:**
- Real-time API response times
- Slow query detection (>1000ms)
- Endpoint statistics
- Recent request history
- Performance grading (A+ to F)

### Sentry Performance Monitoring

**Access:** https://sentry.io/organizations/YOUR-ORG/projects/

**Monitors:**
- API endpoint performance
- Database query performance
- Error rates and trends
- User impact analysis

---

## 🎉 Post-Deployment Checklist

After completing all steps above:

- [ ] Environment variables added in Replit Secrets
- [ ] Latest code pulled from GitHub
- [ ] Dependencies installed (`npm install`)
- [ ] Database migration completed successfully
- [ ] Server restarted
- [ ] Health check endpoint returns 200 OK
- [ ] Sentry test error appears in dashboard
- [ ] Test email received successfully
- [ ] Pay rates page loads without errors
- [ ] Bank holidays page loads without errors
- [ ] Timesheet CSV export includes wage columns
- [ ] Service worker registers in browser console
- [ ] Load testing completed with good results

---

## 📝 Next Steps

### 1. Configure Email Domain (Optional)

Follow the "Email Configuration in Resend" section above to send emails from your own domain.

### 2. Set Up Default Pay Rates

1. Log in as admin/manager
2. Go to **Pay Rates** page
3. Click **Add Company Default**
4. Set your standard rates:
   - Base rate: £12.00/hour (example)
   - Night rate: £15.00/hour
   - Weekend rate: £18.00/hour
   - Bank holiday rate: £24.00/hour

### 3. Add UK Bank Holidays

1. Go to **Bank Holidays** page
2. Add 2026 UK bank holidays:
   - New Year's Day (Jan 1)
   - Good Friday (Apr 18)
   - Easter Monday (Apr 21)
   - Early May Bank Holiday (May 4)
   - Spring Bank Holiday (May 25)
   - Summer Bank Holiday (Aug 31)
   - Christmas Day (Dec 25)
   - Boxing Day (Dec 26)

### 4. Run Load Testing

```bash
./scripts/run-load-test.sh
```

Analyze results and optimize any slow endpoints.

### 5. Monitor Production

- Check Sentry dashboard daily for errors
- Review performance dashboard weekly
- Monitor email delivery rates in Resend
- Check notification scheduler logs

---

## 🆘 Support

If you encounter any issues during deployment:

1. Check server logs in Replit console
2. Check Sentry dashboard for errors
3. Review this guide's Troubleshooting section
4. Check GitHub issues for similar problems

---

## 🎓 Documentation

- **Load Testing Guide:** `/home/ubuntu/titan-fleet/LOAD_TESTING.md`
- **Sentry Setup:** `/home/ubuntu/titan-fleet/SENTRY_SETUP.md`
- **Notification Scheduler:** `/home/ubuntu/titan-fleet/NOTIFICATION_SCHEDULER.md`
- **Wage Calculation System:** `/home/ubuntu/titan-fleet/WAGE_CALCULATION_SYSTEM.md`
- **Production Status:** `/home/ubuntu/titan-fleet/PRODUCTION_STATUS.md`

---

**Good luck with your deployment!** 🚀
