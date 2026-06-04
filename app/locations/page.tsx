'use client';

import { List, Map, MapPin, Navigation, Utensils } from 'lucide-react';
import { useMemo, useState } from 'react';

import { AppShell } from '@/components/AppShell';
import { SevaMap } from '@/components/map/SevaMap';
import { PageHeader } from '@/components/PageHeader';
import { dropOffLocations, type DropOffLocation } from '@/constants/mock-data';
import { useLocation } from '@/context';
import { useThemeColors } from '@/hooks/use-theme-colors';

export default function LocationsPage() {
  const colors = useThemeColors();
  const { userLocation } = useLocation();
  const [showMap, setShowMap] = useState(true);

  const mapMarkers = useMemo(
    () =>
      dropOffLocations.map((loc) => ({
        id: loc.id,
        latitude: loc.location.latitude,
        longitude: loc.location.longitude,
        label: loc.name,
        color:
          loc.type === 'shelter'
            ? '#3B82F6'
            : loc.type === 'food_bank'
              ? '#10B981'
              : loc.type === 'community_center'
                ? '#8B5CF6'
                : '#F97316',
      })),
    []
  );

  const mapCenter = userLocation ?? dropOffLocations[0]?.location ?? { latitude: 43.7315, longitude: -79.7624 };

  const getTypeLabel = (type: DropOffLocation['type']) => {
    if (type === 'shelter') return 'Shelter';
    if (type === 'food_bank') return 'Food Bank';
    if (type === 'community_center') return 'Community Center';
    return 'Family';
  };

  const getTypeColor = (type: DropOffLocation['type']) => {
    if (type === 'shelter') return '#3B82F6';
    if (type === 'food_bank') return '#10B981';
    if (type === 'community_center') return '#8B5CF6';
    return '#F97316';
  };

  return (
    <AppShell>
      <div className="min-h-screen" style={{ backgroundColor: colors.background }}>
        <PageHeader title="Nearby Locations" />
        <div className="flex items-center gap-2 border-b px-4 py-3" style={{ borderColor: colors.border }}>
          <button
            type="button"
            onClick={() => setShowMap(false)}
            className="flex flex-1 items-center justify-center gap-2 rounded-xl border py-2 text-sm font-semibold"
            style={{
              borderColor: !showMap ? colors.accent : colors.border,
              color: !showMap ? '#FFF8F0' : colors.mutedText,
              backgroundColor: !showMap ? colors.accent : colors.surfaceElevated,
            }}
          >
            <List size={16} />
            List
          </button>
          <button
            type="button"
            onClick={() => setShowMap(true)}
            className="flex flex-1 items-center justify-center gap-2 rounded-xl border py-2 text-sm font-semibold"
            style={{
              borderColor: showMap ? colors.accent : colors.border,
              color: showMap ? '#FFF8F0' : colors.mutedText,
              backgroundColor: showMap ? colors.accent : colors.surfaceElevated,
            }}
          >
            <Map size={16} />
            Map
          </button>
        </div>

        <div className="space-y-4 p-4">
          <div
            className="flex items-start gap-3 rounded-2xl border p-4"
            style={{ backgroundColor: colors.surface, borderColor: colors.border }}
          >
            <Utensils size={18} style={{ color: colors.accent, marginTop: 2 }} />
            <p className="text-sm leading-5" style={{ color: colors.mutedText }}>
              Partner shelters and community drop-offs near you. Choose one and start a meal request.
            </p>
          </div>

          {showMap ? (
            <>
              <div className="overflow-hidden rounded-2xl border" style={{ borderColor: colors.border }}>
                <SevaMap
                  latitude={mapCenter.latitude}
                  longitude={mapCenter.longitude}
                  height={220}
                  zoom={11}
                  markers={mapMarkers}
                  showCenterPin={false}
                  showUserLocation
                />
              </div>
              <div className="space-y-3">
                {dropOffLocations.map((loc) => (
                  <a
                    key={loc.id}
                    href={`https://www.google.com/maps/search/?api=1&query=${loc.location.latitude},${loc.location.longitude}`}
                    target="_blank"
                    rel="noreferrer"
                    className="block rounded-2xl border p-4"
                    style={{ borderColor: colors.border, backgroundColor: colors.surfaceElevated }}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-bold" style={{ color: colors.text }}>
                          {loc.name}
                        </p>
                        <p className="text-sm" style={{ color: colors.mutedText }}>
                          {loc.address}
                        </p>
                      </div>
                      <span
                        className="rounded-full px-2 py-1 text-xs font-semibold"
                        style={{ color: '#fff', backgroundColor: getTypeColor(loc.type) }}
                      >
                        {getTypeLabel(loc.type)}
                      </span>
                    </div>
                    <div className="mt-3 flex items-center justify-between text-sm" style={{ color: colors.mutedText }}>
                      <span className="flex items-center gap-1">
                        <Navigation size={14} />
                        {loc.distance}
                      </span>
                      <span>{loc.boxesNeeded} boxes needed</span>
                    </div>
                  </a>
                ))}
              </div>
            </>
          ) : (
            dropOffLocations.map((loc) => (
              <div
                key={loc.id}
                className="rounded-2xl border p-4"
                style={{ borderColor: colors.border, backgroundColor: colors.surfaceElevated }}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="font-bold" style={{ color: colors.text }}>
                      {loc.name}
                    </p>
                    <p className="text-sm" style={{ color: colors.mutedText }}>
                      {loc.address}
                    </p>
                  </div>
                  <span
                    className="rounded-full px-2 py-1 text-xs font-semibold"
                    style={{ color: getTypeColor(loc.type), backgroundColor: `${getTypeColor(loc.type)}20` }}
                  >
                    {getTypeLabel(loc.type)}
                  </span>
                </div>

                <p className="mt-2 text-sm font-medium" style={{ color: colors.accent }}>
                  {loc.distance} · {loc.boxesNeeded} boxes needed
                </p>
                <p className="mt-1 text-xs" style={{ color: colors.mutedText }}>
                  Program partner: {loc.partnerProgram}
                </p>

                <a
                  href={`https://www.google.com/maps/search/?api=1&query=${loc.location.latitude},${loc.location.longitude}`}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-3 inline-flex items-center gap-1 text-xs font-semibold"
                  style={{ color: colors.text }}
                >
                  <MapPin size={14} /> Open in maps
                </a>
              </div>
            ))
          )}
        </div>
      </div>
    </AppShell>
  );
}
