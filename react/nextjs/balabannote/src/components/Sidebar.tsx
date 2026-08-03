"use client";

import {
  IconBoard,
  IconClose,
  IconNote,
  IconPanelLeft,
  IconPanelLeftOpen,
  IconPlus,
  IconStar,
  IconStarFill,
  IconTemplate,
  IconTodo,
  IconTrash,
  IconUndo,
} from "@/components/Icons";
import { BrandLogo } from "@/components/BrandLogo";
import { ContextMenu, type CtxAction } from "@/components/ContextMenu";
import { Tip } from "@/components/Tip";
import type { Notebook, NotePage, PageKind } from "@/lib/types";
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type MouseEvent as ReactMouseEvent,
  type ReactNode,
} from "react";

const KIND_META: Record<
  PageKind,
  { label: string; icon: ReactNode; tone: string }
> = {
  note: {
    label: "Not (yaz + kalem)",
    icon: <IconNote size={17} strokeWidth={1.65} />,
    tone: "tone-note",
  },
  board: {
    label: "Board",
    icon: <IconBoard size={17} strokeWidth={1.65} />,
    tone: "tone-board",
  },
  todo: {
    label: "Todo",
    icon: <IconTodo size={17} strokeWidth={1.65} />,
    tone: "tone-todo",
  },
};

