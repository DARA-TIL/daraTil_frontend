import $api from "@/shared/api/http";
import type {
  Folklore,
  FolkloreCreateDto,
  FolkloreTranslation,
  FolkloreUpdateDto,
} from "../model/types";
import { isRecord, unwrapApiData } from "@/shared/lib/unknownRecord";

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
  translations?: FolkloreTranslation[];
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

function unwrap<T = unknown>(payload: unknown): T {
  return unwrapApiData(payload) as T;
}

function unwrapArray(payload: unknown): FolkloreDto[] {
  const v = unwrap<unknown>(payload);
  return Array.isArray(v) ? (v as FolkloreDto[]) : [];
}

function unwrapFolklore(payload: unknown): FolkloreDto | null {
  const v = unwrap<unknown>(payload);
  if (!isRecord(v)) return null;
  if (v.folklore) return v.folklore as FolkloreDto;
  if (v.id || v.ID || v.name) return v as FolkloreDto;
  const nested = isRecord(v.data) ? v.data : null;
  if (nested?.folklore) return nested.folklore as FolkloreDto;
  return null;
}

const FolkloreAdminService = {
  async getAll() {
    const res = await $api.get<unknown>("/folklore/getAll");
    if (Array.isArray(res.data))
      return (res.data as FolkloreDto[]).map(normalizeFolklore);
    return unwrapArray(res.data).map(normalizeFolklore);
  },

  async getById(id: number) {
    const res = await $api.get<unknown>(`/folklore/getById/${id}`);
    const dto = unwrapFolklore(res.data);
    if (!dto) throw new Error("GetById: invalid response");
    return normalizeFolklore(dto);
  },

  async create(payload: FolkloreCreateDto) {
    const res = await $api.post<unknown>("/folklore/create", payload);
    const dto = unwrapFolklore(res.data);
    if (!dto) throw new Error("Create: invalid response");
    const created = normalizeFolklore(dto);

    try {
      return await this.getById(created.id);
    } catch {
      return created;
    }
  },

  async update(id: number, payload: FolkloreUpdateDto) {
    const res = await $api.patch<unknown>(`/folklore/update/${id}`, payload);
    const dto = unwrapFolklore(res.data);
    if (!dto) throw new Error("Update: invalid response");
    return normalizeFolklore(dto);
  },

  async remove(id: number) {
    await $api.delete<unknown>(`/folklore/delete/${id}`);
    return "ok";
  },
};

export default FolkloreAdminService;
