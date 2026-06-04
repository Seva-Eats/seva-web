import type { StyleSpecification } from 'maplibre-gl';

/** OpenFreeMap — free OSM-based vector tiles, no API key. */
export const FREE_MAP_STYLE_URL = 'https://tiles.openfreemap.org/styles/liberty';

/**
 * Raster fallback (OpenStreetMap) if the vector style host is unreachable.
 * No token or signup required.
 */
export const OSM_RASTER_STYLE: StyleSpecification = {
  version: 8,
  sources: {
    osm: {
      type: 'raster',
      tiles: ['https://tile.openstreetmap.org/{z}/{x}/{y}.png'],
      tileSize: 256,
      attribution: '© OpenStreetMap contributors',
    },
  },
  layers: [
    {
      id: 'osm',
      type: 'raster',
      source: 'osm',
    },
  ],
};

export function getMapStyleUrl() {
  return FREE_MAP_STYLE_URL;
}
