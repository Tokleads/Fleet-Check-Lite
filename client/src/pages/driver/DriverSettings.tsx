import { useState } from "react";
import { DriverLayout } from "@/components/layout/AppShell";
import { session } from "@/lib/session";
import { useLocation } from "wouter";
import { User, Building2, LogOut, Bell, Shield, ChevronRight } from "lucide-react";
import { TitanButton } from "@/components/titan-ui/Button";
import { useBrand } from "@/hooks/use-brand";

export default function DriverSettings() {
  const [, setLocation] = useLocation();
  const user = session.getUser();
  const company = session.getCompany();
  const { currentCompany } = useBrand();

  const handleLogout = () => {
    session.clear();
    setLocation("/app");
  };

  return (
    <DriverLayout>
      <div className="pb-4">
        <h1 className="text-xl font-bold text-slate-900 mb-4">Settings</h1>

        <div className="titan-card p-4 mb-4">
          <div className="flex items-center gap-4">
            <div className="h-14 w-14 rounded-2xl bg-primary/10 flex items-center justify-center">
              <User className="h-7 w-7 text-primary" />
            </div>
            <div className="flex-1">
              <p className="font-semibold text-slate-900 text-lg" data-testid="text-user-name">
                {user?.name || "Driver"}
              </p>
              <p className="text-sm text-slate-500" data-testid="text-user-role">
                {user?.role === "MANAGER" ? "Manager" : "Driver"}
              </p>
            </div>
          </div>
        </div>

        <div className="titan-card overflow-hidden mb-4">
          <div className="p-4 border-b border-slate-100 flex items-center gap-3">
            <Building2 className="h-5 w-5 text-slate-500" />
            <div className="flex-1">
              <p className="text-sm font-medium text-slate-900">Company</p>
              <p className="text-xs text-slate-500">{currentCompany?.name || company?.companyCode || "—"}</p>
            </div>
          </div>
          <button
            onClick={() => setLocation("/driver/notifications")}
            className="w-full p-4 border-b border-slate-100 flex items-center gap-3 hover:bg-slate-50 transition-colors"
            data-testid="button-notification-settings"
          >
            <Bell className="h-5 w-5 text-slate-500" />
            <span className="flex-1 text-sm font-medium text-slate-900 text-left">Notifications</span>
            <ChevronRight className="h-4 w-4 text-slate-400" />
          </button>
          <div className="p-4 flex items-center gap-3">
            <Shield className="h-5 w-5 text-slate-500" />
            <div className="flex-1">
              <p className="text-sm font-medium text-slate-900">App Version</p>
              <p className="text-xs text-slate-500">Titan Fleet v1.0</p>
            </div>
          </div>
        </div>

        <TitanButton
          variant="outline"
          className="w-full border-red-200 text-red-600 hover:bg-red-50"
          onClick={handleLogout}
          data-testid="button-logout"
        >
          <LogOut className="h-4 w-4 mr-2" />
          Sign Out
        </TitanButton>
      </div>
    </DriverLayout>
  );
}