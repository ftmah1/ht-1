import { Insertable, InsertResult, Kysely, Selectable, Transaction, UpdateResult } from "kysely";
import { IngestedForms, FormStatus, TransformedForms, DB } from "../../db/types";

export interface FormRepository {
  getIngestedFormByApplicationRef(
    applicationRef: string,
  ): Promise<Selectable<IngestedForms> | undefined>;

  insertIngestForm(ingestedForm: Insertable<IngestedForms>): Promise<Selectable<IngestedForms>>;

  updateIngestedFormStatus(
    ingestedFormId: string,
    status: FormStatus,
    errorMessage: string | null,
    executor?: Kysely<DB> | Transaction<DB>,
  ): Promise<UpdateResult[]>;

  insertTransformedForm(
    trx: Kysely<DB> | Transaction<DB>,
    transformedForm: Insertable<TransformedForms>,
  ): Promise<InsertResult[]>;

  getIngestedFormById(ingestedFormId: string): Promise<Selectable<IngestedForms> | undefined>;

  updateEmailSent(applicationRef: string): Promise<UpdateResult[]>;

  getAllFormsWithEmailNotSent(): Promise<Selectable<TransformedForms>[]>;

  runInTransaction<T>(fn: (trx: Transaction<DB>) => Promise<T>): Promise<T>;
}
