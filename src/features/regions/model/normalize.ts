import type {
  GetRegionSlangResponse,
  GetRegionTraditionResponse,
  Region,
  RegionLanguage,
  RegionSlang,
  RegionSlangTranslation,
  RegionTradition,
  RegionTraditionTranslation,
  RegionTranslation,
} from "./types";

type RawRecord = Record<string, unknown>;

function isRecord(value: unknown): value is RawRecord {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function asString(value: unknown): string {
  if (typeof value === "string") return value;
  if (value === null || value === undefined) return "";
  return String(value);
}

function asNumber(value: unknown): number {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string") {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) return parsed;
  }
  return 0;
}

function asBoolean(value: unknown): boolean {
  if (typeof value === "boolean") return value;
  if (typeof value === "number") return value !== 0;
  if (typeof value === "string") {
    const normalized = value.trim().toLowerCase();
    if (["true", "1", "yes", "active"].includes(normalized)) return true;
  }
  return false;
}

function asArray(value: unknown): unknown[] {
  return Array.isArray(value) ? value : [];
}

function unwrap(payload: unknown): unknown {
  if (!isRecord(payload)) return payload;
  return payload.data ?? payload;
}

export function normalizeRegionTranslation(dto: unknown): RegionTranslation {
  const record = isRecord(dto) ? dto : {};

  return {
    description: asString(record.description),
    id: asNumber(record.id ?? record.ID),
    language: asString(record.language).toUpperCase() as RegionLanguage,
    name: asString(record.name),
    regionId: asNumber(record.regionId ?? record.RegionID ?? record.regionID),
  };
}

export function normalizeRegionSlangTranslation(
  dto: unknown,
): RegionSlangTranslation {
  const record = isRecord(dto) ? dto : {};

  return {
    description: asString(record.description),
    id: asNumber(record.id ?? record.ID),
    language: asString(record.language).toUpperCase() as RegionLanguage,
    pronounceUrl: asString(record.pronounceUrl ?? record.PronounceUrl),
    regionSlangId: asNumber(
      record.regionSlangId ?? record.RegionSlangID ?? record.regionSlangID,
    ),
    word: asString(record.word),
  };
}

export function normalizeRegionSlang(dto: unknown): RegionSlang {
  const record = isRecord(dto) ? dto : {};

  return {
    id: asNumber(record.id ?? record.ID),
    regionId: asNumber(record.regionId ?? record.RegionID ?? record.regionID),
    translations: asArray(record.translations).map(
      normalizeRegionSlangTranslation,
    ),
  };
}

export function normalizeRegionTraditionTranslation(
  dto: unknown,
): RegionTraditionTranslation {
  const record = isRecord(dto) ? dto : {};

  return {
    description: asString(record.description),
    id: asNumber(record.id ?? record.ID),
    language: asString(record.language).toUpperCase() as RegionLanguage,
    name: asString(record.name),
    regionTraditionsId: asNumber(
      record.regionTraditionsId ??
        record.RegionTraditionsID ??
        record.regionTraditionId ??
        record.regionTraditionID,
    ),
  };
}

export function normalizeRegionTradition(dto: unknown): RegionTradition {
  const record = isRecord(dto) ? dto : {};

  return {
    id: asNumber(record.id ?? record.ID),
    regionId: asNumber(record.regionId ?? record.RegionID ?? record.regionID),
    translations: asArray(record.translations).map(
      normalizeRegionTraditionTranslation,
    ),
  };
}

export function normalizeRegion(dto: unknown): Region {
  const record = isRecord(dto) ? dto : {};

  return {
    code: asString(record.code),
    id: asNumber(record.id ?? record.ID),
    imageUrl: asString(record.imageUrl ?? record.ImageUrl) || null,
    isActive: asBoolean(record.isActive ?? record.IsActive),
    kind: asString(record.kind),
    regionSlang: asArray(record.regionSlang ?? record.RegionSlang).map(
      normalizeRegionSlang,
    ),
    regionStatus: asString(record.regionStatus ?? record.RegionStatus),
    regionTraditions: asArray(
      record.regionTraditions ?? record.RegionTraditions,
    ).map(normalizeRegionTradition),
    requiredLevel: asNumber(
      record.requiredLevel ?? record.RequiredLevel ?? record.requiredlevel,
    ),
    translations: asArray(record.translations).map(normalizeRegionTranslation),
  };
}

export function unwrapRegionListPayload(payload: unknown): Region[] {
  const value = unwrap(payload);
  return asArray(value).map(normalizeRegion);
}

export function unwrapRegionPayload(payload: unknown): Region | null {
  const value = unwrap(payload);
  if (isRecord(value) && (value.id !== undefined || value.ID !== undefined)) {
    return normalizeRegion(value);
  }
  if (isRecord(value) && isRecord(value.region)) {
    return normalizeRegion(value.region);
  }
  return null;
}

export function unwrapRegionTranslationPayload(
  payload: unknown,
): RegionTranslation | null {
  const value = unwrap(payload);
  if (isRecord(value) && (value.id !== undefined || value.ID !== undefined)) {
    return normalizeRegionTranslation(value);
  }
  return null;
}

export function unwrapRegionSlangTranslationPayload(
  payload: unknown,
): RegionSlangTranslation | null {
  const value = unwrap(payload);
  if (isRecord(value) && (value.id !== undefined || value.ID !== undefined)) {
    return normalizeRegionSlangTranslation(value);
  }
  return null;
}

export function unwrapRegionTraditionTranslationPayload(
  payload: unknown,
): RegionTraditionTranslation | null {
  const value = unwrap(payload);
  if (isRecord(value) && (value.id !== undefined || value.ID !== undefined)) {
    return normalizeRegionTraditionTranslation(value);
  }
  return null;
}

export function unwrapRegionSlangPayload(
  payload: unknown,
): GetRegionSlangResponse | null {
  const value = unwrap(payload);
  if (!isRecord(value)) return null;

  const dto = value.regionSlang ?? value.data;
  if (!dto) return null;

  return {
    data: normalizeRegionSlang(dto),
    streak: asString(value.streak) || undefined,
  };
}

export function unwrapRegionTraditionPayload(
  payload: unknown,
): GetRegionTraditionResponse | null {
  const value = unwrap(payload);
  if (!isRecord(value)) return null;

  const dto = value.regionTradition ?? value.regionTraditions ?? value.data;
  if (!dto) return null;

  return {
    data: normalizeRegionTradition(dto),
    streak: asString(value.streak) || undefined,
  };
}

export function unwrapRegionSlangListPayload(payload: unknown): RegionSlang[] {
  const value = unwrap(payload);
  return asArray(value).map(normalizeRegionSlang);
}

export function unwrapRegionSlangTranslationListPayload(
  payload: unknown,
): RegionSlangTranslation[] {
  const value = unwrap(payload);
  return asArray(value).map(normalizeRegionSlangTranslation);
}

export function unwrapRegionTraditionTranslationListPayload(
  payload: unknown,
): RegionTraditionTranslation[] {
  const value = unwrap(payload);
  return asArray(value).map(normalizeRegionTraditionTranslation);
}

export function unwrapRegionTranslationListPayload(
  payload: unknown,
): RegionTranslation[] {
  const value = unwrap(payload);
  return asArray(value).map(normalizeRegionTranslation);
}
