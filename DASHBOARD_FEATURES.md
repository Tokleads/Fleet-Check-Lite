# Titan Fleet Dashboard - New Features

This document describes the newly implemented real-time tracking, geofencing, timesheet management, and broadcast messaging features for the Titan Fleet manager dashboard.

## Overview

The Titan Fleet dashboard now includes a comprehensive command center for fleet operators with real-time GPS tracking, automated timesheet management, and instant driver communication capabilities.

## Features

### 1. Live Tracking (`/manager/live-tracking`)

Real-time GPS tracking dashboard with Google Maps integration.

**Key Features:**
- Interactive map displaying all active driver locations
- Color-coded markers (blue = active, red = stagnant)
- Auto-refresh every 30 seconds
- Live statistics:
  - Active drivers count
  - Stagnant drivers count
  - Average fleet speed
  - Active alerts count
- Stagnation alert panel with one-click acknowledgment
- Driver info windows showing speed, last update time, and status

**Technical Details:**
- Uses Google Maps JavaScript API with custom dark theme styling
- Fetches driver locations from `/api/manager/driver-locations/:companyId`
- Fetches stagnation alerts from `/api/stagnation-alerts/:companyId?status=ACTIVE`
- Markers update automatically when location data changes
- Map auto-centers on first load to show all drivers

**Google Maps API Key:**
You need to add a Google Maps API key to the LiveTracking.tsx file. Replace `YOUR_GOOGLE_MAPS_API_KEY` on line 98 with your actual API key from the Google Cloud Console.

### 2. Timesheets Management (`/manager/timesheets`)

Automated depot-based time tracking with CSV export.

**Key Features:**
- View all timesheets with filtering options
- Filter by status (All/Active/Completed)
- Date range selection for historical data
- CSV export with proper formatting
- Statistics dashboard showing:
  - Total entries
  - Active timesheets
  - Completed timesheets
  - Total hours worked
- Duration calculations in hours and minutes
- Arrival and departure timestamps

**Technical Details:**
- Fetches timesheets from `/api/timesheets/:companyId`
- CSV export via `/api/timesheets/export` (POST)
- CSV format: Driver Name, Arrival, Departure, Depot Name, Duration (minutes)
- Automatic duration calculation from arrival/departure times
- Manual override capability via PATCH `/api/timesheets/:id`

**Automatic Timesheet Creation:**
Timesheets are automatically created when:
1. Driver enters a geofence (250m radius of depot)
2. GPS location is submitted via `/api/driver/location`
3. Geofence detection logic runs in `storage.checkGeofences()`
4. New timesheet record created with status "ACTIVE"

**Automatic Timesheet Closure:**
Timesheets are automatically closed when:
1. Driver exits the geofence radius
2. Departure time, coordinates, and total minutes are calculated
3. Status changed to "COMPLETED"

### 3. Titan Command (`/manager/titan-command`)

Instant broadcast messaging system for driver communication.

**Key Features:**
- Broadcast messages to all active drivers
- Individual driver messaging
- Priority levels:
  - LOW: General information
  - NORMAL: Standard updates
  - HIGH: Important notices
  - URGENT: Critical safety alerts
- Message composer with title and content
- Active driver list showing available recipients
- Success confirmations

**Technical Details:**
- Broadcast endpoint: `/api/notifications/broadcast` (POST)
- Individual endpoint: `/api/notifications/individual` (POST)
- Broadcasts automatically create notifications for all active drivers
- Notifications include sender ID, timestamp, and read status
- Priority affects visual presentation in driver app

**API Payload:**
```json
{
  "companyId": 1,
  "senderId": 2,
  "title": "Route Change",
  "message": "New delivery route assigned",
  "priority": "HIGH"
}
```

### 4. Geofence Management (`/manager/geofences`)

Configure depot locations for automatic timesheet tracking.

**Key Features:**
- Create new geofences with name, lat/long, radius
- Preset depot locations (Head Office, Clay Lane, Woodlands)
- Edit existing geofences
- Toggle active/inactive status
- Visual status indicators
- 250m default radius (configurable)

**Technical Details:**
- Create: `/api/geofences` (POST)
- List: `/api/geofences/:companyId` (GET)
- Update: `/api/geofences/:id` (PATCH)
- Uses Haversine formula for distance calculation
- Geofence detection runs on every GPS ping

**Preset Depot Coordinates:**
- Head Office: 51.5074, -0.1278
- Clay Lane: 51.5155, -0.0922
- Woodlands: 51.4975, -0.1357

## Database Schema

### New Tables

**driver_locations**
- Stores GPS pings from mobile app (5-minute intervals)
- Fields: driverId, latitude, longitude, speed, heading, accuracy, isStagnant, timestamp

**geofences**
- Depot locations with radius for timesheet automation
- Fields: companyId, name, latitude, longitude, radiusMeters, isActive

**timesheets**
- Automated time tracking records
- Fields: driverId, depotId, depotName, arrivalTime, departureTime, totalMinutes, status

**stagnation_alerts**
- Alerts when driver inactive for 30+ minutes
- Fields: driverId, latitude, longitude, stagnationStartTime, stagnationDurationMinutes, status

**notifications**
- Titan Command messages
- Fields: senderId, recipientId, isBroadcast, title, message, priority, isRead

