import { BarChart3 } from "lucide-react";
import { signIn } from "@/auth";
import { Button } from "@/components/ui/button";

export default function LoginPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-white px-6">
      <section className="w-full max-w-md rounded-lg border border-gray-200 bg-white p-8 shadow-sm">
        <div className="flex items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-md bg-gray-950 text-white">
            <BarChart3 className="h-5 w-5" />
          </span>
          <div>
            <h1 className="text-xl font-semibold text-gray-950">SEO Monthly Report Generator</h1>
            <p className="text-sm text-gray-500">Sign in with Google to manage client reports.</p>
          </div>
        </div>
        <form
          className="mt-8"
          action={async () => {
            "use server";
            await signIn("google", { redirectTo: "/dashboard" });
          }}
        >
          <Button type="submit" className="w-full">
            Continue with Google
          </Button>
        </form>
        <p className="mt-4 text-sm leading-6 text-gray-500">
          Google OAuth scopes are requested for Search Console and GA4 read-only data. In development, API data can run in mock mode.
        </p>
      </section>
    </main>
  );
}
