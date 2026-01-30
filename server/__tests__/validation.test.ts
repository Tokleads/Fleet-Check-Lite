import { describe, it, expect } from 'vitest';
import {
  createUserSchema,
  createVehicleSchema,
  createInspectionSchema,
  createDefectSchema,
  createReminderSchema,
  clockInSchema,
  createGeofenceSchema,
  generateReportSchema,
  updateLocationSchema,
  fileUploadSchema,
} from '../../shared/validation';

describe('Validation Schemas', () => {
  describe('User Validation', () => {
    it('should validate correct user data', () => {
      const validUser = {
        email: 'test@example.com',
        username: 'testuser',
        fullName: 'Test User',
        role: 'DRIVER' as const,
        companyId: 1,
        phone: '+447123456789',
      };

      const result = createUserSchema.safeParse(validUser);
      expect(result.success).toBe(true);
    });

    it('should reject invalid email', () => {
      const invalidUser = {
        email: 'invalid-email',
        username: 'testuser',
        fullName: 'Test User',
        role: 'DRIVER' as const,
        companyId: 1,
      };

      const result = createUserSchema.safeParse(invalidUser);
      expect(result.success).toBe(false);
    });

    it('should reject invalid role', () => {
      const invalidUser = {
        email: 'test@example.com',
        username: 'testuser',
        fullName: 'Test User',
        role: 'INVALID_ROLE',
        companyId: 1,
      };

      const result = createUserSchema.safeParse(invalidUser);
      expect(result.success).toBe(false);
    });

    it('should reject negative company ID', () => {
      const invalidUser = {
        email: 'test@example.com',
        username: 'testuser',
        fullName: 'Test User',
        role: 'DRIVER' as const,
        companyId: -1,
      };

      const result = createUserSchema.safeParse(invalidUser);
      expect(result.success).toBe(false);
    });
  });

  describe('Vehicle Validation', () => {
    it('should validate correct vehicle data', () => {
      const validVehicle = {
        companyId: 1,
        registration: 'AB12 CDE',
        make: 'Ford',
        model: 'Transit',
        year: 2023,
        type: 'VAN' as const,
        status: 'ACTIVE' as const,
      };

      const result = createVehicleSchema.safeParse(validVehicle);
      expect(result.success).toBe(true);
    });

    it('should reject invalid registration format', () => {
      const invalidVehicle = {
        companyId: 1,
        registration: 'INVALID@REG!',
        make: 'Ford',
        model: 'Transit',
        year: 2023,
        type: 'VAN' as const,
      };

      const result = createVehicleSchema.safeParse(invalidVehicle);
      expect(result.success).toBe(false);
    });

    it('should reject future year', () => {
      const invalidVehicle = {
        companyId: 1,
        registration: 'AB12 CDE',
        make: 'Ford',
        model: 'Transit',
        year: 2030,
        type: 'VAN' as const,
      };

      const result = createVehicleSchema.safeParse(invalidVehicle);
      expect(result.success).toBe(false);
    });

    it('should validate VIN format', () => {
      const validVehicle = {
        companyId: 1,
        registration: 'AB12 CDE',
        make: 'Ford',
        model: 'Transit',
        year: 2023,
        vin: '1HGBH41JXMN109186',
        type: 'VAN' as const,
      };

      const result = createVehicleSchema.safeParse(validVehicle);
      expect(result.success).toBe(true);
    });

    it('should reject invalid VIN format', () => {
      const invalidVehicle = {
        companyId: 1,
        registration: 'AB12 CDE',
        make: 'Ford',
        model: 'Transit',
        year: 2023,
        vin: 'INVALID',
        type: 'VAN' as const,
      };

      const result = createVehicleSchema.safeParse(invalidVehicle);
      expect(result.success).toBe(false);
    });
  });

  describe('Inspection Validation', () => {
    it('should validate correct inspection data', () => {
      const validInspection = {
        vehicleId: 1,
        driverId: 1,
        companyId: 1,
        type: 'PRE_TRIP' as const,
        odometerReading: 50000,
        fuelLevel: 75,
        tyresCondition: 'PASS' as const,
        lightsCondition: 'PASS' as const,
        brakesCondition: 'PASS' as const,
        fluidLevelsCondition: 'PASS' as const,
        bodyCondition: 'PASS' as const,
        interiorCondition: 'PASS' as const,
        overallStatus: 'PASS' as const,
      };

      const result = createInspectionSchema.safeParse(validInspection);
      expect(result.success).toBe(true);
    });

    it('should reject negative odometer reading', () => {
      const invalidInspection = {
        vehicleId: 1,
        driverId: 1,
        companyId: 1,
        type: 'PRE_TRIP' as const,
        odometerReading: -100,
        fuelLevel: 75,
        tyresCondition: 'PASS' as const,
        lightsCondition: 'PASS' as const,
        brakesCondition: 'PASS' as const,
        fluidLevelsCondition: 'PASS' as const,
        bodyCondition: 'PASS' as const,
        interiorCondition: 'PASS' as const,
        overallStatus: 'PASS' as const,
      };

      const result = createInspectionSchema.safeParse(invalidInspection);
      expect(result.success).toBe(false);
    });

    it('should reject fuel level over 100', () => {
      const invalidInspection = {
        vehicleId: 1,
        driverId: 1,
        companyId: 1,
        type: 'PRE_TRIP' as const,
        odometerReading: 50000,
        fuelLevel: 150,
        tyresCondition: 'PASS' as const,
        lightsCondition: 'PASS' as const,
        brakesCondition: 'PASS' as const,
        fluidLevelsCondition: 'PASS' as const,
        bodyCondition: 'PASS' as const,
        interiorCondition: 'PASS' as const,
        overallStatus: 'PASS' as const,
      };

      const result = createInspectionSchema.safeParse(invalidInspection);
      expect(result.success).toBe(false);
    });

    it('should limit photo URLs to 20', () => {
      const photoUrls = Array(21).fill('https://example.com/photo.jpg');
      const invalidInspection = {
        vehicleId: 1,
        driverId: 1,
        companyId: 1,
        type: 'PRE_TRIP' as const,
        odometerReading: 50000,
        fuelLevel: 75,
        tyresCondition: 'PASS' as const,
        lightsCondition: 'PASS' as const,
        brakesCondition: 'PASS' as const,
        fluidLevelsCondition: 'PASS' as const,
        bodyCondition: 'PASS' as const,
        interiorCondition: 'PASS' as const,
        overallStatus: 'PASS' as const,
        photoUrls,
      };

      const result = createInspectionSchema.safeParse(invalidInspection);
      expect(result.success).toBe(false);
    });
  });

  describe('Defect Validation', () => {
    it('should validate correct defect data', () => {
      const validDefect = {
        inspectionId: 1,
        vehicleId: 1,
        reportedBy: 1,
        companyId: 1,
        category: 'BRAKES' as const,
        severity: 'HIGH' as const,
        title: 'Brake pad worn',
        description: 'Front left brake pad is worn and needs replacement',
      };

      const result = createDefectSchema.safeParse(validDefect);
      expect(result.success).toBe(true);
    });

    it('should reject empty title', () => {
      const invalidDefect = {
        inspectionId: 1,
        vehicleId: 1,
        reportedBy: 1,
        companyId: 1,
        category: 'BRAKES' as const,
        severity: 'HIGH' as const,
        title: '',
        description: 'Front left brake pad is worn and needs replacement',
      };

      const result = createDefectSchema.safeParse(invalidDefect);
      expect(result.success).toBe(false);
    });

    it('should limit photo URLs to 10', () => {
      const photoUrls = Array(11).fill('https://example.com/photo.jpg');
      const invalidDefect = {
        inspectionId: 1,
        vehicleId: 1,
        reportedBy: 1,
        companyId: 1,
        category: 'BRAKES' as const,
        severity: 'HIGH' as const,
        title: 'Brake pad worn',
        description: 'Front left brake pad is worn and needs replacement',
        photoUrls,
      };

      const result = createDefectSchema.safeParse(invalidDefect);
      expect(result.success).toBe(false);
    });
  });

  describe('Reminder Validation', () => {
    it('should validate correct reminder data', () => {
      const validReminder = {
        companyId: 1,
        vehicleId: 1,
        type: 'MOT' as const,
        title: 'MOT Due',
        dueDate: new Date('2025-03-01'),
        isRecurring: false,
      };

      const result = createReminderSchema.safeParse(validReminder);
      expect(result.success).toBe(true);
    });

    it('should validate recurring reminder', () => {
      const validReminder = {
        companyId: 1,
        vehicleId: 1,
        type: 'SERVICE' as const,
        title: 'Service Due',
        dueDate: new Date('2025-03-01'),
        isRecurring: true,
        recurringInterval: 90,
      };

      const result = createReminderSchema.safeParse(validReminder);
      expect(result.success).toBe(true);
    });
  });

  describe('GPS Location Validation', () => {
    it('should validate correct location data', () => {
      const validLocation = {
        driverId: 1,
        vehicleId: 1,
        latitude: 51.5074,
        longitude: -0.1278,
        speed: 60,
        heading: 180,
      };

      const result = updateLocationSchema.safeParse(validLocation);
      expect(result.success).toBe(true);
    });

    it('should reject invalid latitude', () => {
      const invalidLocation = {
        driverId: 1,
        vehicleId: 1,
        latitude: 100,
        longitude: -0.1278,
      };

      const result = updateLocationSchema.safeParse(invalidLocation);
      expect(result.success).toBe(false);
    });

    it('should reject invalid longitude', () => {
      const invalidLocation = {
        driverId: 1,
        vehicleId: 1,
        latitude: 51.5074,
        longitude: -200,
      };

      const result = updateLocationSchema.safeParse(invalidLocation);
      expect(result.success).toBe(false);
    });

    it('should reject negative speed', () => {
      const invalidLocation = {
        driverId: 1,
        vehicleId: 1,
        latitude: 51.5074,
        longitude: -0.1278,
        speed: -10,
      };

      const result = updateLocationSchema.safeParse(invalidLocation);
      expect(result.success).toBe(false);
    });
  });

  describe('Geofence Validation', () => {
    it('should validate correct geofence data', () => {
      const validGeofence = {
        companyId: 1,
        name: 'Head Office',
        type: 'DEPOT' as const,
        latitude: 51.5074,
        longitude: -0.1278,
        radius: 250,
      };

      const result = createGeofenceSchema.safeParse(validGeofence);
      expect(result.success).toBe(true);
    });

    it('should reject radius too small', () => {
      const invalidGeofence = {
        companyId: 1,
        name: 'Head Office',
        type: 'DEPOT' as const,
        latitude: 51.5074,
        longitude: -0.1278,
        radius: 5,
      };

      const result = createGeofenceSchema.safeParse(invalidGeofence);
      expect(result.success).toBe(false);
    });

    it('should reject radius too large', () => {
      const invalidGeofence = {
        companyId: 1,
        name: 'Head Office',
        type: 'DEPOT' as const,
        latitude: 51.5074,
        longitude: -0.1278,
        radius: 15000,
      };

      const result = createGeofenceSchema.safeParse(invalidGeofence);
      expect(result.success).toBe(false);
    });
  });

  describe('Report Generation Validation', () => {
    it('should validate correct report request', () => {
      const validReport = {
        companyId: 1,
        type: 'DVSA_COMPLIANCE' as const,
        startDate: new Date('2025-01-01'),
        endDate: new Date('2025-01-31'),
        format: 'PDF' as const,
      };

      const result = generateReportSchema.safeParse(validReport);
      expect(result.success).toBe(true);
    });

    it('should reject end date before start date', () => {
      const invalidReport = {
        companyId: 1,
        type: 'DVSA_COMPLIANCE' as const,
        startDate: new Date('2025-01-31'),
        endDate: new Date('2025-01-01'),
        format: 'PDF' as const,
      };

      const result = generateReportSchema.safeParse(invalidReport);
      expect(result.success).toBe(false);
    });
  });

  describe('File Upload Validation', () => {
    it('should validate correct file upload', () => {
      const validUpload = {
        filename: 'inspection-photo.jpg',
        mimeType: 'image/jpeg',
        size: 1024 * 1024, // 1MB
        entityType: 'inspection' as const,
        entityId: 1,
      };

      const result = fileUploadSchema.safeParse(validUpload);
      expect(result.success).toBe(true);
    });

    it('should reject file too large', () => {
      const invalidUpload = {
        filename: 'large-file.jpg',
        mimeType: 'image/jpeg',
        size: 60 * 1024 * 1024, // 60MB
        entityType: 'inspection' as const,
        entityId: 1,
      };

      const result = fileUploadSchema.safeParse(invalidUpload);
      expect(result.success).toBe(false);
    });

    it('should reject invalid MIME type format', () => {
      const invalidUpload = {
        filename: 'file.exe',
        mimeType: 'not-a-valid-mime',
        size: 1024,
        entityType: 'inspection' as const,
        entityId: 1,
      };

      const result = fileUploadSchema.safeParse(invalidUpload);
      expect(result.success).toBe(false);
    });
  });

  describe('Clock In/Out Validation', () => {
    it('should validate correct clock in data', () => {
      const validClockIn = {
        driverId: 1,
        companyId: 1,
        vehicleId: 1,
        geofenceId: 1,
        latitude: 51.5074,
        longitude: -0.1278,
      };

      const result = clockInSchema.safeParse(validClockIn);
      expect(result.success).toBe(true);
    });
  });
});
