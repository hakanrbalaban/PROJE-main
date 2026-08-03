"use client";

import { AuthScreen } from "@/components/AuthScreen";
import { DataFolderControl } from "@/components/DataFolderControl";
import { BoardCanvas } from "@/components/editors/BoardCanvas";
import { HybridNoteEditor } from "@/components/editors/HybridNoteEditor";
import { TodoEditor } from "@/components/editors/TodoEditor";
import { BrandLogo } from "@/components/BrandLogo";
import { NoteFontsLoader } from "@/components/NoteFontsLoader";
import { Sidebar } from "@/components/Sidebar";
import { TemplateGallery } from "@/components/TemplateGallery";
import { ThemeBoot, ThemeToggle } from "@/components/ThemeToggle";
import { useAuth } from "@/hooks/useAuth";
import { useWorkspace } from "@/hooks/useWorkspace";
import type { BoardShape, InkStroke, NoteComment, NoteFormula } from "@/lib/types";
import { useEffect, useState } from "react";

const EMPTY_STROKES: InkStroke[] = [];
const EMPTY_SHAPES: BoardShape[] = [];
const EMPTY_FORMULAS: NoteFormula[] = [];
const EMPTY_COMMENTS: NoteComment[] = [];
const SIDEBAR_KEY = "balaban-sidebar-collapsed";

