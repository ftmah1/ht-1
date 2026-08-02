import { mapper } from "../src/forms/mapper";
import { IngestedFormSchema } from "../src/forms/schemas/ingested_schema";
import baseRequest from "../src/forms/examples/person_one.json";

const baseForm: IngestedFormSchema = baseRequest as IngestedFormSchema;

describe("mapper", () => {
  describe("gender mapping", () => {
    it("maps male straight through", () => {
      const result = mapper({ ...baseForm, gender: "male" }, 50, 50);
      expect(result.gender).toEqual("male");
    });

    it("maps female straight through", () => {
      const result = mapper({ ...baseForm, gender: "female" }, 50, 50);
      expect(result.gender).toEqual("female");
    });

    it("maps other to prefer-not-to-say", () => {
      const result = mapper({ ...baseForm, gender: "other" }, 50, 50);
      expect(result.gender).toEqual("prefer-not-to-say");
    });
  });

  describe("name splitting", () => {
    it("splits a two-word name into first and last name", () => {
      const result = mapper({ ...baseForm, name: "John Doe" }, 50, 50);
      expect(result.firstName).toEqual("John");
      expect(result.lastName).toEqual("Doe");
    });

    it("splits a three-word name from the person_two fixture into first and last name", () => {
      const result = mapper({ ...baseForm, name: "Andy James Smith-Jones" }, 50, 50);
      expect(result.firstName).toEqual("Andy James");
      expect(result.lastName).toEqual("Smith-Jones");
    });
  });

  describe("full transform", () => {
    it("maps every field on a normal input", () => {
      const result = mapper(baseForm, 50, 50);
      expect(result).toEqual({
        sessionId: baseForm.session_id,
        applicationReference: baseForm.application_reference,
        firstName: "John",
        lastName: "Doe",
        email: baseForm.email,
        gender: baseForm.gender,
        dateOfBirth: new Date(baseForm.date_of_birth),
        phoneNumber: baseForm.phone_number,
        mobileNumber: baseForm.mobile_number,
        addressLine1: baseForm.address.address_line_1,
        addressLine2: baseForm.address.address_line_2,
        addressLine3: baseForm.address.address_line_3,
        postcode: baseForm.address.postcode,
        country: baseForm.address.country,
        latitude: 50,
        longitude: 50,
      });
    });
  });
});
