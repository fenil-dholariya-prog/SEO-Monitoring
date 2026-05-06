"use client";

import { useState, useTransition } from "react";
import { Download, FileText, RefreshCw, WandSparkles } from "lucide-react";
import { fetchReportDataAction, generateInsightsAction } from "@/server/actions";
import { Button, LinkButton } from "@/components/ui/button";

export function FetchDataButton({ reportId }: { reportId: string }) {
  const [pending, startTransition] = useTransition();
  const [message, setMessage] = useState<string | null>(null);
  return (
    <div className="flex flex-wrap items-center gap-3">
      <Button
        type="button"
        disabled={pending}
        onClick={() =>
          startTransition(async () => {
            const result = await fetchReportDataAction(reportId);
            setMessage(result?.error ?? "GSC and GA4 data refreshed.");
          })
        }
      >
        <RefreshCw className="h-4 w-4" />
        {pending ? "Fetching..." : "Fetch GSC and GA4 data"}
      </Button>
      {message ? <p className="text-sm text-gray-500">{message}</p> : null}
    </div>
  );
}

export function GenerateInsightsButton({ reportId }: { reportId: string }) {
  const [pending, startTransition] = useTransition();
  const [message, setMessage] = useState<string | null>(null);
  return (
    <div className="flex flex-wrap items-center gap-3">
      <Button
        type="button"
        variant="secondary"
        disabled={pending}
        onClick={() =>
          startTransition(async () => {
            const result = await generateInsightsAction(reportId);
            setMessage(result?.error ?? "Insights generated.");
          })
        }
      >
        <WandSparkles className="h-4 w-4" />
        {pending ? "Generating..." : "Generate insights"}
      </Button>
      {message ? <p className="text-sm text-gray-500">{message}</p> : null}
    </div>
  );
}

export function ExportButtons({ reportId }: { reportId: string }) {
  return (
    <div className="flex flex-wrap gap-3">
      <LinkButton href={`/api/reports/${reportId}/export/pdf`} variant="secondary">
        <Download className="h-4 w-4" />
        Export PDF
      </LinkButton>
      <LinkButton href={`/api/reports/${reportId}/export/docx`} variant="secondary">
        <FileText className="h-4 w-4" />
        Export DOCX
      </LinkButton>
    </div>
  );
}
