import type { ReportWithRelations } from "@/types/report";
import { formatCurrency, formatNumber, formatPercent, monthName } from "@/lib/utils";
import { getReportInsights } from "@/lib/insights/report-insights";

type Row = Record<string, unknown>;

function escapeHtml(value: unknown) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function rows(value: unknown): Row[] {
  return Array.isArray(value) ? (value as Row[]) : [];
}

function table(data: Row[], columns: Array<{ key: string; label: string }>) {
  const body = data
    .slice(0, 10)
    .map(
      (row) =>
        `<tr>${columns.map((column) => `<td>${escapeHtml(row[column.key]) || "-"}</td>`).join("")}</tr>`,
    )
    .join("");
  return `<table><thead><tr>${columns.map((column) => `<th>${escapeHtml(column.label)}</th>`).join("")}</tr></thead><tbody>${body}</tbody></table>`;
}

function barChart(data: Row[], key = "sessions", color = "#111827") {
  const max = Math.max(...data.map((row) => Number(row[key] ?? 0)), 1);
  return `<div class="bars">${data
    .slice(0, 6)
    .map((row) => {
      const label = String(row.path ?? row.page ?? row.query ?? "Item").slice(0, 44);
      const value = Number(row[key] ?? 0);
      return `<div class="bar-row"><span>${escapeHtml(label)}</span><div><i style="width:${Math.max(6, (value / max) * 100)}%;background:${color}"></i></div><strong>${formatNumber(value)}</strong></div>`;
    })
    .join("")}</div>`;
}

