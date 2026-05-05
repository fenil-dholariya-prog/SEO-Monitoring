import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatNumber(value?: number | null) {
  return new Intl.NumberFormat("en", { maximumFractionDigits: 0 }).format(value ?? 0);
}

export function formatPercent(value?: number | null) {
  return `${new Intl.NumberFormat("en", { maximumFractionDigits: 2 }).format(value ?? 0)}%`;
}

export function formatCurrency(value?: number | null) {
  return new Intl.NumberFormat("en", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value ?? 0);
}

export function monthName(month: number) {
  return new Date(2026, month - 1, 1).toLocaleString("en", { month: "long" });
}

export function absoluteUrl(path: string) {
  const base = process.env.NEXT_PUBLIC_APP_URL || process.env.AUTH_URL || "http://localhost:3000";
  return new URL(path, base).toString();
}
