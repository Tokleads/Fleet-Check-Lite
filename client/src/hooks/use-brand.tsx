import React, { createContext, useContext, useEffect, useState } from "react";
import { Company, MOCK_COMPANIES } from "@/lib/mockData";

type BrandContextType = {
  currentCompany: Company;
  setCompanyId: (id: string) => void;
};

const BrandContext = createContext<BrandContextType | undefined>(undefined);

export function BrandProvider({ children }: { children: React.ReactNode }) {
  const [companyId, setCompanyId] = useState<string>(MOCK_COMPANIES[0].id);
  const currentCompany = MOCK_COMPANIES.find((c: Company) => c.id === companyId) || MOCK_COMPANIES[0];

  useEffect(() => {
    const root = document.documentElement;

    // Apply brand colors to CSS variables
    if (currentCompany.settings.brand) {
      if (companyId === "comp-1") {
        root.style.setProperty("--primary", "221 83% 53%"); // Blue
        root.style.setProperty("--radius", "0.5rem");
      } else if (companyId === "comp-2") {
        root.style.setProperty("--primary", "25 95% 53%"); // Orange/Red
        root.style.setProperty("--radius", "0rem");
      }
    }
  }, [companyId, currentCompany]);

  return (
    <BrandContext.Provider value={{ currentCompany, setCompanyId }}>
      {children}
    </BrandContext.Provider>
  );
}

export function useBrand() {
  const context = useContext(BrandContext);
  if (!context) {
    throw new Error("useBrand must be used within a BrandProvider");
  }
  return context;
}
