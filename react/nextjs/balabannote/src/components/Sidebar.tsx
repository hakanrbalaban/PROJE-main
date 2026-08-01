"use client";

import {
  IconBoard,
  IconClose,
  IconNote,
  IconPlus,
  IconTodo,
} from "@/components/Icons";
import { BrandLogo } from "@/components/BrandLogo";
import { Tip } from "@/components/Tip";
import type { Notebook, NotePage, PageKind } from "@/lib/types";
import {
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";

const KIND_META: Record<PageKind, { label: string; icon: ReactNode }> = {
  note: { label: "Not (yaz + kalem)", icon: <IconNote size={16} /> },
  board: { label: "Board", icon: <IconBoard size={16} /> },
  todo: { label: "Todo", icon: <IconTodo size={16} /> },
};

type SidebarProps = {
  notebooks: Notebook[];
  pages: NotePage[];
  activeNotebookId: string | null;
  activePageId: string | null;
  onSelectNotebook: (id: string) => void;
  onSelectPage: (id: string) => void;
  onAddNotebook: () => void;
  onRenameNotebook: (id: string, title: string) => void;
  onDeleteNotebook: (id: string) => void;
  onAddPage: (kind: PageKind) => void;
  onRenamePage: (id: string, title: string) => void;
  onDeletePage: (id: string) => void;
};

type EditTarget =
  | { type: "notebook"; id: string }
  | { type: "page"; id: string }
  | null;

export function Sidebar({
  notebooks,
  pages,
  activeNotebookId,
  activePageId,
  onSelectNotebook,
  onSelectPage,
  onAddNotebook,
  onRenameNotebook,
  onDeleteNotebook,
  onAddPage,
  onRenamePage,
  onDeletePage,
}: SidebarProps) {
  const [editing, setEditing] = useState<EditTarget>(null);
  const [draft, setDraft] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!editing) return;
    const el = inputRef.current;
    if (!el) return;
    el.focus();
    el.select();
  }, [editing]);

  const startEdit = (
    type: "notebook" | "page",
    id: string,
    title: string,
  ) => {
    setEditing({ type, id });
    setDraft(title);
  };

  const commitEdit = () => {
    if (!editing) return;
    const next = draft.trim();
    if (editing.type === "notebook") {
      if (next) onRenameNotebook(editing.id, next);
    } else if (next) {
      onRenamePage(editing.id, next);
    }
    setEditing(null);
  };

  const cancelEdit = () => setEditing(null);

  return (
    <aside className="sidebar">
      <div className="brand">
        <BrandLogo size={42} />
        <div>
          <p className="brand-name">Balaban Note</p>
          <p className="brand-tag">yaz · çiz · planla</p>
        </div>
      </div>

      <div className="sidebar-section">
        <div className="section-head">
          <h2>Defterler</h2>
          <Tip label="Yeni defter">
            <button
              type="button"
              className="icon-btn"
              onClick={onAddNotebook}
              aria-label="Yeni defter"
            >
              <IconPlus size={15} />
            </button>
          </Tip>
        </div>
        <ul className="notebook-list">
          {notebooks.map((nb) => {
            const isEditing =
              editing?.type === "notebook" && editing.id === nb.id;
            return (
              <li key={nb.id}>
                <div
                  className={`notebook-item ${nb.id === activeNotebookId ? "active" : ""}`}
                  onClick={() => {
                    if (!isEditing) onSelectNotebook(nb.id);
                  }}
                  onDoubleClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    startEdit("notebook", nb.id, nb.title);
                  }}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      onSelectNotebook(nb.id);
                    }
                    if (e.key === "F2") {
                      e.preventDefault();
                      startEdit("notebook", nb.id, nb.title);
                    }
                  }}
                >
                  <span className="nb-dot" style={{ background: nb.color }} />
                  {isEditing ? (
                    <input
                      ref={inputRef}
                      className="sidebar-rename"
                      value={draft}
                      onChange={(e) => setDraft(e.target.value)}
                      onClick={(e) => e.stopPropagation()}
                      onBlur={commitEdit}
                      onKeyDown={(e) => {
                        e.stopPropagation();
                        if (e.key === "Enter") {
                          e.preventDefault();
                          commitEdit();
                        }
                        if (e.key === "Escape") {
                          e.preventDefault();
                          cancelEdit();
                        }
                      }}
                      aria-label="Defter adını düzenle"
                    />
                  ) : (
                    <span className="sidebar-label" title="Çift tıkla: yeniden adlandır">
                      {nb.title}
                    </span>
                  )}
                </div>
                {notebooks.length > 1 && (
                  <Tip label="Defteri sil">
                    <button
                      type="button"
                      className="ghost-btn tiny"
                      onClick={() => onDeleteNotebook(nb.id)}
                      aria-label="Defteri sil"
                    >
                      <IconClose size={13} />
                    </button>
                  </Tip>
                )}
              </li>
            );
          })}
        </ul>
      </div>

      <div className="sidebar-section grow">
        <div className="section-head">
          <h2>Sayfalar</h2>
        </div>
        <div className="add-page-row three icon-only">
          {(Object.keys(KIND_META) as PageKind[]).map((kind) => (
            <Tip key={kind} label={KIND_META[kind].label}>
              <button
                type="button"
                className="add-kind icon-kind"
                onClick={() => onAddPage(kind)}
                aria-label={KIND_META[kind].label}
              >
                {KIND_META[kind].icon}
              </button>
            </Tip>
          ))}
        </div>
        <ul className="page-list">
          {pages.map((page) => {
            const isEditing =
              editing?.type === "page" && editing.id === page.id;
            return (
              <li key={page.id}>
                <div
                  className={`page-item ${page.id === activePageId ? "active" : ""}`}
                  onClick={() => {
                    if (!isEditing) onSelectPage(page.id);
                  }}
                  onDoubleClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    startEdit("page", page.id, page.title);
                  }}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      onSelectPage(page.id);
                    }
                    if (e.key === "F2") {
                      e.preventDefault();
                      startEdit("page", page.id, page.title);
                    }
                  }}
                >
                  <Tip label={KIND_META[page.kind]?.label ?? "Sayfa"}>
                    <span className={`kind-chip kind-${page.kind}`}>
                      {KIND_META[page.kind]?.icon ?? null}
                    </span>
                  </Tip>
                  {isEditing ? (
                    <input
                      ref={inputRef}
                      className="sidebar-rename"
                      value={draft}
                      onChange={(e) => setDraft(e.target.value)}
                      onClick={(e) => e.stopPropagation()}
                      onBlur={commitEdit}
                      onKeyDown={(e) => {
                        e.stopPropagation();
                        if (e.key === "Enter") {
                          e.preventDefault();
                          commitEdit();
                        }
                        if (e.key === "Escape") {
                          e.preventDefault();
                          cancelEdit();
                        }
                      }}
                      aria-label="Sayfa adını düzenle"
                    />
                  ) : (
                    <span className="sidebar-label" title="Çift tıkla: yeniden adlandır">
                      {page.title}
                    </span>
                  )}
                </div>
                <Tip label="Sayfayı sil">
                  <button
                    type="button"
                    className="ghost-btn tiny"
                    onClick={() => onDeletePage(page.id)}
                    aria-label="Sayfayı sil"
                  >
                    <IconClose size={13} />
                  </button>
                </Tip>
              </li>
            );
          })}
          {pages.length === 0 && (
            <li className="empty-hint sidebar-empty">Bu defterde sayfa yok.</li>
          )}
        </ul>
      </div>

      <footer className="sidebar-credits">
        <p>
          İkonlar:{" "}
          <a
            href="https://lucide.dev"
            target="_blank"
            rel="noopener noreferrer"
          >
            Lucide
          </a>
          {" · "}
          <a
            href="https://lucide.dev/license"
            target="_blank"
            rel="noopener noreferrer"
          >
            ISC
          </a>
          {" / Feather "}
          <a
            href="https://github.com/feathericons/feather/blob/main/LICENSE"
            target="_blank"
            rel="noopener noreferrer"
          >
            MIT
          </a>
        </p>
        <p className="credits-sub">
          Formül:{" "}
          <a href="https://katex.org" target="_blank" rel="noopener noreferrer">
            KaTeX
          </a>{" "}
          (MIT) · Lisans: <code>THIRD_PARTY_NOTICES.md</code>
        </p>
      </footer>
    </aside>
  );
}
