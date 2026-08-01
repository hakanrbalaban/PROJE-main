"use client";

import {
  LIBRARY_FONTS,
  SYSTEM_FONTS,
  localFontOption,
  type FontOption,
} from "@/lib/fonts";
import { useEffect, useMemo, useState } from "react";

type FontDataLike = { family: string };

declare global {
  interface Window {
    queryLocalFonts?: () => Promise<FontDataLike[]>;
  }
}

/**
 * Sistem + kütüphane + (mümkünse) bilgisayardaki yerel yazı tipleri.
 */
export function useNoteFonts() {
  const [localFonts, setLocalFonts] = useState<FontOption[]>([]);
  const [localStatus, setLocalStatus] = useState<
    "idle" | "loading" | "ready" | "unsupported" | "denied"
  >("idle");

  useEffect(() => {
    let cancelled = false;
    async function load() {
      if (typeof window === "undefined" || !window.queryLocalFonts) {
        setLocalStatus("unsupported");
        return;
      }
      setLocalStatus("loading");
      try {
        const data = await window.queryLocalFonts();
        if (cancelled) return;
        const names = [
          ...new Set(
            data
              .map((f) => f.family?.trim())
              .filter((n): n is string => Boolean(n)),
          ),
        ].sort((a, b) => a.localeCompare(b, "tr"));
        setLocalFonts(names.map(localFontOption));
        setLocalStatus("ready");
      } catch {
        if (!cancelled) setLocalStatus("denied");
      }
    }
    void load();
    return () => {
      cancelled = true;
    };
  }, []);

  const fonts = useMemo(() => {
    const seen = new Set<string>();
    const out: FontOption[] = [];
    for (const f of [...SYSTEM_FONTS, ...LIBRARY_FONTS, ...localFonts]) {
      const key = f.label.toLowerCase();
      if (seen.has(key)) continue;
      seen.add(key);
      out.push(f);
    }
    return out;
  }, [localFonts]);

  return { fonts, localFonts, localStatus };
}
