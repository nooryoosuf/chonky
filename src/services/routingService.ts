/**
 * Real Road Routing Service for Malé & Hulhumalé, Maldives
 * 
 * Queries OpenStreetMap OSRM routing engine to fetch genuine road turn-by-turn
 * coordinates, road distance, and estimated travel duration.
 * 
 * Never draws straight lines as roads: if the routing service is unavailable,
 * returns null so the map can gracefully display real GPS markers without invented routes.
 */

export interface RouteResult {
  coordinates: [number, number][]; // [lng, lat] pairs along real roads
  distanceMeters: number;
  durationSeconds: number;
}

// In-memory cache to prevent excessive requests
const routeCache = new Map<string, { data: RouteResult; timestamp: number }>();
const CACHE_TTL_MS = 20000; // 20 seconds cache

export async function fetchRoadRoute(
  start: [number, number], // [lng, lat]
  end: [number, number]    // [lng, lat]
): Promise<RouteResult | null> {
  // Round coordinates to ~10 meters precision for cache key
  const cacheKey = `${start[0].toFixed(4)},${start[1].toFixed(4)}_${end[0].toFixed(4)},${end[1].toFixed(4)}`;
  const cached = routeCache.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
    return cached.data;
  }

  try {
    const url = `https://router.project-osrm.org/route/v1/driving/${start[0]},${start[1]};${end[0]},${end[1]}?overview=full&geometries=geojson`;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000);

    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        'Accept': 'application/json'
      }
    });
    clearTimeout(timeoutId);

    if (!response.ok) {
      console.warn('OSRM routing request non-200:', response.status);
      return null;
    }

    const data = await response.json();
    if (data.code !== 'Ok' || !data.routes || !data.routes[0]) {
      return null;
    }

    const primaryRoute = data.routes[0];
    const coords: [number, number][] = primaryRoute.geometry?.coordinates || [];

    if (coords.length === 0) return null;

    const result: RouteResult = {
      coordinates: coords,
      distanceMeters: Math.round(primaryRoute.distance || 0),
      durationSeconds: Math.round(primaryRoute.duration || 0)
    };

    routeCache.set(cacheKey, { data: result, timestamp: Date.now() });
    return result;
  } catch (error) {
    // Network failure, timeout, or offline
    console.warn('Could not fetch real road route from OSRM:', error);
    return null;
  }
}
