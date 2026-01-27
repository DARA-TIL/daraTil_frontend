import React, { useMemo } from "react";
import {
  Box,
  Button,
  Chip,
  MenuItem,
  Paper,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { useTranslation } from "react-i18next";
import { useFolkloreStore } from "../store/useFolkloreStore";

const TYPES = ["proverb", "story", "song", "legend", "aitys", "kui"];
const REGIONS = [
  "Almaty",
  "Astana",
  "Shymkent",
  "Batys",
  "Soltustik",
  "Ontustik",
];

type ActiveChip =
  | { key: "search"; label: string }
  | { key: "type"; label: string }
  | { key: "region"; label: string }
  | { key: "minLikes"; label: string };

export const FolkloreFiltersBar: React.FC = () => {
  const { t } = useTranslation("folklore");

  const search = useFolkloreStore((s) => s.search);
  const type = useFolkloreStore((s) => s.type);
  const region = useFolkloreStore((s) => s.region);
  const minLikes = useFolkloreStore((s) => s.minLikes);

  const setSearch = useFolkloreStore((s) => s.setSearch);
  const setType = useFolkloreStore((s) => s.setType);
  const setRegion = useFolkloreStore((s) => s.setRegion);
  const setMinLikes = useFolkloreStore((s) => s.setMinLikes);

  const applyFilters = useFolkloreStore((s) => s.applyFilters);
  const clearFilters = useFolkloreStore((s) => s.clearFilters);
  const fetchAll = useFolkloreStore((s) => s.fetchAll);
  const hasActiveFilters = useFolkloreStore((s) => s.hasActiveFilters);

  const hasActive = hasActiveFilters();

  const typeLabel = type ? t(`types.${type}`, { defaultValue: type }) : "";
  const regionLabel = region
    ? t(`regions.${region}`, { defaultValue: region })
    : "";

  const chips = useMemo<ActiveChip[]>(() => {
    const out: ActiveChip[] = [];
    const q = search.trim();

    if (q)
      out.push({
        key: "search",
        label: t("filters.chip.search", { value: q }),
      });
    if (type)
      out.push({
        key: "type",
        label: t("filters.chip.type", { value: typeLabel }),
      });
    if (region)
      out.push({
        key: "region",
        label: t("filters.chip.region", { value: regionLabel }),
      });
    if (minLikes.trim() !== "")
      out.push({
        key: "minLikes",
        label: t("filters.chip.minLikes", { value: minLikes }),
      });

    return out;
  }, [search, type, region, minLikes, t, typeLabel, regionLabel]);

  const clearOne = (key: ActiveChip["key"]) => {
    if (key === "search") setSearch("");
    if (key === "type") setType("");
    if (key === "region") setRegion("");
    if (key === "minLikes") setMinLikes("");
    applyFilters();
  };

  return (
    <Paper
      elevation={0}
      sx={(theme) => ({
        p: 2,
        borderRadius: 4,
        backgroundColor:
          theme.palette.mode === "light" ? "#fff" : "rgba(15,23,42,0.9)",
        border: `1px solid ${
          theme.palette.mode === "light"
            ? "rgba(148,163,184,0.35)"
            : "rgba(15,23,42,0.9)"
        }`,
        boxShadow:
          theme.palette.mode === "light"
            ? "0 12px 30px rgba(15,23,42,0.08)"
            : "0 16px 40px rgba(0,0,0,0.9)",
      })}
    >
      <Stack direction={{ xs: "column", md: "row" }} spacing={1.5}>
        <TextField
          fullWidth
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder={t("filters.searchPlaceholder")}
          size="small"
        />

        <TextField
          select
          value={type}
          onChange={(e) => setType(e.target.value)}
          size="small"
          sx={{ minWidth: 160 }}
          label={t("filters.typeLabel")}
        >
          <MenuItem value="">{t("filters.all")}</MenuItem>
          {TYPES.map((v) => (
            <MenuItem key={v} value={v}>
              {t(`types.${v}`, { defaultValue: v })}
            </MenuItem>
          ))}
        </TextField>

        <TextField
          select
          value={region}
          onChange={(e) => setRegion(e.target.value)}
          size="small"
          sx={{ minWidth: 180 }}
          label={t("filters.regionLabel")}
        >
          <MenuItem value="">{t("filters.all")}</MenuItem>
          {REGIONS.map((v) => (
            <MenuItem key={v} value={v}>
              {t(`regions.${v}`, { defaultValue: v })}
            </MenuItem>
          ))}
        </TextField>

        <TextField
          value={minLikes}
          onChange={(e) => {
            const v = e.target.value;
            if (v === "" || /^\d+$/.test(v)) setMinLikes(v);
          }}
          size="small"
          sx={{ minWidth: 140 }}
          label={t("filters.minLikesLabel")}
          placeholder="0"
        />

        <Box sx={{ display: "flex", gap: 1, justifyContent: "flex-end" }}>
          <Button
            variant="outlined"
            onClick={async () => {
              clearFilters();
              await fetchAll();
            }}
            disabled={!hasActive}
          >
            {t("filters.reset")}
          </Button>
          <Button variant="contained" onClick={applyFilters}>
            {t("filters.apply")}
          </Button>
        </Box>
      </Stack>

      {chips.length ? (
        <Box sx={{ mt: 1.5 }}>
          <Stack
            direction="row"
            spacing={1}
            useFlexGap
            flexWrap="wrap"
            alignItems="center"
          >
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{ mr: 0.5 }}
            >
              {t("filters.active")}
            </Typography>

            {chips.map((c) => (
              <Chip
                key={c.key}
                label={c.label}
                onDelete={() => clearOne(c.key)}
                size="small"
                sx={(theme) => ({
                  borderRadius: 999,
                  bgcolor:
                    theme.palette.mode === "light"
                      ? "rgba(255,255,255,0.75)"
                      : "rgba(15,23,42,0.6)",
                  backdropFilter: "blur(6px)",
                  border: `1px solid ${
                    theme.palette.mode === "light"
                      ? "rgba(148,163,184,0.25)"
                      : "rgba(255,255,255,0.08)"
                  }`,
                })}
              />
            ))}

            <Box sx={{ flex: 1 }} />

            <Button
              size="small"
              variant="text"
              onClick={async () => {
                clearFilters();
                await fetchAll();
              }}
              disabled={!hasActive}
              sx={{ fontWeight: 600 }}
            >
              {t("filters.clearAll")}
            </Button>
          </Stack>
        </Box>
      ) : null}
    </Paper>
  );
};
