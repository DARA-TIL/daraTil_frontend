import React, { useEffect, useState } from "react";
import { alpha, useTheme } from "@mui/material/styles";
import { Box, Button, MenuItem, Stack, TextField, Typography } from "@mui/material";
import SaveRoundedIcon from "@mui/icons-material/SaveRounded";
import ImageOutlinedIcon from "@mui/icons-material/ImageOutlined";
import type { Region } from "../../model/types";
import { useRegionsAdminStore } from "../../store/useRegionsAdminStore";
import FileUploadField from "@/widgets/fileUpload/FileUploadField";
import { uploadToCloudinary } from "@/shared/services/cloudinary";
import { useUiStore } from "@/shared/store/useUiStore";
import { useTranslation } from "react-i18next";

type Props = {
  region: Region;
};

type MetadataDraft = {
  id: number;
  code: string;
  kind: string;
  imageUrl: string;
  isActive: boolean;
  regionStatus: string;
  requiredLevel: number;
};

function createMetadataDraft(region: Region): MetadataDraft {
  return {
    id: region.id,
    code: region.code,
    kind: region.kind || "region",
    imageUrl: region.imageUrl ?? "",
    isActive: region.isActive,
    regionStatus: region.regionStatus,
    requiredLevel: region.requiredLevel,
  };
}

