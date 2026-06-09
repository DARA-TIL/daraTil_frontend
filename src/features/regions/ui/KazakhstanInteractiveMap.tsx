import React, { useEffect, useMemo, useRef, useState } from "react";
import { Box, Button, Chip, Paper, Stack, Typography } from "@mui/material";
import { alpha, useTheme } from "@mui/material/styles";
import RestartAltRoundedIcon from "@mui/icons-material/RestartAltRounded";
import NearMeRoundedIcon from "@mui/icons-material/NearMeRounded";
import PublicRoundedIcon from "@mui/icons-material/PublicRounded";
import LocationCityRoundedIcon from "@mui/icons-material/LocationCityRounded";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import { useTranslation } from "react-i18next";
import { geoCentroid } from "d3-geo";
import type { GeoPermissibleObjects } from "d3-geo";
import { ComposableMap, Geographies, Geography, ZoomableGroup } from "react-simple-maps";
import type { Region, RegionLanguage } from "../model/types";
import {
  getMapRegionName,
  normalizeRegionLanguage,
  type MapRegionProperties,
} from "../model/helpers";
import {
  getMapFeatureByCode,
  getMapZoomForFeature,
  kazakhstanRegionsGeoJson,
  mapBaseCenter,
  mapBaseScale,
  MAP_HEIGHT,
  MAP_WIDTH,
} from "../model/mapData";

type AnimatedViewport = {
  center: [number, number];
  zoom: number;
};

type TooltipState = {
  label: string;
  kind: string;
  locked: boolean;
  x: number;
  y: number;
} | null;

type Props = {
  items: Region[];
  selectedCode: string | null;
  userLevel: number;
  language: RegionLanguage;
  onSelect: (code: string) => void;
  onReset: () => void;
};

function easeInOutCubic(value: number) {
  return value < 0.5
    ? 4 * value * value * value
    : 1 - Math.pow(-2 * value + 2, 3) / 2;
}

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

function getRegionVisualState(
  region: Region | null,
  userLevel: number,
): "locked" | "inactive" | "available" {
  if (region && region.requiredLevel > userLevel) return "locked";
  if (region && !region.isActive) return "inactive";
  return "available";
}

