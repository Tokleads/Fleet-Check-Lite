import { useState, useEffect } from "react";
import { DriverLayout } from "@/components/layout/AppShell";
import { TitanButton } from "@/components/titan-ui/Button";
import { TitanCard } from "@/components/titan-ui/Card";
import { useLocation, useRoute } from "wouter";
import { api } from "@/lib/api";
import { session } from "@/lib/session";
import type { Vehicle, Inspection } from "@shared/schema";
import { ChevronLeft, Truck, FileText, Fuel, AlertOctagon, ChevronRight, Loader2 } from "lucide-react";

export default function VehicleDetail() {
  const [, params] = useRoute("/driver/vehicle/:id");
  const [, setLocation] = useLocation();
  const [vehicle, setVehicle] = useState<Vehicle | null>(null);
  const [recentInspections, setRecentInspections] = useState<Inspection[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [motStatus, setMotStatus] = useState<{
    valid: boolean;
    expiryDate: string | null;
  } | null>(null);

  const company = session.getCompany();
  const user = session.getUser();

  useEffect(() => {
    if (params?.id) {
      loadVehicle(Number(params.id));
    }
  }, [params?.id]);

  const loadVehicle = async (id: number) => {
    setIsLoading(true);
    try {
      const vehicleData = await api.getVehicle(id);
      setVehicle(vehicleData);

      // Try to fetch MOT status from DVSA
      if (vehicleData.vrm) {
        const mot = await api.getMotStatus(vehicleData.vrm);
        setMotStatus(mot);
      }

      // Load recent inspections for this vehicle
      if (company && user) {
        const inspections = await api.getInspections(company.id, user.id, 7);
        const vehicleInspections = inspections.filter(i => i.vehicleId === id);
        setRecentInspections(vehicleInspections.slice(0, 3));
      }
    } catch (error) {
      console.error("Failed to load vehicle:", error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <DriverLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </DriverLayout>
    );
  }

  if (!vehicle) {
    return (
      <DriverLayout>
        <div className="text-center py-12">
          <p className="text-slate-500">Vehicle not found</p>
          <TitanButton variant="outline" onClick={() => setLocation("/driver")} className="mt-4">
            Back to Dashboard
          </TitanButton>
        </div>
      </DriverLayout>
    );
  }

  const motDueDate = vehicle.motDue ? new Date(vehicle.motDue) : null;
  const isMotDueSoon = motDueDate && motDueDate < new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

  return (
    <DriverLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-3">
          <TitanButton variant="ghost" size="icon" onClick={() => setLocation("/driver")} className="h-10 w-10 -ml-2" data-testid="button-back">
            <ChevronLeft className="h-6 w-6 text-slate-600" />
          </TitanButton>
          <h1 className="text-xl font-bold text-slate-900">Vehicle Actions</h1>
        </div>

        {/* Vehicle Identity Card */}
        <TitanCard className="p-6 bg-slate-900 text-white border-0 shadow-titan-lg relative overflow-hidden" data-testid="card-vehicle-info">
          <div className="absolute top-0 right-0 p-32 bg-white/5 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none" />
          
          <div className="relative z-10 flex justify-between items-start">
            <div className="space-y-1">
              <p className="text-white/60 text-xs font-bold uppercase tracking-wider">Registration</p>
              <h2 className="text-3xl font-mono font-bold tracking-tight">{vehicle.vrm}</h2>
              <p className="text-white/80 text-lg font-medium pt-1">{vehicle.make} {vehicle.model}</p>
            </div>
            <div className="h-12 w-12 bg-white/10 rounded-xl flex items-center justify-center backdrop-blur-sm">
              <Truck className="h-6 w-6 text-white" />
            </div>
          </div>
          
          <div className="mt-6 pt-6 border-t border-white/10 flex gap-6">
            <div>
              <p className="text-white/40 text-[10px] font-bold uppercase tracking-wider">MOT Due</p>
              <p className={`font-medium mt-0.5 ${isMotDueSoon ? 'text-amber-400' : ''}`}>
                {motDueDate ? motDueDate.toLocaleDateString() : 'N/A'}
              </p>
            </div>
            <div>
              <p className="text-white/40 text-[10px] font-bold uppercase tracking-wider">Status</p>
              <div className="flex items-center gap-1.5 mt-0.5">
                <div className={`h-2 w-2 rounded-full ${vehicle.active ? 'bg-green-500' : 'bg-red-500'}`} />
                <span className="font-medium">{vehicle.active ? 'Active' : 'Inactive'}</span>
              </div>
            </div>
            {motStatus && (
              <div>
                <p className="text-white/40 text-[10px] font-bold uppercase tracking-wider">DVSA MOT</p>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <div className={`h-2 w-2 rounded-full ${motStatus.valid ? 'bg-green-500' : 'bg-red-500'}`} />
                  <span className="font-medium">{motStatus.valid ? 'Valid' : 'Expired'}</span>
                </div>
              </div>
            )}
          </div>
        </TitanCard>

        {/* Action Grid */}
        <div className="grid grid-cols-1 gap-3">
          <ActionCard 
            icon={<FileText className="h-6 w-6 text-blue-600" />}
            title="Start Inspection"
            subtitle="Daily check or end of shift"
            onClick={() => setLocation(`/driver/inspection/${vehicle.id}`)}
            primary
            testId="action-start-inspection"
          />
          <ActionCard 
            icon={<Fuel className="h-6 w-6 text-emerald-600" />}
            title="Fuel / AdBlue"
            subtitle="Log fill-up & receipts"
            onClick={() => setLocation(`/driver/fuel/${vehicle.id}`)}
            testId="action-fuel"
          />
          <ActionCard 
            icon={<AlertOctagon className="h-6 w-6 text-amber-600" />}
            title="Report Collision"
            subtitle="Log accident details"
            onClick={() => setLocation(`/driver/collision/${vehicle.id}`)}
            testId="action-collision"
          />
        </div>

        {/* Recent History for this Vehicle */}
        <div className="pt-4 space-y-3">
          <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2 ml-1">
            Recent Activity
          </h3>
          {recentInspections.length === 0 ? (
            <TitanCard className="p-6 text-center border-2 border-dashed border-slate-200 bg-slate-50/50">
              <p className="text-sm text-slate-500">No inspections yet for this vehicle</p>
            </TitanCard>
          ) : (
            recentInspections.map((inspection) => (
              <TitanCard key={inspection.id} className="p-4 flex items-center gap-3">
                <div className={`h-10 w-10 rounded-full flex items-center justify-center ${
                  inspection.status === 'PASS' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'
                }`}>
                  <FileText className="h-5 w-5" />
                </div>
                <div className="flex-1">
                  <p className="font-bold text-sm text-slate-900">{inspection.type} Inspection</p>
                  <p className="text-xs text-slate-500">
                    {new Date(inspection.createdAt).toLocaleDateString()} • {inspection.status}
                  </p>
                </div>
              </TitanCard>
            ))
          )}
        </div>
      </div>
    </DriverLayout>
  );
}

function ActionCard({ 
  icon, 
  title, 
  subtitle, 
  onClick, 
  primary,
  testId 
}: { 
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  onClick: () => void;
  primary?: boolean;
  testId?: string;
}) {
  return (
    <button 
      onClick={onClick}
      data-testid={testId}
      className={`
        w-full p-4 rounded-xl border text-left flex items-center gap-4 transition-all active:scale-[0.98]
        ${primary 
          ? 'bg-white border-primary/20 shadow-md ring-1 ring-primary/10' 
          : 'bg-white border-slate-200 shadow-sm hover:border-slate-300'
        }
      `}
    >
      <div className={`h-12 w-12 rounded-xl flex items-center justify-center ${primary ? 'bg-primary/5' : 'bg-slate-50'}`}>
        {icon}
      </div>
      <div>
        <h3 className="font-bold text-slate-900">{title}</h3>
        <p className="text-xs text-slate-500 font-medium">{subtitle}</p>
      </div>
      <div className="ml-auto">
        <ChevronRight className="h-5 w-5 text-slate-300" />
      </div>
    </button>
  );
}
