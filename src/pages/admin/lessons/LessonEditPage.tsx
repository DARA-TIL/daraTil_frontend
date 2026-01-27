import React, { useEffect, useMemo, useState } from "react";
import {
  Box,
  Button,
  Divider,
  IconButton,
  MenuItem,
  Paper,
  Stack,
  Tab,
  Tabs,
  TextField,
  Typography,
  useTheme,
} from "@mui/material";
import { useNavigate, useParams } from "react-router-dom";
import type {
  LessonBlock,
  LessonBlockType,
} from "@/features/lessons/model/types";
import { useUiStore } from "@/shared/store/useUiStore";
import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward";
import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward";
import EditIcon from "@mui/icons-material/Edit";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import AddIcon from "@mui/icons-material/Add";
import FileUploadField from "@/widgets/fileUpload/FileUploadField";
import { uploadToCloudinary } from "@/shared/services/cloudinary";
import { useLessonsAdminStore } from "@/features/lessons/store/useLessonAdminStore";

const BLOCK_TYPES: LessonBlockType[] = [
  "text",
  "image",
  "audio",
  "video",
  "youtube",
];

function isTextBlock(t: string) {
  return String(t).toLowerCase() === "text";
}

const LessonEditPage: React.FC = () => {
  const theme = useTheme();
  const nav = useNavigate();
  const { id } = useParams();
  const lessonId = useMemo(() => Number(id), [id]);

  const showSnackbar = useUiStore((s) => s.showSnackbar);

  const loading = useLessonsAdminStore((s) => s.loading);
  const selected = useLessonsAdminStore((s) => s.selected);
  const fetchById = useLessonsAdminStore((s) => s.fetchById);
  const update = useLessonsAdminStore((s) => s.update);

  const createBlock = useLessonsAdminStore((s) => s.createBlock);
  const updateBlock = useLessonsAdminStore((s) => s.updateBlock);
  const deleteBlock = useLessonsAdminStore((s) => s.deleteBlock);
  const moveUp = useLessonsAdminStore((s) => s.moveBlockUp);
  const moveDown = useLessonsAdminStore((s) => s.moveBlockDown);

  const [tab, setTab] = useState(0);

  // local editable metadata state
  const [meta, setMeta] = useState({
    name: "",
    description: "",
    author: "",
    reward: 0,
    requiredLevel: 0,
    imageUrl: "" as string | null,
  });

  useEffect(() => {
    if (!lessonId || Number.isNaN(lessonId)) return;
    fetchById(lessonId);
  }, [lessonId, fetchById]);

  useEffect(() => {
    if (!selected) return;
    setMeta({
      name: selected.name ?? "",
      description: selected.description ?? "",
      author: selected.author ?? "",
      reward: selected.reward ?? 0,
      requiredLevel: selected.requiredLevel ?? 0,
      imageUrl: selected.imageUrl ?? null,
    });
  }, [selected]);

  // lesson image upload
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imageUploading, setImageUploading] = useState(false);

  const validateImage = (file: File): string | null => {
    const maxMb = 5;
    const sizeMb = file.size / (1024 * 1024);
    const type = (file.type || "").toLowerCase();
    if (!type.startsWith("image/")) return "Please select an image file.";
    if (sizeMb > maxMb) return `Image is too large (max ${maxMb}MB).`;
    return null;
  };

  const uploadLessonImageIfNeeded = async (): Promise<string | null> => {
    if (!imageFile) return meta.imageUrl ?? null;

    const err = validateImage(imageFile);
    if (err) {
      showSnackbar(err, "warning");
      return null;
    }

    try {
      setImageUploading(true);
      const res = await uploadToCloudinary(imageFile, {
        kind: "image",
        folder: "daratil/lessons/images",
      });
      setMeta((s) => ({ ...s, imageUrl: res.secureUrl }));
      return res.secureUrl;
    } catch {
      showSnackbar("Image upload failed. Please try again.", "error");
      return null;
    } finally {
      setImageUploading(false);
    }
  };

  // block dialogs (inline minimal)
  const [creating, setCreating] = useState(false);
  const [editing, setEditing] = useState<LessonBlock | null>(null);

  const [blockDraft, setBlockDraft] = useState({
    name: "",
    type: "text" as LessonBlockType,
    contentText: "",
    contentUrl: "",
    position: 1,
  });

  const resetBlockDraft = (pos: number) =>
    setBlockDraft({
      name: "",
      type: "text",
      contentText: "",
      contentUrl: "",
      position: pos,
    });

  const blocks = useMemo(() => {
    const b = selected?.blocks ?? [];
    return [...b].sort((a, b) => (a.position ?? 0) - (b.position ?? 0));
  }, [selected?.blocks]);

  const nextPosition =
    (blocks.length ? blocks[blocks.length - 1].position + 1 : 1) || 1;

  // media upload for blocks
  const [blockFile, setBlockFile] = useState<File | null>(null);
  const [blockUploading, setBlockUploading] = useState(false);

  const validateBlockFile = (
    file: File,
    kind: "image" | "media",
  ): string | null => {
    const maxImageMb = 5;
    const maxMediaMb = 20;

    const sizeMb = file.size / (1024 * 1024);
    const type = (file.type || "").toLowerCase();

    if (kind === "image") {
      if (!type.startsWith("image/")) return "Please select an image file.";
      if (sizeMb > maxImageMb)
        return `Image is too large (max ${maxImageMb}MB).`;
    } else {
      if (!(type.startsWith("audio/") || type.startsWith("video/")))
        return "Please select an audio or video file.";
      if (sizeMb > maxMediaMb)
        return `Media is too large (max ${maxMediaMb}MB).`;
    }

    return null;
  };

  const uploadBlockFileIfNeeded = async (
    type: LessonBlockType,
  ): Promise<string | null> => {
    if (!blockFile)
      return blockDraft.contentUrl?.trim()
        ? blockDraft.contentUrl.trim()
        : null;

    const kind = String(type).toLowerCase() === "image" ? "image" : "media";
    const err = validateBlockFile(blockFile, kind);
    if (err) {
      showSnackbar(err, "warning");
      return null;
    }

    try {
      setBlockUploading(true);
      const res = await uploadToCloudinary(blockFile, {
        kind: kind === "image" ? "image" : "video",
        folder:
          kind === "image"
            ? "daratil/lessons/blocks/images"
            : "daratil/lessons/blocks/media",
      });
      setBlockDraft((s) => ({ ...s, contentUrl: res.secureUrl }));
      return res.secureUrl;
    } catch {
      showSnackbar("Upload failed. Please try again.", "error");
      return null;
    } finally {
      setBlockUploading(false);
    }
  };

  const busy = loading || imageUploading || blockUploading;

  if (!selected) {
    return (
      <Box>
        <Typography variant="h5" fontWeight={900}>
          Edit lesson
        </Typography>
        <Typography color="text.secondary" sx={{ mt: 1 }}>
          Loading...
        </Typography>
      </Box>
    );
  }

  return (
    <Box>
      <Stack
        direction="row"
        alignItems="center"
        justifyContent="space-between"
        mb={2}
        gap={2}
      >
        <Box sx={{ minWidth: 0 }}>
          <Typography variant="h5" fontWeight={900} noWrap>
            Edit lesson #{selected.ID} - {selected.name}
          </Typography>
          <Typography color="text.secondary">
            Manage metadata and ordered blocks
          </Typography>
        </Box>

        <Stack direction="row" gap={1} flexShrink={0}>
          <Button
            variant="outlined"
            onClick={() => nav("/app/admin/lessons")}
            disabled={busy}
          >
            Back
          </Button>
          <Button
            variant="contained"
            onClick={() => nav(`/app/lessons/${selected.ID}`)}
            disabled={busy}
          >
            Open as user
          </Button>
        </Stack>
      </Stack>

      <Paper
        sx={{
          border: "1px solid",
          borderColor: theme.customColors.sidebarBorder,
          backgroundColor: "background.paper",
          overflow: "hidden",
        }}
      >
        <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ px: 1.5 }}>
          <Tab label="Metadata" />
          <Tab label={`Blocks (${blocks.length})`} />
        </Tabs>
        <Divider />

        {/* METADATA TAB */}
        {tab === 0 && (
          <Box sx={{ p: 2.2 }}>
            <Stack gap={2}>
              <Stack direction={{ xs: "column", md: "row" }} gap={2}>
                <TextField
                  label="Name"
                  value={meta.name}
                  onChange={(e) =>
                    setMeta((s) => ({ ...s, name: e.target.value }))
                  }
                  fullWidth
                />
                <TextField
                  label="Author"
                  value={meta.author}
                  onChange={(e) =>
                    setMeta((s) => ({ ...s, author: e.target.value }))
                  }
                  fullWidth
                />
              </Stack>

              <TextField
                label="Description"
                value={meta.description}
                onChange={(e) =>
                  setMeta((s) => ({ ...s, description: e.target.value }))
                }
                fullWidth
                multiline
                minRows={4}
              />

              <Stack direction={{ xs: "column", md: "row" }} gap={2}>
                <TextField
                  label="Reward (XP)"
                  value={meta.reward}
                  onChange={(e) =>
                    setMeta((s) => ({
                      ...s,
                      reward: Number(e.target.value) || 0,
                    }))
                  }
                  type="number"
                  sx={{ minWidth: { md: 220 } }}
                />
                <TextField
                  label="Required level"
                  value={meta.requiredLevel}
                  onChange={(e) =>
                    setMeta((s) => ({
                      ...s,
                      requiredLevel: Number(e.target.value) || 0,
                    }))
                  }
                  type="number"
                  sx={{ minWidth: { md: 220 } }}
                />
              </Stack>

              <FileUploadField
                label="Lesson image"
                urlValue={meta.imageUrl ?? ""}
                onUrlChange={(v) =>
                  setMeta((s) => ({
                    ...s,
                    imageUrl: v.trim() ? v.trim() : null,
                  }))
                }
                file={imageFile}
                onFileChange={setImageFile}
                uploading={imageUploading}
                uploadedUrl={meta.imageUrl ?? null}
                accept="image/*"
                helperText="Paste URL or upload. Upload will be sent to Cloudinary."
              />

              <Stack direction="row" gap={1} justifyContent="flex-end">
                <Button
                  variant="contained"
                  disabled={busy}
                  onClick={async () => {
                    if (!meta.name.trim()) {
                      showSnackbar("Name is required", "warning");
                      return;
                    }

                    const img = await uploadLessonImageIfNeeded();
                    if (imageFile && !img) return;

                    const ok = await update(selected.ID, {
                      name: meta.name.trim(),
                      author: meta.author.trim(),
                      description: meta.description.trim(),
                      reward: meta.reward,
                      requiredLevel: meta.requiredLevel,
                      imageUrl: img ?? meta.imageUrl ?? null,
                    });

                    if (ok) showSnackbar("Saved", "success");
                    else showSnackbar("Save failed", "error");
                  }}
                  sx={{ boxShadow: "0 10px 24px rgba(15,23,42,0.25)" }}
                >
                  Save
                </Button>
              </Stack>
            </Stack>
          </Box>
        )}

        {/* BLOCKS TAB */}
        {tab === 1 && (
          <Box sx={{ p: 2.2 }}>
            <Stack
              direction={{ xs: "column", md: "row" }}
              alignItems={{ xs: "stretch", md: "center" }}
              justifyContent="space-between"
              gap={2}
              mb={2}
            >
              <Box>
                <Typography fontWeight={900}>Lesson blocks</Typography>
                <Typography color="text.secondary">
                  Positions are always normalized by backend (1..N).
                </Typography>
              </Box>

              <Button
                variant="contained"
                startIcon={<AddIcon />}
                disabled={busy}
                onClick={() => {
                  resetBlockDraft(nextPosition);
                  setBlockFile(null);
                  setCreating(true);
                }}
                sx={{ boxShadow: "0 10px 24px rgba(15,23,42,0.25)" }}
              >
                Add block
              </Button>
            </Stack>

            {/* Create/Edit panel */}
            {(creating || editing) && (
              <Paper
                elevation={0}
                sx={{
                  p: 2,
                  mb: 2,
                  borderRadius: 4,
                  border: "1px solid",
                  borderColor: theme.customColors.sidebarBorder,
                  backgroundImage: theme.gradients.cardSoft,
                }}
              >
                <Stack
                  direction="row"
                  alignItems="center"
                  justifyContent="space-between"
                  mb={1}
                >
                  <Typography fontWeight={900}>
                    {editing ? `Edit block #${editing.id}` : "Create block"}
                  </Typography>

                  <Button
                    variant="text"
                    color="inherit"
                    onClick={() => {
                      setCreating(false);
                      setEditing(null);
                      setBlockFile(null);
                    }}
                  >
                    Close
                  </Button>
                </Stack>

                <Stack gap={2}>
                  <Stack direction={{ xs: "column", md: "row" }} gap={2}>
                    <TextField
                      label="Title"
                      value={blockDraft.name}
                      onChange={(e) =>
                        setBlockDraft((s) => ({ ...s, name: e.target.value }))
                      }
                      fullWidth
                    />

                    <TextField
                      label="Type"
                      value={blockDraft.type}
                      onChange={(e) => {
                        const v = e.target.value as LessonBlockType;
                        setBlockDraft((s) => ({ ...s, type: v }));
                        setBlockFile(null);
                      }}
                      select
                      sx={{ minWidth: { md: 220 } }}
                    >
                      {BLOCK_TYPES.map((t) => (
                        <MenuItem key={t} value={t}>
                          {t}
                        </MenuItem>
                      ))}
                    </TextField>

                    <TextField
                      label="Position"
                      value={blockDraft.position}
                      onChange={(e) =>
                        setBlockDraft((s) => ({
                          ...s,
                          position: Number(e.target.value) || 1,
                        }))
                      }
                      type="number"
                      sx={{ minWidth: { md: 180 } }}
                      helperText="If occupied, backend swaps and normalizes."
                    />
                  </Stack>

                  {blockDraft.type === "text" ? (
                    <TextField
                      label="Text content"
                      value={blockDraft.contentText}
                      onChange={(e) =>
                        setBlockDraft((s) => ({
                          ...s,
                          contentText: e.target.value,
                        }))
                      }
                      fullWidth
                      multiline
                      minRows={5}
                    />
                  ) : blockDraft.type === "youtube" ? (
                    <>
                      <TextField
                        label="YouTube URL"
                        value={blockDraft.contentUrl}
                        onChange={(e) =>
                          setBlockDraft((s) => ({
                            ...s,
                            contentUrl: e.target.value,
                          }))
                        }
                        fullWidth
                        helperText="Paste YouTube link (youtube.com or youtu.be)"
                      />

                      <TextField
                        label="Caption (optional)"
                        value={blockDraft.contentText}
                        onChange={(e) =>
                          setBlockDraft((s) => ({
                            ...s,
                            contentText: e.target.value,
                          }))
                        }
                        fullWidth
                        multiline
                        minRows={2}
                      />
                    </>
                  ) : (
                    <>
                      <FileUploadField
                        label="Media"
                        urlValue={blockDraft.contentUrl}
                        onUrlChange={(v) =>
                          setBlockDraft((s) => ({ ...s, contentUrl: v }))
                        }
                        file={blockFile}
                        onFileChange={setBlockFile}
                        uploading={blockUploading}
                        uploadedUrl={
                          blockDraft.contentUrl?.trim()
                            ? blockDraft.contentUrl.trim()
                            : null
                        }
                        accept={
                          String(blockDraft.type).toLowerCase() === "image"
                            ? "image/*"
                            : "audio/*,video/*"
                        }
                        helperText="Paste URL or upload. Upload will be sent to Cloudinary."
                      />

                      <TextField
                        label="Caption (optional)"
                        value={blockDraft.contentText}
                        onChange={(e) =>
                          setBlockDraft((s) => ({
                            ...s,
                            contentText: e.target.value,
                          }))
                        }
                        fullWidth
                        multiline
                        minRows={2}
                      />
                    </>
                  )}

                  <Stack direction="row" gap={1} justifyContent="flex-end">
                    <Button
                      variant="outlined"
                      disabled={busy}
                      onClick={() => {
                        setCreating(false);
                        setEditing(null);
                        setBlockFile(null);
                      }}
                    >
                      Cancel
                    </Button>

                    <Button
                      variant="contained"
                      disabled={busy}
                      onClick={async () => {
                        if (!blockDraft.name.trim()) {
                          showSnackbar("Block title is required", "warning");
                          return;
                        }

                        // for media blocks: ensure url exists (either pasted or uploaded)
                        let finalUrl: string | null = null;
                        if (
                          blockDraft.type !== "text" &&
                          blockDraft.type !== "youtube"
                        ) {
                          finalUrl = await uploadBlockFileIfNeeded(
                            blockDraft.type,
                          );
                          if (blockFile && !finalUrl) return;
                          if (!finalUrl?.trim()) {
                            showSnackbar(
                              "Media URL is required for media blocks",
                              "warning",
                            );
                            return;
                          }
                        }

                        if (editing) {
                          const updated = await updateBlock(editing.id, {
                            lessonID: selected.ID,
                            name: blockDraft.name.trim(),
                            type: blockDraft.type,
                            position: Math.max(1, blockDraft.position),
                            contentText: blockDraft.contentText?.trim()
                              ? blockDraft.contentText.trim()
                              : null,
                            contentUrl: isTextBlock(String(blockDraft.type))
                              ? null
                              : (finalUrl ?? blockDraft.contentUrl ?? null),
                          });

                          if (updated) {
                            showSnackbar("Block updated", "success");
                            setEditing(null);
                            setCreating(false);
                            setBlockFile(null);
                            await fetchById(selected.ID);
                          } else {
                            showSnackbar("Update failed", "error");
                          }

                          return;
                        }

                        const created = await createBlock({
                          lessonID: selected.ID,
                          name: blockDraft.name.trim(),
                          type: blockDraft.type,
                          position: Math.max(1, blockDraft.position),
                          contentText: blockDraft.contentText?.trim()
                            ? blockDraft.contentText.trim()
                            : null,
                          contentUrl: isTextBlock(String(blockDraft.type))
                            ? null
                            : (finalUrl ?? blockDraft.contentUrl ?? null),
                        });

                        if (created) {
                          showSnackbar("Block created", "success");
                          setCreating(false);
                          setBlockFile(null);
                          await fetchById(selected.ID);
                        } else {
                          showSnackbar("Create failed", "error");
                        }
                      }}
                      sx={{ boxShadow: "0 10px 24px rgba(15,23,42,0.25)" }}
                    >
                      {editing ? "Save block" : "Create block"}
                    </Button>
                  </Stack>
                </Stack>
              </Paper>
            )}

            {/* Blocks list */}
            {blocks.length === 0 ? (
              <Paper
                elevation={0}
                sx={{
                  p: 2,
                  borderRadius: 4,
                  border: "1px solid",
                  borderColor: theme.customColors.sidebarBorder,
                }}
              >
                <Typography color="text.secondary">
                  No blocks yet. Click "Add block" to create the first one.
                </Typography>
              </Paper>
            ) : (
              <Stack gap={1.2}>
                {blocks.map((b, idx) => (
                  <Paper
                    key={b.id}
                    elevation={0}
                    sx={{
                      p: 1.8,
                      borderRadius: 4,
                      border: "1px solid",
                      borderColor: theme.customColors.sidebarBorder,
                      backgroundColor: "background.paper",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      gap: 2,
                    }}
                  >
                    <Box sx={{ minWidth: 0 }}>
                      <Typography fontWeight={900} noWrap>
                        {b.position}. {b.name}{" "}
                        <Typography
                          component="span"
                          color="text.secondary"
                          fontWeight={700}
                        >
                          - {String(b.type)}
                        </Typography>
                      </Typography>

                      <Typography variant="body2" color="text.secondary" noWrap>
                        {isTextBlock(String(b.type))
                          ? b.contentText?.slice(0, 80) || "No text"
                          : b.type === "youtube"
                            ? "YouTube video"
                            : b.contentUrl || "No URL"}
                      </Typography>
                    </Box>

                    <Stack
                      direction="row"
                      gap={0.5}
                      flexShrink={0}
                      alignItems="center"
                    >
                      <IconButton
                        disabled={busy || idx === 0}
                        onClick={() => moveUp(b.id)}
                        title="Move up"
                      >
                        <ArrowUpwardIcon />
                      </IconButton>
                      <IconButton
                        disabled={busy || idx === blocks.length - 1}
                        onClick={() => moveDown(b.id)}
                        title="Move down"
                      >
                        <ArrowDownwardIcon />
                      </IconButton>

                      <Divider
                        orientation="vertical"
                        flexItem
                        sx={{ mx: 0.5 }}
                      />

                      <IconButton
                        disabled={busy}
                        onClick={() => {
                          setEditing(b);
                          setCreating(false);
                          setBlockFile(null);
                          setBlockDraft({
                            name: b.name ?? "",
                            type: (b.type ?? "text") as LessonBlockType,
                            contentText: b.contentText ?? "",
                            contentUrl: b.contentUrl ?? "",
                            position: b.position ?? 1,
                          });
                        }}
                        title="Edit"
                      >
                        <EditIcon />
                      </IconButton>

                      <IconButton
                        disabled={busy}
                        onClick={async () => {
                          const ok = window.confirm(
                            `Delete block "${b.name}"? Positions will be normalized.`,
                          );
                          if (!ok) return;
                          const success = await deleteBlock(b.id);
                          if (success) {
                            showSnackbar("Block deleted", "success");
                            await fetchById(selected.ID);
                          } else {
                            showSnackbar("Delete failed", "error");
                          }
                        }}
                        title="Delete"
                      >
                        <DeleteOutlineIcon />
                      </IconButton>
                    </Stack>
                  </Paper>
                ))}
              </Stack>
            )}
          </Box>
        )}
      </Paper>
    </Box>
  );
};

export default LessonEditPage;
