"use client";

import { BrandLogo } from "@/components/BrandLogo";
import { useState } from "react";

type AuthScreenProps = {
  error: string | null;
  onClearError: () => void;
  onLogin: (email: string, password: string) => Promise<boolean>;
  onRegister: (
    name: string,
    email: string,
    password: string,
  ) => Promise<boolean>;
};

export function AuthScreen({
  error,
  onClearError,
  onLogin,
  onRegister,
}: AuthScreenProps) {
  const [mode, setMode] = useState<"login" | "register">("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    onClearError();
    try {
      if (mode === "login") await onLogin(email, password);
      else await onRegister(name, email, password);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="auth-screen">
      <div className="auth-card">
        <BrandLogo size={56} className="auth-logo" />
        <h1>Balaban Note</h1>
        <p className="auth-lead">
          Giriş yap — notlar, çizimler, formüller ve todo’lar MySQL’de kalır.
        </p>

        <div className="auth-tabs" role="tablist">
          <button
            type="button"
            role="tab"
            className={mode === "login" ? "active" : ""}
            onClick={() => {
              setMode("login");
              onClearError();
            }}
          >
            Giriş
          </button>
          <button
            type="button"
            role="tab"
            className={mode === "register" ? "active" : ""}
            onClick={() => {
              setMode("register");
              onClearError();
            }}
          >
            Kayıt ol
          </button>
        </div>

        <form className="auth-form" onSubmit={submit}>
          {mode === "register" && (
            <label>
              <span>Ad</span>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Adın"
                autoComplete="name"
              />
            </label>
          )}
          <label>
            <span>E-posta</span>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="ornek@mail.com"
              autoComplete="email"
              required
            />
          </label>
          <label>
            <span>Şifre</span>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="En az 4 karakter"
              autoComplete={mode === "login" ? "current-password" : "new-password"}
              required
              minLength={4}
            />
          </label>

          {error && <p className="auth-error">{error}</p>}

          <button type="submit" className="auth-submit" disabled={busy}>
            {busy ? "Bekle…" : mode === "login" ? "Giriş yap" : "Hesap oluştur"}
          </button>
        </form>
      </div>
    </div>
  );
}
