import { IngestedForm } from "../src/forms/validations";
import baseRequest from "../src/forms/examples/person_one.json";

describe("IngestedForm validation", () => {
  it("accepts the base valid payload", () => {
    const result = IngestedForm.safeParse(baseRequest);
    expect(result.success).toEqual(true);
  });

  describe("name", () => {
    it("rejects a single-word name", () => {
      const result = IngestedForm.safeParse({ ...baseRequest, name: "John" });
      expect(result.success).toEqual(false);
      expect(result.error?.issues[0].message).toEqual(
        "name must include at least a first and last name",
      );
    });

    it("accepts a two-word name", () => {
      const result = IngestedForm.safeParse({ ...baseRequest, name: "John Doe" });
      expect(result.success).toEqual(true);
    });

    it("accepts the three-word name from the person_two fixture", () => {
      const result = IngestedForm.safeParse({
        ...baseRequest,
        name: "Andy James Smith-Jones",
      });
      expect(result.success).toEqual(true);
    });
  });

  describe("date_of_birth", () => {
    it("accepts the base fixture's ISO date", () => {
      const result = IngestedForm.safeParse({ ...baseRequest, date_of_birth: "1990-01-01" });
      expect(result.success).toEqual(true);
    });

    it("rejects a non-ISO date format", () => {
      const result = IngestedForm.safeParse({ ...baseRequest, date_of_birth: "01/01/1990" });
      expect(result.success).toEqual(false);
    });

    it("rejects a garbage date string", () => {
      const result = IngestedForm.safeParse({ ...baseRequest, date_of_birth: "not-a-date" });
      expect(result.success).toEqual(false);
    });
  });

  describe("email", () => {
    it("accepts a valid email", () => {
      const result = IngestedForm.safeParse({ ...baseRequest, email: "jane.doe@example.com" });
      expect(result.success).toEqual(true);
    });

    it("rejects an invalid email", () => {
      const result = IngestedForm.safeParse({ ...baseRequest, email: "not-an-email" });
      expect(result.success).toEqual(false);
    });
  });

  describe("gender", () => {
    it("accepts male", () => {
      const result = IngestedForm.safeParse({ ...baseRequest, gender: "male" });
      expect(result.success).toEqual(true);
    });

    it("accepts female", () => {
      const result = IngestedForm.safeParse({ ...baseRequest, gender: "female" });
      expect(result.success).toEqual(true);
    });

    it("accepts other", () => {
      const result = IngestedForm.safeParse({ ...baseRequest, gender: "other" });
      expect(result.success).toEqual(true);
    });

    it("rejects a value outside male, female, or other", () => {
      const result = IngestedForm.safeParse({ ...baseRequest, gender: "unspecified" });
      expect(result.success).toEqual(false);
    });
  });

  describe("application_reference", () => {
    it("accepts the base fixture's value", () => {
      const result = IngestedForm.safeParse({
        ...baseRequest,
        application_reference: baseRequest.application_reference,
      });
      expect(result.success).toEqual(true);
    });

    it("rejects an empty string", () => {
      const result = IngestedForm.safeParse({ ...baseRequest, application_reference: "" });
      expect(result.success).toEqual(false);
    });

    it("rejects a whitespace-only string", () => {
      const result = IngestedForm.safeParse({ ...baseRequest, application_reference: "   " });
      expect(result.success).toEqual(false);
    });
  });

  describe("session_id", () => {
    it("rejects an empty string", () => {
      const result = IngestedForm.safeParse({ ...baseRequest, session_id: "" });
      expect(result.success).toEqual(false);
    });

    it("rejects a whitespace-only string", () => {
      const result = IngestedForm.safeParse({ ...baseRequest, session_id: "   " });
      expect(result.success).toEqual(false);
    });
  });

  describe("mobile_number", () => {
    it("rejects an empty string", () => {
      const result = IngestedForm.safeParse({ ...baseRequest, mobile_number: "" });
      expect(result.success).toEqual(false);
    });

    it("rejects a whitespace-only string", () => {
      const result = IngestedForm.safeParse({ ...baseRequest, mobile_number: "   " });
      expect(result.success).toEqual(false);
    });
  });

  describe("address_line_1", () => {
    it("rejects an empty string", () => {
      const result = IngestedForm.safeParse({
        ...baseRequest,
        address: { ...baseRequest.address, address_line_1: "" },
      });
      expect(result.success).toEqual(false);
    });

    it("rejects a whitespace-only string", () => {
      const result = IngestedForm.safeParse({
        ...baseRequest,
        address: { ...baseRequest.address, address_line_1: "   " },
      });
      expect(result.success).toEqual(false);
    });
  });

  describe("address_line_2", () => {
    it("rejects an empty string", () => {
      const result = IngestedForm.safeParse({
        ...baseRequest,
        address: { ...baseRequest.address, address_line_2: "" },
      });
      expect(result.success).toEqual(false);
    });

    it("rejects a whitespace-only string", () => {
      const result = IngestedForm.safeParse({
        ...baseRequest,
        address: { ...baseRequest.address, address_line_2: "   " },
      });
      expect(result.success).toEqual(false);
    });
  });

  describe("country", () => {
    it("rejects an empty string", () => {
      const result = IngestedForm.safeParse({
        ...baseRequest,
        address: { ...baseRequest.address, country: "" },
      });
      expect(result.success).toEqual(false);
    });

    it("rejects a whitespace-only string", () => {
      const result = IngestedForm.safeParse({
        ...baseRequest,
        address: { ...baseRequest.address, country: "   " },
      });
      expect(result.success).toEqual(false);
    });
  });

  describe("optional fields", () => {
    it("accepts a payload with phone_number explicitly set to undefined", () => {
      const result = IngestedForm.safeParse({ ...baseRequest, phone_number: undefined });
      expect(result.success).toEqual(true);
    });

    it("accepts an unusual but present phone_number value from the person_three fixture", () => {
      const result = IngestedForm.safeParse({ ...baseRequest, phone_number: "0001" });
      expect(result.success).toEqual(true);
    });

    it("accepts a payload with address_line_3 explicitly set to undefined", () => {
      const result = IngestedForm.safeParse({
        ...baseRequest,
        address: { ...baseRequest.address, address_line_3: undefined },
      });
      expect(result.success).toEqual(true);
    });

    it("accepts a present address_line_3 value", () => {
      const result = IngestedForm.safeParse({
        ...baseRequest,
        address: { ...baseRequest.address, address_line_3: "London" },
      });
      expect(result.success).toEqual(true);
    });
  });
});
