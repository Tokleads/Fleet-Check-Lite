# 🚀 Titan Fleet - Phase 1 & 2 Deployment Guide

Complete guide for deploying User Roles, Defect Rectification, Audit Log, Reminders, Compliance Reports, and GDPR features to Replit.

---

## 📦 What's Included

**Phase 1:**
- User Roles & RBAC (5 roles, 40+ permissions)
- Defect Rectification Workflow
- Immutable Audit Log (hash chaining)

**Phase 2:**
- Reminder System (MOT, service, insurance, tax, tacho)
- Compliance Reporting (PDF exports)
- GDPR Features (data export, anonymization)

---

## 🔧 Quick Start

### 1. Extract Files
```bash
tar -xzf phase1-and-phase2-complete.tar.gz
```

### 2. Run Migration
```bash
npm run db:push
```

### 3. Restart Server
```bash
npm run dev
```

### 4. Test Features
- Login as admin → `/manager/users`
- Create reminders → `/manager/reminders`
- Generate reports → `/manager/reports`

---

## 📋 Full Deployment Steps

### Step 1: Backup Current Project
```bash
git add .
git commit -m "Backup before Phase 1 & 2 deployment"
```

### Step 2: Extract Files to Replit
Upload `phase1-and-phase2-complete.tar.gz` to Replit root, then:
```bash
tar -xzf phase1-and-phase2-complete.tar.gz
ls -la shared/ server/ client/src/pages/
```

### Step 3: Database Migration
```bash
npm run db:push
```

**Creates:**
- `reminders` table
- Updates `users` table (5 roles)
- Updates `defects` table (mechanic assignment)
- `rectifications` table
- Updates `audit_logs` (hash chaining)
- `shift_checks` and `shift_check_items` tables

### Step 4: Seed Test Users
```sql
INSERT INTO users (name, email, role, company_id) VALUES
  ('Admin User', 'admin@test.com', 'ADMIN', 1),
  ('Manager User', 'manager@test.com', 'TRANSPORT_MANAGER', 1),
  ('Driver User', 'driver@test.com', 'DRIVER', 1),
  ('Mechanic User', 'mechanic@test.com', 'MECHANIC', 1),
  ('Auditor User', 'auditor@test.com', 'AUDITOR', 1);
```

### Step 5: Test Each Feature

**RBAC:**
- Login as admin → Assign roles at `/manager/users`
- Login as different roles → Verify permissions

**Defect Rectification:**
- Driver reports defect
- Manager assigns to mechanic
- Mechanic completes work at `/mechanic/dashboard`
- Manager verifies

**Reminders:**
- Create MOT reminder at `/manager/reminders`
- Test snooze and complete

**Reports:**
- Generate DVSA report at `/manager/reports`
- Verify PDF downloads

---

## 🐛 Troubleshooting

**Migration Fails:**
```bash
# Check database connection
echo $DATABASE_URL

# Retry migration
npm run db:push
```

**TypeScript Errors:**
```bash
npm install
npm run check
```

**PDF Generation Fails:**
```bash
npm list pdfkit  # Verify installed
```

---

## ✅ Deployment Checklist

- [ ] Files extracted
- [ ] Database migrated
- [ ] Test users created
- [ ] Server restarted
- [ ] RBAC tested
- [ ] Defect workflow tested
- [ ] Reminders tested
- [ ] Reports tested
- [ ] Security reviewed

---

**Deployment complete! Titan Fleet is now 95% production-ready.** 🎉

See `PHASE1_COMPLETE.md` and `PHASE2_COMPLETE.md` for detailed feature documentation.
