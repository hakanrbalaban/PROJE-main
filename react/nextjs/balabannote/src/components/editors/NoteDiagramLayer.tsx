"use client";

import { uid } from "@/lib/id";
import {
  defaultShapeText,
  isFlatText,
  isLineKind,
  shapePath,
} from "@/lib/shapes";
import type { BoardShape, BoardShapeKind } from "@/lib/types";
import {
  useMemo,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
  type ReactNode,
} from "react";

export type DiagramTool = "select" | BoardShapeKind;

type DragMode =
  | { type: "create"; kind: BoardShapeKind; x: number; y: number }
  | { type: "move"; id: string; ox: number; oy: number; sx: number; sy: number }
  | null;

type NoteDiagramLayerProps = {
  shapes: BoardShape[];
  tool: DiagramTool;
  fill: string;
  stroke: string;
  active: boolean;
  onChange: (shapes: BoardShape[]) => void;
  onToolChange: (tool: DiagramTool) => void;
};

export function NoteDiagramLayer({
  shapes,
  tool,
  fill,
  stroke,
  active,
  onChange,
  onToolChange,
}: NoteDiagramLayerProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
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

  const updateSelected = (patch: Partial<BoardShape>) => {
    if (!selectedId) return;
    onChange(shapes.map((s) => (s.id === selectedId ? { ...s, ...patch } : s)));
  };

  const onBgPointerDown = (e: ReactPointerEvent) => {
    if (!active || e.button !== 0) return;
    const p = local(e);

    if (tool === "select") {
      setSelectedId(null);
      return;
    }

    if (tool === "text") {
      const id = uid("sh");
      onChange([
        ...shapes,
        {
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
        },
      ]);
      setSelectedId(id);
      onToolChange("select");
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
      fill: isLineKind(tool) ? "transparent" : fill,
      stroke,
      strokeWidth: 2,
      text: defaultShapeText(tool),
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
              w: isLineKind(mode.kind) ? w : Math.max(w, 24),
              h: isLineKind(mode.kind) ? h : Math.max(h, 24),
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
      const line = isLineKind(preview.kind);
      const ok = line
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
            x: line ? mode.x : preview.x,
            y: line ? mode.y : preview.y,
            w: line ? 0 : preview.w,
            h: line ? 0 : preview.h,
            x2: line ? preview.x2 : undefined,
            y2: line ? preview.y2 : undefined,
            text: defaultShapeText(preview.kind),
          },
        ]);
        setSelectedId(id);
        onToolChange("select");
      }
    }
    setPreview(null);
  };

  const startMove = (e: ReactPointerEvent, s: BoardShape) => {
    if (!active || tool !== "select") return;
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

  const renderShape = (s: BoardShape, ghost = false) => {
    const isSelected = !ghost && s.id === selectedId;
    const common = {
      fill: s.fill === "transparent" ? "none" : s.fill,
      stroke: s.stroke === "transparent" ? "none" : s.stroke,
      strokeWidth: s.strokeWidth,
      opacity: ghost ? 0.5 : 1,
      onPointerDown: (e: ReactPointerEvent) => startMove(e, s),
      style: {
        cursor: tool === "select" ? "move" : "crosshair",
        pointerEvents: active ? ("auto" as const) : ("none" as const),
      },
    };

    let body: ReactNode = null;
    const path = shapePath(s);

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
          style={common.style}
        />
      );
    } else if (s.kind === "rect" || s.kind === "sticky" || s.kind === "roundRect") {
      body = (
        <rect
          x={s.x}
          y={s.y}
          width={Math.max(s.w, 40)}
          height={Math.max(s.h, 28)}
          rx={s.kind === "rect" ? 6 : 12}
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
    } else if (path) {
      body = <path d={path} {...common} />;
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
          markerEnd={s.kind === "arrow" ? "url(#note-arrowhead)" : undefined}
          opacity={ghost ? 0.5 : 1}
          onPointerDown={(e) => startMove(e, s)}
          style={common.style}
        />
      );
    }

    const showLabel =
      s.text != null &&
      !isLineKind(s.kind) &&
      (s.kind === "text" ||
        s.kind === "rect" ||
        s.kind === "roundRect" ||
        s.kind === "sticky" ||
        s.kind === "ellipse" ||
        s.kind === "diamond" ||
        s.kind === "triangle" ||
        s.kind === "hexagon" ||
        s.kind === "parallelogram");

    return (
      <g key={s.id}>
        {body}
        {showLabel && (
          <foreignObject
            x={isFlatText(s.kind) ? s.x : s.x + 8}
            y={isFlatText(s.kind) ? s.y : s.y + 8}
            width={Math.max(s.w - (isFlatText(s.kind) ? 0 : 16), 40)}
            height={Math.max(s.h - (isFlatText(s.kind) ? 0 : 16), 22)}
            style={{
              pointerEvents:
                active && tool === "select" && isSelected ? "auto" : "none",
            }}
          >
            <div
              className={`board-label ${isFlatText(s.kind) ? "flat" : ""} ${s.kind === "sticky" ? "sticky-label" : ""}`}
              contentEditable={isSelected && !ghost && active}
              suppressContentEditableWarning
              onBlur={(e) =>
                updateSelected({ text: e.currentTarget.textContent || "" })
              }
            >
              {s.text}
            </div>
          </foreignObject>
        )}
        {isSelected && !isLineKind(s.kind) && (
          <rect
            x={s.x - 3}
            y={s.y - 3}
            width={s.w + 6}
            height={s.h + 6}
            fill="none"
            stroke="#3B82F6"
            strokeDasharray="4 3"
            strokeWidth={1.5}
            pointerEvents="none"
          />
        )}
      </g>
    );
  };

  return (
    <svg
      ref={svgRef}
      className={`note-diagram ${active ? "active" : ""}`}
      onPointerDown={onBgPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerLeave={onPointerUp}
    >
      <defs>
        <marker
          id="note-arrowhead"
          markerWidth="10"
          markerHeight="7"
          refX="9"
          refY="3.5"
          orient="auto"
        >
          <polygon points="0 0, 10 3.5, 0 7" fill="#0F2C3A" />
        </marker>
      </defs>
      {shapes.map((s) => renderShape(s))}
      {preview && renderShape(preview, true)}
      {/* expose selected for parent via data attr */}
      {selected ? <title>{selected.id}</title> : null}
    </svg>
  );
}

export function deleteSelectedShape(
  shapes: BoardShape[],
  selectedId: string | null,
): BoardShape[] {
  if (!selectedId) return shapes;
  return shapes.filter((s) => s.id !== selectedId);
}
