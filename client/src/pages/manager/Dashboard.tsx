import { useQuery } from "@tanstack/react-query";
import { ManagerLayout } from "./ManagerLayout";
import { session } from "@/lib/session";
import { 
  ClipboardCheck, 
  AlertTriangle, 
  Truck, 
  Calendar,
  Clock,
  CheckCircle2,
  XCircle,
  TrendingUp,
  ArrowUpRight,
  Fuel
} from "lucide-react";

interface DashboardStats {
  inspectionsToday: number;
  openDefects: number;
  vehiclesDue: number;
  totalVehicles: number;
}

function KPICard({ 
  title, 
  value, 
  icon: Icon, 
  iconBg,
  iconColor,
  trend,
  loading 
}: { 
  title: string; 
  value: number; 
  icon: React.ElementType; 
  iconBg: string;
  iconColor: string;
  trend?: { value: string; positive: boolean };
  loading?: boolean;
}) {
  return (
    <div 
      className="bg-white rounded-2xl p-5 border border-slate-200/60 shadow-sm hover:shadow-md transition-shadow"
      data-testid={`stat-${title.toLowerCase().replace(/\s/g, '-')}`}
    >
      <div className="flex items-start justify-between">
        <div className="space-y-3">
          <p className="text-sm font-medium text-slate-500">{title}</p>
          {loading ? (
            <div className="h-9 w-20 bg-slate-100 rounded-lg animate-pulse" />
          ) : (
            <p className="text-3xl font-bold text-slate-900 tracking-tight">{value}</p>
          )}
          {trend && (
            <div className={`flex items-center gap-1 text-xs font-medium ${trend.positive ? 'text-emerald-600' : 'text-red-600'}`}>
              <TrendingUp className={`h-3 w-3 ${!trend.positive && 'rotate-180'}`} />
              {trend.value}
            </div>
          )}
        </div>
        <div className={`h-12 w-12 rounded-xl flex items-center justify-center ${iconBg}`}>
          <Icon className={`h-6 w-6 ${iconColor}`} />
        </div>
      </div>
    </div>
  );
}

function QuickAction({ icon: Icon, label, count, color }: { icon: React.ElementType; label: string; count?: number; color: string }) {
  return (
    <button className="flex items-center gap-3 p-4 bg-white rounded-xl border border-slate-200/60 hover:border-slate-300 hover:shadow-sm transition-all group">
      <div className={`h-10 w-10 rounded-lg flex items-center justify-center ${color}`}>
        <Icon className="h-5 w-5" />
      </div>
      <div className="flex-1 text-left">
        <p className="text-sm font-medium text-slate-900 group-hover:text-blue-600 transition-colors">{label}</p>
        {count !== undefined && (
          <p className="text-xs text-slate-500">{count} items</p>
        )}
      </div>
      <ArrowUpRight className="h-4 w-4 text-slate-400 group-hover:text-blue-600 transition-colors" />
    </button>
  );
}

