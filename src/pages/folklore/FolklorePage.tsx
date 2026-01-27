import React, { useEffect, useMemo, useRef } from "react";
import { Box, Container, Paper, Typography } from "@mui/material";
import { useTranslation } from "react-i18next";
import { useFolkloreStore } from "@/features/folklore/store/useFolkloreStore";
import { FolkloreFiltersBar } from "@/features/folklore/ui/FolkloreFiltersBar";
import { FolkloreGrid } from "@/features/folklore/ui/FolkloreGrid";
import { FolkloreDetailsDialog } from "@/features/folklore/ui/FolkloreDetailsDialog";
import { useDebouncedValue } from "@/shared/lib/useDebouncedValue";

const FolklorePage: React.FC = () => {
  const { t } = useTranslation("folklore");

  const items = useFolkloreStore((s) => s.items);
  const loading = useFolkloreStore((s) => s.loading);

  const search = useFolkloreStore((s) => s.search);
  const type = useFolkloreStore((s) => s.type);
  const region = useFolkloreStore((s) => s.region);

  const fetchAll = useFolkloreStore((s) => s.fetchAll);
  const fetchSearch = useFolkloreStore((s) => s.fetchSearch);
  const fetchLiked = useFolkloreStore((s) => s.fetchLiked);

  const openDetails = useFolkloreStore((s) => s.openDetails);

  const debouncedSearch = useDebouncedValue(search, 400);

  const hasAnyFilters = useMemo(() => {
    const s = debouncedSearch.trim();
    return Boolean(s || type || region);
  }, [debouncedSearch, type, region]);

  useEffect(() => {
    fetchAll();
    fetchLiked();
  }, [fetchAll, fetchLiked]);

  const isFirstAutoRun = useRef(true);

  useEffect(() => {
    if (isFirstAutoRun.current) {
      isFirstAutoRun.current = false;
      return;
    }

    if (!hasAnyFilters) {
      fetchAll();
      return;
    }

    fetchSearch();
  }, [hasAnyFilters, debouncedSearch, type, region, fetchAll, fetchSearch]);

  return (
    <Container maxWidth="xl" sx={{ py: 3 }}>
      <Typography variant="h4" fontWeight={800} sx={{ mb: 2 }}>
        {t("page.title")}
      </Typography>

      <FolkloreFiltersBar />

      <Box sx={{ mt: 2 }}>
        <FolkloreGrid items={items} loading={loading} onOpen={openDetails} />

        {!loading && items.length === 0 ? (
          <Paper
            elevation={0}
            sx={(theme) => ({
              mt: 2,
              p: 3,
              borderRadius: 4,
              textAlign: "center",
              backgroundColor:
                theme.palette.mode === "light" ? "#fff" : "rgba(15,23,42,0.9)",
              border: `1px solid ${
                theme.palette.mode === "light"
                  ? "rgba(148,163,184,0.35)"
                  : "rgba(15,23,42,0.9)"
              }`,
            })}
          >
            <Typography fontWeight={800} sx={{ mb: 0.5 }}>
              {t("page.emptyTitle")}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {t("page.emptySubtitle")}
            </Typography>
          </Paper>
        ) : null}
      </Box>

      <FolkloreDetailsDialog />
    </Container>
  );
};

export default FolklorePage;
