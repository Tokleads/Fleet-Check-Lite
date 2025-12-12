import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { ManagerLayout } from "./ManagerLayout";
import { session } from "@/lib/session";
import { 
  Truck,
  Plus,
  Calendar,
  CheckCircle2,
  XCircle,
  Search,
  MoreVertical,
  AlertTriangle
} from "lucide-react";

export default function ManagerFleet() {
  const company = session.getCompany();
  const companyId = company?.id;
  const [searchQuery, setSearchQuery] = useState("");

  const { data: vehicles, isLoading } = useQuery({
    queryKey: ["vehicles", companyId],
    queryFn: async () => {
      const res = await fetch(`/api/vehicles?companyId=${companyId}`);
      if (!res.ok) throw new Error("Failed to fetch vehicles");
      return res.json();
    },
    enabled: !!companyId,
  });

  const { data: trailers } = useQuery({
    queryKey: ["trailers", companyId],
    queryFn: async () => {
      const res = await fetch(`/api/manager/trailers/${companyId}`);
      if (!res.ok) throw new Error("Failed to fetch trailers");
      return res.json();
    },
    enabled: !!companyId,
  });

  const filteredVehicles = vehicles?.filter((v: any) => 
    v.vrm.toLowerCase().includes(searchQuery.toLowerCase()) ||
    v.make.toLowerCase().includes(searchQuery.toLowerCase()) ||
    v.model.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

  const isMotDueSoon = (motDue: string | null) => {
    if (!motDue) return false;
    const dueDate = new Date(motDue);
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
    return dueDate < thirtyDaysFromNow;
  };

  const isMotOverdue = (motDue: string | null) => {
    if (!motDue) return false;
    return new Date(motDue) < new Date();
  };

  return (
    <ManagerLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Fleet</h1>
            <p className="text-slate-500 mt-0.5">Manage vehicles and trailers</p>
          </div>
          <button className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-medium hover:bg-blue-700 transition-colors shadow-sm" data-testid="button-add-vehicle">
            <Plus className="h-4 w-4" />
            Add Vehicle
          </button>
        </div>

        {/* Search */}
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search by VRM, make, or model..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-11 pl-10 pr-4 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
            data-testid="input-vehicle-search"
          />
        </div>

        {/* Vehicles Grid */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-slate-900">Vehicles</h2>
            <span className="text-sm text-slate-500">{filteredVehicles.length} vehicles</span>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {isLoading ? (
              Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="h-44 bg-slate-100 rounded-2xl animate-pulse" />
              ))
            ) : filteredVehicles.length === 0 ? (
              <div className="col-span-full bg-white rounded-2xl border border-slate-200/60 p-12 text-center">
                <Truck className="h-12 w-12 text-slate-300 mx-auto mb-3" />
                <p className="text-slate-500">No vehicles found</p>
              </div>
            ) : (
              filteredVehicles.map((vehicle: any) => (
                <div 
                  key={vehicle.id} 
                  className="bg-white rounded-2xl border border-slate-200/60 shadow-sm p-4 hover:shadow-md transition-all group"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="h-11 w-11 bg-slate-100 rounded-xl flex items-center justify-center group-hover:bg-blue-50 transition-colors">
                        <Truck className="h-5 w-5 text-slate-500 group-hover:text-blue-600 transition-colors" />
                      </div>
                      <div>
                        <p className="font-mono font-bold text-slate-900">{vehicle.vrm}</p>
                        <p className="text-xs text-slate-500">{vehicle.fleetNumber || 'No fleet #'}</p>
                      </div>
                    </div>
                    <button className="h-8 w-8 rounded-lg hover:bg-slate-100 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity" data-testid={`button-vehicle-menu-${vehicle.id}`}>
                      <MoreVertical className="h-4 w-4 text-slate-400" />
                    </button>
                  </div>
                  
                  <p className="text-sm text-slate-600 mb-4">{vehicle.make} {vehicle.model}</p>
                  
                  <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                    <div className="flex items-center gap-1.5">
                      {vehicle.active ? (
                        <span className="inline-flex items-center gap-1 text-xs text-emerald-600 font-medium">
                          <CheckCircle2 className="h-3.5 w-3.5" />
                          Active
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-xs text-slate-500 font-medium">
                          <XCircle className="h-3.5 w-3.5" />
                          Inactive
                        </span>
                      )}
                    </div>
                    
                    {vehicle.motDue && (
                      <div className="flex items-center gap-1.5">
                        {isMotOverdue(vehicle.motDue) ? (
                          <span className="inline-flex items-center gap-1 text-xs text-red-600 font-medium">
                            <AlertTriangle className="h-3.5 w-3.5" />
                            MOT Overdue
                          </span>
                        ) : isMotDueSoon(vehicle.motDue) ? (
                          <span className="inline-flex items-center gap-1 text-xs text-amber-600 font-medium">
                            <Calendar className="h-3.5 w-3.5" />
                            MOT Due
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-xs text-slate-500">
                            <Calendar className="h-3.5 w-3.5" />
                            {new Date(vehicle.motDue).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Trailers */}
        {trailers && trailers.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-slate-900">Trailers</h2>
              <span className="text-sm text-slate-500">{trailers.length} trailers</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {trailers.map((trailer: any) => (
                <div 
                  key={trailer.id} 
                  className="bg-white rounded-2xl border border-slate-200/60 shadow-sm p-4 hover:shadow-md transition-all"
                >
                  <div className="flex items-center gap-3 mb-3">
                    <div className="h-11 w-11 bg-purple-50 rounded-xl flex items-center justify-center">
                      <Truck className="h-5 w-5 text-purple-600" />
                    </div>
                    <div>
                      <p className="font-mono font-bold text-slate-900">{trailer.registration}</p>
                      <p className="text-xs text-slate-500">{trailer.type}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </ManagerLayout>
  );
}
