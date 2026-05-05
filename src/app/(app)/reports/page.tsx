import { CalendarPlus } from "lucide-react";
import Link from "next/link";
import { prisma } from "@/lib/db";
import { monthName } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { LinkButton } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";

export const dynamic = "force-dynamic";

export default async function ReportsPage() {
  const reports = await prisma.report.findMany({ orderBy: [{ year: "desc" }, { month: "desc" }], include: { client: true } });
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold tracking-normal text-gray-950">Monthly Reports</h1>
          <p className="mt-1 text-sm text-gray-500">Draft, generated, and exported client-ready reports.</p>
        </div>
        <LinkButton href="/reports/new"><CalendarPlus className="h-4 w-4" />New report</LinkButton>
      </div>
      {reports.length ? (
        <div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 text-xs uppercase tracking-wide text-gray-500">
              <tr><th className="px-4 py-3">Client</th><th className="px-4 py-3">Month</th><th className="px-4 py-3">Type</th><th className="px-4 py-3">Status</th><th className="px-4 py-3">Actions</th></tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {reports.map((report) => (
                <tr key={report.id}>
                  <td className="px-4 py-3 font-medium text-gray-950">{report.client.name}</td>
                  <td className="px-4 py-3 text-gray-600">{monthName(report.month)} {report.year}</td>
                  <td className="px-4 py-3"><Badge tone={report.client.clientType === "ECOMMERCE" ? "green" : "blue"}>{report.client.clientType}</Badge></td>
                  <td className="px-4 py-3"><Badge tone={report.status === "DRAFT" ? "amber" : "green"}>{report.status}</Badge></td>
                  <td className="px-4 py-3"><Link className="font-semibold text-gray-950 underline" href={`/reports/${report.id}/builder`}>Builder</Link></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <EmptyState title="No reports yet" body="Create a monthly report to fetch search data, add work entries, generate insights, and export deliverables." action={<LinkButton href="/reports/new">Create report</LinkButton>} />
      )}
    </div>
  );
}
