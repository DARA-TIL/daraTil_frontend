import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Box,
  Button,
  Drawer,
  InputAdornment,
  IconButton,
  Pagination,
  Paper,
  Skeleton,
  Stack,
  TextField,
  Chip,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
  useMediaQuery,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import TranslateRoundedIcon from "@mui/icons-material/TranslateRounded";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import FavoriteRoundedIcon from "@mui/icons-material/FavoriteRounded";
import MenuBookRoundedIcon from "@mui/icons-material/MenuBookRounded";
import AutoAwesomeRoundedIcon from "@mui/icons-material/AutoAwesomeRounded";
import PlaylistAddRoundedIcon from "@mui/icons-material/PlaylistAddRounded";
import RefreshRoundedIcon from "@mui/icons-material/RefreshRounded";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import { useTranslation } from "react-i18next";
import { useDebouncedValue } from "@/shared/lib/useDebouncedValue";
import { useDictionaryStore } from "@/features/dictionary/store/useDictionaryStore";
import {
  type DictionaryCreateDto,
  type DictionaryLanguage,
  type DictionaryUpdateDto,
} from "@/features/dictionary/model/types";
import {
  countFilledDictionaryValues,
  hasDictionaryContent,
  normalizeDictionaryLanguage,
} from "@/features/dictionary/model/helpers";
import { DictionaryEntryCard } from "@/features/dictionary/ui/DictionaryEntryCard";
import {
  DictionaryDetailsPanel,
  type DictionaryDetailsTab,
} from "@/features/dictionary/ui/DictionaryDetailsPanel";
import { DictionaryEntryDialog } from "@/features/dictionary/ui/DictionaryEntryDialog";
import { DictionaryQuickFavoriteDialog } from "@/features/dictionary/ui/DictionaryQuickFavoriteDialog";
import { requestConfirm } from "@/shared/store/useConfirmDialogStore";
import { useUiStore } from "@/shared/store/useUiStore";

type FilterMode = "all" | "favorites";

type SummaryCard = {
  key: string;
  icon: React.ReactNode;
  label: string;
  value: number;
};

const PAGE_SIZE_OPTIONS = [3, 6, 9, 12];

