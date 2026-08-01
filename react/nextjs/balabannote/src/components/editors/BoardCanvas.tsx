"use client";

import { uid } from "@/lib/id";
import { isLineKind, shapePath } from "@/lib/shapes";
import type { BoardShape, BoardShapeKind } from "@/lib/types";
import {
  IconArrow,
  IconClose,
  IconDiamond,
  IconEllipse,
  IconLine,
  IconRect,
  IconSelect,
  IconText,
  IconTrash,
} from "@/components/Icons";
import { Tip } from "@/components/Tip";
import {
  useMemo,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
  type ReactNode,
} from "react";

const FILLS = [
  "transparent",
  "#E6F4F2",
  "#E8EEF8",
  "#F5EDE8",
  "#F3EAF6",
  "#EEF5EA",
  "#ffffff",
];
const STROKES = [
  "#0F2C3A",
  "#1A9B8E",
  "#2F6FED",
  "#C45B2A",
  "#7B5EA7",
  "#3D7A4A",
];

type Tool = "select" | BoardShapeKind;

type BoardCanvasProps = {
  pageId: string;
  title: string;
  shapes: BoardShape[];
  onTitleChange: (title: string) => void;
  onChange: (shapes: BoardShape[]) => void;
};

type DragMode =
  | { type: "create"; kind: BoardShapeKind; x: number; y: number }
  | { type: "move"; id: string; ox: number; oy: number; sx: number; sy: number }
  | null;

