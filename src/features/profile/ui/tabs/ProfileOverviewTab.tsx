import React, { useEffect, useMemo, useState } from "react";
import {
  Autocomplete,
  Avatar,
  Box,
  Button,
  Chip,
  Grid,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { useTranslation } from "react-i18next";
import EmojiEventsOutlinedIcon from "@mui/icons-material/EmojiEventsOutlined";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import SaveOutlinedIcon from "@mui/icons-material/SaveOutlined";

import type { Achievement } from "@/features/achievements/model/types";
import { useAchievementsStore } from "@/features/achievements/store/useAchievementsStore";
import { useAuthStore } from "@/features/auth/store/useAuthStore";
import { useUserProfileStore } from "@/features/profile/store/useUserProfileStore";
import { useUiStore } from "@/shared/store/useUiStore";
import ProfileSectionCard from "../ProfileSectionCard";

function areEqualIdLists(left: number[], right: number[]): boolean {
  if (left.length !== right.length) return false;

  const leftSorted = [...left].sort((a, b) => a - b);
  const rightSorted = [...right].sort((a, b) => a - b);

  return leftSorted.every((value, index) => value === rightSorted[index]);
}

function isAchievementUnlocked(
  achievement: Achievement,
  userId: number,
): boolean {
  return achievement.userAchievements.some(
    (progress) =>
      Number(progress.userId) === Number(userId) && Boolean(progress.achieved),
  );
}

const ProfileOverviewTab: React.FC = () => {
  const theme = useTheme();
  const { t } = useTranslation("profile");
  const user = useAuthStore((s) => s.user);
  const updateProfile = useAuthStore((s) => s.updateProfile);
  const profile = useUserProfileStore((s) => s.profile);
  const profileLoading = useUserProfileStore((s) => s.loading);
  const profileSaving = useUserProfileStore((s) => s.saving);
  const updatePinnedAchievements = useUserProfileStore(
    (s) => s.updatePinnedAchievements,
  );
  const achievements = useAchievementsStore((s) => s.items);
  const achievementsLoading = useAchievementsStore((s) => s.loading);
  const showSnackbar = useUiStore((s) => s.showSnackbar);

  const [username, setUsername] = useState(user?.username ?? "");
  const [avatar, setAvatar] = useState(user?.avatar ?? "");
  const [selectedPinnedIds, setSelectedPinnedIds] = useState<number[]>([]);
  const [edit, setEdit] = useState(false);

  useEffect(() => {
    if (!user) return;
    setUsername(user.username ?? "");
    setAvatar(user.avatar ?? "");
  }, [user]);

  useEffect(() => {
    setSelectedPinnedIds(profile?.pinnedAchievements.map((item) => item.id) ?? []);
  }, [profile]);

  const level = user?.progress?.level ?? 0;
  const xpTotal = user?.progress?.xpTotal ?? 0;
  const currentStreak = user?.streak?.currentStreak ?? 0;
  const longestStreak = user?.streak?.longestStreak ?? 0;
  const lessonsCompleted = profile?.lessonsCompleted ?? 0;
  const wordsLearned = profile?.wordsLearned ?? 0;
  const pinnedAchievements = useMemo(
    () => profile?.pinnedAchievements ?? [],
    [profile?.pinnedAchievements],
  );

  const currentPinnedIds = useMemo(
    () => pinnedAchievements.map((item) => item.id),
    [pinnedAchievements],
  );

  const availableAchievements = useMemo(() => {
    if (!user?.id) return achievements;

    return achievements
      .filter((achievement) => isAchievementUnlocked(achievement, user.id))
      .sort((left, right) => {
      const leftPinned = selectedPinnedIds.includes(left.id) ? 1 : 0;
      const rightPinned = selectedPinnedIds.includes(right.id) ? 1 : 0;
      if (leftPinned !== rightPinned) return rightPinned - leftPinned;

      const leftUnlocked = isAchievementUnlocked(left, user.id) ? 1 : 0;
      const rightUnlocked = isAchievementUnlocked(right, user.id) ? 1 : 0;
      if (leftUnlocked !== rightUnlocked) return rightUnlocked - leftUnlocked;

      return left.name.localeCompare(right.name);
      });
  }, [achievements, selectedPinnedIds, user?.id]);

  const selectedAchievements = useMemo(() => {
    const map = new Map<number, Achievement>();

    for (const item of pinnedAchievements) {
      map.set(item.id, item);
    }
    for (const item of achievements) {
      map.set(item.id, item);
    }

    return selectedPinnedIds
      .map((id) => map.get(id))
      .filter((item): item is Achievement => Boolean(item));
  }, [achievements, pinnedAchievements, selectedPinnedIds]);

  const stats = useMemo(
    () => [
      { label: t("cards.completedLessons"), value: lessonsCompleted },
      { label: t("cards.wordsLearned"), value: wordsLearned },
      { label: t("cards.pinnedAchievements"), value: pinnedAchievements.length },
      {
        label: t("cards.profileStreak", { defaultValue: "Streak" }),
        value: t("cards.streakCurrentValue", {
          count: currentStreak,
          defaultValue: "{{count}} days",
        }),
      },
      {
        label: t("cards.profileLongestStreak", {
          defaultValue: "Longest streak",
        }),
        value: t("cards.streakLongestValue", {
          count: longestStreak,
          defaultValue: "{{count}} days",
        }),
      },
    ],
    [
      currentStreak,
      lessonsCompleted,
      longestStreak,
      pinnedAchievements.length,
      t,
      wordsLearned,
    ],
  );

  if (!user) return null;

  const hasAccountChanges =
    username.trim() !== (user.username ?? "") ||
    avatar.trim() !== (user.avatar ?? "");
  const hasPinnedChanges = !areEqualIdLists(selectedPinnedIds, currentPinnedIds);
  const pinnedSelectionValid =
    !hasPinnedChanges ||
    (selectedPinnedIds.length > 0 && selectedPinnedIds.length <= 3);
  const saveDisabled =
    !edit ||
    profileSaving ||
    (!hasAccountChanges && !hasPinnedChanges) ||
    !pinnedSelectionValid;

  const resetForm = () => {
    setUsername(user.username ?? "");
    setAvatar(user.avatar ?? "");
    setSelectedPinnedIds(currentPinnedIds);
    setEdit(false);
  };

  const onSave = async () => {
    let success = true;

    if (hasAccountChanges) {
      const updated = await updateProfile({
        username: username.trim(),
        avatar: avatar.trim(),
      });
      success = Boolean(updated) && success;
    }

    if (hasPinnedChanges) {
      if (selectedPinnedIds.length === 0) {
        showSnackbar(
          t("messages.pinnedRequired", {
            defaultValue: "Select at least one pinned achievement",
          }),
          "warning",
        );
        return;
      }

      if (selectedPinnedIds.length > 3) {
        showSnackbar(
          t("messages.pinnedLimit", {
            defaultValue: "You can pin up to 3 achievements",
          }),
          "warning",
        );
        return;
      }

      const pinnedUpdated = await updatePinnedAchievements(selectedPinnedIds);
      success = pinnedUpdated && success;
    }

    if (success) {
      setEdit(false);
    }
  };

  return (
    <Grid container spacing={3}>
      <Grid size={{ xs: 12 }}>
        <ProfileSectionCard
          variant="hero"
          sx={{ overflow: "hidden", position: "relative" }}
        >
          <Box
            sx={{
              position: "absolute",
              top: -60,
              right: -60,
              width: 220,
              height: 220,
              borderRadius: "50%",
              background:
                "radial-gradient(circle at 30% 30%, rgba(255,255,255,0.22), transparent 60%)",
              pointerEvents: "none",
            }}
          />

          <Stack
            direction={{ xs: "column", md: "row" }}
            spacing={3}
            alignItems={{ xs: "flex-start", md: "center" }}
            justifyContent="space-between"
          >
            <Stack direction="row" spacing={2.5} alignItems="center">
              <Avatar
                src={avatar || user.avatar}
                sx={{
                  width: 96,
                  height: 96,
                  fontSize: 36,
                  fontWeight: 800,
                  background: "rgba(255,255,255,0.18)",
                  border: "2px solid rgba(255,255,255,0.35)",
                  boxShadow: "0 18px 40px rgba(0,0,0,0.25)",
                }}
              >
                {user.username.charAt(0).toUpperCase()}
              </Avatar>

              <Box>
                <Typography variant="h6" fontWeight={900}>
                  {user.username}
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.9 }}>
                  {user.email}
                </Typography>

                <Stack
                  direction="row"
                  spacing={1}
                  mt={1.25}
                  flexWrap="wrap"
                  useFlexGap
                >
                  <Chip
                    label={`${t("cards.levelLabel", { defaultValue: "Level" })} ${level}`}
                    sx={{ background: "rgba(255,255,255,0.20)", color: "#fff" }}
                  />
                  <Chip
                    label={`${xpTotal} XP`}
                    sx={{ background: "rgba(255,255,255,0.20)", color: "#fff" }}
                  />
                  <Chip
                    label={t("cards.streakCurrentValue", {
                      count: currentStreak,
                      defaultValue: "{{count}} days",
                    })}
                    sx={{ background: "rgba(255,255,255,0.20)", color: "#fff" }}
                  />
                  <Chip
                    label={`${t("cards.pinnedAchievements")} ${pinnedAchievements.length}`}
                    sx={{ background: "rgba(255,255,255,0.20)", color: "#fff" }}
                  />
                </Stack>
              </Box>
            </Stack>

            <Stack direction="row" spacing={1.25}>
              <Button
                variant="contained"
                startIcon={<EditOutlinedIcon />}
                onClick={edit ? resetForm : () => setEdit(true)}
                sx={{
                  background: "rgba(255,255,255,0.92)",
                  color: "#0f172a",
                  boxShadow: "0 14px 30px rgba(0,0,0,0.18)",
                }}
              >
                {edit
                  ? t("overview.cancel", { defaultValue: "Cancel" })
                  : t("overview.edit", { defaultValue: "Edit profile" })}
              </Button>

              <Button
                variant="contained"
                startIcon={<SaveOutlinedIcon />}
                disabled={saveDisabled}
                onClick={onSave}
                sx={{
                  background: "rgba(15,23,42,0.85)",
                  color: "#fff",
                  boxShadow: "0 14px 30px rgba(0,0,0,0.22)",
                }}
              >
                {t("overview.save", { defaultValue: "Save changes" })}
              </Button>
            </Stack>
          </Stack>

          {edit && (
            <Stack spacing={2} mt={3} sx={{ maxWidth: 720 }}>
              <TextField
                label={t("overview.username", { defaultValue: "Username" })}
                value={username}
                onChange={(event) => setUsername(event.target.value)}
                fullWidth
                sx={{
                  "& .MuiOutlinedInput-root": {
                    backgroundColor: "rgba(255,255,255,0.10)",
                  },
                  "& .MuiInputLabel-root": { color: "rgba(255,255,255,0.85)" },
                  "& .MuiOutlinedInput-input": { color: "#fff" },
                }}
              />

              <TextField
                label={t("overview.avatar", { defaultValue: "Avatar URL" })}
                value={avatar}
                onChange={(event) => setAvatar(event.target.value)}
                fullWidth
                sx={{
                  "& .MuiOutlinedInput-root": {
                    backgroundColor: "rgba(255,255,255,0.10)",
                  },
                  "& .MuiInputLabel-root": { color: "rgba(255,255,255,0.85)" },
                  "& .MuiOutlinedInput-input": { color: "#fff" },
                }}
              />

              <Autocomplete
                multiple
                options={availableAchievements}
                value={selectedAchievements}
                loading={achievementsLoading}
                getOptionKey={(option) => option.id}
                isOptionEqualToValue={(option, value) => option.id === value.id}
                getOptionLabel={(option) => option.name}
                onChange={(_, value) => {
                  const nextIds = Array.from(new Set(value.map((item) => item.id)));

                  if (nextIds.length > 3) {
                    showSnackbar(
                      t("messages.pinnedLimit", {
                        defaultValue: "You can pin up to 3 achievements",
                      }),
                      "warning",
                    );
                    return;
                  }

                  setSelectedPinnedIds(nextIds);
                }}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label={t("overview.selectionLabel", {
                      defaultValue: "Pinned achievements",
                    })}
                    placeholder={t("overview.selectionPlaceholder", {
                      defaultValue: "Select achievements",
                    })}
                    helperText={
                      availableAchievements.length === 0
                        ? t("overview.selectionEmpty", {
                            defaultValue:
                              "Only unlocked achievements can be pinned. No unlocked achievements are available yet.",
                          })
                        : t("overview.selectionHelper", {
                            defaultValue:
                              "Select 1 to 3 unlocked achievements. Changes will be saved after you press Save.",
                          })
                    }
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        backgroundColor: "rgba(255,255,255,0.10)",
                      },
                      "& .MuiInputLabel-root": {
                        color: "rgba(255,255,255,0.85)",
                      },
                      "& .MuiOutlinedInput-input": { color: "#fff" },
                      "& .MuiFormHelperText-root": {
                        color: "rgba(255,255,255,0.75)",
                      },
                    }}
                  />
                )}
                renderOption={(props, option) => {
                  const unlocked = isAchievementUnlocked(option, user.id);
                  const { key, ...optionProps } = props;

                  return (
                    <Box component="li" key={key} {...optionProps}>
                      <Stack spacing={0.25} sx={{ width: "100%" }}>
                        <Stack
                          direction="row"
                          justifyContent="space-between"
                          spacing={1}
                          alignItems="center"
                        >
                          <Typography fontWeight={700}>{option.name}</Typography>
                          <Chip
                            size="small"
                            color={unlocked ? "success" : "default"}
                            label={t(
                              unlocked
                                ? "overview.achieved"
                                : "overview.inProgress",
                              {
                                defaultValue: unlocked
                                  ? "Unlocked"
                                  : "In progress",
                              },
                            )}
                          />
                        </Stack>
                        <Typography variant="body2" color="text.secondary">
                          {option.description}
                        </Typography>
                      </Stack>
                    </Box>
                  );
                }}
              />
            </Stack>
          )}
        </ProfileSectionCard>
      </Grid>

      <Grid size={{ xs: 12, md: 7 }}>
        <ProfileSectionCard>
          <Typography fontWeight={800} mb={2}>
            {t("overview.quickStats", { defaultValue: "Quick stats" })}
          </Typography>

          {!profile && profileLoading && (
            <Typography variant="body2" color="text.secondary" mb={2}>
              {t("overview.loading", {
                defaultValue: "Loading profile details...",
              })}
            </Typography>
          )}

          {!profile && !profileLoading && (
            <Typography variant="body2" color="text.secondary" mb={2}>
              {t("messages.profileUnavailable", {
                defaultValue: "Profile statistics are not available yet.",
              })}
            </Typography>
          )}

          <Grid container spacing={2}>
            {stats.map((item) => (
              <Grid key={item.label} size={{ xs: 12, sm: 6 }}>
                <Box
                  sx={{
                    p: 2,
                    borderRadius: 3,
                    border: "1px solid",
                    borderColor: theme.customColors.sidebarBorder,
                    backgroundColor:
                      theme.palette.mode === "light"
                        ? "rgba(255,255,255,0.85)"
                        : "rgba(15,23,42,0.55)",
                  }}
                >
                  <Typography variant="body2" color="text.secondary">
                    {item.label}
                  </Typography>
                  <Typography fontWeight={900} fontSize={18}>
                    {item.value}
                  </Typography>
                </Box>
              </Grid>
            ))}
          </Grid>
        </ProfileSectionCard>
      </Grid>

      <Grid size={{ xs: 12, md: 5 }}>
        <ProfileSectionCard>
          <Stack direction="row" spacing={1} alignItems="center" mb={1}>
            <EmojiEventsOutlinedIcon />
            <Typography fontWeight={800}>
              {t("overview.pinnedTitle", {
                defaultValue: "Pinned achievements",
              })}
            </Typography>
          </Stack>

          <Typography variant="body2" color="text.secondary" mb={2}>
            {t("overview.pinnedSubtitle", {
              defaultValue:
                "Choose the achievements that should stay visible on your profile.",
            })}
          </Typography>

          {!pinnedAchievements.length ? (
            <Typography variant="body2" color="text.secondary">
              {t("overview.pinnedEmpty", {
                defaultValue: "You have not pinned any achievements yet.",
              })}
            </Typography>
          ) : (
            <Stack spacing={1.25}>
              {pinnedAchievements.map((achievement) => (
                <Box
                  key={achievement.id}
                  sx={{
                    p: 1.5,
                    borderRadius: 3,
                    border: "1px solid",
                    borderColor: theme.customColors.sidebarBorder,
                    backgroundColor:
                      theme.palette.mode === "light"
                        ? "rgba(255,255,255,0.85)"
                        : "rgba(15,23,42,0.55)",
                  }}
                >
                  <Stack direction="row" spacing={1.25} alignItems="flex-start">
                    <Avatar
                      src={achievement.iconUrl ?? undefined}
                      variant="rounded"
                      sx={{
                        width: 48,
                        height: 48,
                        backgroundColor:
                          theme.palette.mode === "light"
                            ? "rgba(59,130,246,0.10)"
                            : "rgba(59,130,246,0.22)",
                      }}
                    >
                      <EmojiEventsOutlinedIcon fontSize="small" />
                    </Avatar>

                    <Box sx={{ minWidth: 0 }}>
                      <Typography fontWeight={800}>{achievement.name}</Typography>
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{
                          display: "-webkit-box",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          WebkitBoxOrient: "vertical",
                          WebkitLineClamp: 2,
                        }}
                      >
                        {achievement.description}
                      </Typography>
                    </Box>
                  </Stack>
                </Box>
              ))}
            </Stack>
          )}
        </ProfileSectionCard>
      </Grid>
    </Grid>
  );
};

export default ProfileOverviewTab;
