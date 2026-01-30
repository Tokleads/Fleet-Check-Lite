import { db } from "../server/db";
import { geofences, companies } from "../shared/schema";
import { eq } from "drizzle-orm";

async function seedGeofences() {
  console.log("🌍 Seeding geofences...");

  try {
    // Get the APEX company (or first company)
    const [company] = await db.select().from(companies).where(eq(companies.companyCode, "APEX")).limit(1);
    
    if (!company) {
      console.error("❌ No company found. Please run the main seed script first.");
      process.exit(1);
    }

    const depots = [
      {
        companyId: company.id,
        name: "Head Office",
        latitude: "51.5074",
        longitude: "-0.1278",
        radiusMeters: 250,
        isActive: true
      },
      {
        companyId: company.id,
        name: "Clay Lane",
        latitude: "51.5155",
        longitude: "-0.0922",
        radiusMeters: 250,
        isActive: true
      },
      {
        companyId: company.id,
        name: "Woodlands",
        latitude: "51.4975",
        longitude: "-0.1357",
        radiusMeters: 250,
        isActive: true
      }
    ];

    for (const depot of depots) {
      // Check if geofence already exists
      const existing = await db.select()
        .from(geofences)
        .where(eq(geofences.name, depot.name))
        .limit(1);

      if (existing.length === 0) {
        await db.insert(geofences).values(depot);
        console.log(`✅ Created geofence: ${depot.name}`);
      } else {
        console.log(`⏭️  Geofence already exists: ${depot.name}`);
      }
    }

    console.log("✅ Geofence seeding complete!");
    process.exit(0);
  } catch (error) {
    console.error("❌ Error seeding geofences:", error);
    process.exit(1);
  }
}

seedGeofences();
