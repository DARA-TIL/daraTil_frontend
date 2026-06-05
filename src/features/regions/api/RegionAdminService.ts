import $api from "@/shared/api/http";
import type {
  RegionCreateDto,
  RegionSlangCreateDto,
  RegionSlangTranslationCreateDto,
  RegionSlangTranslationUpdateDto,
  RegionSlangUpdateDto,
  RegionTraditionCreateDto,
  RegionTraditionTranslationCreateDto,
  RegionTraditionTranslationUpdateDto,
  RegionTraditionUpdateDto,
  RegionTranslationCreateDto,
  RegionTranslationUpdateDto,
  RegionUpdateDto,
} from "../model/types";

const RegionAdminService = {
  async createRegion(payload: RegionCreateDto): Promise<void> {
    await $api.post("/region/create", payload);
  },

  async createAllRegions(): Promise<void> {
    await $api.post("/region/createAll");
  },

  async updateRegion(payload: RegionUpdateDto): Promise<void> {
    await $api.patch("/region/update", payload);
  },

  async deleteRegion(id: number): Promise<void> {
    await $api.delete(`/region/delete/${id}`);
  },

  async createSlang(payload: RegionSlangCreateDto): Promise<void> {
    await $api.post("/region/slang/create", payload);
  },

  async updateSlang(payload: RegionSlangUpdateDto): Promise<void> {
    await $api.patch("/region/slang/update", payload);
  },

  async deleteSlang(id: number): Promise<void> {
    await $api.delete(`/region/slang/delete/${id}`);
  },

  async createSlangTranslation(
    payload: RegionSlangTranslationCreateDto,
  ): Promise<void> {
    await $api.post("/region/slang/translation/create", payload);
  },

  async updateSlangTranslation(
    payload: RegionSlangTranslationUpdateDto,
  ): Promise<void> {
    await $api.patch("/region/slang/translation/update", payload);
  },

  async deleteSlangTranslation(id: number): Promise<void> {
    await $api.delete(`/region/slang/translation/delete/${id}`);
  },

  async createTradition(payload: RegionTraditionCreateDto): Promise<void> {
    await $api.post("/region/tradition/create", payload);
  },

  async updateTradition(payload: RegionTraditionUpdateDto): Promise<void> {
    await $api.patch("/region/tradition/update", payload);
  },

  async deleteTradition(id: number): Promise<void> {
    await $api.delete(`/region/tradition/delete/${id}`);
  },

  async createTraditionTranslation(
    payload: RegionTraditionTranslationCreateDto,
  ): Promise<void> {
    await $api.post("/region/tradition/translation/create", payload);
  },

  async updateTraditionTranslation(
    payload: RegionTraditionTranslationUpdateDto,
  ): Promise<void> {
    await $api.patch("/region/tradition/translation/update", payload);
  },

  async deleteTraditionTranslation(id: number): Promise<void> {
    await $api.delete(`/region/tradition/translation/delete/${id}`);
  },

  async createTranslation(payload: RegionTranslationCreateDto): Promise<void> {
    await $api.post("/region/translation/create", payload);
  },

  async updateTranslation(payload: RegionTranslationUpdateDto): Promise<void> {
    await $api.patch("/region/translation/update", payload);
  },

  async deleteTranslation(id: number): Promise<void> {
    await $api.delete(`/region/translation/delete/${id}`);
  },
};

export default RegionAdminService;
