import React from "react";
import {
  Box,
  Chip,
  IconButton,
  Paper,
  Stack,
  Typography,
} from "@mui/material";
import CampaignRoundedIcon from "@mui/icons-material/CampaignRounded";
import EventAvailableRoundedIcon from "@mui/icons-material/EventAvailableRounded";
import LocalFireDepartmentRoundedIcon from "@mui/icons-material/LocalFireDepartmentRounded";
import WorkspacePremiumRoundedIcon from "@mui/icons-material/WorkspacePremiumRounded";
import LogoutRoundedIcon from "@mui/icons-material/LogoutRounded";
import DeleteOutlineRoundedIcon from "@mui/icons-material/DeleteOutlineRounded";
import { alpha, useTheme, type Theme } from "@mui/material/styles";
import { useTranslation } from "react-i18next";
import {
  formatNotificationDate,
  getNotificationChipColor,
  getNotificationHeading,
  getNotificationScopeLabel,
  getNotificationTypeLabel,
} from "../model/presentation";
import type { AppNotification } from "../model/types";

type NotificationCardProps = {
  notification: AppNotification;
  compact?: boolean;
  selected?: boolean;
  onClick?: () => void;
  onDelete?: () => void;
};

function NotificationTypeIcon({ type }: { type: AppNotification["type"] }) {
  if (type === "event") return <EventAvailableRoundedIcon fontSize="small" />;
  if (type === "streak") return <LocalFireDepartmentRoundedIcon fontSize="small" />;
  if (type === "reward") {
    return <WorkspacePremiumRoundedIcon fontSize="small" />;
  }
  if (type === "logOut") return <LogoutRoundedIcon fontSize="small" />;
  return <CampaignRoundedIcon fontSize="small" />;
}

function getNotificationAccent(type: AppNotification["type"], theme: Theme) {
  if (type === "reward") return theme.palette.success.main;
  if (type === "streak") return theme.palette.warning.main;
  if (type === "event") return theme.palette.primary.main;
  if (type === "logOut") return theme.palette.error.main;
  return theme.palette.info.main;
}

const NotificationCard: React.FC<NotificationCardProps> = ({
  notification,
  compact = false,
  selected = false,
  onClick,
  onDelete,
}) => {
  const theme = useTheme();
  const { t, i18n } = useTranslation("notifications");

  const heading = getNotificationHeading(notification, t);
  const typeLabel = getNotificationTypeLabel(notification.type, t);
  const scopeLabel = getNotificationScopeLabel(notification.scope, t);
  const isUnread = !notification.isRead;

  return (
    <Paper
      variant="outlined"
      onClick={onClick}
      sx={{
        p: compact ? 1.25 : 1.6,
        borderRadius: 3,
        cursor: onClick ? "pointer" : "default",
        borderColor: selected
          ? theme.palette.primary.main
          : isUnread
            ? alpha(theme.palette.primary.main, 0.5)
            : theme.customColors.sidebarBorder,
        backgroundImage: selected
          ? theme.gradients.cardSoft
          : isUnread
            ? `linear-gradient(135deg, ${alpha(
                theme.palette.primary.main,
                0.12,
              )}, ${alpha(theme.palette.background.paper, 0.96)})`
            : "none",
        transition:
          "transform 0.18s ease, border-color 0.18s ease, box-shadow 0.18s ease",
        "&:hover": onClick
          ? {
              transform: "translateY(-1px)",
              boxShadow: `0 12px 28px ${alpha(theme.palette.common.black, 0.18)}`,
            }
          : undefined,
      }}
    >
      <Stack spacing={compact ? 1 : 1.2}>
        <Stack
          direction="row"
          justifyContent="space-between"
          gap={1}
          alignItems="flex-start"
        >
          <Stack direction="row" spacing={1.1} sx={{ minWidth: 0, flex: 1 }}>
            <Box
              sx={{
                mt: 0.2,
                color: getNotificationAccent(notification.type, theme),
              }}
            >
              <NotificationTypeIcon type={notification.type} />
            </Box>

            <Box sx={{ minWidth: 0, flex: 1 }}>
              <Typography fontWeight={900} sx={{ wordBreak: "break-word" }}>
                {heading}
              </Typography>
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ whiteSpace: "pre-wrap", wordBreak: "break-word" }}
              >
                {notification.message ||
                  t("empty.message", {
                    defaultValue: "No additional message.",
                  })}
              </Typography>
            </Box>
          </Stack>

          {onDelete ? (
            <IconButton
              size="small"
              onClick={(event) => {
                event.stopPropagation();
                onDelete();
              }}
            >
              <DeleteOutlineRoundedIcon fontSize="small" />
            </IconButton>
          ) : null}
        </Stack>

        <Stack
          direction="row"
          spacing={1}
          flexWrap="wrap"
          useFlexGap
          alignItems="center"
        >
          <Chip
            size="small"
            color={getNotificationChipColor(notification.type)}
            label={typeLabel}
          />
          {!compact ? (
            <Chip size="small" variant="outlined" label={scopeLabel} />
          ) : null}
          {isUnread ? (
            <Chip
              size="small"
              color="primary"
              variant="outlined"
              label={t("states.new", { defaultValue: "New" })}
            />
          ) : (
            <Chip
              size="small"
              variant="outlined"
              label={t("states.seen", { defaultValue: "Seen" })}
            />
          )}
        </Stack>

        <Typography variant="caption" color="text.secondary">
          {formatNotificationDate(notification.createdAt, i18n.language)}
        </Typography>
      </Stack>
    </Paper>
  );
};

export default NotificationCard;
