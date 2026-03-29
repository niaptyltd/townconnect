"use client";

import { useMemo } from "react";

import { AuthContext } from "@/lib/auth/auth-context";
import type { LoginInput, RegisterInput, SessionUser } from "@/types";

export function AppProviders({ children }: { children: React.ReactNode }) {
  const value = useMemo(
    () => ({
      user: null as SessionUser | null,
      loading: false,
      login: async (_payload: LoginInput) => {
        throw new Error("Login is temporarily unavailable in demo shell mode.");
      },
      register: async (_payload: RegisterInput) => {
        throw new Error("Registration is temporarily unavailable in demo shell mode.");
      },
      logout: async () => {}
    }),
    []
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}