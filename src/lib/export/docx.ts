import {
  AlignmentType,
  Document,
  HeadingLevel,
  Packer,
  Paragraph,
  Table,
  TableCell,
  TableRow,
  TextRun,
  WidthType,
} from "docx";
import type { ReportWithRelations } from "@/types/report";
import { formatCurrency, formatNumber, formatPercent, monthName } from "@/lib/utils";
import { getReportInsights } from "@/lib/insights/report-insights";

type Row = Record<string, unknown>;

function rows(value: unknown): Row[] {
  return Array.isArray(value) ? (value as Row[]) : [];
}

function para(text: string) {
  return new Paragraph({ children: [new TextRun(text)] });
}

function heading(text: string) {
  return new Paragraph({ text, heading: HeadingLevel.HEADING_2, spacing: { before: 360, after: 120 } });
}

function table(data: Row[], columns: Array<{ key: string; label: string }>) {
  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: [
      new TableRow({
        children: columns.map((column) => new TableCell({ children: [para(column.label)] })),
      }),
      ...data.slice(0, 10).map(
        (row) =>
          new TableRow({
            children: columns.map((column) => new TableCell({ children: [para(String(row[column.key] ?? "-"))] })),
          }),
      ),
    ],
  });
}

export async function buildReportDocx(report: ReportWithRelations, previous?: ReportWithRelations | null) {
  const insights = getReportInsights(report, previous);
  const ahrefs = report.ahrefsSnapshot;
  const aiSearch = report.aiSearchSnapshot?.includeInReport ? report.aiSearchSnapshot : null;
  const aiPlatforms = Array.isArray(aiSearch?.visiblePlatforms) ? (aiSearch.visiblePlatforms as string[]).map((platform) => ({ platform })) : [];
  const aiTopPages = Array.isArray(aiSearch?.topCitedPages) ? (aiSearch.topCitedPages as string[]).map((page) => ({ page })) : [];
  const doc = new Document({
    sections: [
      {
        children: [
          new Paragraph({
            text: `${report.client.name} SEO Monthly Report`,
            heading: HeadingLevel.TITLE,
            alignment: AlignmentType.CENTER,
          }),
          para(`${report.client.websiteUrl} | ${monthName(report.month)} ${report.year}`),
          para(report.client.clientType === "ECOMMERCE" ? "E-commerce SEO" : "Lead Generation SEO"),
          heading("Executive Summary"),
          para(report.executiveSummary || "No executive summary generated yet."),
          ...insights.slice(0, 5).flatMap((insight) => [new Paragraph({ text: insight.title, heading: HeadingLevel.HEADING_3 }), para(insight.body)]),
          heading("SEO Performance Overview"),
          table(
            [
              { label: "People saw your website on Google", value: formatNumber(report.gscSnapshot?.impressions) },
              { label: "People clicked your website", value: formatNumber(report.gscSnapshot?.clicks) },
              { label: "Click rate", value: formatPercent(report.gscSnapshot?.ctr) },
              { label: "Average Google ranking", value: report.gscSnapshot?.averagePosition.toFixed(1) ?? "0.0" },
            ],
            [
              { key: "label", label: "Metric" },
              { key: "value", label: "Value" },
            ],
          ),
          heading("Google Search Console Insights"),
          table(rows(report.gscSnapshot?.topQueries), [
            { key: "query", label: "Query" },
            { key: "clicks", label: "Clicks" },
            { key: "impressions", label: "Impressions" },
            { key: "position", label: "Position" },
          ]),
          table(rows(report.gscSnapshot?.lowCtrOpportunities), [
            { key: "page", label: "Low CTR page" },
            { key: "impressions", label: "Impressions" },
            { key: "ctr", label: "CTR" },
            { key: "position", label: "Position" },
          ]),
          heading("Google Analytics 4 Insights"),
          table(
            [
              { label: "Organic users", value: formatNumber(report.ga4Snapshot?.organicUsers) },
              { label: "Organic sessions", value: formatNumber(report.ga4Snapshot?.organicSessions) },
              { label: "Engagement rate", value: formatPercent(report.ga4Snapshot?.engagementRate) },
              {
                label: report.client.clientType === "ECOMMERCE" ? "Revenue from organic traffic" : "Leads from organic traffic",
                value: report.client.clientType === "ECOMMERCE" ? formatCurrency(report.ga4Snapshot?.revenue) : formatNumber(report.ga4Snapshot?.conversions),
              },
            ],
            [
              { key: "label", label: "Metric" },
              { key: "value", label: "Value" },
            ],
          ),
          table(rows(report.ga4Snapshot?.topLandingPages), [
            { key: "path", label: "Landing page" },
            { key: "sessions", label: "Sessions" },
            { key: "conversions", label: "Conversions" },
            { key: "revenue", label: "Revenue" },
          ]),
          ...(aiSearch
            ? [
                heading("AI Search Report"),
                table(
                  [
                    { label: "Traffic from AI", value: formatNumber(aiSearch.aiTraffic) },
                    { label: "Sales from AI", value: `${aiSearch.aiRevenueCurrency} ${formatNumber(aiSearch.aiSales)}` },
                    { label: "AI conversions", value: formatNumber(aiSearch.aiConversions) },
                    { label: "AI platforms found", value: formatNumber(aiPlatforms.length) },
                  ],
                  [
                    { key: "label", label: "Metric" },
                    { key: "value", label: "Value" },
                  ],
                ),
                new Paragraph({ text: "AI Platforms Showing the Site", heading: HeadingLevel.HEADING_3 }),
                table(aiPlatforms, [{ key: "platform", label: "Platform" }]),
                new Paragraph({ text: "Platform Breakdown", heading: HeadingLevel.HEADING_3 }),
                table(rows(aiSearch.platformBreakdown), [
                  { key: "platform", label: "Platform" },
                  { key: "traffic", label: "Traffic" },
                  { key: "sales", label: "Sales" },
                  { key: "conversions", label: "Conversions" },
                ]),
                new Paragraph({ text: "Top Cited Pages", heading: HeadingLevel.HEADING_3 }),
                table(aiTopPages, [{ key: "page", label: "Page" }]),
                new Paragraph({ text: "AI Search Notes", heading: HeadingLevel.HEADING_3 }),
                para(aiSearch.notes || ""),
              ]
            : []),
          heading("On-page SEO Work Completed"),
          table(report.onPageWorks as unknown as Row[], [
            { key: "pageUrl", label: "Page" },
            { key: "workType", label: "Type" },
            { key: "title", label: "Work" },
            { key: "impact", label: "Impact" },
          ]),
          heading("Off-page SEO / Backlink Work"),
          table(report.backlinkWorks as unknown as Row[], [
            { key: "backlinkUrl", label: "Backlink" },
            { key: "targetUrl", label: "Target" },
            { key: "anchorText", label: "Anchor" },
            { key: "status", label: "Status" },
          ]),
          heading("Ahrefs Off-page SEO Insights"),
          table(
            [
              { label: "Total backlinks", value: formatNumber(ahrefs?.totalBacklinks) },
              { label: "New backlinks", value: formatNumber(ahrefs?.newBacklinks) },
              { label: "Lost backlinks", value: formatNumber(ahrefs?.lostBacklinks) },
              { label: "Referring domains", value: formatNumber(ahrefs?.referringDomains) },
            ],
            [
              { key: "label", label: "Metric" },
              { key: "value", label: "Value" },
            ],
          ),
          new Paragraph({ text: "Anchor Text Distribution", heading: HeadingLevel.HEADING_3 }),
          table(rows(ahrefs?.anchorTextDistribution), [
            { key: "anchorText", label: "Anchor text" },
            { key: "backlinks", label: "Backlinks" },
            { key: "share", label: "Share" },
          ]),
          new Paragraph({ text: "Top Referring Pages", heading: HeadingLevel.HEADING_3 }),
          table(rows(ahrefs?.topReferringPages), [
            { key: "sourceUrl", label: "Referring page" },
            { key: "domainRating", label: "DR" },
            { key: "traffic", label: "Traffic" },
          ]),
          new Paragraph({ text: "Lost Backlinks", heading: HeadingLevel.HEADING_3 }),
          table(rows(ahrefs?.lostBacklinksData), [
            { key: "sourceUrl", label: "Lost backlink" },
            { key: "targetUrl", label: "Target" },
            { key: "domainRating", label: "DR" },
          ]),
          new Paragraph({ text: "Competitor Backlink Opportunities", heading: HeadingLevel.HEADING_3 }),
          table(rows(ahrefs?.competitorBacklinkGap), [
            { key: "referringPage", label: "Opportunity" },
            { key: "competitorUrl", label: "Competitor" },
            { key: "domainRating", label: "DR" },
          ]),
          new Paragraph({ text: "Backlink Quality Notes", heading: HeadingLevel.HEADING_3 }),
          ...(Array.isArray(ahrefs?.backlinkQualityNotes)
            ? (ahrefs.backlinkQualityNotes as string[]).map((note) => para(note))
            : [para("Fetch Ahrefs data to add backlink quality notes.")]),
          heading("Blog and Content Plan"),
          table(report.blogPlans as unknown as Row[], [
            { key: "topic", label: "Topic" },
            { key: "targetKeyword", label: "Keyword" },
            { key: "searchIntent", label: "Intent" },
            { key: "targetPage", label: "Target internal link" },
          ]),
          heading("Opportunities and Issues"),
          para(report.issuesSummary || ""),
          heading("Next Month Action Plan"),
          para(report.nextMonthFocus || ""),
        ],
      },
    ],
  });
  return Packer.toBuffer(doc);
}
