import { db } from "./db";
import { vehicleCategories, costCentres, departments, vehicles } from "../shared/schema";
import { eq, and } from "drizzle-orm";

// Vehicle Categories
export async function getVehicleCategories(companyId: number) {
  return await db
    .select()
    .from(vehicleCategories)
    .where(and(
      eq(vehicleCategories.companyId, companyId),
      eq(vehicleCategories.active, true)
    ))
    .orderBy(vehicleCategories.name);
}

export async function createVehicleCategory(data: {
  companyId: number;
  name: string;
  description?: string;
  color?: string;
  icon?: string;
}) {
  const [category] = await db
    .insert(vehicleCategories)
    .values(data)
    .returning();
  return category;
}

export async function updateVehicleCategory(id: number, data: {
  name?: string;
  description?: string;
  color?: string;
  icon?: string;
  active?: boolean;
}) {
  const [category] = await db
    .update(vehicleCategories)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(vehicleCategories.id, id))
    .returning();
  return category;
}

export async function deleteVehicleCategory(id: number) {
  // Soft delete - mark as inactive
  const [category] = await db
    .update(vehicleCategories)
    .set({ active: false, updatedAt: new Date() })
    .where(eq(vehicleCategories.id, id))
    .returning();
  return category;
}

// Cost Centres
export async function getCostCentres(companyId: number) {
  return await db
    .select()
    .from(costCentres)
    .where(and(
      eq(costCentres.companyId, companyId),
      eq(costCentres.active, true)
    ))
    .orderBy(costCentres.name);
}

export async function createCostCentre(data: {
  companyId: number;
  code: string;
  name: string;
  description?: string;
  location?: string;
  managerName?: string;
  managerEmail?: string;
}) {
  const [costCentre] = await db
    .insert(costCentres)
    .values(data)
    .returning();
  return costCentre;
}

export async function updateCostCentre(id: number, data: {
  code?: string;
  name?: string;
  description?: string;
  location?: string;
  managerName?: string;
  managerEmail?: string;
  active?: boolean;
}) {
  const [costCentre] = await db
    .update(costCentres)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(costCentres.id, id))
    .returning();
  return costCentre;
}

export async function deleteCostCentre(id: number) {
  // Soft delete - mark as inactive
  const [costCentre] = await db
    .update(costCentres)
    .set({ active: false, updatedAt: new Date() })
    .where(eq(costCentres.id, id))
    .returning();
  return costCentre;
}

// Departments
export async function getDepartments(companyId: number) {
  return await db
    .select()
    .from(departments)
    .where(and(
      eq(departments.companyId, companyId),
      eq(departments.active, true)
    ))
    .orderBy(departments.name);
}

export async function createDepartment(data: {
  companyId: number;
  name: string;
  description?: string;
  headOfDepartment?: string;
  budgetCode?: string;
}) {
  const [department] = await db
    .insert(departments)
    .values(data)
    .returning();
  return department;
}

export async function updateDepartment(id: number, data: {
  name?: string;
  description?: string;
  headOfDepartment?: string;
  budgetCode?: string;
  active?: boolean;
}) {
  const [department] = await db
    .update(departments)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(departments.id, id))
    .returning();
  return department;
}

export async function deleteDepartment(id: number) {
  // Soft delete - mark as inactive
  const [department] = await db
    .update(departments)
    .set({ active: false, updatedAt: new Date() })
    .where(eq(departments.id, id))
    .returning();
  return department;
}

// Vehicle Hierarchy Assignment
export async function assignVehicleHierarchy(vehicleId: number, data: {
  categoryId?: number | null;
  costCentreId?: number | null;
  departmentId?: number | null;
}) {
  const [vehicle] = await db
    .update(vehicles)
    .set(data)
    .where(eq(vehicles.id, vehicleId))
    .returning();
  return vehicle;
}

// Get hierarchy statistics
export async function getHierarchyStats(companyId: number) {
  // Get all vehicles with their hierarchy
  const allVehicles = await db
    .select()
    .from(vehicles)
    .where(and(
      eq(vehicles.companyId, companyId),
      eq(vehicles.active, true)
    ));

  // Count vehicles by category
  const byCategory: Record<string, number> = {};
  const byCostCentre: Record<string, number> = {};
  const byDepartment: Record<string, number> = {};

  for (const vehicle of allVehicles) {
    if (vehicle.categoryId) {
      byCategory[vehicle.categoryId] = (byCategory[vehicle.categoryId] || 0) + 1;
    }
    if (vehicle.costCentreId) {
      byCostCentre[vehicle.costCentreId] = (byCostCentre[vehicle.costCentreId] || 0) + 1;
    }
    if (vehicle.departmentId) {
      byDepartment[vehicle.departmentId] = (byDepartment[vehicle.departmentId] || 0) + 1;
    }
  }

  return {
    totalVehicles: allVehicles.length,
    byCategory,
    byCostCentre,
    byDepartment,
    unassignedCategory: allVehicles.filter(v => !v.categoryId).length,
    unassignedCostCentre: allVehicles.filter(v => !v.costCentreId).length,
    unassignedDepartment: allVehicles.filter(v => !v.departmentId).length
  };
}
