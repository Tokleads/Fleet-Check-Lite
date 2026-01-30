/**
 * Swagger/OpenAPI Documentation Configuration
 * Generates interactive API documentation for Titan Fleet
 */

import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import type { Express } from 'express';

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Titan Fleet API',
      version: '1.0.0',
      description: 'Enterprise-grade multi-tenant SaaS fleet management system API documentation',
      contact: {
        name: 'Titan Fleet Support',
        url: 'https://titanfleet.app/support',
        email: 'support@titanfleet.app',
      },
      license: {
        name: 'Proprietary',
        url: 'https://titanfleet.app/license',
      },
    },
    servers: [
      {
        url: 'http://localhost:3000',
        description: 'Development server',
      },
      {
        url: 'https://staging.titanfleet.app',
        description: 'Staging server',
      },
      {
        url: 'https://api.titanfleet.app',
        description: 'Production server',
      },
    ],
    components: {
      securitySchemes: {
        cookieAuth: {
          type: 'apiKey',
          in: 'cookie',
          name: 'connect.sid',
          description: 'Session cookie authentication',
        },
      },
      schemas: {
        // User schemas
        User: {
          type: 'object',
          properties: {
            id: { type: 'integer', example: 1 },
            email: { type: 'string', format: 'email', example: 'driver@example.com' },
            username: { type: 'string', example: 'john_driver' },
            fullName: { type: 'string', example: 'John Driver' },
            role: { 
              type: 'string', 
              enum: ['ADMIN', 'TRANSPORT_MANAGER', 'DRIVER', 'MECHANIC', 'AUDITOR'],
              example: 'DRIVER'
            },
            companyId: { type: 'integer', example: 1 },
            phone: { type: 'string', example: '+447123456789' },
            isActive: { type: 'boolean', example: true },
            createdAt: { type: 'string', format: 'date-time' },
          },
        },
        
        // Vehicle schemas
        Vehicle: {
          type: 'object',
          properties: {
            id: { type: 'integer', example: 1 },
            companyId: { type: 'integer', example: 1 },
            registration: { type: 'string', example: 'AB12 CDE' },
            make: { type: 'string', example: 'Ford' },
            model: { type: 'string', example: 'Transit' },
            year: { type: 'integer', example: 2023 },
            vin: { type: 'string', example: '1HGBH41JXMN109186' },
            type: { 
              type: 'string', 
              enum: ['VAN', 'TRUCK', 'LORRY', 'TRAILER', 'OTHER'],
              example: 'VAN'
            },
            status: { 
              type: 'string', 
              enum: ['ACTIVE', 'MAINTENANCE', 'OUT_OF_SERVICE', 'RETIRED'],
              example: 'ACTIVE'
            },
            currentMileage: { type: 'integer', example: 50000 },
            createdAt: { type: 'string', format: 'date-time' },
          },
        },
        
        // Inspection schemas
        Inspection: {
          type: 'object',
          properties: {
            id: { type: 'integer', example: 1 },
            vehicleId: { type: 'integer', example: 1 },
            driverId: { type: 'integer', example: 1 },
            companyId: { type: 'integer', example: 1 },
            type: { 
              type: 'string', 
              enum: ['PRE_TRIP', 'POST_TRIP', 'WEEKLY', 'MONTHLY'],
              example: 'PRE_TRIP'
            },
            odometerReading: { type: 'integer', example: 50000 },
            fuelLevel: { type: 'number', example: 75 },
            overallStatus: { 
              type: 'string', 
              enum: ['PASS', 'ADVISORY', 'FAIL'],
              example: 'PASS'
            },
            notes: { type: 'string', example: 'All checks passed' },
            photoUrls: { 
              type: 'array', 
              items: { type: 'string', format: 'uri' },
              example: ['https://storage.googleapis.com/...']
            },
            createdAt: { type: 'string', format: 'date-time' },
          },
        },
        
        // Defect schemas
        Defect: {
          type: 'object',
          properties: {
            id: { type: 'integer', example: 1 },
            inspectionId: { type: 'integer', example: 1 },
            vehicleId: { type: 'integer', example: 1 },
            reportedBy: { type: 'integer', example: 1 },
            companyId: { type: 'integer', example: 1 },
            category: { 
              type: 'string', 
              enum: ['TYRES', 'LIGHTS', 'BRAKES', 'FLUIDS', 'BODY', 'INTERIOR', 'ENGINE', 'OTHER'],
              example: 'BRAKES'
            },
            severity: { 
              type: 'string', 
              enum: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'],
              example: 'HIGH'
            },
            status: { 
              type: 'string', 
              enum: ['OPEN', 'ASSIGNED', 'IN_PROGRESS', 'RECTIFIED', 'VERIFIED', 'CLOSED'],
              example: 'OPEN'
            },
            title: { type: 'string', example: 'Brake pad worn' },
            description: { type: 'string', example: 'Front left brake pad is worn and needs replacement' },
            assignedTo: { type: 'integer', example: 2 },
            createdAt: { type: 'string', format: 'date-time' },
          },
        },
        
        // Reminder schemas
        Reminder: {
          type: 'object',
          properties: {
            id: { type: 'integer', example: 1 },
            companyId: { type: 'integer', example: 1 },
            vehicleId: { type: 'integer', example: 1 },
            type: { 
              type: 'string', 
              enum: ['MOT', 'SERVICE', 'TACHO', 'INSURANCE', 'TAX', 'INSPECTION'],
              example: 'MOT'
            },
            title: { type: 'string', example: 'MOT Due' },
            dueDate: { type: 'string', format: 'date' },
            status: { 
              type: 'string', 
              enum: ['ACTIVE', 'SNOOZED', 'COMPLETED', 'DISMISSED'],
              example: 'ACTIVE'
            },
            escalationLevel: { 
              type: 'string', 
              enum: ['NORMAL', 'URGENT', 'CRITICAL', 'OVERDUE'],
              example: 'NORMAL'
            },
            isRecurring: { type: 'boolean', example: false },
            createdAt: { type: 'string', format: 'date-time' },
          },
        },
        
        // Error response
        Error: {
          type: 'object',
          properties: {
            error: {
              type: 'object',
              properties: {
                type: { 
                  type: 'string', 
                  enum: ['VALIDATION_ERROR', 'AUTHENTICATION_ERROR', 'AUTHORIZATION_ERROR', 'NOT_FOUND_ERROR', 'CONFLICT_ERROR', 'INTERNAL_ERROR'],
                  example: 'VALIDATION_ERROR'
                },
                message: { type: 'string', example: 'Validation failed' },
                details: { 
                  type: 'array',
                  items: {
                    type: 'object',
                    properties: {
                      field: { type: 'string', example: 'email' },
                      message: { type: 'string', example: 'Invalid email format' },
                    },
                  },
                },
                timestamp: { type: 'string', format: 'date-time' },
                path: { type: 'string', example: '/api/users' },
              },
            },
          },
        },
      },
    },
    security: [
      {
        cookieAuth: [],
      },
    ],
    tags: [
      { name: 'Authentication', description: 'User authentication endpoints' },
      { name: 'Users', description: 'User management endpoints' },
      { name: 'Vehicles', description: 'Vehicle management endpoints' },
      { name: 'Inspections', description: 'Vehicle inspection endpoints' },
      { name: 'Defects', description: 'Defect management endpoints' },
      { name: 'Reminders', description: 'Reminder system endpoints' },
      { name: 'Timesheets', description: 'Timesheet management endpoints' },
      { name: 'Reports', description: 'Report generation endpoints' },
      { name: 'GPS Tracking', description: 'Real-time GPS tracking endpoints' },
      { name: 'Geofences', description: 'Geofence management endpoints' },
      { name: 'Notifications', description: 'Notification endpoints' },
      { name: 'Audit Logs', description: 'Audit log endpoints' },
      { name: 'Health', description: 'Health check endpoints' },
    ],
  },
  apis: ['./server/routes.ts', './server/swagger-docs.ts'],
};

const swaggerSpec = swaggerJsdoc(options);

/**
 * Setup Swagger UI
 */
export function setupSwagger(app: Express) {
  // Serve Swagger UI
  app.use(
    '/api-docs',
    swaggerUi.serve,
    swaggerUi.setup(swaggerSpec, {
      customCss: '.swagger-ui .topbar { display: none }',
      customSiteTitle: 'Titan Fleet API Documentation',
    })
  );

  // Serve OpenAPI JSON
  app.get('/api-docs.json', (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.send(swaggerSpec);
  });

  console.log('📚 API documentation available at /api-docs');
}

export { swaggerSpec };
