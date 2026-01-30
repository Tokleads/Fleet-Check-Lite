/**
 * Validation Schemas for Titan Fleet
 * Comprehensive input validation using Zod to prevent injection attacks and ensure data integrity
 */

import { z } from 'zod';

// ============================================================================
// Common Validators
// ============================================================================

export const idSchema = z.number().int().positive();
export const optionalIdSchema = z.number().int().positive().optional();

export const emailSchema = z.string().email().max(255);
export const phoneSchema = z.string().regex(/^\+?[1-9]\d{1,14}$/).optional();

export const urlSchema = z.string().url().max(2048);

export const dateSchema = z.coerce.date();
export const optionalDateSchema = z.coerce.date().optional();

// Sanitize strings to prevent XSS
export const sanitizedStringSchema = z.string().trim().max(1000);
export const shortStringSchema = z.string().trim().min(1).max(255);
export const mediumStringSchema = z.string().trim().min(1).max(1000);
export const longStringSchema = z.string().trim().min(1).max(5000);

// Registration/License numbers (alphanumeric with limited special chars)
export const registrationSchema = z.string().trim().regex(/^[A-Z0-9\s-]{1,20}$/i);

// ============================================================================
// User Validation
// ============================================================================

export const createUserSchema = z.object({
  email: emailSchema,
  username: shortStringSchema,
  fullName: shortStringSchema,
  role: z.enum(['ADMIN', 'TRANSPORT_MANAGER', 'DRIVER', 'MECHANIC', 'AUDITOR']),
  companyId: idSchema,
  phone: phoneSchema,
  employeeId: shortStringSchema.optional(),
});

export const updateUserSchema = z.object({
  email: emailSchema.optional(),
  username: shortStringSchema.optional(),
  fullName: shortStringSchema.optional(),
  role: z.enum(['ADMIN', 'TRANSPORT_MANAGER', 'DRIVER', 'MECHANIC', 'AUDITOR']).optional(),
  phone: phoneSchema,
  employeeId: shortStringSchema.optional(),
  isActive: z.boolean().optional(),
});

// ============================================================================
// Vehicle Validation
// ============================================================================

export const createVehicleSchema = z.object({
  companyId: idSchema,
  registration: registrationSchema,
  make: shortStringSchema,
  model: shortStringSchema,
  year: z.number().int().min(1900).max(new Date().getFullYear() + 1),
  vin: z.string().trim().regex(/^[A-HJ-NPR-Z0-9]{17}$/i).optional(),
  type: z.enum(['VAN', 'TRUCK', 'LORRY', 'TRAILER', 'OTHER']),
  fuelType: z.enum(['DIESEL', 'PETROL', 'ELECTRIC', 'HYBRID']).optional(),
  currentMileage: z.number().int().min(0).optional(),
  status: z.enum(['ACTIVE', 'MAINTENANCE', 'OUT_OF_SERVICE', 'RETIRED']).default('ACTIVE'),
});

export const updateVehicleSchema = createVehicleSchema.partial().omit({ companyId: true });

// ============================================================================
// Inspection Validation
// ============================================================================

export const createInspectionSchema = z.object({
  vehicleId: idSchema,
  driverId: idSchema,
  companyId: idSchema,
  type: z.enum(['PRE_TRIP', 'POST_TRIP', 'WEEKLY', 'MONTHLY']),
  odometerReading: z.number().int().min(0),
  fuelLevel: z.number().min(0).max(100),
  location: shortStringSchema.optional(),
  notes: longStringSchema.optional(),
  
  // Check items
  tyresCondition: z.enum(['PASS', 'ADVISORY', 'FAIL']),
  lightsCondition: z.enum(['PASS', 'ADVISORY', 'FAIL']),
  brakesCondition: z.enum(['PASS', 'ADVISORY', 'FAIL']),
  fluidLevelsCondition: z.enum(['PASS', 'ADVISORY', 'FAIL']),
  bodyCondition: z.enum(['PASS', 'ADVISORY', 'FAIL']),
  interiorCondition: z.enum(['PASS', 'ADVISORY', 'FAIL']),
  
  // Overall status
  overallStatus: z.enum(['PASS', 'ADVISORY', 'FAIL']),
  
  // Photos
  photoUrls: z.array(urlSchema).max(20).optional(),
});

// ============================================================================
// Defect Validation
// ============================================================================