export default function ManagerDashboard() {
  const company = session.getCompany();
  const companyId = company?.id;

  const { data: stats, isLoading: statsLoading } = useQuery<DashboardStats>({
    queryKey: ["manager-stats", companyId],
    queryFn: async () => {
      const res = await fetch(`/api/manager/stats/${companyId}`);
      if (!res.ok) throw new Error("Failed to fetch stats");
      return res.json();
    },
    enabled: !!companyId,
  });

  const { data: inspections, isLoading: inspectionsLoading } = useQuery({
    queryKey: ["manager-inspections", companyId],
    queryFn: async () => {
      const res = await fetch(`/api/manager/inspections/${companyId}?limit=8`);
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

  const { data: defects } = useQuery({
    queryKey: ["manager-defects", companyId],
    queryFn: async () => {
      const res = await fetch(`/api/manager/defects/${companyId}`);
      if (!res.ok) throw new Error("Failed to fetch defects");
      return res.json();
    },
    enabled: !!companyId,
  });

  const getVehicleVrm = (vehicleId: number) => {
    const vehicle = vehicles?.find((v: any) => v.id === vehicleId);
    return vehicle?.vrm || "Unknown";
  };

  const getDriverName = (driverId: number) => {
    const user = users?.find((u: any) => u.id === driverId);
    return user?.name || "Unknown";
  };

  const openDefectsCount = defects?.filter((d: any) => d.status === 'OPEN').length || 0;

  return (
    <ManagerLayout>
      <div className="space-y-6">
        {/* Page header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
            <p className="text-slate-500 mt-0.5">Fleet compliance overview</p>
          </div>
          <div className="text-right">
            <p className="text-sm text-slate-500">
              {new Date().toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
            </p>
          </div>
        </div>

        {/* KPI Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <KPICard
            title="Inspections Today"
            value={stats?.inspectionsToday || 0}
            icon={ClipboardCheck}
            iconBg="bg-blue-50"
            iconColor="text-blue-600"
            loading={statsLoading}
          />
          <KPICard
            title="Open Defects"
            value={stats?.openDefects || 0}
            icon={AlertTriangle}
            iconBg="bg-amber-50"
            iconColor="text-amber-600"
            loading={statsLoading}
          />
          <KPICard
            title="MOT Due (30 days)"
            value={stats?.vehiclesDue || 0}
            icon={Calendar}
            iconBg="bg-red-50"
            iconColor="text-red-600"
            loading={statsLoading}
          />
          <KPICard
            title="Active Vehicles"
            value={stats?.totalVehicles || 0}
            icon={Truck}
            iconBg="bg-emerald-50"
            iconColor="text-emerald-600"
            loading={statsLoading}
          />
        </div>

        {/* Main content grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recent Inspections */}
          <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200/60 shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
              <h2 className="font-semibold text-slate-900">Recent Inspections</h2>
              <a href="/manager/inspections" className="text-sm text-blue-600 hover:text-blue-700 font-medium">View all</a>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full" data-testid="table-recent-inspections">
                <thead className="bg-slate-50/50">
                  <tr>
                    <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Time</th>
                    <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">VRM</th>
                    <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Driver</th>
                    <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Result</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {inspectionsLoading ? (
                    Array.from({ length: 5 }).map((_, i) => (
                      <tr key={i}>
                        <td className="px-5 py-3.5"><div className="h-4 w-24 bg-slate-100 rounded animate-pulse" /></td>
                        <td className="px-5 py-3.5"><div className="h-4 w-20 bg-slate-100 rounded animate-pulse" /></td>
                        <td className="px-5 py-3.5"><div className="h-4 w-28 bg-slate-100 rounded animate-pulse" /></td>
                        <td className="px-5 py-3.5"><div className="h-6 w-16 bg-slate-100 rounded-full animate-pulse" /></td>
                      </tr>
                    ))
                  ) : inspections?.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="px-5 py-12 text-center text-slate-500">
                        <ClipboardCheck className="h-8 w-8 text-slate-300 mx-auto mb-2" />
                        No inspections today
                      </td>
                    </tr>
                  ) : (
                    inspections?.slice(0, 6).map((inspection: any) => (
                      <tr key={inspection.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="px-5 py-3.5">
                          <div className="flex items-center gap-2 text-sm text-slate-600">
                            <Clock className="h-3.5 w-3.5 text-slate-400" />
                            {new Date(inspection.createdAt).toLocaleTimeString('en-GB', { 
                              hour: '2-digit', 
                              minute: '2-digit'
                            })}
                          </div>
                        </td>
                        <td className="px-5 py-3.5">
                          <span className="font-mono font-semibold text-sm text-slate-900">
                            {getVehicleVrm(inspection.vehicleId)}
                          </span>
                        </td>
                        <td className="px-5 py-3.5 text-sm text-slate-600">
                          {getDriverName(inspection.driverId)}
                        </td>
                        <td className="px-5 py-3.5">
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
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="space-y-4">
            <h2 className="font-semibold text-slate-900">Quick Actions</h2>
            <div className="space-y-3">
              <QuickAction 
                icon={AlertTriangle} 
                label="Review Open Defects" 
                count={openDefectsCount}
                color="bg-amber-100 text-amber-600"
              />
              <QuickAction 
                icon={ClipboardCheck} 
                label="Today's Inspections" 
                count={stats?.inspectionsToday || 0}
                color="bg-blue-100 text-blue-600"
              />
              <QuickAction 
                icon={Fuel} 
                label="Fuel Entries" 
                color="bg-purple-100 text-purple-600"
              />
              <QuickAction 
                icon={Truck} 
                label="Fleet Overview" 
                count={stats?.totalVehicles || 0}
                color="bg-emerald-100 text-emerald-600"
              />
            </div>
          </div>
        </div>
      </div>
    </ManagerLayout>
  );
}
