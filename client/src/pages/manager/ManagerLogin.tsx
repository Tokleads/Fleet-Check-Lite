import { useState } from "react";
import { useLocation } from "wouter";
import { TitanButton } from "@/components/titan-ui/Button";
import { TitanCard } from "@/components/titan-ui/Card";
import { TitanInput } from "@/components/titan-ui/Input";
import { motion } from "framer-motion";
import tenantConfig from "@/config/tenant";
import { session } from "@/lib/session";
import { useToast } from "@/hooks/use-toast";
import { Shield, ArrowRight } from "lucide-react";

export default function ManagerLogin() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [companyCode, setCompanyCode] = useState("");
  const [pin, setPin] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!companyCode || !pin) return;

    setIsLoading(true);
    try {
      const response = await fetch("/api/manager/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ companyCode: companyCode.toUpperCase(), pin }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Login failed");
      }

      const data = await response.json();
      session.setUser(data.manager);
      session.setCompany(data.company);

      setLocation("/manager");
    } catch (error) {
      toast({
        title: "Login failed",
        description: error instanceof Error ? error.message : "Invalid credentials",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <div className="text-center mb-8">
          <div className="bg-white rounded-2xl p-4 inline-block mb-4 shadow-xl">
            {tenantConfig.logoUrl ? (
              <img src={tenantConfig.logoUrl} alt={tenantConfig.companyName} className="h-12 w-auto" />
            ) : (
              <Shield className="h-12 w-12 text-primary" />
            )}
          </div>
          <h1 className="text-2xl font-bold text-white">{tenantConfig.companyName}</h1>
          <p className="text-slate-400 mt-1">Transport Manager Portal</p>
        </div>

        <TitanCard className="p-8 shadow-2xl border-0">
          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Company Code</label>
              <TitanInput
                value={companyCode}
                onChange={(e) => setCompanyCode(e.target.value.toUpperCase())}
                placeholder="e.g. APEX"
                className="uppercase"
                data-testid="input-company-code"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Manager PIN</label>
              <TitanInput
                type="password"
                value={pin}
                onChange={(e) => setPin(e.target.value)}
                placeholder="Enter PIN"
                maxLength={6}
                data-testid="input-pin"
              />
            </div>

            <TitanButton 
              type="submit" 
              className="w-full" 
              disabled={!companyCode || !pin || isLoading}
              data-testid="button-login"
            >
              {isLoading ? "Signing in..." : "Sign in"}
              <ArrowRight className="h-4 w-4 ml-2" />
            </TitanButton>
          </form>

          <div className="mt-6 pt-6 border-t border-slate-100 text-center">
            <p className="text-sm text-slate-500">
              Demo: Company Code <span className="font-mono font-bold">APEX</span>, PIN <span className="font-mono font-bold">0000</span>
            </p>
          </div>
        </TitanCard>
      </motion.div>
    </div>
  );
}
