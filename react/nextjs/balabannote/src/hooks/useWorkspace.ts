"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { uid } from "@/lib/id";
import {
  createDefaultWorkspace,
  loadWorkspace,
  nextNotebookColor,
  parseWorkspace,
  saveWorkspace,
} from "@/lib/storage";
import type {
  BoardShape,
  InkStroke,
  NoteComment,
  NotePage,
  NoteFormula,
  PageKind,
  PagePattern,
  TodoItem,
  Workspace,
} from "@/lib/types";

const KIND_TITLES: Record<PageKind, string> = {
  note: "Yeni not",
  board: "Yeni board",
  todo: "Yeni liste",
};

const SAVE_DEBOUNCE_MS = 600;

export function useWorkspace(enabled: boolean) {
  const [workspace, setWorkspace] = useState<Workspace>(createDefaultWorkspace);
  const [hydrated, setHydrated] = useState(false);
  const [syncState, setSyncState] = useState<"idle" | "saving" | "saved" | "error">(
    "idle",
  );
  const [syncError, setSyncError] = useState<string | null>(null);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const allowServerSave = useRef(false);
  const skipNextSave = useRef(true);

  useEffect(() => {
    if (!enabled) {
      setHydrated(false);
      allowServerSave.current = false;
      return;
    }

    let cancelled = false;
    skipNextSave.current = true;
    allowServerSave.current = false;

    (async () => {
      try {
        const res = await fetch("/api/workspace", { credentials: "include" });
        if (!res.ok) throw new Error("Workspace alınamadı");
        const data = (await res.json()) as { workspace: unknown };
        const parsed = parseWorkspace(data.workspace);
        if (!cancelled) {
          setWorkspace(parsed ?? createDefaultWorkspace());
          setHydrated(true);
          setSyncState("saved");
          allowServerSave.current = true;
        }
      } catch (err) {
        console.error(err);
        if (!cancelled) {
          setWorkspace(loadWorkspace());
          setHydrated(true);
          setSyncState("error");
          setSyncError(
            "Sunucuya bağlanılamadı — yerel kopya (sunucuya yazılmaz)",
          );
          // Prevent clobbering server with stale localStorage
          allowServerSave.current = false;
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [enabled]);

  useEffect(() => {
    if (!enabled || !hydrated) return;
    saveWorkspace(workspace);

    if (skipNextSave.current) {
      skipNextSave.current = false;
      return;
    }

    if (!allowServerSave.current) {
      return;
    }

    if (saveTimer.current) clearTimeout(saveTimer.current);
    setSyncState("saving");
    saveTimer.current = setTimeout(async () => {
      try {
        const res = await fetch("/api/workspace", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ workspace }),
        });
        if (!res.ok) {
          const data = (await res.json().catch(() => ({}))) as { error?: string };
          throw new Error(data.error ?? "Kayıt başarısız");
        }
        setSyncState("saved");
        setSyncError(null);
      } catch (err) {
        setSyncState("error");
        setSyncError(err instanceof Error ? err.message : "Kayıt hatası");
      }
    }, SAVE_DEBOUNCE_MS);

    return () => {
      if (saveTimer.current) clearTimeout(saveTimer.current);
    };
  }, [workspace, hydrated, enabled]);

  const activeNotebook = workspace.notebooks.find(
    (n) => n.id === workspace.activeNotebookId && !n.deletedAt,
  );
  const activePage = workspace.pages.find(
    (p) => p.id === workspace.activePageId && !p.deletedAt,
  );
  const liveNotebooks = workspace.notebooks.filter((n) => !n.deletedAt);
  const notebookPages = workspace.pages
    .filter(
      (p) => p.notebookId === workspace.activeNotebookId && !p.deletedAt,
    )
    .sort((a, b) => b.updatedAt - a.updatedAt);
  const trashPages = workspace.pages
    .filter((p) => !!p.deletedAt)
    .sort((a, b) => (b.deletedAt ?? 0) - (a.deletedAt ?? 0));
  const trashNotebooks = workspace.notebooks
    .filter((n) => !!n.deletedAt)
    .sort((a, b) => (b.deletedAt ?? 0) - (a.deletedAt ?? 0));

  const setActiveNotebook = useCallback((id: string) => {
    setWorkspace((ws) => {
      const first = ws.pages.find((p) => p.notebookId === id && !p.deletedAt);
      return {
        ...ws,
        activeNotebookId: id,
        activePageId: first?.id ?? null,
      };
    });
  }, []);

  const setActivePage = useCallback((id: string) => {
    setWorkspace((ws) => {
      const page = ws.pages.find((p) => p.id === id);
      return {
        ...ws,
        activePageId: id,
        activeNotebookId: page?.notebookId ?? ws.activeNotebookId,
      };
    });
  }, []);

  const addNotebook = useCallback(() => {
    const id = uid("nb");
    setWorkspace((ws) => ({
      ...ws,
      notebooks: [
        ...ws.notebooks,
        {
          id,
          title: `Defter ${ws.notebooks.length + 1}`,
          color: nextNotebookColor(ws.notebooks),
          createdAt: Date.now(),
        },
      ],
      activeNotebookId: id,
      activePageId: null,
    }));
  }, []);

  const renameNotebook = useCallback((id: string, title: string) => {
    setWorkspace((ws) => ({
      ...ws,
      notebooks: ws.notebooks.map((n) =>
        n.id === id ? { ...n, title: title.trim() || n.title } : n,
      ),
    }));
  }, []);

  const deleteNotebook = useCallback((id: string) => {
    setWorkspace((ws) => {
      const now = Date.now();
      const notebooks = ws.notebooks.map((n) =>
        n.id === id ? { ...n, deletedAt: now } : n,
      );
      const pages = ws.pages.map((p) =>
        p.notebookId === id && !p.deletedAt
          ? { ...p, deletedAt: now }
          : p,
      );
      const liveNbs = notebooks.filter((n) => !n.deletedAt);
      const activeNotebookId =
        ws.activeNotebookId === id
          ? (liveNbs[0]?.id ?? null)
          : ws.activeNotebookId;
      const activePageId =
        pages.find((p) => p.notebookId === activeNotebookId && !p.deletedAt)
          ?.id ?? null;
      return { notebooks, pages, activeNotebookId, activePageId };
    });
  }, []);

  const addPage = useCallback((kind: PageKind) => {
    setWorkspace((ws) => {
      if (!ws.activeNotebookId) return ws;
      const id = uid("pg");
      const page: NotePage = {
        id,
        notebookId: ws.activeNotebookId,
        title: KIND_TITLES[kind],
        kind,
        updatedAt: Date.now(),
        content:
          kind === "note"
            ? "<p></p><p></p><p></p><p></p><p></p><p></p><p></p><p></p><p></p><p></p><p></p><p></p>"
            : undefined,
        strokes: kind === "note" || kind === "board" ? [] : undefined,
        shapes: kind === "note" || kind === "board" ? [] : undefined,
        formulas: kind === "note" ? [] : undefined,
        comments: kind === "note" ? [] : undefined,
        todos: kind === "todo" ? [] : undefined,
        bgColor: kind === "note" ? "#F7F9FB" : undefined,
        pattern: kind === "note" ? "lined" : undefined,
      };
      return {
        ...ws,
        pages: [...ws.pages, page],
        activePageId: id,
      };
    });
  }, []);

  const addPageFromTemplate = useCallback(async (templateId: string) => {
    const res = await fetch(`/api/templates/${templateId}`, {
      credentials: "include",
    });
    if (!res.ok) {
      throw new Error("Şablon yüklenemedi");
    }
    const detail = (await res.json()) as {
      page: Omit<NotePage, "id" | "notebookId" | "updatedAt"> & {
        title: string;
        kind: PageKind;
      };
    };
    const snap = detail.page;
    setWorkspace((ws) => {
      if (!ws.activeNotebookId) return ws;
      const id = uid("pg");
      const page: NotePage = {
        id,
        notebookId: ws.activeNotebookId,
        title: snap.title || "Şablon",
        kind: snap.kind,
        updatedAt: Date.now(),
        content: snap.content,
        strokes: snap.strokes
          ? structuredClone(snap.strokes)
          : snap.kind === "note" || snap.kind === "board"
            ? []
            : undefined,
        shapes: snap.shapes
          ? structuredClone(snap.shapes)
          : snap.kind === "note" || snap.kind === "board"
            ? []
            : undefined,
        formulas: snap.formulas
          ? structuredClone(snap.formulas)
          : snap.kind === "note"
            ? []
            : undefined,
        comments: snap.comments
          ? structuredClone(snap.comments)
          : snap.kind === "note"
            ? []
            : undefined,
        todos: snap.todos
          ? structuredClone(snap.todos)
          : snap.kind === "todo"
            ? []
            : undefined,
        bgColor: snap.bgColor,
        pattern: snap.pattern,
      };
      return {
        ...ws,
        pages: [...ws.pages, page],
        activePageId: id,
      };
    });
  }, []);

  const renamePage = useCallback((id: string, title: string) => {
    setWorkspace((ws) => ({
      ...ws,
      pages: ws.pages.map((p) =>
        p.id === id
          ? { ...p, title: title.trim() || p.title, updatedAt: Date.now() }
          : p,
      ),
    }));
  }, []);

  const deletePage = useCallback((id: string) => {
    setWorkspace((ws) => {
      const now = Date.now();
      const pages = ws.pages.map((p) =>
        p.id === id ? { ...p, deletedAt: now, pinned: false } : p,
      );
      const activePageId =
        ws.activePageId === id
          ? (pages.find(
              (p) => p.notebookId === ws.activeNotebookId && !p.deletedAt,
            )?.id ?? null)
          : ws.activePageId;
      return { ...ws, pages, activePageId };
    });
  }, []);

  const restorePage = useCallback((id: string) => {
    setWorkspace((ws) => {
      const page = ws.pages.find((p) => p.id === id);
      if (!page) return ws;
      const notebooks = ws.notebooks.map((n) =>
        n.id === page.notebookId && n.deletedAt
          ? { ...n, deletedAt: undefined }
          : n,
      );
      const pages = ws.pages.map((p) =>
        p.id === id ? { ...p, deletedAt: undefined, updatedAt: Date.now() } : p,
      );
      return {
        ...ws,
        notebooks,
        pages,
        activeNotebookId: page.notebookId,
        activePageId: id,
      };
    });
  }, []);

  const restoreNotebook = useCallback((id: string) => {
    setWorkspace((ws) => {
      const nb = ws.notebooks.find((n) => n.id === id);
      if (!nb) return ws;
      const batchAt = nb.deletedAt;
      const notebooks = ws.notebooks.map((n) =>
        n.id === id ? { ...n, deletedAt: undefined } : n,
      );
      const pages = ws.pages.map((p) => {
        if (p.notebookId !== id || !p.deletedAt) return p;
        // Restore pages soft-deleted with this notebook (same batch)
        if (
          batchAt != null &&
          Math.abs((p.deletedAt ?? 0) - batchAt) < 2000
        ) {
          return { ...p, deletedAt: undefined, updatedAt: Date.now() };
        }
        return p;
      });
      const first = pages.find((p) => p.notebookId === id && !p.deletedAt);
      return {
        ...ws,
        notebooks,
        pages,
        activeNotebookId: id,
        activePageId: first?.id ?? null,
      };
    });
  }, []);

  const purgePage = useCallback((id: string) => {
    setWorkspace((ws) => ({
      ...ws,
      pages: ws.pages.filter((p) => p.id !== id),
    }));
  }, []);

  const purgeNotebook = useCallback((id: string) => {
    setWorkspace((ws) => ({
      ...ws,
      notebooks: ws.notebooks.filter((n) => n.id !== id),
      pages: ws.pages.filter((p) => p.notebookId !== id),
    }));
  }, []);

  const emptyTrash = useCallback(() => {
    setWorkspace((ws) => ({
      ...ws,
      notebooks: ws.notebooks.filter((n) => !n.deletedAt),
      pages: ws.pages.filter((p) => !p.deletedAt),
    }));
  }, []);

  const updatePageContent = useCallback((id: string, content: string) => {
    setWorkspace((ws) => ({
      ...ws,
      pages: ws.pages.map((p) =>
        p.id === id ? { ...p, content, updatedAt: Date.now() } : p,
      ),
    }));
  }, []);

  const updateStrokes = useCallback((id: string, strokes: InkStroke[]) => {
    setWorkspace((ws) => ({
      ...ws,
      pages: ws.pages.map((p) =>
        p.id === id ? { ...p, strokes, updatedAt: Date.now() } : p,
      ),
    }));
  }, []);

  const updateShapes = useCallback((id: string, shapes: BoardShape[]) => {
    setWorkspace((ws) => ({
      ...ws,
      pages: ws.pages.map((p) =>
        p.id === id ? { ...p, shapes, updatedAt: Date.now() } : p,
      ),
    }));
  }, []);

  const updateFormulas = useCallback((id: string, formulas: NoteFormula[]) => {
    setWorkspace((ws) => ({
      ...ws,
      pages: ws.pages.map((p) =>
        p.id === id ? { ...p, formulas, updatedAt: Date.now() } : p,
      ),
    }));
  }, []);

  const updateComments = useCallback((id: string, comments: NoteComment[]) => {
    setWorkspace((ws) => ({
      ...ws,
      pages: ws.pages.map((p) =>
        p.id === id ? { ...p, comments, updatedAt: Date.now() } : p,
      ),
    }));
  }, []);

  const updatePageTheme = useCallback(
    (id: string, theme: { bgColor?: string; pattern?: PagePattern }) => {
      setWorkspace((ws) => ({
        ...ws,
        pages: ws.pages.map((p) =>
          p.id === id ? { ...p, ...theme, updatedAt: Date.now() } : p,
        ),
      }));
    },
    [],
  );

  const updateTodos = useCallback((id: string, todos: TodoItem[]) => {
    setWorkspace((ws) => ({
      ...ws,
      pages: ws.pages.map((p) =>
        p.id === id ? { ...p, todos, updatedAt: Date.now() } : p,
      ),
    }));
  }, []);

  const togglePagePinned = useCallback((id: string) => {
    setWorkspace((ws) => ({
      ...ws,
      pages: ws.pages.map((p) =>
        p.id === id
          ? { ...p, pinned: !p.pinned, updatedAt: Date.now() }
          : p,
      ),
    }));
  }, []);

  return {
    hydrated,
    syncState,
    syncError,
    workspace,
    activeNotebook,
    activePage,
    liveNotebooks,
    notebookPages,
    trashPages,
    trashNotebooks,
    setActiveNotebook,
    setActivePage,
    addNotebook,
    renameNotebook,
    deleteNotebook,
    addPage,
    addPageFromTemplate,
    renamePage,
    deletePage,
    restorePage,
    restoreNotebook,
    purgePage,
    purgeNotebook,
    emptyTrash,
    updatePageContent,
    updateStrokes,
    updateShapes,
    updateFormulas,
    updateComments,
    updatePageTheme,
    updateTodos,
    togglePagePinned,
  };
}
