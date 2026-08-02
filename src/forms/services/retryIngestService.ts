import { ResponseBody } from "../../shared/responseBody";
import { ingestFormService } from "./ingestFormService";
import type { IngestFormDeps } from "./ingestFormService";

export async function retryIngestService(id: string, deps: IngestFormDeps): Promise<ResponseBody> {
  const ingestedForm = await deps.formRepository.getIngestedFormById(id);
  if (!ingestedForm) {
    return { outcome: "not_found" };
  }
  return ingestFormService(ingestedForm?.rawPayload, deps);
}