export function BoardCanvas({
  pageId,
  title,
  shapes,
  onTitleChange,
  onChange,
}: BoardCanvasProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [tool, setTool] = useState<Tool>("select");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [fill, setFill] = useState("transparent");
  const [stroke, setStroke] = useState(STROKES[0]);
  const drag = useRef<DragMode>(null);
  const [preview, setPreview] = useState<BoardShape | null>(null);

  const selected = useMemo(
    () => shapes.find((s) => s.id === selectedId) ?? null,
    [shapes, selectedId],
  );

  const local = (e: ReactPointerEvent) => {
    const svg = svgRef.current!;
    const rect = svg.getBoundingClientRect();
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  };

  const onBgPointerDown = (e: ReactPointerEvent) => {
    if (e.button !== 0) return;
    const p = local(e);

    if (tool === "select") {
      setSelectedId(null);
      return;
    }

    // Flat text: click once, no box
    if (tool === "text") {
      const id = uid("sh");
      const shape: BoardShape = {
        id,
        kind: "text",
        x: p.x,
        y: p.y - 12,
        w: 180,
        h: 28,
        fill: "transparent",
        stroke: "transparent",
        strokeWidth: 0,
        text: "Metin",
      };
      onChange([...shapes, shape]);
      setSelectedId(id);
      setTool("select");
      return;
    }

    (e.target as Element).setPointerCapture?.(e.pointerId);
    drag.current = { type: "create", kind: tool, x: p.x, y: p.y };
    setPreview({
      id: "preview",
      kind: tool,
      x: p.x,
      y: p.y,
      w: 0,
      h: 0,
      x2: p.x,
      y2: p.y,
      fill: tool === "arrow" || tool === "line" ? "transparent" : fill,
      stroke,
      strokeWidth: 2,
      text: "",
    });
  };

  const onPointerMove = (e: ReactPointerEvent) => {
    const mode = drag.current;
    if (!mode) return;
    const p = local(e);

    if (mode.type === "create") {
      const x = Math.min(mode.x, p.x);
      const y = Math.min(mode.y, p.y);
      const w = Math.abs(p.x - mode.x);
      const h = Math.abs(p.y - mode.y);
      setPreview((prev) =>
        prev
          ? {
              ...prev,
              x,
              y,
              w:
                mode.kind === "arrow" || mode.kind === "line"
                  ? w
                  : Math.max(w, 24),
              h:
                mode.kind === "arrow" || mode.kind === "line"
                  ? h
                  : Math.max(h, 24),
              x2: p.x,
              y2: p.y,
            }
          : null,
      );
      return;
    }

    if (mode.type === "move") {
      const dx = p.x - mode.ox;
      const dy = p.y - mode.oy;
      onChange(
        shapes.map((s) => {
          if (s.id !== mode.id) return s;
          const next = { ...s, x: mode.sx + dx, y: mode.sy + dy };
          if (s.x2 != null && s.y2 != null) {
            next.x2 = s.x2 - s.x + next.x;
            next.y2 = s.y2 - s.y + next.y;
          }
          return next;
        }),
      );
    }
  };

  const onPointerUp = () => {
    const mode = drag.current;
    drag.current = null;
    if (mode?.type === "create" && preview) {
      const isLine = preview.kind === "arrow" || preview.kind === "line";
      const ok = isLine
        ? Math.hypot(
            (preview.x2 ?? preview.x) - mode.x,
            (preview.y2 ?? preview.y) - mode.y,
          ) > 12
        : preview.w > 16 && preview.h > 16;
      if (ok) {
        const id = uid("sh");
        onChange([
          ...shapes,
          {
            ...preview,
            id,
            x: isLine ? mode.x : preview.x,
            y: isLine ? mode.y : preview.y,
            w: isLine ? 0 : preview.w,
            h: isLine ? 0 : preview.h,
            x2: isLine ? preview.x2 : undefined,
            y2: isLine ? preview.y2 : undefined,
            text:
              preview.kind === "rect" ||
              preview.kind === "ellipse" ||
              preview.kind === "diamond"
                ? ""
                : undefined,
          },
        ]);
        setSelectedId(id);
        setTool("select");
      }
    }
    setPreview(null);
  };

  const startMove = (e: ReactPointerEvent, s: BoardShape) => {
    if (tool !== "select") return;
    e.stopPropagation();
    (e.currentTarget as Element).setPointerCapture(e.pointerId);
    const p = local(e);
    drag.current = {
      type: "move",
      id: s.id,
      ox: p.x,
      oy: p.y,
      sx: s.x,
      sy: s.y,
    };
    setSelectedId(s.id);
  };

  const updateSelected = (patch: Partial<BoardShape>) => {
    if (!selectedId) return;
    onChange(shapes.map((s) => (s.id === selectedId ? { ...s, ...patch } : s)));
  };

  const removeSelected = () => {
    if (!selectedId) return;
    onChange(shapes.filter((s) => s.id !== selectedId));
    setSelectedId(null);
  };

  const renderShape = (s: BoardShape, ghost = false) => {
    const isSelected = !ghost && s.id === selectedId;
    const common = {
      fill: s.fill === "transparent" ? "none" : s.fill,
      stroke: s.stroke === "transparent" ? "none" : s.stroke,
      strokeWidth: s.strokeWidth,
      opacity: ghost ? 0.55 : 1,
      onPointerDown: (e: ReactPointerEvent) => startMove(e, s),
      style: { cursor: tool === "select" ? "move" : "crosshair" } as const,
    };

    let body: ReactNode = null;

    if (s.kind === "text") {
      body = (
        <rect
          x={s.x}
          y={s.y}
          width={Math.max(s.w, 40)}
          height={Math.max(s.h, 24)}
          fill="transparent"
          stroke="none"
          onPointerDown={(e) => startMove(e, s)}
          style={{ cursor: tool === "select" ? "move" : "crosshair" }}
        />
      );
    } else if (s.kind === "rect") {
      body = (
        <rect
          x={s.x}
          y={s.y}
          width={Math.max(s.w, 40)}
          height={Math.max(s.h, 28)}
          rx={8}
          {...common}
        />
      );
    } else if (s.kind === "ellipse") {
      body = (
        <ellipse
          cx={s.x + s.w / 2}
          cy={s.y + s.h / 2}
          rx={s.w / 2}
          ry={s.h / 2}
          {...common}
        />
      );
    } else if (s.kind === "diamond" || s.kind === "triangle" || s.kind === "hexagon" || s.kind === "parallelogram") {
      body = <path d={shapePath(s)!} {...common} />;
    } else if (s.kind === "line" || s.kind === "arrow") {
      const x2 = s.x2 ?? s.x + s.w;
      const y2 = s.y2 ?? s.y + s.h;
      body = (
        <line
          x1={s.x}
          y1={s.y}
          x2={x2}
          y2={y2}
          stroke={s.stroke}
          strokeWidth={s.strokeWidth}
          fill="none"
          markerEnd={s.kind === "arrow" ? "url(#arrowhead)" : undefined}
          opacity={ghost ? 0.55 : 1}
          onPointerDown={(e) => startMove(e, s)}
          style={{ cursor: tool === "select" ? "move" : "crosshair" }}
        />
      );
    }

    const showLabel =
      s.text != null &&
      (s.kind === "rect" ||
        s.kind === "ellipse" ||
        s.kind === "diamond" ||
        s.kind === "text");

    return (
      <g key={s.id} data-page={pageId}>
        {body}
        {showLabel && (
          <foreignObject
            x={s.kind === "text" ? s.x : s.x + 8}
            y={s.kind === "text" ? s.y : s.y + 8}
            width={Math.max(s.w - (s.kind === "text" ? 0 : 16), 40)}
            height={Math.max(s.h - (s.kind === "text" ? 0 : 16), 22)}
            style={{
              pointerEvents: tool === "select" && isSelected ? "auto" : "none",
            }}
          >
            <div
              className={`board-label ${s.kind === "text" ? "flat" : ""}`}
              contentEditable={isSelected && !ghost}
              suppressContentEditableWarning
              onBlur={(e) =>
                updateSelected({ text: e.currentTarget.textContent || "" })
              }
              style={s.kind === "text" ? { color: stroke } : undefined}
            >
              {s.text}
            </div>
          </foreignObject>
        )}
        {isSelected && s.kind !== "line" && s.kind !== "arrow" && (
          <rect
            x={s.x - 3}
            y={s.y - 3}
            width={s.w + 6}
            height={s.h + 6}
            fill="none"
            stroke="#2F6FED"
            strokeDasharray="4 3"
            strokeWidth={1.5}
            pointerEvents="none"
          />
        )}
      </g>
    );
  };

  const tools: {
    id: Tool;
    label: string;
    icon: ReactNode;
    tone: string;
  }[] = [
    { id: "select", label: "Seç", icon: <IconSelect size={16} />, tone: "tone-select" },
    { id: "rect", label: "Kutu", icon: <IconRect size={16} />, tone: "tone-rect" },
    { id: "ellipse", label: "Oval", icon: <IconEllipse size={16} />, tone: "tone-ellipse" },
    { id: "diamond", label: "Elmas", icon: <IconDiamond size={16} />, tone: "tone-diamond" },
    { id: "arrow", label: "Ok", icon: <IconArrow size={16} />, tone: "tone-arrow" },
    { id: "line", label: "Çizgi", icon: <IconLine size={16} />, tone: "tone-line" },
    { id: "text", label: "Metin", icon: <IconText size={16} />, tone: "tone-write" },
  ];

  return (
    <div className="board-editor">
      <header className="editor-header">
        <input
          className="page-title-input"
          value={title}
          onChange={(e) => onTitleChange(e.target.value)}
          placeholder="Board adı"
          aria-label="Board başlığı"
        />
        <p className="editor-sub">
          Şekiller çiz, metni tıklayarak düz ekle — varsayılan dolgusuz.
        </p>
      </header>
      <div className="board-toolbar" role="toolbar">
        {tools.map((t) => (
          <Tip key={t.id} label={t.label}>
            <button
              type="button"
              className={`icon-tool ${t.tone} ${tool === t.id ? "active" : ""}`}
              onClick={() => setTool(t.id)}
              aria-label={t.label}
            >
              {t.icon}
            </button>
          </Tip>
        ))}
        <span className="toolbar-sep" />
        <div className="swatches" title="Dolgu">
          {FILLS.map((c) => (
            <Tip key={c} label={c === "transparent" ? "Dolgusuz" : `Dolgu ${c}`}>
              <button
                type="button"
                className={`swatch ${fill === c ? "active" : ""} ${c === "transparent" ? "swatch-none" : ""}`}
                style={{ background: c === "transparent" ? "transparent" : c }}
                onClick={() => {
                  setFill(c);
                  if (selected && selected.kind !== "text") {
                    updateSelected({ fill: c });
                  }
                }}
                aria-label={c === "transparent" ? "Dolgusuz" : `Dolgu ${c}`}
              />
            </Tip>
          ))}
        </div>
        <div className="swatches" title="Çizgi">
          {STROKES.map((c) => (
            <Tip key={c} label={`Çizgi ${c}`}>
              <button
                type="button"
                className={`swatch ring ${stroke === c ? "active" : ""}`}
                style={{ background: c }}
                onClick={() => {
                  setStroke(c);
                  if (selected) updateSelected({ stroke: c });
                }}
                aria-label={`Çizgi rengi ${c}`}
              />
            </Tip>
          ))}
        </div>
        <Tip label="Seçiliyi sil">
          <button
            type="button"
            className="icon-tool tool-btn"
            onClick={removeSelected}
            disabled={!selected}
            aria-label="Seçiliyi sil"
          >
            <IconClose size={16} />
          </button>
        </Tip>
        <Tip label="Temizle">
          <button
            type="button"
            className="icon-tool tool-btn danger"
            onClick={() => onChange([])}
            aria-label="Temizle"
          >
            <IconTrash size={16} />
          </button>
        </Tip>
      </div>
      <div className="board-stage">
        <svg
          ref={svgRef}
          className="board-svg"
          onPointerDown={onBgPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerLeave={onPointerUp}
        >
          <defs>
            <marker
              id="arrowhead"
              markerWidth="10"
              markerHeight="7"
              refX="9"
              refY="3.5"
              orient="auto"
            >
              <polygon points="0 0, 10 3.5, 0 7" fill="#0F2C3A" />
            </marker>
            <pattern
              id="board-grid"
              width="20"
              height="20"
              patternUnits="userSpaceOnUse"
            >
              <path
                d="M 20 0 L 0 0 0 20"
                fill="none"
                stroke="rgba(15,44,58,0.08)"
                strokeWidth="1"
              />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="#f3f6f9" />
          <rect width="100%" height="100%" fill="url(#board-grid)" />
          {shapes.map((s) => renderShape(s))}
          {preview && renderShape(preview, true)}
        </svg>
      </div>
    </div>
  );
}
