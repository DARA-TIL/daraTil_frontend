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
import { useUiStore } from "@/shared/store/useUiStore";

type SearchOption = {
  code: string;
  disabled: boolean;
  locked: boolean;
  name: string;
  kind: string;
  requiredLevel: number;
};

const MapPage: React.FC = () => {
  const theme = useTheme();
  const isDesktop = useMediaQuery(theme.breakpoints.up("lg"));
  const { t, i18n } = useTranslation("map");

  const userLevel = useAuthStore((s) => s.user?.progress?.level ?? 0);
  const showSnackbar = useUiStore((s) => s.showSnackbar);

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
  const appLanguage = i18n.resolvedLanguage ?? "en";

  useEffect(() => {
    void fetchAll();
  }, [fetchAll]);

  useEffect(() => {
    if (!selectedCode) return;
    setDrawerLanguage(normalizeRegionLanguage(appLanguage));
    setActiveTab("overview");
  }, [appLanguage, selectedCode]);

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
          disabled: Boolean(
            region && (!region.isActive || region.requiredLevel > userLevel),
          ),
          locked: Boolean(region && region.requiredLevel > userLevel),
          name:
            translation?.name ||
            feature.properties.name ||
            feature.properties.backendName ||
            feature.properties.code,
          kind: feature.properties.kind || "region",
          requiredLevel: region?.requiredLevel ?? 0,
        };
      }),
    [getRegionByCode, i18n.resolvedLanguage, userLevel],
  );

  const openRegion = (code: string) => {
    const region = getRegionByCode(code);

    if (region && region.requiredLevel > userLevel) {
      showSnackbar(
        t("messages.requiredLevel", {
          defaultValue: "Reach level {{level}} to open this region",
          level: region.requiredLevel,
        }),
        "warning",
      );
      return;
    }

    if (region && !region.isActive) {
      showSnackbar(
        t("messages.inactive", {
          defaultValue: "This region is not available yet",
        }),
        "info",
      );
      return;
    }

    void selectByCode(code);
  };

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
              getOptionKey={(option) => option.code}
              getOptionLabel={(option) => option.name}
              getOptionDisabled={(option) => option.disabled}
              onChange={(_, option) => {
                if (!option) return;
                openRegion(option.code);
              }}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label={t("page.searchLabel", {
                    defaultValue: "Search region or city",
                  })}
                />
              )}
              renderOption={(props, option) => {
                const { key, ...optionProps } = props;

                return (
                <Box component="li" key={key} {...optionProps}>
                  <Stack direction="row" spacing={1} alignItems="center">
                    <Typography fontWeight={700}>
                      {option.locked
                        ? t("tooltip.requiredLevel", {
                            defaultValue: "Required level: {{level}}",
                            level: option.requiredLevel,
                          })
                        : option.name}
                    </Typography>
                    {!option.locked && (
                      <Typography variant="caption" color="text.secondary">
                        {option.kind === "city"
                          ? t("panel.kind.city", { defaultValue: "City" })
                          : t("panel.kind.region", { defaultValue: "Region" })}
                      </Typography>
                    )}
                  </Stack>
                </Box>
                );
              }}
            />
          </Stack>
        </Paper>

        <Box
          sx={{
            position: "relative",
          }}
        >
          <KazakhstanInteractiveMap
            items={items}
            selectedCode={selectedCode}
            userLevel={userLevel}
            language={normalizeRegionLanguage(appLanguage)}
            onSelect={openRegion}
            onReset={clearSelected}
          />

          <Drawer
            anchor={isDesktop ? "right" : "bottom"}
            open={Boolean(selectedCode)}
            onClose={clearSelected}
            transitionDuration={{
              enter: isDesktop ? 380 : 320,
              exit: isDesktop ? 280 : 220,
            }}
            ModalProps={{
              keepMounted: true,
            }}
            PaperProps={{
              sx: isDesktop
                ? {
                    width: "min(480px, 34vw)",
                    maxWidth: "100vw",
                    p: 1.25,
                    backgroundColor: theme.palette.background.default,
                    borderLeft: "1px solid",
                    borderColor: theme.customColors.sidebarBorder,
                    boxShadow: "0 20px 48px rgba(15,23,42,0.18)",
                  }
                : {
                    height: "78vh",
                    p: 1.25,
                    borderTopLeftRadius: 24,
                    borderTopRightRadius: 24,
                    backgroundColor: theme.palette.background.default,
                  },
            }}
          >
            <Box sx={{ height: "100%" }}>{drawerContent}</Box>
          </Drawer>
        </Box>
      </Stack>
    </Box>
  );
};

export default MapPage;
