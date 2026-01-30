/**
 * Swagger/OpenAPI Endpoint Documentation
 * JSDoc annotations for API endpoints
 */

/**
 * @swagger
 * /api/health:
 *   get:
 *     summary: Health check endpoint
 *     description: Returns the health status of the API
 *     tags: [Health]
 *     responses:
 *       200:
 *         description: API is healthy
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: ok
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *                 uptime:
 *                   type: number
 *                   example: 12345.67
 */

/**
 * @swagger
 * /api/users:
 *   get:
 *     summary: Get all users
 *     description: Retrieve a list of all users in the company
 *     tags: [Users]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *         description: Number of items per page
 *     responses:
 *       200:
 *         description: List of users
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/User'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *   post:
 *     summary: Create a new user
 *     description: Create a new user in the system
 *     tags: [Users]
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - username
 *               - fullName
 *               - role
 *               - companyId
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               username:
 *                 type: string
 *               fullName:
 *                 type: string
 *               role:
 *                 type: string
 *                 enum: [ADMIN, TRANSPORT_MANAGER, DRIVER, MECHANIC, AUDITOR]
 *               companyId:
 *                 type: integer
 *               phone:
 *                 type: string
 *     responses:
 *       201:
 *         description: User created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       400:
 *         description: Validation error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */

/**
 * @swagger
 * /api/vehicles:
 *   get:
 *     summary: Get all vehicles
 *     description: Retrieve a list of all vehicles in the company
 *     tags: [Vehicles]
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: List of vehicles
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Vehicle'
 *   post:
 *     summary: Create a new vehicle
 *     description: Add a new vehicle to the fleet
 *     tags: [Vehicles]
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - companyId
 *               - registration
 *               - make
 *               - model
 *               - year
 *               - type
 *             properties:
 *               companyId:
 *                 type: integer
 *               registration:
 *                 type: string
 *               make:
 *                 type: string
 *               model:
 *                 type: string
 *               year:
 *                 type: integer
 *               vin:
 *                 type: string
 *               type:
 *                 type: string
 *                 enum: [VAN, TRUCK, LORRY, TRAILER, OTHER]
 *     responses:
 *       201:
 *         description: Vehicle created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Vehicle'
 */

/**
 * @swagger
 * /api/inspections:
 *   get:
 *     summary: Get all inspections
 *     description: Retrieve a list of vehicle inspections
 *     tags: [Inspections]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: query
 *         name: vehicleId
 *         schema:
 *           type: integer
 *         description: Filter by vehicle ID
 *       - in: query
 *         name: driverId
 *         schema:
 *           type: integer
 *         description: Filter by driver ID
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Filter by start date
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Filter by end date
 *     responses:
 *       200:
 *         description: List of inspections
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Inspection'
 *   post:
 *     summary: Create a new inspection
 *     description: Submit a vehicle walk-around inspection
 *     tags: [Inspections]
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Inspection'
 *     responses:
 *       201:
 *         description: Inspection created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Inspection'
 */

/**
 * @swagger
 * /api/defects:
 *   get:
 *     summary: Get all defects
 *     description: Retrieve a list of vehicle defects
 *     tags: [Defects]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: query
 *         name: vehicleId
 *         schema:
 *           type: integer
 *         description: Filter by vehicle ID
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [OPEN, ASSIGNED, IN_PROGRESS, RECTIFIED, VERIFIED, CLOSED]
 *         description: Filter by status
 *     responses:
 *       200:
 *         description: List of defects
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Defect'
 *   post:
 *     summary: Create a new defect
 *     description: Report a vehicle defect
 *     tags: [Defects]
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Defect'
 *     responses:
 *       201:
 *         description: Defect created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Defect'
 */

/**
 * @swagger
 * /api/reminders:
 *   get:
 *     summary: Get all reminders
 *     description: Retrieve a list of vehicle reminders
 *     tags: [Reminders]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: query
 *         name: vehicleId
 *         schema:
 *           type: integer
 *         description: Filter by vehicle ID
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           enum: [MOT, SERVICE, TACHO, INSURANCE, TAX, INSPECTION]
 *         description: Filter by reminder type
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [ACTIVE, SNOOZED, COMPLETED, DISMISSED]
 *         description: Filter by status
 *     responses:
 *       200:
 *         description: List of reminders
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Reminder'
 *   post:
 *     summary: Create a new reminder
 *     description: Create a vehicle maintenance reminder
 *     tags: [Reminders]
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Reminder'
 *     responses:
 *       201:
 *         description: Reminder created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Reminder'
 */

/**
 * @swagger
 * /api/reports/generate:
 *   post:
 *     summary: Generate a report
 *     description: Generate a compliance or performance report
 *     tags: [Reports]
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - companyId
 *               - type
 *               - startDate
 *               - endDate
 *             properties:
 *               companyId:
 *                 type: integer
 *               type:
 *                 type: string
 *                 enum: [DVSA_COMPLIANCE, FLEET_UTILIZATION, DRIVER_PERFORMANCE, DEFECT_SUMMARY, TIMESHEET_SUMMARY]
 *               startDate:
 *                 type: string
 *                 format: date
 *               endDate:
 *                 type: string
 *                 format: date
 *               format:
 *                 type: string
 *                 enum: [PDF, CSV, EXCEL]
 *                 default: PDF
 *     responses:
 *       200:
 *         description: Report generated successfully
 *         content:
 *           application/pdf:
 *             schema:
 *               type: string
 *               format: binary
 */

/**
 * @swagger
 * /api/gps/update:
 *   post:
 *     summary: Update GPS location
 *     description: Update driver's current GPS location
 *     tags: [GPS Tracking]
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - driverId
 *               - vehicleId
 *               - latitude
 *               - longitude
 *             properties:
 *               driverId:
 *                 type: integer
 *               vehicleId:
 *                 type: integer
 *               latitude:
 *                 type: number
 *                 minimum: -90
 *                 maximum: 90
 *               longitude:
 *                 type: number
 *                 minimum: -180
 *                 maximum: 180
 *               speed:
 *                 type: number
 *                 minimum: 0
 *               heading:
 *                 type: number
 *                 minimum: 0
 *                 maximum: 360
 *     responses:
 *       200:
 *         description: Location updated successfully
 */

/**
 * @swagger
 * /api/audit-logs:
 *   get:
 *     summary: Get audit logs
 *     description: Retrieve audit logs for compliance
 *     tags: [Audit Logs]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Filter by start date
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Filter by end date
 *       - in: query
 *         name: userId
 *         schema:
 *           type: integer
 *         description: Filter by user ID
 *       - in: query
 *         name: action
 *         schema:
 *           type: string
 *         description: Filter by action type
 *     responses:
 *       200:
 *         description: List of audit logs
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                   companyId:
 *                     type: integer
 *                   userId:
 *                     type: integer
 *                   action:
 *                     type: string
 *                   entityType:
 *                     type: string
 *                   entityId:
 *                     type: integer
 *                   timestamp:
 *                     type: string
 *                     format: date-time
 *                   currentHash:
 *                     type: string
 */

export {};
