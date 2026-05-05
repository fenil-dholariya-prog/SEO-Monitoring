import { prisma } from "@/lib/db";
import { ReportCreateForm } from "@/components/forms/report-create-form";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { LinkButton } from "@/components/ui/button";

export const dynamic = "force-dynamic";

export default async function NewReportPage({ searchParams }: { searchParams: Promise<{ clientId?: string }> }) {
  const { clientId } = await searchParams;
  const clients = await prisma.client.findMany({ orderBy: { name: "asc" } });
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold tracking-normal text-gray-950">Report Builder</h1>
        <p className="mt-1 text-sm text-gray-500">Select client, month, year, and reporting date range.</p>
      </div>
      <Card>
        {clients.length ? (
          <ReportCreateForm clients={clients} initialClientId={clientId} />
        ) : (
          <EmptyState title="Add a client first" body="Reports need a client profile for branding, Google properties, and client-type logic." action={<LinkButton href="/clients/new">Add client</LinkButton>} />
        )}
      </Card>
    </div>
  );
}
