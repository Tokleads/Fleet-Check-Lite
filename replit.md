# FleetCheck Lite Drive

A premium, multi-tenant fleet management application with separate mobile-optimized workflows for Drivers and Managers.

## Overview

FleetCheck Lite Drive provides:
- **Driver Portal**: Vehicle inspections, defect reporting, fuel entry with mobile-first UX
- **Manager Console**: Dashboard, settings, white-label branding (in development)
- **DVSA Integration**: Real-time MOT status lookup via official API

## Quick Start

### Demo Credentials
- **Company Code**: APEX
- **Driver PIN**: 1234

### Test Vehicles
15 vehicles are seeded with registration numbers like KX65ABC, LR19XYZ, MN22OPA

## Project Architecture

### Tech Stack
- **Frontend**: React + TypeScript + Vite + TailwindCSS
- **Backend**: Express + TypeScript
- **Database**: PostgreSQL with Drizzle ORM
- **UI Components**: Custom "Titan Fleet" design system
- **Styling**: Mobile-first, Inter + Oswald fonts, premium feel

### Key Files
```
shared/schema.ts       - Database models (Companies, Users, Vehicles, etc.)
server/routes.ts       - API endpoints
server/storage.ts      - Database operations
server/dvsa.ts         - DVSA API integration
client/src/lib/api.ts  - Frontend API client
client/src/lib/session.ts - Session management
client/src/pages/      - React pages
client/src/components/titan-ui/ - Custom UI components
```

### Database Models
- **Companies**: Multi-tenant root with branding settings
- **Users**: Drivers and Managers with PIN authentication
- **Vehicles**: Fleet with VRM, make/model, MOT dates
- **Inspections**: Daily/end-of-shift vehicle checks
- **FuelEntries**: Diesel/AdBlue fuel logs
- **VehicleUsage**: Track recent vehicles per driver

## Environment Variables

### Secrets (encrypted)
- `DVSA_CLIENT_ID` - DVSA OAuth client ID
- `DVSA_CLIENT_SECRET` - DVSA OAuth client secret
- `DVSA_API_KEY` - DVSA API key

### Environment Variables
- `DVSA_TOKEN_URL` - OAuth token endpoint
- `DVSA_SCOPE_URL` - OAuth scope
- `DATABASE_URL` - PostgreSQL connection string

## API Endpoints

### Core
- `GET /api/company/:code` - Get company by code
- `GET /api/vehicles?companyId=` - List vehicles
- `GET /api/vehicles/search?companyId=&query=` - Search vehicles
- `GET /api/vehicles/recent?companyId=&driverId=` - Recent vehicles
- `POST /api/inspections` - Create inspection
- `GET /api/inspections` - Get driver inspections
- `POST /api/fuel` - Create fuel entry
- `GET /api/fuel` - Get driver fuel entries

### DVSA Integration
- `GET /api/dvsa/mot/:registration` - Get MOT status
- `GET /api/dvsa/vehicle/:registration` - Get full DVSA vehicle data

## Recent Changes

### 2025-12-12
- Connected frontend to PostgreSQL database (replaced mock data)
- Added DVSA API integration with OAuth2 authentication
- Created seed script with demo company and 15 vehicles
- Updated driver dashboard to use real API data
- Stored DVSA credentials securely as Replit secrets

## User Preferences
- Mobile-first driver experience (56px tap targets)
- Premium visual quality with motion, depth, glass effects
- Typography: Inter (UI) + Oswald (headings)
- "Industry titan" quality design system
