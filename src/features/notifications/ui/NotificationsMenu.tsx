import React, { useEffect, useMemo, useState } from "react";
import {
  Badge,
  Box,
  Button,
  Divider,
  IconButton,
  Menu,
  MenuItem,
  Skeleton,
  Stack,
  Tooltip,
  Typography,
} from "@mui/material";
import NotificationsRoundedIcon from "@mui/icons-material/NotificationsRounded";
import DeleteSweepRoundedIcon from "@mui/icons-material/DeleteSweepRounded";
import OpenInNewRoundedIcon from "@mui/icons-material/OpenInNewRounded";
import { useTheme } from "@mui/material/styles";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "@/features/auth/store/useAuthStore";
import { requestConfirm } from "@/shared/store/useConfirmDialogStore";
import { useNotificationsStore } from "../store/useNotificationsStore";
import NotificationCard from "./NotificationCard";

const MENU_LIMIT = 12;

const NotificationsMenu: React.FC = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const { t } = useTranslation("notifications");
  const isAuth = useAuthStore((state) => state.isAuth);

  const items = useNotificationsStore((state) => state.items);
  const loading = useNotificationsStore((state) => state.loading);
  const actionLoading = useNotificationsStore((state) => state.actionLoading);
  const unreadCount = useNotificationsStore((state) => state.unreadCount);
  const fetchFeed = useNotificationsStore((state) => state.fetchFeed);
  const deleteMine = useNotificationsStore((state) => state.deleteMine);
  const clearMine = useNotificationsStore((state) => state.clearMine);

  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const open = Boolean(anchorEl);

  useEffect(() => {
    if (!open || !isAuth) return;
    void fetchFeed({ limit: MENU_LIMIT });
  }, [fetchFeed, isAuth, open]);

  const previewItems = useMemo(() => items, [items]);

  if (!isAuth) return null;

  return (
    <>
      <Tooltip
        title={t("menu.open", {
          defaultValue: "Open notifications",
        })}
      >
        <IconButton
          color="inherit"
          onClick={(event) => setAnchorEl(event.currentTarget)}
          sx={{
            borderRadius: 999,
            border:
              theme.palette.mode === "light"
                ? "1px solid rgba(148,163,184,0.4)"
                : "1px solid rgba(30,64,175,0.9)",
          }}
        >
          <Badge
            color="error"
            badgeContent={unreadCount > 99 ? "99+" : unreadCount}
            invisible={unreadCount <= 0}
          >
            <NotificationsRoundedIcon />
          </Badge>
        </IconButton>
      </Tooltip>

      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={() => setAnchorEl(null)}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        transformOrigin={{ vertical: "top", horizontal: "right" }}
        PaperProps={{
          sx: {
            width: { xs: "min(92vw, 420px)", sm: 420 },
            maxHeight: "70vh",
            p: 0,
            borderRadius: 4,
            overflow: "hidden",
            display: "flex",
            flexDirection: "column",
          },
        }}
      >
        <Box sx={{ p: 2 }}>
          <Stack
            direction="row"
            alignItems="center"
            justifyContent="space-between"
            gap={1}
            mb={0.75}
          >
            <Box>
              <Typography fontWeight={900}>
                {t("menu.title", { defaultValue: "Notifications" })}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {t("menu.subtitle", {
                  defaultValue: "Recent system, reward, streak, and event updates.",
                })}
              </Typography>
            </Box>

            <IconButton
              size="small"
              disabled={actionLoading || items.length === 0}
              onClick={async () => {
                const confirmed = await requestConfirm({
                  title: t("confirm.clearTitle", {
                    defaultValue: "Clear notifications?",
                  }),
                  message: t("confirm.clearMessage", {
                    defaultValue:
                      "This will hide all notifications from your current list.",
                  }),
                  confirmLabel: t("actions.clearAll", {
                    defaultValue: "Clear all",
                  }),
                  variant: "danger",
                });

                if (!confirmed) return;
                const ok = await clearMine();
                if (ok) {
                  setAnchorEl(null);
                }
              }}
            >
              <DeleteSweepRoundedIcon fontSize="small" />
            </IconButton>
          </Stack>

          <Stack direction="row" spacing={1}>
            <Button
              size="small"
              endIcon={<OpenInNewRoundedIcon />}
              onClick={() => {
                setAnchorEl(null);
                navigate("/app/notifications");
              }}
            >
              {t("menu.viewAll", { defaultValue: "View all" })}
            </Button>
          </Stack>
        </Box>

        <Divider />

        <Box
          sx={{
            p: 1.2,
            overflowY: "auto",
            maxHeight: "calc(70vh - 126px)",
          }}
        >
          {loading ? (
            <Stack spacing={1}>
              <Skeleton variant="rounded" height={92} />
              <Skeleton variant="rounded" height={92} />
              <Skeleton variant="rounded" height={92} />
            </Stack>
          ) : previewItems.length === 0 ? (
            <Box sx={{ p: 2 }}>
              <Typography fontWeight={800}>
                {t("empty.title", { defaultValue: "No notifications yet" })}
              </Typography>
              <Typography color="text.secondary">
                {t("empty.description", {
                  defaultValue:
                    "When the platform has updates for you, they will appear here in real time.",
                })}
              </Typography>
            </Box>
          ) : (
            <Stack spacing={1}>
              {previewItems.map((item) => (
                <NotificationCard
                  key={item.id}
                  notification={item}
                  compact
                  onClick={() => {
                    setAnchorEl(null);
                    navigate("/app/notifications");
                  }}
                  onDelete={() => {
                    void deleteMine(item.id);
                  }}
                />
              ))}
            </Stack>
          )}
        </Box>

        {!loading && items.length > previewItems.length ? (
          <>
            <Divider />
            <MenuItem
              onClick={() => {
                setAnchorEl(null);
                navigate("/app/notifications");
              }}
            >
              {t("menu.more", {
                defaultValue: "Show the full notifications center",
              })}
            </MenuItem>
          </>
        ) : null}
      </Menu>
    </>
  );
};

export default NotificationsMenu;
