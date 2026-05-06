import type { ReportWithRelations, InsightGroup } from "@/types/report";
import { formatCurrency, formatNumber, formatPercent } from "@/lib/utils";

type MetricSnapshot = {
  clicks?: number;
  impressions?: number;
  ctr?: number;
  averagePosition?: number;
  organicSessions?: number;
  conversions?: number;
};

function changed(current?: number | null, previous?: number | null) {
  if (current == null || previous == null || previous === 0) return null;
  return ((current - previous) / previous) * 100;
}

export function analyzeGscPerformance(current: MetricSnapshot, previous?: MetricSnapshot | null): InsightGroup[] {
  const insights: InsightGroup[] = [];
  const impressionChange = changed(current.impressions, previous?.impressions);
  const clickChange = changed(current.clicks, previous?.clicks);

  if (impressionChange && impressionChange > 5 && (!clickChange || clickChange < impressionChange / 2)) {
    insights.push({
      title: "Visibility is ahead of clicks",
      tone: "warning",
      body:
        "Search visibility improved, but clicks did not grow at the same speed. This usually means meta titles and descriptions need stronger offers, clearer keywords, or better page positioning.",
    });
  }

  if (previous?.averagePosition && current.averagePosition && current.averagePosition < previous.averagePosition) {
    insights.push({
      title: "Average Google ranking improved",
      tone: "positive",
      body:
        "Keyword visibility improved this month, which means SEO work is helping more pages move closer to page one.",
    });
  }

  insights.push({
    title: "Search performance snapshot",
    tone: "neutral",
    body: `${formatNumber(current.impressions)} people saw the website on Google and ${formatNumber(current.clicks)} people clicked through. The click rate is ${formatPercent(current.ctr)} with an average Google ranking of ${current.averagePosition?.toFixed(1) ?? "0.0"}.`,
  });

  return insights;
}

export function analyzeGa4Performance(current: MetricSnapshot, previous?: MetricSnapshot | null): InsightGroup[] {
  const insights: InsightGroup[] = [];
  const sessionChange = changed(current.organicSessions, previous?.organicSessions);
  const conversionChange = changed(current.conversions, previous?.conversions);

  if (sessionChange && sessionChange > 5 && conversionChange && conversionChange < 0) {
    insights.push({
      title: "Traffic quality needs attention",
      tone: "warning",
      body:
        "Traffic quality or landing page conversion needs attention. The website received more organic visits, but fewer users completed key actions.",
    });
  }

  insights.push({
    title: "Organic visit quality",
    tone: "neutral",
    body: `${formatNumber(current.organicSessions)} organic sessions produced ${formatNumber(current.conversions)} conversions. This connects SEO growth to the actions that matter for the business.`,
  });

  return insights;
}

export function analyzeCtrOpportunities(report: ReportWithRelations): InsightGroup[] {
  const pages = (report.gscSnapshot?.lowCtrOpportunities as Array<{ page: string; impressions: number; ctr: number }> | null) ?? [];
  if (!pages.length) {
    return [{ title: "CTR opportunities", tone: "positive", body: "No major high-impression, low-click-rate pages were detected in this reporting set." }];
  }
  return [
    {
      title: "High-visibility pages need stronger snippets",
      tone: "warning",
      body:
        "These pages are getting visibility but not enough clicks. They should be prioritized for CTR-focused meta title and description updates.",
    },
  ];
}

export function analyzeKeywordMovement(report: ReportWithRelations): InsightGroup[] {
  const movement = (report.gscSnapshot?.keywordMovement as Array<{ query: string; movement: number }> | null) ?? [];
  const winners = movement.filter((item) => item.movement > 0).length;
  const declines = movement.filter((item) => item.movement < 0).length;
  return [
    {
      title: "Keyword movement",
      tone: winners >= declines ? "positive" : "warning",
      body: `${winners} tracked keyword opportunities improved while ${declines} declined. Positions 4-10 should be treated as near-term ranking opportunities; positions 11-20 are good candidates for content expansion and internal links.`,
    },
  ];
}

