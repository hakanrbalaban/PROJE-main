"use client";

import { AuthScreen } from "@/components/AuthScreen";
import { DataFolderControl } from "@/components/DataFolderControl";
import { BoardCanvas } from "@/components/editors/BoardCanvas";
import { HybridNoteEditor } from "@/components/editors/HybridNoteEditor";
import { TodoEditor } from "@/components/editors/TodoEditor";
import { BrandLogo } from "@/components/BrandLogo";
import { NoteFontsLoader } from "@/components/NoteFontsLoader";
import { Sidebar } from "@/components/Sidebar";
import { useAuth } from "@/hooks/useAuth";
import { useWorkspace } from "@/hooks/useWorkspace";
import type { BoardShape, InkStroke, NoteFormula } from "@/lib/types";

const EMPTY_STROKES: InkStroke[] = [];
const EMPTY_SHAPES: BoardShape[] = [];
const EMPTY_FORMULAS: NoteFormula[] = [];

export function AppShell() {
  const auth = useAuth();
  const ws = useWorkspace(Boolean(auth.user));

  if (auth.loading) {
    return (
      <div className="boot-screen">
        <BrandLogo size={64} className="boot-logo" />
        <p className="brand-name">Balaban Note</p>
        <p className="boot-caption">Oturum kontrol ediliyor…</p>
      </div>
    );
  }

  if (!auth.user) {
    return (
      <AuthScreen
        error={auth.error}
        onClearError={() => auth.setError(null)}
        onLogin={auth.login}
        onRegister={auth.register}
      />
    );
  }

  if (!ws.hydrated) {
    return (
      <div className="boot-screen">
        <BrandLogo size={64} className="boot-logo" />
        <p className="brand-name">Balaban Note</p>
        <p className="boot-caption">Defter yükleniyor…</p>
      </div>
    );
  }

  const page = ws.activePage;
  const syncLabel =
    ws.syncState === "saving"
      ? "Kaydediliyor…"
      : ws.syncState === "error"
        ? ws.syncError ?? "Kayıt hatası"
        : "Kayıtlı";

  return (
    <div className="app-shell">
      <NoteFontsLoader />
      <Sidebar
        notebooks={ws.workspace.notebooks}
        pages={ws.notebookPages}
        allPages={ws.workspace.pages}
        activeNotebookId={ws.workspace.activeNotebookId}
        activePageId={ws.workspace.activePageId}
        onSelectNotebook={ws.setActiveNotebook}
        onSelectPage={ws.setActivePage}
        onAddNotebook={ws.addNotebook}
        onRenameNotebook={ws.renameNotebook}
        onDeleteNotebook={ws.deleteNotebook}
        onAddPage={ws.addPage}
        onRenamePage={ws.renamePage}
        onDeletePage={ws.deletePage}
      />

      <main className="workspace">
        <div className="workspace-topbar">
          <DataFolderControl />
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
            <p>Soldan Not, Board veya Todo ekle. Not sayfasında yazı ve kalem bir arada.</p>
          </div>
        )}

        {page?.kind === "note" && (
          <HybridNoteEditor
            pageId={page.id}
            title={page.title}
            content={page.content ?? ""}
            strokes={page.strokes ?? EMPTY_STROKES}
            shapes={page.shapes ?? EMPTY_SHAPES}
            formulas={page.formulas ?? EMPTY_FORMULAS}
            bgColor={page.bgColor ?? "#F7F9FB"}
            pattern={page.pattern ?? "lined"}
            onTitleChange={(t) => ws.renamePage(page.id, t)}
            onContentChange={(c) => ws.updatePageContent(page.id, c)}
            onStrokesChange={(strokes) => ws.updateStrokes(page.id, strokes)}
            onShapesChange={(shapes) => ws.updateShapes(page.id, shapes)}
            onFormulasChange={(formulas) => ws.updateFormulas(page.id, formulas)}
            onThemeChange={(theme) => ws.updatePageTheme(page.id, theme)}
          />
        )}

        {page?.kind === "board" && (
          <BoardCanvas
            pageId={page.id}
            title={page.title}
            shapes={page.shapes ?? []}
            onTitleChange={(t) => ws.renamePage(page.id, t)}
            onChange={(shapes) => ws.updateShapes(page.id, shapes)}
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
    </div>
  );
}