export const KazakhstanInteractiveMap: React.FC<Props> = ({
  items,
  selectedCode,
  userLevel,
  language,
  onSelect,
  onReset,
}) => {
  const theme = useTheme();
  const { t } = useTranslation("map");
  const previewLanguage = normalizeRegionLanguage(language);

  const [hoveredCode, setHoveredCode] = useState<string | null>(null);
  const [tooltip, setTooltip] = useState<TooltipState>(null);
  const [viewport, setViewport] = useState<AnimatedViewport>({
    center: mapBaseCenter,
    zoom: 1,
  });
  const [isZoomAnimating, setIsZoomAnimating] = useState(false);

  const animationFrameRef = useRef<number | null>(null);
  const viewportRef = useRef<AnimatedViewport>(viewport);

  const regionsByCode = useMemo(
    () => Object.fromEntries(items.map((region) => [region.code, region])),
    [items],
  );

  const targetViewport = useMemo<AnimatedViewport>(() => {
    if (!selectedCode) {
      return { center: mapBaseCenter, zoom: 1 };
    }

    const feature = getMapFeatureByCode(selectedCode);
    if (!feature) {
      return { center: mapBaseCenter, zoom: 1 };
    }

    return {
      center: geoCentroid(feature as unknown as GeoPermissibleObjects) as [
        number,
        number,
      ],
      zoom: getMapZoomForFeature(feature),
    };
  }, [selectedCode]);

  useEffect(() => {
    if (animationFrameRef.current !== null) {
      cancelAnimationFrame(animationFrameRef.current);
    }

    const startViewport = viewportRef.current;
    const nextViewport = targetViewport;
    const duration = 420;
    const startedAt = performance.now();
    setIsZoomAnimating(true);

    const step = (now: number) => {
      const progress = clamp((now - startedAt) / duration, 0, 1);
      const eased = easeInOutCubic(progress);

      const nextFrameViewport: AnimatedViewport = {
        center: [
          startViewport.center[0] +
            (nextViewport.center[0] - startViewport.center[0]) * eased,
          startViewport.center[1] +
            (nextViewport.center[1] - startViewport.center[1]) * eased,
        ] as [number, number],
        zoom:
          startViewport.zoom + (nextViewport.zoom - startViewport.zoom) * eased,
      };

      viewportRef.current = nextFrameViewport;
      setViewport(nextFrameViewport);

      if (progress < 1) {
        animationFrameRef.current = requestAnimationFrame(step);
      } else {
        animationFrameRef.current = null;
        setIsZoomAnimating(false);
      }
    };

    animationFrameRef.current = requestAnimationFrame(step);

    return () => {
      if (animationFrameRef.current !== null) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      setIsZoomAnimating(false);
    };
  }, [targetViewport]);

  const hoveredOrSelected = hoveredCode || selectedCode;

  return (
    <Box
      sx={{
        position: "relative",
        minHeight: { xs: 520, md: "calc(100vh - 180px)" },
        borderRadius: 5,
        overflow: "hidden",
        background:
          theme.palette.mode === "light"
            ? "radial-gradient(circle at top left, rgba(59,130,246,0.12), transparent 34%), linear-gradient(180deg, #ffffff 0%, #f8fafc 100%)"
            : "radial-gradient(circle at top left, rgba(96,165,250,0.14), transparent 34%), linear-gradient(180deg, rgba(15,23,42,0.96) 0%, rgba(2,6,23,1) 100%)",
        border: "1px solid",
        borderColor: theme.customColors.sidebarBorder,
        boxShadow:
          theme.palette.mode === "light"
            ? "0 18px 40px rgba(15,23,42,0.08)"
            : "0 22px 50px rgba(0,0,0,0.4)",
      }}
    >
      <Box
        sx={{
          position: "absolute",
          inset: 0,
          pointerEvents: "none",
          background:
            theme.palette.mode === "light"
              ? "linear-gradient(135deg, rgba(255,255,255,0.3), transparent 45%)"
              : "linear-gradient(135deg, rgba(148,163,184,0.08), transparent 45%)",
          zIndex: 0,
        }}
      />

      <Stack
        direction={{ xs: "column", sm: "row" }}
        spacing={1}
        sx={{
          position: "absolute",
          top: 18,
          left: 18,
          zIndex: 2,
          pointerEvents: "none",
        }}
      >
        <Paper
          sx={{
            p: 1.5,
            maxWidth: 280,
            pointerEvents: "auto",
            backgroundColor: alpha(
              theme.palette.background.paper,
              theme.palette.mode === "light" ? 0.92 : 0.86,
            ),
            backdropFilter: "blur(10px)",
            border: "1px solid",
            borderColor: theme.customColors.sidebarBorder,
          }}
        >
          <Typography fontWeight={800}>
            {t("page.mapFocusTitle", { defaultValue: "Explore Kazakhstan" })}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {t("page.mapFocusHint", {
              defaultValue: "Hover to preview. Click to zoom and open region details.",
            })}
          </Typography>
        </Paper>

        <Paper
          sx={{
            p: 1,
            pointerEvents: "auto",
            backgroundColor: alpha(
              theme.palette.background.paper,
              theme.palette.mode === "light" ? 0.9 : 0.82,
            ),
            backdropFilter: "blur(10px)",
            border: "1px solid",
            borderColor: theme.customColors.sidebarBorder,
          }}
        >
          <Stack direction="row" spacing={1}>
            <Chip
              icon={<PublicRoundedIcon />}
              label={t("legend.available", { defaultValue: "Available" })}
              size="small"
            />
            <Chip
              icon={<LocationCityRoundedIcon />}
              label={t("legend.selected", { defaultValue: "Selected" })}
              size="small"
              sx={{
                backgroundColor: alpha(theme.palette.primary.main, 0.14),
                color: theme.palette.primary.main,
              }}
            />
            <Chip
              label={t("legend.locked", { defaultValue: "Locked" })}
              size="small"
              sx={{
                backgroundColor: alpha(theme.palette.text.secondary, 0.12),
                color: theme.palette.text.secondary,
              }}
            />
          </Stack>
        </Paper>
      </Stack>

      {selectedCode ? (
        <Button
          variant="contained"
          startIcon={<RestartAltRoundedIcon />}
          onClick={onReset}
          sx={{
            position: "absolute",
            top: 20,
            right: 20,
            zIndex: 3,
            boxShadow: "0 12px 24px rgba(15,23,42,0.25)",
          }}
        >
          {t("page.reset", { defaultValue: "Show all Kazakhstan" })}
        </Button>
      ) : null}

      <Box sx={{ position: "relative", zIndex: 1, width: "100%", height: "100%" }}>
        <ComposableMap
          projection="geoMercator"
          width={MAP_WIDTH}
          height={MAP_HEIGHT}
          projectionConfig={{
            center: mapBaseCenter,
            scale: mapBaseScale,
          }}
          style={{
            width: "100%",
            height: "100%",
          }}
        >
          <ZoomableGroup
            center={viewport.center}
            zoom={viewport.zoom}
            maxZoom={10}
            disablePanning
            filterZoomEvent={() => false}
          >
            <Geographies geography={kazakhstanRegionsGeoJson}>
              {({ geographies }) =>
                geographies.map((geo) => {
                  const properties = geo.properties as MapRegionProperties;
                  const region = regionsByCode[properties.code] ?? null;
                  const visualState = getRegionVisualState(region, userLevel);
                  const canOpen = visualState === "available";
                  const isHovered = hoveredCode === properties.code;
                  const isSelected = selectedCode === properties.code;
                  const shouldDim =
                    Boolean(hoveredOrSelected) && !isHovered && !isSelected;

                  const fill =
                    isSelected
                      ? alpha(theme.palette.primary.main, 0.85)
                      : isHovered
                        ? alpha(theme.palette.primary.light, 0.6)
                        : visualState === "locked"
                          ? alpha(theme.palette.text.secondary, 0.18)
                          : visualState === "inactive"
                            ? alpha(theme.palette.error.main, 0.12)
                            : alpha(theme.palette.primary.main, 0.14);

                  const stroke =
                    isSelected
                      ? theme.palette.primary.dark
                      : isHovered
                        ? theme.palette.primary.main
                        : visualState === "locked"
                          ? alpha(theme.palette.text.secondary, 0.45)
                          : alpha(theme.palette.text.primary, 0.2);

                  return (
                    <Geography
                      key={geo.rsmKey}
                      geography={geo}
                      onClick={() => {
                        if (canOpen) onSelect(properties.code);
                      }}
                      onMouseEnter={(event) => {
                        setHoveredCode(properties.code);
                        setTooltip({
                          label:
                            visualState === "locked"
                              ? t("tooltip.requiredLevel", {
                                  defaultValue: "Required level: {{level}}",
                                  level: region?.requiredLevel ?? 0,
                                })
                              : getMapRegionName(
                                  properties,
                                  region,
                                  previewLanguage,
                                ),
                          kind: properties.kind || "region",
                          locked: visualState === "locked",
                          x: event.clientX,
                          y: event.clientY,
                        });
                      }}
                      onMouseMove={(event) => {
                        setTooltip((current) =>
                          current
                            ? {
                                ...current,
                                x: event.clientX,
                                y: event.clientY,
                              }
                            : current,
                        );
                      }}
                      onMouseLeave={() => {
                        setHoveredCode(null);
                        setTooltip(null);
                      }}
                      style={{
                        default: {
                          fill,
                          stroke,
                          strokeWidth: isSelected ? 2.8 : isHovered ? 2.1 : 1.2,
                          opacity: shouldDim ? 0.55 : 1,
                          outline: "none",
                          cursor: canOpen ? "pointer" : "not-allowed",
                          transition:
                            isZoomAnimating
                              ? "none"
                              : "fill 180ms ease, stroke 180ms ease, opacity 180ms ease, stroke-width 180ms ease",
                        },
                        hover: {
                          fill,
                          stroke,
                          strokeWidth: isSelected ? 2.8 : 2.1,
                          opacity: 1,
                          outline: "none",
                          cursor: canOpen ? "pointer" : "not-allowed",
                        },
                        pressed: {
                          fill: alpha(theme.palette.primary.dark, 0.92),
                          stroke: theme.palette.primary.dark,
                          strokeWidth: 3,
                          outline: "none",
                        },
                      }}
                    />
                  );
                })
              }
            </Geographies>
          </ZoomableGroup>
        </ComposableMap>
      </Box>

      {tooltip ? (
        <Box
          sx={{
            position: "fixed",
            left: tooltip.x + 14,
            top: tooltip.y + 14,
            zIndex: 1500,
            pointerEvents: "none",
            px: 1.2,
            py: 0.85,
            borderRadius: 2,
            backgroundColor:
              theme.palette.mode === "light"
                ? "rgba(15,23,42,0.9)"
                : "rgba(248,250,252,0.95)",
            color: theme.palette.mode === "light" ? "#fff" : "#020617",
            boxShadow: "0 10px 28px rgba(15,23,42,0.24)",
          }}
        >
          <Stack direction="row" spacing={0.75} alignItems="center">
            {tooltip.locked ? (
              <LockOutlinedIcon sx={{ fontSize: 14 }} />
            ) : (
              <NearMeRoundedIcon sx={{ fontSize: 14 }} />
            )}
            <Typography variant="caption" fontWeight={700}>
              {tooltip.label}
            </Typography>
            {!tooltip.locked && (
              <Typography variant="caption" sx={{ opacity: 0.8 }}>
                {tooltip.kind === "city"
                  ? t("panel.kind.city", { defaultValue: "City" })
                  : t("panel.kind.region", { defaultValue: "Region" })}
              </Typography>
            )}
          </Stack>
        </Box>
      ) : null}
    </Box>
  );
};
