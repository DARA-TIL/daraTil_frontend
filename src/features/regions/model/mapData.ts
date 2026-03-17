import { geoCentroid, geoMercator, geoPath } from "d3-geo";
import type { Feature, FeatureCollection, Geometry } from "geojson";
import type { MapRegionProperties } from "./helpers";
import kzRegionsGeoJsonRaw from "@/shared/assets/maps/kz.regions.geojson?raw";

export const MAP_WIDTH = 1000;
export const MAP_HEIGHT = 760;
const MAP_PADDING = 54;

export const kazakhstanRegionsGeoJson = JSON.parse(
  kzRegionsGeoJsonRaw,
) as FeatureCollection<Geometry, MapRegionProperties>;

export const mapFeatures = kazakhstanRegionsGeoJson.features as Array<
  Feature<Geometry, MapRegionProperties>
>;

export const mapBaseCenter = geoCentroid(kazakhstanRegionsGeoJson as any) as [
  number,
  number,
];

function computeScale(
  feature: FeatureCollection<Geometry, MapRegionProperties> | Feature<Geometry, MapRegionProperties>,
  center: [number, number],
  width: number,
  height: number,
  padding: number,
): number {
  const projection = geoMercator()
    .center(center)
    .translate([width / 2, height / 2])
    .scale(1);

  const path = geoPath(projection);
  const [[x0, y0], [x1, y1]] = path.bounds(feature as any);
  const dx = Math.max(x1 - x0, 1);
  const dy = Math.max(y1 - y0, 1);

  return Math.min((width - padding * 2) / dx, (height - padding * 2) / dy);
}

export const mapBaseScale = computeScale(
  kazakhstanRegionsGeoJson,
  mapBaseCenter,
  MAP_WIDTH,
  MAP_HEIGHT,
  MAP_PADDING,
);

export function getMapFeatureByCode(code: string) {
  return mapFeatures.find((feature) => feature.properties.code === code) ?? null;
}

export function getMapZoomForFeature(
  feature: Feature<Geometry, MapRegionProperties>,
): number {
  const projection = geoMercator()
    .center(mapBaseCenter)
    .translate([MAP_WIDTH / 2, MAP_HEIGHT / 2])
    .scale(mapBaseScale);

  const path = geoPath(projection);
  const [[x0, y0], [x1, y1]] = path.bounds(feature as any);
  const dx = Math.max(x1 - x0, 1);
  const dy = Math.max(y1 - y0, 1);
  const fitZoom = Math.min((MAP_WIDTH - 180) / dx, (MAP_HEIGHT - 150) / dy);
  const maxZoom = feature.properties.kind === "city" ? 10 : 5.8;

  return Math.max(1, Math.min(fitZoom, maxZoom));
}
