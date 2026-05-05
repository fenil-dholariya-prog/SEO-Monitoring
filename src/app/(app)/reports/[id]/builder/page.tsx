import Link from "next/link";
import { notFound } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { LinkButton } from "@/components/ui/button";
import { BacklinkWorkForm, BlogPlanForm, OnPageWorkForm } from "@/components/forms/manual-work-forms";
import { AiSearchForm } from "@/components/forms/ai-search-form";
import { ExportButtons, FetchAhrefsButton, FetchDataButton, GenerateInsightsButton } from "@/components/report/report-actions";
import { getReportWithRelations } from "@/server/queries";
import { monthName } from "@/lib/utils";

export const dynamic = "force-dynamic";

const steps = [
  "Select client",
  "Select month and year",
  "Select date range",
  "Fetch GSC data",
  "Fetch GA4 data",
  "Add on-page work",
  "Add backlinks",
  "Add blog/content plan",
  "Generate insights",
  "Preview report",
  "Export PDF or DOCX",
];

export default async function ReportBuilderPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const report = await getReportWithRelations(id);
  if (!report) notFound();
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold tracking-normal text-gray-950">Report Builder</h1>
          <p className="mt-1 text-sm text-gray-500">{report.client.name} · {monthName(report.month)} {report.year}</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <LinkButton href={`/reports/${report.id}/preview`} variant="secondary">Preview report</LinkButton>
          <ExportButtons reportId={report.id} />
        </div>
      </div>

      <Card>
        <div className="flex flex-wrap gap-2">
          {steps.map((step, index) => (
            <Badge key={step} tone={index < 3 || report.status !== "DRAFT" ? "green" : "gray"}>{index + 1}. {step}</Badge>
          ))}
        </div>
      </Card>

      <section className="grid gap-5 lg:grid-cols-[1fr_360px]">
        <div className="space-y-5">
          <Card>
            <h2 className="text-lg font-semibold text-gray-950">Google data</h2>
            <p className="mt-1 text-sm text-gray-500">Fetch Search Console and GA4 snapshots for the selected date range. Mock mode is used when credentials are unavailable.</p>
            <div className="mt-5 space-y-3">
              <FetchDataButton reportId={report.id} />
              <FetchAhrefsButton reportId={report.id} />
              <GenerateInsightsButton reportId={report.id} />
            </div>
          </Card>

          <Card><h2 className="mb-4 text-lg font-semibold text-gray-950">On-page SEO Work Completed</h2><OnPageWorkForm reportId={report.id} /></Card>
          <Card><h2 className="mb-4 text-lg font-semibold text-gray-950">Off-page SEO / Backlink Work</h2><BacklinkWorkForm reportId={report.id} /></Card>
          <Card><h2 className="mb-4 text-lg font-semibold text-gray-950">Blog and Content Plan</h2><BlogPlanForm reportId={report.id} /></Card>
          <Card>
            <h2 className="mb-2 text-lg font-semibold text-gray-950">AI Search Report</h2>
            <p className="mb-4 text-sm text-gray-500">Track traffic, sales, conversions, and AI platforms that show or cite the client site.</p>
            <AiSearchForm reportId={report.id} snapshot={report.aiSearchSnapshot} />
          </Card>
        </div>
        <aside className="space-y-5">
          <Card>
            <h2 className="text-lg font-semibold text-gray-950">Report state</h2>
            <div className="mt-4 space-y-3 text-sm text-gray-600">
              <p><span className="font-medium text-gray-950">Status:</span> {report.status}</p>
              <p><span className="font-medium text-gray-950">GSC:</span> {report.gscSnapshot ? "Snapshot saved" : "No data yet"}</p>
              <p><span className="font-medium text-gray-950">GA4:</span> {report.ga4Snapshot ? "Snapshot saved" : "No data yet"}</p>
              <p><span className="font-medium text-gray-950">Ahrefs:</span> {report.ahrefsSnapshot ? "Snapshot saved" : "No data yet"}</p>
              <p><span className="font-medium text-gray-950">AI Search:</span> {report.aiSearchSnapshot?.includeInReport ? "Included in report" : report.aiSearchSnapshot ? "Saved, not included" : "No data yet"}</p>
              <p><span className="font-medium text-gray-950">On-page entries:</span> {report.onPageWorks.length}</p>
              <p><span className="font-medium text-gray-950">Backlinks:</span> {report.backlinkWorks.length}</p>
              <p><span className="font-medium text-gray-950">Blog items:</span> {report.blogPlans.length}</p>
            </div>
          </Card>
          <Card>
            <h2 className="text-lg font-semibold text-gray-950">Recent entries</h2>
            <div className="mt-4 space-y-3 text-sm">
              {[...report.onPageWorks, ...report.backlinkWorks, ...report.blogPlans].slice(0, 6).map((item) => (
                <p key={item.id} className="rounded-md bg-gray-50 p-3 text-gray-600">{("title" in item ? item.title : "topic" in item ? item.topic : item.anchorText) as string}</p>
              ))}
            </div>
            <Link href={`/reports/${report.id}/preview`} className="mt-4 inline-block text-sm font-semibold text-gray-950 underline">Open preview</Link>
          </Card>
        </aside>
      </section>
    </div>
  );
}
