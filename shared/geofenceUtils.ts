/**
 * Geofence utility functions for point-in-polygon detection
 * and distance calculations
 */

export interface Point {
  lat: number;
  lng: number;
}

/**
 * Calculate distance between two points using Haversine formula
 * @param lat1 Latitude of point 1
 * @param lon1 Longitude of point 1
 * @param lat2 Latitude of point 2
 * @param lon2 Longitude of point 2
 * @returns Distance in meters
 */
export function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371e3; // Earth's radius in meters
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c; // Distance in meters
}

/**
 * Check if a point is inside a polygon using ray-casting algorithm
 * @param point The point to check
 * @param polygon Array of points defining the polygon vertices
 * @returns true if point is inside polygon, false otherwise
 */
export function isPointInPolygon(point: Point, polygon: Point[]): boolean {
  if (polygon.length < 3) {
    return false; // A polygon must have at least 3 vertices
  }

  let inside = false;
  const x = point.lng;
  const y = point.lat;

  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const xi = polygon[i].lng;
    const yi = polygon[i].lat;
    const xj = polygon[j].lng;
    const yj = polygon[j].lat;

    const intersect =
      yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi;

    if (intersect) {
      inside = !inside;
    }
  }

  return inside;
}

/**
 * Check if a point is within a circular geofence
 * @param point The point to check
 * @param center Center of the circle
 * @param radiusMeters Radius in meters
 * @returns true if point is inside circle, false otherwise
 */
export function isPointInCircle(
  point: Point,
  center: Point,
  radiusMeters: number
): boolean {
  const distance = calculateDistance(
    point.lat,
    point.lng,
    center.lat,
    center.lng
  );
  return distance <= radiusMeters;
}

/**
 * Check if a point is within any type of geofence
 * @param point The point to check
 * @param geofence The geofence configuration
 * @returns true if point is inside geofence, false otherwise
 */
export function isPointInGeofence(
  point: Point,
  geofence: {
    geofenceType: 'circle' | 'polygon';
    latitude: string;
    longitude: string;
    radiusMeters: number;
    polygonCoordinates?: Point[];
  }
): boolean {
  if (geofence.geofenceType === 'polygon' && geofence.polygonCoordinates) {
    return isPointInPolygon(point, geofence.polygonCoordinates);
  } else {
    const center = {
      lat: parseFloat(geofence.latitude),
      lng: parseFloat(geofence.longitude),
    };
    return isPointInCircle(point, center, geofence.radiusMeters);
  }
}
