"use client";

import { Tip } from "@/components/Tip";
import { useTheme } from "@/hooks/useTheme";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  return (
    <div className="theme-switch" role="group" aria-label="Tema">
      <Tip label="Aydınlık tema">
        <button
          type="button"
          className={`theme-switch-btn ${theme === "light" ? "active" : ""}`}
          onClick={() => setTheme("light")}
          aria-pressed={theme === "light"}
          aria-label="Aydınlık"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden>
            <circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth="2" />
            <path
              d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>
        </button>
      </Tip>
      <Tip label="Karanlık tema">
        <button
          type="button"
          className={`theme-switch-btn ${theme === "dark" ? "active" : ""}`}
          onClick={() => setTheme("dark")}
          aria-pressed={theme === "dark"}
          aria-label="Karanlık"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden>
            <path
              d="M21 14.5A8.5 8.5 0 0 1 9.5 3 7 7 0 1 0 21 14.5Z"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinejoin="round"
            />
          </svg>
        </button>
      </Tip>
    </div>
  );
}

/** Applies theme early; mount once near app root. */
export function ThemeBoot() {
  useTheme();
  return null;
}
