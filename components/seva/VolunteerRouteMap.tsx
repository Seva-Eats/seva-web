'use client';

import dynamic from 'next/dynamic';
import { ExternalLink, MapPin } from 'lucide-react';
import { useMemo, useState } from 'react';

import type { SevaMapMarker } from '@/components/map/SevaMap';
import { TypeClass } from '@/constants/typography';
import { buildMapsDirectionsUrl } from '@/lib/volunteer-route/helpers';
import { cn } from '@/lib/cn';

const SevaMap = dynamic(() => import('@/components/map/SevaMap').then((m) => m.SevaMap), {
  ssr: false,
  loading: () => <MapSkeleton height={300} />,
});

type MapPoint = {
  latitude: number;
  longitude: number;
  label?: string;
  color?: string;
};

type VolunteerRouteMapProps = {
  title: string;
  address: string;
  destination: MapPoint;
  origin?: MapPoint;
  routeLine?: Array<{ latitude: number; longitude: number }>;
  height?: number;
};

function MapSkeleton({ height }: { height: number }) {
  return (
    <div
      className="animate-pulse rounded-2xl bg-gradient-to-br from-[#F3F4F6] via-[#FFF7ED] to-[#F3F4F6]"
      style={{ height }}
    />
  );
}

export function VolunteerRouteMap({
  title,
  address,
  destination,
  origin,
  routeLine,
  height = 300,
}: VolunteerRouteMapProps) {
  const [embedReady, setEmbedReady] = useState(false);
  const mapsUrl = buildMapsDirectionsUrl(address);
  const embedSrc = `https://maps.google.com/maps?q=${encodeURIComponent(address)}&z=15&output=embed`;

  const markers = useMemo((): SevaMapMarker[] => {
    const items: SevaMapMarker[] = [
      {
        id: 'destination',
        latitude: destination.latitude,
        longitude: destination.longitude,
        label: destination.label ?? title,
        color: '#F07B2A',
      },
    ];
    if (origin) {
      items.unshift({
        id: 'origin',
        latitude: origin.latitude,
        longitude: origin.longitude,
        label: origin.label ?? 'Pickup',
        color: '#059669',
      });
    }
    return items;
  }, [destination, origin, title]);

  const line = useMemo(() => {
    if (routeLine && routeLine.length >= 2) return routeLine;
    if (origin) {
      return [
        { latitude: origin.latitude, longitude: origin.longitude },
        { latitude: destination.latitude, longitude: destination.longitude },
      ];
    }
    return undefined;
  }, [routeLine, origin, destination]);

  return (
    <div className="space-y-3">
      <div className="overflow-hidden rounded-2xl border border-[#E8E3DA] bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-[#F3F4F6] px-4 py-2.5">
          <div className="flex min-w-0 items-center gap-2">
            <MapPin size={16} className="shrink-0 text-[#F07B2A]" />
            <p className={cn(TypeClass.label, 'truncate text-[#1A1A1A]')}>{title}</p>
          </div>
          <a
            href={mapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className={cn(
              TypeClass.caption,
              'btn-plain flex shrink-0 items-center gap-1 font-semibold text-[#F07B2A] underline-offset-2 hover:underline'
            )}
          >
            Google Maps
            <ExternalLink size={12} />
          </a>
        </div>

        <div className="relative" style={{ height }}>
          {!embedReady && <MapSkeleton height={height} />}
          <iframe
            title={`Map for ${title}`}
            src={embedSrc}
            className={cn(
              'absolute inset-0 h-full w-full border-0',
              embedReady ? 'opacity-100' : 'opacity-0'
            )}
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            allowFullScreen
            onLoad={() => setEmbedReady(true)}
          />
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-[#E8E3DA] bg-white">
        <p className={cn(TypeClass.caption, 'border-b border-[#F3F4F6] px-4 py-2 text-[#6B7280]')}>
          Route overview · pinch to zoom
        </p>
        <SevaMap
          latitude={destination.latitude}
          longitude={destination.longitude}
          height={220}
          zoom={12}
          showCenterPin={false}
          markers={markers}
          routeLine={line}
          showUserLocation
          className="w-full"
        />
      </div>

      <p className={cn(TypeClass.caption, 'px-1 text-center text-[#6B7280]')}>{address}</p>
    </div>
  );
}
