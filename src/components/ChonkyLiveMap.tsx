import React, { useEffect, useRef, useState, useCallback } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { 
  Navigation, 
  Plus, 
  Minus, 
  Maximize2, 
  Minimize2, 
  AlertCircle,
  Compass
} from 'lucide-react';
import { 
  CHONKY_KITCHEN_COORDS, 
  DriverLocation, 
  subscribeToDriverLocation,
  getDestinationCoordinates
} from '../services/driverLocationService';
import { fetchRoadRoute } from '../services/routingService';

interface ChonkyLiveMapProps {
  orderId: string;
  orderStatus: 'received' | 'preparing' | 'on_the_way' | 'delivered';
  customerArea?: string;
  customerAddress?: string;
  isFullPage?: boolean;
  onToggleFullPage?: () => void;
  onRouteCalculated?: (distanceKm: number, durationMinutes: number) => void;
  className?: string;
  hasCloseButton?: boolean;
}

// Chonky Dark Map Theme Palette
const PALETTE = {
  background: '#101112',
  land: '#17191B',
  mainRoads: '#35383B',
  secondaryRoads: '#25282A',
  primaryAccent: '#700808',
  activeHighlight: '#E53945',
  labelMuted: '#8A9096',
  labelLight: '#F7F3EE',
  secondaryHighlight: '#F2E2C7'
};

