import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ManagerLayout } from "./ManagerLayout";
import { session } from "@/lib/session";
import { 
  UserPlus, 
  Search,
  MapPin,
  Clock,
  Truck,
  Phone,
  Mail,
  Edit2,
  Trash2,
  MoreVertical
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";

interface Driver {
  id: number;
  name: string;
  email: string;
  role: string;
  active: boolean;
  pin?: string;
  phone?: string;
  licenseNumber?: string;
  currentLocation?: {
    latitude: string;
    longitude: string;
    timestamp: string;
  };
  assignedVehicle?: {
    id: number;
    vrm: string;
    make: string;
    model: string;
  };
  currentShift?: {
    startTime: string;
    endTime?: string;
  };
}

export default function Drivers() {
  const company = session.getCompany();
  const companyId = company?.id;
  const queryClient = useQueryClient();
  
  const [searchQuery, setSearchQuery] = useState("");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [newDriver, setNewDriver] = useState({
    name: "",
    email: "",
    phone: "",
    pin: "",
    licenseNumber: "",
  });

  // Fetch drivers
  const { data: drivers, isLoading } = useQuery<Driver[]>({
    queryKey: ["drivers", companyId],
    queryFn: async () => {
      const res = await fetch(`/api/drivers?companyId=${companyId}`);
      if (!res.ok) throw new Error("Failed to fetch drivers");
      return res.json();
    },
    enabled: !!companyId,
  });

  // Add driver mutation
  const addDriverMutation = useMutation({
    mutationFn: async (driver: typeof newDriver) => {
      const res = await fetch("/api/drivers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...driver,
          companyId,
          role: "DRIVER",
          active: true,
        }),
      });
      if (!res.ok) throw new Error("Failed to add driver");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["drivers", companyId] });
      setIsAddDialogOpen(false);
      setNewDriver({ name: "", email: "", phone: "", pin: "", licenseNumber: "" });
      toast.success("Driver added successfully!");
    },
    onError: () => {
      toast.error("Failed to add driver");
    },
  });

  // Delete driver mutation
  const deleteDriverMutation = useMutation({
    mutationFn: async (driverId: number) => {
      const res = await fetch(`/api/drivers/${driverId}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to delete driver");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["drivers", companyId] });
      toast.success("Driver deleted successfully!");
    },
    onError: () => {
      toast.error("Failed to delete driver");
    },
  });

  // Determine driver status
  const getDriverStatus = (driver: Driver) => {
    if (!driver.currentShift) {
      return { status: "off", label: "Off Shift", color: "bg-slate-400" };
    }

    const now = new Date();
    const shiftStart = new Date(driver.currentShift.startTime);
    const timeUntilShift = (shiftStart.getTime() - now.getTime()) / (1000 * 60); // minutes

    if (timeUntilShift > 0 && timeUntilShift <= 60) {
      return { status: "starting", label: "Starting Soon", color: "bg-amber-500" };
    }

    if (driver.currentShift.endTime) {
      return { status: "off", label: "Off Shift", color: "bg-slate-400" };
    }

    return { status: "active", label: "On Shift", color: "bg-emerald-500" };
  };

  // Filter drivers by search query
  const filteredDrivers = drivers?.filter((driver) =>
    driver.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    driver.email.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

  // Group drivers by status
  const activeDrivers = filteredDrivers.filter(d => getDriverStatus(d).status === "active");
  const startingSoonDrivers = filteredDrivers.filter(d => getDriverStatus(d).status === "starting");
  const offShiftDrivers = filteredDrivers.filter(d => getDriverStatus(d).status === "off");

  return (
    <ManagerLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Drivers</h1>
            <p className="mt-0.5 text-sm text-slate-500">
              Manage your driver team and monitor their status
            </p>
          </div>
          
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-blue-600 hover:bg-blue-700">
                <UserPlus className="h-4 w-4 mr-2" />
                Add Driver
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>Add New Driver</DialogTitle>
                <DialogDescription>
                  Create a new driver account. They'll be able to log in and start tracking immediately.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name *</Label>
                  <Input
                    id="name"
                    placeholder="John Smith"
                    value={newDriver.name}
                    onChange={(e) => setNewDriver({ ...newDriver, name: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address *</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="john.smith@example.com"
                    value={newDriver.email}
                    onChange={(e) => setNewDriver({ ...newDriver, email: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="+44 7700 900000"
                    value={newDriver.phone}
                    onChange={(e) => setNewDriver({ ...newDriver, phone: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="pin">Driver PIN (4 digits) *</Label>
                  <Input
                    id="pin"
                    type="text"
                    maxLength={4}
                    placeholder="1234"
                    value={newDriver.pin}
                    onChange={(e) => setNewDriver({ ...newDriver, pin: e.target.value.replace(/\D/g, '') })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="license">License Number</Label>
                  <Input
                    id="license"
                    placeholder="SMITH123456AB7CD"
                    value={newDriver.licenseNumber}
                    onChange={(e) => setNewDriver({ ...newDriver, licenseNumber: e.target.value })}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setIsAddDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  onClick={() => addDriverMutation.mutate(newDriver)}
                  disabled={!newDriver.name || !newDriver.email || newDriver.pin.length !== 4 || addDriverMutation.isPending}
                >
                  {addDriverMutation.isPending ? "Adding..." : "Add Driver"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white rounded-xl p-4 border border-slate-200/60 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500">On Shift</p>
                <p className="text-2xl font-bold text-emerald-600 mt-1">{activeDrivers.length}</p>
              </div>
              <div className="h-12 w-12 rounded-xl bg-emerald-50 flex items-center justify-center">
                <div className="h-3 w-3 rounded-full bg-emerald-500 animate-pulse" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-4 border border-slate-200/60 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500">Starting Soon</p>
                <p className="text-2xl font-bold text-amber-600 mt-1">{startingSoonDrivers.length}</p>
              </div>
              <div className="h-12 w-12 rounded-xl bg-amber-50 flex items-center justify-center">
                <Clock className="h-6 w-6 text-amber-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-4 border border-slate-200/60 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500">Off Shift</p>
                <p className="text-2xl font-bold text-slate-600 mt-1">{offShiftDrivers.length}</p>
              </div>
              <div className="h-12 w-12 rounded-xl bg-slate-50 flex items-center justify-center">
                <Clock className="h-6 w-6 text-slate-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            placeholder="Search drivers by name or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Driver Cards */}
        {isLoading ? (
          <div className="text-center py-12 text-slate-400">Loading drivers...</div>
        ) : filteredDrivers.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-xl border border-slate-200/60">
            <UserPlus className="h-12 w-12 mx-auto mb-4 text-slate-300" />
            <p className="text-slate-500 mb-4">No drivers found</p>
            <Button onClick={() => setIsAddDialogOpen(true)}>
              <UserPlus className="h-4 w-4 mr-2" />
              Add Your First Driver
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredDrivers.map((driver) => {
              const status = getDriverStatus(driver);
              return (
                <div
                  key={driver.id}
                  className="bg-white rounded-xl border border-slate-200/60 shadow-sm hover:shadow-md transition-shadow overflow-hidden"
                >
                  {/* Status Bar */}
                  <div className={`h-2 ${status.color}`} />
                  
                  {/* Card Content */}
                  <div className="p-4">
                    {/* Header */}
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <h3 className="font-semibold text-slate-900">{driver.name}</h3>
                        <div className="flex items-center gap-2 mt-1">
                          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium text-white ${status.color}`}>
                            <div className="h-1.5 w-1.5 rounded-full bg-white" />
                            {status.label}
                          </span>
                        </div>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>
                            <Edit2 className="h-4 w-4 mr-2" />
                            Edit Driver
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="text-red-600"
                            onClick={() => {
                              if (confirm(`Are you sure you want to delete ${driver.name}?`)) {
                                deleteDriverMutation.mutate(driver.id);
                              }
                            }}
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete Driver
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>

                    {/* Contact Info */}
                    <div className="space-y-2 mb-3">
                      <div className="flex items-center gap-2 text-sm text-slate-600">
                        <Mail className="h-4 w-4 text-slate-400" />
                        <span className="truncate">{driver.email}</span>
                      </div>
                      {driver.phone && (
                        <div className="flex items-center gap-2 text-sm text-slate-600">
                          <Phone className="h-4 w-4 text-slate-400" />
                          <span>{driver.phone}</span>
                        </div>
                      )}
                    </div>

                    {/* Assigned Vehicle */}
                    {driver.assignedVehicle && (
                      <div className="flex items-center gap-2 p-2 bg-slate-50 rounded-lg mb-3">
                        <Truck className="h-4 w-4 text-slate-600" />
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-medium text-slate-600">Assigned Vehicle</p>
                          <p className="text-sm font-semibold text-slate-900 truncate">
                            {driver.assignedVehicle.vrm} • {driver.assignedVehicle.make}
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Current Location */}
                    {driver.currentLocation && status.status === "active" && (
                      <div className="flex items-center gap-2 text-xs text-slate-500">
                        <MapPin className="h-3 w-3" />
                        <span>
                          Last seen {new Date(driver.currentLocation.timestamp).toLocaleTimeString()}
                        </span>
                      </div>
                    )}

                    {/* Shift Time */}
                    {driver.currentShift && status.status !== "off" && (
                      <div className="flex items-center gap-2 text-xs text-slate-500 mt-2">
                        <Clock className="h-3 w-3" />
                        <span>
                          Shift: {new Date(driver.currentShift.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          {driver.currentShift.endTime && ` - ${new Date(driver.currentShift.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </ManagerLayout>
  );
}
