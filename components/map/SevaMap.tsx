'use client';

import maplibregl from 'maplibre-gl';
import { useEffect, useRef } from 'react';

import { getMapStyleUrl, OSM_RASTER_STYLE } from '@/lib/map/config';

import 'maplibre-gl/dist/maplibre-gl.css';

export type SevaMapMarker = {
  id: string;
  latitude: number;
  longitude: number;
  label?: string;
  color?: string;
};

type SevaMapProps = {
  latitude: number;
  longitude: number;
  zoom?: number;
  height?: number | string;
  className?: string;
  markers?: SevaMapMarker[];
  interactive?: boolean;
  draggablePin?: boolean;
  showCenterPin?: boolean;
  showUserLocation?: boolean;
  routeLine?: Array<{ latitude: number; longitude: number }>;
  onPinMove?: (latitude: number, longitude: number) => void;
};

const DEFAULT_CENTER = { lat: 43.7315, lng: -79.7624 };

export function SevaMap({
  latitude,
  longitude,
  zoom = 13,
  height = 176,
  className,
  markers = [],
  interactive = true,
  draggablePin = false,
  showCenterPin = true,
  showUserLocation = false,
  routeLine,
  onPinMove,
}: SevaMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const markerRef = useRef<maplibregl.Marker | null>(null);
  const extraMarkersRef = useRef<maplibregl.Marker[]>([]);

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const map = new maplibregl.Map({
      container: containerRef.current,
      style: getMapStyleUrl(),
      center: [longitude || DEFAULT_CENTER.lng, latitude || DEFAULT_CENTER.lat],
      zoom,
      interactive,
    });

    map.addControl(new maplibregl.NavigationControl({ showCompass: false }), 'top-right');
    map.addControl(new maplibregl.AttributionControl({ compact: true }));

    let usedRasterFallback = false;
    map.on('error', () => {
      if (usedRasterFallback) return;
      usedRasterFallback = true;
      map.setStyle(OSM_RASTER_STYLE);
    });

    mapRef.current = map;

    return () => {
      extraMarkersRef.current.forEach((m) => m.remove());
      extraMarkersRef.current = [];
      markerRef.current?.remove();
      markerRef.current = null;
      map.remove();
      mapRef.current = null;
    };
    // Map is created once; center/pin updates run in the effect below.
    // eslint-disable-next-line react-hooks/exhaustive-deps -- intentional single mount
  }, [interactive, zoom]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    if (!showCenterPin) {
      markerRef.current?.remove();
      markerRef.current = null;
      if (markers.length > 0) {
        const bounds = new maplibregl.LngLatBounds();
        for (const m of markers) {
          bounds.extend([m.longitude, m.latitude]);
        }
        map.fitBounds(bounds, { padding: 48, maxZoom: 14, duration: 400 });
      }
      return;
    }

    const center: [number, number] = [
      longitude || DEFAULT_CENTER.lng,
      latitude || DEFAULT_CENTER.lat,
    ];

    if (!markerRef.current) {
      const el = document.createElement('div');
      el.className = 'seva-map-pin';
      el.style.width = '28px';
      el.style.height = '28px';
      el.style.borderRadius = '50% 50% 50% 0';
      el.style.transform = 'rotate(-45deg)';
      el.style.background = '#F07B2A';
      el.style.border = '3px solid #fff';
      el.style.boxShadow = '0 2px 8px rgba(0,0,0,0.25)';

      markerRef.current = new maplibregl.Marker({
        element: el,
        draggable: draggablePin,
      })
        .setLngLat(center)
        .addTo(map);

      if (draggablePin && onPinMove) {
        markerRef.current.on('dragend', () => {
          const pos = markerRef.current?.getLngLat();
          if (pos) onPinMove(pos.lat, pos.lng);
        });
      }
    } else {
      markerRef.current.setLngLat(center);
    }

    map.easeTo({ center, duration: 400 });
  }, [latitude, longitude, draggablePin, onPinMove, showCenterPin, markers]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !routeLine || routeLine.length < 2) return;

    const coordinates = routeLine.map((p) => [p.longitude, p.latitude] as [number, number]);
    const sourceId = 'seva-route';

    const applyRoute = () => {
      if (map.getSource(sourceId)) {
        (map.getSource(sourceId) as maplibregl.GeoJSONSource).setData({
          type: 'Feature',
          properties: {},
          geometry: { type: 'LineString', coordinates },
        });
        return;
      }
      map.addSource(sourceId, {
        type: 'geojson',
        data: {
          type: 'Feature',
          properties: {},
          geometry: { type: 'LineString', coordinates },
        },
      });
      map.addLayer({
        id: 'seva-route-line',
        type: 'line',
        source: sourceId,
        paint: {
          'line-color': '#F07B2A',
          'line-width': 4,
          'line-opacity': 0.85,
        },
      });
    };

    if (map.isStyleLoaded()) {
      applyRoute();
    } else {
      map.once('load', applyRoute);
    }
  }, [routeLine]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    extraMarkersRef.current.forEach((m) => m.remove());
    extraMarkersRef.current = [];

    for (const item of markers) {
      const el = document.createElement('div');
      el.style.width = '20px';
      el.style.height = '20px';
      el.style.borderRadius = '50%';
      el.style.background = item.color ?? '#10B981';
      el.style.border = '2px solid #fff';
      el.style.boxShadow = '0 1px 6px rgba(0,0,0,0.2)';
      if (item.label) {
        el.title = item.label;
      }

      const marker = new maplibregl.Marker({ element: el })
        .setLngLat([item.longitude, item.latitude])
        .addTo(map);
      extraMarkersRef.current.push(marker);
    }
  }, [markers]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !showUserLocation || !navigator.geolocation) return;

    const watchId = navigator.geolocation.watchPosition(
      (pos) => {
        const { latitude: lat, longitude: lng } = pos.coords;
        if (!map.getSource('user-location')) {
          map.addSource('user-location', {
            type: 'geojson',
            data: {
              type: 'Feature',
              properties: {},
              geometry: { type: 'Point', coordinates: [lng, lat] },
            },
          });
          map.addLayer({
            id: 'user-location-dot',
            type: 'circle',
            source: 'user-location',
            paint: {
              'circle-radius': 7,
              'circle-color': '#3B82F6',
              'circle-stroke-width': 2,
              'circle-stroke-color': '#fff',
            },
          });
        } else {
          const source = map.getSource('user-location') as maplibregl.GeoJSONSource;
          source.setData({
            type: 'Feature',
            properties: {},
            geometry: { type: 'Point', coordinates: [lng, lat] },
          });
        }
      },
      undefined,
      { enableHighAccuracy: false, maximumAge: 30000, timeout: 10000 }
    );

    return () => navigator.geolocation.clearWatch(watchId);
  }, [showUserLocation]);

  return (
    <div
      ref={containerRef}
      className={className ?? 'w-full overflow-hidden rounded-2xl'}
      style={{ height: typeof height === 'number' ? `${height}px` : height }}
      role="img"
      aria-label="Map"
    />
  );
}
