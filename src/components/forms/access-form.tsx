"use client";

import { useActionState } from "react";
import { verifySiteAccessAction } from "@/server/access-actions";
import { Button } from "@/components/ui/button";
import { Field, Input } from "@/components/ui/field";

export function AccessForm({ next }: { next?: string }) {
  const [state, action, pending] = useActionState(verifySiteAccessAction, null);
  return (
    <form action={action} className="mt-8 space-y-4">
      <input type="hidden" name="next" value={next || "/login"} />
      <Field label="Access password">
        <Input name="password" type="password" autoComplete="current-password" required autoFocus />
      </Field>
      {state?.error ? <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{state.error}</p> : null}
      <Button type="submit" className="w-full" disabled={pending}>
        {pending ? "Unlocking..." : "Unlock website"}
      </Button>
    </form>
  );
}
