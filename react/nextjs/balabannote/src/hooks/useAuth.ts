"use client";

import { useCallback, useEffect, useState } from "react";

export type AuthUser = {
  id: number;
  email: string;
  name: string;
};

export function useAuth() {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async (opts?: { silent?: boolean }) => {
    if (!opts?.silent) {
      setLoading(true);
      setError(null);
    }
    try {
      const res = await fetch("/api/auth/me", { credentials: "include" });
      if (!res.ok) {
        setUser(null);
        return null;
      }
      const data = (await res.json()) as { user: AuthUser };
      setUser(data.user);
      return data.user;
    } catch {
      if (!opts?.silent) setUser(null);
      return null;
    } finally {
      if (!opts?.silent) setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  // Sekme odak / görünür olunca oturumu kaydırarak yenile
  useEffect(() => {
    const onFocus = () => {
      void refresh({ silent: true });
    };
    const onVisibility = () => {
      if (document.visibilityState === "visible") {
        void refresh({ silent: true });
      }
    };
    window.addEventListener("focus", onFocus);
    document.addEventListener("visibilitychange", onVisibility);
    // Periyodik yenileme (12 saatte bir) — tarayıcı uzun açık kalsa bile
    const interval = window.setInterval(
      () => void refresh({ silent: true }),
      12 * 60 * 60 * 1000,
    );
    return () => {
      window.removeEventListener("focus", onFocus);
      document.removeEventListener("visibilitychange", onVisibility);
      window.clearInterval(interval);
    };
  }, [refresh]);

  const login = useCallback(async (email: string, password: string) => {
    setError(null);
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ email, password }),
    });
    const data = (await res.json()) as { user?: AuthUser; error?: string };
    if (!res.ok) {
      setError(data.error ?? "Giriş başarısız");
      return false;
    }
    setUser(data.user ?? null);
    return true;
  }, []);

  const register = useCallback(
    async (name: string, email: string, password: string) => {
      setError(null);
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ name, email, password }),
      });
      const data = (await res.json()) as { user?: AuthUser; error?: string };
      if (!res.ok) {
        setError(data.error ?? "Kayıt başarısız");
        return false;
      }
      setUser(data.user ?? null);
      return true;
    },
    [],
  );

  const logout = useCallback(async () => {
    await fetch("/api/auth/logout", {
      method: "POST",
      credentials: "include",
    });
    setUser(null);
  }, []);

  return { user, loading, error, setError, login, register, logout, refresh };
}
