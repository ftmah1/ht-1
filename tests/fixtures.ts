import { FormRepository } from "../src/forms/formRepository/formRepositoryInterface";
import { lookupPostcode } from "../src/providers/idealpostcodes";
import { notifyTeamAndUpdateEmailSent } from "../src/shared/notifyTeamAndUpdateEmailSent";
import baseRequest from "../src/forms/examples/person_one.json";
import { Selectable } from "kysely";
import { IngestedForms } from "../src/db/types";

export const savedIngestedForm: Selectable<IngestedForms> = {
  id: "ingested-form-id-1",
  applicationRef: baseRequest.application_reference,
  status: "received",
  rawPayload: baseRequest,
  errorMessage: null,
  receivedAt: new Date(),
  updatedAt: new Date(),
};

export const trx = {} as unknown;

export type MockedDeps = {
  formRepository: jest.Mocked<FormRepository>;
  lookupPostcode: jest.MockedFunction<typeof lookupPostcode>;
  notifyTeam: jest.MockedFunction<typeof notifyTeamAndUpdateEmailSent>;
};

export function buildDeps(overrides: Partial<MockedDeps> = {}): MockedDeps {
  return {
    formRepository: {
      getIngestedFormByApplicationRef: jest.fn().mockResolvedValue(undefined),
      insertIngestForm: jest.fn().mockResolvedValue(savedIngestedForm),
      updateIngestedFormStatus: jest.fn().mockResolvedValue([]),
      insertTransformedForm: jest.fn().mockResolvedValue([]),
      getIngestedFormById: jest.fn(),
      updateEmailSent: jest.fn(),
      getAllFormsWithEmailNotSent: jest.fn(),
      runInTransaction: jest.fn((fn: (trx: unknown) => Promise<unknown>) => fn(trx)),
    } as unknown as jest.Mocked<FormRepository>,
    lookupPostcode: jest.fn().mockResolvedValue({
      statusCode: 200,
      body: { latitude: -5.05, longitude: 50.05 },
    }),
    notifyTeam: jest.fn().mockResolvedValue(undefined),
    ...overrides,
  };
}
