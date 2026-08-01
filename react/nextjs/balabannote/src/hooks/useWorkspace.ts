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
  const skipNextSave = useRef(true);

  useEffect(() => {
    if (!enabled) {
      setHydrated(false);
      return;
    }

    let cancelled = false;
    skipNextSave.current = true;

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
        }
      } catch (err) {
        console.error(err);
        if (!cancelled) {
          setWorkspace(loadWorkspace());
          setHydrated(true);
          setSyncState("error");
          setSyncError("Sunucuya bağlanılamadı — yerel kopya açıldı");
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
    (n) => n.id === workspace.activeNotebookId,
  );
  const activePage = workspace.pages.find(
    (p) => p.id === workspace.activePageId,
  );
  const notebookPages = workspace.pages
    .filter((p) => p.notebookId === workspace.activeNotebookId)
    .sort((a, b) => b.updatedAt - a.updatedAt);

  const setActiveNotebook = useCallback((id: string) => {
    setWorkspace((ws) => {
      const first = ws.pages.find((p) => p.notebookId === id);
      return {
        ...ws,
        activeNotebookId: id,
        activePageId: first?.id ?? null,
      };
    });
  }, []);

  const setActivePage = useCallback((id: string) => {
    setWorkspace((ws) => ({ ...ws, activePageId: id }));
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
      const notebooks = ws.notebooks.filter((n) => n.id !== id);
      const pages = ws.pages.filter((p) => p.notebookId !== id);
      const activeNotebookId =
        ws.activeNotebookId === id
          ? (notebooks[0]?.id ?? null)
          : ws.activeNotebookId;
      const activePageId =
        pages.find((p) => p.notebookId === activeNotebookId)?.id ?? null;
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
        strokes: kind === "note" ? [] : undefined,
        shapes: kind === "note" || kind === "board" ? [] : undefined,
        formulas: kind === "note" ? [] : undefined,
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
      const pages = ws.pages.filter((p) => p.id !== id);
      const activePageId =
        ws.activePageId === id
          ? (pages.find((p) => p.notebookId === ws.activeNotebookId)?.id ??
            null)
          : ws.activePageId;
      return { ...ws, pages, activePageId };
    });
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

  return {
    hydrated,
    syncState,
    syncError,
    workspace,
    activeNotebook,
    activePage,
    notebookPages,
    setActiveNotebook,
    setActivePage,
    addNotebook,
    renameNotebook,
    deleteNotebook,
    addPage,
    renamePage,
    deletePage,
    updatePageContent,
    updateStrokes,
    updateShapes,
    updateFormulas,
    updatePageTheme,
    updateTodos,
  };
}
