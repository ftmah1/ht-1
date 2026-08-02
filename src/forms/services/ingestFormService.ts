import { FormStatus, IngestedForms, JsonValue } from "../../db/types";
import { IngestedForm } from "../validations";
import { lookupPostcode } from "../../providers/idealpostcodes";
import { mapper } from "../mapper";
import { extractApplicationRef, toJsonValue } from "../utils";
import { TransformedFormSchema } from "../schemas/transformed_schema";
import { Selectable } from "kysely";
import { ResponseBody } from "../../shared/responseBody";
import { ZodError } from "zod";
import { notifyTeamAndUpdateEmailSent } from "../../shared/notifyTeamAndUpdateEmailSent";
import { withRetry } from "../../shared/retry";
import { FormRepository } from "../formRepository/formRepositoryInterface";

export interface IngestFormDeps {
  formRepository: FormRepository;
  lookupPostcode: typeof lookupPostcode;
  notifyTeam: typeof notifyTeamAndUpdateEmailSent;
}

export const ingestFormService = async (
  ingestedForm: unknown,
  deps: IngestFormDeps,
): Promise<ResponseBody> => {
  const applicationRef = extractApplicationRef(ingestedForm);
  if (!applicationRef) {
    return { outcome: "invalid_request" };
  }

  try {
    const existingForm = await deps.formRepository.getIngestedFormByApplicationRef(applicationRef);
    if (existingForm?.status === "ready") {
      return { outcome: "success" };
    }

    const savedIngestedForm =
      existingForm ??
      (await deps.formRepository.insertIngestForm({
        rawPayload: toJsonValue(ingestedForm),
        applicationRef: applicationRef,
        status: "received" as FormStatus,
      }));

    const { data, success, error } = IngestedForm.safeParse(ingestedForm);
    if (!success) {
      await saveError(deps.formRepository, error, savedIngestedForm);
      return { outcome: "invalid_request" };
    }

    const { body } = await withRetry(() => deps.lookupPostcode(data.address.postcode));
    if (!body) {
      await deps.formRepository.updateIngestedFormStatus(
        savedIngestedForm.id,
        "errored",
        "PostCode api failed",
      );
      return { outcome: "error" };
    }

    const transformedForm = mapper(data, body.latitude, body.longitude);
    await saveTransformedFormAndUpdateStatus(
      deps.formRepository,
      transformedForm,
      savedIngestedForm,
    );

    await deps.notifyTeam(applicationRef, deps.formRepository);

    return { outcome: "success" };
  } catch (error) {
    console.error("Failed to ingest form:", error);
    return { outcome: "error" };
  }
};

async function saveTransformedFormAndUpdateStatus(
  formRepository: FormRepository,
  transformedForm: TransformedFormSchema,
  savedIngestedForm: Selectable<IngestedForms>,
) {
  await formRepository.runInTransaction(async (trx) => {
    await formRepository.insertTransformedForm(trx, {
      ...transformedForm,
      ingestedFormId: savedIngestedForm.id,
    });
    await formRepository.updateIngestedFormStatus(savedIngestedForm.id, "ready", null, trx);
  });
}

async function saveError(
  formRepository: FormRepository,
  error: ZodError,
  savedIngestedForm: Selectable<IngestedForms>,
) {
  const allErrors = error.issues.reduce(
    (acc, curr) => acc + ` ${curr.path.join(".")}:${curr.message};`,
    "",
  );
  await formRepository.updateIngestedFormStatus(savedIngestedForm.id, "errored", allErrors);
  return allErrors;
}
