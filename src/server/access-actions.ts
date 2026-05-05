"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { getDefaultSitePassword, hashSitePassword, signAccessCookie, verifySitePassword } from "@/lib/auth/site-password";
import { requireAdmin } from "@/server/authz";

const passwordKey = "site_access_password_hash";

async function getPasswordHash() {
  const setting = await prisma.appSetting.findUnique({ where: { key: passwordKey } });
  if (setting) return setting.value;

  const hash = hashSitePassword(getDefaultSitePassword());
  await prisma.appSetting.upsert({
    where: { key: passwordKey },
    update: { value: hash },
    create: { key: passwordKey, value: hash },
  });
  return hash;
}

export async function verifySiteAccessAction(_state: unknown, formData: FormData) {
  const password = String(formData.get("password") || "");
  const next = String(formData.get("next") || "/login");
  const hash = await getPasswordHash();

  if (!verifySitePassword(password, hash)) {
    return { error: "Incorrect access password." };
  }

  const cookieStore = await cookies();
  cookieStore.set("site_access", signAccessCookie(), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });
  redirect(next.startsWith("/") ? next : "/login");
}

export async function changeSitePasswordAction(_state: unknown, formData: FormData) {
  await requireAdmin();
  const currentPassword = String(formData.get("currentPassword") || "");
  const newPassword = String(formData.get("newPassword") || "");
  const confirmPassword = String(formData.get("confirmPassword") || "");

  if (newPassword.length < 8) return { error: "New password must be at least 8 characters." };
  if (newPassword !== confirmPassword) return { error: "New passwords do not match." };

  const currentHash = await getPasswordHash();
  if (!verifySitePassword(currentPassword, currentHash)) {
    return { error: "Current password is incorrect." };
  }

  await prisma.appSetting.upsert({
    where: { key: passwordKey },
    update: { value: hashSitePassword(newPassword) },
    create: { key: passwordKey, value: hashSitePassword(newPassword) },
  });

  return { ok: true, message: "Access password updated." };
}
