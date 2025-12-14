import { useState } from "react";
import { useLocation } from "wouter";
import { useBrand } from "@/hooks/use-brand";
import { TitanButton } from "@/components/titan-ui/Button";
import { TitanInput } from "@/components/titan-ui/Input";
import { TitanCard } from "@/components/titan-ui/Card";
import { ArrowRight, Truck, ShieldCheck, Users, Building2 } from "lucide-react";
import { motion } from "framer-motion";
import { api } from "@/lib/api";
import { session } from "@/lib/session";
import { useToast } from "@/hooks/use-toast";

const DEMO_COMPANIES = [
  {
    code: "APEX",
    name: "DC European Haulage",
    description: "Large fleet operations",
    color: "#4169b2",
    vehicles: 15,
    drivers: 2,
    managerPin: "0000",
    driverPin: "1234"
  },
  {
    code: "TIM",
    name: "Trucker Tim Transport",
    description: "Owner-operator fleet",
    color: "#dc2626",
    vehicles: 10,
    drivers: 3,
    managerPin: "0000",
    driverPin: "1234"
  }
];

export default function Landing() {
  const [, setLocation] = useLocation();
  const { setCompanyId } = useBrand();
  const { toast } = useToast();
  const [selectedCompany, setSelectedCompany] = useState<typeof DEMO_COMPANIES[0] | null>(null);
  const [pin, setPin] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [loginType, setLoginType] = useState<"driver" | "manager">("driver");

  const handleSelectCompany = (company: typeof DEMO_COMPANIES[0]) => {
    setSelectedCompany(company);
    setPin(loginType === "driver" ? company.driverPin : company.managerPin);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCompany) return;
    
    setIsLoading(true);
    
    try {
      const company = await api.getCompanyByCode(selectedCompany.code);
      session.setCompany(company);
      setCompanyId(String(company.id));

      if (loginType === "driver") {
        const mockDriver = {
          id: selectedCompany.code === "APEX" ? 2 : 6,
          companyId: company.id,
          email: `driver1@${selectedCompany.code.toLowerCase()}.com`,
          name: selectedCompany.code === "APEX" ? "John Doe" : "Mike Thompson",
          role: "DRIVER" as const,
          pin: pin,
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
          body: JSON.stringify({ companyCode: selectedCompany.code, pin }),
        });
        
        if (!response.ok) {
          throw new Error("Invalid PIN");
        }
        
        const data = await response.json();
        session.setUser(data.manager);
        session.setCompany(data.company);
        setLocation("/manager");
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Login Failed",
        description: error instanceof Error ? error.message : "Invalid credentials",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleBack = () => {
    setSelectedCompany(null);
    setPin("");
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-1/2 bg-slate-900 rounded-b-[3rem] shadow-2xl z-0" />
      
      <div className="w-full max-w-lg mx-auto p-6 z-10">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="space-y-6"
        >
          {/* Header */}
          <div className="text-center space-y-3 pt-4">
            <div className="bg-white rounded-2xl p-4 inline-block mx-auto mb-3 shadow-xl">
              <div className="h-12 w-12 rounded-xl flex items-center justify-center text-white font-bold text-lg bg-slate-900">
                TF
              </div>
            </div>
            <span className="text-xl tracking-tight block">
              <span className="font-bold text-white">Titan</span>
              <span className="font-normal text-slate-400 ml-1">Fleet</span>
            </span>
            <p className="text-slate-400 text-sm font-medium">Affiliate Demo Portal</p>
          </div>

          {!selectedCompany ? (
            <>
              {/* Demo Company Cards */}
              <div className="space-y-3">
                <p className="text-center text-white/70 text-sm font-medium">Select a demo company to explore:</p>
                
                {DEMO_COMPANIES.map((company) => (
                  <motion.button
                    key={company.code}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleSelectCompany(company)}
                    className="w-full bg-white rounded-2xl p-5 shadow-xl border-0 ring-1 ring-black/5 text-left transition-all hover:shadow-2xl"
                    data-testid={`card-demo-${company.code.toLowerCase()}`}
                  >
                    <div className="flex items-center gap-4">
                      <div 
                        className="h-14 w-14 rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-lg"
                        style={{ backgroundColor: company.color }}
                      >
                        {company.code.substring(0, 2)}
                      </div>
                      <div className="flex-1">
                        <h3 className="font-bold text-slate-900 text-lg">{company.name}</h3>
                        <p className="text-slate-500 text-sm">{company.description}</p>
                        <div className="flex items-center gap-4 mt-2">
                          <span className="inline-flex items-center gap-1 text-xs text-slate-400">
                            <Truck className="h-3.5 w-3.5" /> {company.vehicles} vehicles
                          </span>
                          <span className="inline-flex items-center gap-1 text-xs text-slate-400">
                            <Users className="h-3.5 w-3.5" /> {company.drivers} drivers
                          </span>
                        </div>
                      </div>
                      <ArrowRight className="h-5 w-5 text-slate-300" />
                    </div>
                  </motion.button>
                ))}
              </div>

              {/* Login Type Toggle */}
              <div className="flex justify-center gap-2">
                <button
                  onClick={() => setLoginType("driver")}
                  className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                    loginType === "driver" 
                      ? "bg-white text-slate-900 shadow-lg" 
                      : "bg-white/10 text-white/70 hover:bg-white/20"
                  }`}
                  data-testid="toggle-driver"
                >
                  <Truck className="h-4 w-4 inline mr-2" />
                  Driver Login
                </button>
                <button
                  onClick={() => setLoginType("manager")}
                  className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                    loginType === "manager" 
                      ? "bg-white text-slate-900 shadow-lg" 
                      : "bg-white/10 text-white/70 hover:bg-white/20"
                  }`}
                  data-testid="toggle-manager"
                >
                  <ShieldCheck className="h-4 w-4 inline mr-2" />
                  Manager Login
                </button>
              </div>

              {/* Demo Credentials Info */}
              <div className="bg-white/10 backdrop-blur rounded-xl p-4 border border-white/10">
                <p className="text-white/80 text-xs text-center">
                  <strong>Demo Credentials:</strong> Driver PIN: 1234 | Manager PIN: 0000
                </p>
              </div>
            </>
          ) : (
            /* Login Form */
            <TitanCard className="p-6 sm:p-8 shadow-2xl border-0 ring-1 ring-black/5 bg-white">
              <form onSubmit={handleLogin} className="space-y-6">
                <div className="flex items-center gap-4 pb-4 border-b border-slate-100">
                  <div 
                    className="h-12 w-12 rounded-xl flex items-center justify-center text-white font-bold shadow-lg"
                    style={{ backgroundColor: selectedCompany.color }}
                  >
                    {selectedCompany.code.substring(0, 2)}
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900">{selectedCompany.name}</h3>
                    <p className="text-slate-500 text-sm">
                      {loginType === "driver" ? "Driver Login" : "Manager Console"}
                    </p>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="titan-section-label ml-1">
                    {loginType === "driver" ? "Driver PIN" : "Manager PIN"}
                  </label>
                  <TitanInput 
                    placeholder="Enter 4-digit PIN" 
                    type="password"
                    value={pin}
                    onChange={(e) => setPin(e.target.value)}
                    className="h-14 text-lg bg-slate-50 border-slate-200 focus:bg-white transition-colors text-center tracking-[0.5em] font-mono"
                    maxLength={4}
                    data-testid="input-pin"
                  />
                </div>

                <TitanButton 
                  size="lg" 
                  className="w-full h-14 text-base font-bold shadow-lg"
                  style={{ backgroundColor: selectedCompany.color }}
                  isLoading={isLoading}
                  data-testid="button-login"
                >
                  {loginType === "driver" ? "Start Shift" : "Access Dashboard"} 
                  <ArrowRight className="ml-2 h-5 w-5" />
                </TitanButton>

                <button
                  type="button"
                  onClick={handleBack}
                  className="w-full py-2 text-sm text-slate-400 font-medium hover:text-slate-600 transition-colors"
                  data-testid="button-back"
                >
                  ← Choose different company
                </button>
              </form>
            </TitanCard>
          )}
        </motion.div>
      </div>
      
      {/* Footer Branding */}
      <div className="absolute bottom-6 left-0 right-0 text-center z-10">
        <span className="text-[10px] tracking-widest uppercase opacity-60">
          <span className="font-bold text-slate-700">Titan</span>
          <span className="font-normal text-slate-500 ml-1">Fleet</span>
        </span>
      </div>
    </div>
  );
}
