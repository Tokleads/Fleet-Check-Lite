import { ManagerLayout } from "@/components/layout/AppShell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useBrand } from "@/hooks/use-brand";
import { api } from "@/lib/mockData";
import { Truck, CheckCircle, AlertOctagon, FileText } from "lucide-react";

export default function ManagerDashboard() {
  const { currentCompany } = useBrand();
  
  // Stats
  const vehicles = api.getVehicles(currentCompany.id);
  const inspections = api.getInspections(currentCompany.id);
  const defects = inspections.filter(i => i.status === "FAIL").length;

  return (
    <ManagerLayout>
      <div className="p-8 space-y-8">
        <div className="flex justify-between items-center">
            <div>
                <h1 className="text-3xl font-heading font-bold text-slate-900">Dashboard</h1>
                <p className="text-slate-500">Welcome back, Sarah.</p>
            </div>
            <div className="px-4 py-2 bg-white border rounded-full text-sm font-medium text-slate-600 shadow-sm flex items-center gap-2">
                <div className={`h-2 w-2 rounded-full ${currentCompany.googleDriveConnected ? 'bg-green-500' : 'bg-red-500'}`} />
                {currentCompany.googleDriveConnected ? 'Drive Connected' : 'Drive Disconnected'}
            </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard icon={<Truck className="text-blue-600" />} label="Total Vehicles" value={vehicles.length.toString()} />
            <StatCard icon={<FileText className="text-slate-600" />} label="Inspections Today" value={inspections.length.toString()} />
            <StatCard icon={<AlertOctagon className="text-red-600" />} label="Open Defects" value={defects.toString()} />
            <StatCard icon={<CheckCircle className="text-green-600" />} label="Pass Rate" value="92%" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-4">
                <h2 className="text-lg font-heading font-semibold text-slate-800">Recent Inspections</h2>
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-slate-50 text-slate-500 font-medium border-b border-slate-100">
                            <tr>
                                <th className="px-6 py-4">Vehicle</th>
                                <th className="px-6 py-4">Driver</th>
                                <th className="px-6 py-4">Type</th>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4">Date</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {inspections.map(insp => (
                                <tr key={insp.id} className="hover:bg-slate-50/50">
                                    <td className="px-6 py-4 font-heading font-medium text-slate-900">{insp.vehicleId}</td> 
                                    {/* In real app join tables, here just showing ID or using helper */}
                                    <td className="px-6 py-4 text-slate-600">John Doe</td>
                                    <td className="px-6 py-4 text-slate-600 capitalize">{insp.type.toLowerCase().replace('_', ' ')}</td>
                                    <td className="px-6 py-4">
                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                            insp.status === 'PASS' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                        }`}>
                                            {insp.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-slate-500">
                                        {new Date(insp.date).toLocaleDateString()}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            <div className="space-y-4">
                <h2 className="text-lg font-heading font-semibold text-slate-800">Fleet Status</h2>
                <Card className="h-full border-none shadow-none bg-transparent">
                    <CardContent className="p-0 space-y-4">
                        <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 flex items-center justify-between">
                            <div>
                                <p className="text-sm text-slate-500">MOT Due Soon</p>
                                <p className="text-2xl font-bold text-slate-900">3</p>
                            </div>
                            <div className="h-10 w-10 bg-amber-50 rounded-lg flex items-center justify-center text-amber-600">
                                <ClockIcon />
                            </div>
                        </div>
                         <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 flex items-center justify-between">
                            <div>
                                <p className="text-sm text-slate-500">Vehicles Off Road</p>
                                <p className="text-2xl font-bold text-slate-900">1</p>
                            </div>
                            <div className="h-10 w-10 bg-slate-50 rounded-lg flex items-center justify-center text-slate-600">
                                <Truck />
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
      </div>
    </ManagerLayout>
  );
}

function StatCard({ icon, label, value }: { icon: React.ReactNode, label: string, value: string }) {
    return (
        <Card className="border-none shadow-sm bg-white">
            <CardContent className="p-6 flex items-center gap-4">
                <div className="h-12 w-12 rounded-full bg-slate-50 flex items-center justify-center text-2xl">
                    {icon}
                </div>
                <div>
                    <p className="text-sm font-medium text-slate-500">{label}</p>
                    <h3 className="text-2xl font-bold text-slate-900">{value}</h3>
                </div>
            </CardContent>
        </Card>
    )
}

function ClockIcon() {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
    )
}
