import * as z from "zod";

//validating against the agreed schema which just says string, not using z.email(), z.numbers(), etc...

export const IngestedForm = z.object({
  session_id: z.string(),
  application_reference: z.string(),
  name: z.string(),
  email: z.string(),
  gender: z.literal(["male", "female", "other"]),
  date_of_birth: z.string(),
  phone_number: z.union([z.string(), z.undefined()]),
  mobile_number: z.string(),
  address: z.object({
    address_line_1: z.string(),
    address_line_2: z.string(),
    address_line_3: z.union([z.string(), z.undefined()]),
    postcode: z.string(),
    country: z.string(),
  }),
});
