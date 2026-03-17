import React, { useMemo, useState } from "react";
import { useTheme } from "@mui/material/styles";
import {
  Box,
  Chip,
  Paper,
  Skeleton,
  Stack,
  Tab,
  Tabs,
  Typography,
} from "@mui/material";
import type { Region } from "../../model/types";
import {
  getRegionDisplayName,
  normalizeRegionLanguage,
} from "../../model/helpers";
import { RegionMetadataAdminTab } from "./RegionMetadataAdminTab";
import { RegionTranslationsAdminTab } from "./RegionTranslationsAdminTab";
import { RegionDialectsAdminTab } from "./RegionDialectsAdminTab";
import { RegionTraditionsAdminTab } from "./RegionTraditionsAdminTab";
import { useTranslation } from "react-i18next";

type Props = {
  region: Region | null;
  loading: boolean;
};

type EditorTab = "metadata" | "translations" | "dialects" | "traditions";

function RegionEditorSkeleton() {
  return (
    <Stack spacing={2}>
      <Skeleton variant="rounded" height={180} />
      <Stack direction="row" spacing={1}>
        <Skeleton variant="rounded" width={120} height={36} />
        <Skeleton variant="rounded" width={120} height={36} />
      </Stack>
      <Skeleton variant="rounded" height={56} />
      <Skeleton variant="rounded" height={56} />
      <Skeleton variant="rounded" height={160} />
    </Stack>
  );
}

export const RegionAdminEditor: React.FC<Props> = ({ region, loading }) => {
  const theme = useTheme();
  const { t, i18n } = useTranslation("admin");
  const [tab, setTab] = useState<EditorTab>("metadata");

  const displayLanguage = normalizeRegionLanguage(i18n.resolvedLanguage ?? "en");
  const regionName = useMemo(
    () => getRegionDisplayName(region, displayLanguage, region?.code ?? ""),
    [displayLanguage, region],
  );

  if (loading) {
    return (
      <Paper
        sx={{
          p: 2.25,
          borderRadius: 4,
          border: "1px solid",
          borderColor: theme.customColors.sidebarBorder,
          backgroundColor: "background.paper",
        }}
      >
        <RegionEditorSkeleton />
      </Paper>
    );
  }

  if (!region) {
    return (
      <Paper
        sx={{
          p: { xs: 2.25, md: 3 },
          minHeight: 560,
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          borderRadius: 4,
          border: "1px solid",
          borderColor: theme.customColors.sidebarBorder,
          backgroundImage: theme.gradients.cardSoft,
        }}
      >
        <Stack spacing={1.2}>
          <Chip
            label={t("regions.editorBadge", {
              defaultValue: "Regions editor",
            })}
            sx={{ alignSelf: "flex-start" }}
          />
          <Typography variant="h5" fontWeight={900}>
            {t("regions.emptyTitle", {
              defaultValue: "Select a region to edit",
            })}
          </Typography>
          <Typography color="text.secondary">
            {t("regions.emptyDescription", {
              defaultValue:
                "Choose a region from the list to manage metadata, translations, dialects, and traditions.",
            })}
          </Typography>
        </Stack>
      </Paper>
    );
  }

  const content =
    tab === "metadata" ? (
      <RegionMetadataAdminTab region={region} />
    ) : tab === "translations" ? (
      <RegionTranslationsAdminTab region={region} />
    ) : tab === "dialects" ? (
      <RegionDialectsAdminTab region={region} />
    ) : (
      <RegionTraditionsAdminTab region={region} />
    );

  return (
    <Paper
      sx={{
        display: "flex",
        flexDirection: "column",
        minHeight: 560,
        borderRadius: 4,
        overflow: "hidden",
        border: "1px solid",
        borderColor: theme.customColors.sidebarBorder,
        backgroundColor: "background.paper",
      }}
    >
      <Box
        sx={{
          px: 2.25,
          py: 2,
          color: "#fff",
          backgroundImage: region.imageUrl
            ? `linear-gradient(180deg, rgba(15,23,42,0.28), rgba(15,23,42,0.84)), url(${region.imageUrl})`
            : "linear-gradient(135deg, rgba(14,165,233,0.92), rgba(37,99,235,0.88), rgba(15,118,110,0.92))",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <Stack spacing={1}>
          <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
            <Chip
              label={region.kind === "city"
                ? t("regions.kind.city", { defaultValue: "City" })
                : t("regions.kind.region", { defaultValue: "Region" })}
              sx={{
                backgroundColor: "rgba(255,255,255,0.18)",
                color: "#fff",
              }}
            />
            <Chip
              label={region.isActive
                ? t("regions.state.active", { defaultValue: "Active" })
                : t("regions.state.inactive", { defaultValue: "Inactive" })}
              sx={{
                backgroundColor: "rgba(255,255,255,0.18)",
                color: "#fff",
              }}
            />
            <Chip
              label={t("regions.labels.levelBadge", {
                defaultValue: "Level {{level}}",
                level: region.requiredLevel,
              })}
              sx={{
                backgroundColor: "rgba(255,255,255,0.18)",
                color: "#fff",
              }}
            />
          </Stack>

          <Typography variant="h4" fontWeight={900}>
            {regionName}
          </Typography>

          <Typography sx={{ opacity: 0.92 }}>
            {t("regions.labels.regionCode", {
              defaultValue: "Code: {{code}}",
              code: region.code,
            })}
          </Typography>
        </Stack>
      </Box>

      <Box sx={{ px: 2.25, pt: 1.5 }}>
        <Tabs
          value={tab}
          onChange={(_, value: EditorTab) => setTab(value)}
          variant="scrollable"
          scrollButtons="auto"
          sx={{
            minHeight: 44,
            "& .MuiTab-root": {
              textTransform: "none",
              minHeight: 44,
              fontWeight: 800,
            },
          }}
        >
          <Tab
            value="metadata"
            label={t("regions.tabs.metadata", {
              defaultValue: "Metadata",
            })}
          />
          <Tab
            value="translations"
            label={t("regions.tabs.translations", {
              defaultValue: "Translations",
            })}
          />
          <Tab
            value="dialects"
            label={t("regions.tabs.dialects", {
              defaultValue: "Dialects",
            })}
          />
          <Tab
            value="traditions"
            label={t("regions.tabs.traditions", {
              defaultValue: "Traditions",
            })}
          />
        </Tabs>
      </Box>

      <Box
        sx={{
          p: 2.25,
          overflowY: "auto",
          flex: 1,
        }}
      >
        {content}
      </Box>
    </Paper>
  );
};
