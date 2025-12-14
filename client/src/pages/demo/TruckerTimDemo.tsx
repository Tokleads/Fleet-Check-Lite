import { useState } from "react";
import { useLocation } from "wouter";
import { useBrand } from "@/hooks/use-brand";
import { TitanButton } from "@/components/titan-ui/Button";
import { TitanCard } from "@/components/titan-ui/Card";
import { ArrowRight, Truck, ShieldCheck, Users, FileCheck } from "lucide-react";
import { motion } from "framer-motion";
import { api } from "@/lib/api";
import { session } from "@/lib/session";
import { useToast } from "@/hooks/use-toast";

const COMPANY = {
  code: "TIM",
  name: "Trucker Tim Transport",
  color: "#dc2626",
  vehicles: 10,
  drivers: 3,
  description: "Owner-operator fleet management"
};

export default function TruckerTimDemo() {
  const [, setLocation] = useLocation();
  const { setCompanyId } = useBrand();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (type: "driver" | "manager") => {
    setIsLoading(true);
    
    try {
      const company = await api.getCompanyByCode(COMPANY.code);
      session.setCompany(company);
      setCompanyId(String(company.id));

      if (type === "driver") {
        const mockDriver = {
          id: 6,
          companyId: company.id,
          email: "driver1@truckertim.com",
          name: "Mike Thompson",
          role: "DRIVER" as const,
          pin: "1234",
          active: true,
          createdAt: new Date(),
          totpSecret: null,
          totpEnabled: null
        };
        session.setUser(mockDriver);
        setLocation("/driver");
      } else {
        const response = await fetch("/api/manager/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ companyCode: COMPANY.code, pin: "0000" }),
        });
        
        if (!response.ok) throw new Error("Login failed");
        
        const data = await response.json();
        session.setUser(data.manager);
        session.setCompany(data.company);
        setLocation("/manager");
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Demo Error",
        description: "Failed to load demo. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-center relative overflow-hidden" style={{ backgroundColor: "#f8fafc" }}>
      <div 
        className="absolute top-0 left-0 w-full h-1/2 rounded-b-[3rem] shadow-2xl z-0"
        style={{ backgroundColor: COMPANY.color }}
      />
      
      <div className="w-full max-w-lg mx-auto p-6 z-10">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="space-y-6"
        >
          <div className="text-center space-y-4 pt-4">
            <div className="bg-white rounded-2xl p-5 inline-block mx-auto shadow-xl">
              <div 
                className="h-16 w-16 rounded-xl flex items-center justify-center text-white font-bold text-2xl shadow-lg"
                style={{ backgroundColor: COMPANY.color }}
              >
                TT
              </div>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">{COMPANY.name}</h1>
              <p className="text-white/70 text-sm mt-1">{COMPANY.description}</p>
            </div>
            <div className="flex justify-center gap-6 text-white/80 text-sm">
              <span className="flex items-center gap-1.5">
                <Truck className="h-4 w-4" /> {COMPANY.vehicles} vehicles
              </span>
              <span className="flex items-center gap-1.5">
                <Users className="h-4 w-4" /> {COMPANY.drivers} drivers
              </span>
            </div>
          </div>

          <TitanCard className="p-8 shadow-2xl border-0 ring-1 ring-black/5 bg-white">
            <div className="text-center mb-6">
              <span className="inline-flex items-center gap-2 px-3 py-1.5 bg-red-50 text-red-700 rounded-full text-xs font-semibold">
                <FileCheck className="h-3.5 w-3.5" /> DEMO MODE
              </span>
              <h2 className="text-xl font-bold text-slate-900 mt-4">Explore the Platform</h2>
              <p className="text-slate-500 text-sm mt-1">Choose how you'd like to experience the demo</p>
            </div>

            <div className="space-y-3">
              <button
                onClick={() => handleLogin("driver")}
                disabled={isLoading}
                className="w-full p-5 rounded-xl border-2 border-slate-200 hover:border-red-500 hover:bg-red-50/50 transition-all text-left group"
                data-testid="button-demo-driver"
              >
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-xl bg-red-100 flex items-center justify-center group-hover:bg-red-200 transition-colors">
                    <Truck className="h-6 w-6 text-red-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-slate-900">Driver Experience</h3>
                    <p className="text-slate-500 text-sm">Mobile-first vehicle checks, fuel logs & more</p>
                  </div>
                  <ArrowRight className="h-5 w-5 text-slate-300 group-hover:text-red-500 transition-colors" />
                </div>
              </button>

              <button
                onClick={() => handleLogin("manager")}
                disabled={isLoading}
                className="w-full p-5 rounded-xl border-2 border-slate-200 hover:border-red-500 hover:bg-red-50/50 transition-all text-left group"
                data-testid="button-demo-manager"
              >
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-xl bg-slate-100 flex items-center justify-center group-hover:bg-slate-200 transition-colors">
                    <ShieldCheck className="h-6 w-6 text-slate-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-slate-900">Manager Dashboard</h3>
                    <p className="text-slate-500 text-sm">Fleet overview, reports & team management</p>
                  </div>
                  <ArrowRight className="h-5 w-5 text-slate-300 group-hover:text-red-500 transition-colors" />
                </div>
              </button>
            </div>

            <div className="mt-6 pt-6 border-t border-slate-100">
              <p className="text-center text-slate-400 text-xs">
                This is a live demo with sample data. Feel free to explore all features.
              </p>
            </div>
          </TitanCard>

          <div className="text-center">
            <a href="/" className="text-white/60 hover:text-white text-sm font-medium transition-colors">
              ← Back to main site
            </a>
          </div>
        </motion.div>
      </div>
      
      <div className="absolute bottom-6 left-0 right-0 text-center z-10">
        <span className="text-[10px] tracking-widest uppercase opacity-60">
          <span className="font-bold text-slate-700">Titan</span>
          <span className="font-normal text-slate-500 ml-1">Fleet</span>
        </span>
      </div>
    </div>
  );
}
