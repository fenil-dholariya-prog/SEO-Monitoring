import Link from "next/link";
import { prisma } from "@/lib/db";
import { Card } from "@/components/ui/card";

export const dynamic = "force-dynamic";

export default async function BlogPlanPage() {
  const items = await prisma.blogPlan.findMany({ take: 50, orderBy: { createdAt: "desc" }, include: { report: { include: { client: true } } } });
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold tracking-normal text-gray-950">Blog Plan</h1>
        <p className="mt-1 text-sm text-gray-500">Published and planned content, target keywords, search intent, and target internal links.</p>
      </div>
      <Card>
        <table className="w-full text-left text-sm">
          <thead className="bg-gray-50 text-xs uppercase tracking-wide text-gray-500">
            <tr><th className="px-4 py-3">Client</th><th className="px-4 py-3">Topic</th><th className="px-4 py-3">Keyword</th><th className="px-4 py-3">Intent</th><th className="px-4 py-3">Status</th></tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {items.map((item) => (
              <tr key={item.id}>
                <td className="px-4 py-3"><Link className="font-medium text-gray-950 underline" href={`/reports/${item.reportId}/builder`}>{item.report.client.name}</Link></td>
                <td className="px-4 py-3 text-gray-600">{item.topic}</td>
                <td className="px-4 py-3 text-gray-600">{item.targetKeyword}</td>
                <td className="px-4 py-3 text-gray-600">{item.searchIntent}</td>
                <td className="px-4 py-3 text-gray-600">{item.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
}
