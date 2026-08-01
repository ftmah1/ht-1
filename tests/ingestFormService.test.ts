// Purely Ai written
import { ingestFormService } from "../src/forms/services/ingestFormService";
import {
  getIngestedFormByApplicationRef,
  insertIngestForm,
  updateIngestedFormStatus,
} from "../src/db/queries/ingestedForm";
import { insertTransformedForm } from "../src/db/queries/transformedForm";
import { lookupPostcode } from "../src/providers/idealpostcodes";
import { db } from "../src/db";
import { notifyTeamAndUpdateEmailSent } from "../src/shared/notifyTeamAndUpdateEmailSent";
import baseRequest from "../src/forms/examples/person_one.json";
import { InsertResult, Selectable, Transaction } from "kysely";
import { DB, IngestedForms } from "../src/db/types";

jest.mock("../src/db/queries/ingestedForm");
jest.mock("../src/db/queries/transformedForm");
jest.mock("../src/providers/idealpostcodes");
jest.mock("../src/shared/notifyTeamAndUpdateEmailSent");
jest.mock("../src/db", () => ({
  db: {
    transaction: jest.fn(),
  },
}));

const mockedGetIngestedFormByApplicationRef = jest.mocked(getIngestedFormByApplicationRef);
const mockedInsertIngestForm = jest.mocked(insertIngestForm);
const mockedUpdateIngestedFormStatus = jest.mocked(updateIngestedFormStatus);
const mockedInsertTransformedForm = jest.mocked(insertTransformedForm);
const mockedNotifyTeam = jest.mocked(notifyTeamAndUpdateEmailSent);
const mockedLookupPostcode = jest.mocked(lookupPostcode);
const mockedTransaction = db.transaction as jest.Mock;

const savedIngestedForm: Selectable<IngestedForms> = {
  id: "ingested-form-id-1",
  applicationRef: baseRequest.application_reference,
  status: "received",
  rawPayload: baseRequest,
  errorMessage: null,
  receivedAt: new Date(),
  updatedAt: new Date(),
};

const trx = {} as unknown as Transaction<DB>;

describe("ingestFormService", () => {
  beforeEach(() => {
    jest.clearAllMocks();

    mockedGetIngestedFormByApplicationRef.mockResolvedValue(undefined);
    mockedInsertIngestForm.mockResolvedValue(savedIngestedForm);
    mockedUpdateIngestedFormStatus.mockResolvedValue([]);
    mockedInsertTransformedForm.mockResolvedValue(new InsertResult(undefined, 1n));
    mockedNotifyTeam.mockResolvedValue(undefined);
    mockedLookupPostcode.mockResolvedValue({
      statusCode: 200,
      body: { latitude: -5.05, longitude: 50.05 },
    });
    mockedTransaction.mockReturnValue({
      execute: (cb: (trx: unknown) => Promise<unknown>) => cb(trx),
    });
  });

  it("ingests, transforms, and notifies on a valid payload", async () => {
    const result = await ingestFormService(baseRequest);

    expect(getIngestedFormByApplicationRef).toHaveBeenCalledWith(
      db,
      baseRequest.application_reference,
    );

    expect(insertIngestForm).toHaveBeenCalledWith(db, {
      rawPayload: baseRequest,
      applicationRef: baseRequest.application_reference,
      status: "received",
    });

    expect(lookupPostcode).toHaveBeenCalledWith(baseRequest.address.postcode);

    expect(insertTransformedForm).toHaveBeenCalledWith(trx, {
      sessionId: baseRequest.session_id,
      applicationReference: baseRequest.application_reference,
      firstName: "John",
      lastName: "Doe",
      email: baseRequest.email,
      gender: baseRequest.gender,
      dateOfBirth: new Date(baseRequest.date_of_birth),
      phoneNumber: baseRequest.phone_number,
      mobileNumber: baseRequest.mobile_number,
      addressLine1: baseRequest.address.address_line_1,
      addressLine2: baseRequest.address.address_line_2,
      addressLine3: baseRequest.address.address_line_3,
      postcode: baseRequest.address.postcode,
      country: baseRequest.address.country,
      longitude: 50.05,
      latitude: -5.05,
      ingestedFormId: savedIngestedForm.id,
    });

    expect(updateIngestedFormStatus).toHaveBeenCalledWith(trx, savedIngestedForm.id, "ready", null);
    expect(notifyTeamAndUpdateEmailSent).toHaveBeenCalledWith(baseRequest.application_reference);

    expect(result).toEqual({ outcome: "success" });
  });

  it("persists the raw payload but errors out when multiple fields are invalid", async () => {
    const invalidRequest: unknown = {
      ...baseRequest,
      gender: "not-a-real-option",
      address: { ...baseRequest.address, postcode: 12345 },
    };

    const result = await ingestFormService(invalidRequest);

    expect(insertIngestForm).toHaveBeenCalledWith(db, {
      rawPayload: invalidRequest,
      applicationRef: baseRequest.application_reference,
      status: "received",
    });

    expect(updateIngestedFormStatus).toHaveBeenCalledWith(
      db,
      savedIngestedForm.id,
      "errored",
      ' gender:Invalid option: expected one of "male"|"female"|"other"; address.postcode:Invalid input: expected string, received number;',
    );

    expect(lookupPostcode).not.toHaveBeenCalled();
    expect(insertTransformedForm).not.toHaveBeenCalled();
    expect(notifyTeamAndUpdateEmailSent).not.toHaveBeenCalled();
    expect(result).toEqual({ outcome: "invalid_request" });
  });

  it("errors out when the postcode lookup fails on every retry", async () => {
    mockedLookupPostcode.mockResolvedValue({ statusCode: 500, body: undefined });

    const result = await ingestFormService(baseRequest);

    expect(lookupPostcode).toHaveBeenCalledTimes(3);
    expect(updateIngestedFormStatus).toHaveBeenCalledWith(
      db,
      savedIngestedForm.id,
      "errored",
      "PostCode api failed",
    );
    expect(insertTransformedForm).not.toHaveBeenCalled();
    expect(notifyTeamAndUpdateEmailSent).not.toHaveBeenCalled();

    expect(result).toEqual({ outcome: "error" });
  });
});
