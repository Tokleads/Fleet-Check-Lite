import { Router } from "express";
import { db } from "./db";
import { vehicles, users, inspections, defects } from "@shared/schema";
import { like, or, eq, and, sql } from "drizzle-orm";

const router = Router();

// GET /api/search - Global search across vehicles, drivers, inspections, defects
router.get("/", async (req, res) => {
  try {
    const { q, companyId } = req.query;

    if (!q || typeof q !== "string") {
      return res.status(400).json({ error: "Search query required" });
    }

    if (!companyId) {
      return res.status(400).json({ error: "Company ID required" });
    }

    const searchTerm = `%${q}%`;
    const companyIdNum = parseInt(companyId as string);

    // Search vehicles (VRM, make, model, fleet number)
    const vehicleResults = await db
      .select({
        id: vehicles.id,
        type: sql<string>`'vehicle'`,
        title: vehicles.vrm,
        subtitle: sql<string>`CONCAT(${vehicles.make}, ' ', ${vehicles.model})`,
        description: vehicles.fleetNumber,
        url: sql<string>`CONCAT('/manager/fleet')`,
      })
      .from(vehicles)
      .where(
        and(
          eq(vehicles.companyId, companyIdNum),
          or(
            like(vehicles.vrm, searchTerm),
            like(vehicles.make, searchTerm),
            like(vehicles.model, searchTerm),
            like(vehicles.fleetNumber, searchTerm)
          )
        )
      )
      .limit(5);

    // Search drivers (name, email)
    const driverResults = await db
      .select({
        id: users.id,
        type: sql<string>`'driver'`,
        title: users.name,
        subtitle: users.email,
        description: sql<string>`CASE WHEN ${users.active} THEN 'Active' ELSE 'Inactive' END`,
        url: sql<string>`CONCAT('/manager/drivers')`,
      })
      .from(users)
      .where(
        and(
          eq(users.companyId, companyIdNum),
          eq(users.role, 'driver'),
          or(
            like(users.name, searchTerm),
            like(users.email, searchTerm)
          )
        )
      )
      .limit(5);

    // Search inspections (by vehicle VRM or inspector name)
    const inspectionResults = await db
      .select({
        id: inspections.id,
        type: sql<string>`'inspection'`,
        title: sql<string>`CONCAT('Inspection #', ${inspections.id})`,
        subtitle: sql<string>`${vehicles.vrm}`,
        description: sql<string>`${inspections.status}`,
        url: sql<string>`CONCAT('/manager/inspections')`,
      })
      .from(inspections)
      .leftJoin(vehicles, eq(inspections.vehicleId, vehicles.id))
      .where(
        and(
          eq(inspections.companyId, companyIdNum),
          like(vehicles.vrm, searchTerm)
        )
      )
      .limit(5);

    // Search defects (by description or vehicle VRM)
    const defectResults = await db
      .select({
        id: defects.id,
        type: sql<string>`'defect'`,
        title: sql<string>`CONCAT('Defect #', ${defects.id})`,
        subtitle: sql<string>`${vehicles.vrm}`,
        description: defects.defectNote,
        url: sql<string>`CONCAT('/manager/defects')`,
      })
      .from(defects)
      .leftJoin(vehicles, eq(defects.vehicleId, vehicles.id))
      .where(
        and(
          eq(defects.companyId, companyIdNum),
          or(
            like(defects.defectNote, searchTerm),
            like(vehicles.vrm, searchTerm)
          )
        )
      )
      .limit(5);

    // Combine all results
    const allResults = [
      ...vehicleResults,
      ...driverResults,
      ...inspectionResults,
      ...defectResults,
    ];

    res.json(allResults);
  } catch (error) {
    console.error("Error searching:", error);
    res.status(500).json({ error: "Failed to search" });
  }
});

export default router;
