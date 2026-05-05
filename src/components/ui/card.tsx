import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function Card({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn("rounded-lg border border-gray-200 bg-white p-5 shadow-sm", className)}>{children}</div>;
}

export function StatCard({
  label,
  value,
  detail,
  accent,
}: {
  label: string;
  value: string;
  detail?: string;
  accent?: string;
}) {
  return (
    <Card>
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-gray-500">{label}</p>
          <p className="mt-2 text-3xl font-semibold tracking-normal text-gray-950">{value}</p>
          {detail ? <p className="mt-2 text-sm text-gray-500">{detail}</p> : null}
        </div>
        <span className="h-3 w-3 rounded-full" style={{ backgroundColor: accent ?? "#111827" }} />
      </div>
    </Card>
  );
}
