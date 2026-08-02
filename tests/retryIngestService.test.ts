import { retryIngestService } from "../src/forms/services/retryIngestService";
import { IngestFormDeps } from "../src/forms/services/ingestFormService";
import baseRequest from "../src/forms/examples/person_one.json";
import { buildDeps, savedIngestedForm } from "./fixtures";

describe("retryIngestService", () => {
  it("returns not_found when no matching row exists", async () => {
    const deps = buildDeps();
    deps.formRepository.getIngestedFormById.mockResolvedValue(undefined);

    const result = await retryIngestService("ingested-form-id-1", deps as IngestFormDeps);

    expect(deps.formRepository.getIngestedFormById).toHaveBeenCalledWith("ingested-form-id-1");
    expect(deps.formRepository.getIngestedFormByApplicationRef).not.toHaveBeenCalled();
    expect(deps.lookupPostcode).not.toHaveBeenCalled();
    expect(deps.notifyTeam).not.toHaveBeenCalled();
    expect(result).toEqual({ outcome: "not_found" });
  });

  it("delegates to the ingest pipeline using the stored raw payload when a row exists", async () => {
    const deps = buildDeps();
    deps.formRepository.getIngestedFormById.mockResolvedValue({
      ...savedIngestedForm,
      rawPayload: baseRequest,
    });

    const result = await retryIngestService(savedIngestedForm.id, deps as IngestFormDeps);

    expect(deps.formRepository.getIngestedFormById).toHaveBeenCalledWith(savedIngestedForm.id);
    expect(deps.lookupPostcode).toHaveBeenCalledWith(baseRequest.address.postcode);
    expect(result).toEqual({ outcome: "success" });
  });
});
