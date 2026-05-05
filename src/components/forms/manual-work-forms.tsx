"use client";

import { useTransition } from "react";
import { Plus } from "lucide-react";
import { addBacklinkWorkAction, addBlogPlanAction, addOnPageWorkAction } from "@/server/actions";
import { Button } from "@/components/ui/button";
import { Field, Input, Select, Textarea } from "@/components/ui/field";

export function OnPageWorkForm({ reportId }: { reportId: string }) {
  const [pending, startTransition] = useTransition();
  return (
    <form
      className="grid gap-4 md:grid-cols-2"
      action={(formData) => startTransition(() => void addOnPageWorkAction(null, formData))}
    >
      <input type="hidden" name="reportId" value={reportId} />
      <Field label="Page URL"><Input name="pageUrl" required /></Field>
      <Field label="Work type">
        <Select name="workType" required>
          <option>Meta update</option>
          <option>Content update</option>
          <option>Schema update</option>
          <option>Internal linking</option>
          <option>Technical fix</option>
          <option>Page improvement</option>
        </Select>
      </Field>
      <Field label="Title"><Input name="title" required /></Field>
      <Field label="Status"><Input name="status" defaultValue="Completed" required /></Field>
      <div className="md:col-span-2"><Field label="Description"><Textarea name="description" required /></Field></div>
      <div className="md:col-span-2"><Field label="Impact"><Textarea name="impact" required /></Field></div>
      <Button type="submit" disabled={pending}><Plus className="h-4 w-4" />Add on-page work</Button>
    </form>
  );
}

export function BacklinkWorkForm({ reportId }: { reportId: string }) {
  const [pending, startTransition] = useTransition();
  return (
    <form
      className="grid gap-4 md:grid-cols-2"
      action={(formData) => startTransition(() => void addBacklinkWorkAction(null, formData))}
    >
      <input type="hidden" name="reportId" value={reportId} />
      <Field label="Backlink URL"><Input name="backlinkUrl" type="url" required /></Field>
      <Field label="Target URL"><Input name="targetUrl" required /></Field>
      <Field label="Anchor text"><Input name="anchorText" required /></Field>
      <Field label="Domain rating"><Input name="domainRating" type="number" min={0} max={100} /></Field>
      <Field label="Link type"><Input name="linkType" defaultValue="Guest post" required /></Field>
      <Field label="Status"><Input name="status" defaultValue="Live" required /></Field>
      <div className="md:col-span-2"><Field label="Notes"><Textarea name="notes" /></Field></div>
      <Button type="submit" disabled={pending}><Plus className="h-4 w-4" />Add backlink</Button>
    </form>
  );
}

export function BlogPlanForm({ reportId }: { reportId: string }) {
  const [pending, startTransition] = useTransition();
  return (
    <form
      className="grid gap-4 md:grid-cols-2"
      action={(formData) => startTransition(() => void addBlogPlanAction(null, formData))}
    >
      <input type="hidden" name="reportId" value={reportId} />
      <Field label="Topic"><Input name="topic" required /></Field>
      <Field label="Target keyword"><Input name="targetKeyword" required /></Field>
      <Field label="Search intent">
        <Select name="searchIntent" required>
          <option>Informational</option>
          <option>Commercial</option>
          <option>Transactional</option>
          <option>Navigational</option>
          <option>Local</option>
        </Select>
      </Field>
      <Field label="Target page"><Input name="targetPage" required /></Field>
      <Field label="Status"><Input name="status" defaultValue="Planned" required /></Field>
      <div className="md:col-span-2"><Field label="Notes"><Textarea name="notes" /></Field></div>
      <Button type="submit" disabled={pending}><Plus className="h-4 w-4" />Add blog item</Button>
    </form>
  );
}
