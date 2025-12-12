import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { ManagerLayout } from "./ManagerLayout";
import { session } from "@/lib/session";
import { 
  Clock, 
  CheckCircle2, 
  XCircle, 
  Filter, 
  Download,
  ChevronLeft,
  ChevronRight,
  Eye,
  ClipboardCheck
} from "lucide-react";

export default function ManagerInspections() {
  const company = session.getCompany();
  const companyId = company?.id;
  const [page, setPage] = useState(0);
  const pageSize = 20;

  const { data: inspections, isLoading } = useQuery({
    queryKey: ["manager-inspections", companyId, page],
    queryFn: async () => {
      const res = await fetch(`/api/manager/inspections/${companyId}?limit=${pageSize}&offset=${page * pageSize}`);
      if (!res.ok) throw new Error("Failed to fetch inspections");
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

  const { data: users } = useQuery({
    queryKey: ["users", companyId],
    queryFn: async () => {
      const res = await fetch(`/api/manager/users/${companyId}`);
      if (!res.ok) throw new Error("Failed to fetch users");
      return res.json();
    },
    enabled: !!companyId,
  });

  const getVehicleVrm = (vehicleId: number) => {
    const vehicle = vehicles?.find((v: any) => v.id === vehicleId);
    return vehicle?.vrm || "Unknown";
  };

  const getVehicleName = (vehicleId: number) => {
    const vehicle = vehicles?.find((v: any) => v.id === vehicleId);
    return vehicle ? `${vehicle.make} ${vehicle.model}` : "";
  };

  const getDriverName = (driverId: number) => {
    const user = users?.find((u: any) => u.id === driverId);
    return user?.name || "Unknown";
  };

  return (
    <ManagerLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Inspections</h1>
            <p className="text-slate-500 mt-0.5">All vehicle inspection records</p>
          </div>
          <div className="flex items-center gap-3">
            <button className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors">
              <Filter className="h-4 w-4" />
              Filters
            </button>
            <button className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors">
              <Download className="h-4 w-4" />
              Export CSV
            </button>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200/60 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full" data-testid="table-inspections">
              <thead className="bg-slate-50/50">
                <tr>
                  <th className="text-left px-5 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">Date/Time</th>
                  <th className="text-left px-5 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">Vehicle</th>
                  <th className="text-left px-5 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">Driver</th>
                  <th className="text-left px-5 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">Type</th>
                  <th className="text-left px-5 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">Mileage</th>
                  <th className="text-left px-5 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">Result</th>
                  <th className="text-left px-5 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {isLoading ? (
                  Array.from({ length: 10 }).map((_, i) => (
                    <tr key={i}>
                      <td className="px-5 py-4"><div className="h-4 w-32 bg-slate-100 rounded animate-pulse" /></td>
                      <td className="px-5 py-4"><div className="h-4 w-24 bg-slate-100 rounded animate-pulse" /></td>
                      <td className="px-5 py-4"><div className="h-4 w-24 bg-slate-100 rounded animate-pulse" /></td>
                      <td className="px-5 py-4"><div className="h-4 w-20 bg-slate-100 rounded animate-pulse" /></td>
                      <td className="px-5 py-4"><div className="h-4 w-16 bg-slate-100 rounded animate-pulse" /></td>
                      <td className="px-5 py-4"><div className="h-6 w-16 bg-slate-100 rounded-full animate-pulse" /></td>
                      <td className="px-5 py-4"><div className="h-8 w-8 bg-slate-100 rounded animate-pulse" /></td>
                    </tr>
                  ))
                ) : inspections?.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-5 py-16 text-center">
                      <ClipboardCheck className="h-10 w-10 text-slate-300 mx-auto mb-3" />
                      <p className="text-slate-500">No inspections found</p>
                    </td>
                  </tr>
                ) : (
                  inspections?.map((inspection: any) => (
                    <tr key={inspection.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2.5">
                          <div className="h-8 w-8 rounded-lg bg-slate-100 flex items-center justify-center">
                            <Clock className="h-4 w-4 text-slate-400" />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-slate-900">
                              {new Date(inspection.createdAt).toLocaleDateString('en-GB', { 
                                day: '2-digit', 
                                month: 'short',
                                year: 'numeric'
                              })}
                            </p>
                            <p className="text-xs text-slate-500">
                              {new Date(inspection.createdAt).toLocaleTimeString('en-GB', {
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <p className="font-mono font-semibold text-sm text-slate-900">
                          {getVehicleVrm(inspection.vehicleId)}
                        </p>
                        <p className="text-xs text-slate-500">{getVehicleName(inspection.vehicleId)}</p>
                      </td>
                      <td className="px-5 py-4 text-sm text-slate-600">
                        {getDriverName(inspection.driverId)}
                      </td>
                      <td className="px-5 py-4">
                        <span className="text-sm text-slate-600 capitalize">{inspection.type.replace('_', ' ').toLowerCase()}</span>
                      </td>
                      <td className="px-5 py-4">
                        <span className="font-mono text-sm text-slate-900">
                          {inspection.odometer?.toLocaleString() || '-'} mi
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        {inspection.status === 'PASS' ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-50 text-emerald-700 rounded-full text-xs font-medium">
                            <CheckCircle2 className="h-3 w-3" />
                            Pass
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-red-50 text-red-700 rounded-full text-xs font-medium">
                            <XCircle className="h-3 w-3" />
                            Defects
                          </span>
                        )}
                      </td>
                      <td className="px-5 py-4">
                        <button className="h-8 w-8 rounded-lg hover:bg-slate-100 flex items-center justify-center transition-colors">
                          <Eye className="h-4 w-4 text-slate-400" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between px-5 py-4 border-t border-slate-100">
            <p className="text-sm text-slate-500">
              Showing {page * pageSize + 1} to {Math.min((page + 1) * pageSize, inspections?.length || 0)} results
            </p>
            <div className="flex items-center gap-2">
              <button 
                onClick={() => setPage(p => Math.max(0, p - 1))}
                disabled={page === 0}
                className="h-9 w-9 rounded-lg border border-slate-200 flex items-center justify-center hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft className="h-4 w-4 text-slate-600" />
              </button>
              <span className="text-sm text-slate-600 px-3">Page {page + 1}</span>
              <button 
                onClick={() => setPage(p => p + 1)}
                disabled={(inspections?.length || 0) < pageSize}
                className="h-9 w-9 rounded-lg border border-slate-200 flex items-center justify-center hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronRight className="h-4 w-4 text-slate-600" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </ManagerLayout>
  );
}