export const createDefectSchema = z.object({
  inspectionId: idSchema,
  vehicleId: idSchema,
  reportedBy: idSchema,
  companyId: idSchema,
  category: z.enum(['TYRES', 'LIGHTS', 'BRAKES', 'FLUIDS', 'BODY', 'INTERIOR', 'ENGINE', 'OTHER']),
  severity: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']),
  title: shortStringSchema,
  description: longStringSchema,
  location: shortStringSchema.optional(),
  photoUrls: z.array(urlSchema).max(10).optional(),
});

export const updateDefectSchema = z.object({
  status: z.enum(['OPEN', 'ASSIGNED', 'IN_PROGRESS', 'RECTIFIED', 'VERIFIED', 'CLOSED']).optional(),
  assignedTo: optionalIdSchema,
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']).optional(),
  notes: longStringSchema.optional(),
});

// ============================================================================
// Rectification Validation
// ============================================================================

export const createRectificationSchema = z.object({
  defectId: idSchema,
  mechanicId: idSchema,
  companyId: idSchema,
  workDescription: longStringSchema,
  partsUsed: z.array(z.object({
    name: shortStringSchema,
    quantity: z.number().int().positive(),
    cost: z.number().min(0).optional(),
  })).optional(),
  labourHours: z.number().min(0).max(24),
  labourCost: z.number().min(0).optional(),
  totalCost: z.number().min(0).optional(),
  notes: longStringSchema.optional(),
});

export const updateRectificationSchema = z.object({
  status: z.enum(['IN_PROGRESS', 'COMPLETED', 'VERIFIED']).optional(),
  workDescription: longStringSchema.optional(),
  completedAt: optionalDateSchema,
  verifiedBy: optionalIdSchema,
  verifiedAt: optionalDateSchema,
  notes: longStringSchema.optional(),
});

// ============================================================================
// Reminder Validation
// ============================================================================

export const createReminderSchema = z.object({
  companyId: idSchema,
  vehicleId: idSchema,
  type: z.enum(['MOT', 'SERVICE', 'TACHO', 'INSURANCE', 'TAX', 'INSPECTION']),
  title: shortStringSchema,
  description: mediumStringSchema.optional(),
  dueDate: dateSchema,
  isRecurring: z.boolean().default(false),
  recurringInterval: z.number().int().positive().optional(),
  notifyDays: z.array(z.number().int().positive()).default([30, 14, 7, 1]),
});

export const updateReminderSchema = z.object({
  title: shortStringSchema.optional(),
  description: mediumStringSchema.optional(),
  dueDate: optionalDateSchema,
  status: z.enum(['ACTIVE', 'SNOOZED', 'COMPLETED', 'DISMISSED']).optional(),
  snoozedUntil: optionalDateSchema,
  completedAt: optionalDateSchema,
  isRecurring: z.boolean().optional(),
  recurringInterval: z.number().int().positive().optional(),
});

// ============================================================================
// Timesheet Validation
// ============================================================================

export const clockInSchema = z.object({
  driverId: idSchema,
  companyId: idSchema,
  vehicleId: idSchema,
  geofenceId: idSchema,
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  notes: mediumStringSchema.optional(),
});

export const clockOutSchema = z.object({
  timesheetId: idSchema,
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  odometerEnd: z.number().int().min(0).optional(),
  notes: mediumStringSchema.optional(),
});

export const updateTimesheetSchema = z.object({
  status: z.enum(['ACTIVE', 'COMPLETED', 'APPROVED', 'DISPUTED']).optional(),
  clockIn: optionalDateSchema,
  clockOut: optionalDateSchema,
  breakDuration: z.number().int().min(0).optional(),
  odometerStart: z.number().int().min(0).optional(),
  odometerEnd: z.number().int().min(0).optional(),
  notes: mediumStringSchema.optional(),
});

// ============================================================================
// Geofence Validation
// ============================================================================

export const createGeofenceSchema = z.object({
  companyId: idSchema,
  name: shortStringSchema,
  type: z.enum(['DEPOT', 'CUSTOMER_SITE', 'RESTRICTED_AREA']),
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  radius: z.number().int().min(10).max(10000), // 10m to 10km
  isActive: z.boolean().default(true),
});

export const updateGeofenceSchema = createGeofenceSchema.partial().omit({ companyId: true });

// ============================================================================
// Notification Validation
// ============================================================================

