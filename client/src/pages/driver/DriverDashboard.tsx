import { useState } from "react";
import { DriverLayout } from "@/components/layout/AppShell";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Search, Clock, ChevronRight, AlertTriangle, Truck } from "lucide-react";
import { api, Vehicle } from "@/lib/mockData";
import { useBrand } from "@/hooks/use-brand";
import { useLocation } from "wouter";

export default function DriverDashboard() {
  const { currentCompany } = useBrand();
  const [, setLocation] = useLocation();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Vehicle[]>([]);
  const [hasSearched, setHasSearched] = useState(false);

  // Mock recents
  const recentVehicles = api.getVehicles(currentCompany.id).slice(0, 3);

  const handleSearch = () => {
    if (!query) return;
    const matches = api.searchVehicles(currentCompany.id, query);
    setResults(matches);
    setHasSearched(true);
  };

  const handleSelectVehicle = (vehicleId: string) => {
    setLocation(`/driver/inspection/${vehicleId}`);
  };

  return (
    <DriverLayout>
      <div className="space-y-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <h2 className="text-lg font-heading font-semibold mb-4 text-slate-800">Start Inspection</h2>
          <div className="flex gap-2">
            <Input 
              placeholder="Enter Reg (e.g. KX65)" 
              className="text-lg h-12 uppercase tracking-wider"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            />
            <Button size="lg" className="h-12 w-12 px-0" onClick={handleSearch}>
              <Search />
            </Button>
          </div>
        </div>

        {hasSearched && (
          <div className="space-y-3 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <h3 className="text-sm font-medium text-slate-500 uppercase tracking-wider">Search Results</h3>
            {results.length === 0 ? (
              <Card className="bg-slate-50 border-dashed">
                <CardContent className="flex flex-col items-center justify-center p-8 text-center">
                  <AlertTriangle className="h-10 w-10 text-amber-400 mb-2" />
                  <p className="text-slate-600 font-medium">Vehicle not found</p>
                  <p className="text-xs text-slate-400 mt-1">Please check the registration or contact your manager.</p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-2">
                {results.map(vehicle => (
                  <VehicleCard key={vehicle.id} vehicle={vehicle} onSelect={() => handleSelectVehicle(vehicle.id)} />
                ))}
              </div>
            )}
          </div>
        )}

        {!hasSearched && (
          <div className="space-y-3">
            <h3 className="text-sm font-medium text-slate-500 uppercase tracking-wider flex items-center gap-2">
              <Clock className="h-4 w-4" /> Recent Vehicles
            </h3>
            <div className="space-y-2">
              {recentVehicles.map(vehicle => (
                <VehicleCard key={vehicle.id} vehicle={vehicle} onSelect={() => handleSelectVehicle(vehicle.id)} />
              ))}
            </div>
          </div>
        )}
      </div>
    </DriverLayout>
  );
}

function VehicleCard({ vehicle, onSelect }: { vehicle: Vehicle, onSelect: () => void }) {
  const isMotDueSoon = new Date(vehicle.motDue) < new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

  return (
    <div 
      onClick={onSelect}
      className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm active:scale-[0.98] transition-transform flex items-center justify-between cursor-pointer hover:border-primary/50"
    >
      <div className="flex items-center gap-4">
        <div className="h-10 w-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-500">
            <Truck className="h-5 w-5" />
        </div>
        <div>
          <h4 className="font-heading font-bold text-lg leading-none">{vehicle.reg}</h4>
          <p className="text-xs text-slate-500 mt-1">{vehicle.make} {vehicle.model}</p>
        </div>
      </div>
      
      <div className="flex items-center gap-3">
        {isMotDueSoon && (
             <span className="px-2 py-1 bg-amber-100 text-amber-700 text-[10px] font-bold rounded uppercase tracking-wide">MOT Due</span>
        )}
        <ChevronRight className="text-slate-300" />
      </div>
    </div>
  );
}
