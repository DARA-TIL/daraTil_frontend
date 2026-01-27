import $api from "@/shared/api/http";
import type {
  Folklore,
  FolkloreCreateDto,
  FolkloreUpdateDto,
} from "../model/types";

type ApiData<T> = { data: T };

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

const FolkloreAdminService = {
  async getAll() {
    const res = await $api.get<ApiData<FolkloreDto[]>>("/folklore/getAll");
    return (res.data.data ?? []).map(normalizeFolklore);
  },

  async getById(id: number) {
    const res = await $api.get<ApiData<FolkloreDto>>(`/folklore/getById/${id}`);
    return normalizeFolklore(res.data.data);
  },

  // create: бек возвращает folklore БЕЗ translations - поэтому после create лучше сделать getById
  async create(payload: FolkloreCreateDto) {
    const res = await $api.post<ApiData<FolkloreDto>>(
      "/folklore/create",
      payload,
    );
    const created = normalizeFolklore(res.data.data);
    try {
      return await this.getById(created.id);
    } catch {
      return created;
    }
  },

  async update(id: number, payload: FolkloreUpdateDto) {
    const res = await $api.patch<ApiData<FolkloreDto>>(
      `/folklore/update/${id}`,
      payload,
    );
    return normalizeFolklore(res.data.data);
  },

  async remove(id: number) {
    const res = await $api.delete<ApiData<string>>(`/folklore/delete/${id}`);
    return res.data.data;
  },
};

export default FolkloreAdminService;