export function buildReportHtml(report: ReportWithRelations, previous?: ReportWithRelations | null) {
  const color = report.client.brandColor;
  const insights = getReportInsights(report, previous);
  const topPages = rows(report.gscSnapshot?.topPages);
  const topQueries = rows(report.gscSnapshot?.topQueries);
  const lowCtr = rows(report.gscSnapshot?.lowCtrOpportunities);
  const landingPages = rows(report.ga4Snapshot?.topLandingPages);
  const aiSearch = report.aiSearchSnapshot?.includeInReport ? report.aiSearchSnapshot : null;
  const aiPlatforms = Array.isArray(aiSearch?.visiblePlatforms) ? (aiSearch.visiblePlatforms as string[]).map((platform) => ({ platform })) : [];
  const aiTopPages = Array.isArray(aiSearch?.topCitedPages) ? (aiSearch.topCitedPages as string[]).map((page) => ({ page })) : [];
  const aiPlatformBreakdown = rows(aiSearch?.platformBreakdown);
  return `<!doctype html>
<html>
<head>
  <meta charset="utf-8" />
  <base href="${process.env.NEXT_PUBLIC_APP_URL || process.env.AUTH_URL || "http://localhost:3000"}" />
  <style>
    @page { size: A4; margin: 20mm; }
    body { font-family: Arial, sans-serif; color: #111827; margin: 0; background: white; }
    h1, h2, h3 { margin: 0; letter-spacing: 0; }
    p { color: #4b5563; line-height: 1.6; }
    .cover { border-top: 10px solid ${color}; border: 1px solid #e5e7eb; border-radius: 8px; padding: 34px; min-height: 760px; display: flex; flex-direction: column; justify-content: space-between; }
    .logos { display: flex; gap: 18px; align-items: center; justify-content: flex-end; }
    .logos img { max-height: 54px; max-width: 170px; object-fit: contain; }
    .eyebrow { color: ${color}; font-weight: 700; font-size: 13px; text-transform: uppercase; }
    .title { font-size: 44px; margin-top: 18px; }
    .url { font-size: 18px; color: #6b7280; }
    .section { page-break-before: always; margin-top: 6px; }
    .grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; }
    .grid.two { grid-template-columns: repeat(2, 1fr); }
    .card { border: 1px solid #e5e7eb; border-radius: 8px; padding: 18px; margin: 12px 0; break-inside: avoid; }
    .metric { font-size: 26px; font-weight: 700; margin-top: 8px; }
    .label { color: #6b7280; font-size: 12px; font-weight: 700; }
    table { width: 100%; border-collapse: collapse; margin-top: 12px; break-inside: avoid; }
    th { background: #f9fafb; color: #6b7280; font-size: 11px; text-transform: uppercase; text-align: left; padding: 10px; border-bottom: 1px solid #e5e7eb; }
    td { padding: 10px; border-bottom: 1px solid #f3f4f6; font-size: 12px; color: #374151; vertical-align: top; }
    .insight { background: #f9fafb; border-radius: 8px; padding: 14px; margin: 10px 0; break-inside: avoid; }
    .bars { margin-top: 12px; }
    .bar-row { display: grid; grid-template-columns: 180px 1fr 70px; gap: 10px; align-items: center; margin: 12px 0; font-size: 12px; }
    .bar-row div { height: 10px; background: #f3f4f6; border-radius: 999px; overflow: hidden; }
    .bar-row i { display: block; height: 100%; border-radius: 999px; }
  </style>
</head>
<body>
  <section class="cover">
    <div class="logos">
      ${report.client.agencyLogoUrl ? `<img src="${escapeHtml(report.client.agencyLogoUrl)}" />` : ""}
      ${report.client.clientLogoUrl ? `<img src="${escapeHtml(report.client.clientLogoUrl)}" />` : ""}
    </div>
    <div>
      <div class="eyebrow">${report.client.clientType === "ECOMMERCE" ? "E-commerce SEO" : "Lead Generation SEO"}</div>
      <h1 class="title">${escapeHtml(report.client.name)}</h1>
      <p class="url">${escapeHtml(report.client.websiteUrl)}</p>
      <p>${monthName(report.month)} ${report.year} SEO Monthly Report</p>
    </div>
  </section>

  <section class="section">
    <h2>Executive Summary</h2>
    <p>${escapeHtml(report.executiveSummary || "No executive summary generated yet.")}</p>
    ${insights.slice(0, 5).map((insight) => `<div class="insight"><strong>${escapeHtml(insight.title)}</strong><p>${escapeHtml(insight.body)}</p></div>`).join("")}
    <div class="grid">
      <div class="card"><div class="label">People saw your website on Google</div><div class="metric">${formatNumber(report.gscSnapshot?.impressions)}</div></div>
      <div class="card"><div class="label">People clicked your website</div><div class="metric">${formatNumber(report.gscSnapshot?.clicks)}</div></div>
      <div class="card"><div class="label">Click rate</div><div class="metric">${formatPercent(report.gscSnapshot?.ctr)}</div></div>
      <div class="card"><div class="label">Average Google ranking</div><div class="metric">${report.gscSnapshot?.averagePosition.toFixed(1) ?? "0.0"}</div></div>
    </div>
  </section>

  <section class="section">
    <h2>Google Search Console Insights</h2>
    <div class="grid two"><div class="card"><h3>Top pages</h3>${table(topPages, [{ key: "page", label: "Page" }, { key: "clicks", label: "Clicks" }, { key: "impressions", label: "Impressions" }, { key: "ctr", label: "CTR" }])}</div><div class="card"><h3>High impressions but low CTR pages</h3>${table(lowCtr, [{ key: "page", label: "Page" }, { key: "impressions", label: "Impressions" }, { key: "ctr", label: "CTR" }, { key: "position", label: "Position" }])}</div></div>
    <div class="card"><h3>Top growing and declining queries</h3>${table(topQueries, [{ key: "query", label: "Query" }, { key: "clicks", label: "Clicks" }, { key: "impressions", label: "Impressions" }, { key: "position", label: "Position" }])}</div>
  </section>

  <section class="section">
    <h2>Google Analytics 4 Insights</h2>
    <div class="grid">
      <div class="card"><div class="label">Organic users</div><div class="metric">${formatNumber(report.ga4Snapshot?.organicUsers)}</div></div>
      <div class="card"><div class="label">Organic sessions</div><div class="metric">${formatNumber(report.ga4Snapshot?.organicSessions)}</div></div>
      <div class="card"><div class="label">Engagement rate</div><div class="metric">${formatPercent(report.ga4Snapshot?.engagementRate)}</div></div>
      <div class="card"><div class="label">${report.client.clientType === "ECOMMERCE" ? "Revenue from organic traffic" : "Leads from organic traffic"}</div><div class="metric">${report.client.clientType === "ECOMMERCE" ? formatCurrency(report.ga4Snapshot?.revenue) : formatNumber(report.ga4Snapshot?.conversions)}</div></div>
    </div>
    <div class="card"><h3>Top organic landing pages</h3>${barChart(landingPages, "sessions", color)}${table(landingPages, [{ key: "path", label: "Landing page" }, { key: "sessions", label: "Sessions" }, { key: "conversions", label: "Conversions" }, { key: "revenue", label: "Revenue" }])}</div>
  </section>

  ${
    aiSearch
      ? `<section class="section">
    <h2>AI Search Report</h2>
    <p>Traffic, sales, conversions, and AI platforms where the site is visible.</p>
    <div class="grid">
      <div class="card"><div class="label">Traffic from AI</div><div class="metric">${formatNumber(aiSearch.aiTraffic)}</div></div>
      <div class="card"><div class="label">Sales from AI</div><div class="metric">${escapeHtml(aiSearch.aiRevenueCurrency)} ${formatNumber(aiSearch.aiSales)}</div></div>
      <div class="card"><div class="label">AI conversions</div><div class="metric">${formatNumber(aiSearch.aiConversions)}</div></div>
      <div class="card"><div class="label">AI platforms found</div><div class="metric">${formatNumber(aiPlatforms.length)}</div></div>
    </div>
    <div class="grid two">
      <div class="card"><h3>AI platforms showing the site</h3>${table(aiPlatforms, [{ key: "platform", label: "Platform" }])}</div>
      <div class="card"><h3>Platform breakdown</h3>${table(aiPlatformBreakdown, [{ key: "platform", label: "Platform" }, { key: "traffic", label: "Traffic" }, { key: "sales", label: "Sales" }, { key: "conversions", label: "Conversions" }])}</div>
      <div class="card"><h3>Top cited pages</h3>${table(aiTopPages, [{ key: "page", label: "Page" }])}</div>
      <div class="card"><h3>AI search notes</h3><p>${escapeHtml(aiSearch.notes || "")}</p></div>
    </div>
  </section>`
      : ""
  }

  <section class="section"><h2>On-page SEO Work Completed</h2>${table(report.onPageWorks as unknown as Row[], [{ key: "pageUrl", label: "Page" }, { key: "workType", label: "Type" }, { key: "title", label: "Work" }, { key: "impact", label: "Impact" }])}</section>
  <section class="section"><h2>Off-page SEO / Backlink Work</h2>${table(report.backlinkWorks as unknown as Row[], [{ key: "backlinkUrl", label: "Backlink" }, { key: "targetUrl", label: "Target page" }, { key: "anchorText", label: "Anchor" }, { key: "status", label: "Status" }, { key: "notes", label: "Quality notes" }])}</section>
  <section class="section"><h2>Blog and Content Plan</h2>${table(report.blogPlans as unknown as Row[], [{ key: "topic", label: "Topic" }, { key: "targetKeyword", label: "Target keyword" }, { key: "searchIntent", label: "Intent" }, { key: "targetPage", label: "Target internal link" }, { key: "status", label: "Status" }])}</section>
  <section class="section"><h2>Opportunities and Issues</h2><p>${escapeHtml(report.issuesSummary)}</p><h2>Next Month Action Plan</h2><p>${escapeHtml(report.nextMonthFocus)}</p></section>
</body>
</html>`;
}
