import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ManagerLayout } from "./ManagerLayout";
import { session } from "@/lib/session";
import { 
  AlertTriangle, 
  Clock, 
  CheckCircle2,
  Wrench,
  Filter,
  Truck,
  ChevronRight
} from "lucide-react";

const statusColors: Record<string, string> = {
  OPEN: "bg-red-50 text-red-700 border-red-200",
  IN_PROGRESS: "bg-amber-50 text-amber-700 border-amber-200",
  RESOLVED: "bg-emerald-50 text-emerald-700 border-emerald-200",
};

const severityColors: Record<string, string> = {
  LOW: "bg-blue-50 text-blue-600",
  MEDIUM: "bg-amber-50 text-amber-600",
  HIGH: "bg-orange-50 text-orange-600",
  CRITICAL: "bg-red-50 text-red-600",
};

const columnConfig = [
  { status: "OPEN", label: "Open", icon: AlertTriangle, color: "text-red-600" },
  { status: "IN_PROGRESS", label: "In Progress", icon: Wrench, color: "text-amber-600" },
  { status: "RESOLVED", label: "Resolved", icon: CheckCircle2, color: "text-emerald-600" },
];

export default function ManagerDefects() {
  const company = session.getCompany();
  const companyId = company?.id;
  const queryClient = useQueryClient();

  const { data: defects, isLoading } = useQuery({
    queryKey: ["manager-defects", companyId],
    queryFn: async () => {
      const res = await fetch(`/api/manager/defects/${companyId}`);
      if (!res.ok) throw new Error("Failed to fetch defects");
      return res.json();
    },
    enabled: !!companyId,
  });

  const { data: vehicles } = useQuery({
    queryKey: ["vehicles", companyId],
    queryFn: async () => {
      const res = await fetch(`/api/vehicles?companyId=${companyId}`);
      if (!res.ok) throw new Error("Failed to fetch vehicles");
      return res.json();
    },
    enabled: !!companyId,
  });

  const updateDefectMutation = useMutation({
    mutationFn: async ({ id, status }: { id: number; status: string }) => {
      const res = await fetch(`/api/manager/defects/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (!res.ok) throw new Error("Failed to update defect");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["manager-defects"] });
    },
  });

  const getVehicleVrm = (vehicleId: number | null) => {
    if (!vehicleId) return "N/A";
    const vehicle = vehicles?.find((v: any) => v.id === vehicleId);
    return vehicle?.vrm || "Unknown";
  };

  const getDefectsByStatus = (status: string) => 
    defects?.filter((d: any) => d.status === status) || [];

  return (
    <ManagerLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Defects</h1>
            <p className="text-slate-500 mt-0.5">Track and manage reported vehicle defects</p>
          </div>
          <button className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors">
            <Filter className="h-4 w-4" />
            Filters
          </button>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((col) => (
              <div key={col} className="space-y-4">
                <div className="h-6 w-32 bg-slate-200 rounded animate-pulse" />
                {[1, 2].map((i) => (
                  <div key={i} className="h-36 bg-slate-100 rounded-2xl animate-pulse" />
                ))}
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {columnConfig.map(({ status, label, icon: Icon, color }) => {
              const columnDefects = getDefectsByStatus(status);
              return (
                <div key={status} className="space-y-4">
                  <div className="flex items-center gap-2">
                    <Icon className={`h-5 w-5 ${color}`} />
                    <h2 className="font-semibold text-slate-900">{label}</h2>
                    <span className="ml-auto text-sm text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
                      {columnDefects.length}
                    </span>
                  </div>
                  
                  <div className="space-y-3">
                    {columnDefects.length === 0 ? (
                      <div className="bg-slate-50 rounded-2xl p-6 text-center border-2 border-dashed border-slate-200">
                        <p className="text-sm text-slate-400">No defects</p>
                      </div>
                    ) : (
                      columnDefects.map((defect: any) => (
                        <div 
                          key={defect.id} 
                          className="bg-white rounded-2xl border border-slate-200/60 shadow-sm p-4 hover:shadow-md transition-all cursor-pointer group"
                        >
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex items-center gap-2">
                              <div className="h-8 w-8 bg-slate-100 rounded-lg flex items-center justify-center">
                                <Truck className="h-4 w-4 text-slate-500" />
                              </div>
                              <span className="font-mono font-semibold text-sm text-slate-900">
                                {getVehicleVrm(defect.vehicleId)}
                              </span>
                            </div>
                            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${severityColors[defect.severity] || severityColors.MEDIUM}`}>
                              {defect.severity}
                            </span>
                          </div>
                          
                          <p className="text-sm font-medium text-slate-900 mb-1">{defect.category}</p>
                          <p className="text-sm text-slate-600 line-clamp-2 mb-3">{defect.description}</p>
                          
                          <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                            <div className="flex items-center gap-1 text-xs text-slate-500">
                              <Clock className="h-3 w-3" />
                              {new Date(defect.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
                            </div>
                            <ChevronRight className="h-4 w-4 text-slate-400 group-hover:text-slate-600 transition-colors" />
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </ManagerLayout>
  );
}
