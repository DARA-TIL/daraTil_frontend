import React from "react";
import {
  Box,
  Button,
  Chip,
  Paper,
  Stack,
  Typography,
} from "@mui/material";
import OpenInNewRoundedIcon from "@mui/icons-material/OpenInNewRounded";
import DeleteOutlineRoundedIcon from "@mui/icons-material/DeleteOutlineRounded";
import AccessTimeRoundedIcon from "@mui/icons-material/AccessTimeRounded";
import VisibilityRoundedIcon from "@mui/icons-material/VisibilityRounded";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import {
  formatNotificationDate,
  getNotificationActionTo,
  getNotificationHeading,
  getNotificationScopeLabel,
  getNotificationTypeLabel,
} from "../model/presentation";
import type { AppNotification } from "../model/types";

type NotificationDetailsPanelProps = {
  notification: AppNotification | null;
  onDelete?: () => void;
};

const NotificationDetailsPanel: React.FC<NotificationDetailsPanelProps> = ({
  notification,
  onDelete,
}) => {
  const { t, i18n } = useTranslation("notifications");
  const navigate = useNavigate();

  if (!notification) {
    return (
      <Paper
        sx={{
          p: 2.5,
          borderRadius: 4,
          border: "1px solid",
          borderColor: "divider",
        }}
      >
        <Stack spacing={1}>
          <Typography variant="h5" fontWeight={900}>
            {t("page.selectTitle", { defaultValue: "Select a notification" })}
          </Typography>
          <Typography color="text.secondary">
            {t("page.selectDescription", {
              defaultValue:
                "Open any item from the list to inspect its full message, timing, and related destination.",
            })}
          </Typography>
        </Stack>
      </Paper>
    );
  }

  const actionTo = getNotificationActionTo(notification);

  return (
    <Paper
      sx={{
        p: 2.5,
        borderRadius: 4,
        border: "1px solid",
        borderColor: "divider",
      }}
    >
      <Stack spacing={2}>
        <Box
          sx={{
            borderRadius: 4,
            p: 2.25,
            color: "#fff",
            backgroundImage:
              "linear-gradient(135deg, rgba(14,116,144,0.94), rgba(30,64,175,0.9), rgba(88,28,135,0.88))",
          }}
        >
          <Stack spacing={1.25}>
            <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
              <Chip
                size="small"
                label={getNotificationTypeLabel(notification.type, t)}
                sx={{ bgcolor: "rgba(255,255,255,0.14)", color: "#fff" }}
              />
              <Chip
                size="small"
                label={getNotificationScopeLabel(notification.scope, t)}
                sx={{ bgcolor: "rgba(255,255,255,0.14)", color: "#fff" }}
              />
            </Stack>

            <Typography variant="h4" fontWeight={900}>
              {getNotificationHeading(notification, t)}
            </Typography>

            <Typography sx={{ whiteSpace: "pre-wrap", opacity: 0.94 }}>
              {notification.message ||
                t("empty.message", {
                  defaultValue: "No additional message.",
                })}
            </Typography>
          </Stack>
        </Box>

        <Stack direction={{ xs: "column", sm: "row" }} spacing={1} useFlexGap flexWrap="wrap">
          <Chip
            icon={<AccessTimeRoundedIcon />}
            label={t("details.createdAt", {
              defaultValue: "Created: {{value}}",
              value: formatNotificationDate(notification.createdAt, i18n.language),
            })}
          />
          <Chip
            icon={<VisibilityRoundedIcon />}
            label={notification.isRead
              ? t("details.readAt", {
                  defaultValue: "Seen: {{value}}",
                  value: formatNotificationDate(
                    notification.readAt || notification.createdAt,
                    i18n.language,
                  ),
                })
              : t("details.unread", {
                  defaultValue: "Not seen yet",
                })}
          />
        </Stack>

        {notification.entityId ? (
          <Typography color="text.secondary">
            {t("details.entityId", {
              defaultValue: "Related entity ID: {{value}}",
              value: notification.entityId,
            })}
          </Typography>
        ) : null}

        <Stack direction={{ xs: "column", md: "row" }} gap={1.25}>
          {actionTo ? (
            <Button
              variant="contained"
              startIcon={<OpenInNewRoundedIcon />}
              onClick={() => navigate(actionTo)}
            >
              {t("actions.openRelated", {
                defaultValue: "Open related page",
              })}
            </Button>
          ) : null}

          {onDelete ? (
            <Button
              variant="outlined"
              color="error"
              startIcon={<DeleteOutlineRoundedIcon />}
              onClick={onDelete}
            >
              {t("actions.remove", { defaultValue: "Remove" })}
            </Button>
          ) : null}
        </Stack>
      </Stack>
    </Paper>
  );
};

export default NotificationDetailsPanel;
