import { useQuery } from "@tanstack/react-query";
import { ManagerLayout } from "./ManagerLayout";
import { TitanCard } from "@/components/titan-ui/Card";
import { session } from "@/lib/session";
import { 
  ClipboardCheck, 
  AlertTriangle, 
  Truck, 
  Calendar,
  TrendingUp,
  Clock,
  CheckCircle2,
  XCircle
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

interface DashboardStats {
  inspectionsToday: number;
  openDefects: number;
  vehiclesDue: number;
  totalVehicles: number;
}

function StatCard({ 
  title, 
  value, 
  icon: Icon, 
  color, 
  subtitle,
  loading 
}: { 
  title: string; 
  value: number; 
  icon: React.ElementType; 
  color: string;
  subtitle?: string;
  loading?: boolean;
}) {
  return (
    <TitanCard className="p-6" data-testid={`stat-${title.toLowerCase().replace(/\s/g, '-')}`}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-slate-500">{title}</p>
          {loading ? (
            <Skeleton className="h-9 w-20 mt-1" />
          ) : (
            <p className="text-3xl font-bold text-slate-900 mt-1">{value}</p>
          )}
          {subtitle && <p className="text-xs text-slate-400 mt-1">{subtitle}</p>}
        </div>
        <div className={`h-12 w-12 rounded-xl flex items-center justify-center ${color}`}>
          <Icon className="h-6 w-6" />
        </div>
      </div>
    </TitanCard>
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
      const res = await fetch(`/api/manager/inspections/${companyId}?limit=10`);
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

  const getDriverName = (driverId: number) => {
    const user = users?.find((u: any) => u.id === driverId);
    return user?.name || "Unknown";
  };

  return (
    <ManagerLayout>
      <div className="space-y-6">
        {/* Page header */}
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
          <p className="text-slate-500 mt-1">Fleet compliance overview</p>
        </div>

        {/* KPI Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Inspections Today"
            value={stats?.inspectionsToday || 0}
            icon={ClipboardCheck}
            color="bg-blue-100 text-blue-600"
            loading={statsLoading}
          />
          <StatCard
            title="Open Defects"
            value={stats?.openDefects || 0}
            icon={AlertTriangle}
            color="bg-amber-100 text-amber-600"
            loading={statsLoading}
          />
          <StatCard
            title="MOT Due (30 days)"
            value={stats?.vehiclesDue || 0}
            icon={Calendar}
            color="bg-red-100 text-red-600"
            loading={statsLoading}
          />
          <StatCard
            title="Active Vehicles"
            value={stats?.totalVehicles || 0}
            icon={Truck}
            color="bg-emerald-100 text-emerald-600"
            loading={statsLoading}
          />
        </div>

        {/* Recent Inspections Table */}
        <TitanCard className="overflow-hidden">
          <div className="p-4 border-b border-slate-100">
            <h2 className="font-semibold text-slate-900">Recent Inspections</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full" data-testid="table-recent-inspections">
              <thead className="bg-slate-50 border-b border-slate-100">
                <tr>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Date/Time</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">VRM</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Driver</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Type</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Result</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {inspectionsLoading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <tr key={i}>
                      <td className="px-4 py-3"><Skeleton className="h-4 w-32" /></td>
                      <td className="px-4 py-3"><Skeleton className="h-4 w-20" /></td>
                      <td className="px-4 py-3"><Skeleton className="h-4 w-24" /></td>
                      <td className="px-4 py-3"><Skeleton className="h-4 w-20" /></td>
                      <td className="px-4 py-3"><Skeleton className="h-6 w-16" /></td>
                    </tr>
                  ))
                ) : inspections?.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-4 py-12 text-center text-slate-500">
                      No inspections found
                    </td>
                  </tr>
                ) : (
                  inspections?.map((inspection: any) => (
                    <tr key={inspection.id} className="hover:bg-slate-50 cursor-pointer transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-slate-400" />
                          <span className="text-sm text-slate-900">
                            {new Date(inspection.createdAt).toLocaleDateString('en-GB', { 
                              day: '2-digit', 
                              month: 'short',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className="font-mono font-semibold text-sm text-slate-900">
                          {getVehicleVrm(inspection.vehicleId)}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-slate-600">
                        {getDriverName(inspection.driverId)}
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-sm text-slate-600">{inspection.type.replace('_', ' ')}</span>
                      </td>
                      <td className="px-4 py-3">
                        {inspection.status === 'PASS' ? (
                          <span className="inline-flex items-center gap-1 px-2 py-1 bg-emerald-100 text-emerald-700 rounded-full text-xs font-medium">
                            <CheckCircle2 className="h-3 w-3" />
                            Pass
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-1 bg-red-100 text-red-700 rounded-full text-xs font-medium">
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
        </TitanCard>
      </div>
    </ManagerLayout>
  );
}
