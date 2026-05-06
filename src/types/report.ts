import type {
  BacklinkWork,
  BlogPlan,
  Client,
  Ga4Snapshot,
  GscSnapshot,
  AiSearchSnapshot,
  OnPageWork,
  Report,
  ReportExport,
} from "@/generated/prisma/client";

export type JsonRecord = Record<string, unknown>;

export type ReportWithRelations = Report & {
  client: Client;
  gscSnapshot: GscSnapshot | null;
  ga4Snapshot: Ga4Snapshot | null;
  aiSearchSnapshot: AiSearchSnapshot | null;
  onPageWorks: OnPageWork[];
  backlinkWorks: BacklinkWork[];
  blogPlans: BlogPlan[];
  exports: ReportExport[];
};

export type InsightGroup = {
  title: string;
  body: string;
  tone: "positive" | "warning" | "neutral";
};

export type ReportSection = {
  title: string;
  body: string;
};