function stripHtml(html: string) {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function pageHaystack(page: NotePage) {
  const parts = [
    page.title,
    stripHtml(page.content ?? ""),
    ...(page.todos?.map((t) => t.text) ?? []),
  ];
  return parts.join(" ").toLowerCase();
}

type SidebarProps = {
  notebooks: Notebook[];
  pages: NotePage[];
  allPages: NotePage[];
  trashPages?: NotePage[];
  trashNotebooks?: Notebook[];
  activeNotebookId: string | null;
  activePageId: string | null;
  collapsed?: boolean;
  onToggleCollapsed?: () => void;
  onSelectNotebook: (id: string) => void;
  onSelectPage: (id: string) => void;
  onAddNotebook: () => void;
  onRenameNotebook: (id: string, title: string) => void;
  onDeleteNotebook: (id: string) => void;
  onAddPage: (kind: PageKind) => void;
  onOpenTemplates?: () => void;
  onRenamePage: (id: string, title: string) => void;
  onDeletePage: (id: string) => void;
  onTogglePinned?: (id: string) => void;
  onRestorePage?: (id: string) => void;
  onRestoreNotebook?: (id: string) => void;
  onPurgePage?: (id: string) => void;
  onPurgeNotebook?: (id: string) => void;
  onEmptyTrash?: () => void;
};

type EditTarget =
  | { type: "notebook"; id: string }
  | { type: "page"; id: string }
  | null;

type CtxTarget =
  | { kind: "page"; id: string; x: number; y: number }
  | { kind: "notebook"; id: string; x: number; y: number }
  | { kind: "trash-page"; id: string; x: number; y: number }
  | { kind: "trash-notebook"; id: string; x: number; y: number };

type ConfirmTarget =
  | { kind: "delete-page"; id: string }
  | { kind: "delete-notebook"; id: string }
  | { kind: "purge-page"; id: string }
  | { kind: "purge-notebook"; id: string }
  | { kind: "empty-trash" };

function InlineConfirm({
  label,
  onYes,
  onNo,
}: {
  label: string;
  onYes: () => void;
  onNo: () => void;
}) {
  return (
    <div className="inline-confirm" role="group" aria-label={label}>
      <span className="inline-confirm-label">{label}</span>
      <button type="button" className="inline-confirm-yes" onClick={onYes}>
        Evet
      </button>
      <button type="button" className="inline-confirm-no" onClick={onNo}>
        Hayır
      </button>
    </div>
  );
}

export function Sidebar({
  notebooks,
  pages,
  allPages,
  trashPages = [],
  trashNotebooks = [],
  activeNotebookId,
  activePageId,
  collapsed = false,
  onToggleCollapsed,
  onSelectNotebook,
  onSelectPage,
  onAddNotebook,
  onRenameNotebook,
  onDeleteNotebook,
  onAddPage,
  onOpenTemplates,
  onRenamePage,
  onDeletePage,
  onTogglePinned,
  onRestorePage,
  onRestoreNotebook,
  onPurgePage,
  onPurgeNotebook,
  onEmptyTrash,
}: SidebarProps) {
  const [editing, setEditing] = useState<EditTarget>(null);
  const [draft, setDraft] = useState("");
  const [search, setSearch] = useState("");
  const [ctx, setCtx] = useState<CtxTarget | null>(null);
  const [confirm, setConfirm] = useState<ConfirmTarget | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!editing) return;
    const el = inputRef.current;
    if (!el) return;
    el.focus();
    el.select();
  }, [editing]);

  const openCtx = useCallback(
    (
      e: ReactMouseEvent,
      target: Omit<CtxTarget, "x" | "y">,
    ) => {
      e.preventDefault();
      e.stopPropagation();
      setConfirm(null);
      setCtx({ ...target, x: e.clientX, y: e.clientY } as CtxTarget);
    },
    [],
  );

  const closeCtx = useCallback(() => setCtx(null), []);

  const askConfirm = useCallback((next: ConfirmTarget) => {
    setCtx(null);
    setConfirm(next);
  }, []);

  const clearConfirm = useCallback(() => setConfirm(null), []);

  const startEdit = (
    type: "notebook" | "page",
    id: string,
    title: string,
  ) => {
    setEditing({ type, id });
    setDraft(title);
    setConfirm(null);
    setCtx(null);
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

  const query = search.trim().toLowerCase();
  const searching = query.length > 0;

  const notebookTitle = useMemo(() => {
    const map = new Map(
      [...notebooks, ...trashNotebooks].map((n) => [n.id, n.title]),
    );
    return (id: string) => map.get(id) ?? "Defter";
  }, [notebooks, trashNotebooks]);

  const visiblePages = useMemo(() => {
    if (!searching) return pages.filter((p) => !p.deletedAt);
    return allPages
      .filter((p) => !p.deletedAt && pageHaystack(p).includes(query))
      .sort((a, b) => b.updatedAt - a.updatedAt);
  }, [searching, pages, allPages, query]);

  const favorites = useMemo(
    () =>
      allPages
        .filter((p) => p.pinned && !p.deletedAt)
        .sort((a, b) => b.updatedAt - a.updatedAt),
    [allPages],
  );

  const liveNotebooks = useMemo(
    () => notebooks.filter((n) => !n.deletedAt),
    [notebooks],
  );

  const trashCount = trashPages.length + trashNotebooks.length;

  const ctxActions = useMemo((): CtxAction[] => {
    if (!ctx) return [];
    if (ctx.kind === "page") {
      const page = allPages.find((p) => p.id === ctx.id);
      if (!page || page.deletedAt) return [];
      return [
        {
          id: "open",
          label: "Aç",
          onSelect: () => onSelectPage(page.id),
        },
        {
          id: "rename",
          label: "Yeniden adlandır",
          onSelect: () => startEdit("page", page.id, page.title),
        },
        ...(onTogglePinned
          ? [
              {
                id: "pin",
                label: page.pinned ? "Favoriden çıkar" : "Favorile",
                icon: page.pinned ? (
                  <IconStarFill size={14} />
                ) : (
                  <IconStar size={14} />
                ),
                onSelect: () => onTogglePinned(page.id),
              } satisfies CtxAction,
            ]
          : []),
        {
          id: "delete",
          label: "Çöp kutusuna taşı",
          icon: <IconTrash size={14} />,
          danger: true,
          onSelect: () =>
            askConfirm({ kind: "delete-page", id: page.id }),
        },
      ];
    }
    if (ctx.kind === "notebook") {
      const nb = liveNotebooks.find((n) => n.id === ctx.id);
      if (!nb) return [];
      return [
        {
          id: "open",
          label: "Aç",
          onSelect: () => onSelectNotebook(nb.id),
        },
        {
          id: "rename",
          label: "Yeniden adlandır",
          onSelect: () => startEdit("notebook", nb.id, nb.title),
        },
        {
          id: "delete",
          label: "Çöp kutusuna taşı",
          icon: <IconTrash size={14} />,
          danger: true,
          disabled: liveNotebooks.length <= 1,
          onSelect: () =>
            askConfirm({ kind: "delete-notebook", id: nb.id }),
        },
      ];
    }
    if (ctx.kind === "trash-page") {
      const page = trashPages.find((p) => p.id === ctx.id);
      if (!page) return [];
      return [
        ...(onRestorePage
          ? [
              {
                id: "restore",
                label: "Geri yükle",
                icon: <IconUndo size={14} />,
                onSelect: () => onRestorePage(page.id),
              } satisfies CtxAction,
            ]
          : []),
        ...(onPurgePage
          ? [
              {
                id: "purge",
                label: "Kalıcı sil",
                icon: <IconTrash size={14} />,
                danger: true,
                onSelect: () =>
                  askConfirm({ kind: "purge-page", id: page.id }),
              } satisfies CtxAction,
            ]
          : []),
      ];
    }
    if (ctx.kind === "trash-notebook") {
      const nb = trashNotebooks.find((n) => n.id === ctx.id);
      if (!nb) return [];
      return [
        ...(onRestoreNotebook
          ? [
              {
                id: "restore",
                label: "Geri yükle",
                icon: <IconUndo size={14} />,
                onSelect: () => onRestoreNotebook(nb.id),
              } satisfies CtxAction,
            ]
          : []),
        ...(onPurgeNotebook
          ? [
              {
                id: "purge",
                label: "Kalıcı sil",
                icon: <IconTrash size={14} />,
                danger: true,
                onSelect: () =>
                  askConfirm({ kind: "purge-notebook", id: nb.id }),
              } satisfies CtxAction,
            ]
          : []),
      ];
    }
    return [];
  }, [
    ctx,
    allPages,
    liveNotebooks,
    trashPages,
    trashNotebooks,
    onSelectPage,
    onSelectNotebook,
    onTogglePinned,
    onRestorePage,
    onRestoreNotebook,
    onPurgePage,
    onPurgeNotebook,
    askConfirm,
  ]);

  if (collapsed) {
    return (
      <aside className="sidebar sidebar-rail" aria-label="Kenar çubuğu">
        <Tip label="Kenar çubuğunu aç">
          <button
            type="button"
            className="icon-btn rail-expand"
            onClick={onToggleCollapsed}
            aria-label="Kenar çubuğunu aç"
          >
            <IconPanelLeftOpen size={16} />
          </button>
        </Tip>
        <div className="rail-kinds">
          {(Object.keys(KIND_META) as PageKind[]).map((kind) => (
            <Tip key={kind} label={KIND_META[kind].label}>
              <button
                type="button"
                className={`sidebar-fab ${KIND_META[kind].tone}`}
                onClick={() => onAddPage(kind)}
                aria-label={KIND_META[kind].label}
              >
                {KIND_META[kind].icon}
              </button>
            </Tip>
          ))}
        </div>
      </aside>
    );
  }

  return (
    <aside className="sidebar">
      <div className="brand">
        <BrandLogo size={42} />
        <div className="brand-text">
          <p className="brand-name">Balaban Note</p>
          <p className="brand-tag">defter · sayfa · çizim</p>
        </div>
        {onToggleCollapsed && (
          <Tip label="Kenar çubuğunu daralt">
            <button
              type="button"
              className="icon-btn brand-collapse"
              onClick={onToggleCollapsed}
              aria-label="Kenar çubuğunu daralt"
            >
              <IconPanelLeft size={15} />
            </button>
          </Tip>
        )}
      </div>

      <div className="sidebar-search-wrap">
        <input
          className="sidebar-search"
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Notlarda ara…"
          aria-label="Notlarda ara"
        />
        {searching && (
          <button
            type="button"
            className="sidebar-search-clear"
            onClick={() => setSearch("")}
            aria-label="Aramayı temizle"
          >
            <IconClose size={13} />
          </button>
        )}
      </div>

      {!searching && (
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
            {liveNotebooks.map((nb) => {
              const isEditing =
                editing?.type === "notebook" && editing.id === nb.id;
              return (
                <li key={nb.id}>
                  <div
                    className={`notebook-item ${nb.id === activeNotebookId ? "active" : ""}`}
                    onClick={() => {
                      if (!isEditing) onSelectNotebook(nb.id);
                    }}
                    onContextMenu={(e) =>
                      openCtx(e, { kind: "notebook", id: nb.id })
                    }
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
                      if (e.key === "Delete" && liveNotebooks.length > 1) {
                        e.preventDefault();
                        askConfirm({ kind: "delete-notebook", id: nb.id });
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
                      <span
                        className="sidebar-label"
                        title="Çift tıkla: yeniden adlandır"
                      >
                        {nb.title}
                      </span>
                    )}
                  </div>
                  {confirm?.kind === "delete-notebook" &&
                  confirm.id === nb.id ? (
                    <InlineConfirm
                      label="Silinsin mi?"
                      onYes={() => {
                        onDeleteNotebook(nb.id);
                        clearConfirm();
                      }}
                      onNo={clearConfirm}
                    />
                  ) : (
                    liveNotebooks.length > 1 && (
                      <Tip label="Çöp kutusuna taşı">
                        <button
                          type="button"
                          className="ghost-btn tiny"
                          onClick={() =>
                            askConfirm({
                              kind: "delete-notebook",
                              id: nb.id,
                            })
                          }
                          aria-label="Defteri sil"
                        >
                          <IconClose size={13} />
                        </button>
                      </Tip>
                    )
                  )}
                </li>
              );
            })}
          </ul>
        </div>
      )}

      {!searching && favorites.length > 0 && (
        <div className="sidebar-section">
          <div className="section-head">
            <h2>Favoriler</h2>
          </div>
          <ul className="page-list">
            {favorites.map((page) => (
              <li key={`fav-${page.id}`}>
                <div
                  className={`page-item ${page.id === activePageId ? "active" : ""}`}
                  onClick={() => onSelectPage(page.id)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      onSelectPage(page.id);
                    }
                  }}
                >
                  <span className="kind-chip kind-fav" aria-hidden>
                    <IconStarFill size={14} strokeWidth={2.5} />
                  </span>
                  <span className="sidebar-label-stack">
                    <span className="sidebar-label" title={page.title}>
                      {page.title}
                    </span>
                    <span className="sidebar-page-meta">
                      {notebookTitle(page.notebookId)}
                    </span>
                  </span>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="sidebar-section grow">
        <div className="section-head">
          <h2>{searching ? "Arama sonuçları" : "Sayfalar"}</h2>
        </div>
        {!searching && (
          <div className="add-page-row four icon-only">
            {(Object.keys(KIND_META) as PageKind[]).map((kind) => (
              <Tip key={kind} label={KIND_META[kind].label}>
                <button
                  type="button"
                  className={`add-kind icon-kind ${KIND_META[kind].tone}`}
                  onClick={() => onAddPage(kind)}
                  aria-label={KIND_META[kind].label}
                >
                  {KIND_META[kind].icon}
                </button>
              </Tip>
            ))}
            {onOpenTemplates && (
              <Tip label="Şablon galerisi (1000+)">
                <button
                  type="button"
                  className="add-kind icon-kind tone-tpl"
                  onClick={onOpenTemplates}
                  aria-label="Şablon galerisi"
                >
                  <IconTemplate size={17} strokeWidth={1.65} />
                </button>
              </Tip>
            )}
          </div>
        )}
        <ul className="page-list">
          {visiblePages.map((page) => {
            const isEditing =
              editing?.type === "page" && editing.id === page.id;
            return (
              <li key={page.id}>
                <div
                  className={`page-item ${page.id === activePageId ? "active" : ""}`}
                  onClick={() => {
                    if (!isEditing) onSelectPage(page.id);
                  }}
                  onContextMenu={(e) =>
                    openCtx(e, { kind: "page", id: page.id })
                  }
                  onDoubleClick={(e) => {
                    if (searching) return;
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
                    if (e.key === "F2" && !searching) {
                      e.preventDefault();
                      startEdit("page", page.id, page.title);
                    }
                    if (e.key === "Delete" && !searching) {
                      e.preventDefault();
                      askConfirm({ kind: "delete-page", id: page.id });
                    }
                  }}
                >
                  <Tip label={KIND_META[page.kind]?.label ?? "Sayfa"}>
                    <span
                      className={`kind-chip kind-${page.kind}`}
                      aria-hidden
                    >
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
                    <span className="sidebar-label-stack">
                      <span className="sidebar-label" title={page.title}>
                        {page.title}
                      </span>
                      {searching && (
                        <span className="sidebar-page-meta">
                          {notebookTitle(page.notebookId)}
                        </span>
                      )}
                    </span>
                  )}
                </div>
                {!searching &&
                  (confirm?.kind === "delete-page" &&
                  confirm.id === page.id ? (
                    <InlineConfirm
                      label="Silinsin mi?"
                      onYes={() => {
                        onDeletePage(page.id);
                        clearConfirm();
                      }}
                      onNo={clearConfirm}
                    />
                  ) : (
                    <div className="page-item-actions">
                      {onTogglePinned && (
                        <Tip
                          label={
                            page.pinned ? "Favoriden çıkar" : "Favorile"
                          }
                        >
                          <button
                            type="button"
                            className={`ghost-btn tiny pin-btn ${page.pinned ? "pinned" : ""}`}
                            onClick={(e) => {
                              e.stopPropagation();
                              onTogglePinned(page.id);
                            }}
                            aria-label={
                              page.pinned ? "Favoriden çıkar" : "Favorile"
                            }
                          >
                            {page.pinned ? (
                              <IconStarFill size={13} />
                            ) : (
                              <IconStar size={13} />
                            )}
                          </button>
                        </Tip>
                      )}
                      <Tip label="Çöp kutusuna taşı">
                        <button
                          type="button"
                          className="ghost-btn tiny"
                          onClick={() =>
                            askConfirm({
                              kind: "delete-page",
                              id: page.id,
                            })
                          }
                          aria-label="Sayfayı sil"
                        >
                          <IconClose size={13} />
                        </button>
                      </Tip>
                    </div>
                  ))}
              </li>
            );
          })}
          {visiblePages.length === 0 && (
            <li className="empty-hint sidebar-empty">
              {searching ? "Eşleşen not yok." : "Bu defterde sayfa yok."}
            </li>
          )}
        </ul>
      </div>

      {!searching && trashCount > 0 && (
        <div className="sidebar-section trash-section">
          <div className="section-head">
            <h2>Geri dönüşüm ({trashCount})</h2>
            {onEmptyTrash &&
              (confirm?.kind === "empty-trash" ? (
                <InlineConfirm
                  label="Boşaltılsın mı?"
                  onYes={() => {
                    onEmptyTrash();
                    clearConfirm();
                  }}
                  onNo={clearConfirm}
                />
              ) : (
                <Tip label="Çöpü kalıcı temizle">
                  <button
                    type="button"
                    className="ghost-btn tiny"
                    onClick={() => askConfirm({ kind: "empty-trash" })}
                    aria-label="Çöpü boşalt"
                  >
                    <IconTrash size={13} />
                  </button>
                </Tip>
              ))}
          </div>
          <ul className="page-list trash-list">
            {trashNotebooks.map((nb) => (
              <li key={`trash-nb-${nb.id}`}>
                <div
                  className="page-item trash-item"
                  onContextMenu={(e) =>
                    openCtx(e, { kind: "trash-notebook", id: nb.id })
                  }
                >
                  <span
                    className="nb-dot"
                    style={{ background: nb.color }}
                    aria-hidden
                  />
                  <span className="sidebar-label-stack">
                    <span className="sidebar-label" title={nb.title}>
                      {nb.title}
                    </span>
                    <span className="sidebar-page-meta">Defter</span>
                  </span>
                </div>
                {confirm?.kind === "purge-notebook" && confirm.id === nb.id ? (
                  <InlineConfirm
                    label="Kalıcı?"
                    onYes={() => {
                      onPurgeNotebook?.(nb.id);
                      clearConfirm();
                    }}
                    onNo={clearConfirm}
                  />
                ) : (
                  <div className="page-item-actions">
                    {onRestoreNotebook && (
                      <Tip label="Geri yükle">
                        <button
                          type="button"
                          className="ghost-btn tiny"
                          onClick={() => onRestoreNotebook(nb.id)}
                          aria-label="Defteri geri yükle"
                        >
                          <IconUndo size={13} />
                        </button>
                      </Tip>
                    )}
                    {onPurgeNotebook && (
                      <Tip label="Kalıcı sil">
                        <button
                          type="button"
                          className="ghost-btn tiny"
                          onClick={() =>
                            askConfirm({
                              kind: "purge-notebook",
                              id: nb.id,
                            })
                          }
                          aria-label="Defteri kalıcı sil"
                        >
                          <IconTrash size={13} />
                        </button>
                      </Tip>
                    )}
                  </div>
                )}
              </li>
            ))}
            {trashPages.map((page) => (
              <li key={`trash-pg-${page.id}`}>
                <div
                  className="page-item trash-item"
                  onContextMenu={(e) =>
                    openCtx(e, { kind: "trash-page", id: page.id })
                  }
                >
                  <Tip label={KIND_META[page.kind]?.label ?? "Sayfa"}>
                    <span
                      className={`kind-chip kind-${page.kind}`}
                      aria-hidden
                    >
                      {KIND_META[page.kind]?.icon ?? null}
                    </span>
                  </Tip>
                  <span className="sidebar-label-stack">
                    <span className="sidebar-label" title={page.title}>
                      {page.title}
                    </span>
                    <span className="sidebar-page-meta">
                      {notebookTitle(page.notebookId)}
                    </span>
                  </span>
                </div>
                {confirm?.kind === "purge-page" && confirm.id === page.id ? (
                  <InlineConfirm
                    label="Kalıcı?"
                    onYes={() => {
                      onPurgePage?.(page.id);
                      clearConfirm();
                    }}
                    onNo={clearConfirm}
                  />
                ) : (
                  <div className="page-item-actions">
                    {onRestorePage && (
                      <Tip label="Geri yükle">
                        <button
                          type="button"
                          className="ghost-btn tiny"
                          onClick={() => onRestorePage(page.id)}
                          aria-label="Sayfayı geri yükle"
                        >
                          <IconUndo size={13} />
                        </button>
                      </Tip>
                    )}
                    {onPurgePage && (
                      <Tip label="Kalıcı sil">
                        <button
                          type="button"
                          className="ghost-btn tiny"
                          onClick={() =>
                            askConfirm({ kind: "purge-page", id: page.id })
                          }
                          aria-label="Sayfayı kalıcı sil"
                        >
                          <IconTrash size={13} />
                        </button>
                      </Tip>
                    )}
                  </div>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}

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

      {ctx && ctxActions.length > 0 && (
        <ContextMenu
          x={ctx.x}
          y={ctx.y}
          actions={ctxActions}
          onClose={closeCtx}
        />
      )}
    </aside>
  );
}
