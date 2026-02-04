import { Router, Request, Response, NextFunction } from "express";
import { storage } from "./storage";
import { db } from "./db";
import { companies, users, vehicles } from "@shared/schema";
import { eq, sql, like, or } from "drizzle-orm";

const router = Router();

const ADMIN_TOKEN = process.env.ADMIN_TOKEN || "titan-admin-secret-2024";

export function verifyAdminToken(req: Request, res: Response, next: NextFunction) {
  const token = req.headers["x-admin-token"] as string;
  
  if (!token || token !== ADMIN_TOKEN) {
    return res.status(401).json({ error: "Unauthorized - Invalid admin token" });
  }
  
  next();
}

router.post("/login", async (req: Request, res: Response) => {
  try {
    const { token } = req.body;
    
    if (!token) {
      return res.status(400).json({ error: "Token is required" });
    }
    
    if (token !== ADMIN_TOKEN) {
      return res.status(401).json({ error: "Invalid admin token" });
    }
    
    res.json({ 
      success: true, 
      message: "Admin authentication successful",
      adminToken: token
    });
  } catch (error) {
    console.error("Admin login error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/stats", verifyAdminToken, async (req: Request, res: Response) => {
  try {
    const companies = await storage.getAllCompanies();
    const activeCompanies = companies.filter(c => c.id > 0);
    
    let totalUsers = 0;
    let totalVehicles = 0;
    const recentActivity: { type: string; description: string; timestamp: string }[] = [];
    
    const tierPricing: Record<string, number> = {
      core: 49,
      pro: 149,
      operator: 349
    };
    
    let monthlyRevenue = 0;
    const tierBreakdown: Record<string, number> = {
      core: 0,
      pro: 0,
      operator: 0
    };
    
    for (const company of companies) {
      const users = await storage.getUsersByCompany(company.id);
      totalUsers += users.length;
      
      const vehiclesResult = await storage.getVehiclesByCompany(company.id, 1000, 0);
      totalVehicles += vehiclesResult.total;
      
      const tier = company.licenseTier || "core";
      tierBreakdown[tier] = (tierBreakdown[tier] || 0) + 1;
      monthlyRevenue += tierPricing[tier] || 49;
      
      recentActivity.push({
        type: "company",
        description: `Company "${company.name}" (${tier.toUpperCase()}) - ${vehiclesResult.total} vehicles`,
        timestamp: company.createdAt.toISOString()
      });
    }
    
    recentActivity.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    
    res.json({
      totalCompanies: companies.length,
      activeCompanies: activeCompanies.length,
      totalUsers,
      totalVehicles,
      monthlyRevenue,
      tierBreakdown,
      recentActivity: recentActivity.slice(0, 10)
    });
  } catch (error) {
    console.error("Admin stats error:", error);
    res.status(500).json({ error: "Failed to fetch admin statistics" });
  }
});

router.get("/companies", verifyAdminToken, async (req: Request, res: Response) => {
  try {
    const { search, page = "1", limit = "20" } = req.query;
    const pageNum = parseInt(page as string, 10) || 1;
    const limitNum = parseInt(limit as string, 10) || 20;
    const offset = (pageNum - 1) * limitNum;
    
    let allCompanies = await db.select().from(companies);
    
    if (search && typeof search === "string" && search.trim()) {
      const searchTerm = search.toLowerCase().trim();
      allCompanies = allCompanies.filter(c => 
        c.name.toLowerCase().includes(searchTerm) || 
        c.companyCode.toLowerCase().includes(searchTerm)
      );
    }
    
    const total = allCompanies.length;
    const paginatedCompanies = allCompanies.slice(offset, offset + limitNum);
    
    const companiesWithStats = await Promise.all(
      paginatedCompanies.map(async (company) => {
        const companyUsers = await storage.getUsersByCompany(company.id);
        const vehiclesResult = await storage.getVehiclesByCompany(company.id, 1000, 0);
        
        return {
          ...company,
          userCount: companyUsers.length,
          vehicleCount: vehiclesResult.total
        };
      })
    );
    
    res.json({
      companies: companiesWithStats,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum)
      }
    });
  } catch (error) {
    console.error("Admin companies error:", error);
    res.status(500).json({ error: "Failed to fetch companies" });
  }
});

router.post("/companies", verifyAdminToken, async (req: Request, res: Response) => {
  try {
    const { name, companyCode, contactEmail, licenseTier } = req.body;
    
    if (!name || !companyCode) {
      return res.status(400).json({ error: "Name and company code are required" });
    }
    
    const existingCompany = await storage.getCompanyByCode(companyCode);
    if (existingCompany) {
      return res.status(400).json({ error: "A company with this code already exists" });
    }
    
    const [newCompany] = await db.insert(companies).values({
      name,
      companyCode: companyCode.toUpperCase(),
      contactEmail: contactEmail || null,
      licenseTier: licenseTier || "core",
      isActive: true,
      vehicleAllowance: licenseTier === "operator" ? 100 : licenseTier === "pro" ? 50 : 15,
      graceOverage: 3,
      enforcementMode: "soft_block"
    }).returning();
    
    res.status(201).json(newCompany);
  } catch (error) {
    console.error("Create company error:", error);
    res.status(500).json({ error: "Failed to create company" });
  }
});

router.patch("/companies/:id", verifyAdminToken, async (req: Request, res: Response) => {
  try {
    const companyId = parseInt(req.params.id, 10);
    if (isNaN(companyId)) {
      return res.status(400).json({ error: "Invalid company ID" });
    }
    
    const { name, companyCode, contactEmail, licenseTier, isActive } = req.body;
    
    const updates: Record<string, any> = { updatedAt: new Date() };
    if (name !== undefined) updates.name = name;
    if (companyCode !== undefined) updates.companyCode = companyCode.toUpperCase();
    if (contactEmail !== undefined) updates.contactEmail = contactEmail;
    if (licenseTier !== undefined) {
      updates.licenseTier = licenseTier;
      updates.vehicleAllowance = licenseTier === "operator" ? 100 : licenseTier === "pro" ? 50 : 15;
    }
    if (isActive !== undefined) updates.isActive = isActive;
    
    const [updatedCompany] = await db
      .update(companies)
      .set(updates)
      .where(eq(companies.id, companyId))
      .returning();
    
    if (!updatedCompany) {
      return res.status(404).json({ error: "Company not found" });
    }
    
    res.json(updatedCompany);
  } catch (error) {
    console.error("Update company error:", error);
    res.status(500).json({ error: "Failed to update company" });
  }
});

router.delete("/companies/:id", verifyAdminToken, async (req: Request, res: Response) => {
  try {
    const companyId = parseInt(req.params.id, 10);
    if (isNaN(companyId)) {
      return res.status(400).json({ error: "Invalid company ID" });
    }
    
    const [updatedCompany] = await db
      .update(companies)
      .set({ isActive: false, updatedAt: new Date() })
      .where(eq(companies.id, companyId))
      .returning();
    
    if (!updatedCompany) {
      return res.status(404).json({ error: "Company not found" });
    }
    
    res.json({ success: true, message: "Company deactivated successfully" });
  } catch (error) {
    console.error("Delete company error:", error);
    res.status(500).json({ error: "Failed to delete company" });
  }
});

export default router;