## API Endpoints

### GPS Tracking
- `POST /api/driver/location` - Submit GPS location from mobile app
- `GET /api/manager/driver-locations/:companyId` - Get latest locations for all drivers

### Geofencing
- `POST /api/geofences` - Create new geofence
- `GET /api/geofences/:companyId` - List all geofences
- `PATCH /api/geofences/:id` - Update geofence

### Timesheets
- `GET /api/timesheets/:companyId` - Get timesheets (with filters)
- `POST /api/timesheets/export` - Export timesheets as CSV
- `PATCH /api/timesheets/:id` - Manual timesheet override

### Stagnation Alerts
- `GET /api/stagnation-alerts/:companyId` - Get alerts (with status filter)
- `PATCH /api/stagnation-alerts/:id` - Acknowledge alert

### Notifications (Titan Command)
- `POST /api/notifications/broadcast` - Send broadcast message
- `POST /api/notifications/individual` - Send individual message
- `GET /api/notifications/:driverId` - Get driver notifications
- `PATCH /api/notifications/:id/read` - Mark notification as read

## Setup Instructions

### 1. Database Migration

Run the database migration to create new tables:

```bash
cd /home/ubuntu/titan-fleet
npm run db:push
```

### 2. Seed Geofences

Add the three preset depot locations:

```bash
npx tsx script/seed-geofences.ts
```

### 3. Google Maps API Key

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing
3. Enable Maps JavaScript API
4. Create API key with restrictions
5. Update `client/src/pages/manager/LiveTracking.tsx` line 98 with your key

### 4. Mobile App GPS Integration

The mobile driver app needs to send GPS pings every 5 minutes:

```typescript
// Example mobile app code
setInterval(async () => {
  const position = await getCurrentPosition();
  await fetch('/api/driver/location', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      driverId: currentDriver.id,
      companyId: currentCompany.id,
      latitude: position.coords.latitude.toString(),
      longitude: position.coords.longitude.toString(),
      speed: position.coords.speed || 0,
      heading: position.coords.heading,
      accuracy: position.coords.accuracy
    })
  });
}, 5 * 60 * 1000); // Every 5 minutes
```

## How It Works

### Stagnation Detection

1. Driver submits GPS location every 5 minutes
2. Backend checks last 7 locations (35 minutes of data)
3. If coordinates unchanged for 30+ minutes AND speed = 0:
   - Create stagnation alert
   - Mark location as stagnant
   - Display red marker on map
   - Show alert in dashboard panel

### Geofence-Based Timesheets

1. Driver submits GPS location
2. Backend calculates distance to all active geofences using Haversine formula
3. If distance ≤ 250m (inside geofence):
   - Check for active timesheet
   - If none exists, create new timesheet with arrival time
4. If distance > 250m (outside geofence):
   - Check for active timesheet
   - If exists, close timesheet with departure time and calculate duration

### Broadcast Messaging

1. Manager composes message in Titan Command
2. Selects broadcast or individual mode
3. Sets priority level
4. Backend creates notification records:
   - Broadcast: One notification per active driver
   - Individual: Single notification for selected driver
5. Driver app fetches notifications via `/api/notifications/:driverId`
6. Unread notifications shown with badge
7. Driver marks as read via `/api/notifications/:id/read`

## Navigation

New pages added to manager sidebar:
- 🧭 Live Tracking
- ⏰ Timesheets
- 📡 Titan Command
- 📍 Geofences

## Testing

### Test Stagnation Detection

1. Create test driver location with speed = 0
2. Submit 7 identical locations 5 minutes apart
3. Check `/api/stagnation-alerts/:companyId` for new alert
4. Verify red marker appears on Live Tracking map

### Test Geofence Timesheet

1. Create geofence at known coordinates
2. Submit driver location inside geofence radius
3. Check `/api/timesheets/:companyId` for new active timesheet
4. Submit location outside radius
5. Verify timesheet closed with duration calculated

### Test Titan Command

1. Go to `/manager/titan-command`
2. Select "Broadcast to All"
3. Enter title and message
4. Set priority to HIGH
5. Click send
6. Check `/api/notifications/:driverId` to verify delivery

## Troubleshooting

**Map not loading:**
- Check Google Maps API key is valid
- Verify Maps JavaScript API is enabled in Google Cloud Console
- Check browser console for errors

**Timesheets not auto-creating:**
- Verify geofences are active (`isActive = true`)
- Check driver location accuracy (should be < 50m for reliable detection)
- Ensure GPS pings are being submitted every 5 minutes

**Stagnation alerts not triggering:**
- Need at least 30 minutes of location data (6+ pings)
- Speed must be 0 km/h
- Coordinates must be identical across all pings

**CSV export empty:**
- Check date range includes completed timesheets
- Verify timesheets exist with status "COMPLETED"
- Check browser console for export errors

## Future Enhancements

- [ ] Add resolution notes for stagnation alerts
- [ ] Driver notification inbox in mobile app
- [ ] Push notification delivery via FCM
- [ ] Real-time WebSocket updates for map
- [ ] Geofence heatmap visualization
- [ ] Timesheet approval workflow
- [ ] Route replay from historical GPS data
- [ ] Driver performance analytics
