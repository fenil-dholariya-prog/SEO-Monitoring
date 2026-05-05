import { LockKeyhole } from "lucide-react";
import { AccessForm } from "@/components/forms/access-form";

export default async function AccessPage({ searchParams }: { searchParams: Promise<{ next?: string }> }) {
  const { next } = await searchParams;
  return (
    <main className="flex min-h-screen items-center justify-center bg-white px-6">
      <section className="w-full max-w-md rounded-lg border border-gray-200 bg-white p-8 shadow-sm">
        <div className="flex items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-md bg-gray-950 text-white">
            <LockKeyhole className="h-5 w-5" />
          </span>
          <div>
            <h1 className="text-xl font-semibold text-gray-950">Website protected</h1>
            <p className="text-sm text-gray-500">Enter the access password before opening the app.</p>
          </div>
        </div>
        <AccessForm next={next} />
      </section>
    </main>
  );
}
