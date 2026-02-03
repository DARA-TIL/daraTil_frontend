import React, { useMemo, useState } from "react";
import {
  Box,
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
  Tab,
  Tabs,
  Typography,
  Button,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import FavoriteIcon from "@mui/icons-material/Favorite";
import { useTranslation } from "react-i18next";
import { useFolkloreStore } from "../store/useFolkloreStore";
import { getTranslationByLang, normalizeTabLang } from "../model/helpers";
import type { FolkloreTabLang } from "../model/types";
import { SmartMedia } from "@/widgets/SmartMedia/SmartMedia";

export const FolkloreDetailsDialog: React.FC = () => {
  const { i18n, t } = useTranslation("folklore");

  const open = useFolkloreStore((s) => Boolean(s.selectedId));
  const selected = useFolkloreStore((s) => s.selected);
  const loading = useFolkloreStore((s) => s.detailsLoading);
  const close = useFolkloreStore((s) => s.closeDetails);
  const toggleLike = useFolkloreStore((s) => s.toggleLike);
  const liked = useFolkloreStore((s) =>
    selected ? Boolean(s.likedIds[selected.id]) : false,
  );

  const [tab, setTab] = useState<FolkloreTabLang>("original");

  const translation = useMemo(() => {
    if (!selected) return undefined;
    if (tab === "original") return undefined;
    return getTranslationByLang(selected, tab);
  }, [selected, tab]);

  const title = tab === "original" ? selected?.name : translation?.name;
  const content = tab === "original" ? selected?.content : translation?.content;
  const explanation = tab === "original" ? undefined : translation?.explanation;

  const typeLabel = selected?.type
    ? t(`types.${selected.type}`, { defaultValue: selected.type })
    : "";
  const regionLabel = selected?.region
    ? t(`regions.${selected.region}`, { defaultValue: selected.region })
    : "";

  React.useEffect(() => {
    if (!open) return;
    setTab(normalizeTabLang(i18n.resolvedLanguage || i18n.language));
  }, [open, i18n.language, i18n.resolvedLanguage]);

  return (
    <Dialog open={open} onClose={close} maxWidth="md" fullWidth>
      <DialogTitle sx={{ display: "flex", alignItems: "center", gap: 1 }}>
        <Box sx={{ flex: 1 }}>
          <Typography fontWeight={800} sx={{ lineHeight: 1.2 }}>
            {loading ? t("details.loading") : title || ""}
          </Typography>

          {selected ? (
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
              {typeLabel} - {regionLabel} - {selected.author}
            </Typography>
          ) : null}
        </Box>

        {selected ? (
          <Button
            size="small"
            variant="outlined"
            startIcon={<FavoriteIcon color={liked ? "error" : "disabled"} />}
            onClick={() => toggleLike(selected.id)}
            sx={{ borderRadius: 999 }}
          >
            {selected.likesCount}
          </Button>
        ) : null}

        <IconButton onClick={close}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent dividers>
        {selected?.imageUrl ? (
          <Box
            sx={{
              height: 240,
              borderRadius: 3,
              mb: 2,
              background: `url(${selected.imageUrl}) center/cover no-repeat`,
            }}
          />
        ) : null}

        <Tabs
          value={tab}
          onChange={(_, v) => setTab(v)}
          sx={{ mb: 2 }}
          variant="scrollable"
          scrollButtons="auto"
        >
          <Tab value="original" label={t("details.original")} />
          <Tab value="kz" label="KZ" />
          <Tab value="ru" label="RU" />
          <Tab value="en" label="EN" />
        </Tabs>

        <Typography sx={{ whiteSpace: "pre-wrap" }}>
          {loading ? t("details.loading") : content || ""}
        </Typography>

        {explanation ? (
          <Box
            sx={{ mt: 2, p: 2, borderRadius: 3, bgcolor: "rgba(2,6,23,0.04)" }}
          >
            <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 0.8 }}>
              {t("details.explanation")}
            </Typography>
            <Typography variant="body2" sx={{ whiteSpace: "pre-wrap" }}>
              {explanation}
            </Typography>
          </Box>
        ) : null}

        {selected?.mediaUrl ? (
          <Box sx={{ mt: 2 }}>
            <SmartMedia
              url={selected.mediaUrl}
              typeHint="audio"
            />
          </Box>
        ) : null}
      </DialogContent>
    </Dialog>
  );
};
