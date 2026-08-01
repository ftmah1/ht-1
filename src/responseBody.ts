// forms/ingest-result.ts
export type ResponseBody =
  | { outcome: "invalid_request" } // 400 — their data was wrong: no ref, or schema validation failed
  | { outcome: "error" } // 500 — our downstream (geocoding, unexpected errors) failed
  | { outcome: "success" } // 200 — includes duplicates, already-processed forms
  | { outcome: "not_found" };

export const statusMap: Record<ResponseBody["outcome"], number> = {
  invalid_request: 400,
  error: 500,
  success: 200,
  not_found: 404,
};
