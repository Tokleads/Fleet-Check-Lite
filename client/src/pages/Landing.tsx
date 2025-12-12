import { useState } from "react";
import { useLocation } from "wouter";
import { useBrand } from "@/hooks/use-brand";
import { MOCK_COMPANIES, MOCK_USERS } from "@/lib/mockData";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Truck, ShieldCheck, ArrowRight, Check, Loader2, Building2 } from "lucide-react";
import generatedImage from '@assets/generated_images/minimalist_abstract_hexagon_logo_for_logistics_app.png';

export default function Landing() {
  const [, setLocation] = useLocation();
  const { setCompanyId } = useBrand();
  const [selectedCompany, setSelectedCompany] = useState(MOCK_COMPANIES[0].id);
  const [selectedRole, setSelectedRole] = useState<"MANAGER" | "DRIVER">("DRIVER");
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async () => {
    setIsLoading(true);
    setCompanyId(selectedCompany);
    
    // Simulate network delay for premium feel
    await new Promise(resolve => setTimeout(resolve, 800));
    
    const user = MOCK_USERS.find(u => u.companyId === selectedCompany && u.role === selectedRole);
    
    if (user) {
        if (selectedRole === "DRIVER") {
            setLocation("/driver");
        } else {
            setLocation("/manager");
        }
    }
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background ambience */}
      <div className="absolute inset-0 bg-gradient-to-b from-slate-50 to-white -z-10" />
      <div className="absolute inset-x-0 top-0 h-96 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-100/50 via-transparent to-transparent -z-10" />

      <div className="w-full max-w-[460px] space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
        
        {/* Header Section - Tighter & Cleaner */}
        <div className="flex flex-col items-center text-center space-y-6">
          <div className="h-20 w-20 bg-white rounded-2xl shadow-lg shadow-slate-200/50 flex items-center justify-center p-3.5 ring-1 ring-slate-100">
             <img src={generatedImage} alt="FleetCheck Lite Logo" className="h-full w-full object-contain" />
          </div>
          <div className="space-y-1.5">
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Welcome to FleetCheck</h1>
            <p className="text-slate-500 text-[15px]">Sign in to manage your fleet inspections</p>
          </div>
        </div>

        {/* Main Card */}
        <Card className="border-0 shadow-card bg-white/80 backdrop-blur-sm ring-1 ring-slate-200/60">
          <CardContent className="p-8 space-y-8">
            
            {/* Company Selector */}
            <div className="space-y-3">
              <Label className="text-xs font-medium text-slate-500 uppercase tracking-wider ml-1">Company</Label>
              <Select value={selectedCompany} onValueChange={setSelectedCompany}>
                <SelectTrigger className="h-[52px] px-4 bg-slate-50/50 border-slate-200 hover:border-slate-300 hover:bg-white transition-all focus:ring-2 focus:ring-primary/20 focus:border-primary text-base">
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-md bg-slate-100 flex items-center justify-center text-slate-500">
                      <Building2 className="h-4 w-4" />
                    </div>
                    <SelectValue />
                  </div>
                </SelectTrigger>
                <SelectContent className="shadow-xl border-slate-100">
                  {MOCK_COMPANIES.map(c => (
                    <SelectItem key={c.id} value={c.id} className="py-3 px-4 focus:bg-slate-50 cursor-pointer">
                      <span className="font-medium text-slate-700">{c.name}</span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Role Selection - Custom Component */}
            <div className="space-y-3">
              <Label className="text-xs font-medium text-slate-500 uppercase tracking-wider ml-1">Select Role</Label>
              <div className="grid grid-cols-2 gap-4" role="radiogroup">
                <RoleCard 
                  icon={<Truck className="h-6 w-6" />}
                  label="Driver"
                  selected={selectedRole === "DRIVER"}
                  onClick={() => setSelectedRole("DRIVER")}
                />
                <RoleCard 
                  icon={<ShieldCheck className="h-6 w-6" />}
                  label="Manager"
                  selected={selectedRole === "MANAGER"}
                  onClick={() => setSelectedRole("MANAGER")}
                />
              </div>
            </div>

            {/* CTA Button */}
            <Button 
              className="w-full h-[52px] text-[15px] font-semibold tracking-wide shadow-md shadow-primary/20 hover:shadow-primary/30 active:scale-[0.98] transition-all" 
              size="lg" 
              onClick={handleLogin}
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Signing in...
                </>
              ) : (
                <>
                  Continue <ArrowRight className="ml-2 h-4 w-4" />
                </>
              )}
            </Button>

          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center space-y-2">
            <p className="text-[13px] text-slate-400 font-medium">
            Protected by enterprise-grade security
            </p>
        </div>
      </div>
    </div>
  );
}

function RoleCard({ icon, label, selected, onClick }: { icon: React.ReactNode, label: string, selected: boolean, onClick: () => void }) {
  return (
    <div 
      className={`
        relative cursor-pointer rounded-xl border-2 p-4 flex flex-col items-center justify-center gap-3 transition-all duration-200
        hover:-translate-y-0.5 hover:shadow-md
        ${selected 
          ? 'border-primary bg-primary/5 shadow-sm ring-1 ring-primary/20' 
          : 'border-slate-100 bg-white text-slate-500 hover:border-slate-200 hover:bg-slate-50'
        }
      `}
      onClick={onClick}
      role="radio"
      aria-checked={selected}
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick();
        }
      }}
    >
      {selected && (
        <div className="absolute top-2 right-2 text-primary animate-in zoom-in duration-200">
          <div className="bg-primary rounded-full p-0.5">
            <Check className="h-3 w-3 text-white" strokeWidth={3} />
          </div>
        </div>
      )}
      
      <div className={`
        p-3 rounded-full transition-colors
        ${selected ? 'bg-white text-primary shadow-sm' : 'bg-slate-50 text-slate-400'}
      `}>
        {icon}
      </div>
      
      <span className={`font-semibold text-[15px] ${selected ? 'text-primary' : 'text-slate-600'}`}>
        {label}
      </span>
    </div>
  );
}
