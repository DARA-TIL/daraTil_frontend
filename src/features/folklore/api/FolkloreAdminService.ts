import $api from "@/shared/api/http";
import type {
  Folklore,
  FolkloreCreateDto,
  FolkloreUpdateDto,
} from "../model/types";

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

function unwrapFolklore(payload: any): FolkloreDto | null {
  const v = unwrap<any>(payload);
  if (v?.folklore) return v.folklore as FolkloreDto;
  if (v && typeof v === "object" && (v.id || v.ID || v.name))
    return v as FolkloreDto;
  if (v?.data?.folklore) return v.data.folklore as FolkloreDto;
  return null;
}

const FolkloreAdminService = {
  async getAll() {
    const res = await $api.get<any>("/folklore/getAll");
    if (Array.isArray(res.data))
      return (res.data as FolkloreDto[]).map(normalizeFolklore);
    return unwrapArray(res.data).map(normalizeFolklore);
  },

  async getById(id: number) {
    const res = await $api.get<any>(`/folklore/getById/${id}`);
    const dto = unwrapFolklore(res.data);
    if (!dto) throw new Error("GetById: invalid response");
    return normalizeFolklore(dto);
  },

  async create(payload: FolkloreCreateDto) {
    const res = await $api.post<any>("/folklore/create", payload);
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
    const res = await $api.patch<any>(`/folklore/update/${id}`, payload);
    const dto = unwrapFolklore(res.data);
    if (!dto) throw new Error("Update: invalid response");
    return normalizeFolklore(dto);
  },

  async remove(id: number) {
    await $api.delete<any>(`/folklore/delete/${id}`);
    return "ok";
  },
};

export default FolkloreAdminService;
