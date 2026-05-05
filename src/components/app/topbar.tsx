import { LogOut, UserCircle } from "lucide-react";
import { signOut } from "@/auth";
import { Button } from "@/components/ui/button";

export function Topbar({ name, role }: { name?: string | null; role?: string }) {
  return (
    <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-gray-200 bg-white/95 px-5 backdrop-blur">
      <div>
        <p className="text-sm font-semibold text-gray-950">Internal agency reporting workspace</p>
        <p className="text-xs text-gray-500">Phase 1 MVP with Google data, manual work, insights, and exports</p>
      </div>
      <div className="flex items-center gap-3">
        <div className="hidden items-center gap-2 text-right md:flex">
          <UserCircle className="h-5 w-5 text-gray-400" />
          <div>
            <p className="text-sm font-medium text-gray-900">{name ?? "Agency user"}</p>
            <p className="text-xs text-gray-500">{role === "ADMIN" ? "Admin" : "Team Member"}</p>
          </div>
        </div>
        <form
          action={async () => {
            "use server";
            await signOut({ redirectTo: "/login" });
          }}
        >
          <Button type="submit" variant="secondary" className="px-3" title="Sign out">
            <LogOut className="h-4 w-4" />
          </Button>
        </form>
      </div>
    </header>
  );
}
