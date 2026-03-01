import $api from "@/shared/api/http";
import type {
  Folklore,
  FolkloreCreateDto,
  FolkloreUpdateDto,
} from "../model/types";

// сохраняем совместимый контракт для store: { data, liked }
export type ToggleLikeResponse = {
  data: Folklore;
  liked: boolean;
  streak?: string;
};

export type FolkloreSearchParams = Partial<{
  type: string;
  region: string;
  author: string;
  search: string;
  minLikes: number;
}>;

type FolkloreDto = {
  id?: number;
  ID?: number;

  type: string;
  author: string;
  region: string;
  content: string;
  name: string;

  mediaUrl?: string | null;
  MediaUrl?: string | null;

  imageUrl?: string | null;
  ImageUrl?: string | null;

  likesCount?: number;
  LikesCount?: number;

  createdAt?: string;
  CreatedAt?: string;

  updatedAt?: string;
  UpdatedAt?: string;

  translations?: any[];
};

function normalizeFolklore(dto: FolkloreDto): Folklore {
  return {
    id: dto.id ?? dto.ID ?? 0,
    type: dto.type,
    author: dto.author,
    region: dto.region,
    content: dto.content,
    name: dto.name,
    mediaUrl: dto.mediaUrl ?? dto.MediaUrl ?? null,
    imageUrl: dto.imageUrl ?? dto.ImageUrl ?? null,
    likesCount: dto.likesCount ?? dto.LikesCount ?? 0,
    createdAt: dto.createdAt ?? dto.CreatedAt ?? "",
    updatedAt: dto.updatedAt ?? dto.UpdatedAt ?? "",
    translations: dto.translations,
  };
}

function unwrap<T = any>(payload: any): T {
  return (payload?.data ?? payload) as T;
}

function unwrapArray(payload: any): FolkloreDto[] {
  const v = unwrap<any>(payload);
  return Array.isArray(v) ? (v as FolkloreDto[]) : [];
}

function unwrapFolkloreFromResponse(payload: any): {
  folklore: FolkloreDto | null;
  streak?: string;
} {
  const v = unwrap<any>(payload);

  // Swagger: { folklore, streak }
  if (v?.folklore)
    return { folklore: v.folklore as FolkloreDto, streak: v.streak };

  // Legacy: { data: FolkloreDto }
  if (v && typeof v === "object" && (v.id || v.ID || v.name))
    return { folklore: v as FolkloreDto };

  // Rare legacy: { data: { folklore, streak } }
  if (v?.data?.folklore)
    return { folklore: v.data.folklore as FolkloreDto, streak: v.data.streak };

  return { folklore: null };
}

function unwrapLikeResponse(payload: any): {
  folklore: FolkloreDto | null;
  liked: boolean;
  streak?: string;
} {
  const v = unwrap<any>(payload);

  // Swagger: { folklore, liked, streak }
  if (v?.folklore)
    return {
      folklore: v.folklore as FolkloreDto,
      liked: Boolean(v.liked),
      streak: v.streak,
    };

  // Legacy: { data: FolkloreDto, liked }
  if (v?.data)
    return {
      folklore: v.data as FolkloreDto,
      liked: Boolean(v.liked),
      streak: v.streak,
    };

  return { folklore: null, liked: Boolean(v?.liked), streak: v?.streak };
}

function cleanParams(params: Record<string, unknown>) {
  const out: Record<string, string | number> = {};
  Object.entries(params).forEach(([k, v]) => {
    if (v === undefined || v === null) return;

    if (typeof v === "number") {
      if (Number.isNaN(v)) return;
      out[k] = v;
      return;
    }

    const s = String(v).trim();
    if (!s) return;
    out[k] = s;
  });
  return out;
}

const FolkloreService = {
  async create(payload: FolkloreCreateDto) {
    const res = await $api.post<any>("/folklore/create", payload);
    const { folklore } = unwrapFolkloreFromResponse(res.data);
    if (!folklore) throw new Error("Create folklore: invalid response");
    return normalizeFolklore(folklore);
  },

  async getAll() {
    const res = await $api.get<any>("/folklore/getAll");

    // Swagger: массив
    if (Array.isArray(res.data))
      return (res.data as FolkloreDto[]).map(normalizeFolklore);

    // Legacy: { data: [...] }
    return unwrapArray(res.data).map(normalizeFolklore);
  },

  async getById(id: number) {
    const res = await $api.get<any>(`/folklore/getById/${id}`);

    const { folklore } = unwrapFolkloreFromResponse(res.data);
    if (!folklore) throw new Error("GetById: invalid response");

    return normalizeFolklore(folklore);
  },

  async update(id: number, payload: FolkloreUpdateDto) {
    const res = await $api.patch<any>(`/folklore/update/${id}`, payload);
    const { folklore } = unwrapFolkloreFromResponse(res.data);
    if (!folklore) throw new Error("Update folklore: invalid response");
    return normalizeFolklore(folklore);
  },

  async remove(id: number) {
    const res = await $api.delete<any>(`/folklore/delete/${id}`);
    const v = unwrap<any>(res.data);
    return typeof v === "string" ? v : "ok";
  },

  async toggleLike(id: number): Promise<ToggleLikeResponse> {
    const res = await $api.post<any>(`/folklore/like/${id}`);
    const u = unwrapLikeResponse(res.data);
    if (!u.folklore) throw new Error("ToggleLike: invalid response");

    // ВАЖНО: возвращаем { data, liked } как раньше, чтобы store не менять
    return {
      data: normalizeFolklore(u.folklore),
      liked: u.liked,
      streak: u.streak,
    };
  },

  async getLiked() {
    const res = await $api.get<any>("/user/getLikedFolklore");

    // Swagger: массив
    if (Array.isArray(res.data))
      return (res.data as FolkloreDto[]).map(normalizeFolklore);

    // Legacy: { data: [...] }
    return unwrapArray(res.data).map(normalizeFolklore);
  },

  async search(params: FolkloreSearchParams) {
    const query = cleanParams(params as Record<string, unknown>);
    const res = await $api.get<any>("/folklore/search", { params: query });

    if (Array.isArray(res.data))
      return (res.data as FolkloreDto[]).map(normalizeFolklore);
    return unwrapArray(res.data).map(normalizeFolklore);
  },
};

export default FolkloreService;
