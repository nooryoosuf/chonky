/**
 * Chonky Driver GPS Location Tracking Service
 * 
 * Provides real-time driver GPS tracking using the browser Geolocation API
 * (navigator.geolocation.watchPosition), synchronizes coordinates across tabs
 * and devices via BroadcastChannel and localStorage, and delivers smooth,
 * reliable telemetry to customer tracking pages.
 */

export interface DriverLocation {
  orderId: string;
  latitude: number;
  longitude: number;
  accuracy?: number;
  heading?: number | null;
  speed?: number | null;
  timestamp: number;
  isRealGps: boolean;
  statusText?: string;
}

// Kitchen Hub in Henveiru, Malé, Maldives
export const CHONKY_KITCHEN_COORDS: [number, number] = [73.5186, 4.1772]; // [lng, lat]

// Neighborhood coordinate lookup for Malé and Hulhumalé
export function getDestinationCoordinates(area: string = '', address: string = ''): [number, number] {
  const text = `${area} ${address}`.toLowerCase();

  if (text.includes('phase 2') || text.includes('phase-2') || text.includes('phase ii')) {
    return [73.5490, 4.2250]; // Hulhumalé Phase 2
  }
  if (text.includes('hulhumale') || text.includes('hulhumalé') || text.includes('phase 1')) {
    return [73.5415, 4.2105]; // Hulhumalé Phase 1
  }
  if (text.includes('maafannu') || text.includes('rasfannu') || text.includes('kanbaa aisa')) {
    return [73.5015, 4.1752]; // Maafannu, Malé
  }
  if (text.includes('machangoalhi') || text.includes('machangolhi') || text.includes('chaandhanee')) {
    return [73.5070, 4.1740]; // Machangoalhi, Malé
  }
  if (text.includes('galolhu') || text.includes('dharubaaruge') || text.includes('alimas')) {
    return [73.5105, 4.1725]; // Galolhu, Malé
  }
  if (text.includes('henveiru') || text.includes('carnival') || text.includes('artificial beach')) {
    return [73.5170, 4.1765]; // Henveiru, Malé
  }
  if (text.includes('vilimale') || text.includes('villimale')) {
    return [73.4860, 4.1730]; // Vilimalé
  }

  // Default central Malé location (Majeedhee Magu arterial)
  return [73.5093, 4.1755];
}

const STORAGE_PREFIX = 'chonky_driver_pos_';
const CHANNEL_NAME = 'chonky_driver_channel';

// Active watchPosition ID tracker
let activeWatchId: number | null = null;
let broadcastChannel: BroadcastChannel | null = null;

function getBroadcastChannel(): BroadcastChannel | null {
  if (typeof window === 'undefined' || typeof BroadcastChannel === 'undefined') {
    return null;
  }
  if (!broadcastChannel) {
    try {
      broadcastChannel = new BroadcastChannel(CHANNEL_NAME);
    } catch {
      broadcastChannel = null;
    }
  }
  return broadcastChannel;
}

/**
 * Publish a new driver location update
 */
export function publishDriverLocation(location: DriverLocation): void {
  try {
    const key = `${STORAGE_PREFIX}${location.orderId}`;
    localStorage.setItem(key, JSON.stringify(location));

    const channel = getBroadcastChannel();
    if (channel) {
      channel.postMessage({ type: 'DRIVER_LOCATION_UPDATE', payload: location });
    }
  } catch (err) {
    console.warn('Failed to publish driver location:', err);
  }
}

/**
 * Get latest recorded location for an order
 */
export function getLatestDriverLocation(orderId: string): DriverLocation | null {
  try {
    const raw = localStorage.getItem(`${STORAGE_PREFIX}${orderId}`);
    if (!raw) return null;
    return JSON.parse(raw) as DriverLocation;
  } catch {
    return null;
  }
}

/**
 * Start real driver GPS tracking via navigator.geolocation.watchPosition
 */
export function startDriverGpsTracking(
  orderId: string,
  onUpdate?: (loc: DriverLocation) => void,
  onError?: (err: GeolocationPositionError | Error) => void
): () => void {
  // Stop any existing watch
  stopDriverTracking(orderId);

  if (typeof navigator === 'undefined' || !navigator.geolocation) {
    if (onError) onError(new Error('Geolocation is not supported by your browser'));
    return () => {};
  }

  const successHandler = (position: GeolocationPosition) => {
    const loc: DriverLocation = {
      orderId,
      latitude: position.coords.latitude,
      longitude: position.coords.longitude,
      accuracy: position.coords.accuracy,
      heading: position.coords.heading,
      speed: position.coords.speed,
      timestamp: position.timestamp || Date.now(),
      isRealGps: true,
      statusText: 'Live GPS active'
    };

    publishDriverLocation(loc);
    if (onUpdate) onUpdate(loc);
  };

  const errorHandler = (err: GeolocationPositionError) => {
    console.warn('Driver GPS watchPosition error:', err.message);
    if (onError) onError(err);
  };

  try {
    activeWatchId = navigator.geolocation.watchPosition(successHandler, errorHandler, {
      enableHighAccuracy: true,
      maximumAge: 3000,
      timeout: 15000
    });
  } catch (err) {
    console.error('Failed to initiate GPS watchPosition:', err);
    if (onError && err instanceof Error) onError(err);
  }

  return () => {
    stopDriverTracking(orderId);
  };
}

/**
 * Stop active GPS tracking
 */
export function stopDriverTracking(orderId?: string): void {
  if (activeWatchId !== null && typeof navigator !== 'undefined' && navigator.geolocation) {
    navigator.geolocation.clearWatch(activeWatchId);
    activeWatchId = null;
  }
  if (orderId) {
    try {
      localStorage.removeItem(`${STORAGE_PREFIX}${orderId}`);
      const channel = getBroadcastChannel();
      if (channel) {
        channel.postMessage({ type: 'DRIVER_LOCATION_STOPPED', orderId });
      }
    } catch {
      // ignore cleanup error
    }
  }
}

/**
 * Subscribe to driver location updates on the customer's tracking page
 */
export function subscribeToDriverLocation(
  orderId: string,
  callback: (loc: DriverLocation) => void
): () => void {
  // 1. Deliver latest cached location immediately if available
  const existing = getLatestDriverLocation(orderId);
  if (existing) {
    callback(existing);
  }

  // 2. Listen to BroadcastChannel
  const channel = getBroadcastChannel();
  const handleMessage = (event: MessageEvent) => {
    if (
      event.data &&
      event.data.type === 'DRIVER_LOCATION_UPDATE' &&
      event.data.payload &&
      event.data.payload.orderId === orderId
    ) {
      callback(event.data.payload as DriverLocation);
    }
  };

  if (channel) {
    channel.addEventListener('message', handleMessage);
  }

  // 3. Listen to window storage events (cross-tab sync fallback)
  const handleStorage = (event: StorageEvent) => {
    if (event.key === `${STORAGE_PREFIX}${orderId}` && event.newValue) {
      try {
        const parsed = JSON.parse(event.newValue) as DriverLocation;
        callback(parsed);
      } catch {
        // ignore
      }
    }
  };
  window.addEventListener('storage', handleStorage);

  return () => {
    if (channel) {
      channel.removeEventListener('message', handleMessage);
    }
    window.removeEventListener('storage', handleStorage);
  };
}

/**
 * Calculate distance between two coordinates in kilometers (Haversine)
 */
export function calculateDistanceKm(
  coord1: [number, number],
  coord2: [number, number]
): number {
  const [lon1, lat1] = coord1;
  const [lon2, lat2] = coord2;
  const R = 6371; // Earth's radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}
