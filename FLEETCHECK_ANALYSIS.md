# FleetCheck Professional - Dashboard Analysis

## Navigation Structure

### Top Navigation (Horizontal)
- Organisation
- Vehicles
- Drivers
- Assets
- Grey Fleet
- Mobile App
- Reports
- Dashboard
- More (dropdown)

### Left Sidebar (Vertical - Organisation Section)
- Overview (current page)
- Sites
- Departments
- Divisions
- Categories
- Staff
- Operator Licence
- Cost Centres
- Fuel Cards
- Supplier Invoices
- Contracts/Insurance
- Email Log
- Suppliers
- Alerts
- A&M

### Right Sidebar
- Data Integrity indicator (348)
- Alerts panel (0 Alerts)
- Active Filters

## Design Elements

**Color Scheme:**
- Dark navy sidebar (#0A2540 approx)
- Bright cyan accent (#00B8D4)
- White content area
- Light blue cards for promotions

**Layout:**
- Three-column layout (left nav, main content, right sidebar)
- Card-based content presentation
- Promotional cards with illustrations
- Icon-based navigation items

## Key Features Observed

1. **LicenceAssured** - Driver licence checking integration
2. **Training Webinars** - Built-in training system
3. **Partner Discounts** - Affinity partner integration
4. **Referral Program** - Client referral rewards
5. **Data Integrity Score** - Quality metrics (348 score shown)
6. **Alert System** - Right sidebar alerts panel
7. **Search** - Global search in header
8. **Account Menu** - User/company switcher

## Titan Fleet Differentiation Strategy

**Keep Similar (Industry Standard):**
- Multi-level navigation structure
- Card-based dashboard
- Alert/notification system
- Search functionality
- Data quality metrics

**Make Different (Legal Distinction):**
- Use Titan Fleet branding colors (Navy #0F172A, Titan Blue #00A3FF)
- Implement collapsible sidebar (not always-visible)
- Use modern shadcn/ui components (not their custom UI)
- Add real-time GPS tracking (not visible in FleetCheck)
- Implement our unique "Titan Command" messaging
- Use different icon set (Lucide React vs their custom icons)
- Mobile-first responsive design
- Dark mode support


## Vehicles Section Analysis

### Left Sidebar Navigation
- Overview (current)
- Vehicle List
- Safety Checks
- Defects
- Pending Defects
- Maintenance
- Services Due
- MOTs Due
- VOR (Vehicle Off Road)
- Vehicle Tax Due
- SORN
- Collisions
- Penalties
- Fuel Purchases
- Charge Points
- Unallocated
- Unknown
- Servicing Unknown
- Pool
- Pool Bookings
- Add Vehicle To Fleet

### Vehicle List (Left Panel)
- 39 total vehicles shown
- Searchable list
- Sortable (A-Z, Chronological)
- Filters: Hire/Non-Hire, VOR/Non-VOR, HGV/Non-HGV, Live/Discarded
- Vehicle cards show: Registration + Make/Model
- Visual indicators (icons/colors) for status

### Main Content - Dashboard Cards
**Grid layout with metric cards:**

1. **Pool vehicles free today**: 0 (Green card with car icon)
2. **Unknown vehicles**: 1 (Pink/magenta card with question mark)
3. **SORN vehicles**: 0 (Purple card with crossed-out car)
4. **VOR vehicles**: 0 (Purple card with garage icon)
5. **Open defects**: 6 (Purple card with wrench)
6. **Pending defects**: 343 (Purple card with clipboard)
7. **Vehicles not assigned to driver**: 39 (Purple card with person icon)
8. **Vehicles without daily safety checks**: 14 (Purple card with checklist)
9. **Vehicle tax overdue/due**: 4 (Purple card with warning)
10. **Services overdue/due**: 21 (Purple card with wrench)
11. **MOTs overdue/due**: 4 (Purple card with triangle warning)

### Recent Vehicle Movement Table
- Registration column
- Date column
- Shows last 5 movements
- Pagination (showing page 1)

### Recently Added Vehicles Table
- Registration column
- Date Added column
- Shows newest vehicles

### Right Sidebar - Alerts
- 59 Alerts shown
- Searchable
- Filterable (1 Active Filter)
- Color-coded by severity (red icons)
- Shows: Vehicle reg, Alert type, Status
- Alert types visible:
  - Pending Defect
  - Digital Tachograph Recalibration
  - Safety Inspection
  - Vehicle Tax
  - MOT Booking
  - MOT (HGV/PSV)

## Key Insights for Titan Fleet

**Must Have:**
1. Vehicle list with search/filter
2. Dashboard with key metrics (defects, inspections due, tax/MOT)
3. Alert system for overdue items
4. Recent activity tracking
5. Status indicators (VOR, SORN, Pool, etc.)

**Differentiation Opportunities:**
1. Add real-time GPS tracking to vehicle cards
2. Show driver currently assigned (live)
3. Add fuel level indicators
4. Show last inspection status with photos
5. Add vehicle utilization metrics
6. Implement drag-and-drop for driver assignment
7. Add vehicle health score
8. Show active timesheets per vehicle


## Drivers Section Analysis

### Left Sidebar Navigation
- Overview (current)
- Policies
- Licence Checks
- Driver List
- Inspections
- Unassigned Drivers
- Unlicensed Drivers
- Training Courses

### Driver List (Left Panel)
- 189 total drivers shown
- Searchable list
- Sortable (A-Z, Chronological)
- Filter: Include discarded/finished
- Driver cards show: Name + Department (Agency/Drivers)
- Visual indicators for status

### Main Content - Dashboard Cards
**Grid layout with metric cards:**

1. **Uninspected drivers**: 40 (Pink/red card with clipboard icon)
2. **Unassigned drivers**: 189 (Purple card with person icon)
3. **Total Live Drivers**: 189 (Purple card with list icon)

### Recent Driver Movement
- Empty section (no recent movements shown)
- "Capitalise All Driver Names" button visible

### Recently Added Drivers Table
- Driver Name column
- Date Added column
- Shows 6 most recent:
  - Tomasz Czabaj (20/01/2026)
  - Ionel Birica -Angel (08/01/2026)
  - Mateusz Mackow (05/01/2026)
  - Maciej Wardega (05/01/2026) - appears twice

### Recently Removed Drivers Table
- Driver Name column
- Date Removed column
- Shows 3 most recent:
  - Tomasz Czabaj (20/01/2026)
  - Maciej Wardega (05/01/2026)
  - Mateusz Mackow (05/01/2026)

### Right Sidebar - Alerts
- 40 Alerts shown
- All appear to be "Driving Licence Check" alerts
- Searchable
- Filterable (1 Active Filter)
- Color-coded (red icons)
- Shows driver initials + name

## Key Insights for Titan Fleet Driver Management

**Must Have:**
1. Driver list with search/filter
2. Dashboard with key metrics (uninspected, unassigned, total)
3. Licence check tracking
4. Recent activity (added/removed drivers)
5. Alert system for licence checks
6. Driver-vehicle assignment tracking

**Differentiation Opportunities:**
1. **Real-time location tracking** (show where each driver is now)
2. **Active timesheet status** (clocked in/out, hours today)
3. **End-of-shift check completion** (show who completed checks)
4. **Driver performance metrics** (inspections completed, defects reported)
5. **Communication system** (Titan Command integration)
6. **Shift scheduling** (upcoming shifts, availability)
7. **Driver photos** (for identification)
8. **Mobile app QR code** (easy driver onboarding)