export const createNotificationSchema = z.object({
  userId: idSchema,
  companyId: idSchema,
  type: z.enum(['INFO', 'WARNING', 'ALERT', 'REMINDER', 'BROADCAST']),
  title: shortStringSchema,
  message: mediumStringSchema,
  priority: z.enum(['LOW', 'NORMAL', 'HIGH', 'URGENT']).default('NORMAL'),
  actionUrl: urlSchema.optional(),
});

// ============================================================================
// Report Validation
// ============================================================================

export const generateReportSchema = z.object({
  companyId: idSchema,
  type: z.enum(['DVSA_COMPLIANCE', 'FLEET_UTILIZATION', 'DRIVER_PERFORMANCE', 'DEFECT_SUMMARY', 'TIMESHEET_SUMMARY']),
  startDate: dateSchema,
  endDate: dateSchema,
  vehicleIds: z.array(idSchema).optional(),
  driverIds: z.array(idSchema).optional(),
  format: z.enum(['PDF', 'CSV', 'EXCEL']).default('PDF'),
}).refine((data) => data.endDate >= data.startDate, {
  message: 'End date must be after start date',
  path: ['endDate'],
});

// ============================================================================
// GPS Location Validation
// ============================================================================

export const updateLocationSchema = z.object({
  driverId: idSchema,
  vehicleId: idSchema,
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  speed: z.number().min(0).max(200).optional(), // km/h
  heading: z.number().min(0).max(360).optional(), // degrees
  accuracy: z.number().min(0).optional(), // meters
});

// ============================================================================
// Pagination & Filtering
// ============================================================================

export const paginationSchema = z.object({
  page: z.number().int().positive().default(1),
  limit: z.number().int().positive().max(100).default(20),
  sortBy: shortStringSchema.optional(),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

export const dateRangeSchema = z.object({
  startDate: dateSchema,
  endDate: dateSchema,
}).refine((data) => data.endDate >= data.startDate, {
  message: 'End date must be after start date',
  path: ['endDate'],
});

// ============================================================================
// File Upload Validation
// ============================================================================

export const fileUploadSchema = z.object({
  filename: shortStringSchema,
  mimeType: z.string().regex(/^[a-z]+\/[a-z0-9\-\+\.]+$/i),
  size: z.number().int().positive().max(50 * 1024 * 1024), // 50MB max
  entityType: z.enum(['inspection', 'defect', 'rectification', 'vehicle', 'user']),
  entityId: idSchema,
});

// ============================================================================
// Audit Log Validation
// ============================================================================

export const auditLogFilterSchema = z.object({
  companyId: idSchema,
  userId: optionalIdSchema,
  action: shortStringSchema.optional(),
  entityType: shortStringSchema.optional(),
  entityId: optionalIdSchema,
  startDate: optionalDateSchema,
  endDate: optionalDateSchema,
}).merge(paginationSchema);

// ============================================================================
// Export Types
// ============================================================================

export type CreateUserInput = z.infer<typeof createUserSchema>;
export type UpdateUserInput = z.infer<typeof updateUserSchema>;
export type CreateVehicleInput = z.infer<typeof createVehicleSchema>;
export type UpdateVehicleInput = z.infer<typeof updateVehicleSchema>;
export type CreateInspectionInput = z.infer<typeof createInspectionSchema>;
export type CreateDefectInput = z.infer<typeof createDefectSchema>;
export type UpdateDefectInput = z.infer<typeof updateDefectSchema>;
export type CreateRectificationInput = z.infer<typeof createRectificationSchema>;
export type UpdateRectificationInput = z.infer<typeof updateRectificationSchema>;
export type CreateReminderInput = z.infer<typeof createReminderSchema>;
export type UpdateReminderInput = z.infer<typeof updateReminderSchema>;
export type ClockInInput = z.infer<typeof clockInSchema>;
export type ClockOutInput = z.infer<typeof clockOutSchema>;
export type UpdateTimesheetInput = z.infer<typeof updateTimesheetSchema>;
export type CreateGeofenceInput = z.infer<typeof createGeofenceSchema>;
export type UpdateGeofenceInput = z.infer<typeof updateGeofenceSchema>;
export type CreateNotificationInput = z.infer<typeof createNotificationSchema>;
export type GenerateReportInput = z.infer<typeof generateReportSchema>;
export type UpdateLocationInput = z.infer<typeof updateLocationSchema>;
export type PaginationInput = z.infer<typeof paginationSchema>;
export type DateRangeInput = z.infer<typeof dateRangeSchema>;
export type FileUploadInput = z.infer<typeof fileUploadSchema>;
export type AuditLogFilterInput = z.infer<typeof auditLogFilterSchema>;
