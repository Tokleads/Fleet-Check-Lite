import { useState, useEffect, useMemo } from "react";
import { DriverLayout } from "@/components/layout/AppShell";
import { api } from "@/lib/api";
import { session } from "@/lib/session";
import type { Inspection, FuelEntry } from "@shared/schema";
import { Check, AlertTriangle, Fuel, Clock, FileText, ChevronRight } from "lucide-react";
import { useLocation } from "wouter";
import { motion } from "framer-motion";

export default function DriverHistory() {
  const [, setLocation] = useLocation();
  const [inspections, setInspections] = useState<Inspection[]>([]);
  const [fuelEntries, setFuelEntries] = useState<FuelEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"all" | "inspections" | "fuel">("all");

  const user = session.getUser();
  const company = session.getCompany();

  useEffect(() => {
    if (!user || !company) {
      setLocation('/app');
      return;
    }

    let mounted = true;
    const loadHistory = async () => {
      try {
        const [inspectionData, fuelData] = await Promise.all([
          api.getInspections(company.id, user.id, 30),
          api.getFuelEntries(company.id, user.id, 30)
        ]);
        if (mounted) {
          setInspections(inspectionData);
          setFuelEntries(fuelData);
        }
      } catch (error) {
        console.error("Failed to load history:", error);
      } finally {
        if (mounted) setIsLoading(false);
      }
    };
    loadHistory();
    return () => { mounted = false; };
  }, []);

  const timeline = useMemo(() => {
    const items: Array<{ type: "inspection" | "fuel"; date: Date; data: any }> = [];
    inspections.forEach(i => items.push({ type: "inspection", date: new Date(i.createdAt!), data: i }));
    fuelEntries.forEach(f => items.push({ type: "fuel", date: new Date(f.createdAt!), data: f }));
    items.sort((a, b) => b.date.getTime() - a.date.getTime());

    if (activeTab === "inspections") return items.filter(i => i.type === "inspection");
    if (activeTab === "fuel") return items.filter(i => i.type === "fuel");
    return items;
  }, [inspections, fuelEntries, activeTab]);

  const formatDate = (date: Date) => {
    return date.toLocaleString("en-GB", {
      day: "2-digit", month: "short", year: "numeric",
      hour: "2-digit", minute: "2-digit"
    });
  };

  return (
    <DriverLayout>
      <div className="pb-4">
        <h1 className="text-xl font-bold text-slate-900 mb-4">History</h1>

        <div className="flex gap-2 mb-4">
          {(["all", "inspections", "fuel"] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
                activeTab === tab
                  ? "bg-primary text-white"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
              data-testid={`tab-${tab}`}
            >
              {tab === "all" ? "All" : tab === "inspections" ? "Inspections" : "Fuel"}
            </button>
          ))}
        </div>

        {isLoading ? (
          <div className="space-y-3">
            {[1,2,3].map(i => (
              <div key={i} className="titan-card p-4 animate-pulse">
                <div className="h-4 bg-slate-200 rounded w-3/4 mb-2" />
                <div className="h-3 bg-slate-100 rounded w-1/2" />
              </div>
            ))}
          </div>
        ) : timeline.length === 0 ? (
          <div className="titan-card p-8 text-center">
            <Clock className="h-10 w-10 text-slate-300 mx-auto mb-3" />
            <p className="font-semibold text-slate-900">No history yet</p>
            <p className="text-sm text-slate-500 mt-1">Your inspections and fuel entries will appear here</p>
          </div>
        ) : (
          <div className="space-y-2">
            {timeline.map((item, idx) => (
              <motion.div
                key={`${item.type}-${item.data.id}`}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.03 }}
                className="titan-card p-4"
              >
                {item.type === "inspection" ? (
                  <div className="flex items-center gap-3">
                    <div className={`h-10 w-10 rounded-xl flex items-center justify-center ${
                      item.data.status === "PASS" ? "bg-emerald-100" : "bg-red-100"
                    }`}>
                      {item.data.status === "PASS" 
                        ? <Check className="h-5 w-5 text-emerald-600" />
                        : <AlertTriangle className="h-5 w-5 text-red-600" />
                      }
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-slate-900 text-sm">
                        {item.data.type === "END_OF_SHIFT" ? "End of Shift" : "Safety Check"}
                      </p>
                      <p className="text-xs text-slate-500 truncate">
                        {formatDate(item.date)} · {item.data.odometer?.toLocaleString()} mi
                      </p>
                    </div>
                    <span className={`text-xs font-semibold px-2 py-1 rounded-full ${
                      item.data.status === "PASS" 
                        ? "bg-emerald-100 text-emerald-700" 
                        : "bg-red-100 text-red-700"
                    }`} data-testid={`badge-status-${item.data.id}`}>
                      {item.data.status}
                    </span>
                  </div>
                ) : (
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl bg-blue-100 flex items-center justify-center">
                      <Fuel className="h-5 w-5 text-blue-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-slate-900 text-sm">
                        {item.data.fuelType === "ADBLUE" ? "AdBlue" : "Diesel"} · {item.data.litres}L
                      </p>
                      <p className="text-xs text-slate-500">
                        {formatDate(item.date)} · £{item.data.cost ? Number(item.data.cost).toFixed(2) : "—"}
                      </p>
                    </div>
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </DriverLayout>
  );
}