import { useState } from "react";
import { useLocation, Link } from "wouter";
import { 
  LayoutDashboard, 
  ClipboardCheck, 
  AlertTriangle, 
  Fuel, 
  Truck, 
  Settings, 
  Menu, 
  X,
  LogOut,
  Search,
  Bell,
  FileText
} from "lucide-react";
import tenantConfig from "@/config/tenant";
import { TitanButton } from "@/components/titan-ui/Button";
import { session } from "@/lib/session";

const navItems = [
  { path: "/manager", icon: LayoutDashboard, label: "Dashboard" },
  { path: "/manager/inspections", icon: ClipboardCheck, label: "Inspections" },
  { path: "/manager/defects", icon: AlertTriangle, label: "Defects" },
  { path: "/manager/fuel", icon: Fuel, label: "Fuel Log" },
  { path: "/manager/fleet", icon: Truck, label: "Fleet" },
  { path: "/manager/documents", icon: FileText, label: "Documents" },
  { path: "/manager/settings", icon: Settings, label: "Settings" },
];

export function ManagerLayout({ children }: { children: React.ReactNode }) {
  const [location, setLocation] = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const handleLogout = () => {
    session.clear();
    setLocation("/manager/login");
  };

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Sidebar */}
      <aside className={`${sidebarOpen ? 'w-64' : 'w-20'} bg-white border-r border-slate-200 flex flex-col transition-all duration-200`}>
        {/* Logo */}
        <div className="h-16 flex items-center gap-3 px-4 border-b border-slate-100">
          {tenantConfig.logoUrl ? (
            <img src={tenantConfig.logoUrl} alt={tenantConfig.companyName} className="h-8 w-auto" />
          ) : (
            <div 
              className="h-10 w-10 rounded-xl flex items-center justify-center text-white font-bold"
              style={{ backgroundColor: tenantConfig.colors.primary }}
            >
              {tenantConfig.companyName.substring(0, 1)}
            </div>
          )}
          {sidebarOpen && (
            <div className="flex-1 min-w-0">
              <h1 className="font-semibold text-sm text-slate-900 truncate">{tenantConfig.companyName}</h1>
              <p className="text-[10px] text-slate-500 uppercase tracking-wider">Manager Portal</p>
            </div>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-3 space-y-1">
          {navItems.map((item) => {
            const isActive = location === item.path || 
              (item.path !== "/manager" && location.startsWith(item.path));
            return (
              <Link key={item.path} href={item.path}>
                <a 
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${
                    isActive 
                      ? 'bg-primary/10 text-primary' 
                      : 'text-slate-600 hover:bg-slate-100'
                  }`}
                  data-testid={`nav-${item.label.toLowerCase()}`}
                >
                  <item.icon className={`h-5 w-5 ${isActive ? 'text-primary' : 'text-slate-400'}`} />
                  {sidebarOpen && <span className="font-medium text-sm">{item.label}</span>}
                </a>
              </Link>
            );
          })}
        </nav>

        {/* Collapse button */}
        <div className="p-3 border-t border-slate-100">
          <button 
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 text-slate-500 hover:bg-slate-100 rounded-lg transition-colors"
          >
            {sidebarOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
            {sidebarOpen && <span className="text-sm">Collapse</span>}
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col">
        {/* Top bar */}
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6">
          <div className="flex items-center gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search VRM, driver, inspection..."
                className="w-80 h-10 pl-10 pr-4 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                data-testid="input-global-search"
              />
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button className="relative h-10 w-10 rounded-lg hover:bg-slate-100 flex items-center justify-center transition-colors">
              <Bell className="h-5 w-5 text-slate-500" />
              <span className="absolute top-2 right-2 h-2 w-2 bg-red-500 rounded-full" />
            </button>
            <TitanButton 
              variant="ghost" 
              size="sm" 
              onClick={handleLogout}
              className="text-slate-600"
              data-testid="button-logout"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Sign out
            </TitanButton>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 p-6 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
