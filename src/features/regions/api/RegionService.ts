import $api from "@/shared/api/http";
import type {
  GetRegionSlangResponse,
  GetRegionTraditionResponse,
  Region,
  RegionSlang,
  RegionSlangTranslation,
  RegionTraditionTranslation,
  RegionTranslation,
} from "../model/types";
import {
  unwrapRegionListPayload,
  unwrapRegionPayload,
  unwrapRegionSlangListPayload,
  unwrapRegionSlangPayload,
  unwrapRegionSlangTranslationListPayload,
  unwrapRegionSlangTranslationPayload,
  unwrapRegionTraditionPayload,
  unwrapRegionTraditionTranslationListPayload,
  unwrapRegionTraditionTranslationPayload,
  unwrapRegionTranslationListPayload,
  unwrapRegionTranslationPayload,
} from "../model/normalize";

const RegionService = {
  async getAll(): Promise<Region[]> {
    const res = await $api.get<unknown>("/region/getAll");
    return unwrapRegionListPayload(res.data);
  },

  async getByCode(code: string): Promise<Region[]> {
    const res = await $api.get<unknown>(
      `/region/getByCode/${encodeURIComponent(code)}`,
    );
    return unwrapRegionListPayload(res.data);
  },

  async getById(id: number): Promise<Region> {
    const res = await $api.get<unknown>(`/region/getById/${id}`);
    const region = unwrapRegionPayload(res.data);
    if (!region) throw new Error("Get region by id: invalid response");
    return region;
  },

  async getSlangById(id: number): Promise<GetRegionSlangResponse> {
    const res = await $api.get<unknown>(`/region/slang/getById/${id}`);
    const slang = unwrapRegionSlangPayload(res.data);
    if (!slang) throw new Error("Get region slang by id: invalid response");
    return slang;
  },

  async getSlangByRegionId(regionId: number): Promise<RegionSlang[]> {
    const res = await $api.get<unknown>(`/region/${regionId}/slang`);
    return unwrapRegionSlangListPayload(res.data);
  },

  async getSlangTranslationById(id: number): Promise<RegionSlangTranslation> {
    const res = await $api.get<unknown>(
      `/region/slang/translation/getById/${id}`,
    );
    const translation = unwrapRegionSlangTranslationPayload(res.data);
    if (!translation) {
      throw new Error("Get region slang translation by id: invalid response");
    }
    return translation;
  },

  async getSlangTranslationsBySlangId(
    slangId: number,
  ): Promise<RegionSlangTranslation[]> {
    const res = await $api.get<unknown>(`/region/slang/${slangId}/translations`);
    return unwrapRegionSlangTranslationListPayload(res.data);
  },

  async getTraditionById(id: number): Promise<GetRegionTraditionResponse> {
    const res = await $api.get<unknown>(`/region/tradition/getById/${id}`);
    const tradition = unwrapRegionTraditionPayload(res.data);
    if (!tradition) {
      throw new Error("Get region tradition by id: invalid response");
    }
    return tradition;
  },

  async getTraditionTranslationById(
    id: number,
  ): Promise<RegionTraditionTranslation> {
    const res = await $api.get<unknown>(
      `/region/tradition/translation/getById/${id}`,
    );
    const translation = unwrapRegionTraditionTranslationPayload(res.data);
    if (!translation) {
      throw new Error(
        "Get region tradition translation by id: invalid response",
      );
    }
    return translation;
  },

  async getTraditionTranslationsByRegionId(
    regionId: number,
  ): Promise<RegionTraditionTranslation[]> {
    const res = await $api.get<unknown>(`/region/${regionId}/traditions`);
    return unwrapRegionTraditionTranslationListPayload(res.data);
  },

  async getTranslationById(id: number): Promise<RegionTranslation> {
    const res = await $api.get<unknown>(`/region/translation/getById/${id}`);
    const translation = unwrapRegionTranslationPayload(res.data);
    if (!translation) {
      throw new Error("Get region translation by id: invalid response");
    }
    return translation;
  },

  async getTranslationsByRegionId(regionId: number): Promise<RegionTranslation[]> {
    const res = await $api.get<unknown>(`/region/${regionId}/translations`);
    return unwrapRegionTranslationListPayload(res.data);
  },
};

export default RegionService;
