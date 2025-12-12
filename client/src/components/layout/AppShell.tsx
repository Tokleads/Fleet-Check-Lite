import { useBrand } from "@/hooks/use-brand";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";
import { LogOut, LayoutDashboard, Truck, Settings, FileText } from "lucide-react";

export function ManagerLayout({ children }: { children: React.ReactNode }) {
  const [, setLocation] = useLocation();
  const { currentCompany } = useBrand();

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row">
      {/* Sidebar */}
      <aside className="w-full md:w-64 bg-slate-900 text-slate-300 flex-shrink-0">
        <div className="p-6">
          <h2 className="text-white font-heading font-bold text-xl tracking-wide uppercase">{currentCompany.name}</h2>
          <p className="text-xs text-slate-500 mt-1">Manager Console</p>
        </div>
        
        <nav className="px-3 space-y-1">
          <NavItem icon={<LayoutDashboard size={20} />} label="Overview" active />
          <NavItem icon={<Truck size={20} />} label="Vehicles" />
          <NavItem icon={<FileText size={20} />} label="Inspections" />
          <NavItem icon={<Settings size={20} />} label="Settings" />
        </nav>

        <div className="p-4 mt-auto border-t border-slate-800">
          <Button 
            variant="ghost" 
            className="w-full justify-start text-slate-400 hover:text-white hover:bg-slate-800"
            onClick={() => setLocation("/")}
          >
            <LogOut className="mr-2 h-4 w-4" />
            Sign Out
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        {children}
      </main>
    </div>
  );
}

function NavItem({ icon, label, active = false }: { icon: React.ReactNode, label: string, active?: boolean }) {
  return (
    <div className={`
      flex items-center gap-3 px-3 py-2 rounded-md cursor-pointer transition-colors
      ${active ? 'bg-primary text-white' : 'hover:bg-slate-800 hover:text-white'}
    `}>
      {icon}
      <span className="font-medium text-sm">{label}</span>
    </div>
  );
}

export function DriverLayout({ children }: { children: React.ReactNode }) {
  const [, setLocation] = useLocation();
  const { currentCompany } = useBrand();

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col">
      <header className="bg-slate-900 text-white p-4 shadow-md sticky top-0 z-10">
        <div className="flex justify-between items-center max-w-md mx-auto w-full">
            <div>
                <h1 className="font-heading font-bold text-lg">{currentCompany.name}</h1>
                <p className="text-xs text-slate-400">Driver Portal</p>
            </div>
            <Button 
                variant="ghost" 
                size="icon" 
                className="text-slate-400 hover:text-white hover:bg-slate-800"
                onClick={() => setLocation("/")}
            >
                <LogOut size={20} />
            </Button>
        </div>
      </header>

      <main className="flex-1 max-w-md mx-auto w-full p-4 space-y-4">
        {children}
      </main>
    </div>
  );
}
