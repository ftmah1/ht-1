import { ingestFormService, IngestFormDeps } from "../src/forms/services/ingestFormService";
import baseRequest from "../src/forms/examples/person_one.json";
import { buildDeps, savedIngestedForm, trx } from "./fixtures";

describe("ingestFormService", () => {
  it("ingests, transforms, and notifies on a valid payload", async () => {
    const deps = buildDeps();

    const result = await ingestFormService(baseRequest, deps as IngestFormDeps);

    expect(deps.formRepository.getIngestedFormByApplicationRef).toHaveBeenCalledWith(
      baseRequest.application_reference,
    );

    expect(deps.formRepository.insertIngestForm).toHaveBeenCalledWith({
      rawPayload: baseRequest,
      applicationRef: baseRequest.application_reference,
      status: "received",
    });

    expect(deps.lookupPostcode).toHaveBeenCalledWith(baseRequest.address.postcode);

    expect(deps.formRepository.runInTransaction).toHaveBeenCalled();

    expect(deps.formRepository.insertTransformedForm).toHaveBeenCalledWith(trx, {
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

    expect(deps.formRepository.updateIngestedFormStatus).toHaveBeenCalledWith(
      savedIngestedForm.id,
      "ready",
      null,
      trx,
    );

    expect(deps.notifyTeam).toHaveBeenCalledWith(
      baseRequest.application_reference,
      deps.formRepository,
    );

    expect(result).toEqual({ outcome: "success" });
  });

  it("persists the raw payload but errors out when multiple fields are invalid", async () => {
    const deps = buildDeps();

    const invalidRequest: unknown = {
      ...baseRequest,
      gender: "not-a-real-option",
      address: { ...baseRequest.address, postcode: 12345 },
    };

    const result = await ingestFormService(invalidRequest, deps as IngestFormDeps);

    expect(deps.formRepository.insertIngestForm).toHaveBeenCalledWith({
      rawPayload: invalidRequest,
      applicationRef: baseRequest.application_reference,
      status: "received",
    });

    expect(deps.formRepository.updateIngestedFormStatus).toHaveBeenCalledWith(
      savedIngestedForm.id,
      "errored",
      ' gender:Invalid option: expected one of "male"|"female"|"other"; address.postcode:Invalid input: expected string, received number;',
    );

    expect(deps.lookupPostcode).not.toHaveBeenCalled();
    expect(deps.formRepository.insertTransformedForm).not.toHaveBeenCalled();
    expect(deps.notifyTeam).not.toHaveBeenCalled();
    expect(result).toEqual({ outcome: "invalid_request" });
  });

  it("errors out when the postcode lookup fails on every retry", async () => {
    const deps = buildDeps();
    deps.lookupPostcode.mockResolvedValue({ statusCode: 500, body: undefined });

    const result = await ingestFormService(baseRequest, deps as IngestFormDeps);

    expect(deps.lookupPostcode).toHaveBeenCalledTimes(3);
    expect(deps.formRepository.updateIngestedFormStatus).toHaveBeenCalledWith(
      savedIngestedForm.id,
      "errored",
      "PostCode api failed",
    );
    expect(deps.formRepository.insertTransformedForm).not.toHaveBeenCalled();
    expect(deps.notifyTeam).not.toHaveBeenCalled();

    expect(result).toEqual({ outcome: "error" });
  });
});