export function AppShell() {
  const auth = useAuth();
  const ws = useWorkspace(Boolean(auth.user));
  const [templatesOpen, setTemplatesOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  useEffect(() => {
    try {
      setSidebarCollapsed(localStorage.getItem(SIDEBAR_KEY) === "1");
    } catch {
      /* ignore */
    }
  }, []);

  const toggleSidebar = () => {
    setSidebarCollapsed((c) => {
      const next = !c;
      try {
        localStorage.setItem(SIDEBAR_KEY, next ? "1" : "0");
      } catch {
        /* ignore */
      }
      return next;
    });
  };

  if (auth.loading) {
    return (
      <div className="boot-screen">
        <ThemeBoot />
        <BrandLogo size={64} className="boot-logo" />
        <p className="brand-name">Balaban Note</p>
        <p className="boot-caption">Oturum kontrol ediliyor…</p>
      </div>
    );
  }

  if (!auth.user) {
    return (
      <>
        <ThemeBoot />
        <AuthScreen
          error={auth.error}
          onClearError={() => auth.setError(null)}
          onLogin={auth.login}
          onRegister={auth.register}
        />
      </>
    );
  }

  if (!ws.hydrated) {
    return (
      <div className="boot-screen">
        <ThemeBoot />
        <BrandLogo size={64} className="boot-logo" />
        <p className="brand-name">Balaban Note</p>
        <p className="boot-caption">Defter yükleniyor…</p>
      </div>
    );
  }

  const page = ws.activePage;
  const notebook = ws.activeNotebook;
  const syncLabel =
    ws.syncState === "saving"
      ? "Kaydediliyor…"
      : ws.syncState === "error"
        ? ws.syncError ?? "Kayıt hatası"
        : "Kayıtlı";

  const kindLabel =
    page?.kind === "board"
      ? "Board"
      : page?.kind === "todo"
        ? "Todo"
        : "Not";

  return (
    <div
      className={`app-shell ${sidebarCollapsed ? "sidebar-collapsed" : ""}`}
    >
      <ThemeBoot />
      <NoteFontsLoader />
      <Sidebar
        notebooks={ws.liveNotebooks}
        pages={ws.notebookPages}
        allPages={ws.workspace.pages}
        trashPages={ws.trashPages}
        trashNotebooks={ws.trashNotebooks}
        activeNotebookId={ws.workspace.activeNotebookId}
        activePageId={ws.workspace.activePageId}
        collapsed={sidebarCollapsed}
        onToggleCollapsed={toggleSidebar}
        onSelectNotebook={ws.setActiveNotebook}
        onSelectPage={ws.setActivePage}
        onAddNotebook={ws.addNotebook}
        onRenameNotebook={ws.renameNotebook}
        onDeleteNotebook={ws.deleteNotebook}
        onAddPage={ws.addPage}
        onOpenTemplates={() => setTemplatesOpen(true)}
        onRenamePage={ws.renamePage}
        onDeletePage={ws.deletePage}
        onTogglePinned={ws.togglePagePinned}
        onRestorePage={ws.restorePage}
        onRestoreNotebook={ws.restoreNotebook}
        onPurgePage={ws.purgePage}
        onPurgeNotebook={ws.purgeNotebook}
        onEmptyTrash={ws.emptyTrash}
      />

      <main className="workspace">
        <div className="workspace-topbar">
          <DataFolderControl />
          {page && notebook && (
            <nav className="workspace-crumb" aria-label="Konum">
              <button
                type="button"
                className="crumb-link"
                onClick={() => ws.setActiveNotebook(notebook.id)}
              >
                <span
                  className="crumb-dot"
                  style={{ background: notebook.color }}
                />
                {notebook.title}
              </button>
              <span className="crumb-sep" aria-hidden>
                /
              </span>
              <span className="crumb-kind">{kindLabel}</span>
              <span className="crumb-sep" aria-hidden>
                /
              </span>
              <span className="crumb-current">{page.title}</span>
            </nav>
          )}
          <ThemeToggle />
          <span className={`sync-pill ${ws.syncState}`}>{syncLabel}</span>
          <span className="user-pill">{auth.user.name || auth.user.email}</span>
          <button
            type="button"
            className="logout-btn"
            onClick={() => void auth.logout()}
          >
            Çıkış
          </button>
        </div>

        {!page && (
          <div className="empty-workspace">
            <BrandLogo size={72} className="empty-logo" />
            <h1>Balaban Note</h1>
            <p>
              Soldan Not, Board, Todo veya şablon galerisinden ekle — OneNote
              gibi defterler, Notion gibi favoriler.
            </p>
            <button
              type="button"
              className="tpl-gen-btn"
              onClick={() => setTemplatesOpen(true)}
            >
              Şablon galerisini aç
            </button>
          </div>
        )}

        {page?.kind === "note" && (
          <HybridNoteEditor
            key={page.id}
            pageId={page.id}
            title={page.title}
            content={page.content ?? ""}
            strokes={page.strokes ?? EMPTY_STROKES}
            shapes={page.shapes ?? EMPTY_SHAPES}
            formulas={page.formulas ?? EMPTY_FORMULAS}
            comments={page.comments ?? EMPTY_COMMENTS}
            bgColor={page.bgColor ?? "#F7F9FB"}
            pattern={page.pattern ?? "lined"}
            onTitleChange={(t) => ws.renamePage(page.id, t)}
            onContentChange={(c) => ws.updatePageContent(page.id, c)}
            onStrokesChange={(strokes) => ws.updateStrokes(page.id, strokes)}
            onShapesChange={(shapes) => ws.updateShapes(page.id, shapes)}
            onFormulasChange={(formulas) => ws.updateFormulas(page.id, formulas)}
            onCommentsChange={(comments) => ws.updateComments(page.id, comments)}
            onThemeChange={(theme) => ws.updatePageTheme(page.id, theme)}
          />
        )}

        {page?.kind === "board" && (
          <BoardCanvas
            key={page.id}
            pageId={page.id}
            title={page.title}
            shapes={page.shapes ?? []}
            strokes={page.strokes ?? EMPTY_STROKES}
            onTitleChange={(t) => ws.renamePage(page.id, t)}
            onChange={(shapes) => ws.updateShapes(page.id, shapes)}
            onStrokesChange={(strokes) => ws.updateStrokes(page.id, strokes)}
          />
        )}

        {page?.kind === "todo" && (
          <TodoEditor
            title={page.title}
            todos={page.todos ?? []}
            onTitleChange={(t) => ws.renamePage(page.id, t)}
            onChange={(todos) => ws.updateTodos(page.id, todos)}
          />
        )}
      </main>

      <TemplateGallery
        open={templatesOpen}
        onClose={() => setTemplatesOpen(false)}
        onUse={ws.addPageFromTemplate}
      />
    </div>
  );
}
