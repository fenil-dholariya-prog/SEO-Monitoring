"use client";

import { useActionState, useTransition } from "react";
import type { AiSearchSnapshot } from "@/generated/prisma/client";
import { saveAiSearchReportAction, toggleAiSearchInReportAction } from "@/server/actions";
import { Button } from "@/components/ui/button";
import { Field, Input, Textarea } from "@/components/ui/field";

function listValue(value: unknown) {
  return Array.isArray(value) ? value.join("\n") : "";
}

function platformValue(value: unknown) {
  if (!Array.isArray(value)) return "";
  return value
    .map((item) => {
      const row = item as Record<string, unknown>;
      return [row.platform, row.traffic, row.sales, row.conversions].filter((part) => part !== undefined && part !== null).join(", ");
    })
    .join("\n");
}

export function AiSearchForm({ reportId, snapshot }: { reportId: string; snapshot: AiSearchSnapshot | null }) {
  const [state, action, pending] = useActionState(saveAiSearchReportAction, null);
  const [togglePending, startTransition] = useTransition();
  const include = snapshot?.includeInReport ?? false;

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-md bg-gray-50 p-4">
        <div>
          <p className="text-sm font-semibold text-gray-950">Add AI Search Report to the main report</p>
          <p className="mt-1 text-sm text-gray-500">Turn this on only when the AI data is ready for the client-facing report.</p>
        </div>
        <Button
          type="button"
          variant={include ? "primary" : "secondary"}
          disabled={togglePending}
          onClick={() => startTransition(() => void toggleAiSearchInReportAction(reportId, !include))}
        >
          {togglePending ? "Updating..." : include ? "Included" : "Not included"}
        </Button>
      </div>

      <form action={action} className="grid gap-4 md:grid-cols-2">
        <input type="hidden" name="reportId" value={reportId} />
        <input type="hidden" name="includeInReport" value={include ? "true" : "false"} />
        <Field label="AI traffic">
          <Input name="aiTraffic" type="number" min={0} defaultValue={snapshot?.aiTraffic ?? 0} />
        </Field>
        <Field label="Sales from AI">
          <Input name="aiSales" type="number" min={0} step="0.01" defaultValue={snapshot?.aiSales ?? 0} />
        </Field>
        <Field label="AI conversions">
          <Input name="aiConversions" type="number" min={0} defaultValue={snapshot?.aiConversions ?? 0} />
        </Field>
        <Field label="Currency">
          <Input name="aiRevenueCurrency" maxLength={3} defaultValue={snapshot?.aiRevenueCurrency ?? "USD"} />
        </Field>
        <div className="md:col-span-2">
          <Field label="AI platforms showing the site">
            <Textarea
              name="visiblePlatforms"
              placeholder="ChatGPT&#10;Perplexity&#10;Google AI Overviews&#10;Gemini"
              defaultValue={listValue(snapshot?.visiblePlatforms)}
            />
          </Field>
        </div>
        <div className="md:col-span-2">
          <Field label="Platform breakdown">
            <Textarea
              name="platformBreakdown"
              placeholder="ChatGPT, 120, 5000, 8&#10;Perplexity, 80, 2200, 3"
              defaultValue={platformValue(snapshot?.platformBreakdown)}
            />
          </Field>
        </div>
        <div className="md:col-span-2">
          <Field label="Top cited pages">
            <Textarea name="topCitedPages" placeholder="/services/seo&#10;/blog/buyer-guide" defaultValue={listValue(snapshot?.topCitedPages)} />
          </Field>
        </div>
        <div className="md:col-span-2">
          <Field label="Notes">
            <Textarea name="notes" defaultValue={snapshot?.notes ?? ""} />
          </Field>
        </div>
        {state?.error ? <p className="md:col-span-2 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{state.error}</p> : null}
        {state?.message ? <p className="md:col-span-2 rounded-md bg-emerald-50 px-3 py-2 text-sm text-emerald-700">{state.message}</p> : null}
        <Button type="submit" disabled={pending}>
          {pending ? "Saving..." : "Save AI Search Report"}
        </Button>
      </form>
    </div>
  );
}
