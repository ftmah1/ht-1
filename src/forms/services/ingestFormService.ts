import {
  getIngestedFormByApplicationRef,
  insertIngestForm,
  updateIngestedFormStatus,
} from "../../db/queries/ingestedForm";
import { FormStatus, IngestedForms } from "../../db/types";
import { IngestedForm } from "../validations";
import { lookupPostcode } from "../../providers/idealpostcodes";
import { insertTransformedForm } from "../../db/queries/transformedForm";
import { mapper } from "../mapper";
import { db } from "../../db";
import { extractApplicationRef, toJsonValue } from "../utils";
import { TransformedFormSchema } from "../schemas/transformed_schema";
import { Selectable } from "kysely";
import { ResponseBody } from "../../shared/responseBody";
import { ZodError } from "zod";
import { notifyTeamAndUpdateEmailSent } from "../../shared/notifyTeamAndUpdateEmailSent";
import { withRetry } from "../../shared/retry";

export const ingestFormService = async (ingestedForm: unknown): Promise<ResponseBody> => {
  const applicationRef = extractApplicationRef(ingestedForm);
  if (!applicationRef) {
    return { outcome: "invalid_request" };
  }

  try {
    const existingForm = await getIngestedFormByApplicationRef(db, applicationRef);
    if (existingForm?.status === "ready") {
      return { outcome: "success" };
    }

    const savedIngestedForm =
      existingForm ??
      (await insertIngestForm(db, {
        rawPayload: toJsonValue(ingestedForm),
        applicationRef: applicationRef,
        status: "received" as FormStatus,
      }));

    const { data, success, error } = IngestedForm.safeParse(ingestedForm);
    if (!success) {
      await saveError(error, savedIngestedForm);
      return { outcome: "invalid_request" };
    }

    const { body } = await withRetry(() => lookupPostcode(data.address.postcode));
    if (!body) {
      await updateIngestedFormStatus(db, savedIngestedForm.id, "errored", "PostCode api failed");
      return { outcome: "error" };
    }

    const transformedForm = mapper(data, body.latitude, body.longitude);
    await saveTransformedFormAndUpdateStatus(transformedForm, savedIngestedForm);

    await notifyTeamAndUpdateEmailSent(applicationRef);

    return { outcome: "success" };
  } catch (error) {
    console.error("Failed to ingest form:", error);
    return { outcome: "error" };
  }
};

async function saveError(error: ZodError, savedIngestedForm: Selectable<IngestedForms>) {
  const allErrors = error.issues.reduce(
    (acc, curr) => acc + ` ${curr.path.join(".")}:${curr.message};`,
    "",
  );
  await updateIngestedFormStatus(db, savedIngestedForm.id, "errored", allErrors);
  return allErrors;
}

async function saveTransformedFormAndUpdateStatus(
  transformedForm: TransformedFormSchema,
  savedIngestedForm: Selectable<IngestedForms>,
) {
  await db.transaction().execute(async (trx) => {
    await insertTransformedForm(trx, {
      ...transformedForm,
      ingestedFormId: savedIngestedForm.id,
    });
    await updateIngestedFormStatus(trx, savedIngestedForm.id, "ready", null);
  });
}
