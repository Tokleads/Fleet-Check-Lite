import { useState, useEffect } from "react";
import { DriverLayout } from "@/components/layout/AppShell";
import { TitanButton } from "@/components/titan-ui/Button";
import { TitanCard } from "@/components/titan-ui/Card";
import { TitanInput } from "@/components/titan-ui/Input";
import { useLocation, useRoute } from "wouter";
import { api } from "@/lib/api";
import { session } from "@/lib/session";
import type { Vehicle } from "@shared/schema";
import { Check, ChevronLeft, Camera, AlertTriangle, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { motion } from "framer-motion";
import { Textarea } from "@/components/ui/textarea";

const CHECKLIST_ITEMS = [
  "Lamps / indicators / side repeaters / stoplamps",
  "Reflectors / markers / warning devices",
  "Mirrors / windscreen / glass condition",
  "Body / wings",
  "Oil / coolant / fluid levels",
  "Seat belts",
  "Load security",
  "Horn / wipers / washers",
  "Doors",
  "Brakes",
  "Fuel / oils / fluid leaks",
  "Instrument panel (warning lights etc)",
  "Exhaust condition",
  "Driving controls / steering operation",
  "Tyre condition / wear",
  "Speedometer operation",
  "Wheels condition",
  "Battery condition",
];

export default function VehicleInspection() {
  const [, params] = useRoute("/driver/inspection/:id");
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const [vehicle, setVehicle] = useState<Vehicle | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [checks, setChecks] = useState<Record<string, boolean>>({});
  const [odometer, setOdometer] = useState("");
  const [defectDetails, setDefectDetails] = useState("");
  const [defectImages, setDefectImages] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

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
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load vehicle data",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const toggleCheck = (item: string) => {
    setChecks(prev => ({ ...prev, [item]: !prev[item] }));
  };

  const allChecked = CHECKLIST_ITEMS.every(item => checks[item]);
  const canSubmit = !!odometer && allChecked;

  const handleSubmit = async () => {
    if (!company || !user || !vehicle) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Session expired. Please log in again.",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const hasDefects = defectDetails.trim().length > 0;
      
      const checklist = CHECKLIST_ITEMS.map(item => ({
        item,
        checked: !!checks[item],
      }));

      await api.createInspection({
        companyId: company.id,
        vehicleId: vehicle.id,
        driverId: user.id,
        type: "DAILY",
        odometer: Number(odometer),
        status: hasDefects ? "FAIL" : "PASS",
        checklist,
        defects: hasDefects ? { details: defectDetails, imageCount: defectImages.length } : null,
      });

      toast({
        title: "Safety Check Submitted",
        description: hasDefects 
          ? "Defects logged. Manager notified." 
          : "Vehicle passed. Safe to drive.",
        className: hasDefects ? "border-amber-500 bg-amber-50" : "border-green-500 bg-green-50",
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

  const handleCaptureImage = (index: number) => {
    const newImages = [...defectImages];
    newImages[index] = `captured_${Date.now()}`;
    setDefectImages(newImages);
    toast({
      title: "Photo Captured",
      description: `Defect image ${index + 1} saved`,
    });
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

  return (
    <DriverLayout>
      <div className="pb-24">
        {/* Header */}
        <div className="sticky top-0 bg-slate-50 z-20 py-3 border-b border-slate-200 -mx-4 px-4 mb-4">
          <div className="flex items-center gap-3">
            <TitanButton 
              variant="ghost" 
              size="icon" 
              onClick={() => setLocation(`/driver/vehicle/${vehicle.id}`)} 
              className="h-10 w-10 -ml-2"
              data-testid="button-back"
            >
              <ChevronLeft className="h-6 w-6 text-slate-600" />
            </TitanButton>
            <h1 className="text-lg font-bold text-slate-900">Safety check</h1>
          </div>
        </div>

        <div className="space-y-3">
          {/* Check Sheet Date */}
          <TitanCard className="p-4 bg-blue-50 border-blue-100">
            <p className="text-sm font-medium text-slate-600">Check Sheet Date:</p>
            <p className="font-bold text-blue-900">{checkDate}</p>
          </TitanCard>

          {/* Odometer Reading */}
          <TitanCard className="p-4">
            <label className="text-sm font-medium text-slate-700 block mb-2">Odometer reading:</label>
            <TitanInput
              type="number"
              placeholder="Enter current mileage"
              value={odometer}
              onChange={(e) => setOdometer(e.target.value)}
              className="font-mono text-lg"
              data-testid="input-odometer"
            />
          </TitanCard>

          {/* Driver Vehicle Check Header */}
          <TitanCard className="p-4 bg-slate-100 border-slate-200">
            <p className="font-bold text-slate-700">Driver Vehicle Check - (tick when checked):</p>
          </TitanCard>

          {/* Checklist Items */}
          {CHECKLIST_ITEMS.map((item, index) => (
            <motion.div
              key={item}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.02 }}
            >
              <TitanCard 
                className={`p-4 cursor-pointer transition-all active:scale-[0.98] ${
                  checks[item] 
                    ? 'bg-green-50 border-green-200' 
                    : 'bg-white hover:bg-slate-50'
                }`}
                onClick={() => toggleCheck(item)}
                data-testid={`check-item-${index}`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <p className="font-medium text-slate-800">{item}:</p>
                    <p className={`text-sm ${checks[item] ? 'text-green-600 font-medium' : 'text-slate-400'}`}>
                      {checks[item] ? 'Checked' : 'Tap to check'}
                    </p>
                  </div>
                  <div className={`h-8 w-8 rounded-full border-2 flex items-center justify-center transition-all ${
                    checks[item] 
                      ? 'bg-green-500 border-green-500 text-white' 
                      : 'border-slate-300 bg-white'
                  }`}>
                    {checks[item] && <Check className="h-5 w-5" />}
                  </div>
                </div>
              </TitanCard>
            </motion.div>
          ))}

          {/* Defect Report Section */}
          <TitanCard className="p-4 bg-amber-50 border-amber-100">
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className="h-5 w-5 text-amber-600" />
              <p className="font-bold text-amber-900">Defect report - detail any faults:</p>
            </div>
          </TitanCard>

          {/* Defect Details */}
          <TitanCard className="p-4">
            <label className="text-sm font-medium text-slate-700 block mb-2">Defect details:</label>
            <Textarea
              placeholder="None recorded"
              value={defectDetails}
              onChange={(e) => setDefectDetails(e.target.value)}
              className="min-h-[80px] bg-white"
              data-testid="textarea-defect-details"
            />
          </TitanCard>

          {/* Defect Images */}
          <TitanCard className="p-4">
            <label className="text-sm font-medium text-slate-700 block mb-3">Defect image 1:</label>
            {defectImages[0] ? (
              <div className="bg-green-50 border border-green-200 rounded-lg p-3 text-green-700 text-sm">
                Photo captured
              </div>
            ) : (
              <button
                onClick={() => handleCaptureImage(0)}
                className="w-full p-4 border-2 border-dashed border-slate-200 rounded-lg text-slate-400 hover:border-primary hover:text-primary transition-colors flex items-center justify-center gap-2"
                data-testid="button-capture-image-1"
              >
                <Camera className="h-5 w-5" />
                <span>No photo - Tap to capture</span>
              </button>
            )}
          </TitanCard>

          <TitanCard className="p-4">
            <label className="text-sm font-medium text-slate-700 block mb-3">Defect image 2:</label>
            {defectImages[1] ? (
              <div className="bg-green-50 border border-green-200 rounded-lg p-3 text-green-700 text-sm">
                Photo captured
              </div>
            ) : (
              <button
                onClick={() => handleCaptureImage(1)}
                className="w-full p-4 border-2 border-dashed border-slate-200 rounded-lg text-slate-400 hover:border-primary hover:text-primary transition-colors flex items-center justify-center gap-2"
                data-testid="button-capture-image-2"
              >
                <Camera className="h-5 w-5" />
                <span>No photo - Tap to capture</span>
              </button>
            )}
          </TitanCard>
        </div>

        {/* Submit Button */}
        <div className="fixed bottom-0 left-0 right-0 p-4 bg-white/90 backdrop-blur border-t border-slate-200 z-50">
          <div className="max-w-md mx-auto w-full">
            <TitanButton 
              size="lg" 
              className="w-full shadow-titan-lg" 
              onClick={handleSubmit}
              isLoading={isSubmitting}
              disabled={!canSubmit}
              variant={defectDetails.trim() ? "destructive" : "primary"}
              data-testid="button-submit-inspection"
            >
              {canSubmit 
                ? (defectDetails.trim() ? "Submit with Defects" : "Submit Safety Check")
                : `Complete all items (${Object.values(checks).filter(Boolean).length}/${CHECKLIST_ITEMS.length})`
              }
            </TitanButton>
          </div>
        </div>
      </div>
    </DriverLayout>
  );
}
