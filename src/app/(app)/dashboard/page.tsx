import { CalendarPlus, Plus } from "lucide-react";
import Link from "next/link";
import { prisma } from "@/lib/db";
import { formatNumber, monthName } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Card, StatCard } from "@/components/ui/card";
import { LinkButton } from "@/components/ui/button";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const now = new Date();
  const [totalClients, reportsGenerated, pendingReports, ecommerceClients, leadClients, recentReports] = await Promise.all([
    prisma.client.count(),
    prisma.report.count({ where: { month: now.getMonth() + 1, year: now.getFullYear(), status: { in: ["GENERATED", "EXPORTED"] } } }),
    prisma.report.count({ where: { status: "DRAFT" } }),
    prisma.client.count({ where: { clientType: "ECOMMERCE" } }),
    prisma.client.count({ where: { clientType: "LEAD_GENERATION" } }),
    prisma.report.findMany({
      take: 6,
      orderBy: { updatedAt: "desc" },
      include: { client: true },
    }),
  ]);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold tracking-normal text-gray-950">Dashboard</h1>
          <p className="mt-1 text-sm text-gray-500">Manage monthly SEO reporting across all agency clients.</p>
        </div>
        <div className="flex gap-3">
          <LinkButton href="/clients/new" variant="secondary"><Plus className="h-4 w-4" />New client</LinkButton>
          <LinkButton href="/reports/new"><CalendarPlus className="h-4 w-4" />New report</LinkButton>
        </div>
      </div>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        <StatCard label="Total clients" value={formatNumber(totalClients)} />
        <StatCard label="Reports generated this month" value={formatNumber(reportsGenerated)} />
        <StatCard label="Pending reports" value={formatNumber(pendingReports)} />
        <StatCard label="E-commerce clients" value={formatNumber(ecommerceClients)} accent="#0f766e" />
        <StatCard label="Lead-generation clients" value={formatNumber(leadClients)} accent="#2563eb" />
      </section>

      <section className="grid gap-6 lg:grid-cols-[1fr_360px]">
        <Card>
          <h2 className="text-lg font-semibold text-gray-950">Recent reports</h2>
          <div className="mt-4 overflow-hidden rounded-lg border border-gray-200">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50 text-xs uppercase tracking-wide text-gray-500">
                <tr>
                  <th className="px-4 py-3">Client</th>
                  <th className="px-4 py-3">Month</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Preview</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {recentReports.map((report) => (
                  <tr key={report.id}>
                    <td className="px-4 py-3 font-medium text-gray-950">{report.client.name}</td>
                    <td className="px-4 py-3 text-gray-600">{monthName(report.month)} {report.year}</td>
                    <td className="px-4 py-3"><Badge tone={report.status === "DRAFT" ? "amber" : "green"}>{report.status}</Badge></td>
                    <td className="px-4 py-3"><Link className="font-semibold text-gray-950 underline" href={`/reports/${report.id}/preview`}>Open</Link></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
        <Card>
          <h2 className="text-lg font-semibold text-gray-950">Quick actions</h2>
          <div className="mt-4 grid gap-3">
            <LinkButton href="/reports/new" variant="secondary">Start report builder</LinkButton>
            <LinkButton href="/integrations" variant="secondary">Check Google integrations</LinkButton>
            <LinkButton href="/settings" variant="secondary">Review export settings</LinkButton>
          </div>
        </Card>
      </section>
    </div>
  );
}
