import * as z from "zod";

// i see application_reference could be in regex format GRU-d{6}-d{4}, session-id could be uuid.
// But i did not want to assume that and tighten the validation.I would only enforce it after confirming.
// Same goes for mobile number and address, i did not want to assume only people in uk can register so
// purposely left it loose, did not apply tight regex.

export const IngestedForm = z.object({
  session_id: z.string().trim().min(1),
  application_reference: z.string().trim().min(1),
  name: z.string().refine((val) => val.trim().split(/\s+/).length >= 2, {
    message: "name must include at least a first and last name", //mandatory for transformedForm
  }),
  email: z.email(),
  gender: z.literal(["male", "female", "other"]),
  date_of_birth: z.iso.date(),
  phone_number: z.union([z.string(), z.undefined()]),
  mobile_number: z.string().trim().min(1),
  address: z.object({
    address_line_1: z.string().trim().min(1),
    address_line_2: z.string().trim().min(1),
    address_line_3: z.union([z.string(), z.undefined()]),
    postcode: z.string().trim().min(1),
    country: z.string().trim().min(1),
  }),
});