export const RegionMetadataAdminTab: React.FC<Props> = ({ region }) => {
  const theme = useTheme();
  const { t } = useTranslation("admin");
  const showSnackbar = useUiStore((state) => state.showSnackbar);
  const actionLoading = useRegionsAdminStore((state) => state.actionLoading);
  const updateRegion = useRegionsAdminStore((state) => state.updateRegion);

  const [draft, setDraft] = useState<MetadataDraft>(createMetadataDraft(region));
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imageUploading, setImageUploading] = useState(false);

  useEffect(() => {
    setDraft(createMetadataDraft(region));
    setImageFile(null);
  }, [region]);

  async function uploadImageIfNeeded(): Promise<string | null> {
    if (!imageFile) return draft.imageUrl || null;

    const type = (imageFile.type || "").toLowerCase();
    const sizeMb = imageFile.size / (1024 * 1024);
    if (!type.startsWith("image/")) {
      showSnackbar(
        t("regions.validation.imageType", {
          defaultValue: "Please select an image file.",
        }),
        "warning",
      );
      return null;
    }
    if (sizeMb > 5) {
      showSnackbar(
        t("regions.validation.imageTooLarge", {
          defaultValue: "Image is too large (max {{max}}MB).",
          max: 5,
        }),
        "warning",
      );
      return null;
    }

    try {
      setImageUploading(true);
      const uploaded = await uploadToCloudinary(imageFile, {
        kind: "image",
        folder: "daratil/regions/images",
      });
      return uploaded.secureUrl;
    } catch {
      showSnackbar(
        t("regions.validation.imageUploadFailed", {
          defaultValue: "Image upload failed. Please try again.",
        }),
        "error",
      );
      return null;
    } finally {
      setImageUploading(false);
    }
  }

  const busy = actionLoading || imageUploading;

  return (
    <Stack spacing={2}>
      <Stack direction={{ xs: "column", md: "row" }} gap={2}>
        <TextField
          label={t("regions.fields.code", { defaultValue: "Code" })}
          value={draft.code}
          onChange={(event) =>
            setDraft((current) => ({
              ...current,
              code: event.target.value,
            }))
          }
          fullWidth
        />

        <TextField
          label={t("regions.fields.kind", { defaultValue: "Kind" })}
          value={draft.kind}
          onChange={(event) =>
            setDraft((current) => ({
              ...current,
              kind: event.target.value,
            }))
          }
          select
          fullWidth
        >
          <MenuItem value="region">
            {t("regions.kind.region", { defaultValue: "Region" })}
          </MenuItem>
          <MenuItem value="city">
            {t("regions.kind.city", { defaultValue: "City" })}
          </MenuItem>
        </TextField>
      </Stack>

      <Stack direction={{ xs: "column", md: "row" }} gap={2}>
        <TextField
          label={t("regions.fields.requiredLevel", {
            defaultValue: "Required level",
          })}
          type="number"
          value={draft.requiredLevel}
          onChange={(event) =>
            setDraft((current) => ({
              ...current,
              requiredLevel: Number(event.target.value) || 0,
            }))
          }
          fullWidth
        />

        <TextField
          label={t("regions.fields.isActive", { defaultValue: "Active" })}
          value={draft.isActive ? "true" : "false"}
          onChange={(event) =>
            setDraft((current) => ({
              ...current,
              isActive: event.target.value === "true",
            }))
          }
          select
          fullWidth
        >
          <MenuItem value="true">
            {t("regions.state.active", { defaultValue: "Active" })}
          </MenuItem>
          <MenuItem value="false">
            {t("regions.state.inactive", { defaultValue: "Inactive" })}
          </MenuItem>
        </TextField>
      </Stack>

      <TextField
        label={t("regions.fields.regionStatus", {
          defaultValue: "Region status",
        })}
        value={draft.regionStatus}
        onChange={(event) =>
          setDraft((current) => ({
            ...current,
            regionStatus: event.target.value,
          }))
        }
        fullWidth
      />

      <Stack spacing={1.25}>
        <Box
          sx={{
            borderRadius: 3,
            minHeight: 180,
            border: "1px dashed",
            borderColor: theme.customColors.sidebarBorder,
            backgroundColor: alpha(theme.palette.primary.main, 0.04),
            backgroundImage: draft.imageUrl
              ? `linear-gradient(180deg, rgba(15,23,42,0.08), rgba(15,23,42,0.22)), url(${draft.imageUrl})`
              : undefined,
            backgroundSize: "cover",
            backgroundPosition: "center",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            overflow: "hidden",
          }}
        >
          {draft.imageUrl ? null : (
            <Stack spacing={1} alignItems="center" color="text.secondary">
              <ImageOutlinedIcon sx={{ fontSize: 56 }} />
              <Typography variant="body2">
                {t("regions.placeholderImage", {
                  defaultValue: "No region image yet",
                })}
              </Typography>
            </Stack>
          )}
        </Box>

        <FileUploadField
          label={t("regions.fields.image", { defaultValue: "Region image" })}
          urlValue={draft.imageUrl}
          onUrlChange={(value) =>
            setDraft((current) => ({
              ...current,
              imageUrl: value.trim(),
            }))
          }
          file={imageFile}
          onFileChange={setImageFile}
          uploading={imageUploading}
          uploadedUrl={draft.imageUrl}
          accept="image/*"
          helperText={t("regions.helpers.image", {
            defaultValue:
              "Paste an image URL or upload a file. Uploads are stored in Cloudinary.",
          })}
        />
      </Stack>

      <Stack direction="row" justifyContent="flex-end">
        <Button
          variant="contained"
          startIcon={<SaveRoundedIcon />}
          disabled={busy}
          onClick={async () => {
            const uploadedImageUrl = await uploadImageIfNeeded();
            if (imageFile && !uploadedImageUrl) return;

            const ok = await updateRegion({
              ...region,
              code: draft.code.trim(),
              kind: draft.kind.trim(),
              imageUrl: (uploadedImageUrl ?? draft.imageUrl) || null,
              isActive: draft.isActive,
              regionStatus: draft.regionStatus.trim(),
              requiredLevel: draft.requiredLevel,
            });

            if (ok) {
              setImageFile(null);
              showSnackbar(
                t("regions.snackbar.metadataSaved", {
                  defaultValue: "Region metadata saved",
                }),
                "success",
              );
            }
          }}
          sx={{ boxShadow: "0 10px 24px rgba(15,23,42,0.22)" }}
        >
          {t("regions.actions.saveMetadata", {
            defaultValue: "Save metadata",
          })}
        </Button>
      </Stack>
    </Stack>
  );
};
