import { NextRequest, NextResponse } from "next/server";

const publicPrefixes = ["/_next", "/favicon.ico", "/placeholder-agency.svg", "/placeholder-client.svg"];

async function hmac(payload: string, secret: string) {
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey("raw", encoder.encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  const signature = await crypto.subtle.sign("HMAC", key, encoder.encode(payload));
  return btoa(String.fromCharCode(...new Uint8Array(signature))).replaceAll("+", "-").replaceAll("/", "_").replaceAll("=", "");
}

async function hasAccess(request: NextRequest) {
  const cookie = request.cookies.get("site_access")?.value;
  if (!cookie) return false;
  const [payload, signature] = cookie.split(".");
  if (payload !== "granted" || !signature) return false;
  const expected = await hmac(payload, process.env.AUTH_SECRET || "development-secret");
  return signature === expected;
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  if (publicPrefixes.some((prefix) => pathname.startsWith(prefix)) || pathname === "/access") {
    return NextResponse.next();
  }

  if (await hasAccess(request)) {
    return NextResponse.next();
  }

  const url = request.nextUrl.clone();
  url.pathname = "/access";
  url.searchParams.set("next", `${pathname}${request.nextUrl.search}`);
  return NextResponse.redirect(url);
}

export const config = {
  matcher: ["/((?!_next/static|_next/image).*)"],
};