const DictionaryPage: React.FC = () => {
  const theme = useTheme();
  const isDesktop = useMediaQuery(theme.breakpoints.up("lg"));
  const { t, i18n } = useTranslation("dictionary");
  const showSnackbar = useUiStore((state) => state.showSnackbar);

  const items = useDictionaryStore((state) => state.items);
  const loading = useDictionaryStore((state) => state.loading);
  const favoriteIds = useDictionaryStore((state) => state.favoriteIds);
  const selectedId = useDictionaryStore((state) => state.selectedId);
  const selectedItem = useDictionaryStore((state) => state.selectedItem);
  const selectedLoading = useDictionaryStore((state) => state.selectedLoading);
  const fetchCollection = useDictionaryStore((state) => state.fetchCollection);
  const searchByWord = useDictionaryStore((state) => state.searchByWord);
  const selectById = useDictionaryStore((state) => state.selectById);
  const clearSelected = useDictionaryStore((state) => state.clearSelected);
  const createEntry = useDictionaryStore((state) => state.createEntry);
  const updateEntry = useDictionaryStore((state) => state.updateEntry);
  const deleteEntry = useDictionaryStore((state) => state.deleteEntry);
  const favoriteWord = useDictionaryStore((state) => state.favoriteWord);
  const addFavorite = useDictionaryStore((state) => state.addFavorite);
  const removeFavorite = useDictionaryStore((state) => state.removeFavorite);

  const [query, setQuery] = useState("");
  const [filterMode, setFilterMode] = useState<FilterMode>("all");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState<number>(3);
  const [detailsLanguage, setDetailsLanguage] = useState<DictionaryLanguage>(
    normalizeDictionaryLanguage(i18n.resolvedLanguage ?? i18n.language),
  );
  const [detailsTab, setDetailsTab] = useState<DictionaryDetailsTab>("translations");
  const [createOpen, setCreateOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [quickFavoriteOpen, setQuickFavoriteOpen] = useState(false);
  const [mutationLoading, setMutationLoading] = useState(false);
  const didHandleInitialQueryEffect = useRef(false);

  const debouncedQuery = useDebouncedValue(query, 350);
  const previewLanguage = normalizeDictionaryLanguage(
    i18n.resolvedLanguage ?? i18n.language,
  );

  useEffect(() => {
    void fetchCollection();
  }, [fetchCollection]);

  useEffect(() => {
    const nextLanguage = normalizeDictionaryLanguage(
      i18n.resolvedLanguage ?? i18n.language,
    );
    setDetailsLanguage(nextLanguage);
  }, [i18n.language, i18n.resolvedLanguage]);

  useEffect(() => {
    const queryValue = debouncedQuery.trim();

    if (!didHandleInitialQueryEffect.current) {
      didHandleInitialQueryEffect.current = true;

      if (!queryValue) {
        return;
      }
    }

    void (queryValue ? searchByWord(queryValue) : fetchCollection(true));
  }, [debouncedQuery, fetchCollection, searchByWord]);

  useEffect(() => {
    setPage(1);
  }, [debouncedQuery, filterMode, pageSize]);

  const summaryCards = useMemo<SummaryCard[]>(() => {
    const favoritesCount = Object.keys(favoriteIds).length;
    const translationsCount = items.filter(
      (item) => countFilledDictionaryValues(item.wordTranslations) > 0,
    ).length;
    const explanationsCount = items.filter(
      (item) => countFilledDictionaryValues(item.wordExplainingTranslations) > 0,
    ).length;

    return [
      {
        key: "total",
        icon: <MenuBookRoundedIcon color="primary" />,
        label: t("summary.total", { defaultValue: "Saved words" }),
        value: items.length,
      },
      {
        key: "favorites",
        icon: <FavoriteRoundedIcon color="warning" />,
        label: t("summary.favorites", { defaultValue: "Favorites" }),
        value: favoritesCount,
      },
      {
        key: "translations",
        icon: <TranslateRoundedIcon color="success" />,
        label: t("summary.translations", {
          defaultValue: "With translations",
        }),
        value: translationsCount,
      },
      {
        key: "explanations",
        icon: <AutoAwesomeRoundedIcon color="secondary" />,
        label: t("summary.explanations", {
          defaultValue: "With explanations",
        }),
        value: explanationsCount,
      },
    ];
  }, [favoriteIds, items, t]);

  const filteredItems = useMemo(() => {
    const rows = filterMode === "favorites"
      ? items.filter((item) => Boolean(favoriteIds[item.id]))
      : items;

    return rows
      .filter(hasDictionaryContent)
      .sort((left, right) => {
        const favoriteDelta = Number(Boolean(favoriteIds[right.id])) - Number(Boolean(favoriteIds[left.id]));
        if (favoriteDelta !== 0) return favoriteDelta;

        return left.originalWord.localeCompare(right.originalWord, undefined, {
          sensitivity: "base",
        });
      });
  }, [favoriteIds, filterMode, items]);

  const totalPages = Math.max(1, Math.ceil(filteredItems.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const paginatedItems = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    return filteredItems.slice(startIndex, startIndex + pageSize);
  }, [currentPage, filteredItems, pageSize]);

  const handleToggleFavorite = async (id: number) => {
    const isFavorite = Boolean(favoriteIds[id]);
    const ok = isFavorite ? await removeFavorite(id) : await addFavorite(id);
    if (!ok) return;

    showSnackbar(
      isFavorite
        ? t("snackbar.favoriteRemoved", {
            defaultValue: "Removed from favorites.",
          })
        : t("snackbar.favoriteAdded", {
            defaultValue: "Added to favorites.",
          }),
      "success",
    );
  };

  const handleDeleteSelected = async () => {
    if (!selectedItem) return;

    const confirmed = await requestConfirm({
      title: t("confirm.deleteTitle", {
        defaultValue: "Delete dictionary entry?",
      }),
      message: t("confirm.deleteMessage", {
        defaultValue:
          'The word "{{word}}" will be removed from your dictionary.',
        word: selectedItem.originalWord,
      }),
      confirmLabel: t("actions.delete", { defaultValue: "Delete" }),
      cancelLabel: t("common.cancel", { defaultValue: "Cancel" }),
      variant: "danger",
    });

    if (!confirmed) return;

    const ok = await deleteEntry(selectedItem.id);
    if (!ok) return;

    showSnackbar(
      t("snackbar.deleted", {
        defaultValue: "Dictionary entry deleted.",
      }),
      "success",
    );
  };

  const handleCreateSubmit = async (payload: DictionaryCreateDto | DictionaryUpdateDto) => {
    setMutationLoading(true);
    try {
      const created = await createEntry(payload as DictionaryCreateDto);
      if (!created) return;

      setCreateOpen(false);
      setQuery(created.originalWord);
      setDetailsTab("translations");
      await selectById(created.id, true);
      showSnackbar(
        t("snackbar.created", {
          defaultValue: "Dictionary entry created.",
        }),
        "success",
      );
    } finally {
      setMutationLoading(false);
    }
  };

  const handleEditSubmit = async (payload: DictionaryCreateDto | DictionaryUpdateDto) => {
    setMutationLoading(true);
    try {
      const updated = await updateEntry(payload as DictionaryUpdateDto);
      if (!updated) return;

      setEditOpen(false);
      setDetailsTab("translations");
      await selectById(updated.id, true);
      showSnackbar(
        t("snackbar.updated", {
          defaultValue: "Dictionary entry updated.",
        }),
        "success",
      );
    } finally {
      setMutationLoading(false);
    }
  };

  const handleQuickFavoriteSubmit = async (payload: {
    block: string;
    lang: DictionaryLanguage;
    word: string;
  }) => {
    setMutationLoading(true);
    try {
      const created = await favoriteWord(payload);
      if (!created) return;

      setQuickFavoriteOpen(false);
      setQuery(created.originalWord);
      setFilterMode("favorites");
      setDetailsTab("translations");
      await selectById(created.id, true);
      showSnackbar(
        t("snackbar.quickFavorited", {
          defaultValue: "Word generated and added to favorites.",
        }),
        "success",
      );
    } finally {
      setMutationLoading(false);
    }
  };

  const detailContent = (
    <DictionaryDetailsPanel
      desktop={isDesktop}
      favorite={Boolean(selectedItem && favoriteIds[selectedItem.id])}
      item={selectedItem}
      language={detailsLanguage}
      loading={selectedLoading}
      tab={detailsTab}
      onClose={clearSelected}
      onDelete={() => {
        void handleDeleteSelected();
      }}
      onEdit={() => setEditOpen(true)}
      onLanguageChange={setDetailsLanguage}
      onTabChange={setDetailsTab}
      onToggleFavorite={() => {
        if (!selectedItem) return;
        void handleToggleFavorite(selectedItem.id);
      }}
    />
  );

  return (
    <Box
      sx={{
        px: { xs: 1.5, md: 2.5 },
        pb: 3,
        maxWidth: "100%",
        overflowX: "clip",
      }}
    >
      <Stack spacing={2.25}>
        <Paper
          sx={{
            p: { xs: 2, md: 2.4 },
            backgroundImage: theme.gradients.cardSoft,
            border: "1px solid",
            borderColor: theme.customColors.sidebarBorder,
            overflow: "hidden",
          }}
        >
          <Stack
            direction={{ xs: "column", lg: "row" }}
            spacing={2}
            alignItems={{ xs: "stretch", lg: "center" }}
            justifyContent="space-between"
          >
            <Stack spacing={0.75}>
              <Stack direction="row" spacing={1} alignItems="center">
                <TranslateRoundedIcon color="primary" />
                <Typography variant="h4" fontWeight={800}>
                  {t("page.title", { defaultValue: "Dictionary" })}
                </Typography>
              </Stack>
              <Typography color="text.secondary" sx={{ maxWidth: 760 }}>
                {t("page.subtitle", {
                  defaultValue:
                    "Review saved words, keep favorites close, and manage translations and explanations in one place.",
                })}
              </Typography>
            </Stack>

            <Stack direction={{ xs: "column", sm: "row" }} spacing={1}>
              <Button
                variant="outlined"
                startIcon={<AutoAwesomeRoundedIcon />}
                onClick={() => setQuickFavoriteOpen(true)}
                sx={{ borderRadius: 999 }}
              >
                {t("actions.quickFavorite", {
                  defaultValue: "Quick favorite",
                })}
              </Button>
              <Button
                variant="contained"
                startIcon={<PlaylistAddRoundedIcon />}
                onClick={() => setCreateOpen(true)}
                sx={{ borderRadius: 999 }}
              >
                {t("actions.create", { defaultValue: "Create" })}
              </Button>
            </Stack>
          </Stack>
        </Paper>

        <Box
          sx={{
            display: "grid",
            gap: 2,
            gridTemplateColumns: {
              xs: "1fr",
              sm: "repeat(2, minmax(0, 1fr))",
              xl: "repeat(4, minmax(0, 1fr))",
            },
          }}
        >
          {summaryCards.map((card) => (
            <Paper
              key={card.key}
              sx={{
                p: 2,
                minWidth: 0,
                borderRadius: 4,
                border: "1px solid",
                borderColor: theme.customColors.sidebarBorder,
                backgroundColor: "background.paper",
              }}
            >
              <Stack direction="row" spacing={1.2} alignItems="center">
                {card.icon}
                <Box sx={{ minWidth: 0 }}>
                  <Typography variant="h5" fontWeight={900}>
                    {loading ? <Skeleton width={52} /> : card.value}
                  </Typography>
                  <Typography color="text.secondary">{card.label}</Typography>
                </Box>
              </Stack>
            </Paper>
          ))}
        </Box>

        <Paper
          sx={{
            p: 2,
            borderRadius: 4,
            border: "1px solid",
            borderColor: theme.customColors.sidebarBorder,
            overflow: "hidden",
          }}
        >
          <Stack spacing={1.5}>
            <Stack
              direction={{ xs: "column", lg: "row" }}
              spacing={1.2}
              alignItems={{ xs: "stretch", lg: "center" }}
              justifyContent="space-between"
              useFlexGap
              flexWrap="wrap"
            >
              <TextField
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder={t("filters.searchPlaceholder", {
                  defaultValue: "Search by word...",
                })}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchRoundedIcon sx={{ color: "text.secondary" }} />
                    </InputAdornment>
                  ),
                }}
                sx={{
                  flex: 1,
                  minWidth: { xs: "100%", lg: 320 },
                }}
              />

              <Stack
                direction={{ xs: "column", sm: "row" }}
                spacing={1}
                alignItems={{ xs: "stretch", sm: "center" }}
                useFlexGap
                flexWrap="wrap"
                sx={{ minWidth: 0 }}
              >
                <ToggleButtonGroup
                  exclusive
                  value={filterMode}
                  onChange={(_, nextValue: FilterMode | null) => {
                    if (nextValue) setFilterMode(nextValue);
                  }}
                  size="small"
                >
                  <ToggleButton value="all">
                    {t("filters.all", { defaultValue: "All" })}
                  </ToggleButton>
                  <ToggleButton value="favorites">
                    {t("filters.favorites", { defaultValue: "Favorites" })}
                  </ToggleButton>
                </ToggleButtonGroup>

                <Chip
                  label={t("details.currentLanguage", {
                    defaultValue: "Focused language: {{language}}",
                    language: previewLanguage,
                  })}
                  variant="outlined"
                  sx={{
                    maxWidth: "100%",
                    "& .MuiChip-label": {
                      whiteSpace: "normal",
                    },
                  }}
                />

                <ToggleButtonGroup
                  exclusive
                  size="small"
                  value={pageSize}
                  onChange={(_, nextValue: number | null) => {
                    if (nextValue) setPageSize(nextValue);
                  }}
                >
                  {PAGE_SIZE_OPTIONS.map((value) => (
                    <ToggleButton key={value} value={value}>
                      {value}
                    </ToggleButton>
                  ))}
                </ToggleButtonGroup>

                <IconButton
                  onClick={() => {
                    void fetchCollection(true);
                  }}
                  sx={{ border: "1px solid", borderColor: theme.customColors.sidebarBorder }}
                >
                  <RefreshRoundedIcon />
                </IconButton>
              </Stack>
            </Stack>

            <Stack
              direction={{ xs: "column", sm: "row" }}
              spacing={1}
              alignItems={{ xs: "stretch", sm: "center" }}
              justifyContent="space-between"
              useFlexGap
              flexWrap="wrap"
            >
              <Typography color="text.secondary">
                {t("filters.resultCount", {
                  defaultValue: "{{count}} entries visible",
                  count: filteredItems.length,
                })}
              </Typography>

              <Stack direction="row" spacing={1} alignItems="center" useFlexGap flexWrap="wrap">
                <Typography variant="body2" color="text.secondary">
                  {t("filters.pageSize", { defaultValue: "Per page" })}
                </Typography>
                <Typography variant="body2" fontWeight={700}>
                  {pageSize}
                </Typography>
              </Stack>
            </Stack>
          </Stack>
        </Paper>

        <Box
          sx={{
            display: "grid",
            gap: 2,
            alignItems: "stretch",
            gridTemplateColumns: {
              xs: "1fr",
              lg: "minmax(0, 1.05fr) minmax(360px, 0.95fr)",
            },
          }}
        >
          <Box sx={{ minWidth: 0 }}>
            <Stack spacing={1.35}>
              {loading ? (
                Array.from({ length: 5 }).map((_, index) => (
                  <Skeleton key={index} variant="rounded" height={198} />
                ))
              ) : paginatedItems.length === 0 ? (
                <Paper
                  sx={{
                    p: 3,
                    borderRadius: 4,
                    border: "1px solid",
                    borderColor: theme.customColors.sidebarBorder,
                    textAlign: "center",
                  }}
                >
                  <Typography fontWeight={900} sx={{ mb: 0.5 }}>
                    {t("empty.title", { defaultValue: "No words found" })}
                  </Typography>
                  <Typography color="text.secondary">
                    {t("empty.subtitle", {
                      defaultValue:
                        "Try another search, switch filters, or add a new word to your dictionary.",
                    })}
                  </Typography>
                </Paper>
              ) : (
                <>
                  {paginatedItems.map((entry) => (
                    <DictionaryEntryCard
                      key={entry.id}
                      entry={entry}
                      favorite={Boolean(favoriteIds[entry.id])}
                      language={previewLanguage}
                      selected={selectedId === entry.id}
                      onSelect={() => {
                        setDetailsTab("translations");
                        void selectById(entry.id, true);
                      }}
                      onToggleFavorite={() => {
                        void handleToggleFavorite(entry.id);
                      }}
                    />
                  ))}

                  {filteredItems.length > pageSize ? (
                    <Paper
                      sx={{
                        p: 1.5,
                        borderRadius: 4,
                        border: "1px solid",
                        borderColor: theme.customColors.sidebarBorder,
                      }}
                    >
                      <Stack
                        direction={{ xs: "column", sm: "row" }}
                        spacing={1}
                        justifyContent="space-between"
                        alignItems={{ xs: "stretch", sm: "center" }}
                      >
                        <Typography variant="body2" color="text.secondary">
                          {t("filters.pageMeta", {
                            defaultValue: "Page {{page}} of {{total}}",
                            page: currentPage,
                            total: totalPages,
                          })}
                        </Typography>
                        <Pagination
                          color="primary"
                          page={currentPage}
                          count={totalPages}
                          onChange={(_, nextPage) => setPage(nextPage)}
                        />
                      </Stack>
                    </Paper>
                  ) : null}
                </>
              )}
            </Stack>
          </Box>

          {isDesktop ? (
            <Box sx={{ minWidth: 0, height: "100%", minHeight: 560 }}>
              {detailContent}
            </Box>
          ) : null}
        </Box>

        {!isDesktop ? (
          <Drawer
            anchor="bottom"
            open={Boolean(selectedId)}
            onClose={clearSelected}
            PaperProps={{
              sx: {
                height: "82vh",
                borderTopLeftRadius: 24,
                borderTopRightRadius: 24,
                p: 1.1,
              },
            }}
          >
            <Stack direction="row" justifyContent="flex-end" sx={{ px: 1, pb: 0.5 }}>
              <IconButton onClick={clearSelected}>
                <CloseRoundedIcon />
              </IconButton>
            </Stack>
            <Box sx={{ height: "100%" }}>{detailContent}</Box>
          </Drawer>
        ) : null}
      </Stack>

      <DictionaryEntryDialog
        open={createOpen}
        mode="create"
        loading={mutationLoading}
        onClose={() => setCreateOpen(false)}
        onSubmit={handleCreateSubmit}
      />

      <DictionaryEntryDialog
        open={editOpen}
        mode="edit"
        initialValue={selectedItem}
        loading={mutationLoading}
        onClose={() => setEditOpen(false)}
        onSubmit={handleEditSubmit}
      />

      <DictionaryQuickFavoriteDialog
        open={quickFavoriteOpen}
        loading={mutationLoading}
        onClose={() => setQuickFavoriteOpen(false)}
        onSubmit={handleQuickFavoriteSubmit}
      />
    </Box>
  );
};

export default DictionaryPage;
