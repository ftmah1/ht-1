import { JsonValue } from "../db/types";

export function extractApplicationRef(body: unknown) {
  if (typeof body !== "object" || body == null) {
    return null;
  }
  const value = (body as Record<string, unknown>).application_reference;
  return typeof value === "string" && value.length > 0 ? value : null;
}

export function toJsonValue(payload: unknown): JsonValue {
  return JSON.parse(JSON.stringify(payload));
}
