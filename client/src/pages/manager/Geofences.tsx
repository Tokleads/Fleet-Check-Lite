import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ManagerLayout } from "./ManagerLayout";
import { session } from "@/lib/session";
import { 
  MapPin, 
  Plus,
  Edit2,
  Trash2,
  CheckCircle2,
  XCircle
} from "lucide-react";
import { useState } from "react";

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

  const [isAdding, setIsAdding] = useState(false);
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
      setFormData({ name: "", latitude: "", longitude: "", radiusMeters: 250 });
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.latitude || !formData.longitude) {
      alert("Please fill in all fields");
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
          <button
            onClick={() => setIsAdding(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="h-4 w-4" />
            Add Geofence
          </button>
        </div>

        {/* Preset Depots */}
        {geofences && geofences.length === 0 && (
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
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Depot Name
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g., Head Office"
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Radius (meters)
                  </label>
                  <input
                    type="number"
                    value={formData.radiusMeters}
                    onChange={(e) => setFormData({ ...formData, radiusMeters: Number(e.target.value) })}
                    placeholder="250"
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Latitude
                  </label>
                  <input
                    type="text"
                    value={formData.latitude}
                    onChange={(e) => setFormData({ ...formData, latitude: e.target.value })}
                    placeholder="51.5074"
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Longitude
                  </label>
                  <input
                    type="text"
                    value={formData.longitude}
                    onChange={(e) => setFormData({ ...formData, longitude: e.target.value })}
                    placeholder="-0.1278"
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
              <div className="flex gap-3">
                <button
                  type="submit"
                  disabled={createMutation.isPending}
                  className="flex-1 px-6 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-50"
                >
                  {createMutation.isPending ? "Creating..." : "Create Geofence"}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsAdding(false);
                    setFormData({ name: "", latitude: "", longitude: "", radiusMeters: 250 });
                  }}
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
