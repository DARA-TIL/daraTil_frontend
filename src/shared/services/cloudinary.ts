import axios from "axios";

export type CloudinaryUploadKind = "image" | "video" | "raw";

export type CloudinaryUploadResult = {
  secureUrl: string;
  publicId: string;
  resourceType: string;
  format?: string;
  bytes?: number;
  originalFilename?: string;
};

const CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME as string;
const UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET as string;

if (!CLOUD_NAME || !UPLOAD_PRESET) {
  console.warn(
    "Cloudinary env is not set: VITE_CLOUDINARY_CLOUD_NAME / VITE_CLOUDINARY_UPLOAD_PRESET",
  );
}

function endpointFor(kind: CloudinaryUploadKind) {
  // image/video/raw endpoints
  return `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/${kind}/upload`;
}

export async function uploadToCloudinary(
  file: File,
  opts?: { kind?: CloudinaryUploadKind; folder?: string },
): Promise<CloudinaryUploadResult> {
  const kind: CloudinaryUploadKind = opts?.kind ?? inferKind(file);
  const url = endpointFor(kind);

  const form = new FormData();
  form.append("file", file);
  form.append("upload_preset", UPLOAD_PRESET);
  if (opts?.folder) form.append("folder", opts.folder);

  const res = await axios.post(url, form, {
    headers: { "Content-Type": "multipart/form-data" },
  });

  return {
    secureUrl: res.data.secure_url,
    publicId: res.data.public_id,
    resourceType: res.data.resource_type,
    format: res.data.format,
    bytes: res.data.bytes,
    originalFilename: res.data.original_filename,
  };
}

function inferKind(file: File): CloudinaryUploadKind {
  const t = (file.type || "").toLowerCase();

  if (t.startsWith("image/")) return "image";
  if (t.startsWith("audio/")) return "video"; // Cloudinary audio обычно идёт через video resource_type
  if (t.startsWith("video/")) return "video";

  return "raw";
}
