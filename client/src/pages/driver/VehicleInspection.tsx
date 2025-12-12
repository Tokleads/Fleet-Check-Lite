import { useState, useEffect, useCallback } from "react";
import { DriverLayout } from "@/components/layout/AppShell";
import { TitanButton } from "@/components/titan-ui/Button";
import { TitanCard } from "@/components/titan-ui/Card";
import { TitanInput } from "@/components/titan-ui/Input";
import { useLocation, useRoute } from "wouter";
import { api } from "@/lib/api";
import { session } from "@/lib/session";
import type { Vehicle } from "@shared/schema";
import { Check, ChevronLeft, ChevronDown, ChevronUp, Camera, AlertTriangle, Loader2, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { motion, AnimatePresence } from "framer-motion";
import { Textarea } from "@/components/ui/textarea";

type CheckStatus = "unchecked" | "pass" | "fail";

interface CheckItem {
  id: string;
  label: string;
  status: CheckStatus;
  defectNote?: string;
  defectPhoto?: string;
}

interface Section {
  id: string;
  title: string;
  icon: string;
  items: CheckItem[];
  isExpanded: boolean;
}

const INITIAL_SECTIONS: Omit<Section, "isExpanded">[] = [
  {
    id: "lights",
    title: "Lights & Signals",
    icon: "💡",
    items: [
      { id: "lamps", label: "Lamps / indicators / side repeaters / stoplamps", status: "unchecked" },
      { id: "reflectors", label: "Reflectors / markers / warning devices", status: "unchecked" },
    ]
  },
  {
    id: "exterior",
    title: "Exterior",
    icon: "🚛",
    items: [
      { id: "mirrors", label: "Mirrors / windscreen / glass condition", status: "unchecked" },
      { id: "body", label: "Body / wings", status: "unchecked" },
      { id: "doors", label: "Doors", status: "unchecked" },
      { id: "exhaust", label: "Exhaust condition", status: "unchecked" },
    ]
  },
  {
    id: "tyres",
    title: "Tyres & Wheels",
    icon: "🔘",
    items: [
      { id: "tyres", label: "Tyre condition / wear", status: "unchecked" },
      { id: "wheels", label: "Wheels condition", status: "unchecked" },
    ]
  },
  {
    id: "cab",
    title: "In Cab",
    icon: "🪑",
    items: [
      { id: "seatbelts", label: "Seat belts", status: "unchecked" },
      { id: "horn", label: "Horn / wipers / washers", status: "unchecked" },
      { id: "instruments", label: "Instrument panel (warning lights etc)", status: "unchecked" },
      { id: "speedometer", label: "Speedometer operation", status: "unchecked" },
      { id: "controls", label: "Driving controls / steering operation", status: "unchecked" },
    ]
  },
  {
    id: "fluids",
    title: "Fluids & Mechanical",
    icon: "🛢️",
    items: [
      { id: "fluids", label: "Oil / coolant / fluid levels", status: "unchecked" },
      { id: "leaks", label: "Fuel / oils / fluid leaks", status: "unchecked" },
      { id: "brakes", label: "Brakes", status: "unchecked" },
      { id: "battery", label: "Battery condition", status: "unchecked" },
    ]
  },
  {
    id: "load",
    title: "Load & Security",
    icon: "📦",
    items: [
      { id: "load", label: "Load security", status: "unchecked" },
    ]
  },
];

export default function VehicleInspection() {
  const [, params] = useRoute("/driver/inspection/:id");
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const [vehicle, setVehicle] = useState<Vehicle | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [sections, setSections] = useState<Section[]>(
    INITIAL_SECTIONS.map((s, i) => ({ ...s, isExpanded: i === 0 }))
  );
  const [odometer, setOdometer] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [defectSheetItem, setDefectSheetItem] = useState<{ sectionId: string; itemId: string } | null>(null);
  const [defectNote, setDefectNote] = useState("");
  const [defectPhoto, setDefectPhoto] = useState<string | null>(null);

  const company = session.getCompany();
  const user = session.getUser();
  const checkDate = new Date().toLocaleString("en-GB", {
    day: "2-digit",
    month: "2-digit", 
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  });

  useEffect(() => {
    if (params?.id) {
      loadVehicle(Number(params.id));
    }
  }, [params?.id]);

  const loadVehicle = async (id: number) => {
    setIsLoading(true);
    try {
      const vehicleData = await api.getVehicle(id);
      setVehicle(vehicleData);
    } catch (error) {
      console.error("Failed to load vehicle:", error);
      toast({ variant: "destructive", title: "Error", description: "Failed to load vehicle data" });
    } finally {
      setIsLoading(false);
    }
  };

  const toggleSection = (sectionId: string) => {
    setSections(prev => prev.map(s => 
      s.id === sectionId ? { ...s, isExpanded: !s.isExpanded } : s
    ));
  };

  const handleItemTap = (sectionId: string, itemId: string) => {
    setSections(prev => prev.map(s => {
      if (s.id !== sectionId) return s;
      return {
        ...s,
        items: s.items.map(item => {
          if (item.id !== itemId) return item;
          // Tap cycles: unchecked -> pass -> unchecked
          if (item.status === "unchecked") return { ...item, status: "pass" as CheckStatus };
          if (item.status === "pass") return { ...item, status: "unchecked" as CheckStatus };
          return item; // fail stays fail until cleared via sheet
        })
      };
    }));
  };

  const handleItemLongPress = (sectionId: string, itemId: string) => {
    const section = sections.find(s => s.id === sectionId);
    const item = section?.items.find(i => i.id === itemId);
    setDefectNote(item?.defectNote || "");
    setDefectPhoto(item?.defectPhoto || null);
    setDefectSheetItem({ sectionId, itemId });
  };

  const saveDefect = () => {
    if (!defectSheetItem) return;
    setSections(prev => prev.map(s => {
      if (s.id !== defectSheetItem.sectionId) return s;
      return {
        ...s,
        items: s.items.map(item => {
          if (item.id !== defectSheetItem.itemId) return item;
          return { ...item, status: "fail" as CheckStatus, defectNote, defectPhoto: defectPhoto || undefined };
        })
      };
    }));
    setDefectSheetItem(null);
    setDefectNote("");
    setDefectPhoto(null);
    toast({ title: "Defect recorded", description: "Item marked as failed" });
  };

  const clearDefect = () => {
    if (!defectSheetItem) return;
    setSections(prev => prev.map(s => {
      if (s.id !== defectSheetItem.sectionId) return s;
      return {
        ...s,
        items: s.items.map(item => {
          if (item.id !== defectSheetItem.itemId) return item;
          return { ...item, status: "unchecked" as CheckStatus, defectNote: undefined, defectPhoto: undefined };
        })
      };
    }));
    setDefectSheetItem(null);
    setDefectNote("");
    setDefectPhoto(null);
  };

  // Progress calculation
  const allItems = sections.flatMap(s => s.items);
  const checkedItems = allItems.filter(i => i.status !== "unchecked");
  const failedItems = allItems.filter(i => i.status === "fail");
  const progress = Math.round((checkedItems.length / allItems.length) * 100);
  const canSubmit = !!odometer && checkedItems.length === allItems.length;

  const getSectionProgress = (section: Section) => {
    const checked = section.items.filter(i => i.status !== "unchecked").length;
    return { checked, total: section.items.length, complete: checked === section.items.length };
  };

  const handleSubmit = async () => {
    if (!company || !user || !vehicle) {
      toast({ variant: "destructive", title: "Error", description: "Session expired. Please log in again." });
      return;
    }

    setIsSubmitting(true);
    try {
      const checklist = sections.flatMap(s => 
        s.items.map(item => ({
          section: s.title,
          item: item.label,
          status: item.status,
          defectNote: item.defectNote || null,
          hasPhoto: !!item.defectPhoto,
        }))
      );

      await api.createInspection({
        companyId: company.id,
        vehicleId: vehicle.id,
        driverId: user.id,
        type: "DAILY",
        odometer: Number(odometer),
        status: failedItems.length > 0 ? "FAIL" : "PASS",
        checklist,
        defects: failedItems.length > 0 ? failedItems.map(i => ({ item: i.label, note: i.defectNote })) : null,
      });

      toast({
        title: failedItems.length > 0 ? "Check Submitted with Defects" : "Safety Check Complete",
        description: failedItems.length > 0 
          ? `${failedItems.length} defect(s) reported. Manager notified.` 
          : "Vehicle passed. Safe to drive.",
        className: failedItems.length > 0 ? "border-amber-500 bg-amber-50" : "border-green-500 bg-green-50",
      });

      setLocation("/driver");
    } catch (error) {
      console.error("Failed to submit:", error);
      toast({ variant: "destructive", title: "Submission Failed", description: "Please try again." });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <DriverLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </DriverLayout>
    );
  }

  if (!vehicle) {
    return (
      <DriverLayout>
        <div className="text-center py-12">
          <p className="text-slate-500">Vehicle not found</p>
          <TitanButton variant="outline" onClick={() => setLocation("/driver")} className="mt-4">Back to Dashboard</TitanButton>
        </div>
      </DriverLayout>
    );
  }

  return (
    <DriverLayout>
      <div className="pb-28">
        {/* Sticky Header with Progress */}
        <div className="sticky top-0 bg-white z-30 -mx-4 px-4 pt-2 pb-3 border-b border-slate-100 shadow-sm">
          <div className="flex items-center gap-3 mb-3">
            <TitanButton variant="ghost" size="icon" onClick={() => setLocation(`/driver/vehicle/${vehicle.id}`)} className="h-9 w-9 -ml-2">
              <ChevronLeft className="h-5 w-5 text-slate-600" />
            </TitanButton>
            <div className="flex-1 min-w-0">
              <h1 className="text-base font-bold text-slate-900 truncate">Safety Check</h1>
              <p className="text-xs text-slate-500">{vehicle.vrm} • {checkDate}</p>
            </div>
            <div className="text-right">
              <div className="text-lg font-bold text-primary">{checkedItems.length}/{allItems.length}</div>
              <div className="text-[10px] text-slate-400 uppercase tracking-wide">Complete</div>
            </div>
          </div>
          
          {/* Progress Bar */}
          <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
            <motion.div 
              className={`h-full ${failedItems.length > 0 ? 'bg-amber-500' : 'bg-green-500'}`}
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
          {failedItems.length > 0 && (
            <p className="text-xs text-amber-600 mt-1 font-medium">{failedItems.length} defect(s) recorded</p>
          )}
        </div>

        <div className="space-y-3 pt-4">
          {/* Odometer Card */}
          <TitanCard className="p-4 bg-gradient-to-r from-slate-900 to-slate-800 text-white border-0 shadow-lg">
            <label className="text-xs font-medium text-white/60 uppercase tracking-wider block mb-2">Odometer Reading</label>
            <TitanInput
              type="number"
              placeholder="Enter current km"
              value={odometer}
              onChange={(e) => setOdometer(e.target.value)}
              className="font-mono text-xl bg-white/10 border-white/20 text-white placeholder:text-white/40 h-14"
              data-testid="input-odometer"
            />
          </TitanCard>

          {/* Collapsible Sections */}
          {sections.map((section) => {
            const { checked, total, complete } = getSectionProgress(section);
            return (
              <TitanCard key={section.id} className="overflow-hidden">
                {/* Section Header */}
                <button
                  onClick={() => toggleSection(section.id)}
                  className="w-full p-4 flex items-center gap-3 text-left hover:bg-slate-50 transition-colors"
                >
                  <span className="text-xl">{section.icon}</span>
                  <div className="flex-1">
                    <h3 className="font-bold text-slate-800">{section.title}</h3>
                    <p className="text-xs text-slate-500">{checked}/{total} checked</p>
                  </div>
                  <div className={`h-7 w-7 rounded-full flex items-center justify-center text-xs font-bold ${
                    complete ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500'
                  }`}>
                    {complete ? <Check className="h-4 w-4" /> : checked}
                  </div>
                  {section.isExpanded ? <ChevronUp className="h-5 w-5 text-slate-400" /> : <ChevronDown className="h-5 w-5 text-slate-400" />}
                </button>

                {/* Section Items */}
                <AnimatePresence>
                  {section.isExpanded && (
                    <motion.div
                      initial={{ height: 0 }}
                      animate={{ height: "auto" }}
                      exit={{ height: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="border-t border-slate-100">
                        {section.items.map((item, idx) => (
                          <CheckItemRow
                            key={item.id}
                            item={item}
                            isLast={idx === section.items.length - 1}
                            onTap={() => handleItemTap(section.id, item.id)}
                            onLongPress={() => handleItemLongPress(section.id, item.id)}
                          />
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </TitanCard>
            );
          })}
        </div>

        {/* Defect Bottom Sheet */}
        <AnimatePresence>
          {defectSheetItem && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/50 z-40"
                onClick={() => setDefectSheetItem(null)}
              />
              <motion.div
                initial={{ y: "100%" }}
                animate={{ y: 0 }}
                exit={{ y: "100%" }}
                className="fixed bottom-0 left-0 right-0 bg-white rounded-t-3xl z-50 p-6 pb-8 shadow-2xl"
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold text-slate-900">Report Defect</h3>
                  <button onClick={() => setDefectSheetItem(null)} className="p-2 -mr-2">
                    <X className="h-5 w-5 text-slate-400" />
                  </button>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-slate-700 block mb-2">Defect Description</label>
                    <Textarea
                      placeholder="Describe the issue..."
                      value={defectNote}
                      onChange={(e) => setDefectNote(e.target.value)}
                      className="min-h-[100px]"
                    />
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium text-slate-700 block mb-2">Photo Evidence (Required)</label>
                    {defectPhoto ? (
                      <div className="bg-green-50 border border-green-200 rounded-lg p-3 text-green-700 text-sm flex items-center gap-2">
                        <Check className="h-4 w-4" /> Photo captured
                      </div>
                    ) : (
                      <button
                        onClick={() => setDefectPhoto(`captured_${Date.now()}`)}
                        className="w-full p-4 border-2 border-dashed border-red-200 bg-red-50 rounded-lg text-red-600 hover:border-red-300 transition-colors flex items-center justify-center gap-2"
                      >
                        <Camera className="h-5 w-5" />
                        <span>Capture Photo</span>
                      </button>
                    )}
                  </div>

                  <div className="flex gap-3 pt-2">
                    <TitanButton variant="outline" className="flex-1" onClick={clearDefect}>
                      Clear / Cancel
                    </TitanButton>
                    <TitanButton 
                      variant="destructive" 
                      className="flex-1" 
                      onClick={saveDefect}
                      disabled={!defectNote.trim() || !defectPhoto}
                    >
                      Save Defect
                    </TitanButton>
                  </div>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>

        {/* Floating Submit Button */}
        <div className="fixed bottom-0 left-0 right-0 p-4 bg-white/95 backdrop-blur border-t border-slate-200 z-30">
          <div className="max-w-md mx-auto">
            <TitanButton 
              size="lg" 
              className="w-full shadow-xl" 
              onClick={handleSubmit}
              isLoading={isSubmitting}
              disabled={!canSubmit}
              variant={failedItems.length > 0 ? "destructive" : "primary"}
              data-testid="button-submit"
            >
              {!odometer 
                ? "Enter Odometer to Continue"
                : !canSubmit 
                  ? `Complete All Checks (${checkedItems.length}/${allItems.length})`
                  : failedItems.length > 0 
                    ? `Submit with ${failedItems.length} Defect(s)`
                    : "Submit Safety Check ✓"
              }
            </TitanButton>
          </div>
        </div>
      </div>
    </DriverLayout>
  );
}

// Check Item Row Component
function CheckItemRow({ 
  item, 
  isLast, 
  onTap, 
  onLongPress 
}: { 
  item: CheckItem;
  isLast: boolean;
  onTap: () => void;
  onLongPress: () => void;
}) {
  const [pressTimer, setPressTimer] = useState<NodeJS.Timeout | null>(null);
  const [isPressed, setIsPressed] = useState(false);

  const handleTouchStart = () => {
    setIsPressed(true);
    const timer = setTimeout(() => {
      onLongPress();
      setIsPressed(false);
    }, 500);
    setPressTimer(timer);
  };

  const handleTouchEnd = () => {
    if (pressTimer) {
      clearTimeout(pressTimer);
      if (isPressed) {
        onTap();
      }
    }
    setIsPressed(false);
    setPressTimer(null);
  };

  const handleTouchCancel = () => {
    if (pressTimer) clearTimeout(pressTimer);
    setIsPressed(false);
    setPressTimer(null);
  };

  return (
    <div
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      onTouchCancel={handleTouchCancel}
      onMouseDown={handleTouchStart}
      onMouseUp={handleTouchEnd}
      onMouseLeave={handleTouchCancel}
      className={`
        p-4 flex items-center gap-3 cursor-pointer select-none transition-all
        ${!isLast ? 'border-b border-slate-50' : ''}
        ${isPressed ? 'bg-slate-100 scale-[0.98]' : 'hover:bg-slate-50'}
        ${item.status === 'pass' ? 'bg-green-50/50' : ''}
        ${item.status === 'fail' ? 'bg-red-50/50' : ''}
      `}
    >
      <div className={`
        h-10 w-10 rounded-xl flex items-center justify-center text-sm font-bold transition-all
        ${item.status === 'pass' ? 'bg-green-500 text-white' : ''}
        ${item.status === 'fail' ? 'bg-red-500 text-white' : ''}
        ${item.status === 'unchecked' ? 'bg-slate-100 text-slate-400 border-2 border-dashed border-slate-200' : ''}
      `}>
        {item.status === 'pass' && <Check className="h-5 w-5" />}
        {item.status === 'fail' && <AlertTriangle className="h-5 w-5" />}
        {item.status === 'unchecked' && '?'}
      </div>
      
      <div className="flex-1 min-w-0">
        <p className={`text-sm font-medium ${item.status === 'unchecked' ? 'text-slate-700' : item.status === 'pass' ? 'text-green-800' : 'text-red-800'}`}>
          {item.label}
        </p>
        {item.status === 'unchecked' && (
          <p className="text-xs text-slate-400">Tap = Pass • Hold = Fail</p>
        )}
        {item.status === 'pass' && (
          <p className="text-xs text-green-600">Passed ✓</p>
        )}
        {item.status === 'fail' && item.defectNote && (
          <p className="text-xs text-red-600 truncate">{item.defectNote}</p>
        )}
      </div>
    </div>
  );
}
