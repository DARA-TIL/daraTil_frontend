import $api from "@/shared/api/http";
import type {
  Folklore,
  FolkloreCreateDto,
  FolkloreUpdateDto,
} from "../model/types";

type ApiData<T> = { data: T };

export type ToggleLikeResponse = {
  data: Folklore;
  liked: boolean;
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
    const res = await $api.post<ApiData<FolkloreDto>>(
      "/folklore/create",
      payload
    );
    return normalizeFolklore(res.data.data);
  },

  async getAll() {
    const res = await $api.get<ApiData<FolkloreDto[]>>("/folklore/getAll");
    return (res.data.data ?? []).map(normalizeFolklore);
  },

  async getById(id: number) {
    const res = await $api.get<ApiData<FolkloreDto>>(`/folklore/getById/${id}`);
    return normalizeFolklore(res.data.data);
  },

  async update(id: number, payload: FolkloreUpdateDto) {
    const res = await $api.patch<ApiData<FolkloreDto>>(
      `/folklore/update/${id}`,
      payload
    );
    return normalizeFolklore(res.data.data);
  },

  async remove(id: number) {
    const res = await $api.delete<ApiData<string>>(`/folklore/delete/${id}`);
    return res.data.data;
  },

  async toggleLike(id: number) {
    const res = await $api.post<{ data: FolkloreDto; liked: boolean }>(
      `/folklore/like/${id}`
    );
    return { data: normalizeFolklore(res.data.data), liked: res.data.liked };
  },

  async getLiked() {
    const res = await $api.get<ApiData<FolkloreDto[]>>(
      "/user/getLikedFolklore"
    );
    return (res.data.data ?? []).map(normalizeFolklore);
  },

  async search(params: FolkloreSearchParams) {
    const query = cleanParams(params as Record<string, unknown>);
    const res = await $api.get<ApiData<FolkloreDto[]>>("/folklore/search", {
      params: query,
    });
    return (res.data.data ?? []).map(normalizeFolklore);
  },
};

export default FolkloreService;