export function analyzeClientTypeMetrics(report: ReportWithRelations): InsightGroup[] {
  const ga4 = report.ga4Snapshot;
  if (!ga4) return [];

  if (report.client.clientType === "ECOMMERCE") {
    return [
      {
        title: "E-commerce SEO value",
        tone: "positive",
        body: `${formatCurrency(ga4.revenue)} revenue from organic traffic and ${formatNumber(ga4.transactions)} transactions were tracked. Product and collection landing pages should remain the main optimization focus.`,
      },
    ];
  }

  const leadData = ga4.leadGenData as { formSubmissions?: number; phoneClicks?: number; whatsappClicks?: number; contactPageVisits?: number } | null;
  return [
    {
      title: "Lead-generation SEO value",
      tone: "positive",
      body: `${formatNumber(ga4.conversions)} leads from organic traffic were tracked, including ${formatNumber(leadData?.formSubmissions)} form submissions, ${formatNumber(leadData?.phoneClicks)} phone clicks, and ${formatNumber(leadData?.whatsappClicks)} WhatsApp clicks.`,
    },
  ];
}

export function generateExecutiveSummary(report: ReportWithRelations, previous?: ReportWithRelations | null) {
  const gscInsights = analyzeGscPerformance(
    {
      clicks: report.gscSnapshot?.clicks,
      impressions: report.gscSnapshot?.impressions,
      ctr: report.gscSnapshot?.ctr,
      averagePosition: report.gscSnapshot?.averagePosition,
    },
    previous?.gscSnapshot ?? null,
  );
  const ga4Insights = analyzeGa4Performance(
    {
      organicSessions: report.ga4Snapshot?.organicSessions,
      conversions: report.ga4Snapshot?.conversions,
    },
    previous?.ga4Snapshot ?? null,
  );
  const backlinkLine = report.backlinkWorks.length
    ? "New backlinks were added this month to support authority building and improve ranking potential for target pages."
    : "No new backlinks were recorded this month, so authority-building should be reviewed in the next action plan.";

  return [
    gscInsights[0]?.body,
    ga4Insights[0]?.body,
    backlinkLine,
    ...analyzeClientTypeMetrics(report).map((insight) => insight.body),
  ]
    .filter(Boolean)
    .join(" ");
}

export function generateNextMonthPlan(report: ReportWithRelations) {
  const typeFocus =
    report.client.clientType === "ECOMMERCE"
      ? "Prioritize product/category CTR improvements, collection page SEO updates, and blog-to-product internal linking."
      : "Prioritize service page traffic, location page improvements, contact page conversion checks, and local SEO opportunities.";

  return [
    "Rewrite titles and descriptions for high-impression pages with low click rate.",
    "Expand content around ranking opportunities in positions 4-10 and 11-20.",
    typeFocus,
    "Continue backlink outreach for priority pages and document quality notes.",
    "Confirm any client approvals needed for new content, page edits, or conversion tracking changes.",
  ].join(" ");
}

export function getReportInsights(report: ReportWithRelations, previous?: ReportWithRelations | null) {
  return [
    ...analyzeGscPerformance(
      {
        clicks: report.gscSnapshot?.clicks,
        impressions: report.gscSnapshot?.impressions,
        ctr: report.gscSnapshot?.ctr,
        averagePosition: report.gscSnapshot?.averagePosition,
      },
      previous?.gscSnapshot ?? null,
    ),
    ...analyzeCtrOpportunities(report),
    ...analyzeKeywordMovement(report),
    ...analyzeGa4Performance(
      {
        organicSessions: report.ga4Snapshot?.organicSessions,
        conversions: report.ga4Snapshot?.conversions,
      },
      previous?.ga4Snapshot ?? null,
    ),
    ...analyzeClientTypeMetrics(report),
  ];
}
