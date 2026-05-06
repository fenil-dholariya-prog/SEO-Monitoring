import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { Card, StatCard } from "@/components/ui/card";
import { PagesBarChart, PerformanceChart } from "@/components/charts/report-charts";
import { formatCurrency, formatNumber, formatPercent, monthName } from "@/lib/utils";
import { getReportInsights } from "@/lib/insights/report-insights";
import type { ReportWithRelations } from "@/types/report";

type Row = Record<string, string | number | undefined | null>;

function rows(value: unknown): Row[] {
  return Array.isArray(value) ? (value as Row[]) : [];
}

function MiniTable({ data, columns }: { data: Row[]; columns: Array<{ key: string; label: string }> }) {
  return (
    <div className="overflow-hidden rounded-lg border border-gray-200">
      <table className="w-full border-collapse text-left text-sm">
        <thead className="bg-gray-50 text-xs uppercase tracking-wide text-gray-500">
          <tr>
            {columns.map((column) => (
              <th key={column.key} className="px-4 py-3 font-semibold">
                {column.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {data.slice(0, 8).map((row, index) => (
            <tr key={index}>
              {columns.map((column) => (
                <td key={column.key} className="px-4 py-3 text-gray-700">
                  {row[column.key] ?? "-"}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function ReportPreview({ report, previous }: { report: ReportWithRelations; previous?: ReportWithRelations | null }) {
  const color = report.client.brandColor;
  const insights = getReportInsights(report, previous);
  const topPages = rows(report.gscSnapshot?.topPages);
  const landingPages = rows(report.ga4Snapshot?.topLandingPages);
  const lowCtr = rows(report.gscSnapshot?.lowCtrOpportunities);
  const movement = rows(report.gscSnapshot?.keywordMovement);
  const aiSearch = report.aiSearchSnapshot?.includeInReport ? report.aiSearchSnapshot : null;
  const aiPlatforms = Array.isArray(aiSearch?.visiblePlatforms)
    ? (aiSearch.visiblePlatforms as string[]).map((platform) => ({ platform }))
    : [];
  const aiTopPages = Array.isArray(aiSearch?.topCitedPages)
    ? (aiSearch.topCitedPages as string[]).map((page) => ({ page }))
    : [];
  const aiPlatformBreakdown = rows(aiSearch?.platformBreakdown);
  const performance = [
    { label: "People saw your website on Google", value: report.gscSnapshot?.impressions ?? 0 },
    { label: "People clicked your website", value: report.gscSnapshot?.clicks ?? 0 },
    { label: "Organic sessions", value: report.ga4Snapshot?.organicSessions ?? 0 },
    { label: "Conversions", value: report.ga4Snapshot?.conversions ?? 0 },
  ];
  const pageChartData = landingPages.slice(0, 5).map((page) => ({
    label: String(page.path ?? page.page ?? "/").replace(/^https?:\/\/[^/]+/, "").slice(0, 18),
    sessions: Number(page.sessions ?? page.clicks ?? 0),
  }));

  return (
    <article className="space-y-8 bg-white text-gray-950">
      <section className="rounded-lg border border-gray-200 p-8" style={{ borderTop: `8px solid ${color}` }}>
        <div className="flex flex-wrap items-start justify-between gap-6">
          <div>
            <Badge tone={report.client.clientType === "ECOMMERCE" ? "green" : "blue"}>
              {report.client.clientType === "ECOMMERCE" ? "E-commerce SEO" : "Lead Generation SEO"}
            </Badge>
            <h1 className="mt-5 text-4xl font-semibold tracking-normal text-gray-950">{report.client.name}</h1>
            <p className="mt-2 text-lg text-gray-500">{report.client.websiteUrl}</p>
            <p className="mt-6 text-sm font-medium text-gray-600">
              SEO Monthly Report - {monthName(report.month)} {report.year}
            </p>
          </div>
          <div className="flex items-center gap-4">
            {report.client.agencyLogoUrl ? <Image src={report.client.agencyLogoUrl} alt="Agency logo" width={150} height={48} /> : null}
            {report.client.clientLogoUrl ? <Image src={report.client.clientLogoUrl} alt="Client logo" width={150} height={48} /> : null}
          </div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-4">
        <StatCard label="People saw your website on Google" value={formatNumber(report.gscSnapshot?.impressions)} accent={color} />
        <StatCard label="People clicked your website" value={formatNumber(report.gscSnapshot?.clicks)} accent={color} />
        <StatCard label="Click rate" value={formatPercent(report.gscSnapshot?.ctr)} accent={color} />
        <StatCard label="Average Google ranking" value={report.gscSnapshot?.averagePosition.toFixed(1) ?? "0.0"} accent={color} />
      </section>

      <section className="grid gap-5 lg:grid-cols-[1.2fr_0.8fr]">
        <Card>
          <h2 className="text-xl font-semibold text-gray-950">Executive Summary</h2>
          <p className="mt-3 leading-7 text-gray-600">{report.executiveSummary || "Generate insights to create the executive summary."}</p>
          <div className="mt-5 grid gap-3">
            {insights.slice(0, 4).map((insight) => (
              <div key={insight.title} className="rounded-md bg-gray-50 p-4">
                <p className="text-sm font-semibold text-gray-950">{insight.title}</p>
                <p className="mt-1 text-sm leading-6 text-gray-600">{insight.body}</p>
              </div>
            ))}
          </div>
        </Card>
        <Card>
          <h2 className="text-xl font-semibold text-gray-950">SEO Performance Overview</h2>
          <PerformanceChart data={performance} color={color} />
        </Card>
      </section>

      <section className="report-page-break space-y-5">
        <h2 className="text-2xl font-semibold text-gray-950">Google Search Console Insights</h2>
        <div className="grid gap-5 lg:grid-cols-2">
          <Card>
            <h3 className="mb-4 text-lg font-semibold">Top pages</h3>
            <MiniTable data={topPages} columns={[{ key: "page", label: "Page" }, { key: "clicks", label: "Clicks" }, { key: "impressions", label: "Impressions" }, { key: "ctr", label: "CTR" }]} />
          </Card>
          <Card>
            <h3 className="mb-4 text-lg font-semibold">High impressions, low click rate</h3>
            <MiniTable data={lowCtr} columns={[{ key: "page", label: "Page" }, { key: "impressions", label: "Impressions" }, { key: "ctr", label: "CTR" }, { key: "position", label: "Position" }]} />
          </Card>
          <Card>
            <h3 className="mb-4 text-lg font-semibold">Keyword movement</h3>
            <MiniTable data={movement} columns={[{ key: "query", label: "Keyword" }, { key: "previousPosition", label: "Previous" }, { key: "currentPosition", label: "Current" }, { key: "movement", label: "Change" }]} />
          </Card>
          <Card>
            <h3 className="mb-4 text-lg font-semibold">Top queries</h3>
            <MiniTable data={rows(report.gscSnapshot?.topQueries)} columns={[{ key: "query", label: "Query" }, { key: "clicks", label: "Clicks" }, { key: "impressions", label: "Impressions" }, { key: "position", label: "Position" }]} />
          </Card>
        </div>
      </section>

      <section className="report-page-break grid gap-5 lg:grid-cols-2">
        <Card>
          <h2 className="text-xl font-semibold text-gray-950">Google Analytics 4 Insights</h2>
          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <StatCard label="Organic users" value={formatNumber(report.ga4Snapshot?.organicUsers)} accent={color} />
            <StatCard label="Organic sessions" value={formatNumber(report.ga4Snapshot?.organicSessions)} accent={color} />
            <StatCard label="Engagement rate" value={formatPercent(report.ga4Snapshot?.engagementRate)} accent={color} />
            <StatCard
              label={report.client.clientType === "ECOMMERCE" ? "Revenue from organic traffic" : "Leads from organic traffic"}
              value={report.client.clientType === "ECOMMERCE" ? formatCurrency(report.ga4Snapshot?.revenue) : formatNumber(report.ga4Snapshot?.conversions)}
              accent={color}
            />
          </div>
        </Card>
        <Card>
          <h2 className="text-xl font-semibold text-gray-950">Top organic landing pages</h2>
          <PagesBarChart data={pageChartData} color={color} />
        </Card>
      </section>

      {aiSearch ? (
        <section className="report-page-break space-y-5">
          <div>
            <h2 className="text-2xl font-semibold text-gray-950">AI Search Report</h2>
            <p className="mt-2 text-sm text-gray-500">Traffic, sales, conversions, and AI platforms where the site is visible.</p>
          </div>
          <div className="grid gap-4 md:grid-cols-4">
            <StatCard label="Traffic from AI" value={formatNumber(aiSearch.aiTraffic)} accent={color} />
            <StatCard label="Sales from AI" value={`${aiSearch.aiRevenueCurrency} ${formatNumber(aiSearch.aiSales)}`} accent={color} />
            <StatCard label="AI conversions" value={formatNumber(aiSearch.aiConversions)} accent={color} />
            <StatCard label="AI platforms found" value={formatNumber(aiPlatforms.length)} accent={color} />
          </div>
          <div className="grid gap-5 lg:grid-cols-3">
            <Card>
              <h3 className="mb-4 text-lg font-semibold">AI platforms showing the site</h3>
              <MiniTable data={aiPlatforms} columns={[{ key: "platform", label: "Platform" }]} />
            </Card>
            <Card>
              <h3 className="mb-4 text-lg font-semibold">Platform breakdown</h3>
              <MiniTable
                data={aiPlatformBreakdown}
                columns={[
                  { key: "platform", label: "Platform" },
                  { key: "traffic", label: "Traffic" },
                  { key: "sales", label: "Sales" },
                  { key: "conversions", label: "Conversions" },
                ]}
              />
            </Card>
            <Card>
              <h3 className="mb-4 text-lg font-semibold">Top cited pages</h3>
              <MiniTable data={aiTopPages} columns={[{ key: "page", label: "Page" }]} />
            </Card>
          </div>
          {aiSearch.notes ? (
            <Card>
              <h3 className="text-lg font-semibold">AI search notes</h3>
              <p className="mt-3 text-sm leading-6 text-gray-600">{aiSearch.notes}</p>
            </Card>
          ) : null}
        </section>
      ) : null}

      <section className="report-page-break grid gap-5 lg:grid-cols-3">
        <Card>
          <h2 className="text-xl font-semibold">On-page SEO Work Completed</h2>
          <MiniTable data={report.onPageWorks as unknown as Row[]} columns={[{ key: "workType", label: "Type" }, { key: "title", label: "Work" }, { key: "status", label: "Status" }]} />
        </Card>
        <Card>
          <h2 className="text-xl font-semibold">Off-page SEO / Backlink Work</h2>
          <MiniTable data={report.backlinkWorks as unknown as Row[]} columns={[{ key: "backlinkUrl", label: "Backlink" }, { key: "anchorText", label: "Anchor" }, { key: "status", label: "Status" }]} />
        </Card>
        <Card>
          <h2 className="text-xl font-semibold">Blog and Content Plan</h2>
          <MiniTable data={report.blogPlans as unknown as Row[]} columns={[{ key: "topic", label: "Topic" }, { key: "targetKeyword", label: "Keyword" }, { key: "status", label: "Status" }]} />
        </Card>
      </section>

      <section className="report-page-break grid gap-5 lg:grid-cols-2">
        <Card>
          <h2 className="text-xl font-semibold">Opportunities and Issues</h2>
          <p className="mt-3 leading-7 text-gray-600">{report.issuesSummary}</p>
        </Card>
        <Card>
          <h2 className="text-xl font-semibold">Next Month Action Plan</h2>
          <p className="mt-3 leading-7 text-gray-600">{report.nextMonthFocus}</p>
        </Card>
      </section>
    </article>
  );
}
