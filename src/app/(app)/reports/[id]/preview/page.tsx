import { notFound } from "next/navigation";
import { ExportButtons } from "@/components/report/report-actions";
import { ReportPreview } from "@/components/report/report-preview";
import { getPreviousReport, getReportWithRelations } from "@/server/queries";

export const dynamic = "force-dynamic";

export default async function ReportPreviewPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const report = await getReportWithRelations(id);
  if (!report) notFound();
  const previous = await getPreviousReport(report.clientId, report.month, report.year);
  return (
    <div className="space-y-6">
      <div className="no-print flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold tracking-normal text-gray-950">Report Preview</h1>
          <p className="mt-1 text-sm text-gray-500">Client-ready report using saved snapshots and manual work entries.</p>
        </div>
        <ExportButtons reportId={report.id} />
      </div>
      <ReportPreview report={report} previous={previous} />
    </div>
  );
}
