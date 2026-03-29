import type { AchievementAction } from "@/features/achievements/model/actions";
import type { ActionRule, ActionRulesMap } from "./types";

type RawRecord = Record<string, unknown>;

function isRecord(value: unknown): value is RawRecord {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function asString(value: unknown): string {
  if (typeof value === "string") return value;
  if (value === null || value === undefined) return "";
  return String(value);
}

function asBoolean(value: unknown): boolean {
  if (typeof value === "boolean") return value;
  if (typeof value === "number") return value !== 0;
  if (typeof value === "string") {
    const normalized = value.trim().toLowerCase();
    return normalized === "true" || normalized === "1";
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

function normalizeRulesMap(value: unknown): ActionRulesMap {
  if (!isRecord(value)) return {};

  return Object.fromEntries(
    Object.entries(value).map(([key, ruleValue]) => [key, asBoolean(ruleValue)]),
  );
}

export function normalizeActionRule(dto: unknown): ActionRule {
  const record = isRecord(dto) ? dto : {};

  return {
    action: asString(record.action ?? record.Action) as AchievementAction,
    rules: normalizeRulesMap(record.rules ?? record.Rules),
  };
}

export function unwrapActionRulePayload(payload: unknown): ActionRule | null {
  const value = unwrap(payload);
  if (isRecord(value) && (value.action !== undefined || value.Action !== undefined)) {
    return normalizeActionRule(value);
  }
  return null;
}

export function unwrapActionRuleListPayload(payload: unknown): ActionRule[] {
  return asArray(unwrap(payload)).map(normalizeActionRule);
}
