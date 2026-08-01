"use client";

import { IconClose, IconMinus, IconPlus, IconTrash } from "@/components/Icons";
import { Tip } from "@/components/Tip";
import { renderLatex } from "@/lib/formula";
import type { NoteFormula } from "@/lib/types";
import {
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
  type WheelEvent as ReactWheelEvent,
} from "react";

type FormulaLayerProps = {
  formulas: NoteFormula[];
  /** When true, formulas can be dragged / selected / deleted */
  interactive: boolean;
  onChange: (formulas: NoteFormula[]) => void;
  onEdit: (formula: NoteFormula) => void;
};

const MIN_SCALE = 0.55;
const MAX_SCALE = 2.8;
const STEP = 0.12;

function clampScale(n: number) {
  return Math.min(MAX_SCALE, Math.max(MIN_SCALE, Math.round(n * 100) / 100));
}

export function FormulaLayer({
  formulas,
  interactive,
  onChange,
  onEdit,
}: FormulaLayerProps) {
  /** Formula whose size toolbar is open */
  const [toolsId, setToolsId] = useState<string | null>(null);
  const drag = useRef<{
    id: string;
    ox: number;
    oy: number;
    sx: number;
    sy: number;
    moved: boolean;
  } | null>(null);

  const setScale = (id: string, next: number) => {
    onChange(
      formulas.map((f) =>
        f.id === id ? { ...f, scale: clampScale(next) } : f,
      ),
    );
  };

  const onPointerDown = (e: ReactPointerEvent, f: NoteFormula) => {
    if (!interactive) return;
    if ((e.target as HTMLElement).closest(".floating-formula-tools")) return;
    e.stopPropagation();
    e.preventDefault();
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    drag.current = {
      id: f.id,
      ox: e.clientX,
      oy: e.clientY,
      sx: f.x,
      sy: f.y,
      moved: false,
    };
  };

  const onPointerMove = (e: ReactPointerEvent) => {
    const d = drag.current;
    if (!d || !interactive) return;
    const dx = e.clientX - d.ox;
    const dy = e.clientY - d.oy;
    if (!d.moved && Math.hypot(dx, dy) < 3) return;
    d.moved = true;
    onChange(
      formulas.map((f) =>
        f.id === d.id
          ? { ...f, x: Math.max(8, d.sx + dx), y: Math.max(8, d.sy + dy) }
          : f,
      ),
    );
  };

  const onPointerUp = () => {
    const d = drag.current;
    drag.current = null;
    if (!d || !interactive) return;
    // Click (not drag) → open size toolbar
    if (!d.moved) {
      setToolsId(d.id);
    }
  };

  const onWheel = (e: ReactWheelEvent, f: NoteFormula) => {
    if (!interactive || toolsId !== f.id) return;
    e.preventDefault();
    e.stopPropagation();
    const cur = f.scale ?? 1;
    const delta = e.deltaY < 0 ? STEP : -STEP;
    setScale(f.id, cur + delta);
  };

  return (
    <div
      className={`formula-layer ${interactive ? "interactive" : "pass-through"}`}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
      onPointerDown={(e) => {
        if (e.target === e.currentTarget) setToolsId(null);
      }}
    >
      {formulas.map((f) => {
        const scale = f.scale ?? 1;
        const toolsOpen = toolsId === f.id && interactive;
        return (
          <div
            key={f.id}
            className={`floating-formula ${f.display ? "display" : ""} ${toolsOpen ? "tools-open" : ""}`}
            style={{
              left: f.x,
              top: f.y,
              fontSize: `${scale}em`,
            }}
            onPointerDown={(e) => onPointerDown(e, f)}
            onWheel={(e) => onWheel(e, f)}
            onDoubleClick={(e) => {
              if (!interactive) return;
              e.stopPropagation();
              onEdit(f);
            }}
          >
            <div
              className="floating-formula-body"
              dangerouslySetInnerHTML={{
                __html: renderLatex(f.latex, f.display),
              }}
            />
            {toolsOpen && (
              <div className="floating-formula-tools">
                <Tip label="Küçült">
                  <button
                    type="button"
                    aria-label="Küçült"
                    onPointerDown={(e) => e.stopPropagation()}
                    onClick={(e) => {
                      e.stopPropagation();
                      setScale(f.id, scale - STEP);
                    }}
                  >
                    <IconMinus size={12} />
                  </button>
                </Tip>
                <span className="formula-scale-label">
                  {Math.round(scale * 100)}%
                </span>
                <Tip label="Büyüt">
                  <button
                    type="button"
                    aria-label="Büyüt"
                    onPointerDown={(e) => e.stopPropagation()}
                    onClick={(e) => {
                      e.stopPropagation();
                      setScale(f.id, scale + STEP);
                    }}
                  >
                    <IconPlus size={12} />
                  </button>
                </Tip>
                <Tip label="Sil">
                  <button
                    type="button"
                    className="danger"
                    aria-label="Formülü sil"
                    onPointerDown={(e) => e.stopPropagation()}
                    onClick={(e) => {
                      e.stopPropagation();
                      onChange(formulas.filter((x) => x.id !== f.id));
                      setToolsId(null);
                    }}
                  >
                    <IconTrash size={12} />
                  </button>
                </Tip>
                <Tip label="Kapat">
                  <button
                    type="button"
                    className="close"
                    aria-label="Araçları kapat"
                    onPointerDown={(e) => e.stopPropagation()}
                    onClick={(e) => {
                      e.stopPropagation();
                      setToolsId(null);
                    }}
                  >
                    <IconClose size={12} />
                  </button>
                </Tip>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
