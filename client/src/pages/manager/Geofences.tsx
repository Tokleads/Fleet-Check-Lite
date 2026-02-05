import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ManagerLayout } from "./ManagerLayout";
import { session } from "@/lib/session";
import { 
  MapPin, 
  Plus,
  Edit2,
  Trash2,
  CheckCircle2,
  XCircle,
  Map as MapIcon,
  Target
} from "lucide-react";
import { useState, useEffect, useRef } from "react";

interface Geofence {
  id: number;
  companyId: number;
  name: string;
  latitude: string;
  longitude: string;
  radiusMeters: number;
  isActive: boolean;
  createdAt: string;
}

export default function Geofences() {
  const company = session.getCompany();
  const companyId = company?.id;
  const queryClient = useQueryClient();
  const mapRef = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [circles, setCircles] = useState<Map<number, google.maps.Circle>>(new Map());
  const [tempMarker, setTempMarker] = useState<google.maps.Marker | null>(null);
  const [tempCircle, setTempCircle] = useState<google.maps.Circle | null>(null);

  const [isAdding, setIsAdding] = useState(false);
  const [showMap, setShowMap] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    latitude: "",
    longitude: "",
    radiusMeters: 250
  });

  const { data: geofences, isLoading } = useQuery<Geofence[]>({
    queryKey: ["geofences", companyId],
    queryFn: async () => {
      const res = await fetch(`/api/geofences/${companyId}`);
      if (!res.ok) throw new Error("Failed to fetch geofences");
      return res.json();
    },
    enabled: !!companyId,
  });

  const createMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const res = await fetch('/api/geofences', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...data, companyId })
      });
      if (!res.ok) throw new Error("Failed to create geofence");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["geofences"] });
      setIsAdding(false);
      setShowMap(false);
      setFormData({ name: "", latitude: "", longitude: "", radiusMeters: 250 });
      // Clear temp markers
      if (tempMarker) {
        tempMarker.setMap(null);
        setTempMarker(null);
      }
      if (tempCircle) {
        tempCircle.setMap(null);
        setTempCircle(null);
      }
    }
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Partial<Geofence> }) => {
      const res = await fetch(`/api/geofences/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      if (!res.ok) throw new Error("Failed to update geofence");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["geofences"] });
      setEditingId(null);
    }
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      const res = await fetch(`/api/geofences/${id}`, {
        method: 'DELETE'
      });
      if (!res.ok) throw new Error("Failed to delete geofence");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["geofences"] });
    }
  });

  // Initialize Google Map
  useEffect(() => {
    if (!mapRef.current || map) return;

    const initMap = () => {
      const newMap = new google.maps.Map(mapRef.current!, {
        center: { lat: 51.5074, lng: -0.1278 }, // Default to London
        zoom: 12,
        mapTypeControl: true,
        streetViewControl: false,
        fullscreenControl: true,
      });
      setMap(newMap);

      // Add click listener for placing new geofences
      newMap.addListener('click', (e: google.maps.MapMouseEvent) => {
        if (!isAdding) return;
        
        const lat = e.latLng?.lat();
        const lng = e.latLng?.lng();
        
        if (lat && lng) {
          // Update form data
          setFormData(prev => ({
            ...prev,
            latitude: lat.toFixed(6),
            longitude: lng.toFixed(6)
          }));

          // Clear previous temp marker/circle
          if (tempMarker) tempMarker.setMap(null);
          if (tempCircle) tempCircle.setMap(null);

          // Add new temp marker
          const marker = new google.maps.Marker({
            position: { lat, lng },
            map: newMap,
            icon: {
              path: google.maps.SymbolPath.CIRCLE,
              scale: 8,
              fillColor: '#3b82f6',
              fillOpacity: 1,
              strokeColor: '#ffffff',
              strokeWeight: 2,
            },
            title: 'New Depot Location'
          });
          setTempMarker(marker);

          // Add temp circle
          const circle = new google.maps.Circle({
            map: newMap,
            center: { lat, lng },
            radius: formData.radiusMeters,
            fillColor: '#3b82f6',
            fillOpacity: 0.15,
            strokeColor: '#3b82f6',
            strokeOpacity: 0.8,
            strokeWeight: 2,
            editable: false,
          });
          setTempCircle(circle);
        }
      });
    };

    // Load Google Maps script if not already loaded
    if (!window.google) {
      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=${import.meta.env.VITE_GOOGLE_MAPS_API_KEY || ''}`;
      script.async = true;
      script.defer = true;
      script.onload = initMap;
      document.head.appendChild(script);
    } else {
      initMap();
    }
  }, [map, isAdding, formData.radiusMeters]);

  // Update temp circle radius when slider changes
  useEffect(() => {
    if (tempCircle) {
      tempCircle.setRadius(formData.radiusMeters);
    }
  }, [formData.radiusMeters, tempCircle]);

  // Draw existing geofences on map
  useEffect(() => {
    if (!map || !geofences) return;

    // Clear existing circles
    circles.forEach(circle => circle.setMap(null));
    const newCircles = new Map<number, google.maps.Circle>();

    geofences.forEach((geofence) => {
      const lat = parseFloat(geofence.latitude);
      const lng = parseFloat(geofence.longitude);

      const circle = new google.maps.Circle({
        map,
        center: { lat, lng },
        radius: geofence.radiusMeters,
        fillColor: geofence.isActive ? '#10b981' : '#94a3b8',
        fillOpacity: 0.2,
        strokeColor: geofence.isActive ? '#10b981' : '#94a3b8',
        strokeOpacity: 0.8,
        strokeWeight: 2,
        editable: false,
      });

      // Add marker
      new google.maps.Marker({
        position: { lat, lng },
        map,
        icon: {
          path: google.maps.SymbolPath.CIRCLE,
          scale: 8,
          fillColor: geofence.isActive ? '#10b981' : '#94a3b8',
          fillOpacity: 1,
          strokeColor: '#ffffff',
          strokeWeight: 2,
        },
        title: geofence.name
      });

      newCircles.set(geofence.id, circle);
    });

    setCircles(newCircles);
  }, [map, geofences]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.latitude || !formData.longitude) {
      alert("Please fill in all fields and click on the map to set location");
      return;
    }
    createMutation.mutate(formData);
  };

  const handleToggleActive = (geofence: Geofence) => {
    updateMutation.mutate({
      id: geofence.id,
      data: { isActive: !geofence.isActive }
    });
  };

  const handleDelete = (id: number) => {
    if (confirm("Are you sure you want to delete this geofence?")) {
      deleteMutation.mutate(id);
    }
  };

  const handleStartAdding = () => {
    setIsAdding(true);
    setShowMap(true);
  };

  const handleCancelAdding = () => {
    setIsAdding(false);
    setShowMap(false);
    setFormData({ name: "", latitude: "", longitude: "", radiusMeters: 250 });
    if (tempMarker) {
      tempMarker.setMap(null);
      setTempMarker(null);
    }
    if (tempCircle) {
      tempCircle.setMap(null);
      setTempCircle(null);
    }
  };


  return (
    <ManagerLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Geofence Management</h1>
            <p className="mt-0.5 text-sm text-slate-500">
              Configure depot locations for automatic timesheet tracking
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setShowMap(!showMap)}
              className="flex items-center gap-2 px-4 py-2 border border-slate-200 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors"
            >
              <MapIcon className="h-4 w-4" />
              {showMap ? 'Hide Map' : 'Show Map'}
            </button>
            <button
              onClick={handleStartAdding}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="h-4 w-4" />
              Add Geofence
            </button>
          </div>
        </div>

        {/* Interactive Map */}
        {showMap && (
          <div className="bg-white rounded-2xl border border-slate-200/60 shadow-sm overflow-hidden">
            <div className="p-4 border-b border-slate-100 bg-slate-50">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Target className="h-5 w-5 text-blue-600" />
                  <h2 className="font-semibold text-slate-900">Depot Locations Map</h2>
                </div>
                {isAdding && (
                  <p className="text-sm text-blue-600 font-medium">
                    Click on the map to place your depot
                  </p>
                )}
              </div>
            </div>
            <div ref={mapRef} className="w-full h-[500px]" />
          </div>
        )}


        {/* Add/Edit Form */}
        {isAdding && (
          <div className="bg-white rounded-2xl border border-slate-200/60 shadow-sm p-6">
            <h2 className="text-lg font-semibold text-slate-900 mb-4">Add New Geofence</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Depot Name *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g., Head Office"
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Radius: {formData.radiusMeters}m
                  </label>
                  <input
                    type="range"
                    min="50"
                    max="500"
                    step="10"
                    value={formData.radiusMeters}
                    onChange={(e) => setFormData({ ...formData, radiusMeters: Number(e.target.value) })}
                    className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                  />
                  <div className="flex justify-between text-xs text-slate-500 mt-1">
                    <span>50m</span>
                    <span>500m</span>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Latitude {formData.latitude && '✓'}
                  </label>
                  <input
                    type="text"
                    value={formData.latitude}
                    onChange={(e) => setFormData({ ...formData, latitude: e.target.value })}
                    placeholder="Click on map or enter manually"
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Longitude {formData.longitude && '✓'}
                  </label>
                  <input
                    type="text"
                    value={formData.longitude}
                    onChange={(e) => setFormData({ ...formData, longitude: e.target.value })}
                    placeholder="Click on map or enter manually"
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
              <div className="flex gap-3">
                <button
                  type="submit"
                  disabled={createMutation.isPending || !formData.latitude || !formData.longitude}
                  className="flex-1 px-6 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {createMutation.isPending ? "Creating..." : "Create Geofence"}
                </button>
                <button
                  type="button"
                  onClick={handleCancelAdding}
                  className="px-6 py-2.5 border border-slate-200 text-slate-600 rounded-xl hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Geofences List */}
        <div className="bg-white rounded-2xl border border-slate-200/60 shadow-sm overflow-hidden">
          <div className="p-4 border-b border-slate-100">
            <h2 className="font-semibold text-slate-900">Active Geofences</h2>
          </div>
          <div className="divide-y divide-slate-100">
            {isLoading ? (
              <div className="p-8 text-center text-slate-400">
                Loading geofences...
              </div>
            ) : geofences && geofences.length > 0 ? (
              geofences.map((geofence) => (
                <div key={geofence.id} className="p-4 hover:bg-slate-50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4 flex-1">
                      <div className={`h-12 w-12 rounded-xl flex items-center justify-center ${
                        geofence.isActive ? 'bg-emerald-100' : 'bg-slate-100'
                      }`}>
                        <MapPin className={`h-6 w-6 ${
                          geofence.isActive ? 'text-emerald-600' : 'text-slate-400'
                        }`} />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-slate-900">{geofence.name}</h3>
                        <div className="flex items-center gap-4 mt-1 text-sm text-slate-500">
                          <span>Lat: {parseFloat(geofence.latitude).toFixed(4)}</span>
                          <span>Lng: {parseFloat(geofence.longitude).toFixed(4)}</span>
                          <span>Radius: {geofence.radiusMeters}m</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleToggleActive(geofence)}
                        className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                          geofence.isActive
                            ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        }`}
                      >
                        {geofence.isActive ? (
                          <>
                            <CheckCircle2 className="h-4 w-4" />
                            Active
                          </>
                        ) : (
                          <>
                            <XCircle className="h-4 w-4" />
                            Inactive
                          </>
                        )}
                      </button>
                      <button
                        onClick={() => handleDelete(geofence.id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Delete geofence"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-12 text-center">
                <MapPin className="h-12 w-12 mx-auto mb-3 text-slate-300" />
                <p className="text-slate-500 font-medium">No geofences configured</p>
                <p className="text-sm text-slate-400 mt-1">
                  Add depot locations to enable automatic timesheet tracking
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </ManagerLayout>
  );
}
