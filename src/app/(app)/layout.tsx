import type { ReactNode } from "react";
import { Sidebar } from "@/components/app/sidebar";
import { Topbar } from "@/components/app/topbar";
import { requireUser } from "@/server/authz";

export default async function AppLayout({ children }: { children: ReactNode }) {
  const user = await requireUser();
  return (
    <div className="min-h-screen bg-white">
      <div className="flex">
        <Sidebar />
        <div className="min-w-0 flex-1">
          <Topbar name={user.name} role={user.role} />
          <main className="mx-auto w-full max-w-7xl px-5 py-6">{children}</main>
        </div>
      </div>
    </div>
  );
}
