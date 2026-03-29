"use client";

import { createContext, useEffect, useMemo, useState } from "react";

import type { LoginInput, RegisterInput, SessionUser } from "@/types";
import {
  getCurrentSession,
  login as loginRequest,
  logout as logoutRequest,
  replaceStoredSession,
  register as registerRequest,
  subscribeToSession
} from "@/services/auth-service";

interface AuthContextValue {
  user: SessionUser | null;
  loading: boolean;
  login: (payload: LoginInput) => Promise<SessionUser>;
  register: (payload: RegisterInput) => Promise<SessionUser>;
  logout: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<SessionUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedSession = getCurrentSession();
    if (storedSession) {
      setUser(storedSession);
    }

    let active = true;

    void fetch("/api/session", { cache: "no-store" })
      .then(async (response) => response.json())
      .then((payload: { user?: SessionUser | null }) => {
        if (!active) return;
        const nextUser = payload.user ?? null;
        replaceStoredSession(nextUser);
        setUser(nextUser);
      })
      .catch(() => {
        if (!active || storedSession) return;
        replaceStoredSession(null);
        setUser(null);
      })
      .finally(() => {
        if (active) {
          setLoading(false);
        }
      });

    const unsubscribe = subscribeToSession((session) => {
      if (!active) return;
      replaceStoredSession(session);
      setUser(session);
      setLoading(false);
    });

    return () => {
      active = false;
      unsubscribe?.();
    };
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      loading,
      login: async (payload) => {
        const nextUser = await loginRequest(payload);
        setUser(nextUser);
        return nextUser;
      },
      register: async (payload) => {
        const nextUser = await registerRequest(payload);
        setUser(nextUser);
        return nextUser;
      },
      logout: async () => {
        await logoutRequest();
        setUser(null);
      }
    }),
    [loading, user]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
