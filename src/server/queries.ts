import { prisma } from "@/lib/db";

export function getReportWithRelations(id: string) {
  return prisma.report.findUnique({
    where: { id },
    include: {
      client: true,
      gscSnapshot: true,
      ga4Snapshot: true,
      aiSearchSnapshot: true,
      onPageWorks: { orderBy: { createdAt: "desc" } },
      backlinkWorks: { orderBy: { createdAt: "desc" } },
      blogPlans: { orderBy: { createdAt: "desc" } },
      exports: { orderBy: { createdAt: "desc" } },
    },
  });
}

export async function getPreviousReport(clientId: string, month: number, year: number) {
  const previousMonth = month === 1 ? 12 : month - 1;
  const previousYear = month === 1 ? year - 1 : year;
  return prisma.report.findUnique({
    where: { clientId_month_year: { clientId, month: previousMonth, year: previousYear } },
    include: {
      client: true,
      gscSnapshot: true,
      ga4Snapshot: true,
      aiSearchSnapshot: true,
      onPageWorks: true,
      backlinkWorks: true,
      blogPlans: true,
      exports: true,
    },
  });
}
