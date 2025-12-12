import { useState } from "react";
import { DriverLayout } from "@/components/layout/AppShell";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useLocation, useRoute } from "wouter";
import { MOCK_VEHICLES } from "@/lib/mockData";
import { CheckCircle2, XCircle, Camera, ChevronLeft, ChevronRight, UploadCloud, AlertTriangle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const CHECKLIST_SECTIONS = [
  {
    title: "External",
    items: ["Lights & Indicators", "Mirrors & Glass", "Tyres & Wheels", "Bodywork & Doors"]
  },
  {
    title: "Fluids",
    items: ["Engine Oil", "Coolant", "Screen Wash", "AdBlue Level"]
  },
  {
    title: "In Cab",
    items: ["Wipers", "Horn", "Seatbelts", "Dashboard Warning Lights"]
  }
];

export default function VehicleInspection() {
  const [, params] = useRoute("/driver/inspection/:id");
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const vehicle = MOCK_VEHICLES.find(v => v.id === params?.id);

  const [step, setStep] = useState(0); // 0: Checklist, 1: Defects (if any), 2: Submit
  const [checks, setChecks] = useState<Record<string, boolean>>({}); // true = pass, false = fail
  const [defects, setDefects] = useState<Record<string, string>>({}); // itemId -> notes
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!vehicle) return <div>Vehicle not found</div>;

  const handlePass = (item: string) => {
    setChecks(prev => ({ ...prev, [item]: true }));
    // Remove defect note if it exists
    if (defects[item]) {
      const newDefects = { ...defects };
      delete newDefects[item];
      setDefects(newDefects);
    }
  };

  const handleFail = (item: string) => {
    setChecks(prev => ({ ...prev, [item]: false }));
  };

  const allChecksComplete = CHECKLIST_SECTIONS.flatMap(s => s.items).every(item => checks[item] !== undefined);
  const hasFailures = Object.values(checks).some(val => val === false);

  const handleSubmit = async () => {
    setIsSubmitting(true);
    // Simulate upload delay
    await new Promise(r => setTimeout(r, 2000));
    setIsSubmitting(false);
    toast({
      title: "Inspection Submitted",
      description: hasFailures ? "Defects reported. Transport manager notified." : "Vehicle passed inspection.",
      className: hasFailures ? "border-amber-500 bg-amber-50" : "border-green-500 bg-green-50",
    });
    setLocation("/driver");
  };

  return (
    <DriverLayout>
      <div className="space-y-6 pb-20">
        <div className="flex items-center gap-2 mb-4">
            <Button variant="ghost" size="icon" onClick={() => setLocation("/driver")}>
                <ChevronLeft />
            </Button>
            <div>
                <h2 className="font-heading font-bold text-xl">{vehicle.reg}</h2>
                <p className="text-sm text-slate-500">Daily Walkaround Check</p>
            </div>
        </div>

        {step === 0 && (
          <div className="space-y-8 animate-in slide-in-from-right duration-300">
            {CHECKLIST_SECTIONS.map((section, idx) => (
              <div key={idx} className="space-y-3">
                <h3 className="font-heading font-semibold text-slate-800 uppercase tracking-wider text-sm border-b pb-1 border-slate-200">
                  {section.title}
                </h3>
                <div className="space-y-3">
                  {section.items.map(item => (
                    <div key={item} className="bg-white p-4 rounded-lg shadow-sm border border-slate-100 flex items-center justify-between">
                      <span className="font-medium text-slate-700">{item}</span>
                      <div className="flex gap-2">
                        <Button 
                          size="sm" 
                          variant={checks[item] === false ? "destructive" : "outline"}
                          className={`rounded-full w-10 h-10 p-0 ${checks[item] === false ? 'ring-2 ring-red-200' : ''}`}
                          onClick={() => handleFail(item)}
                        >
                          <XCircle className={checks[item] === false ? "fill-current" : ""} />
                        </Button>
                        <Button 
                          size="sm" 
                          variant={checks[item] === true ? "default" : "outline"}
                          className={`rounded-full w-10 h-10 p-0 ${checks[item] === true ? 'bg-green-600 hover:bg-green-700 ring-2 ring-green-200' : 'text-slate-400'}`}
                          onClick={() => handlePass(item)}
                        >
                          <CheckCircle2 className={checks[item] === true ? "fill-current" : ""} />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {step === 1 && (
           <div className="space-y-6 animate-in slide-in-from-right duration-300">
              <div className="bg-amber-50 border border-amber-200 p-4 rounded-lg flex gap-3 items-start">
                  <AlertTriangle className="text-amber-600 shrink-0 mt-0.5" />
                  <div>
                      <h3 className="font-bold text-amber-800">Defects Reported</h3>
                      <p className="text-sm text-amber-700">Please provide details and photos for the failed items.</p>
                  </div>
              </div>

              {Object.entries(checks).filter(([_, passed]) => !passed).map(([item]) => (
                  <Card key={item} className="border-red-200 shadow-sm">
                      <CardHeader className="bg-red-50/50 pb-3 border-b border-red-100">
                          <CardTitle className="text-base text-red-900 flex items-center gap-2">
                              <XCircle className="h-4 w-4" /> {item}
                          </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4 pt-4">
                          <div className="space-y-2">
                              <Label>Description of Defect</Label>
                              <Textarea 
                                placeholder="Describe the issue..." 
                                value={defects[item] || ""}
                                onChange={(e) => setDefects({...defects, [item]: e.target.value})}
                              />
                          </div>
                          <div className="flex items-center gap-2">
                              <Button variant="outline" className="w-full gap-2 text-slate-600">
                                  <Camera className="h-4 w-4" /> Add Photo
                              </Button>
                          </div>
                      </CardContent>
                  </Card>
              ))}
           </div>
        )}

        {step === 2 && (
            <div className="space-y-6 animate-in slide-in-from-right duration-300">
                <div className="text-center space-y-2 py-8">
                    <div className="h-16 w-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <UploadCloud className="h-8 w-8 text-primary animate-pulse" />
                    </div>
                    <h3 className="font-heading font-bold text-xl">Ready to Submit?</h3>
                    <p className="text-slate-500 px-8">
                        {hasFailures 
                            ? "Your report includes defects. This will notify the transport manager immediately." 
                            : "Vehicle is safe to drive. Good to go!"}
                    </p>
                </div>
            </div>
        )}

        {/* Sticky Footer */}
        <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-slate-200 z-50">
            <div className="max-w-md mx-auto w-full flex gap-3">
                {step > 0 && (
                     <Button variant="outline" className="flex-1" onClick={() => setStep(step - 1)}>
                        Back
                     </Button>
                )}
                {step === 0 && (
                    <Button 
                        className="flex-1" 
                        disabled={!allChecksComplete} 
                        onClick={() => hasFailures ? setStep(1) : setStep(2)}
                    >
                        Next <ChevronRight className="ml-2 h-4 w-4" />
                    </Button>
                )}
                {step === 1 && (
                     <Button 
                        className="flex-1"
                        onClick={() => setStep(2)}
                    >
                        Review <ChevronRight className="ml-2 h-4 w-4" />
                    </Button>
                )}
                {step === 2 && (
                     <Button 
                        className={`flex-1 ${hasFailures ? 'bg-amber-600 hover:bg-amber-700' : 'bg-green-600 hover:bg-green-700'}`}
                        onClick={handleSubmit}
                        disabled={isSubmitting}
                    >
                        {isSubmitting ? "Uploading..." : "Submit Inspection"}
                    </Button>
                )}
            </div>
        </div>
      </div>
    </DriverLayout>
  );
}
