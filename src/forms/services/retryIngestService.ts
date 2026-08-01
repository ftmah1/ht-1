import { db } from "../../db";
import { getIngestedFormById } from "../../db/queries/ingestedForm";
import { ResponseBody } from "../../shared/responseBody";
import { ingestFormService } from "./ingestFormService";

export async function retryIngestService(id: string): Promise<ResponseBody> {
  const ingestedForm = await getIngestedFormById(db, id);
  if (!ingestedForm) {
    return { outcome: "not_found" };
  }
  return ingestFormService(ingestedForm?.rawPayload);
}
