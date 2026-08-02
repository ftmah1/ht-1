import { JsonValue } from "../db/types";

export function extractApplicationRef(payload: unknown): string | null {
  if (typeof payload !== "object" || payload === null) return null;
  const value = (payload as Record<string, unknown>).application_reference;
  return typeof value === "string" && value.trim().length > 0 ? value : null;
}

export function toJsonValue(payload: unknown): JsonValue {
  return JSON.parse(JSON.stringify(payload));
}
