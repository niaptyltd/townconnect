"use client";

import { onAuthStateChanged } from "firebase/auth";

import { DEMO_LOGINS } from "@/constants/platform";
import { getBackendUnavailableMessage, isDemoModeEnabled, isFirebaseConfigured } from "@/firebase/config";
import { firebaseAuth, firebaseDb } from "@/firebase/client";
import { firebaseLogout, firebaseRegister, firebaseSignIn } from "@/firebase/auth-client";
import { upsertDemoDocument } from "@/lib/demo-store";
import type { LoginInput, RegisterInput, SessionUser } from "@/types";
import { slugify } from "@/utils/slug";

const STORAGE_KEY = "townconnect:session";

async function syncSessionCookie(session: SessionUser, idToken?: string) {
  const response = await fetch("/api/session", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      user: session,
      idToken
    })
  });

  if (response.ok) {
    return;
  }

  const payload = (await response.json().catch(() => null)) as
    | { error?: string }
    | null;
  throw new Error(payload?.error || "Unable to establish a secure session.");
}

async function clearSessionCookie() {
  await fetch("/api/session", {
    method: "DELETE"
  });
}

function readStoredSession() {
  if (typeof window === "undefined") return null;

  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) return null;

  try {
    return JSON.parse(raw) as SessionUser;
  } catch {
    return null;
  }
}

function storeSession(session: SessionUser | null) {
  if (typeof window === "undefined") return;

  if (!session) {
    window.localStorage.removeItem(STORAGE_KEY);
    return;
  }

  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
}

export function replaceStoredSession(session: SessionUser | null) {
  storeSession(session);
}

function getDemoUser(
  role: SessionUser["role"],
  email: string,
  fullName?: string,
  referredByCode?: string
): SessionUser {
  const presets = {
    customer: {
      id: "user-customer",
      fullName: "Lerato Mthembu",
      email: "customer@townconnect.co.za"
    },
    business_owner: {
      id: "user-owner-food",
      fullName: "Siyabonga Khumalo",
      email: "owner@townconnect.co.za"
    },
    admin: {
      id: "user-admin",
      fullName: "TownConnect Admin",
      email: "admin@townconnect.co.za"
    }
  } as const;
  const preset = presets[role];
  const userId =
    email && email.toLowerCase() !== preset.email.toLowerCase()
      ? `user-${slugify(email.split("@")[0])}`
      : preset.id;

  return {
    id: userId,
    fullName: fullName ?? preset.fullName,
    email: email || preset.email,
    role,
    townId: "town-vryheid",
    province: "KwaZulu-Natal",
    phone: "+27831234567",
    whatsappNumber: "+27831234567",
    profileImage: "",
    isActive: true,
    referredByCode: referredByCode || "",
    signupSource: referredByCode ? "referral" : "organic",
    onboardingStatus: "self_signup"
  };
}

export async function login(payload: LoginInput) {
  if (isFirebaseConfigured) {
    const { session, idToken } = await firebaseSignIn(payload.email, payload.password);
    await syncSessionCookie(session, idToken);
    storeSession(session);
    return session;
  }

  if (!isDemoModeEnabled) {
    throw new Error(getBackendUnavailableMessage("Sign in"));
  }

  const match = DEMO_LOGINS.find(
    (item) =>
      item.email.toLowerCase() === payload.email.toLowerCase() && item.password === payload.password
  );

  if (!match) {
    throw new Error("Invalid email or password. Use one of the demo logins from the form.");
  }

  const session = getDemoUser(match.role, match.email);
  await syncSessionCookie(session);
  storeSession(session);
  return session;
}

export async function register(payload: RegisterInput) {
  if (isFirebaseConfigured) {
    const { session, idToken } = await firebaseRegister(payload);
    await syncSessionCookie(session, idToken);
    storeSession(session);
    return session;
  }

  if (!isDemoModeEnabled) {
    throw new Error(getBackendUnavailableMessage("Registration"));
  }

  const session = getDemoUser(
    payload.role,
    payload.email,
    payload.fullName,
    payload.referredByCode
  );
  const now = new Date().toISOString();
  upsertDemoDocument("users", {
    id: session.id,
    fullName: payload.fullName,
    email: payload.email,
    phone: payload.phone,
    whatsappNumber: payload.whatsappNumber,
    role: payload.role,
    profileImage: "",
    townId: payload.townId,
    province: payload.province,
    isActive: true,
    referredByCode: payload.referredByCode || "",
    signupSource: payload.referredByCode ? "referral" : "organic",
    onboardingStatus: "self_signup",
    createdAt: now,
    updatedAt: now
  });
  await syncSessionCookie(session);
  storeSession(session);
  return session;
}

export async function logout() {
  if (isFirebaseConfigured) {
    await firebaseLogout();
  }

  storeSession(null);
  await clearSessionCookie();
}

export function getCurrentSession() {
  if (!isFirebaseConfigured && !isDemoModeEnabled) {
    storeSession(null);
    return null;
  }

  return readStoredSession();
}

export function subscribeToSession(callback: (session: SessionUser | null) => void) {
  if (!isFirebaseConfigured || !firebaseAuth || !firebaseDb) {
    if (!isDemoModeEnabled) {
      storeSession(null);
      callback(null);
      return () => undefined;
    }

    callback(readStoredSession());
    return () => undefined;
  }

  return onAuthStateChanged(firebaseAuth, async (user: any) => {
    if (!user) {
      storeSession(null);
      callback(null);
      return;
    }

    const cached = readStoredSession();
    callback(cached);
  });
}
