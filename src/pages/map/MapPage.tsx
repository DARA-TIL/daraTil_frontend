import React, { useEffect, useMemo, useState } from "react";
import {
  Autocomplete,
  Box,
  Drawer,
  Paper,
  Stack,
  TextField,
  Typography,
  useMediaQuery,
} from "@mui/material";
import TravelExploreRoundedIcon from "@mui/icons-material/TravelExploreRounded";
import { useTheme } from "@mui/material/styles";
import { useTranslation } from "react-i18next";
import { useAuthStore } from "@/features/auth/store/useAuthStore";
import { normalizeRegionLanguage, type RegionTab } from "@/features/regions/model/helpers";
import type { RegionLanguage } from "@/features/regions/model/types";
import { mapFeatures, getMapFeatureByCode } from "@/features/regions/model/mapData";
import { useRegionsStore } from "@/features/regions/store/useRegionsStore";
import { KazakhstanInteractiveMap } from "@/features/regions/ui/KazakhstanInteractiveMap";
import { RegionDetailsPanel } from "@/features/regions/ui/RegionDetailsPanel";

type SearchOption = {
  code: string;
  name: string;
  kind: string;
};

const MapPage: React.FC = () => {
  const theme = useTheme();
  const isDesktop = useMediaQuery(theme.breakpoints.up("lg"));
  const { t, i18n } = useTranslation("map");

  const userLevel = useAuthStore((s) => s.user?.progress?.level ?? 0);

  const items = useRegionsStore((s) => s.items);
  const itemsLoading = useRegionsStore((s) => s.itemsLoading);
  const selectedCode = useRegionsStore((s) => s.selectedCode);
  const selectedRegion = useRegionsStore((s) => s.selectedRegion);
  const selectedLoading = useRegionsStore((s) => s.selectedLoading);
  const fetchAll = useRegionsStore((s) => s.fetchAll);
  const selectByCode = useRegionsStore((s) => s.selectByCode);
  const clearSelected = useRegionsStore((s) => s.clearSelected);
  const getRegionByCode = useRegionsStore((s) => s.getRegionByCode);

  const [drawerLanguage, setDrawerLanguage] = useState<RegionLanguage>(
    normalizeRegionLanguage(i18n.resolvedLanguage ?? "en"),
  );
  const [activeTab, setActiveTab] = useState<RegionTab>("overview");

  useEffect(() => {
    void fetchAll();
  }, [fetchAll]);

  useEffect(() => {
    if (!selectedCode) return;
    setDrawerLanguage(normalizeRegionLanguage(i18n.resolvedLanguage ?? "en"));
    setActiveTab("overview");
  }, [selectedCode]);

  const searchOptions = useMemo<SearchOption[]>(
    () =>
      mapFeatures.map((feature) => {
        const region = getRegionByCode(feature.properties.code);
        const translation = region?.translations?.find(
          (item) =>
            item.language === normalizeRegionLanguage(i18n.resolvedLanguage ?? "en"),
        );

        return {
          code: feature.properties.code,
          name:
            translation?.name ||
            feature.properties.name ||
            feature.properties.backendName ||
            feature.properties.code,
          kind: feature.properties.kind || "region",
        };
      }),
    [getRegionByCode, i18n.resolvedLanguage],
  );

  const selectedFeature = selectedCode ? getMapFeatureByCode(selectedCode) : null;
  const selectedFallbackName =
    selectedFeature?.properties.name || selectedFeature?.properties.backendName || "";
  const selectedFallbackKind = selectedFeature?.properties.kind || "region";

  const drawerContent = (
    <RegionDetailsPanel
      region={selectedRegion}
      loading={selectedLoading}
      desktop={isDesktop}
      fallbackName={selectedFallbackName}
      fallbackKind={selectedFallbackKind}
      language={drawerLanguage}
      tab={activeTab}
      onClose={clearSelected}
      onLanguageChange={setDrawerLanguage}
      onTabChange={setActiveTab}
    />
  );

  return (
    <Box
      sx={{
        px: { xs: 1.5, md: 2.5 },
        pb: 3,
      }}
    >
      <Stack spacing={2.25}>
        <Paper
          sx={{
            p: { xs: 2, md: 2.4 },
            backgroundImage: theme.gradients.cardSoft,
            border: "1px solid",
            borderColor: theme.customColors.sidebarBorder,
          }}
        >
          <Stack
            direction={{ xs: "column", lg: "row" }}
            alignItems={{ xs: "stretch", lg: "center" }}
            justifyContent="space-between"
            spacing={2}
          >
            <Stack spacing={0.75}>
              <Stack direction="row" spacing={1} alignItems="center">
                <TravelExploreRoundedIcon color="primary" />
                <Typography variant="h4" fontWeight={800}>
                  {t("page.title", { defaultValue: "Interactive Kazakhstan Map" })}
                </Typography>
              </Stack>

              <Typography color="text.secondary" sx={{ maxWidth: 760 }}>
                {t("page.subtitle", {
                  defaultValue:
                    "Explore regions and republican cities, zoom into the map, and open localized cultural content on the side.",
                })}
              </Typography>
            </Stack>

            <Autocomplete
              options={searchOptions}
              loading={itemsLoading}
              sx={{ minWidth: { xs: "100%", lg: 320 } }}
              getOptionLabel={(option) => option.name}
              onChange={(_, option) => {
                if (!option) return;
                void selectByCode(option.code);
              }}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label={t("page.searchLabel", {
                    defaultValue: "Search region or city",
                  })}
                />
              )}
              renderOption={(props, option) => (
                <Box component="li" {...props}>
                  <Stack direction="row" spacing={1} alignItems="center">
                    <Typography fontWeight={700}>{option.name}</Typography>
                    <Typography variant="caption" color="text.secondary">
                      {option.kind === "city"
                        ? t("panel.kind.city", { defaultValue: "City" })
                        : t("panel.kind.region", { defaultValue: "Region" })}
                    </Typography>
                  </Stack>
                </Box>
              )}
            />
          </Stack>
        </Paper>

        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: isDesktop ? "minmax(0, 1fr) minmax(360px, 34%)" : "minmax(0, 1fr)",
            gap: 2,
            alignItems: "stretch",
          }}
        >
          <KazakhstanInteractiveMap
            items={items}
            selectedCode={selectedCode}
            userLevel={userLevel}
            language={normalizeRegionLanguage(i18n.resolvedLanguage ?? "en")}
            onSelect={(code) => {
              void selectByCode(code);
            }}
            onReset={clearSelected}
          />

          {isDesktop ? (
            drawerContent
          ) : (
            <Drawer
              anchor="bottom"
              open={Boolean(selectedCode)}
              onClose={clearSelected}
              PaperProps={{
                sx: {
                  height: "78vh",
                  borderTopLeftRadius: 24,
                  borderTopRightRadius: 24,
                  backgroundColor: theme.palette.background.default,
                },
              }}
            >
              <Box sx={{ p: 1.25, height: "100%" }}>{drawerContent}</Box>
            </Drawer>
          )}
        </Box>
      </Stack>
    </Box>
  );
};

export default MapPage;
