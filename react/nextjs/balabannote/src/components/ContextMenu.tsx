"use client";

import { useEffect, useRef, type ReactNode } from "react";

export type CtxAction = {
  id: string;
  label: string;
  icon?: ReactNode;
  danger?: boolean;
  disabled?: boolean;
  onSelect: () => void;
};

type ContextMenuProps = {
  x: number;
  y: number;
  actions: CtxAction[];
  onClose: () => void;
};

export function ContextMenu({ x, y, actions, onClose }: ContextMenuProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    const onDown = (e: MouseEvent) => {
      if (!ref.current?.contains(e.target as Node)) onClose();
    };
    window.addEventListener("keydown", onKey);
    window.addEventListener("mousedown", onDown);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("mousedown", onDown);
    };
  }, [onClose]);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const maxX = window.innerWidth - rect.width - 8;
    const maxY = window.innerHeight - rect.height - 8;
    el.style.left = `${Math.max(8, Math.min(x, maxX))}px`;
    el.style.top = `${Math.max(8, Math.min(y, maxY))}px`;
  }, [x, y, actions.length]);

  return (
    <div
      ref={ref}
      className="ctx-menu"
      role="menu"
      style={{ left: x, top: y }}
    >
      {actions.map((a) => (
        <button
          key={a.id}
          type="button"
          role="menuitem"
          className={`ctx-menu-item ${a.danger ? "danger" : ""}`}
          disabled={a.disabled}
          onClick={() => {
            if (a.disabled) return;
            a.onSelect();
            onClose();
          }}
        >
          {a.icon ? <span className="ctx-menu-ico">{a.icon}</span> : null}
          <span>{a.label}</span>
        </button>
      ))}
    </div>
  );
}
