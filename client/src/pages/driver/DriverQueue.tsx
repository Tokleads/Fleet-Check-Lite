import { DriverLayout } from "@/components/layout/AppShell";
import { UploadCloud, CheckCircle, WifiOff } from "lucide-react";

export default function DriverQueue() {
  return (
    <DriverLayout>
      <div className="pb-4">
        <h1 className="text-xl font-bold text-slate-900 mb-4">Upload Queue</h1>

        <div className="titan-card p-8 text-center">
          <div className="h-14 w-14 rounded-2xl bg-emerald-100 flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="h-7 w-7 text-emerald-600" />
          </div>
          <p className="font-semibold text-slate-900 text-lg">All synced</p>
          <p className="text-sm text-slate-500 mt-2">
            All your inspections, fuel entries, and deliveries have been uploaded successfully.
          </p>
        </div>

        <div className="titan-card p-4 mt-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-slate-100 flex items-center justify-center">
              <WifiOff className="h-5 w-5 text-slate-500" />
            </div>
            <div className="flex-1">
              <p className="font-semibold text-slate-900 text-sm">Offline Mode</p>
              <p className="text-xs text-slate-500">
                When you're offline, items will queue here and sync automatically when you're back online.
              </p>
            </div>
          </div>
        </div>
      </div>
    </DriverLayout>
  );
}