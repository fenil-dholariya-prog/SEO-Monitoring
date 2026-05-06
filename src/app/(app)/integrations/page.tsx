import { Cable, CheckCircle2, CircleAlert } from "lucide-react";
import { prisma } from "@/lib/db";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export const dynamic = "force-dynamic";

export default async function IntegrationsPage() {
  const clients = await prisma.client.findMany({ orderBy: { name: "asc" } });
  const mockMode = process.env.GOOGLE_API_MOCK_MODE !== "false";
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold tracking-normal text-gray-950">Integrations</h1>
        <p className="mt-1 text-sm text-gray-500">Google Search Console and GA4 access are handled through Google OAuth.</p>
      </div>
      <Card>
        <div className="flex items-start gap-3">
          <Cable className="mt-1 h-5 w-5 text-gray-500" />
          <div>
            <h2 className="text-lg font-semibold text-gray-950">Google data mode</h2>
            <p className="mt-1 text-sm text-gray-500">{mockMode ? "Development mock mode is enabled. Real Google API requests are skipped." : "Real Google API mode is enabled. OAuth tokens and client properties are required."}</p>
          </div>
        </div>
      </Card>
      <Card>
        <h2 className="text-lg font-semibold text-gray-950">Client property readiness</h2>
        <div className="mt-4 grid gap-3">
          {clients.map((client) => (
            <div key={client.id} className="flex flex-wrap items-center justify-between gap-3 rounded-md border border-gray-100 p-3">
              <div>
                <p className="font-medium text-gray-950">{client.name}</p>
                <p className="text-sm text-gray-500">{client.websiteUrl}</p>
              </div>
              <div className="flex gap-2">
                <Badge tone={client.gscPropertyUrl ? "green" : "amber"}>{client.gscPropertyUrl ? <CheckCircle2 className="mr-1 h-3 w-3" /> : <CircleAlert className="mr-1 h-3 w-3" />}GSC</Badge>
                <Badge tone={client.ga4PropertyId ? "green" : "amber"}>{client.ga4PropertyId ? <CheckCircle2 className="mr-1 h-3 w-3" /> : <CircleAlert className="mr-1 h-3 w-3" />}GA4</Badge>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
