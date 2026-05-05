import { Plus } from "lucide-react";
import Link from "next/link";
import { prisma } from "@/lib/db";
import { Badge } from "@/components/ui/badge";
import { LinkButton } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";

export const dynamic = "force-dynamic";

export default async function ClientsPage() {
  const clients = await prisma.client.findMany({ orderBy: { name: "asc" }, include: { _count: { select: { reports: true } } } });
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold tracking-normal text-gray-950">Clients</h1>
          <p className="mt-1 text-sm text-gray-500">Client branding, report settings, and Google property mapping.</p>
        </div>
        <LinkButton href="/clients/new"><Plus className="h-4 w-4" />Add client</LinkButton>
      </div>
      {clients.length ? (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {clients.map((client) => (
            <Link key={client.id} href={`/clients/${client.id}`} className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm transition hover:border-gray-300">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="text-lg font-semibold text-gray-950">{client.name}</h2>
                  <p className="mt-1 text-sm text-gray-500">{client.websiteUrl}</p>
                </div>
                <span className="h-3 w-3 rounded-full" style={{ backgroundColor: client.brandColor }} />
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                <Badge tone={client.clientType === "ECOMMERCE" ? "green" : "blue"}>{client.clientType === "ECOMMERCE" ? "E-commerce SEO" : "Lead Generation SEO"}</Badge>
                <Badge>{client._count.reports} reports</Badge>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <EmptyState title="No clients yet" body="Add your first client to set branding, Google properties, and monthly report defaults." action={<LinkButton href="/clients/new">Add client</LinkButton>} />
      )}
    </div>
  );
}
