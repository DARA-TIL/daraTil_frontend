import $api from "@/shared/api/http";
import {
  buildDictionaryCreateBody,
  buildDictionaryFavoriteWordBody,
  buildDictionaryUpdateBody,
  unwrapDictionaryListPayload,
  unwrapDictionaryPayload,
} from "../model/normalize";
import type {
  DictionaryCreateDto,
  DictionaryEntry,
  DictionaryFavoriteWordRequest,
  DictionaryUpdateDto,
} from "../model/types";

const DictionaryService = {
  async create(payload: DictionaryCreateDto): Promise<DictionaryEntry | null> {
    const res = await $api.post<unknown>(
      "/dictionary/create",
      buildDictionaryCreateBody(payload),
    );
    return unwrapDictionaryPayload(res.data);
  },

  async delete(id: number): Promise<void> {
    await $api.delete(`/dictionary/delete/${id}`);
  },

  async getFavorites(): Promise<DictionaryEntry[]> {
    const res = await $api.get<unknown>("/dictionary/favorite");
    return unwrapDictionaryListPayload(res.data);
  },

  async favoriteWord(
    payload: DictionaryFavoriteWordRequest,
  ): Promise<DictionaryEntry | null> {
    const res = await $api.post<unknown>(
      "/dictionary/favorite",
      buildDictionaryFavoriteWordBody(payload),
    );
    return unwrapDictionaryPayload(res.data);
  },

  async addFavorite(id: number): Promise<void> {
    await $api.post(`/dictionary/favorite/${id}`);
  },

  async removeFavorite(id: number): Promise<void> {
    await $api.delete(`/dictionary/favorite/${id}`);
  },

  async getAll(): Promise<DictionaryEntry[]> {
    const res = await $api.get<unknown>("/dictionary/getAll");
    return unwrapDictionaryListPayload(res.data);
  },

  async getById(id: number): Promise<DictionaryEntry> {
    const res = await $api.get<unknown>(`/dictionary/getById/${id}`);
    const item = unwrapDictionaryPayload(res.data);
    if (!item) throw new Error("Get dictionary by id: invalid response");
    return item;
  },

  async getByWord(word: string): Promise<DictionaryEntry[]> {
    const res = await $api.get<unknown>(
      `/dictionary/getByWord/${encodeURIComponent(word.trim())}`,
    );
    return unwrapDictionaryListPayload(res.data);
  },

  async update(payload: DictionaryUpdateDto): Promise<DictionaryEntry | null> {
    const res = await $api.patch<unknown>(
      "/dictionary/update",
      buildDictionaryUpdateBody(payload),
    );
    return unwrapDictionaryPayload(res.data);
  },
};

export default DictionaryService;
