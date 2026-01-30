/**
 * Notification System Schema
 * 
 * Database schema for notification preferences, templates, and history.
 */

import { pgTable, serial, integer, varchar, text, boolean, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { companies, users, vehicles } from "./schema";

// Notification Preferences
export const notificationPreferences = pgTable("notification_preferences", {
  id: serial("id").primaryKey(),
  companyId: integer("company_id").references(() => companies.id).notNull(),
  userId: integer("user_id").references(() => users.id),
  
  // Notification channels
  emailEnabled: boolean("email_enabled").default(true),
  smsEnabled: boolean("sms_enabled").default(false),
  inAppEnabled: boolean("in_app_enabled").default(true),
  
  // Notification types
  motExpiryEnabled: boolean("mot_expiry_enabled").default(true),
  taxExpiryEnabled: boolean("tax_expiry_enabled").default(true),
  serviceDueEnabled: boolean("service_due_enabled").default(true),
  licenseExpiryEnabled: boolean("license_expiry_enabled").default(true),
  vorStatusEnabled: boolean("vor_status_enabled").default(true),
  defectReportedEnabled: boolean("defect_reported_enabled").default(true),
  inspectionFailedEnabled: boolean("inspection_failed_enabled").default(true),
  
  // Timing preferences
  motExpiryDays: integer("mot_expiry_days").default(30), // Notify X days before expiry
  taxExpiryDays: integer("tax_expiry_days").default(30),
  serviceDueDays: integer("service_due_days").default(14),
  licenseExpiryDays: integer("license_expiry_days").default(30),
  
  // Email preferences
  email: text("email"), // Override email address
  
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull()
});

export const insertNotificationPreferencesSchema = createInsertSchema(notificationPreferences).omit({ id: true, createdAt: true, updatedAt: true });
export type NotificationPreferences = typeof notificationPreferences.$inferSelect;
export type InsertNotificationPreferences = z.infer<typeof insertNotificationPreferencesSchema>;

// Notification History
export const notificationHistory = pgTable("notification_history", {
  id: serial("id").primaryKey(),
  companyId: integer("company_id").references(() => companies.id).notNull(),
  userId: integer("user_id").references(() => users.id),
  vehicleId: integer("vehicle_id").references(() => vehicles.id),
  
  // Notification details
  type: varchar("type", { length: 50 }).notNull(), // MOT_EXPIRY | TAX_EXPIRY | SERVICE_DUE | etc.
  channel: varchar("channel", { length: 20 }).notNull(), // EMAIL | SMS | IN_APP
  recipient: text("recipient").notNull(), // Email address or phone number
  subject: text("subject"),
  message: text("message").notNull(),
  
  // Status
  status: varchar("status", { length: 20 }).notNull().default("PENDING"), // PENDING | SENT | FAILED
  sentAt: timestamp("sent_at"),
  failureReason: text("failure_reason"),
  
  // Metadata
  metadata: jsonb("metadata"), // Additional data (vehicle VRM, expiry date, etc.)
  
  createdAt: timestamp("created_at").defaultNow().notNull()
});

export const insertNotificationHistorySchema = createInsertSchema(notificationHistory).omit({ id: true, createdAt: true });
export type NotificationHistory = typeof notificationHistory.$inferSelect;
export type InsertNotificationHistory = z.infer<typeof insertNotificationHistorySchema>;

// Notification Templates
export const notificationTemplates = pgTable("notification_templates", {
  id: serial("id").primaryKey(),
  companyId: integer("company_id").references(() => companies.id),
  
  // Template details
  type: varchar("type", { length: 50 }).notNull(), // MOT_EXPIRY | TAX_EXPIRY | etc.
  channel: varchar("channel", { length: 20 }).notNull(), // EMAIL | SMS
  name: text("name").notNull(),
  subject: text("subject"), // For emails
  template: text("template").notNull(), // Template with placeholders {{vehicleVRM}}, {{expiryDate}}, etc.
  
  // Status
  active: boolean("active").default(true),
  isDefault: boolean("is_default").default(false), // System default template
  
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull()
});

export const insertNotificationTemplatesSchema = createInsertSchema(notificationTemplates).omit({ id: true, createdAt: true, updatedAt: true });
export type NotificationTemplate = typeof notificationTemplates.$inferSelect;
export type InsertNotificationTemplate = z.infer<typeof insertNotificationTemplatesSchema>;
