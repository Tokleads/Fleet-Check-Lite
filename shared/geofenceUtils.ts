/**
 * Calculate distance between two points using Haversine formula
 * Returns distance in meters
 */
export function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371e3; // Earth's radius in meters
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
}

/**
 * Check if a point is inside a polygon using ray-casting algorithm
 */
export function isPointInPolygon(
  point: { lat: number; lng: number },
  polygon: { lat: number; lng: number }[]
): boolean {
  if (!polygon || polygon.length < 3) return false;
  
  let inside = false;
  const x = point.lng;
  const y = point.lat;
  
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const xi = polygon[i].lng;
    const yi = polygon[i].lat;
    const xj = polygon[j].lng;
    const yj = polygon[j].lat;
    
    const intersect = ((yi > y) !== (yj > y)) &&
      (x < (xj - xi) * (y - yi) / (yj - yi) + xi);
    
    if (intersect) inside = !inside;
  }
  
  return inside;
}

/**
 * Check if a point is inside a circle geofence
 */
export function isPointInCircle(
  point: { lat: number; lng: number },
  center: { lat: number; lng: number },
  radiusMeters: number
): boolean {
  const distance = calculateDistance(point.lat, point.lng, center.lat, center.lng);
  return distance <= radiusMeters;
}

/**
 * Unified function to check if a point is within any type of geofence
 */
export interface Geofence {
  id: number;
  name: string;
  latitude: string;
  longitude: string;
  radiusMeters: number;
  geofenceType?: string;
  polygonCoordinates?: { lat: number; lng: number }[] | null;
  isActive: boolean;
}

export function isPointInGeofence(
  point: { lat: number; lng: number },
  geofence: Geofence
): boolean {
  if (!geofence.isActive) return false;
  
  const type = geofence.geofenceType || 'circle';
  
  if (type === 'polygon' && geofence.polygonCoordinates) {
    return isPointInPolygon(point, geofence.polygonCoordinates);
  }
  
  // Default to circle
  const center = {
    lat: parseFloat(geofence.latitude),
    lng: parseFloat(geofence.longitude)
  };
  return isPointInCircle(point, center, geofence.radiusMeters);
}

/**
 * Find all geofences that contain the given point
 */
export function findMatchingGeofences(
  point: { lat: number; lng: number },
  geofences: Geofence[]
): Geofence[] {
  return geofences.filter(geofence => isPointInGeofence(point, geofence));
}

/**
 * Find the nearest geofence and distance to it
 */
export function findNearestGeofence(
  point: { lat: number; lng: number },
  geofences: Geofence[]
): { geofence: Geofence; distance: number } | null {
  if (!geofences || geofences.length === 0) return null;
  
  let nearest: { geofence: Geofence; distance: number } | null = null;
  
  for (const geofence of geofences) {
    const center = {
      lat: parseFloat(geofence.latitude),
      lng: parseFloat(geofence.longitude)
    };
    const distance = calculateDistance(point.lat, point.lng, center.lat, center.lng);
    
    if (!nearest || distance < nearest.distance) {
      nearest = { geofence, distance };
    }
  }
  
  return nearest;
}
