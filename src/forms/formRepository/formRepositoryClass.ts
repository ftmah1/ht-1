import { Kysely, Insertable, Transaction } from "kysely";
import { DB, FormStatus, IngestedForms, TransformedForms } from "../../db/types";
import { FormRepository } from "./formRepositoryInterface";

export class FormRepositoryClass implements FormRepository {
  constructor(private db: Kysely<DB>) {}

  getIngestedFormByApplicationRef(applicationRef: string) {
    return this.db
      .selectFrom("ingestedForms")
      .selectAll()
      .where("applicationRef", "=", applicationRef)
      .executeTakeFirst();
  }

  insertIngestForm(ingestedForm: Insertable<IngestedForms>) {
    return this.db
      .insertInto("ingestedForms")
      .values(ingestedForm)
      .returningAll()
      .executeTakeFirstOrThrow();
  }

  updateIngestedFormStatus(
    ingestedFormId: string,
    status: FormStatus,
    errorMessage: string | null,
    executor: Kysely<DB> | Transaction<DB> = this.db,
  ) {
    return executor
      .updateTable("ingestedForms")
      .set({
        errorMessage: errorMessage ?? null,
        status,
      })
      .where("id", "=", ingestedFormId)
      .execute();
  }

  insertTransformedForm(
    trx: Kysely<DB> | Transaction<DB>,
    transformedForm: Insertable<TransformedForms>,
  ) {
    return trx.insertInto("transformedForms").values(transformedForm).execute();
  }

  getIngestedFormById(ingestedFormId: string) {
    return this.db
      .selectFrom("ingestedForms")
      .selectAll()
      .where("id", "=", ingestedFormId)
      .executeTakeFirst();
  }

  updateEmailSent(applicationRef: string) {
    return this.db
      .updateTable("transformedForms")
      .set({ emailSentAt: new Date() })
      .where("applicationReference", "=", applicationRef)
      .execute();
  }

  getAllFormsWithEmailNotSent() {
    return this.db
      .selectFrom("transformedForms")
      .selectAll()
      .where("emailSentAt", "is", null)
      .execute();
  }

  runInTransaction<T>(fn: (trx: Transaction<DB>) => Promise<T>): Promise<T> {
    return this.db.transaction().execute(fn);
  }
}
