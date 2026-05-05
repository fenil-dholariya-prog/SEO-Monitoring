"use client";

import { useActionState } from "react";
import { changeSitePasswordAction } from "@/server/access-actions";
import { Button } from "@/components/ui/button";
import { Field, Input } from "@/components/ui/field";

export function ChangePasswordForm() {
  const [state, action, pending] = useActionState(changeSitePasswordAction, null);
  return (
    <form action={action} className="mt-4 grid gap-4">
      <Field label="Current password">
        <Input name="currentPassword" type="password" autoComplete="current-password" required />
      </Field>
      <Field label="New password">
        <Input name="newPassword" type="password" autoComplete="new-password" required />
      </Field>
      <Field label="Confirm new password">
        <Input name="confirmPassword" type="password" autoComplete="new-password" required />
      </Field>
      {state?.error ? <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{state.error}</p> : null}
      {state?.message ? <p className="rounded-md bg-emerald-50 px-3 py-2 text-sm text-emerald-700">{state.message}</p> : null}
      <Button type="submit" disabled={pending}>
        {pending ? "Updating..." : "Change access password"}
      </Button>
    </form>
  );
}
