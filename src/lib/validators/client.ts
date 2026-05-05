import { z } from "zod";

const optionalUrl = z.preprocess(
  (value) => (typeof value === "string" && value.trim() === "" ? undefined : value),
  z.string().url("Enter a valid URL").optional(),
);

const optionalText = z.preprocess(
  (value) => (typeof value === "string" && value.trim() === "" ? undefined : value),
  z.string().trim().optional(),
);

export const clientSchema = z.object({
  name: z.string().trim().min(2, "Client name is required").max(120),
  websiteUrl: z.string().url("Enter a valid website URL"),
  clientType: z.enum(["ECOMMERCE", "LEAD_GENERATION"]),
  industry: z.string().trim().min(2, "Industry is required").max(120),
  targetCountry: z.string().trim().min(2, "Target country is required").max(120),
  brandColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/, "Use a hex colour"),
  agencyLogoUrl: optionalUrl,
  clientLogoUrl: optionalUrl,
  gscPropertyUrl: optionalText,
  ga4PropertyId: optionalText,
  ahrefsProjectId: optionalText,
});

export type ClientFormInput = z.input<typeof clientSchema>;
export type ClientFormOutput = z.output<typeof clientSchema>;
