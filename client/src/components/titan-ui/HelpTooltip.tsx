import { useState, useRef, useEffect } from "react";
import { Info } from "lucide-react";
import { cn } from "@/lib/utils";

interface HelpTooltipProps {
  term: string;
  className?: string;
}

const DEFINITIONS: Record<string, string> = {
  "VOR": "Vehicle Off Road — a vehicle taken out of service due to a defect or failed inspection.",
  "Compliance Score": "A 0–100 rating of your fleet's health, based on inspections, defects, MOT status, and VOR ratio. Graded A to F.",
  "Geofence": "A virtual boundary around a location (e.g. your depot). Drivers can auto clock in/out when entering or leaving.",
  "Auto-VOR": "Vehicles are automatically marked off-road when an inspection fails, without manual intervention.",
  "Defect Escalation": "Unresolved defects automatically increase in severity every 24 hours until action is taken.",
  "Fuel Anomaly": "A fuel entry that's unusually high compared to the vehicle's rolling average, which could indicate a leak or theft.",
  "MOT": "Ministry of Transport test — an annual roadworthiness check required for vehicles over 3 years old.",
  "Walk-Around Check": "A visual inspection of a vehicle before driving, checking tyres, lights, mirrors, and other safety items.",
  "POD": "Proof of Delivery — a digital record with customer signature, photos, and GPS confirming a delivery was completed.",
  "Stagnation Alert": "A notification triggered when a vehicle hasn't moved for 30+ minutes during operating hours.",
};

export function HelpTooltip({ term, className }: HelpTooltipProps) {
  const [isOpen, setIsOpen] = useState(false);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        tooltipRef.current &&
        !tooltipRef.current.contains(event.target as Node) &&
        triggerRef.current &&
        !triggerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const definition = DEFINITIONS[term];
  if (!definition) return null;

  return (
    <span className={cn("relative inline-flex items-center", className)}>
      <button
        ref={triggerRef}
        onClick={() => setIsOpen(!isOpen)}
        onMouseEnter={() => setIsOpen(true)}
        onMouseLeave={() => setIsOpen(false)}
        className="ml-1 text-slate-400 hover:text-slate-600 transition-colors focus:outline-none"
        aria-label={`What is ${term}?`}
        data-testid={`tooltip-${term.toLowerCase().replace(/\s+/g, "-")}`}
      >
        <Info className="h-3.5 w-3.5" />
      </button>
      {isOpen && (
        <div
          ref={tooltipRef}
          className="absolute z-50 bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 bg-slate-900 text-white text-xs leading-relaxed rounded-lg px-3 py-2.5 shadow-xl pointer-events-none"
        >
          <span className="font-semibold text-emerald-400">{term}:</span>{" "}
          {definition}
          <div className="absolute top-full left-1/2 -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-slate-900" />
        </div>
      )}
    </span>
  );
}
