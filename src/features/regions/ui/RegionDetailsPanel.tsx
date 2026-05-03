import React from "react";
import {
  keyframes,
  useTheme,
} from "@mui/material/styles";
import {
  Box,
  Button,
  Chip,
  Divider,
  Fade,
  IconButton,
  Paper,
  Skeleton,
  Stack,
  Tab,
  Tabs,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from "@mui/material";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import ImageOutlinedIcon from "@mui/icons-material/ImageOutlined";
import TranslateRoundedIcon from "@mui/icons-material/TranslateRounded";
import VolumeUpRoundedIcon from "@mui/icons-material/VolumeUpRounded";
import type { Region, RegionLanguage } from "../model/types";
import {
  getRegionDisplayDescription,
  getRegionDisplayName,
  getRegionSlangCards,
  getRegionTraditionCards,
  type RegionTab,
} from "../model/helpers";
import { useTranslation } from "react-i18next";
import { AssistantSelectionSurface } from "@/features/assistant/ui/AssistantSelectionSurface";

const fadeUp = keyframes`
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

type Props = {
  region: Region | null;
  loading: boolean;
  desktop: boolean;
  fallbackName?: string;
  fallbackKind?: string;
  language: RegionLanguage;
  tab: RegionTab;
  onClose: () => void;
  onLanguageChange: (language: RegionLanguage) => void;
  onTabChange: (tab: RegionTab) => void;
};

const languages: RegionLanguage[] = ["KZ", "RU", "EN"];

function RegionSkeleton() {
  return (
    <Stack spacing={2}>
      <Skeleton variant="rounded" height={220} />
      <Stack direction="row" spacing={1}>
        <Skeleton variant="rounded" width={84} height={28} />
        <Skeleton variant="rounded" width={96} height={28} />
      </Stack>
      <Skeleton width="62%" height={38} />
      <Skeleton width="92%" />
      <Skeleton width="85%" />
      <Skeleton width="70%" />
      <Stack spacing={1.25}>
        {Array.from({ length: 3 }).map((_, index) => (
          <Skeleton key={index} variant="rounded" height={104} />
        ))}
      </Stack>
    </Stack>
  );
}

export const RegionDetailsPanel: React.FC<Props> = ({
  region,
  loading,
  desktop,
  fallbackName = "",
  fallbackKind = "region",
  language,
  tab,
  onClose,
  onLanguageChange,
  onTabChange,
}) => {
  const theme = useTheme();
  const { t } = useTranslation("map");

  if (loading) {
    return (
      <Paper
        sx={{
          height: "100%",
          p: 2.25,
          backgroundImage: theme.gradients.cardSoft,
          border: "1px solid",
          borderColor: theme.customColors.sidebarBorder,
        }}
      >
        <RegionSkeleton />
      </Paper>
    );
  }

  if (!region) {
    return (
      <Paper
        sx={{
          height: "100%",
          p: { xs: 2.25, md: 3 },
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          backgroundImage: theme.gradients.cardSoft,
          border: "1px solid",
          borderColor: theme.customColors.sidebarBorder,
          overflow: "hidden",
          position: "relative",
        }}
      >
        <Box
          sx={{
            position: "absolute",
            top: -40,
            right: -40,
            width: 180,
            height: 180,
            borderRadius: "50%",
            background:
              "radial-gradient(circle at 30% 30%, rgba(37,99,235,0.18), transparent 65%)",
            pointerEvents: "none",
          }}
        />

        <Stack spacing={1.2} sx={{ position: "relative", zIndex: 1 }}>
          <Chip
            label={t("panel.idleBadge", { defaultValue: "Map explorer" })}
            sx={{ alignSelf: "flex-start" }}
          />
          <Typography variant="h5" fontWeight={800}>
            {t("panel.emptyTitle", { defaultValue: "Select a region" })}
          </Typography>
          <Typography color="text.secondary">
            {t("panel.emptyDescription", {
              defaultValue:
                "Choose any region or republican city to explore local overview, dialects, and traditions.",
            })}
          </Typography>
          <Divider sx={{ my: 1 }} />
          <Stack spacing={0.75}>
            <Typography variant="body2" color="text.secondary">
              {t("panel.emptyHintHover", {
                defaultValue: "Hover to preview",
              })}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {t("panel.emptyHintClick", {
                defaultValue: "Click to zoom and explore",
              })}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {t("panel.emptyHintLanguage", {
                defaultValue: "Use local KZ / RU / EN content switching inside the drawer",
              })}
            </Typography>
          </Stack>
        </Stack>
      </Paper>
    );
  }

  const regionName = getRegionDisplayName(region, language, fallbackName);
  const overviewText = getRegionDisplayDescription(region, language);
  const dialectCards = getRegionSlangCards(region.regionSlang, language);
  const traditionCards = getRegionTraditionCards(region.regionTraditions, language);
  const kindLabel =
    (region.kind || fallbackKind).toLowerCase() === "city"
      ? t("panel.kind.city", { defaultValue: "City" })
      : t("panel.kind.region", { defaultValue: "Region" });

  const content = (() => {
    if (tab === "overview") {
      return (
        <Stack spacing={1.4}>
          <AssistantSelectionSurface block={overviewText} language={language}>
            <Typography color="text.secondary">
              {overviewText ||
                t("panel.noOverview", {
                  defaultValue: "Overview text is not available yet for this language.",
                })}
            </Typography>
          </AssistantSelectionSurface>

          <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
            <Chip
              label={t("panel.metaCode", {
                defaultValue: "Code: {{code}}",
                code: region.code,
              })}
              variant="outlined"
            />
            <Chip
              label={t("panel.metaDialects", {
                defaultValue: "Dialects: {{count}}",
                count: region.regionSlang.length,
              })}
              variant="outlined"
            />
            <Chip
              label={t("panel.metaTraditions", {
                defaultValue: "Traditions: {{count}}",
                count: region.regionTraditions.length,
              })}
              variant="outlined"
            />
            <Chip
              label={t("panel.metaStatus", {
                defaultValue: "Status: {{status}}",
                status: region.regionStatus || t("panel.statusUnknown", { defaultValue: "Unknown" }),
              })}
              variant="outlined"
            />
          </Stack>
        </Stack>
      );
    }

    if (tab === "dialects") {
      if (dialectCards.length === 0) {
        return (
          <Typography color="text.secondary">
            {t("panel.noDialects", {
              defaultValue: "No dialect content is available yet for this region.",
            })}
          </Typography>
        );
      }

      return (
        <Stack spacing={1.25}>
          {dialectCards.map((item, index) => (
            <Paper
              key={item.id}
              variant="outlined"
              sx={{
                p: 1.5,
                borderRadius: 3,
                animation: `${fadeUp} 220ms ease both`,
                animationDelay: `${index * 60}ms`,
              }}
            >
              <Stack direction="row" justifyContent="space-between" spacing={1.25}>
                <Box>
                  <AssistantSelectionSurface
                    block={[item.word, item.description].filter(Boolean).join("\n")}
                    language={language}
                  >
                    <Box>
                      <Typography fontWeight={800}>{item.word}</Typography>
                      <Typography variant="body2" color="text.secondary">
                        {item.description ||
                          t("panel.noDescription", {
                            defaultValue: "Description not available yet.",
                          })}
                      </Typography>
                    </Box>
                  </AssistantSelectionSurface>
                </Box>

                {item.pronounceUrl ? (
                  <Button
                    size="small"
                    variant="outlined"
                    startIcon={<VolumeUpRoundedIcon />}
                    href={item.pronounceUrl}
                    target="_blank"
                    rel="noreferrer"
                  >
                    {t("panel.pronounce", { defaultValue: "Pronounce" })}
                  </Button>
                ) : null}
              </Stack>
            </Paper>
          ))}
        </Stack>
      );
    }

    if (traditionCards.length === 0) {
      return (
        <Typography color="text.secondary">
          {t("panel.noTraditions", {
            defaultValue: "No traditions are available yet for this region.",
          })}
        </Typography>
      );
    }

    return (
      <Stack spacing={1.25}>
        {traditionCards.map((item, index) => (
          <Paper
            key={item.id}
            variant="outlined"
            sx={{
              p: 1.6,
              borderRadius: 3,
              animation: `${fadeUp} 220ms ease both`,
              animationDelay: `${index * 60}ms`,
            }}
          >
            <AssistantSelectionSurface
              block={[item.name, item.description].filter(Boolean).join("\n")}
              language={language}
            >
              <Box>
                <Typography fontWeight={800}>{item.name}</Typography>
                <Typography variant="body2" color="text.secondary">
                  {item.description ||
                    t("panel.noDescription", {
                      defaultValue: "Description not available yet.",
                    })}
                </Typography>
              </Box>
            </AssistantSelectionSurface>
          </Paper>
        ))}
      </Stack>
    );
  })();

  return (
    <Paper
      sx={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
        backgroundImage: theme.gradients.cardSoft,
        border: "1px solid",
        borderColor: theme.customColors.sidebarBorder,
      }}
    >
      <Box
        sx={{
          position: "relative",
          minHeight: 234,
          px: 2.25,
          py: 2.1,
          color: "#fff",
          backgroundImage: region.imageUrl
            ? `linear-gradient(180deg, rgba(15,23,42,0.18), rgba(15,23,42,0.8)), url(${region.imageUrl})`
            : "linear-gradient(135deg, rgba(14,165,233,0.9) 0%, rgba(37,99,235,0.88) 45%, rgba(21,94,117,0.92) 100%)",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        {!region.imageUrl ? (
          <ImageOutlinedIcon
            sx={{
              position: "absolute",
              right: 24,
              bottom: 24,
              fontSize: 68,
              opacity: 0.22,
            }}
          />
        ) : null}

        <Stack direction="row" justifyContent="space-between" spacing={1}>
          <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
            <Chip
              label={kindLabel}
              sx={{
                backgroundColor: "rgba(255,255,255,0.18)",
                color: "#fff",
              }}
            />
            {region.requiredLevel > 0 ? (
              <Chip
                label={t("panel.requiredLevel", {
                  defaultValue: "Level {{level}}",
                  level: region.requiredLevel,
                })}
                sx={{
                  backgroundColor: "rgba(255,255,255,0.18)",
                  color: "#fff",
                }}
              />
            ) : null}
          </Stack>

          <IconButton
            onClick={onClose}
            sx={{
              color: "#fff",
              backgroundColor: "rgba(255,255,255,0.14)",
              "&:hover": {
                backgroundColor: "rgba(255,255,255,0.24)",
              },
            }}
          >
            <CloseRoundedIcon />
          </IconButton>
        </Stack>

        <Stack spacing={1} mt={4}>
          <Typography variant="h4" fontWeight={900}>
            {regionName}
          </Typography>
          <AssistantSelectionSurface block={overviewText} language={language}>
            <Typography
              variant="body2"
              sx={{
                maxWidth: desktop ? 420 : "100%",
                opacity: 0.94,
              }}
            >
              {overviewText ||
                t("panel.placeholderOverview", {
                  defaultValue: "This region is ready for cultural, linguistic, and tradition content.",
                })}
            </Typography>
          </AssistantSelectionSurface>
        </Stack>
      </Box>

      <Stack
        direction={{ xs: "column", sm: "row" }}
        spacing={1.2}
        alignItems={{ xs: "stretch", sm: "center" }}
        justifyContent="space-between"
        sx={{ px: 2.25, pt: 1.8 }}
      >
        <Tabs
          value={tab}
          onChange={(_, nextTab: RegionTab) => onTabChange(nextTab)}
          variant="scrollable"
          scrollButtons="auto"
          sx={{
            minHeight: 40,
            "& .MuiTab-root": {
              minHeight: 40,
              textTransform: "none",
              fontWeight: 700,
            },
          }}
        >
          <Tab
            value="overview"
            label={t("tabs.overview", { defaultValue: "Overview" })}
          />
          <Tab
            value="dialects"
            label={t("tabs.dialects", { defaultValue: "Dialects" })}
          />
          <Tab
            value="traditions"
            label={t("tabs.traditions", { defaultValue: "Traditions" })}
          />
        </Tabs>

        <ToggleButtonGroup
          exclusive
          size="small"
          value={language}
          onChange={(_, nextLanguage) => {
            if (nextLanguage) onLanguageChange(nextLanguage);
          }}
          sx={{ alignSelf: { xs: "flex-start", sm: "center" } }}
        >
          {languages.map((item) => (
            <ToggleButton key={item} value={item}>
              <Stack direction="row" spacing={0.5} alignItems="center">
                <TranslateRoundedIcon sx={{ fontSize: 14 }} />
                <Typography variant="caption" fontWeight={700}>
                  {item}
                </Typography>
              </Stack>
            </ToggleButton>
          ))}
        </ToggleButtonGroup>
      </Stack>

      <Box
        sx={{
          px: 2.25,
          py: 2,
          overflowY: "auto",
          flex: 1,
        }}
      >
        <Fade in key={`${tab}-${language}-${region.id}`}>
          <Box>{content}</Box>
        </Fade>
      </Box>
    </Paper>
  );
};
