"use client";

import { useNoteFonts } from "@/hooks/useNoteFonts";
import type { FontOption } from "@/lib/fonts";
import { useEffect, useMemo, useRef, useState } from "react";

type FontPickerProps = {
  onPick: (family: string) => void;
  onRememberSelection?: () => void;
};

const SOURCE_LABEL: Record<FontOption["source"], string> = {
  system: "Sistem",
  library: "Kütüphane",
  local: "Bu bilgisayar",
};

export function FontPicker({ onPick, onRememberSelection }: FontPickerProps) {
  const { fonts, localStatus } = useNoteFonts();
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [currentLabel, setCurrentLabel] = useState("Varsayılan");
  const [currentFamily, setCurrentFamily] = useState<string | undefined>();
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [open]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return fonts;
    return fonts.filter(
      (f) =>
        f.label.toLowerCase().includes(q) ||
        f.family.toLowerCase().includes(q),
    );
  }, [fonts, query]);

  const grouped = useMemo(() => {
    const map: Record<FontOption["source"], FontOption[]> = {
      system: [],
      library: [],
      local: [],
    };
    for (const f of filtered) map[f.source].push(f);
    return map;
  }, [filtered]);

  const pick = (f: FontOption) => {
    setCurrentLabel(f.label);
    setCurrentFamily(f.family === "inherit" ? undefined : f.family);
    setOpen(false);
    setQuery("");
    onPick(f.family);
  };

  return (
    <div className="font-picker" ref={rootRef}>
      <label className="page-theme-select font-picker-label">
        <span>Font</span>
        <button
          type="button"
          className="font-picker-trigger"
          aria-label="Yazı tipi seç"
          aria-expanded={open}
          onMouseDown={() => onRememberSelection?.()}
          onClick={() => {
            onRememberSelection?.();
            setOpen((v) => !v);
          }}
        >
          <span
            className="font-picker-current"
            style={{ fontFamily: currentFamily }}
          >
            {currentLabel}
          </span>
          <span aria-hidden>▾</span>
        </button>
      </label>

      {open && (
        <div
          className="font-picker-panel"
          role="listbox"
          aria-label="Yazı tipleri"
        >
          <input
            className="font-picker-search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Font ara…"
            autoFocus
            aria-label="Font ara"
          />
          <div className="font-picker-scroll">
            {(["system", "library", "local"] as const).map((source) => {
              const list = grouped[source];
              if (list.length === 0) return null;
              return (
                <div key={source} className="font-picker-group">
                  <p className="font-picker-group-title">
                    {SOURCE_LABEL[source]}
                    {source === "local" && localStatus === "loading"
                      ? "…"
                      : source === "local" && localStatus === "denied"
                        ? " (izin yok)"
                        : source === "local" && localStatus === "unsupported"
                          ? " (destek yok)"
                          : ""}
                  </p>
                  {list.map((f) => (
                    <button
                      key={f.id}
                      type="button"
                      role="option"
                      className="font-picker-item"
                      style={{
                        fontFamily:
                          f.family === "inherit" ? undefined : f.family,
                      }}
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={() => pick(f)}
                    >
                      {f.label}
                    </button>
                  ))}
                </div>
              );
            })}
            {filtered.length === 0 && (
              <p className="font-picker-empty">Eşleşen font yok.</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
