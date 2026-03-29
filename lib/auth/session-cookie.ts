import { createHmac, timingSafeEqual } from "crypto";

import { cookies } from "next/headers";

import type { SessionUser } from "@/types";

export const SESSION_COOKIE_NAME = "townconnect_session";

function getSessionSecret() {
  if (process.env.SESSION_SECRET) {
    return process.env.SESSION_SECRET;
  }

  if (process.env.NODE_ENV === "production") {
    throw new Error("SESSION_SECRET must be set in production.");
  }

  return "dev-only-session-secret";
}

function toBase64Url(value: string) {
  return Buffer.from(value, "utf8").toString("base64url");
}

function fromBase64Url(value: string) {
  return Buffer.from(value, "base64url").toString("utf8");
}

function sign(payload: string) {
  return createHmac("sha256", getSessionSecret()).update(payload).digest("base64url");
}

export function createSessionCookieValue(session: SessionUser) {
  const payload = toBase64Url(JSON.stringify(session));
  return `${payload}.${sign(payload)}`;
}

export function parseSessionCookieValue(value?: string | null): SessionUser | null {
  if (!value) return null;

  const [payload, signature] = value.split(".");
  if (!payload || !signature) return null;

  const expected = sign(payload);
  const provided = Buffer.from(signature);
  const known = Buffer.from(expected);

  if (provided.length !== known.length || !timingSafeEqual(provided, known)) {
    return null;
  }

  try {
    return JSON.parse(fromBase64Url(payload)) as SessionUser;
  } catch {
    return null;
  }
}

export async function getServerSession() {
  const cookieStore = await cookies();
  return parseSessionCookieValue(cookieStore.get(SESSION_COOKIE_NAME)?.value);
}
