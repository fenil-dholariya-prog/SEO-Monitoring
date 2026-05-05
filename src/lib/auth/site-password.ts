import crypto from "crypto";

const iterations = 120000;
const keyLength = 64;
const digest = "sha512";

export function hashSitePassword(password: string) {
  const salt = crypto.randomBytes(16).toString("hex");
  const hash = crypto.pbkdf2Sync(password, salt, iterations, keyLength, digest).toString("hex");
  return `pbkdf2$${iterations}$${salt}$${hash}`;
}

export function verifySitePassword(password: string, stored: string) {
  const [scheme, iterationRaw, salt, hash] = stored.split("$");
  if (scheme !== "pbkdf2" || !iterationRaw || !salt || !hash) return false;
  const derived = crypto.pbkdf2Sync(password, salt, Number(iterationRaw), keyLength, digest).toString("hex");
  return crypto.timingSafeEqual(Buffer.from(hash, "hex"), Buffer.from(derived, "hex"));
}

export function getDefaultSitePassword() {
  return process.env.SITE_ACCESS_PASSWORD || "Fenil@007";
}

export function signAccessCookie(secret = process.env.AUTH_SECRET || "development-secret") {
  const payload = "granted";
  const signature = crypto.createHmac("sha256", secret).update(payload).digest("base64url");
  return `${payload}.${signature}`;
}
