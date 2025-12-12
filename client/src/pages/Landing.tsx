import { useState } from "react";
import { useLocation } from "wouter";
import { useBrand } from "@/hooks/use-brand";
import { MOCK_COMPANIES, MOCK_USERS } from "@/lib/mockData";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Truck, ShieldCheck, ArrowRight } from "lucide-react";
import generatedImage from '@assets/generated_images/minimalist_abstract_hexagon_logo_for_logistics_app.png';

export default function Landing() {
  const [, setLocation] = useLocation();
  const { setCompanyId } = useBrand();
  const [selectedCompany, setSelectedCompany] = useState(MOCK_COMPANIES[0].id);
  const [selectedRole, setSelectedRole] = useState<"MANAGER" | "DRIVER">("DRIVER");

  const handleLogin = () => {
    setCompanyId(selectedCompany);
    // Simulate auth by finding the first user of that role in that company
    const user = MOCK_USERS.find(u => u.companyId === selectedCompany && u.role === selectedRole);
    
    if (user) {
        // In a real app we'd set session here
        if (selectedRole === "DRIVER") {
            setLocation("/driver");
        } else {
            setLocation("/manager");
        }
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center space-y-2">
          <div className="flex justify-center mb-6">
            <div className="h-24 w-24 bg-white rounded-2xl shadow-sm flex items-center justify-center p-4">
               <img src={generatedImage} alt="FleetCheck Lite Logo" className="h-full w-full object-contain" />
            </div>
          </div>
          <h1 className="text-3xl font-heading font-bold text-slate-900 tracking-tight">FLEETCHECK LITE</h1>
          <p className="text-slate-500">Professional Vehicle Inspection Platform</p>
        </div>

        <Card className="border-slate-200 shadow-xl shadow-slate-200/50">
          <CardHeader>
            <CardTitle>Sign In</CardTitle>
            <CardDescription>Select your company and role to continue.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label>Company</Label>
              <Select value={selectedCompany} onValueChange={setSelectedCompany}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {MOCK_COMPANIES.map(c => (
                    <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Role</Label>
              <div className="grid grid-cols-2 gap-4">
                <div 
                    className={`cursor-pointer rounded-lg border p-4 flex flex-col items-center gap-2 transition-all ${selectedRole === 'DRIVER' ? 'border-primary bg-primary/5 ring-1 ring-primary' : 'border-slate-200 hover:border-slate-300'}`}
                    onClick={() => setSelectedRole("DRIVER")}
                >
                    <Truck className={`h-6 w-6 ${selectedRole === 'DRIVER' ? 'text-primary' : 'text-slate-400'}`} />
                    <span className={`text-sm font-medium ${selectedRole === 'DRIVER' ? 'text-primary' : 'text-slate-600'}`}>Driver</span>
                </div>
                <div 
                    className={`cursor-pointer rounded-lg border p-4 flex flex-col items-center gap-2 transition-all ${selectedRole === 'MANAGER' ? 'border-primary bg-primary/5 ring-1 ring-primary' : 'border-slate-200 hover:border-slate-300'}`}
                    onClick={() => setSelectedRole("MANAGER")}
                >
                    <ShieldCheck className={`h-6 w-6 ${selectedRole === 'MANAGER' ? 'text-primary' : 'text-slate-400'}`} />
                    <span className={`text-sm font-medium ${selectedRole === 'MANAGER' ? 'text-primary' : 'text-slate-600'}`}>Manager</span>
                </div>
              </div>
            </div>

            <Button className="w-full" size="lg" onClick={handleLogin}>
              Continue <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </CardContent>
        </Card>

        <p className="text-center text-xs text-slate-400">
          © 2025 FleetCheck Lite. All rights reserved. <br/>
          Mockup Mode - No data is persisted.
        </p>
      </div>
    </div>
  );
}
