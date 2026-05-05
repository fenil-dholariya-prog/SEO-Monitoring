"use client";

import { useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { WandSparkles } from "lucide-react";
import type { Client } from "@/generated/prisma/client";
import { createReportAction } from "@/server/actions";
import { reportSchema, type ReportFormInput, type ReportFormOutput } from "@/lib/validators/report";
import { Button } from "@/components/ui/button";
import { Field, Input, Select } from "@/components/ui/field";

export function ReportCreateForm({ clients, initialClientId }: { clients: Client[]; initialClientId?: string }) {
  const now = new Date();
  const [pending, startTransition] = useTransition();
  const form = useForm<ReportFormInput, unknown, ReportFormOutput>({
    resolver: zodResolver(reportSchema),
    defaultValues: {
      clientId: initialClientId || clients[0]?.id || "",
      month: now.getMonth() || 12,
      year: now.getMonth() === 0 ? now.getFullYear() - 1 : now.getFullYear(),
      startDate: new Date(now.getFullYear(), Math.max(0, now.getMonth() - 1), 1),
      endDate: new Date(now.getFullYear(), now.getMonth(), 0),
    },
  });

  function submit(values: ReportFormOutput) {
    const formData = new FormData();
    formData.append("clientId", values.clientId);
    formData.append("month", String(values.month));
    formData.append("year", String(values.year));
    formData.append("startDate", values.startDate.toISOString());
    formData.append("endDate", values.endDate.toISOString());
    startTransition(() => void createReportAction(null, formData));
  }

  return (
    <form onSubmit={form.handleSubmit(submit)} className="grid gap-5 md:grid-cols-2">
      <Field label="Client" error={form.formState.errors.clientId?.message as string | undefined}>
        <Select {...form.register("clientId")}>
          {clients.map((client) => (
            <option key={client.id} value={client.id}>
              {client.name}
            </option>
          ))}
        </Select>
      </Field>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Month" error={form.formState.errors.month?.message as string | undefined}>
          <Input type="number" min={1} max={12} {...form.register("month")} />
        </Field>
        <Field label="Year" error={form.formState.errors.year?.message as string | undefined}>
          <Input type="number" {...form.register("year")} />
        </Field>
      </div>
      <Field label="Start date" error={form.formState.errors.startDate?.message as string | undefined}>
        <Input type="date" {...form.register("startDate", { valueAsDate: true })} />
      </Field>
      <Field label="End date" error={form.formState.errors.endDate?.message as string | undefined}>
        <Input type="date" {...form.register("endDate", { valueAsDate: true })} />
      </Field>
      <div className="md:col-span-2">
        <Button type="submit" disabled={pending || clients.length === 0}>
          <WandSparkles className="h-4 w-4" />
          {pending ? "Creating..." : "Create monthly report"}
        </Button>
      </div>
    </form>
  );
}
