"use client";

import { IconPlus, IconTrash } from "@/components/Icons";
import { Tip } from "@/components/Tip";
import { uid } from "@/lib/id";
import { TODO_COLORS, type TodoItem } from "@/lib/types";
import { useState } from "react";

type TodoEditorProps = {
  title: string;
  todos: TodoItem[];
  onTitleChange: (title: string) => void;
  onChange: (todos: TodoItem[]) => void;
};

function colorFor(item: TodoItem, index: number): string {
  return item.color ?? TODO_COLORS[index % TODO_COLORS.length];
}

export function TodoEditor({
  title,
  todos,
  onTitleChange,
  onChange,
}: TodoEditorProps) {
  const [draft, setDraft] = useState("");
  const [pick, setPick] = useState<string>(TODO_COLORS[0]);

  const add = () => {
    const text = draft.trim();
    if (!text) return;
    onChange([
      ...todos,
      {
        id: uid("td"),
        text,
        done: false,
        createdAt: Date.now(),
        color: pick,
      },
    ]);
    setDraft("");
    setPick(TODO_COLORS[(TODO_COLORS.findIndex((x) => x === pick) + 1) % TODO_COLORS.length]);
  };

  const open = todos.filter((t) => !t.done);
  const done = todos.filter((t) => t.done);
  const progress =
    todos.length === 0 ? 0 : Math.round((done.length / todos.length) * 100);

  return (
    <div className="todo-editor">
      <header className="editor-header">
        <input
          className="page-title-input"
          value={title}
          onChange={(e) => onTitleChange(e.target.value)}
          placeholder="Liste adı"
          aria-label="Todo başlığı"
        />
        <p className="editor-sub">
          Renkli görevler — tamamladıkça ilerleme dolar.
        </p>
      </header>

      <div className="todo-progress" aria-hidden={todos.length === 0}>
        <div className="todo-progress-track">
          <div
            className="todo-progress-fill"
            style={{ width: `${progress}%` }}
          />
        </div>
        <span className="todo-progress-label">
          {done.length}/{todos.length} · %{progress}
        </span>
      </div>

      <form
        className="todo-compose"
        onSubmit={(e) => {
          e.preventDefault();
          add();
        }}
      >
        <div className="todo-color-row">
          {TODO_COLORS.map((c) => (
            <Tip key={c} label="Görev rengi">
              <button
                type="button"
                className={`todo-swatch ${pick === c ? "active" : ""}`}
                style={{ background: c }}
                onClick={() => setPick(c)}
                aria-label={`Renk ${c}`}
              />
            </Tip>
          ))}
        </div>
        <div className="todo-compose-row">
          <input
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder="Yeni görev ekle…"
            aria-label="Yeni görev"
            style={{ borderColor: `${pick}55`, boxShadow: `0 0 0 3px ${pick}22` }}
          />
          <Tip label="Ekle">
            <button type="submit" className="todo-add-btn" style={{ background: pick }}>
              <IconPlus size={18} />
            </button>
          </Tip>
        </div>
      </form>

      <ul className="todo-list">
        {open.map((item, i) => {
          const c = colorFor(item, i);
          return (
            <li
              key={item.id}
              className="todo-item"
              style={{
                borderColor: `${c}55`,
                background: `linear-gradient(135deg, ${c}18, ${c}08 55%, #ffffffee)`,
                boxShadow: `0 10px 28px ${c}22`,
              }}
            >
              <span className="todo-accent" style={{ background: c }} />
              <label>
                <input
                  type="checkbox"
                  checked={item.done}
                  onChange={() =>
                    onChange(
                      todos.map((t) =>
                        t.id === item.id ? { ...t, done: !t.done } : t,
                      ),
                    )
                  }
                  style={{ accentColor: c }}
                />
                <span>{item.text}</span>
              </label>
              <div className="todo-item-actions">
                {TODO_COLORS.map((col) => (
                  <button
                    key={col}
                    type="button"
                    className={`todo-mini-swatch ${item.color === col ? "active" : ""}`}
                    style={{ background: col }}
                    onClick={() =>
                      onChange(
                        todos.map((t) =>
                          t.id === item.id ? { ...t, color: col } : t,
                        ),
                      )
                    }
                    aria-label="Rengi değiştir"
                  />
                ))}
                <Tip label="Sil">
                  <button
                    type="button"
                    className="ghost-btn todo-del"
                    onClick={() =>
                      onChange(todos.filter((t) => t.id !== item.id))
                    }
                    aria-label="Sil"
                  >
                    <IconTrash size={15} />
                  </button>
                </Tip>
              </div>
            </li>
          );
        })}
      </ul>

      {done.length > 0 && (
        <div className="todo-done-block">
          <h3>Tamamlanan ({done.length})</h3>
          <ul className="todo-list done">
            {done.map((item, i) => {
              const c = colorFor(item, i);
              return (
                <li
                  key={item.id}
                  className="todo-item"
                  style={{
                    borderColor: `${c}33`,
                    background: `linear-gradient(135deg, ${c}10, #f8fafc)`,
                  }}
                >
                  <span className="todo-accent" style={{ background: c }} />
                  <label>
                    <input
                      type="checkbox"
                      checked={item.done}
                      onChange={() =>
                        onChange(
                          todos.map((t) =>
                            t.id === item.id ? { ...t, done: !t.done } : t,
                          ),
                        )
                      }
                      style={{ accentColor: c }}
                    />
                    <span>{item.text}</span>
                  </label>
                  <Tip label="Sil">
                    <button
                      type="button"
                      className="ghost-btn todo-del"
                      onClick={() =>
                        onChange(todos.filter((t) => t.id !== item.id))
                      }
                      aria-label="Sil"
                    >
                      <IconTrash size={15} />
                    </button>
                  </Tip>
                </li>
              );
            })}
          </ul>
        </div>
      )}

      {todos.length === 0 && (
        <p className="empty-hint">Henüz görev yok. Renk seçip ekle.</p>
      )}
    </div>
  );
}
