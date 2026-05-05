"use client";

import { useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Save } from "lucide-react";
import { createClientAction } from "@/server/actions";
import { clientSchema, type ClientFormInput, type ClientFormOutput } from "@/lib/validators/client";
import { Button } from "@/components/ui/button";
import { Field, Input, Select } from "@/components/ui/field";

export function ClientForm() {
  const [pending, startTransition] = useTransition();
  const form = useForm<ClientFormInput, unknown, ClientFormOutput>({
    resolver: zodResolver(clientSchema),
    defaultValues: {
      name: "",
      websiteUrl: "",
      clientType: "LEAD_GENERATION",
      industry: "",
      targetCountry: "United States",
      brandColor: "#2563eb",
      agencyLogoUrl: "/placeholder-agency.svg",
      clientLogoUrl: "/placeholder-client.svg",
      gscPropertyUrl: "",
      ga4PropertyId: "",
      ahrefsProjectId: "",
    },
  });

  function submit(values: ClientFormOutput) {
    const formData = new FormData();
    Object.entries(values).forEach(([key, value]) => formData.append(key, value ?? ""));
    startTransition(() => void createClientAction(null, formData));
  }

  return (
    <form onSubmit={form.handleSubmit(submit)} className="grid gap-5 md:grid-cols-2">
      <Field label="Client name" error={form.formState.errors.name?.message}>
        <Input {...form.register("name")} />
      </Field>
      <Field label="Website URL" error={form.formState.errors.websiteUrl?.message}>
        <Input {...form.register("websiteUrl")} placeholder="https://example.com" />
      </Field>
      <Field label="Client type" error={form.formState.errors.clientType?.message}>
        <Select {...form.register("clientType")}>
          <option value="ECOMMERCE">E-commerce SEO</option>
          <option value="LEAD_GENERATION">Lead Generation SEO</option>
        </Select>
      </Field>
      <Field label="Industry" error={form.formState.errors.industry?.message}>
        <Input {...form.register("industry")} />
      </Field>
      <Field label="Target country" error={form.formState.errors.targetCountry?.message}>
        <Input {...form.register("targetCountry")} />
      </Field>
      <Field label="Theme colour" error={form.formState.errors.brandColor?.message}>
        <Input {...form.register("brandColor")} type="color" className="p-1" />
      </Field>
      <Field label="Agency logo URL" error={form.formState.errors.agencyLogoUrl?.message}>
        <Input {...form.register("agencyLogoUrl")} />
      </Field>
      <Field label="Client logo URL" error={form.formState.errors.clientLogoUrl?.message}>
        <Input {...form.register("clientLogoUrl")} />
      </Field>
      <Field label="GSC property URL" error={form.formState.errors.gscPropertyUrl?.message}>
        <Input {...form.register("gscPropertyUrl")} placeholder="https://example.com/ or sc-domain:example.com" />
      </Field>
      <Field label="GA4 property ID" error={form.formState.errors.ga4PropertyId?.message}>
        <Input {...form.register("ga4PropertyId")} />
      </Field>
      <Field label="Ahrefs project ID" error={form.formState.errors.ahrefsProjectId?.message}>
        <Input {...form.register("ahrefsProjectId")} placeholder="Prepared for Phase 2" />
      </Field>
      <div className="flex items-end">
        <Button type="submit" disabled={pending}>
          <Save className="h-4 w-4" />
          {pending ? "Saving..." : "Save client"}
        </Button>
      </div>
    </form>
  );
}
