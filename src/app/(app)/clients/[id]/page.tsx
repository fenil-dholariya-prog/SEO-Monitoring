import Image from "next/image";
import { notFound } from "next/navigation";
import { CalendarPlus } from "lucide-react";
import { prisma } from "@/lib/db";
import { monthName } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { LinkButton } from "@/components/ui/button";

export const dynamic = "force-dynamic";

export default async function ClientDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const client = await prisma.client.findUnique({ where: { id }, include: { reports: { orderBy: [{ year: "desc" }, { month: "desc" }] } } });
  if (!client) notFound();
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-semibold tracking-normal text-gray-950">{client.name}</h1>
            <span className="h-4 w-4 rounded-full" style={{ backgroundColor: client.brandColor }} />
          </div>
          <p className="mt-1 text-sm text-gray-500">{client.websiteUrl}</p>
        </div>
        <LinkButton href={`/reports/new?clientId=${client.id}`}><CalendarPlus className="h-4 w-4" />Create monthly report</LinkButton>
      </div>
      <section className="grid gap-5 lg:grid-cols-[360px_1fr]">
        <Card>
          <h2 className="text-lg font-semibold text-gray-950">Client profile</h2>
          <div className="mt-5 space-y-4 text-sm">
            <div className="flex gap-3">
              {client.agencyLogoUrl ? <Image src={client.agencyLogoUrl} alt="Agency logo" width={140} height={44} /> : null}
              {client.clientLogoUrl ? <Image src={client.clientLogoUrl} alt="Client logo" width={140} height={44} /> : null}
            </div>
            <p><span className="font-medium text-gray-950">Type:</span> {client.clientType === "ECOMMERCE" ? "E-commerce SEO" : "Lead Generation SEO"}</p>
            <p><span className="font-medium text-gray-950">Industry:</span> {client.industry}</p>
            <p><span className="font-medium text-gray-950">Target country:</span> {client.targetCountry}</p>
            <p><span className="font-medium text-gray-950">GSC property:</span> {client.gscPropertyUrl || "Missing"}</p>
            <p><span className="font-medium text-gray-950">GA4 property:</span> {client.ga4PropertyId || "Missing"}</p>
            <p><span className="font-medium text-gray-950">Ahrefs project:</span> {client.ahrefsProjectId || "Phase 2 placeholder"}</p>
          </div>
        </Card>
        <Card>
          <h2 className="text-lg font-semibold text-gray-950">Reports history</h2>
          <div className="mt-4 overflow-hidden rounded-lg border border-gray-200">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50 text-xs uppercase tracking-wide text-gray-500">
                <tr><th className="px-4 py-3">Report</th><th className="px-4 py-3">Status</th><th className="px-4 py-3">Open</th></tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {client.reports.map((report) => (
                  <tr key={report.id}>
                    <td className="px-4 py-3">{monthName(report.month)} {report.year}</td>
                    <td className="px-4 py-3"><Badge tone={report.status === "DRAFT" ? "amber" : "green"}>{report.status}</Badge></td>
                    <td className="px-4 py-3"><LinkButton href={`/reports/${report.id}/preview`} variant="ghost">Preview</LinkButton></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </section>
    </div>
  );
}
