import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Clock, MapPin, CheckCircle, XCircle, Loader2, AlertCircle, Navigation } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { calculateDistance, isPointInGeofence } from '@shared/geofenceUtils';

interface Geofence {
  id: number;
  name: string;
  latitude: string;
  longitude: string;
  radiusMeters: number;
  geofenceType: 'circle' | 'polygon';
  polygonCoordinates?: Array<{ lat: number; lng: number }>;
}

interface ActiveTimesheet {
  id: number;
  depotName: string;
  arrivalTime: string;
  totalMinutes: number | null;
}

interface ClockInOutProps {
  companyId: number;
  driverId: number;
  driverName: string;
}

export default function ClockInOut({ companyId, driverId, driverName }: ClockInOutProps) {
  const [currentLocation, setCurrentLocation] = useState<{ lat: number; lng: number; accuracy: number } | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [nearestDepot, setNearestDepot] = useState<{ depot: Geofence; distance: number } | null>(null);
  const [selectedDepotId, setSelectedDepotId] = useState<number | null>(null);
  const [showManualSelection, setShowManualSelection] = useState(false);
  const queryClient = useQueryClient();

  // Fetch geofences (depots)
  const { data: geofences = [] } = useQuery<Geofence[]>({
    queryKey: ['geofences', companyId],
    queryFn: async () => {
      const response = await fetch(`/api/geofences/${companyId}`);
      if (!response.ok) throw new Error('Failed to fetch depots');
      return response.json();
    }
  });

  // Fetch active timesheet
  const { data: activeTimesheet, isLoading: loadingTimesheet } = useQuery<ActiveTimesheet | null>({
    queryKey: ['active-timesheet', driverId],
    queryFn: async () => {
      const response = await fetch(`/api/timesheets/active/${driverId}`);
      if (response.status === 404) return null;
      if (!response.ok) throw new Error('Failed to fetch active timesheet');
      return response.json();
    },
    refetchInterval: 30000 // Refresh every 30 seconds
  });

  // Get current location
  useEffect(() => {
    if (!navigator.geolocation) {
      setLocationError('Geolocation is not supported by your browser');
      return;
    }

    const watchId = navigator.geolocation.watchPosition(
      (position) => {
        setCurrentLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          accuracy: position.coords.accuracy
        });
        setLocationError(null);
      },
      (error) => {
        setLocationError(error.message);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      }
    );

    return () => navigator.geolocation.clearWatch(watchId);
  }, []);

  // Calculate distance to nearest depot
  useEffect(() => {
    if (!currentLocation || geofences.length === 0) {
      setNearestDepot(null);
      return;
    }

    const distances = geofences.map(depot => ({
      depot,
      distance: calculateDistance(
        currentLocation.lat,
        currentLocation.lng,
        parseFloat(depot.latitude),
        parseFloat(depot.longitude)
      )
    }));

    const nearest = distances.reduce((prev, curr) =>
      curr.distance < prev.distance ? curr : prev
    );

    setNearestDepot(nearest);
  }, [currentLocation, geofences]);

  // Clock in mutation
  const clockInMutation = useMutation({
    mutationFn: async () => {
      if (!currentLocation) throw new Error('Location not available');
      
      // Determine which depot to use
      const depotId = selectedDepotId || nearestDepot?.depot.id;
      if (!depotId) throw new Error('No depot selected');
      
      // Check GPS accuracy
      if (currentLocation.accuracy > 100) {
        throw new Error(`GPS accuracy too low (${Math.round(currentLocation.accuracy)}m). Please wait for better signal.`);
      }

      const response = await fetch('/api/timesheets/clock-in', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          companyId,
          driverId,
          depotId,
          latitude: currentLocation.lat.toString(),
          longitude: currentLocation.lng.toString(),
          accuracy: Math.round(currentLocation.accuracy),
          manualSelection: !!selectedDepotId
        })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to clock in');
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['active-timesheet', driverId] });
      setSelectedDepotId(null);
      setShowManualSelection(false);
    }
  });

  // Clock out mutation
  const clockOutMutation = useMutation({
    mutationFn: async () => {
      if (!currentLocation) throw new Error('Location not available');
      if (!activeTimesheet) throw new Error('No active timesheet');
      
      // Check GPS accuracy
      if (currentLocation.accuracy > 100) {
        throw new Error(`GPS accuracy too low (${Math.round(currentLocation.accuracy)}m). Please wait for better signal.`);
      }

      const response = await fetch('/api/timesheets/clock-out', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          timesheetId: activeTimesheet.id,
          latitude: currentLocation.lat.toString(),
          longitude: currentLocation.lng.toString(),
          accuracy: Math.round(currentLocation.accuracy)
        })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to clock out');
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['active-timesheet', driverId] });
    }
  });

  const isWithinAnyGeofence = (location: { lat: number; lng: number }): boolean => {
    return geofences.some(geofence => 
      isPointInGeofence(location, geofence)
    );
  };

  const formatDuration = (minutes: number | null): string => {
    if (!minutes) return '0h 0m';
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  const formatTime = (timestamp: string): string => {
    return new Date(timestamp).toLocaleTimeString('en-GB', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Check if within geofence (works for both circle and polygon)
  const isWithinGeofence = currentLocation && nearestDepot && isPointInGeofence(
    { lat: currentLocation.lat, lng: currentLocation.lng },
    nearestDepot.depot
  );
  const hasGoodGPS = currentLocation && currentLocation.accuracy <= 100;
  const canClockIn = currentLocation && hasGoodGPS && (isWithinGeofence || selectedDepotId);

  if (loadingTimesheet) {
    return (
      <div className="container max-w-2xl mx-auto p-4">
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  return (
    <div className="container max-w-2xl mx-auto p-4 space-y-6">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold mb-2">Time Clock</h1>
        <p className="text-muted-foreground">Welcome, {driverName}</p>
      </div>

      {/* Current Status */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Clock className="h-8 w-8 text-primary" />
            <div>
              <h2 className="text-xl font-semibold">
                {activeTimesheet ? 'Clocked In' : 'Clocked Out'}
              </h2>
              <p className="text-sm text-muted-foreground">
                {activeTimesheet
                  ? `Since ${formatTime(activeTimesheet.arrivalTime)}`
                  : 'Ready to start shift'}
              </p>
            </div>
          </div>
          {activeTimesheet ? (
            <CheckCircle className="h-12 w-12 text-green-500" />
          ) : (
            <XCircle className="h-12 w-12 text-muted-foreground" />
          )}
        </div>

        {activeTimesheet && (
          <div className="bg-muted rounded-lg p-4 space-y-2">
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Depot:</span>
              <span className="font-medium">{activeTimesheet.depotName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Clock In:</span>
              <span className="font-medium">{formatTime(activeTimesheet.arrivalTime)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Duration:</span>
              <span className="font-medium text-primary">
                {formatDuration(
                  Math.floor((Date.now() - new Date(activeTimesheet.arrivalTime).getTime()) / 60000)
                )}
              </span>
            </div>
          </div>
        )}
      </Card>

      {/* Location Status */}
      <Card className="p-6">
        <div className="flex items-start gap-3 mb-4">
          <MapPin className="h-6 w-6 text-primary mt-1" />
          <div className="flex-1">
            <h3 className="font-semibold mb-1">Your Location</h3>
            {locationError ? (
              <div className="flex items-center gap-2 text-destructive">
                <AlertCircle className="h-4 w-4" />
                <span className="text-sm">{locationError}</span>
              </div>
            ) : currentLocation ? (
              <div>
                <p className="text-sm text-muted-foreground">
                  {currentLocation.lat.toFixed(6)}, {currentLocation.lng.toFixed(6)}
                </p>
                <div className="flex items-center gap-2 mt-1">
                  <Navigation className={`h-3 w-3 ${
                    currentLocation.accuracy <= 20 ? 'text-green-600' :
                    currentLocation.accuracy <= 50 ? 'text-yellow-600' :
                    currentLocation.accuracy <= 100 ? 'text-orange-600' :
                    'text-red-600'
                  }`} />
                  <span className={`text-xs ${
                    currentLocation.accuracy <= 20 ? 'text-green-600' :
                    currentLocation.accuracy <= 50 ? 'text-yellow-600' :
                    currentLocation.accuracy <= 100 ? 'text-orange-600' :
                    'text-red-600'
                  }`}>
                    Accuracy: ±{Math.round(currentLocation.accuracy)}m
                  </span>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span className="text-sm text-muted-foreground">Getting location...</span>
              </div>
            )}
          </div>
        </div>

        {nearestDepot && (
          <div className="bg-muted rounded-lg p-4 space-y-2">
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Nearest Depot:</span>
              <span className="font-medium">{nearestDepot.depot.name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Distance:</span>
              <span className={`font-medium ${isWithinGeofence ? 'text-green-600' : 'text-orange-600'}`}>
                {nearestDepot.distance.toFixed(0)}m
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Status:</span>
              {isWithinGeofence ? (
                <span className="flex items-center gap-1 text-green-600 font-medium">
                  <CheckCircle className="h-4 w-4" />
                  At Depot
                </span>
              ) : (
                <span className="flex items-center gap-1 text-orange-600 font-medium">
                  <AlertCircle className="h-4 w-4" />
                  Outside Range
                </span>
              )}
            </div>
          </div>
        )}
      </Card>

      {/* Manual Depot Selection */}
      {!activeTimesheet && !isWithinGeofence && geofences.length > 0 && (
        <Card className="p-6 border-blue-200 bg-blue-50">
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5" />
              <div className="flex-1">
                <h3 className="font-semibold text-blue-900">Outside Depot Range</h3>
                <p className="text-sm text-blue-800 mt-1">
                  You're not within range of any depot. Please select your depot manually:
                </p>
              </div>
            </div>
            <Select
              value={selectedDepotId?.toString()}
              onValueChange={(value) => setSelectedDepotId(Number(value))}
            >
              <SelectTrigger className="w-full bg-white">
                <SelectValue placeholder="Select your depot" />
              </SelectTrigger>
              <SelectContent>
                {geofences.map((depot) => (
                  <SelectItem key={depot.id} value={depot.id.toString()}>
                    {depot.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {selectedDepotId && (
              <p className="text-xs text-blue-700">
                ✓ Manual selection will be recorded in the timesheet
              </p>
            )}
          </div>
        </Card>
      )}

      {/* GPS Accuracy Warning */}
      {currentLocation && !hasGoodGPS && (
        <Card className="p-4 border-orange-200 bg-orange-50">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-orange-600 mt-0.5" />
            <div>
              <h3 className="font-semibold text-orange-900">Low GPS Accuracy</h3>
              <p className="text-sm text-orange-800 mt-1">
                Current accuracy: ±{Math.round(currentLocation.accuracy)}m. Please wait for better signal (need ≤100m).
              </p>
            </div>
          </div>
        </Card>
      )}

      {/* Clock In/Out Button */}
      <Card className="p-6">
        {activeTimesheet ? (
          <Button
            size="lg"
            className="w-full h-16 text-lg"
            variant="destructive"
            onClick={() => clockOutMutation.mutate()}
            disabled={!currentLocation || clockOutMutation.isPending}
          >
            {clockOutMutation.isPending ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Clocking Out...
              </>
            ) : (
              <>
                <XCircle className="mr-2 h-5 w-5" />
                Clock Out
              </>
            )}
          </Button>
        ) : (
          <Button
            size="lg"
            className="w-full h-16 text-lg"
            onClick={() => clockInMutation.mutate()}
            disabled={!canClockIn || clockInMutation.isPending}
          >
            {clockInMutation.isPending ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Clocking In...
              </>
            ) : (
              <>
                <CheckCircle className="mr-2 h-5 w-5" />
                Clock In
              </>
            )}
          </Button>
        )}

        {!activeTimesheet && !canClockIn && (
          <p className="text-sm text-center text-muted-foreground mt-3">
            {!currentLocation
              ? 'Waiting for location...'
              : !hasGoodGPS
              ? 'Waiting for better GPS signal...'
              : !isWithinGeofence && !selectedDepotId
              ? 'Select your depot above to clock in'
              : 'Ready to clock in'}
          </p>
        )}
      </Card>

      {/* Error Messages */}
      {clockInMutation.error && (
        <Card className="p-4 bg-destructive/10 border-destructive">
          <p className="text-sm text-destructive">
            {clockInMutation.error.message}
          </p>
        </Card>
      )}
      {clockOutMutation.error && (
        <Card className="p-4 bg-destructive/10 border-destructive">
          <p className="text-sm text-destructive">
            {clockOutMutation.error.message}
          </p>
        </Card>
      )}
    </div>
  );
}
