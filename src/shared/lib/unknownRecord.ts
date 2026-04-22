export type UnknownRecord = Record<string, unknown>;

export function isRecord(value: unknown): value is UnknownRecord {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export function getRecord(
  source: unknown,
  key: string,
): UnknownRecord | null {
  if (!isRecord(source)) return null;
  const value = source[key];
  return isRecord(value) ? value : null;
}

export function getString(source: unknown, key: string): string | null {
  if (!isRecord(source)) return null;
  const value = source[key];
  return typeof value === "string" ? value : null;
}

export function unwrapApiData(payload: unknown): unknown {
  return isRecord(payload) && "data" in payload ? payload.data : payload;
}