export const ChonkyLiveMap: React.FC<ChonkyLiveMapProps> = ({
  orderId,
  orderStatus,
  customerArea = 'Malé',
  customerAddress = '',
  isFullPage = false,
  onToggleFullPage,
  onRouteCalculated,
  className = 'w-full h-full',
  hasCloseButton = false
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<maplibregl.Map | null>(null);
  const driverMarkerRef = useRef<maplibregl.Marker | null>(null);
  const driverElRef = useRef<HTMLDivElement | null>(null);
  const destMarkerRef = useRef<maplibregl.Marker | null>(null);
  const kitchenMarkerRef = useRef<maplibregl.Marker | null>(null);

  // Locations
  const destinationCoords = useRef<[number, number]>(
    getDestinationCoordinates(customerArea, customerAddress)
  );
  const [currentDriverCoords, setCurrentDriverCoords] = useState<[number, number]>(CHONKY_KITCHEN_COORDS);
  const [lastUpdated, setLastUpdated] = useState<number>(Date.now());
  const [timeAgo, setTimeAgo] = useState<string>('Just now');
  const [isGpsActive, setIsGpsActive] = useState<boolean>(false);
  const [isStale, setIsStale] = useState<boolean>(false);
  const [routeInfo, setRouteInfo] = useState<{ distanceKm: number; etaMin: number } | null>(null);
  const [mapLoaded, setMapLoaded] = useState<boolean>(false);

  // Update destination if props change
  useEffect(() => {
    destinationCoords.current = getDestinationCoordinates(customerArea, customerAddress);
  }, [customerArea, customerAddress]);

  // Recalculate time ago every 5 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      const diffSec = Math.floor((Date.now() - lastUpdated) / 1000);
      if (diffSec < 5) {
        setTimeAgo('Just now');
        setIsStale(false);
      } else if (diffSec < 60) {
        setTimeAgo(`${diffSec}s ago`);
        setIsStale(false);
      } else {
        const min = Math.floor(diffSec / 60);
        setTimeAgo(`${min}m ago`);
        setIsStale(true);
      }
    }, 4000);
    return () => clearInterval(interval);
  }, [lastUpdated]);

  // 1. Initialize MapLibre GL Map with Chonky Dark Theme
  useEffect(() => {
    if (!mapContainerRef.current) return;

    // Use Carto Dark Matter style URL (or OpenFreeMap dark style)
    const baseStyleUrl = 'https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json';

    const map = new maplibregl.Map({
      container: mapContainerRef.current,
      style: baseStyleUrl,
      center: destinationCoords.current,
      zoom: 14.5,
      pitch: 28,
      bearing: -10,
      attributionControl: false
    });

    mapInstanceRef.current = map;

    map.on('load', () => {
      setMapLoaded(true);

      // Customize layers with the exact Chonky Dark Map Theme palette
      try {
        if (map.getLayer('background')) {
          map.setPaintProperty('background', 'background-color', PALETTE.background);
        }
        if (map.getLayer('water')) {
          map.setPaintProperty('water', 'fill-color', PALETTE.background);
        }
        if (map.getLayer('landuse')) {
          map.setPaintProperty('landuse', 'fill-color', PALETTE.land);
        }
        // Road networks
        const style = map.getStyle();
        if (style && style.layers) {
          style.layers.forEach((layer: any) => {
            if (layer['source-layer'] === 'roads') {
              if (layer.id.includes('motorway') || layer.id.includes('primary') || layer.id.includes('trunk')) {
                map.setPaintProperty(layer.id, 'line-color', PALETTE.mainRoads);
              } else if (layer.type === 'line') {
                map.setPaintProperty(layer.id, 'line-color', PALETTE.secondaryRoads);
              }
            } else if (layer['source-layer'] === 'buildings' && layer.type === 'fill') {
              map.setPaintProperty(layer.id, 'fill-color', '#1C1F22');
              if (layer.paint && layer.paint['fill-outline-color']) {
                map.setPaintProperty(layer.id, 'fill-outline-color', '#262A2E');
              }
            }
          });
        }
      } catch (err) {
        console.warn('Map styling tweak warning:', err);
      }

      // Add Red Delivery Route GeoJSON source and glowing layers
      if (!map.getSource('chonky-route')) {
        map.addSource('chonky-route', {
          type: 'geojson',
          data: {
            type: 'Feature',
            properties: {},
            geometry: {
              type: 'LineString',
              coordinates: []
            }
          }
        });

        // Route casing / subtle glow
        map.addLayer({
          id: 'chonky-route-casing',
          type: 'line',
          source: 'chonky-route',
          layout: {
            'line-cap': 'round',
            'line-join': 'round'
          },
          paint: {
            'line-color': PALETTE.primaryAccent,
            'line-width': 7,
            'line-opacity': 0.6
          }
        });

        // Primary red delivery route
        map.addLayer({
          id: 'chonky-route-line',
          type: 'line',
          source: 'chonky-route',
          layout: {
            'line-cap': 'round',
            'line-join': 'round'
          },
          paint: {
            'line-color': PALETTE.activeHighlight,
            'line-width': 4.5,
            'line-opacity': 0.95
          }
        });
      }

      // Create Custom Destination Marker (Red Customer Pin)
      const destEl = document.createElement('div');
      destEl.className = 'chonky-dest-marker';
      destEl.innerHTML = `
        <div style="position: relative; display: flex; flex-direction: column; align-items: center; cursor: pointer;">
          <div style="position: absolute; width: 34px; height: 34px; border-radius: 50%; background: ${PALETTE.activeHighlight}; opacity: 0.3; animation: ping 2s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>
          <div style="width: 28px; height: 28px; border-radius: 50%; background: ${PALETTE.activeHighlight}; border: 2.5px solid #FFFFFF; box-shadow: 0 4px 10px rgba(0,0,0,0.6); display: flex; align-items: center; justify-content: center; z-index: 2;">
            <span style="font-size: 13px; line-height: 1;">📍</span>
          </div>
          <div style="margin-top: 4px; padding: 2px 7px; border-radius: 6px; background: rgba(16,17,18,0.92); border: 1px solid rgba(255,255,255,0.15); color: #F7F3EE; font-size: 9.5px; font-weight: 800; white-space: nowrap; box-shadow: 0 2px 6px rgba(0,0,0,0.5); z-index: 3;">
            YOU (${customerArea.split(',')[0].slice(0, 10)})
          </div>
        </div>
      `;
      destMarkerRef.current = new maplibregl.Marker({ element: destEl, anchor: 'center' })
        .setLngLat(destinationCoords.current)
        .addTo(map);

      // Create Custom Kitchen Hub Marker (Chonky Kitchen)
      const kitchenEl = document.createElement('div');
      kitchenEl.className = 'chonky-kitchen-marker';
      kitchenEl.innerHTML = `
        <div style="position: relative; display: flex; flex-direction: column; align-items: center; cursor: pointer;">
          <div style="width: 24px; height: 24px; border-radius: 50%; background: ${PALETTE.primaryAccent}; border: 2px solid ${PALETTE.secondaryHighlight}; box-shadow: 0 4px 8px rgba(0,0,0,0.6); display: flex; align-items: center; justify-content: center; z-index: 2;">
            <span style="font-size: 11px; line-height: 1;">🍔</span>
          </div>
          <div style="margin-top: 3px; padding: 1.5px 6px; border-radius: 5px; background: rgba(16,17,18,0.92); border: 1px solid rgba(229,57,69,0.3); color: ${PALETTE.secondaryHighlight}; font-size: 8.5px; font-weight: 800; white-space: nowrap; box-shadow: 0 2px 5px rgba(0,0,0,0.5); z-index: 3;">
            CHONKY HUB
          </div>
        </div>
      `;
      kitchenMarkerRef.current = new maplibregl.Marker({ element: kitchenEl, anchor: 'center' })
        .setLngLat(CHONKY_KITCHEN_COORDS)
        .addTo(map);

      // Create Custom Driver Scooter Marker
      const driverEl = document.createElement('div');
      driverEl.className = 'chonky-driver-marker';
      driverEl.style.transition = 'transform 0.6s cubic-bezier(0.25, 1, 0.5, 1)';
      driverEl.innerHTML = `
        <div style="position: relative; display: flex; flex-direction: column; align-items: center; cursor: pointer;">
          <!-- Radar Pulse -->
          <div style="position: absolute; width: 44px; height: 44px; border-radius: 50%; background: #3B82F6; opacity: 0.28; animation: ping 1.8s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>
          <!-- Scooter Outer Ring -->
          <div style="width: 32px; height: 32px; border-radius: 50%; background: #1D4ED8; border: 2.5px solid #FFFFFF; box-shadow: 0 4px 12px rgba(0,0,0,0.7); display: flex; align-items: center; justify-content: center; z-index: 2;">
            <span style="font-size: 15px; line-height: 1;">🛵</span>
          </div>
          <!-- Driver Badge -->
          <div style="margin-top: 4px; padding: 2px 8px; border-radius: 6px; background: #0F172A; border: 1px solid #3B82F6; color: #FFFFFF; font-size: 9.5px; font-weight: 900; white-space: nowrap; box-shadow: 0 2px 6px rgba(0,0,0,0.5); z-index: 3; display: flex; align-items: center; gap: 4px;">
            <span style="width: 5px; height: 5px; border-radius: 50%; background: #10B981; display: inline-block;"></span>
            <span>Ali Shafeeq</span>
          </div>
        </div>
      `;
      driverElRef.current = driverEl;
      driverMarkerRef.current = new maplibregl.Marker({ element: driverEl, anchor: 'center' })
        .setLngLat(CHONKY_KITCHEN_COORDS)
        .addTo(map);

      // Initial camera bounds frame to show both driver and destination
      fitMapBounds(CHONKY_KITCHEN_COORDS, destinationCoords.current);
    });

    // ResizeObserver ensures WebGL canvas always stretches to 100% of parent container
    let resizeObserver: ResizeObserver | null = null;
    if (typeof ResizeObserver !== 'undefined' && mapContainerRef.current) {
      resizeObserver = new ResizeObserver(() => {
        mapInstanceRef.current?.resize();
      });
      resizeObserver.observe(mapContainerRef.current);
    }

    return () => {
      if (resizeObserver) {
        resizeObserver.disconnect();
      }
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Helper to frame both driver and destination smoothly
  const fitMapBounds = useCallback((coordA: [number, number], coordB: [number, number]) => {
    const map = mapInstanceRef.current;
    if (!map) return;

    try {
      const bounds = new maplibregl.LngLatBounds();
      bounds.extend(coordA);
      bounds.extend(coordB);

      map.fitBounds(bounds, {
        padding: isFullPage 
          ? { top: 90, bottom: 220, left: 60, right: 60 } 
          : { top: 60, bottom: 90, left: 60, right: 60 },
        maxZoom: 16.5,
        duration: 900
      });
    } catch (e) {
      console.warn('fitBounds error:', e);
    }
  }, [isFullPage]);

  // Handle map resize when toggling full-page
  useEffect(() => {
    if (mapInstanceRef.current) {
      setTimeout(() => {
        mapInstanceRef.current?.resize();
        fitMapBounds(currentDriverCoords, destinationCoords.current);
      }, 250);
    }
  }, [isFullPage, fitMapBounds, currentDriverCoords]);

  // 2. Fetch and Update Real Road Route (OSRM)
  const updateRoute = useCallback(async (driver: [number, number], dest: [number, number]) => {
    const map = mapInstanceRef.current;
    if (!map || !mapLoaded) return;

    const route = await fetchRoadRoute(driver, dest);
    if (!route) return;

    // Update GeoJSON route data
    try {
      const source = map.getSource('chonky-route') as maplibregl.GeoJSONSource;
      if (source) {
        source.setData({
          type: 'Feature',
          properties: {},
          geometry: {
            type: 'LineString',
            coordinates: route.coordinates
          }
        });
      }

      const distKm = parseFloat((route.distanceMeters / 1000).toFixed(1));
      const durationMin = Math.max(1, Math.round(route.durationSeconds / 60));

      setRouteInfo({ distanceKm: distKm, etaMin: durationMin });
      if (onRouteCalculated) {
        onRouteCalculated(distKm, durationMin);
      }
    } catch (err) {
      console.warn('Failed to update map route:', err);
    }
  }, [mapLoaded, onRouteCalculated]);

  // 3. Subscribe to Driver Location updates (Real GPS & Cross-Tab)
  useEffect(() => {
    const unsubscribe = subscribeToDriverLocation(orderId, (newLoc: DriverLocation) => {
      const newCoords: [number, number] = [newLoc.longitude, newLoc.latitude];
      setCurrentDriverCoords(newCoords);
      setLastUpdated(newLoc.timestamp || Date.now());
      setIsGpsActive(newLoc.isRealGps);

      // Smoothly update marker position
      if (driverMarkerRef.current) {
        driverMarkerRef.current.setLngLat(newCoords);
      }

      // Update route
      updateRoute(newCoords, destinationCoords.current);
    });

    return () => {
      unsubscribe();
    };
  }, [orderId, updateRoute]);

  // Initial route calculation once map is loaded
  useEffect(() => {
    if (mapLoaded) {
      updateRoute(currentDriverCoords, destinationCoords.current);
    }
  }, [mapLoaded, currentDriverCoords, updateRoute]);

  // Manual recenter button handler
  const handleRecenter = () => {
    fitMapBounds(currentDriverCoords, destinationCoords.current);
  };

  const handleZoomIn = () => {
    mapInstanceRef.current?.zoomIn({ duration: 300 });
  };

  const handleZoomOut = () => {
    mapInstanceRef.current?.zoomOut({ duration: 300 });
  };

  return (
    <div className={`relative w-full h-full overflow-hidden bg-[#101112] select-none ${className}`}>
      {/* MapLibre WebGL Canvas Container - fills 100% of parent */}
      <div 
        ref={mapContainerRef} 
        className="w-full h-full absolute inset-0"
      />

      {/* Top Floating Overlay: Live GPS Telemetry Pill */}
      <div className="absolute top-3 left-3 sm:left-4 z-10 flex items-center gap-2 px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-full bg-[#101112]/95 backdrop-blur-md border border-white/15 shadow-lg text-xs pointer-events-auto">
        <span className="relative flex h-2.5 w-2.5">
          <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${isStale ? 'bg-amber-400 opacity-75' : 'bg-emerald-400 opacity-75'}`} />
          <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${isStale ? 'bg-amber-500' : 'bg-emerald-500'}`} />
        </span>
        <div className="flex items-center gap-1.5 text-xs font-black tracking-wide text-white">
          <span className="hidden xs:inline">{orderStatus === 'delivered' ? 'ARRIVED & DELIVERED' : isGpsActive ? 'LIVE DRIVER GPS' : 'KITCHEN DISPATCH'}</span>
          <span className="text-[11px] text-gray-400 font-normal">· {timeAgo}</span>
        </div>
      </div>

      {/* Top Floating Map Action Toolbar: Locate, Zoom In, Zoom Out, Fullscreen Toggle */}
      <div 
        className={`absolute top-3 sm:top-3.5 ${
          hasCloseButton ? 'right-16 sm:right-18' : 'right-3 sm:right-4'
        } z-20 flex items-center gap-2 pointer-events-auto`}
      >
        {/* Recenter / Locate Button */}
        <button
          type="button"
          onClick={handleRecenter}
          className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-[#101112]/95 hover:bg-black text-gray-200 hover:text-white backdrop-blur-md border border-white/15 flex items-center justify-center shadow-lg transition active:scale-90"
          title="Locate & Recenter Map"
          aria-label="Locate & Recenter Map"
        >
          <Navigation className="w-5 h-5 text-chonky-peach" />
        </button>

        {/* Zoom In Button */}
        <button
          type="button"
          onClick={handleZoomIn}
          className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-[#101112]/95 hover:bg-black text-gray-200 hover:text-white backdrop-blur-md border border-white/15 flex items-center justify-center shadow-lg transition active:scale-90"
          title="Zoom In"
          aria-label="Zoom In"
        >
          <Plus className="w-5 h-5" />
        </button>

        {/* Zoom Out Button */}
        <button
          type="button"
          onClick={handleZoomOut}
          className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-[#101112]/95 hover:bg-black text-gray-200 hover:text-white backdrop-blur-md border border-white/15 flex items-center justify-center shadow-lg transition active:scale-90"
          title="Zoom Out"
          aria-label="Zoom Out"
        >
          <Minus className="w-5 h-5" />
        </button>

        {/* Full Page / Compact Toggle Button */}
        {onToggleFullPage && (
          <button
            type="button"
            onClick={onToggleFullPage}
            className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-[#101112]/95 hover:bg-black text-gray-200 hover:text-white backdrop-blur-md border border-white/15 flex items-center justify-center shadow-lg transition active:scale-90"
            title={isFullPage ? 'Compact to Sheet' : 'Expand Full Page Map'}
            aria-label={isFullPage ? 'Compact to Sheet' : 'Expand Full Page Map'}
          >
            {isFullPage ? <Minimize2 className="w-5 h-5 text-chonky-peach" /> : <Maximize2 className="w-5 h-5 text-chonky-peach" />}
          </button>
        )}
      </div>

      {/* Floating Bottom Route Badge (Distance & Real Road Duration) */}
      {routeInfo && (
        <div className={`absolute ${isFullPage ? 'bottom-40 sm:bottom-44' : 'bottom-3'} left-3 sm:left-4 z-10 hidden xs:flex sm:flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-[#101112]/95 backdrop-blur-md border border-white/15 text-xs shadow-lg pointer-events-none`}>
          <Compass className="w-4 h-4 text-[#E53945]" />
          <span className="font-extrabold text-white text-xs">
            {routeInfo.distanceKm} km
          </span>
          <span className="text-gray-400 text-xs">·</span>
          <span className="text-emerald-400 font-extrabold text-xs">
            ~{routeInfo.etaMin} mins
          </span>
        </div>
      )}

      {/* Stale Warning Banner if disconnected */}
      {isStale && (
        <div className="absolute top-12 left-4 z-10 flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-950/90 text-amber-300 border border-amber-600/30 text-[10px] font-bold shadow-md">
          <AlertCircle className="w-3 h-3 text-amber-400" />
          <span>GPS connection delayed. Reconnecting to driver...</span>
        </div>
      )}
    </div>
  );
};
