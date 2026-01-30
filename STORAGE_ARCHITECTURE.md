# Titan Fleet - Enterprise Storage Architecture

## Executive Summary

Titan Fleet is a **multi-tenant SaaS platform** serving multiple independent fleet operators. This document defines the enterprise-grade storage architecture for 15-month DVSA-compliant retention of vehicle inspection records, photos, and documents.

**Key Requirements:**
- Multi-tenant data isolation (Company A never sees Company B's data)
- DVSA 15-month retention compliance
- Immutable audit trail
- Scalable to 1000+ companies
- Cost-effective long-term storage
- Fast retrieval for inspections
- Enterprise-grade security

---

## Current State Analysis

### Existing Infrastructure
- **Database:** PostgreSQL (Neon) - Multi-tenant with `companyId` foreign keys
- **Object Storage:** Replit Object Storage (Google Cloud Storage backend)
- **Optional Integration:** Google Drive (per-company credentials for white-label)

### Current Schema (Relevant Tables)
```typescript
companies {
  id: serial
  companyCode: varchar (unique)
  googleDriveConnected: boolean
  driveRootFolderId: text
  // ... Drive OAuth credentials (encrypted)
}

inspections {
  id: serial
  companyId: integer (FK)
  vehicleId: integer
  driverId: integer
  checklist: jsonb
  defects: jsonb
  driveFolderId: text  // ← Currently stores Drive folder ID
  startedAt: timestamp
  completedAt: timestamp
  createdAt: timestamp
}

media {
  id: serial
  companyId: integer (FK)
  kind: varchar  // INSPECTION | FUEL | COLLISION
  linkedId: integer  // ID of parent record
  driveFileId: text  // ← Currently stores Drive file ID
  driveUrl: text
  thumbnailUrl: text
  createdAt: timestamp
}
```

### Problems with Current Approach

1. **Drive Dependency:** Files only exist if company maintains Drive credentials
2. **No Immutability:** Files can be deleted from Drive by company admins
3. **No Retention Enforcement:** No automatic 15-month lifecycle
4. **Compliance Risk:** DVSA audit could fail if files missing
5. **Scalability:** Each company needs separate Drive setup
6. **Cost:** Drive storage costs per company

---

## Recommended Architecture: Hybrid Multi-Tenant Storage

### Design Principles

1. **Separation of Concerns:**
   - **Compliance Storage** (Replit Object Storage) - Immutable, lifecycle-managed
   - **Convenience Storage** (Google Drive) - Optional, per-company, manager-friendly

2. **Multi-Tenant Isolation:**
   - Bucket structure: `/company-{companyId}/inspections/{year}/{month}/{inspectionId}/`
   - Database-level: All queries filtered by `companyId`
   - API-level: Session validates company access

3. **Immutability:**
   - Object Storage files are write-once, read-many
   - No delete API exposed to companies
   - System-only cleanup after 15 months

4. **Audit Trail:**
   - Every file access logged in `audit_logs` table
   - Metadata includes: who, when, what, from where

---

## Storage Architecture

### Primary Storage: Replit Object Storage (GCS)

**Bucket Structure:**
```
/titan-fleet-production/
  /company-1/
    /inspections/
      /2025/
        /01/
          /inspection-12345/
            /photo-1-checklist-tyres.jpg
            /photo-2-defect-brake.jpg
            /report.pdf
    /fuel/
      /2025/01/
        /fuel-789-receipt.jpg
    /documents/
      /handbook-v2.pdf
  /company-2/
    /inspections/
      ...
```

**Path Format:**
```
/{bucket}/{companyId}/{category}/{year}/{month}/{recordId}/{filename}
```

**Benefits:**
- ✅ Complete data isolation per company
- ✅ Easy to implement retention policies per company
- ✅ Simple to calculate storage costs per company
- ✅ GDPR-compliant deletion (delete entire company folder)
- ✅ Scalable to unlimited companies

### Secondary Storage: Google Drive (Optional)

**When to use:**
- Company wants white-label branding
- Managers prefer browsing files in Drive
- Company already has Google Workspace

**Folder Structure:**
```
Titan Fleet/
  Inspections/
    2025/
      January/
        Vehicle ABC123/
          2025-01-27 Safety Check/
            photos/
            report.pdf
```

**Sync Strategy:**
- Upload to Object Storage first (always)
- If Drive connected, async upload to Drive (best effort)
- If Drive upload fails, inspection still valid (Object Storage is source of truth)

---

## Updated Database Schema

### New: `storage_files` Table

Replace the `media` table with a more comprehensive storage tracking table:

```typescript
export const storageFiles = pgTable("storage_files", {
  id: serial("id").primaryKey(),
  companyId: integer("company_id").references(() => companies.id).notNull(),
  
  // File metadata
  filename: text("filename").notNull(),
  mimeType: varchar("mime_type", { length: 100 }).notNull(),
  sizeBytes: integer("size_bytes").notNull(),
  
  // Storage locations
  objectStoragePath: text("object_storage_path").notNull(), // Primary: /company-1/inspections/...
  objectStorageUrl: text("object_storage_url"), // Signed URL (temporary)
  driveFileId: text("drive_file_id"), // Optional: Google Drive backup
  driveUrl: text("drive_url"), // Optional: Drive viewing URL
  
  // Linking
  entityType: varchar("entity_type", { length: 50 }).notNull(), // INSPECTION | FUEL | DEFECT | DOCUMENT
  entityId: integer("entity_id").notNull(), // ID of parent record
  
  // Compliance
  retentionUntil: timestamp("retention_until").notNull(), // Auto-calculated: createdAt + 15 months
  isArchived: boolean("is_archived").default(false),
  
  // Audit
  uploadedBy: integer("uploaded_by").references(() => users.id).notNull(),
  uploadedAt: timestamp("uploaded_at").defaultNow().notNull(),
  lastAccessedAt: timestamp("last_accessed_at"),
  accessCount: integer("access_count").default(0)
});
```

### Updated: `inspections` Table

Remove Drive-specific fields, add storage references:

```typescript
export const inspections = pgTable("inspections", {
  // ... existing fields ...
  
  // Remove these:
  // driveFolderId: text("drive_folder_id"),
  
  // Add these:
  storageFolder: text("storage_folder").notNull(), // /company-1/inspections/2025/01/inspection-12345/
  reportFileId: integer("report_file_id").references(() => storageFiles.id), // Link to generated PDF
  photoCount: integer("photo_count").default(0),
  
  // Compliance
  retentionUntil: timestamp("retention_until").notNull(), // createdAt + 15 months
  isArchived: boolean("is_archived").default(false)
});
```

---

## Storage Service Implementation

### Core Service: `StorageService`

```typescript
class StorageService {
  // Upload file to Object Storage (primary)
  async uploadFile(params: {
    companyId: number;
    entityType: 'INSPECTION' | 'FUEL' | 'DEFECT' | 'DOCUMENT';
    entityId: number;
    file: Buffer;
    filename: string;
    mimeType: string;
    uploadedBy: number;
  }): Promise<StorageFile>;
  
  // Get signed URL for file access (temporary, 1 hour)
  async getFileUrl(fileId: number, userId: number): Promise<string>;
  
  // Optional: Sync to Google Drive if company has it configured
  async syncToDrive(fileId: number): Promise<void>;
  
  // List files for an entity
  async listFiles(entityType: string, entityId: number): Promise<StorageFile[]>;
  
  // Compliance: Archive files after 15 months
  async archiveExpiredFiles(): Promise<number>;
  
  // Compliance: Generate retention report for DVSA audit
  async getRetentionReport(companyId: number, startDate: Date, endDate: Date): Promise<RetentionReport>;
}
```

### Path Generation

```typescript
function generateStoragePath(params: {
  companyId: number;
  entityType: string;
  entityId: number;
  filename: string;
}): string {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const sanitized = sanitizeFilename(params.filename);
  const unique = randomUUID().slice(0, 8);
  
  return `company-${params.companyId}/${params.entityType.toLowerCase()}/${year}/${month}/${params.entityType.toLowerCase()}-${params.entityId}/${unique}-${sanitized}`;
}

// Example output:
// company-1/inspections/2025/01/inspection-12345/a3f9b2e4-photo-tyres.jpg
```

---

## Retention & Lifecycle Management

### Automatic Retention Calculation

When creating an inspection:

```typescript
const retentionUntil = new Date(inspection.createdAt);
retentionUntil.setMonth(retentionUntil.getMonth() + 15);

await db.insert(inspections).values({
  ...inspectionData,
  retentionUntil
});
```

### Lifecycle Policy (GCS)

Configure Object Storage bucket lifecycle:

```json
{
  "lifecycle": {
    "rule": [
      {
        "action": { "type": "SetStorageClass", "storageClass": "COLDLINE" },
        "condition": { "age": 90 }
      },
      {
        "action": { "type": "Delete" },
        "condition": { "age": 456 }
      }
    ]
  }
}
```

**Policy explanation:**
- After 90 days: Move to COLDLINE (cheaper storage)
- After 456 days (15 months): Auto-delete

### Manual Archive Process

For companies that want to keep records longer:

```typescript
async function archiveInspection(inspectionId: number) {
  // Mark as archived (won't be deleted by lifecycle)
  await db.update(inspections)
    .set({ 
      isArchived: true,
      retentionUntil: null // Never expires
    })
    .where(eq(inspections.id, inspectionId));
  
  // Move files to archive storage class
  await storageService.moveToArchive(inspectionId);
}
```

---

## Multi-Tenant Security

### Access Control Layers

**1. Database Level:**
```typescript
// Every query MUST include companyId filter
const inspections = await db.select()
  .from(inspections)
  .where(eq(inspections.companyId, session.companyId));
```

**2. Storage Level:**
```typescript
// Validate company owns the file before generating signed URL
async function getFileUrl(fileId: number, userId: number) {
  const file = await db.select()
    .from(storageFiles)
    .where(eq(storageFiles.id, fileId))
    .limit(1);
  
  if (!file || file.companyId !== session.companyId) {
    throw new Error('File not found');
  }
  
  // Generate signed URL (expires in 1 hour)
  return await signObjectURL({
    path: file.objectStoragePath,
    expiresIn: 3600
  });
}
```

**3. API Level:**
```typescript
// Middleware validates session and company access
app.get('/api/files/:id', requireAuth, async (req, res) => {
  const file = await storageService.getFile(req.params.id, req.user.id);
  
  // Audit log
  await auditLog.create({
    companyId: req.user.companyId,
    userId: req.user.id,
    action: 'FILE_ACCESS',
    entityType: 'STORAGE_FILE',
    entityId: file.id,
    metadata: { filename: file.filename }
  });
  
  res.json({ url: file.objectStorageUrl });
});
```

---

## Cost Optimization

### Storage Tiers

| Tier | Use Case | Cost (per GB/month) | Retrieval Cost |
|------|----------|---------------------|----------------|
| **STANDARD** | Active inspections (0-90 days) | $0.020 | Free |
| **COLDLINE** | Compliance storage (90 days - 15 months) | $0.004 | $0.01/GB |
| **ARCHIVE** | Long-term retention (15+ months) | $0.0012 | $0.05/GB |

### Cost Calculation Example

**Assumptions:**
- 100 companies
- 50 drivers per company
- 2 inspections per driver per day
- 5 photos per inspection (2MB average)
- 250 working days per year

**Annual Storage:**
```
100 companies × 50 drivers × 2 inspections × 250 days × 5 photos × 2MB
= 12,500,000 photos × 2MB
= 25,000 GB (25 TB)
```

**Cost Breakdown:**
- First 90 days (STANDARD): 6,164 GB × $0.020 = $123/month
- 90 days - 15 months (COLDLINE): 18,836 GB × $0.004 = $75/month
- **Total: ~$200/month for 100 companies**

**Per-Company Cost:** $2/month

---

## Migration Strategy

### Phase 1: Add New Storage System (No Breaking Changes)

1. Create `storage_files` table
2. Deploy `StorageService`
3. Update inspection upload to use both systems:
   - Upload to Object Storage (new)
   - Upload to Drive (existing, if configured)
4. Store both paths in database

### Phase 2: Migrate Existing Data

1. Background job: Copy Drive files to Object Storage
2. Update `storage_files` table with new paths
3. Verify all files accessible

### Phase 3: Deprecate Drive Dependency

1. Make Drive optional (not required)
2. Update UI to use Object Storage URLs
3. Keep Drive sync as optional feature

---

## DVSA Compliance Checklist

### Requirements

- [x] **15-month retention** - Lifecycle policy enforces
- [x] **Immutable records** - Write-once storage
- [x] **Audit trail** - Every access logged
- [x] **Quick retrieval** - Signed URLs in < 1 second
- [x] **Organized structure** - Company/Year/Month folders
- [x] **Backup/redundancy** - GCS multi-region replication
- [x] **Tamper-proof** - No delete API for companies
- [x] **Inspection timing** - `startedAt`, `completedAt`, `durationSeconds` tracked

### Audit Report Generation

```typescript
async function generateDVSAAuditReport(companyId: number, startDate: Date, endDate: Date) {
  const inspections = await db.select()
    .from(inspections)
    .where(
      and(
        eq(inspections.companyId, companyId),
        gte(inspections.createdAt, startDate),
        lte(inspections.createdAt, endDate)
      )
    );
  
  const report = {
    company: await getCompany(companyId),
    period: { startDate, endDate },
    totalInspections: inspections.length,
    inspections: inspections.map(i => ({
      id: i.id,
      vehicle: i.vehicleId,
      driver: i.driverId,
      date: i.createdAt,
      duration: i.durationSeconds,
      status: i.status,
      photoCount: i.photoCount,
      storageFolder: i.storageFolder,
      retentionUntil: i.retentionUntil
    }))
  };
  
  return report;
}
```

---

## Implementation Roadmap

### Week 1: Foundation
- [ ] Create `storage_files` table schema
- [ ] Implement `StorageService` class
- [ ] Add path generation utilities
- [ ] Write unit tests for storage service

### Week 2: Integration
- [ ] Update inspection upload flow
- [ ] Add file listing API endpoints
- [ ] Implement signed URL generation
- [ ] Add audit logging for file access

### Week 3: Migration
- [ ] Build Drive → Object Storage migration script
- [ ] Test migration with sample data
- [ ] Update frontend to use new storage URLs
- [ ] Deploy to staging

### Week 4: Production
- [ ] Deploy to production
- [ ] Monitor storage costs
- [ ] Configure lifecycle policies
- [ ] Document for customers

---

## Monitoring & Alerts

### Key Metrics

1. **Storage Growth:** Track GB per company per month
2. **Upload Success Rate:** % of successful uploads
3. **Retrieval Latency:** Time to generate signed URL
4. **Cost per Company:** Monthly storage cost breakdown
5. **Retention Compliance:** Files older than 15 months

### Alerts

- Storage cost > $500/month
- Upload failure rate > 1%
- File retrieval latency > 2 seconds
- Files past retention date not archived

---

## Security Considerations

### Encryption

- **At Rest:** GCS default encryption (AES-256)
- **In Transit:** HTTPS only, TLS 1.3
- **Signed URLs:** Short-lived (1 hour), single-use

### Access Control

- **Database:** Row-level security via `companyId`
- **Storage:** Path-based isolation
- **API:** Session validation + company check

### Compliance

- **GDPR:** Right to deletion (delete company folder)
- **DVSA:** 15-month retention enforced
- **ISO 27001:** Audit logs for all access

---

## Conclusion

This architecture provides:

✅ **Enterprise-grade** multi-tenant isolation  
✅ **DVSA-compliant** 15-month retention  
✅ **Scalable** to 1000+ companies  
✅ **Cost-effective** with lifecycle management  
✅ **Secure** with audit trails and encryption  
✅ **Flexible** with optional Drive integration  

**Next Steps:**
1. Review and approve architecture
2. Implement `storage_files` table
3. Build `StorageService` class
4. Update inspection upload flow
5. Test with sample data
6. Deploy to production

**Estimated Implementation Time:** 3-4 weeks
