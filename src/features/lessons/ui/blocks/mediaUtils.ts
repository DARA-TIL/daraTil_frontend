export type MediaKind = "youtube" | "image" | "audio" | "video" | "link";

export function isYouTubeUrl(url?: string | null): boolean {
  if (!url) return false;
  try {
    const u = new URL(url);
    const host = u.hostname.replace(/^www\./, "").toLowerCase();
    return host === "youtube.com" || host === "m.youtube.com" || host === "youtu.be";
  } catch {
    return false;
  }
}

export function getYouTubeId(url: string): string | null {
  try {
    const u = new URL(url);
    const host = u.hostname.replace(/^www\./, "").toLowerCase();

    if (host === "youtu.be") {
      const id = u.pathname.split("/").filter(Boolean)[0];
      return id || null;
    }

    if (u.pathname === "/watch") return u.searchParams.get("v");

    if (u.pathname.startsWith("/embed/")) return u.pathname.split("/")[2] || null;

    if (u.pathname.startsWith("/shorts/")) return u.pathname.split("/")[2] || null;

    return null;
  } catch {
    return null;
  }
}

export function toYouTubeEmbed(url?: string | null): string | null {
  if (!url) return null;
  if (!isYouTubeUrl(url)) return null;

  const id = getYouTubeId(url);
  if (!id) return null;

  // nocookie = лучше по privacy
  return `https://www.youtube-nocookie.com/embed/${id}`;
}

export function detectMediaKind(type?: string | null, url?: string | null): MediaKind {
  const t = String(type ?? "").toLowerCase();
  const u = String(url ?? "").toLowerCase().trim();

  if (isYouTubeUrl(u)) return "youtube";

  // расширения
  if (t.includes("image") || /\.(png|jpg|jpeg|webp|gif)(\?|#|$)/.test(u)) return "image";
  if (t.includes("audio") || /\.(mp3|wav|ogg|m4a|aac)(\?|#|$)/.test(u)) return "audio";
  if (t.includes("video") || /\.(mp4|webm|mov|mkv|m4v)(\?|#|$)/.test(u)) return "video";

  // type может быть "video", но url без расширения (cdn, signed, etc)
  if (t === "video") return "video";
  if (t === "audio") return "audio";
  if (t === "image") return "image";

  return u ? "link" : "link";
}
