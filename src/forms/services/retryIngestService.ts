import { db } from "../../db";
import { getIngestedFormByApplicationRef } from "../../db/queries/ingestedForm";
import { ResponseBody } from "../../responseBody";
import { ingestFormService } from "./ingestFormService";

export async function retryIngestService(applicationRef: string): Promise<ResponseBody> {
  const ingestedForm = await getIngestedFormByApplicationRef(db, applicationRef);
  if (!ingestedForm) {
    return { outcome: "not_found" };
  }
  return ingestFormService(ingestedForm?.rawPayload);
}
