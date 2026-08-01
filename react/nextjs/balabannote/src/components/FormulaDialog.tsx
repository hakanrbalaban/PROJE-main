"use client";

import {
  FORMULA_CATALOG,
  renderLatex,
  type FormulaItem,
} from "@/lib/formula";
import { useEffect, useMemo, useState } from "react";

type FormulaDialogProps = {
  open: boolean;
  initialLatex?: string;
  initialDisplay?: boolean;
  onClose: () => void;
  onInsert: (latex: string, displayMode: boolean) => void;
};

export function FormulaDialog({
  open,
  initialLatex = "",
  initialDisplay = true,
  onClose,
  onInsert,
}: FormulaDialogProps) {
  const [latex, setLatex] = useState(initialLatex);
  const [displayMode, setDisplayMode] = useState(initialDisplay);
  const [categoryId, setCategoryId] = useState(FORMULA_CATALOG[0]?.id ?? "");
  const [query, setQuery] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [menuOpen, setMenuOpen] = useState(true);

  useEffect(() => {
    if (!open) return;
    setLatex(initialLatex);
    setDisplayMode(initialDisplay);
    setQuery("");
    setSelectedId(null);
    setMenuOpen(true);
  }, [open, initialLatex, initialDisplay]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) {
      return (
        FORMULA_CATALOG.find((c) => c.id === categoryId)?.items ??
        FORMULA_CATALOG[0]?.items ??
        []
      );
    }
    return FORMULA_CATALOG.flatMap((c) =>
      c.items.filter(
        (i) =>
          i.label.toLowerCase().includes(q) ||
          i.latex.toLowerCase().includes(q) ||
          c.title.toLowerCase().includes(q),
      ),
    );
  }, [categoryId, query]);

  const preview = useMemo(() => {
    if (!latex.trim()) return "";
    return renderLatex(latex, displayMode);
  }, [latex, displayMode]);

  const categoryTitle =
    FORMULA_CATALOG.find((c) => c.id === categoryId)?.title ?? "Formüller";

  const pick = (item: FormulaItem) => {
    setLatex(item.latex);
    setSelectedId(item.id);
    setDisplayMode(true);
  };

  if (!open) return null;

  return (
    <div className="formula-sheet" role="dialog" aria-modal aria-label="Formül ekle">
      <header className="formula-sheet-head">
        <div className="formula-sheet-head-left">
          <button
            type="button"
            className={`formula-menu-toggle ${menuOpen ? "open" : ""}`}
            onClick={() => setMenuOpen((v) => !v)}
            aria-expanded={menuOpen}
            aria-controls="formula-side-menu"
          >
            {menuOpen ? "‹ Liste" : "› Liste"}
          </button>
          <div>
            <h2>Formül ekle</h2>
            <p>Listeden seç veya LaTeX yaz · Esc kapatır</p>
          </div>
        </div>
        <button
          type="button"
          className="formula-close"
          onClick={onClose}
          aria-label="Kapat"
        >
          ×
        </button>
      </header>

      <div className={`formula-sheet-body ${menuOpen ? "with-menu" : "menu-closed"}`}>
        <aside
          id="formula-side-menu"
          className={`formula-side-menu ${menuOpen ? "open" : ""}`}
          aria-hidden={!menuOpen}
        >
          <input
            className="formula-search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Formül ara…"
            aria-label="Formül ara"
            autoFocus
          />

          {!query.trim() && (
            <div className="formula-cats" role="tablist">
              {FORMULA_CATALOG.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  role="tab"
                  className={categoryId === c.id ? "active" : ""}
                  aria-selected={categoryId === c.id}
                  onClick={() => setCategoryId(c.id)}
                >
                  {c.title}
                  <span className="cat-count">{c.items.length}</span>
                </button>
              ))}
            </div>
          )}

          <div className="formula-list-meta">
            {query.trim()
              ? `${filtered.length} sonuç`
              : `${categoryTitle} · ${filtered.length}`}
          </div>

          <div className="formula-pick-list" role="listbox">
            {filtered.map((item) => (
              <button
                key={item.id + item.latex}
                type="button"
                role="option"
                aria-selected={selectedId === item.id}
                className={`formula-pick-item ${selectedId === item.id ? "active" : ""}`}
                onClick={() => pick(item)}
                onDoubleClick={() => {
                  pick(item);
                  onInsert(item.latex, true);
                  onClose();
                }}
              >
                <span className="formula-pick-label">{item.label}</span>
                <span
                  className="formula-pick-math"
                  dangerouslySetInnerHTML={{
                    __html: renderLatex(item.latex, false),
                  }}
                />
              </button>
            ))}
            {filtered.length === 0 && (
              <p className="formula-pick-empty">Sonuç yok — sağdan LaTeX yaz.</p>
            )}
          </div>
        </aside>

        <section className="formula-main-pane">
          <label className="formula-field">
            <span>Seçilen / özel LaTeX</span>
            <textarea
              value={latex}
              onChange={(e) => setLatex(e.target.value)}
              placeholder="Listeden seç veya buraya yaz…"
              rows={4}
              spellCheck={false}
            />
          </label>

          <label className="formula-display-toggle">
            <input
              type="checkbox"
              checked={displayMode}
              onChange={(e) => setDisplayMode(e.target.checked)}
            />
            Büyük (blok) görünüm
          </label>

          <div className="formula-preview-label">Önizleme</div>
          <div
            className={`formula-preview grow ${displayMode ? "block" : ""}`}
            dangerouslySetInnerHTML={{
              __html:
                preview ||
                '<span class="formula-preview-empty">Listeden bir formül seç…</span>',
            }}
          />

          <footer className="formula-dialog-actions sticky">
            <button type="button" className="formula-btn ghost" onClick={onClose}>
              İptal
            </button>
            <button
              type="button"
              className="formula-btn primary"
              disabled={!latex.trim()}
              onClick={() => {
                if (!latex.trim()) return;
                onInsert(latex.trim(), displayMode);
                onClose();
              }}
            >
              Sayfaya ekle
            </button>
          </footer>
        </section>
      </div>
    </div>
  );
}
