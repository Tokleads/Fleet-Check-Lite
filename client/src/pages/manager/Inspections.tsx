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
  ClipboardCheck,
  Loader2
} from "lucide-react";

export default function ManagerInspections() {
  const company = session.getCompany();
  const companyId = company?.id;
  const [page, setPage] = useState(0);
  const pageSize = 20;
  const [showFilters, setShowFilters] = useState(false);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterVehicle, setFilterVehicle] = useState<string>('all');
  const [filterDriver, setFilterDriver] = useState<string>('all');

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

  const [isExporting, setIsExporting] = useState(false);

  const exportToCSV = async () => {
    if (!companyId) return;
    
    setIsExporting(true);
    try {
      // Fetch all inspections for export (no pagination)
      const res = await fetch(`/api/manager/inspections/${companyId}?limit=10000&offset=0`);
      if (!res.ok) throw new Error("Failed to fetch inspections");
      const allInspections = await res.json();
      
      if (!allInspections || allInspections.length === 0) {
        alert('No inspections to export');
        return;
      }

      // CSV header
      const headers = ['Date', 'Time', 'Vehicle VRM', 'Vehicle Name', 'Driver', 'Type', 'Mileage', 'Result'];
      
      // CSV rows
      const rows = allInspections.map((inspection: any) => {
        const date = new Date(inspection.createdAt);
        return [
          date.toLocaleDateString('en-GB'),
          date.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }),
          getVehicleVrm(inspection.vehicleId),
          getVehicleName(inspection.vehicleId),
          getDriverName(inspection.driverId),
          inspection.type.replace('_', ' ').toLowerCase(),
          inspection.odometer || '',
          inspection.status
        ].map(val => `"${String(val).replace(/"/g, '""')}"`).join(',');
      });

      // Combine header and rows
      const csvContent = [headers.join(','), ...rows].join('\n');
      
      // Create blob and download
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `inspections-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Export error:", error);
      alert('Failed to export inspections');
    } finally {
      setIsExporting(false);
    }
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
            <button 
              onClick={() => setShowFilters(!showFilters)}
              className={`inline-flex items-center gap-2 px-4 py-2 border rounded-xl text-sm font-medium transition-colors ${showFilters ? 'bg-blue-50 border-blue-200 text-blue-700' : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'}`}
              data-testid="button-inspections-filters"
            >
              <Filter className="h-4 w-4" />
              Filters
            </button>
            <button 
              onClick={exportToCSV}
              disabled={isExporting}
              className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed" 
              data-testid="button-inspections-export"
            >
              {isExporting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Exporting...
                </>
              ) : (
                <>
                  <Download className="h-4 w-4" />
                  Export CSV
                </>
              )}
            </button>
          </div>
        </div>

        {/* Filter Panel */}
        {showFilters && (
          <div className="bg-white rounded-xl border border-slate-200 p-4 flex flex-wrap items-center gap-4" data-testid="panel-filters">
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium text-slate-600">Status:</label>
              <select 
                value={filterStatus} 
                onChange={(e) => { setFilterStatus(e.target.value); setPage(0); }}
                className="px-3 py-2 rounded-lg border border-slate-200 text-sm bg-white"
                data-testid="select-filter-status"
              >
                <option value="all">All</option>
                <option value="PASS">Pass</option>
                <option value="FAIL">Defects</option>
              </select>
            </div>
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium text-slate-600">Vehicle:</label>
              <select 
                value={filterVehicle} 
                onChange={(e) => { setFilterVehicle(e.target.value); setPage(0); }}
                className="px-3 py-2 rounded-lg border border-slate-200 text-sm bg-white"
                data-testid="select-filter-vehicle"
              >
                <option value="all">All Vehicles</option>
                {vehicles?.map((v: any) => (
                  <option key={v.id} value={v.id}>{v.vrm} - {v.make} {v.model}</option>
                ))}
              </select>
            </div>
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium text-slate-600">Driver:</label>
              <select 
                value={filterDriver} 
                onChange={(e) => { setFilterDriver(e.target.value); setPage(0); }}
                className="px-3 py-2 rounded-lg border border-slate-200 text-sm bg-white"
                data-testid="select-filter-driver"
              >
                <option value="all">All Drivers</option>
                {users?.filter((u: any) => u.role === 'DRIVER').map((u: any) => (
                  <option key={u.id} value={u.id}>{u.name}</option>
                ))}
              </select>
            </div>
            <button 
              onClick={() => { setFilterStatus('all'); setFilterVehicle('all'); setFilterDriver('all'); setPage(0); }}
              className="px-3 py-2 text-sm text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
              data-testid="button-reset-filters"
            >
              Reset
            </button>
          </div>
        )}

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
                ) : (() => {
                  const filteredInspections = inspections?.filter((inspection: any) => {
                    if (filterStatus !== 'all' && inspection.status !== filterStatus) return false;
                    if (filterVehicle !== 'all' && inspection.vehicleId !== Number(filterVehicle)) return false;
                    if (filterDriver !== 'all' && inspection.driverId !== Number(filterDriver)) return false;
                    return true;
                  });
                  return filteredInspections?.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-5 py-16 text-center">
                        <ClipboardCheck className="h-10 w-10 text-slate-300 mx-auto mb-3" />
                        <p className="text-slate-500">No inspections found</p>
                      </td>
                    </tr>
                  ) : (
                    filteredInspections?.map((inspection: any) => (
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
                        <div className="flex items-center gap-1">
                          <button className="h-8 w-8 rounded-lg hover:bg-slate-100 flex items-center justify-center transition-colors" data-testid={`button-view-inspection-${inspection.id}`}>
                            <Eye className="h-4 w-4 text-slate-400" />
                          </button>
                          <a 
                            href={`/api/inspections/${inspection.id}/pdf`}
                            download
                            className="h-8 w-8 rounded-lg hover:bg-slate-100 flex items-center justify-center transition-colors"
                            data-testid={`button-download-pdf-${inspection.id}`}
                            title="Download PDF"
                          >
                            <Download className="h-4 w-4 text-slate-400" />
                          </a>
                        </div>
                      </td>
                    </tr>
                    ))
                  );
                })()}
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
                data-testid="button-inspections-prev-page"
              >
                <ChevronLeft className="h-4 w-4 text-slate-600" />
              </button>
              <span className="text-sm text-slate-600 px-3">Page {page + 1}</span>
              <button 
                onClick={() => setPage(p => p + 1)}
                disabled={(inspections?.length || 0) < pageSize}
                className="h-9 w-9 rounded-lg border border-slate-200 flex items-center justify-center hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                data-testid="button-inspections-next-page"
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
