"use client";

import { BoardArrowMarkers, renderBoardShape } from "@/lib/boardRender";
import { uid } from "@/lib/id";
import {
  defaultArrowEnds,
  defaultChartData,
  defaultShapeText,
  elbowPoints,
  isChartKind,
  isLineKind,
} from "@/lib/shapes";
import type { BoardShape, BoardShapeKind } from "@/lib/types";
import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
} from "react";

export type DiagramTool = "select" | BoardShapeKind;

type DragMode =
  | { type: "create"; kind: BoardShapeKind; x: number; y: number }
  | {
      type: "move";
      id: string;
      ox: number;
      oy: number;
      sx: number;
      sy: number;
      snapshot: BoardShape;
    }
  | null;

type NoteDiagramLayerProps = {
  shapes: BoardShape[];
  tool: DiagramTool;
  fill: string;
  stroke: string;
  active: boolean;
  onChange: (shapes: BoardShape[]) => void;
  onToolChange: (tool: DiagramTool) => void;
  onSelectedChange?: (id: string | null) => void;
  lineStyle?: BoardShape["lineStyle"];
  arrowEnds?: BoardShape["arrowEnds"];
};

export function NoteDiagramLayer({
  shapes,
  tool,
  fill,
  stroke,
  active,
  onChange,
  onToolChange,
  onSelectedChange,
  lineStyle = "solid",
  arrowEnds,
}: NoteDiagramLayerProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const drag = useRef<DragMode>(null);
  const [preview, setPreview] = useState<BoardShape | null>(null);

  const selected = useMemo(
    () => shapes.find((s) => s.id === selectedId) ?? null,
    [shapes, selectedId],
  );

  useEffect(() => {
    onSelectedChange?.(selectedId);
  }, [selectedId, onSelectedChange]);

  useEffect(() => {
    if (!active) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Delete" && e.key !== "Backspace") return;
      if (!selectedId) return;
      const t = e.target as HTMLElement | null;
      if (
        t &&
        (t.tagName === "INPUT" ||
          t.tagName === "TEXTAREA" ||
          t.isContentEditable)
      ) {
        return;
      }
      e.preventDefault();
      onChange(shapes.filter((s) => s.id !== selectedId));
      setSelectedId(null);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [active, selectedId, shapes, onChange]);

  const local = (e: ReactPointerEvent) => {
    const svg = svgRef.current!;
    const rect = svg.getBoundingClientRect();
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
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
      lineStyle,
      arrowEnds: arrowEnds ?? defaultArrowEnds(tool),
      chart: isChartKind(tool) ? defaultChartData(tool) : undefined,
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
              points:
                mode.kind === "connector"
                  ? elbowPoints(mode.x, mode.y, p.x, p.y)
                  : undefined,
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
          const next: BoardShape = {
            ...s,
            x: mode.sx + dx,
            y: mode.sy + dy,
          };
          if (s.x2 != null && s.y2 != null) {
            next.x2 = mode.snapshot.x2! + dx;
            next.y2 = mode.snapshot.y2! + dy;
          }
          if (s.points?.length) {
            next.points = mode.snapshot.points!.map((pt) => ({
              x: pt.x + dx,
              y: pt.y + dy,
            }));
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
            w: line
              ? 0
              : Math.max(preview.w, isChartKind(preview.kind) ? 160 : 24),
            h: line
              ? 0
              : Math.max(preview.h, isChartKind(preview.kind) ? 120 : 24),
            x2: line ? preview.x2 : undefined,
            y2: line ? preview.y2 : undefined,
            points:
              preview.kind === "connector"
                ? elbowPoints(
                    mode.x,
                    mode.y,
                    preview.x2 ?? mode.x,
                    preview.y2 ?? mode.y,
                  )
                : undefined,
            text: defaultShapeText(preview.kind),
            chart: isChartKind(preview.kind)
              ? preview.chart ?? defaultChartData(preview.kind)
              : undefined,
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
      snapshot: structuredClone(s),
    };
    setSelectedId(s.id);
  };

  const renderOpts = {
    selectedId,
    toolIsSelect: tool === "select",
    active,
    markerPrefix: "note",
    textColor: stroke,
    onPointerDown: startMove,
    onLabelBlur: (id: string, text: string) => {
      onChange(shapes.map((s) => (s.id === id ? { ...s, text } : s)));
    },
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
        <BoardArrowMarkers prefix="note" color="#0F2C3A" />
      </defs>
      {shapes.map((s) => renderBoardShape(s, renderOpts))}
      {preview && renderBoardShape(preview, { ...renderOpts, ghost: true })}
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
