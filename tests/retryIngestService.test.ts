// Purely Ai written
import { retryIngestService } from "../src/forms/services/retryIngestService";
import { getIngestedFormById } from "../src/db/queries/ingestedForm";
import { ingestFormService } from "../src/forms/services/ingestFormService";
import { db } from "../src/db";
import baseRequest from "../src/forms/examples/person_one.json";
import { Selectable } from "kysely";
import { IngestedForms } from "../src/db/types";

jest.mock("../src/db/queries/ingestedForm");
jest.mock("../src/forms/services/ingestFormService");
jest.mock("../src/db", () => ({
  db: {},
}));

const mockedGetIngestedFormById = jest.mocked(getIngestedFormById);
const mockedIngestFormService = jest.mocked(ingestFormService);

const savedIngestedForm: Selectable<IngestedForms> = {
  id: "ingested-form-id-1",
  applicationRef: baseRequest.application_reference,
  status: "received",
  rawPayload: baseRequest,
  errorMessage: null,
  receivedAt: new Date(),
  updatedAt: new Date(),
};

describe("retryIngestService", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("returns not_found when no matching row exists", async () => {
    mockedGetIngestedFormById.mockResolvedValue(undefined);

    const result = await retryIngestService(savedIngestedForm.id);

    expect(getIngestedFormById).toHaveBeenCalledWith(db, savedIngestedForm.id);
    expect(ingestFormService).not.toHaveBeenCalled();
    expect(result).toEqual({ outcome: "not_found" });
  });

  it("delegates to ingestFormService with the stored raw payload when a row exists", async () => {
    mockedGetIngestedFormById.mockResolvedValue(savedIngestedForm);
    mockedIngestFormService.mockResolvedValue({ outcome: "success" });

    const result = await retryIngestService(savedIngestedForm.id);

    expect(ingestFormService).toHaveBeenCalledWith(savedIngestedForm.rawPayload);
    expect(result).toEqual({ outcome: "success" });
  });
});
