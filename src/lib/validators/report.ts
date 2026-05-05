import { z } from "zod";

export const reportSchema = z
  .object({
    clientId: z.string().min(1, "Select a client"),
    month: z.coerce.number().int().min(1).max(12),
    year: z.coerce.number().int().min(2020).max(2100),
    startDate: z.coerce.date(),
    endDate: z.coerce.date(),
  })
  .refine((data) => data.startDate <= data.endDate, {
    message: "Start date must be before end date",
    path: ["endDate"],
  });

export const reportCopySchema = z.object({
  executiveSummary: z.string().trim().max(4000).optional(),
  winsSummary: z.string().trim().max(4000).optional(),
  issuesSummary: z.string().trim().max(4000).optional(),
  nextMonthFocus: z.string().trim().max(4000).optional(),
});

export const onPageWorkSchema = z.object({
  reportId: z.string(),
  pageUrl: z.string().trim().min(1, "Page URL is required").max(500),
  workType: z.string().trim().min(2, "Work type is required").max(80),
  title: z.string().trim().min(2, "Title is required").max(180),
  description: z.string().trim().min(5, "Description is required").max(2000),
  status: z.string().trim().min(2, "Status is required").max(80),
  impact: z.string().trim().min(2, "Impact is required").max(2000),
});

export const backlinkWorkSchema = z.object({
  reportId: z.string(),
  backlinkUrl: z.string().url("Enter a valid backlink URL"),
  targetUrl: z.string().trim().min(1, "Target URL is required").max(500),
  anchorText: z.string().trim().min(1, "Anchor text is required").max(180),
  domainRating: z.coerce.number().min(0).max(100).optional().or(z.literal("").transform(() => undefined)),
  linkType: z.string().trim().min(2, "Link type is required").max(80),
  status: z.string().trim().min(2, "Status is required").max(80),
  notes: z.string().trim().max(2000).optional(),
});

export const blogPlanSchema = z.object({
  reportId: z.string(),
  topic: z.string().trim().min(2, "Topic is required").max(180),
  targetKeyword: z.string().trim().min(2, "Target keyword is required").max(120),
  searchIntent: z.string().trim().min(2, "Search intent is required").max(80),
  targetPage: z.string().trim().min(1, "Target page is required").max(500),
  status: z.string().trim().min(2, "Status is required").max(80),
  notes: z.string().trim().max(2000).optional(),
});

export const aiSearchSchema = z.object({
  reportId: z.string(),
  includeInReport: z.preprocess((value) => value === "on" || value === "true", z.boolean()).default(false),
  aiTraffic: z.coerce.number().int().min(0).default(0),
  aiSales: z.coerce.number().min(0).default(0),
  aiConversions: z.coerce.number().int().min(0).default(0),
  aiRevenueCurrency: z.string().trim().min(3).max(3).default("USD"),
  visiblePlatforms: z.string().trim().max(1000).optional(),
  platformBreakdown: z.string().trim().max(4000).optional(),
  topCitedPages: z.string().trim().max(4000).optional(),
  notes: z.string().trim().max(3000).optional(),
});

export type ReportFormInput = z.input<typeof reportSchema>;
export type ReportFormOutput = z.output<typeof reportSchema>;
export type OnPageWorkInput = z.infer<typeof onPageWorkSchema>;
export type BacklinkWorkInput = z.infer<typeof backlinkWorkSchema>;
export type BlogPlanInput = z.infer<typeof blogPlanSchema>;
export type AiSearchInput = z.infer<typeof aiSearchSchema>;
