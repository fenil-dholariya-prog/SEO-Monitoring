import Link from "next/link";
import {
  BarChart3,
  BookOpenText,
  Building2,
  Cable,
  FileText,
  Home,
  Layers3,
  Link2,
  Settings,
  Sparkles,
} from "lucide-react";

const nav = [
  { href: "/dashboard", label: "Dashboard", icon: Home },
  { href: "/clients", label: "Clients", icon: Building2 },
  { href: "/integrations", label: "Integrations", icon: Cable },
  { href: "/reports", label: "Monthly Reports", icon: FileText },
  { href: "/reports/new", label: "Report Builder", icon: Sparkles },
  { href: "/on-page", label: "On-page Work", icon: Layers3 },
  { href: "/backlinks", label: "Backlinks", icon: Link2 },
  { href: "/blog-plan", label: "Blog Plan", icon: BookOpenText },
  { href: "/settings", label: "Settings", icon: Settings },
];

export function Sidebar() {
  return (
    <aside className="sticky top-0 hidden h-screen w-72 border-r border-gray-200 bg-white px-4 py-5 lg:block">
      <Link href="/dashboard" className="flex items-center gap-3 px-2">
        <span className="flex h-10 w-10 items-center justify-center rounded-md bg-gray-950 text-white">
          <BarChart3 className="h-5 w-5" />
        </span>
        <span>
          <span className="block text-sm font-semibold text-gray-950">SEO Monthly</span>
          <span className="block text-xs text-gray-500">Report Generator</span>
        </span>
      </Link>
      <nav className="mt-8 space-y-1">
        {nav.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium text-gray-600 transition hover:bg-gray-100 hover:text-gray-950"
          >
            <item.icon className="h-4 w-4" />
            {item.label}
          </Link>
        ))}
      </nav>
    </aside>
  );
}
