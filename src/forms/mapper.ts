import { GenderTransformed } from "../db/types";
import { IngestedFormSchema } from "./schemas/ingested_schema";
import { TransformedFormSchema } from "./schemas/transformed_schema";

export function mapper(
  ingestedForm: IngestedFormSchema,
  latitude: number,
  longitude: number,
): TransformedFormSchema {
  const name = ingestedForm.name.split(/\s+/);
  const firstName = name.slice(0, -1).join(" ");
  const lastName = name[name.length - 1];
  return {
    sessionId: ingestedForm.session_id,
    applicationReference: ingestedForm.application_reference,
    firstName,
    lastName,
    email: ingestedForm.email,
    gender:
      ingestedForm.gender === "other"
        ? "prefer-not-to-say"
        : (ingestedForm.gender as GenderTransformed),
    dateOfBirth: new Date(ingestedForm.date_of_birth),
    phoneNumber: ingestedForm.phone_number,
    mobileNumber: ingestedForm.mobile_number,
    addressLine1: ingestedForm.address.address_line_1,
    addressLine2: ingestedForm.address.address_line_2,
    addressLine3: ingestedForm.address.address_line_3,
    postcode: ingestedForm.address.postcode,
    country: ingestedForm.address.country,
    longitude,
    latitude,
  };
}
