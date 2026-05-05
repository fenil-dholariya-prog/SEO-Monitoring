import type { ReactNode } from "react";

export function EmptyState({ title, body, action }: { title: string; body: string; action?: ReactNode }) {
  return (
    <div className="rounded-lg border border-dashed border-gray-300 bg-gray-50 p-8 text-center">
      <h3 className="text-base font-semibold text-gray-950">{title}</h3>
      <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-gray-500">{body}</p>
      {action ? <div className="mt-4">{action}</div> : null}
    </div>
  );
}
