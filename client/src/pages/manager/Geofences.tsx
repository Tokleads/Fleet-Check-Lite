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
import { MapContainer, TileLayer, Circle, Polygon, Marker, useMapEvents, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix Leaflet default marker icon issue
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

interface Geofence {
  id: number;
  companyId: number;
  name: string;
  latitude: string;
  longitude: string;
  radiusMeters: number;
  geofenceType: 'circle' | 'polygon';
  polygonCoordinates?: Array<{ lat: number; lng: number }>;
  isActive: boolean;
  createdAt: string;
}

// Component to handle map clicks
function MapClickHandler({ 
  isAdding,
  geofenceType,
  onMapClick 
}: { 
  isAdding: boolean;
  geofenceType: 'circle' | 'polygon';
  onMapClick: (lat: number, lng: number) => void;
}) {
  useMapEvents({
    click(e) {
      if (isAdding) {
        onMapClick(e.latlng.lat, e.latlng.lng);
      }
    },
  });
  return null;
}

export default function Geofences() {
  const company = session.getCompany();
  const companyId = company?.id;
  const queryClient = useQueryClient();

  const [isAdding, setIsAdding] = useState(false);
  const [showMap, setShowMap] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [tempLocation, setTempLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [geofenceType, setGeofenceType] = useState<'circle' | 'polygon'>('circle');
  const [polygonPoints, setPolygonPoints] = useState<Array<{ lat: number; lng: number }>>([]);
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
      setTempLocation(null);
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

  const handleMapClick = (lat: number, lng: number) => {
    if (geofenceType === 'circle') {
      setFormData(prev => ({
        ...prev,
        latitude: lat.toFixed(6),
        longitude: lng.toFixed(6)
      }));
      setTempLocation({ lat, lng });
    } else {
      // Polygon mode: add point to polygon
      setPolygonPoints(prev => [...prev, { lat, lng }]);
      // Set center as average of all points
      const allPoints = [...polygonPoints, { lat, lng }];
      const centerLat = allPoints.reduce((sum, p) => sum + p.lat, 0) / allPoints.length;
      const centerLng = allPoints.reduce((sum, p) => sum + p.lng, 0) / allPoints.length;
      setFormData(prev => ({
        ...prev,
        latitude: centerLat.toFixed(6),
        longitude: centerLng.toFixed(6)
      }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name) {
      alert("Please enter a depot name");
      return;
    }
    if (geofenceType === 'circle' && (!formData.latitude || !formData.longitude)) {
      alert("Please click on the map to set location");
      return;
    }
    if (geofenceType === 'polygon' && polygonPoints.length < 3) {
      alert("Please click at least 3 points on the map to create a polygon");
      return;
    }
    
    const payload = {
      ...formData,
      companyId,
      geofenceType,
      polygonCoordinates: geofenceType === 'polygon' ? polygonPoints : null
    };
    
    createMutation.mutate(payload as any);
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
    setPolygonPoints([]);
  };
  
  const handleUndoLastPoint = () => {
    setPolygonPoints(prev => prev.slice(0, -1));
  };
  
  const handleClearPolygon = () => {
    setPolygonPoints([]);
  };

  const handleCancelAdding = () => {
    setIsAdding(false);
    setShowMap(false);
    setFormData({ name: "", latitude: "", longitude: "", radiusMeters: 250 });
    setTempLocation(null);
    setPolygonPoints([]);
    setGeofenceType('circle');
  };

  // Preset depot locations
  const presetDepots = [
    { name: "Head Office", latitude: "51.5074", longitude: "-0.1278" },
    { name: "Clay Lane", latitude: "51.5155", longitude: "-0.0922" },
    { name: "Woodlands", latitude: "51.4975", longitude: "-0.1357" }
  ];

  const handleUsePreset = (preset: typeof presetDepots[0]) => {
    setFormData({
      name: preset.name,
      latitude: preset.latitude,
      longitude: preset.longitude,
      radiusMeters: 250
    });
    setIsAdding(true);
    setShowMap(false);
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
            <div className="w-full h-[500px]">
              <MapContainer
                center={[51.5074, -0.1278]} // Default to London
                zoom={12}
                style={{ height: '100%', width: '100%' }}
              >
                <TileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                
                <MapClickHandler isAdding={isAdding} geofenceType={geofenceType} onMapClick={handleMapClick} />
                
                {/* Temporary shapes while adding */}
                {isAdding && geofenceType === 'circle' && tempLocation && (
                  <>
                    <Marker position={[tempLocation.lat, tempLocation.lng]}>
                      <Popup>New Depot Location</Popup>
                    </Marker>
                    <Circle
                      center={[tempLocation.lat, tempLocation.lng]}
                      radius={formData.radiusMeters}
                      pathOptions={{
                        color: '#3b82f6',
                        fillColor: '#3b82f6',
                        fillOpacity: 0.15,
                        weight: 2
                      }}
                    />
                  </>
                )}
                
                {/* Temporary polygon while drawing */}
                {isAdding && geofenceType === 'polygon' && polygonPoints.length > 0 && (
                  <>
                    {polygonPoints.map((point, idx) => (
                      <Marker key={idx} position={[point.lat, point.lng]}>
                        <Popup>Point {idx + 1}</Popup>
                      </Marker>
                    ))}
                    {polygonPoints.length >= 2 && (
                      <Polygon
                        positions={polygonPoints.map(p => [p.lat, p.lng] as [number, number])}
                        pathOptions={{
                          color: '#3b82f6',
                          fillColor: '#3b82f6',
                          fillOpacity: 0.15,
                          weight: 2
                        }}
                      />
                    )}
                  </>
                )}
                
                {/* Existing geofences */}
                {geofences?.map((geofence) => {
                  const lat = parseFloat(geofence.latitude);
                  const lng = parseFloat(geofence.longitude);
                  const color = geofence.isActive ? '#10b981' : '#94a3b8';
                  
                  return (
                    <div key={geofence.id}>
                      <Marker position={[lat, lng]}>
                        <Popup>{geofence.name}</Popup>
                      </Marker>
                      {geofence.geofenceType === 'polygon' && geofence.polygonCoordinates ? (
                        <Polygon
                          positions={geofence.polygonCoordinates.map(p => [p.lat, p.lng] as [number, number])}
                          pathOptions={{
                            color,
                            fillColor: color,
                            fillOpacity: 0.2,
                            weight: 2
                          }}
                        />
                      ) : (
                        <Circle
                          center={[lat, lng]}
                          radius={geofence.radiusMeters}
                          pathOptions={{
                            color,
                            fillColor: color,
                            fillOpacity: 0.2,
                            weight: 2
                          }}
                        />
                      )}
                    </div>
                  );
                })}
              </MapContainer>
            </div>
          </div>
        )}

        {/* Preset Depots */}
        {geofences && geofences.length === 0 && !isAdding && (
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
            <h3 className="font-semibold text-blue-900 mb-3">Quick Setup: Preset Depots</h3>
            <p className="text-sm text-blue-800 mb-4">
              Add the three default depot locations with one click:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {presetDepots.map((depot) => (
                <button
                  key={depot.name}
                  onClick={() => handleUsePreset(depot)}
                  className="flex items-center gap-2 px-4 py-3 bg-white border border-blue-300 rounded-lg hover:bg-blue-100 transition-colors text-left"
                >
                  <MapPin className="h-5 w-5 text-blue-600" />
                  <span className="font-medium text-blue-900">{depot.name}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Add/Edit Form */}
        {isAdding && (
          <div className="bg-white rounded-2xl border border-slate-200/60 shadow-sm p-6">
            <h2 className="text-lg font-semibold text-slate-900 mb-4">Add New Geofence</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Geofence Type Selector */}
              <div className="flex gap-3 p-3 bg-slate-50 rounded-xl">
                <button
                  type="button"
                  onClick={() => { setGeofenceType('circle'); setPolygonPoints([]); }}
                  className={`flex-1 px-4 py-2 rounded-lg font-medium transition-colors ${
                    geofenceType === 'circle'
                      ? 'bg-blue-600 text-white'
                      : 'bg-white text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  Circle Geofence
                </button>
                <button
                  type="button"
                  onClick={() => { setGeofenceType('polygon'); setTempLocation(null); }}
                  className={`flex-1 px-4 py-2 rounded-lg font-medium transition-colors ${
                    geofenceType === 'polygon'
                      ? 'bg-blue-600 text-white'
                      : 'bg-white text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  Polygon Geofence
                </button>
              </div>
              
              {/* Polygon Drawing Instructions */}
              {geofenceType === 'polygon' && (
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl">
                  <p className="text-sm text-blue-900 font-medium mb-2">
                    📍 Polygon Drawing Mode
                  </p>
                  <p className="text-sm text-blue-800 mb-3">
                    Click on the map to add points. You need at least 3 points to create a polygon.
                  </p>
                  <div className="flex gap-2">
                    <span className="text-sm font-medium text-blue-900">
                      Points: {polygonPoints.length}
                    </span>
                    {polygonPoints.length > 0 && (
                      <>
                        <button
                          type="button"
                          onClick={handleUndoLastPoint}
                          className="text-sm text-blue-700 hover:text-blue-900 underline"
                        >
                          Undo Last
                        </button>
                        <button
                          type="button"
                          onClick={handleClearPolygon}
                          className="text-sm text-red-600 hover:text-red-800 underline"
                        >
                          Clear All
                        </button>
                      </>
                    )}
                  </div>
                </div>
              )}
              
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
                {geofenceType === 'circle' && (
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
                )}
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
