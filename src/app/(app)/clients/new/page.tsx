import { Card } from "@/components/ui/card";
import { ClientForm } from "@/components/forms/client-form";

export default function NewClientPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold tracking-normal text-gray-950">Add client</h1>
        <p className="mt-1 text-sm text-gray-500">Create the client profile used by reports, integrations, branding, and exports.</p>
      </div>
      <Card>
        <ClientForm />
      </Card>
    </div>
  );
}
