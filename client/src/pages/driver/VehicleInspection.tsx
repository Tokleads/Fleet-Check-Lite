import { useState, useEffect } from "react";
import { DriverLayout } from "@/components/layout/AppShell";
import { TitanButton } from "@/components/titan-ui/Button";
import { TitanCard } from "@/components/titan-ui/Card";
import { TitanSegmentedControl } from "@/components/titan-ui/SegmentedControl";
import { TitanCaptureTile } from "@/components/titan-ui/CaptureTile";
import { TitanInput } from "@/components/titan-ui/Input";
import { useLocation, useRoute } from "wouter";
import { api } from "@/lib/api";
import { session } from "@/lib/session";
import type { Vehicle } from "@shared/schema";
import { CheckCircle2, ChevronLeft, ChevronRight, UploadCloud, AlertTriangle, Gauge, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { motion, AnimatePresence } from "framer-motion";
import { Textarea } from "@/components/ui/textarea";

const WIZARD_STEPS = [
  {
    id: "odometer",
    title: "Start Check",
    items: []
  },
  {
    id: "external",
    title: "External",
    items: ["Lights & Indicators", "Mirrors & Glass", "Tyres & Wheels", "Bodywork & Doors"]
  },
  {
    id: "fluids",
    title: "Fluids",
    items: ["Engine Oil", "Coolant", "Screen Wash", "AdBlue Level"]
  },
  {
    id: "cab",
    title: "In Cab",
    items: ["Wipers", "Horn", "Seatbelts", "Dashboard Warning Lights"]
  },
  {
    id: "review",
    title: "Review",
    items: []
  }
];

export default function VehicleInspection() {
  const [, params] = useRoute("/driver/inspection/:id");
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const [vehicle, setVehicle] = useState<Vehicle | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [checks, setChecks] = useState<Record<string, "pass" | "fail">>({});
  const [defects, setDefects] = useState<Record<string, { note: string; photo?: string }>>({});
  const [odometer, setOdometer] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const company = session.getCompany();
  const user = session.getUser();

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
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load vehicle data",
      });
    } finally {
      setIsLoading(false);
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
          <TitanButton variant="outline" onClick={() => setLocation("/driver")} className="mt-4">
            Back to Dashboard
          </TitanButton>
        </div>
      </DriverLayout>
    );
  }

  const currentStep = WIZARD_STEPS[currentStepIndex];
  const isLastStep = currentStepIndex === WIZARD_STEPS.length - 1;

  const canProceed = () => {
    if (currentStep.id === "odometer") return !!odometer && !isNaN(Number(odometer));
    if (currentStep.id === "review") return true;
    return currentStep.items.every(item => checks[item] !== undefined);
  };

  const handleNext = () => {
    if (canProceed()) {
      setCurrentStepIndex(prev => Math.min(prev + 1, WIZARD_STEPS.length - 1));
      window.scrollTo(0, 0);
    }
  };

  const handleBack = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex(prev => prev - 1);
    } else {
      setLocation(`/driver/vehicle/${vehicle.id}`);
    }
  };

  const handleSubmit = async () => {
    if (!company || !user) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Session expired. Please log in again.",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const hasFailures = Object.values(checks).some(v => v === "fail");
      
      const checklist = WIZARD_STEPS
        .filter(step => step.items.length > 0)
        .flatMap(step => 
          step.items.map(item => ({
            category: step.title,
            item,
            status: checks[item] || "pass",
            defectNote: defects[item]?.note || null,
          }))
        );

      const defectList = Object.entries(defects)
        .filter(([item]) => checks[item] === "fail")
        .map(([item, data]) => ({
          item,
          note: data.note,
          hasPhoto: !!data.photo,
        }));

      await api.createInspection({
        companyId: company.id,
        vehicleId: vehicle.id,
        driverId: user.id,
        type: "DAILY",
        odometer: Number(odometer),
        status: hasFailures ? "FAIL" : "PASS",
        checklist,
        defects: defectList.length > 0 ? defectList : null,
      });

      toast({
        title: "Inspection Submitted",
        description: hasFailures 
          ? "Defects logged. Manager notified." 
          : "Vehicle passed. Safe to drive.",
        className: hasFailures ? "border-amber-500 bg-amber-50" : "border-green-500 bg-green-50",
      });

      setLocation("/driver");
    } catch (error) {
      console.error("Failed to submit inspection:", error);
      toast({
        variant: "destructive",
        title: "Submission Failed",
        description: "Please try again or check your connection.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const progress = ((currentStepIndex + 1) / WIZARD_STEPS.length) * 100;
  const failCount = Object.values(checks).filter(v => v === "fail").length;

  return (
    <DriverLayout>
      <div className="flex flex-col min-h-[calc(100vh-80px)]">
        {/* Header with Progress */}
        <div className="sticky top-0 bg-slate-50/95 backdrop-blur z-20 pt-2 pb-4 border-b border-slate-200/50 mb-6">
          <div className="flex items-center gap-3 mb-3">
            <TitanButton variant="ghost" size="icon" onClick={handleBack} className="h-10 w-10 -ml-2" data-testid="button-back">
              <ChevronLeft className="h-6 w-6 text-slate-600" />
            </TitanButton>
            <div>
              <h2 className="font-heading font-bold text-lg leading-none">{vehicle.vrm}</h2>
              <p className="text-xs text-slate-500 font-medium uppercase tracking-wider mt-0.5">
                {currentStep.title} • Step {currentStepIndex + 1}/{WIZARD_STEPS.length}
              </p>
            </div>
          </div>
          <div className="h-1.5 bg-slate-200 rounded-full overflow-hidden w-full">
            <motion.div 
              className="h-full bg-primary" 
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
        </div>

        {/* Wizard Content */}
        <div className="flex-1 pb-24">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep.id}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
              className="space-y-6"
            >
              {currentStep.id === "odometer" && (
                <div className="space-y-6 pt-4">
                  <div className="text-center space-y-2 mb-8">
                    <div className="h-16 w-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto text-primary mb-4 ring-8 ring-blue-50/50">
                      <Gauge className="h-8 w-8" />
                    </div>
                    <h3 className="text-xl font-bold text-slate-900">Check Odometer</h3>
                    <p className="text-slate-500">Please enter the current mileage to begin.</p>
                  </div>
                  
                  <TitanInput 
                    label="Current Odometer (km)"
                    type="number" 
                    placeholder="e.g. 125400" 
                    className="text-2xl h-16 text-center font-mono tracking-widest"
                    value={odometer}
                    onChange={(e) => setOdometer(e.target.value)}
                    autoFocus
                    data-testid="input-odometer"
                  />
                </div>
              )}

              {/* Checklist Steps */}
              {currentStep.items.length > 0 && (
                <div className="space-y-6">
                  {currentStep.items.map((item, index) => (
                    <TitanCard key={item} className="p-5 space-y-4" data-testid={`check-item-${index}`}>
                      <div className="flex justify-between items-start">
                        <label className="text-base font-bold text-slate-800">{item}</label>
                        {checks[item] === "pass" && <CheckCircle2 className="text-green-500 h-5 w-5" />}
                      </div>
                      
                      <TitanSegmentedControl 
                        value={checks[item] || ""}
                        onChange={(val) => setChecks(prev => ({ ...prev, [item]: val as "pass" | "fail" }))}
                        options={[
                          { label: "Pass", value: "pass", variant: "success" },
                          { label: "Fail", value: "fail", variant: "danger" }
                        ]}
                      />

                      {/* Defect Capture if Failed */}
                      <AnimatePresence>
                        {checks[item] === "fail" && (
                          <motion.div 
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="pt-2 space-y-3 overflow-hidden"
                          >
                            <div className="bg-red-50 p-3 rounded-lg border border-red-100 text-red-800 text-sm flex gap-2">
                              <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
                              Please describe the defect and take a photo.
                            </div>
                            <Textarea 
                              placeholder="Describe defect..." 
                              className="bg-white"
                              value={defects[item]?.note || ""}
                              onChange={(e) => setDefects(prev => ({ 
                                ...prev, 
                                [item]: { ...prev[item], note: e.target.value } 
                              }))}
                              data-testid={`textarea-defect-${index}`}
                            />
                            <TitanCaptureTile 
                              label="Take Photo" 
                              required 
                              onCapture={() => {
                                setDefects(prev => ({
                                  ...prev,
                                  [item]: { ...prev[item], photo: "captured" }
                                }));
                              }}
                              value={defects[item]?.photo}
                              icon={<UploadCloud className="h-6 w-6" />}
                            />
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </TitanCard>
                  ))}
                </div>
              )}

              {currentStep.id === "review" && (
                <div className="space-y-6 pt-4">
                  <div className="text-center space-y-2 mb-6">
                    <div className={`h-16 w-16 rounded-full flex items-center justify-center mx-auto mb-4 ${
                      failCount > 0 ? 'bg-amber-100 text-amber-600' : 'bg-green-100 text-green-600'
                    }`}>
                      <CheckCircle2 className="h-8 w-8" />
                    </div>
                    <h3 className="text-xl font-bold text-slate-900">Ready to Submit</h3>
                    <p className="text-slate-500">Review your inspection details below.</p>
                  </div>

                  <TitanCard className="divide-y divide-slate-100">
                    <div className="p-4 flex justify-between">
                      <span className="text-slate-500">Vehicle</span>
                      <span className="font-mono font-bold">{vehicle.vrm}</span>
                    </div>
                    <div className="p-4 flex justify-between">
                      <span className="text-slate-500">Odometer</span>
                      <span className="font-mono font-bold">{odometer} km</span>
                    </div>
                    <div className="p-4 flex justify-between">
                      <span className="text-slate-500">Items Checked</span>
                      <span className="font-bold">{Object.keys(checks).length}</span>
                    </div>
                    <div className="p-4 flex justify-between">
                      <span className="text-slate-500">Defects Found</span>
                      <span className={`font-bold ${failCount > 0 ? "text-red-600" : "text-green-600"}`}>
                        {failCount}
                      </span>
                    </div>
                  </TitanCard>
                  
                  {failCount > 0 && (
                    <div className="bg-red-50 border border-red-100 rounded-xl p-4 space-y-2">
                      <h4 className="font-bold text-red-900 flex items-center gap-2">
                        <AlertTriangle className="h-4 w-4" /> Attention Required
                      </h4>
                      <p className="text-sm text-red-700">
                        This vehicle has reported defects. The transport manager will be notified immediately upon submission.
                      </p>
                    </div>
                  )}
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Floating Action Bar */}
        <div className="fixed bottom-0 left-0 right-0 p-4 bg-white/80 backdrop-blur border-t border-slate-200 z-50 pb-safe">
          <div className="max-w-md mx-auto w-full">
            {currentStep.id === "review" ? (
              <TitanButton 
                size="lg" 
                className="w-full shadow-titan-lg" 
                onClick={handleSubmit}
                isLoading={isSubmitting}
                variant={failCount > 0 ? "destructive" : "primary"}
                data-testid="button-submit-inspection"
              >
                Submit Inspection
              </TitanButton>
            ) : (
              <TitanButton 
                size="lg" 
                className="w-full shadow-titan-lg" 
                onClick={handleNext}
                disabled={!canProceed()}
                data-testid="button-next-step"
              >
                Next Step <ChevronRight className="ml-2 h-4 w-4" />
              </TitanButton>
            )}
          </div>
        </div>
      </div>
    </DriverLayout>
  );
}
