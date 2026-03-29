import { NextResponse } from "next/server";

import { getFirebaseAdminAuth } from "@/firebase/admin";
import {
  getAdminBackendUnavailableMessage,
  getBackendUnavailableMessage,
  isDemoModeEnabled,
  isFirebaseAdminConfigured,
  isFirebaseConfigured
} from "@/firebase/config";
import {
  SESSION_COOKIE_NAME,
  createSessionCookieValue,
  getServerSession
} from "@/lib/auth/session-cookie";
import type { SessionUser } from "@/types";

export async function GET() {
  if (!isFirebaseConfigured && !isDemoModeEnabled) {
    return NextResponse.json({ user: null, mode: "unconfigured" });
  }

  return NextResponse.json({ user: await getServerSession() });
}

export async function POST(request: Request) {
  const payload = (await request.json()) as { user?: SessionUser; idToken?: string };
  if (!payload.user) {
    return NextResponse.json({ error: "Missing session user." }, { status: 400 });
  }

  if (!isFirebaseConfigured && !isDemoModeEnabled) {
    return NextResponse.json(
      { error: getBackendUnavailableMessage("Authentication") },
      { status: 503 }
    );
  }

  if (isFirebaseConfigured) {
    if (!isFirebaseAdminConfigured) {
      return NextResponse.json(
        { error: getAdminBackendUnavailableMessage("Secure authentication") },
        { status: 503 }
      );
    }

    if (!payload.idToken) {
      return NextResponse.json({ error: "Missing Firebase ID token." }, { status: 400 });
    }

    const decoded = await getFirebaseAdminAuth().verifyIdToken(payload.idToken);
    if (decoded.uid !== payload.user.id) {
      return NextResponse.json({ error: "Session user mismatch." }, { status: 403 });
    }
  }

  const response = NextResponse.json({ ok: true });
  response.cookies.set({
    name: SESSION_COOKIE_NAME,
    value: createSessionCookieValue(payload.user),
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 7
  });

  return response;
}

export async function DELETE() {
  const response = NextResponse.json({ ok: true });
  response.cookies.set({
    name: SESSION_COOKIE_NAME,
    value: "",
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 0
  });

  return response;
}
