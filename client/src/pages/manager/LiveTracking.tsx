import { useQuery } from "@tanstack/react-query";
import { ManagerLayout } from "./ManagerLayout";
import { session } from "@/lib/session";
import { 
  MapPin, 
  AlertTriangle, 
  Clock,
  Navigation,
  Activity,
  TrendingUp,
  Zap
} from "lucide-react";
import { useState, useEffect, useRef } from "react";

interface DriverLocation {
  id: number;
  driverId: number;
  latitude: string;
  longitude: string;
  speed: number;
  heading?: number;
  accuracy?: number;
  isStagnant: boolean;
  timestamp: string;
  driver?: {
    id: number;
    name: string;
    email: string;
  };
}

interface StagnationAlert {
  id: number;
  driverId: number;
  latitude: string;
  longitude: string;
  stagnationStartTime: string;
  stagnationDurationMinutes: number;
  status: string;
  driver?: {
    name: string;
  };
}

export default function LiveTracking() {
  const company = session.getCompany();
  const companyId = company?.id;
  const mapRef = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [markers, setMarkers] = useState<Map<number, google.maps.Marker>>(new Map());

  // Fetch driver locations every 30 seconds
  const { data: locations, isLoading } = useQuery<DriverLocation[]>({
    queryKey: ["driver-locations", companyId],
    queryFn: async () => {
      const res = await fetch(`/api/manager/driver-locations/${companyId}`);
      if (!res.ok) throw new Error("Failed to fetch locations");
      return res.json();
    },
    enabled: !!companyId,
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  // Fetch active stagnation alerts
  const { data: alerts } = useQuery<StagnationAlert[]>({
    queryKey: ["stagnation-alerts", companyId],
    queryFn: async () => {
      const res = await fetch(`/api/stagnation-alerts/${companyId}?status=ACTIVE`);
      if (!res.ok) throw new Error("Failed to fetch alerts");
      return res.json();
    },
    enabled: !!companyId,
    refetchInterval: 30000,
  });

  // Initialize Google Map
  useEffect(() => {
    if (!mapRef.current || map) return;

    const initMap = () => {
      const newMap = new google.maps.Map(mapRef.current!, {
        center: { lat: 51.5074, lng: -0.1278 }, // Default to London
        zoom: 10,
        styles: [
          {
            featureType: "all",
            elementType: "geometry",
            stylers: [{ color: "#1e293b" }]
          },
          {
            featureType: "all",
            elementType: "labels.text.fill",
            stylers: [{ color: "#cbd5e1" }]
          },
          {
            featureType: "all",
            elementType: "labels.text.stroke",
            stylers: [{ color: "#0f172a" }]
          },
          {
            featureType: "water",
            elementType: "geometry",
            stylers: [{ color: "#0f172a" }]
          },
          {
            featureType: "road",
            elementType: "geometry",
            stylers: [{ color: "#334155" }]
          }
        ]
      });
      setMap(newMap);
    };

    // Load Google Maps script if not already loaded
    if (!window.google) {
      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=YOUR_GOOGLE_MAPS_API_KEY`;
      script.async = true;
      script.defer = true;
      script.onload = initMap;
      document.head.appendChild(script);
    } else {
      initMap();
    }
  }, [map]);

  // Update markers when locations change
  useEffect(() => {
    if (!map || !locations || locations.length === 0) return;

    const newMarkers = new Map<number, google.maps.Marker>();

    // First, remove all old markers safely
    markers.forEach((marker) => {
      try {
        marker.setMap(null);
      } catch (error) {
        console.warn('Error removing marker:', error);
      }
    });

    // Then create new markers
    locations.forEach((location) => {
      try {
        const position = {
          lat: parseFloat(location.latitude),
          lng: parseFloat(location.longitude)
        };

        // Determine marker color based on status
        const isStagnant = location.isStagnant;
        const markerColor = isStagnant ? '#ef4444' : '#00a3ff';

        const marker = new google.maps.Marker({
          position,
          map,
          title: location.driver?.name || `Driver ${location.driverId}`,
          icon: {
            path: google.maps.SymbolPath.CIRCLE,
            scale: 10,
            fillColor: markerColor,
            fillOpacity: 1,
            strokeColor: '#ffffff',
            strokeWeight: 2
          }
        });

        // Info window
        const infoWindow = new google.maps.InfoWindow({
          content: `
            <div style="color: #0f172a; padding: 8px;">
              <h3 style="font-weight: bold; margin-bottom: 4px;">${location.driver?.name || 'Unknown Driver'}</h3>
              <p style="margin: 2px 0;">Speed: ${location.speed} km/h</p>
              <p style="margin: 2px 0;">Last Update: ${new Date(location.timestamp).toLocaleTimeString()}</p>
              ${isStagnant ? '<p style="color: #ef4444; font-weight: bold;">⚠️ STAGNANT</p>' : ''}
            </div>
          `
        });

        marker.addListener('click', () => {
          infoWindow.open(map, marker);
        });

        newMarkers.set(location.driverId, marker);
      } catch (error) {
        console.error('Error creating marker for driver', location.driverId, error);
      }
    });

    setMarkers(newMarkers);

    // Auto-center map on first load
    if (locations.length > 0 && markers.size === 0) {
      try {
        const bounds = new google.maps.LatLngBounds();
        locations.forEach(loc => {
          bounds.extend({
            lat: parseFloat(loc.latitude),
            lng: parseFloat(loc.longitude)
          });
        });
        map.fitBounds(bounds);
      } catch (error) {
        console.warn('Error fitting bounds:', error);
      }
    }
  }, [map, locations]);

  const activeDrivers = locations?.filter(l => !l.isStagnant).length || 0;
  const stagnantDrivers = locations?.filter(l => l.isStagnant).length || 0;
  const avgSpeed = locations && locations.length > 0
    ? Math.round(locations.reduce((sum, l) => sum + l.speed, 0) / locations.length)
    : 0;

  return (
    <ManagerLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Live Tracking</h1>
            <p className="mt-0.5 text-sm text-slate-500">
              Real-time driver location monitoring
            </p>
          </div>
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <Activity className="h-4 w-4 animate-pulse text-emerald-500" />
            <span>Live • Updates every 30s</span>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white rounded-xl p-4 border border-slate-200/60 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500">Active Drivers</p>
                <p className="text-2xl font-bold text-slate-900 mt-1">{activeDrivers}</p>
              </div>
              <div className="h-12 w-12 rounded-xl bg-emerald-50 flex items-center justify-center">
                <Navigation className="h-6 w-6 text-emerald-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-4 border border-slate-200/60 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500">Stagnant</p>
                <p className="text-2xl font-bold text-red-600 mt-1">{stagnantDrivers}</p>
              </div>
              <div className="h-12 w-12 rounded-xl bg-red-50 flex items-center justify-center">
                <AlertTriangle className="h-6 w-6 text-red-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-4 border border-slate-200/60 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500">Avg Speed</p>
                <p className="text-2xl font-bold text-slate-900 mt-1">{avgSpeed} km/h</p>
              </div>
              <div className="h-12 w-12 rounded-xl bg-blue-50 flex items-center justify-center">
                <TrendingUp className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-4 border border-slate-200/60 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500">Active Alerts</p>
                <p className="text-2xl font-bold text-amber-600 mt-1">{alerts?.length || 0}</p>
              </div>
              <div className="h-12 w-12 rounded-xl bg-amber-50 flex items-center justify-center">
                <Zap className="h-6 w-6 text-amber-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Map and Alerts */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Map */}
          <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200/60 shadow-sm overflow-hidden">
            <div className="p-4 border-b border-slate-100">
              <h2 className="font-semibold text-slate-900 flex items-center gap-2">
                <MapPin className="h-5 w-5 text-blue-600" />
                Driver Locations
              </h2>
            </div>
            <div 
              ref={mapRef} 
              className="w-full h-[600px]"
              style={{ background: '#1e293b' }}
            >
              {isLoading && (
                <div className="flex items-center justify-center h-full">
                  <div className="text-slate-400">Loading map...</div>
                </div>
              )}
            </div>
          </div>

          {/* Stagnation Alerts */}
          <div className="bg-white rounded-2xl border border-slate-200/60 shadow-sm overflow-hidden">
            <div className="p-4 border-b border-slate-100">
              <h2 className="font-semibold text-slate-900 flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-red-600" />
                Stagnation Alerts
              </h2>
            </div>
            <div className="p-4 space-y-3 max-h-[600px] overflow-y-auto">
              {alerts && alerts.length > 0 ? (
                alerts.map((alert) => (
                  <div 
                    key={alert.id}
                    className="p-3 bg-red-50 border border-red-200 rounded-lg"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <p className="font-medium text-slate-900">
                          {alert.driver?.name || `Driver ${alert.driverId}`}
                        </p>
                        <p className="text-sm text-slate-600 mt-1">
                          <Clock className="h-3 w-3 inline mr-1" />
                          {alert.stagnationDurationMinutes} minutes
                        </p>
                        <p className="text-xs text-slate-500 mt-1">
                          Since {new Date(alert.stagnationStartTime).toLocaleTimeString()}
                        </p>
                      </div>
                      <button 
                        className="text-xs px-3 py-1 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                        onClick={async () => {
                          await fetch(`/api/stagnation-alerts/${alert.id}`, {
                            method: 'PATCH',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ status: 'ACKNOWLEDGED' })
                          });
                          window.location.reload();
                        }}
                      >
                        Acknowledge
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-slate-400">
                  <AlertTriangle className="h-12 w-12 mx-auto mb-2 opacity-30" />
                  <p className="text-sm">No active alerts</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </ManagerLayout>
  );
}
