"use client";

import { Tip } from "@/components/Tip";
import {
  IconClose,
  IconEraser,
  IconHand,
  IconPen,
  IconRedo,
  IconSelect,
  IconShapes,
  IconTrash,
  IconUndo,
  IconZoomIn,
  IconZoomOut,
} from "@/components/Icons";
import {
  BOARD_LIB_TABS,
  BOARD_TOOLS,
  type BoardLibTab,
  type BoardToolItem,
} from "@/lib/boardCatalog";
import {
  DEFAULT_CAMERA,
  panBy,
  resetCamera,
  screenToWorld,
  zoomAt,
  type BoardCamera,
} from "@/lib/boardCamera";
import { BoardArrowMarkers, renderBoardShape } from "@/lib/boardRender";
import { createHistory, type BoardHistoryState } from "@/lib/history";
import { uid } from "@/lib/id";
import {
  appendStabilizedPoint,
  createStabilizer,
  defaultWidthForPen,
  drawLiveStroke,
  drawStroke,
  estimatePressure,
  finalizeStrokePoints,
  resetStabilizer,
  strokeHitTest,
  strokeIntersectsEraser,
  type StabilizerState,
} from "@/lib/pen";
import {
  defaultArrowEnds,
  defaultChartData,
  defaultShapeText,
  elbowPoints,
  isChartKind,
  isLineKind,
} from "@/lib/shapes";
import type {
  BoardArrowEnds,
  BoardLineStyle,
  BoardShape,
  BoardShapeKind,
  InkStroke,
  PenKind,
  Point,
} from "@/lib/types";
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
} from "react";

const FILLS = [
  "transparent",
  "#E6F4F2",
  "#E8EEF8",
  "#F5EDE8",
  "#F3EAF6",
  "#EEF5EA",
  "#FEF08A",
  "#ffffff",
];
const STROKES = [
  "#1A9B8E",
  "#2F6FED",
  "#C45B2A",
  "#7B5EA7",
  "#E2E8F0",
  "#94A3B8",
  "#0F2C3A",
];

const SNAP_PX = 6;
type Handle = "nw" | "ne" | "sw" | "se" | "n" | "s" | "e" | "w";

type Tool =
  | { type: "select" }
  | { type: "hand" }
  | { type: "shape"; item: BoardToolItem }
  | { type: "pen" }
  | { type: "erase" };

type BoardCanvasProps = {
  pageId: string;
  title: string;
  shapes: BoardShape[];
  strokes?: InkStroke[];
  onTitleChange: (title: string) => void;
  onChange: (shapes: BoardShape[]) => void;
  onStrokesChange?: (strokes: InkStroke[]) => void;
};

type DragMode =
  | {
      type: "create";
      kind: BoardShapeKind;
      x: number;
      y: number;
      item: BoardToolItem;
    }
  | {
      type: "move";
      id: string;
      ox: number;
      oy: number;
      sx: number;
      sy: number;
      snapshot: BoardShape;
    }
  | {
      type: "resize";
      id: string;
      handle: Handle;
      ox: number;
      oy: number;
      snapshot: BoardShape;
    }
  | { type: "pan"; ox: number; oy: number; camX: number; camY: number }
  | null;

type SnapGuides = { v: number | null; h: number | null };

function shapeEdges(s: BoardShape) {
  const x2 = s.x2 ?? s.x + s.w;
  const y2 = s.y2 ?? s.y + s.h;
  const left = Math.min(s.x, x2);
  const right = Math.max(s.x, isLineKind(s.kind) ? x2 : s.x + s.w);
  const top = Math.min(s.y, y2);
  const bottom = Math.max(s.y, isLineKind(s.kind) ? y2 : s.y + s.h);
  return {
    left,
    right,
    top,
    bottom,
    cx: (left + right) / 2,
    cy: (top + bottom) / 2,
  };
}

function applyResize(
  snap: BoardShape,
  handle: Handle,
  wx: number,
  wy: number,
): BoardShape {
  if (isLineKind(snap.kind)) {
    const next = { ...snap };
    if (handle === "nw" || handle === "w" || handle === "sw") {
      next.x = wx;
      next.y = handle.includes("n") || handle.includes("s") ? wy : snap.y;
    } else if (handle === "ne" || handle === "e" || handle === "se") {
      next.x2 = wx;
      next.y2 = handle.includes("n") || handle.includes("s") ? wy : snap.y2;
    }
    return next;
  }
  let { x, y, w, h } = snap;
  const r = x + w;
  const b = y + h;
  if (handle.includes("w")) x = Math.min(wx, r - 24);
  if (handle.includes("e")) w = Math.max(24, wx - x);
  if (handle.includes("n")) y = Math.min(wy, b - 24);
  if (handle.includes("s")) h = Math.max(24, wy - y);
  if (handle.includes("w")) w = Math.max(24, r - x);
  if (handle.includes("n")) h = Math.max(24, b - y);
  return { ...snap, x, y, w, h };
}

export function BoardCanvas({
  pageId,
  title,
  shapes,
  strokes = [],
  onTitleChange,
  onChange,
  onStrokesChange,
}: BoardCanvasProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const inkRef = useRef<HTMLCanvasElement>(null);
  const [tool, setTool] = useState<Tool>({ type: "select" });
  const [libOpen, setLibOpen] = useState(true);
  const [libTab, setLibTab] = useState<BoardLibTab>("shapes");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [fill, setFill] = useState("transparent");
  const [stroke, setStroke] = useState(STROKES[0]!);
  const [lineStyle, setLineStyle] = useState<BoardLineStyle>("solid");
  const [arrowEnds, setArrowEnds] = useState<BoardArrowEnds>("end");
  const [inkPen] = useState<PenKind>("ballpoint");
  const [penSpeed] = useState(() => {
    if (typeof window === "undefined") return 1;
    const raw = Number(localStorage.getItem("balaban-pen-speed"));
    return Number.isFinite(raw) && raw >= 0.35 && raw <= 1.75 ? raw : 1;
  });
  const penSpeedRef = useRef(penSpeed);
  penSpeedRef.current = penSpeed;
  const [camera, setCamera] = useState<BoardCamera>(DEFAULT_CAMERA);
  const [spaceDown, setSpaceDown] = useState(false);
  const [guides, setGuides] = useState<SnapGuides>({ v: null, h: null });
  const [histTick, setHistTick] = useState(0);
  const drag = useRef<DragMode>(null);
  const [preview, setPreview] = useState<BoardShape | null>(null);
  const drawing = useRef(false);
  const current = useRef<Point[]>([]);
  const stabilizer = useRef<StabilizerState>(createStabilizer());
  const strokesRef = useRef(strokes);
  const shapesRef = useRef(shapes);
  const cameraRef = useRef(camera);
  const rafId = useRef(0);
  const history = useRef(createHistory<BoardHistoryState>(50));

  strokesRef.current = strokes;
  shapesRef.current = shapes;
  cameraRef.current = camera;

  useEffect(() => {
    setSelectedId(null);
    setTool({ type: "select" });
    setPreview(null);
    setCamera(resetCamera());
    setGuides({ v: null, h: null });
    drag.current = null;
    drawing.current = false;
    current.current = [];
    history.current.clear();
    setHistTick((n) => n + 1);
  }, [pageId]);

  const selected = useMemo(
    () => shapes.find((s) => s.id === selectedId) ?? null,
    [shapes, selectedId],
  );

  const tabTools = BOARD_TOOLS.filter((t) => t.tab === libTab);
  const inkMode = tool.type === "pen" || tool.type === "erase";
  const panMode = tool.type === "hand" || spaceDown;

  const checkpoint = useCallback(() => {
    history.current.push({
      shapes: shapesRef.current,
      strokes: strokesRef.current,
    });
    setHistTick((n) => n + 1);
  }, []);

  const applyHistory = useCallback(
    (next: BoardHistoryState) => {
      onChange(next.shapes);
      onStrokesChange?.(next.strokes);
      setHistTick((n) => n + 1);
    },
    [onChange, onStrokesChange],
  );

  const undo = useCallback(() => {
    const prev = history.current.undo({
      shapes: shapesRef.current,
      strokes: strokesRef.current,
    });
    if (prev) applyHistory(prev);
  }, [applyHistory]);

  const redo = useCallback(() => {
    const next = history.current.redo({
      shapes: shapesRef.current,
      strokes: strokesRef.current,
    });
    if (next) applyHistory(next);
  }, [applyHistory]);

  const stagePoint = useCallback((e: { clientX: number; clientY: number }) => {
    const el = stageRef.current!;
    const rect = el.getBoundingClientRect();
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  }, []);

  const worldPoint = useCallback(
    (e: { clientX: number; clientY: number }) => {
      const s = stagePoint(e);
      return screenToWorld(cameraRef.current, s.x, s.y);
    },
    [stagePoint],
  );

  const redrawInk = useCallback(() => {
    const canvas = inkRef.current;
    const stage = stageRef.current;
    if (!canvas || !stage) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const dpr = window.devicePixelRatio || 1;
    const w = canvas.width / dpr;
    const h = canvas.height / dpr;
    const cam = cameraRef.current;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, w, h);
    ctx.save();
    ctx.translate(cam.x, cam.y);
    ctx.scale(cam.zoom, cam.zoom);
    for (const s of strokesRef.current) {
      drawStroke(ctx, { ...s, pen: s.pen ?? "ballpoint" });
    }
    if (current.current.length > 1) {
      if (tool.type === "pen") {
        drawLiveStroke(ctx, {
          id: "live",
          points: current.current,
          color: stroke,
          width: defaultWidthForPen(inkPen),
          pen: inkPen,
        });
      } else if (tool.type === "erase") {
        ctx.save();
        ctx.strokeStyle = "rgba(15,44,58,0.2)";
        ctx.lineWidth = 18 / cam.zoom;
        ctx.lineCap = "round";
        ctx.lineJoin = "round";
        const pts = current.current;
        ctx.beginPath();
        ctx.moveTo(pts[0].x, pts[0].y);
        for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i].x, pts[i].y);
        ctx.stroke();
        ctx.restore();
      }
    }
    ctx.restore();
  }, [tool.type, stroke, inkPen]);

  const scheduleInk = useCallback(() => {
    if (rafId.current) return;
    rafId.current = requestAnimationFrame(() => {
      rafId.current = 0;
      redrawInk();
    });
  }, [redrawInk]);

  useEffect(() => {
    const stage = stageRef.current;
    const canvas = inkRef.current;
    if (!stage || !canvas) return;
    const resize = () => {
      const rect = stage.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      canvas.width = Math.floor(rect.width * dpr);
      canvas.height = Math.floor(rect.height * dpr);
      canvas.style.width = `${rect.width}px`;
      canvas.style.height = `${rect.height}px`;
      redrawInk();
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(stage);
    return () => {
      ro.disconnect();
      if (rafId.current) cancelAnimationFrame(rafId.current);
    };
  }, [pageId, redrawInk]);

  useEffect(() => {
    redrawInk();
  }, [strokes, camera, redrawInk]);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement | null;
      const typing =
        t &&
        (t.tagName === "INPUT" ||
          t.tagName === "TEXTAREA" ||
          t.isContentEditable);
      if (e.code === "Space" && !typing) {
        e.preventDefault();
        setSpaceDown(true);
      }
      if (typing) return;
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "z" && !e.shiftKey) {
        e.preventDefault();
        undo();
      } else if (
        (e.ctrlKey || e.metaKey) &&
        (e.key.toLowerCase() === "y" ||
          (e.key.toLowerCase() === "z" && e.shiftKey))
      ) {
        e.preventDefault();
        redo();
      } else if ((e.ctrlKey || e.metaKey) && e.key === "0") {
        e.preventDefault();
        setCamera(resetCamera());
      } else if ((e.ctrlKey || e.metaKey) && (e.key === "=" || e.key === "+")) {
        e.preventDefault();
        setCamera((c) => zoomAt(c, 400, 300, c.zoom * 1.15));
      } else if ((e.ctrlKey || e.metaKey) && e.key === "-") {
        e.preventDefault();
        setCamera((c) => zoomAt(c, 400, 300, c.zoom / 1.15));
      } else if ((e.key === "Delete" || e.key === "Backspace") && selectedId) {
        e.preventDefault();
        checkpoint();
        onChange(shapesRef.current.filter((s) => s.id !== selectedId));
        setSelectedId(null);
      } else if (e.key === "v" || e.key === "V") setTool({ type: "select" });
      else if (e.key === "h" || e.key === "H") setTool({ type: "hand" });
      else if (e.key === "p" || e.key === "P") setTool({ type: "pen" });
      else if (e.key === "e" || e.key === "E") setTool({ type: "erase" });
    };
    const onKeyUp = (e: KeyboardEvent) => {
      if (e.code === "Space") setSpaceDown(false);
    };
    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup", onKeyUp);
    };
  }, [undo, redo, selectedId, checkpoint, onChange]);

  useEffect(() => {
    const stage = stageRef.current;
    if (!stage) return;
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      const s = stagePoint(e);
      const factor = e.deltaY > 0 ? 0.9 : 1.1;
      setCamera((c) => zoomAt(c, s.x, s.y, c.zoom * factor));
    };
    stage.addEventListener("wheel", onWheel, { passive: false });
    return () => stage.removeEventListener("wheel", onWheel);
  }, [stagePoint]);

  useEffect(() => {
    const desktop = window.balabanDesktop;
    if (!desktop?.onAppCommand) return;
    return desktop.onAppCommand((cmd) => {
      if (cmd === "undo") undo();
      else if (cmd === "redo") redo();
      else if (cmd === "zoom-in")
        setCamera((c) => zoomAt(c, 400, 300, c.zoom * 1.15));
      else if (cmd === "zoom-out")
        setCamera((c) => zoomAt(c, 400, 300, c.zoom / 1.15));
      else if (cmd === "zoom-reset") setCamera(resetCamera());
    });
  }, [undo, redo]);

  const snapMove = useCallback(
    (moving: BoardShape, dx: number, dy: number): { dx: number; dy: number; guides: SnapGuides } => {
      let ndx = dx;
      let ndy = dy;
      const trial = {
        ...moving,
        x: moving.x + dx,
        y: moving.y + dy,
        x2: moving.x2 != null ? moving.x2 + dx : undefined,
        y2: moving.y2 != null ? moving.y2 + dy : undefined,
      };
      const me = shapeEdges(trial);
      const thr = SNAP_PX / cameraRef.current.zoom;
      let gv: number | null = null;
      let gh: number | null = null;
      for (const s of shapesRef.current) {
        if (s.id === moving.id) continue;
        const o = shapeEdges(s);
        for (const [mine, other] of [
          [me.left, o.left],
          [me.left, o.right],
          [me.right, o.left],
          [me.right, o.right],
          [me.cx, o.cx],
        ] as const) {
          if (Math.abs(mine - other) < thr) {
            ndx += other - mine;
            gv = other;
          }
        }
        for (const [mine, other] of [
          [me.top, o.top],
          [me.top, o.bottom],
          [me.bottom, o.top],
          [me.bottom, o.bottom],
          [me.cy, o.cy],
        ] as const) {
          if (Math.abs(mine - other) < thr) {
            ndy += other - mine;
            gh = other;
          }
        }
      }
      return { dx: ndx, dy: ndy, guides: { v: gv, h: gh } };
    },
    [],
  );

  const localInk = (e: ReactPointerEvent): Point => {
    const w = worldPoint(e);
    return { x: w.x, y: w.y, p: estimatePressure(e) };
  };

  const onInkPointerDown = (e: ReactPointerEvent) => {
    if (!inkMode || panMode || e.button !== 0) return;
    e.preventDefault();
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    const p = localInk(e);
    if (tool.type === "erase") {
      const hit = strokesRef.current.find((s) => strokeHitTest(s, p.x, p.y));
      if (hit && onStrokesChange) {
        checkpoint();
        onStrokesChange(strokesRef.current.filter((s) => s.id !== hit.id));
        return;
      }
    }
    drawing.current = true;
    current.current = [p];
    resetStabilizer(stabilizer.current, p);
    scheduleInk();
  };

  const onInkPointerMove = (e: ReactPointerEvent) => {
    if (!drawing.current || !inkMode) return;
    if (
      appendStabilizedPoint(
        current.current,
        localInk(e),
        stabilizer.current,
        penSpeedRef.current,
      )
    ) {
      scheduleInk();
    }
  };

  const onInkPointerUp = () => {
    if (!drawing.current) return;
    drawing.current = false;
    const pts = finalizeStrokePoints(current.current);
    current.current = [];
    if (pts.length < 2) {
      scheduleInk();
      return;
    }
    if (!onStrokesChange) return;
    checkpoint();
    if (tool.type === "erase") {
      onStrokesChange(
        strokesRef.current.filter((s) => !strokeIntersectsEraser(s, pts, 16)),
      );
      return;
    }
    onStrokesChange([
      ...strokesRef.current,
      {
        id: uid("ink"),
        points: pts,
        color: stroke,
        width: defaultWidthForPen(inkPen),
        pen: inkPen,
      },
    ]);
  };

  const beginPan = (e: ReactPointerEvent) => {
    const s = stagePoint(e);
    const cam = cameraRef.current;
    drag.current = {
      type: "pan",
      ox: s.x,
      oy: s.y,
      camX: cam.x,
      camY: cam.y,
    };
    (e.target as Element).setPointerCapture?.(e.pointerId);
  };

  const onBgPointerDown = (e: ReactPointerEvent) => {
    if (inkMode) return;
    if (e.button === 1 || (e.button === 0 && panMode)) {
      e.preventDefault();
      beginPan(e);
      return;
    }
    if (e.button !== 0) return;
    const p = worldPoint(e);

    if (tool.type === "select" || tool.type === "hand") {
      if (tool.type === "select") setSelectedId(null);
      return;
    }

    if (tool.type !== "shape") return;
    const item = tool.item;

    if (item.id === "text") {
      checkpoint();
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
      setTool({ type: "select" });
      return;
    }

    (e.target as Element).setPointerCapture?.(e.pointerId);
    drag.current = { type: "create", kind: item.id, x: p.x, y: p.y, item };
    const useFill = item.fill ?? fill;
    setPreview({
      id: "preview",
      kind: item.id,
      x: p.x,
      y: p.y,
      w: 0,
      h: 0,
      x2: p.x,
      y2: p.y,
      fill: isLineKind(item.id) ? "transparent" : useFill,
      stroke,
      strokeWidth: 2,
      text: defaultShapeText(item.id),
      lineStyle: item.lineStyle ?? lineStyle,
      arrowEnds: item.arrowEnds ?? defaultArrowEnds(item.id),
      chart: isChartKind(item.id) ? defaultChartData(item.id) : undefined,
    });
  };

  const onPointerMove = (e: ReactPointerEvent) => {
    const mode = drag.current;
    if (!mode) return;

    if (mode.type === "pan") {
      const s = stagePoint(e);
      setCamera({
        ...cameraRef.current,
        x: mode.camX + (s.x - mode.ox),
        y: mode.camY + (s.y - mode.oy),
      });
      return;
    }

    const p = worldPoint(e);

    if (mode.type === "create") {
      const x = Math.min(mode.x, p.x);
      const y = Math.min(mode.y, p.y);
      const w = Math.abs(p.x - mode.x);
      const h = Math.abs(p.y - mode.y);
      const line = isLineKind(mode.kind);
      setPreview((prev) =>
        prev
          ? {
              ...prev,
              x,
              y,
              w: line ? w : Math.max(w, 24),
              h: line ? h : Math.max(h, 24),
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

    if (mode.type === "resize") {
      onChange(
        shapes.map((s) =>
          s.id === mode.id ? applyResize(mode.snapshot, mode.handle, p.x, p.y) : s,
        ),
      );
      return;
    }

    if (mode.type === "move") {
      let dx = p.x - mode.ox;
      let dy = p.y - mode.oy;
      const snapped = snapMove(mode.snapshot, dx, dy);
      dx = snapped.dx;
      dy = snapped.dy;
      setGuides(snapped.guides);
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
    setGuides({ v: null, h: null });
    if (mode?.type === "create" && preview) {
      const line = isLineKind(preview.kind);
      const ok = line
        ? Math.hypot(
            (preview.x2 ?? preview.x) - mode.x,
            (preview.y2 ?? preview.y) - mode.y,
          ) > 12
        : preview.w > 16 && preview.h > 16;
      if (ok) {
        checkpoint();
        const id = uid("sh");
        const created: BoardShape = {
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
        };
        onChange([...shapes, created]);
        setSelectedId(id);
        setTool({ type: "select" });
      }
    }
    setPreview(null);
  };

  const startMove = (e: ReactPointerEvent, s: BoardShape) => {
    if (tool.type !== "select" || inkMode || panMode) return;
    e.stopPropagation();
    (e.currentTarget as Element).setPointerCapture(e.pointerId);
    const p = worldPoint(e);
    checkpoint();
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

  const startResize = (e: ReactPointerEvent, handle: Handle) => {
    if (!selected || tool.type !== "select") return;
    e.stopPropagation();
    e.preventDefault();
    (e.currentTarget as Element).setPointerCapture(e.pointerId);
    const p = worldPoint(e);
    checkpoint();
    drag.current = {
      type: "resize",
      id: selected.id,
      handle,
      ox: p.x,
      oy: p.y,
      snapshot: structuredClone(selected),
    };
  };

  const updateSelected = (patch: Partial<BoardShape>) => {
    if (!selectedId) return;
    checkpoint();
    onChange(shapes.map((s) => (s.id === selectedId ? { ...s, ...patch } : s)));
  };

  const removeSelected = () => {
    if (!selectedId) return;
    checkpoint();
    onChange(shapes.filter((s) => s.id !== selectedId));
    setSelectedId(null);
  };

  const updateChartRow = (
    index: number,
    field: "label" | "value",
    raw: string,
  ) => {
    if (!selected?.chart) return;
    const labels = [...selected.chart.labels];
    const values = [...selected.chart.values];
    if (field === "label") labels[index] = raw;
    else values[index] = Number(raw) || 0;
    updateSelected({ chart: { ...selected.chart, labels, values } });
  };

  const renderOpts = {
    selectedId,
    toolIsSelect: tool.type === "select",
    active: true,
    markerPrefix: "board",
    textColor: stroke,
    onPointerDown: startMove,
    onLabelBlur: (id: string, text: string) => {
      checkpoint();
      onChange(shapes.map((s) => (s.id === id ? { ...s, text } : s)));
    },
  };

  const handles: Handle[] = selected && !isLineKind(selected.kind)
    ? ["nw", "n", "ne", "e", "se", "s", "sw", "w"]
    : [];

  const handlePos = (h: Handle) => {
    if (!selected) return { x: 0, y: 0 };
    const { x, y, w, h: hh } = selected;
    const map: Record<Handle, { x: number; y: number }> = {
      nw: { x, y },
      n: { x: x + w / 2, y },
      ne: { x: x + w, y },
      e: { x: x + w, y: y + hh / 2 },
      se: { x: x + w, y: y + hh },
      s: { x: x + w / 2, y: y + hh },
      sw: { x, y: y + hh },
      w: { x, y: y + hh / 2 },
    };
    return map[h];
  };

  const empty = shapes.length === 0 && strokes.length === 0;
  const zoomPct = Math.round(camera.zoom * 100);

  return (
    <div className="board-editor board-editor-pro">
      <header className="editor-header board-header-slim">
        <input
          className="page-title-input"
          value={title}
          onChange={(e) => onTitleChange(e.target.value)}
          placeholder="Board adı"
          aria-label="Board başlığı"
        />
        <span className="board-zoom-badge">{zoomPct}%</span>
      </header>

      <div className={`board-workspace ${libOpen ? "" : "lib-collapsed"}`}>
        <aside
          className={`board-lib ${libOpen ? "" : "collapsed"}`}
          aria-label="Şekil kütüphanesi"
        >
          {libOpen && (
            <>
              <div className="board-lib-tabs">
                {BOARD_LIB_TABS.map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    className={`board-lib-tab ${libTab === t.id ? "active" : ""}`}
                    onClick={() => setLibTab(t.id)}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
              <div className="board-lib-grid">
                {tabTools.map((item) => (
                  <Tip key={item.key} label={item.label}>
                    <button
                      type="button"
                      className={`board-lib-item ${
                        tool.type === "shape" && tool.item.key === item.key
                          ? "active"
                          : ""
                      }`}
                      onClick={() => {
                        setTool({ type: "shape", item });
                        if (item.lineStyle) setLineStyle(item.lineStyle);
                        if (item.arrowEnds) setArrowEnds(item.arrowEnds);
                        if (item.fill) setFill(item.fill);
                      }}
                    >
                      <span className="board-lib-glyph" data-kind={item.id} />
                      <span>{item.label}</span>
                    </button>
                  </Tip>
                ))}
              </div>
            </>
          )}
        </aside>

        <div className="board-main">
          <div className="board-toolbar board-toolbar-slim" role="toolbar">
            <div className="swatches" title="Dolgu">
              {FILLS.map((c) => (
                <Tip
                  key={c}
                  label={c === "transparent" ? "Dolgusuz" : `Dolgu ${c}`}
                >
                  <button
                    type="button"
                    className={`swatch ${fill === c ? "active" : ""} ${c === "transparent" ? "swatch-none" : ""}`}
                    style={{
                      background: c === "transparent" ? "transparent" : c,
                    }}
                    onClick={() => {
                      setFill(c);
                      if (selected && !isLineKind(selected.kind)) {
                        updateSelected({ fill: c });
                      }
                    }}
                    aria-label={
                      c === "transparent" ? "Dolgusuz" : `Dolgu ${c}`
                    }
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
            <select
              className="board-style-select"
              value={
                selected?.lineStyle ??
                (tool.type === "shape"
                  ? tool.item.lineStyle ?? lineStyle
                  : lineStyle)
              }
              onChange={(e) => {
                const v = e.target.value as BoardLineStyle;
                setLineStyle(v);
                if (selected && isLineKind(selected.kind)) {
                  updateSelected({ lineStyle: v });
                }
              }}
              aria-label="Çizgi stili"
            >
              <option value="solid">Düz</option>
              <option value="dashed">Kesikli</option>
              <option value="dotted">Noktalı</option>
            </select>
            <select
              className="board-style-select"
              value={
                selected?.arrowEnds ??
                (tool.type === "shape"
                  ? tool.item.arrowEnds ?? arrowEnds
                  : arrowEnds)
              }
              onChange={(e) => {
                const v = e.target.value as BoardArrowEnds;
                setArrowEnds(v);
                if (selected && isLineKind(selected.kind)) {
                  updateSelected({ arrowEnds: v });
                }
              }}
              aria-label="Ok uçları"
            >
              <option value="none">Oksuz</option>
              <option value="end">Ok son</option>
              <option value="start">Ok baş</option>
              <option value="both">Çift ok</option>
            </select>
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
                onClick={() => {
                  checkpoint();
                  onChange([]);
                  onStrokesChange?.([]);
                }}
                aria-label="Temizle"
              >
                <IconTrash size={16} />
              </button>
            </Tip>
          </div>

          {selected && isChartKind(selected.kind) && selected.chart && (
            <div className="board-chart-editor">
              <strong>Chart verisi</strong>
              {selected.chart.values.map((v, i) => (
                <div key={i} className="board-chart-row">
                  <input
                    value={selected.chart!.labels[i] ?? ""}
                    onChange={(e) =>
                      updateChartRow(i, "label", e.target.value)
                    }
                    aria-label={`Etiket ${i + 1}`}
                  />
                  <input
                    type="number"
                    value={v}
                    onChange={(e) =>
                      updateChartRow(i, "value", e.target.value)
                    }
                    aria-label={`Değer ${i + 1}`}
                  />
                </div>
              ))}
            </div>
          )}

          <div
            ref={stageRef}
            className={`board-stage board-stage-pro ${panMode ? "panning" : ""}`}
          >
            <svg
              ref={svgRef}
              className={`board-svg ${
                tool.type === "shape" ? "drawing" : ""
              }`}
              onPointerDown={onBgPointerDown}
              onPointerMove={onPointerMove}
              onPointerUp={onPointerUp}
              onPointerCancel={onPointerUp}
            >
              <defs>
                <BoardArrowMarkers prefix="board" />
                <pattern
                  id="board-dots"
                  width="24"
                  height="24"
                  patternUnits="userSpaceOnUse"
                  patternTransform={`translate(${camera.x} ${camera.y}) scale(${camera.zoom})`}
                >
                  <circle cx="1.5" cy="1.5" r="1.1" fill="var(--board-dot)" />
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="var(--canvas)" />
              <rect width="100%" height="100%" fill="url(#board-dots)" />
              <g
                transform={`translate(${camera.x} ${camera.y}) scale(${camera.zoom})`}
              >
                {shapes.map((s) => renderBoardShape(s, renderOpts))}
                {preview &&
                  renderBoardShape(preview, { ...renderOpts, ghost: true })}
                {guides.v != null && (
                  <line
                    x1={guides.v}
                    y1={-5000}
                    x2={guides.v}
                    y2={5000}
                    stroke="#3B82F6"
                    strokeWidth={1 / camera.zoom}
                    strokeDasharray={`${4 / camera.zoom} ${4 / camera.zoom}`}
                    pointerEvents="none"
                  />
                )}
                {guides.h != null && (
                  <line
                    x1={-5000}
                    y1={guides.h}
                    x2={5000}
                    y2={guides.h}
                    stroke="#3B82F6"
                    strokeWidth={1 / camera.zoom}
                    strokeDasharray={`${4 / camera.zoom} ${4 / camera.zoom}`}
                    pointerEvents="none"
                  />
                )}
                {tool.type === "select" &&
                  handles.map((h) => {
                    const pos = handlePos(h);
                    const sz = 8 / camera.zoom;
                    return (
                      <rect
                        key={h}
                        className="board-handle"
                        x={pos.x - sz / 2}
                        y={pos.y - sz / 2}
                        width={sz}
                        height={sz}
                        fill="var(--panel-solid)"
                        stroke="var(--accent-select)"
                        strokeWidth={1.5 / camera.zoom}
                        onPointerDown={(ev) => startResize(ev, h)}
                      />
                    );
                  })}
              </g>
            </svg>
            <canvas
              ref={inkRef}
              className={`board-ink ${inkMode && !panMode ? "active" : ""}`}
              onPointerDown={onInkPointerDown}
              onPointerMove={onInkPointerMove}
              onPointerUp={onInkPointerUp}
              onPointerCancel={onInkPointerUp}
            />

            {empty && (
              <div className="board-empty" aria-hidden>
                <p className="board-empty-title">Boş board</p>
                <p className="board-empty-sub">
                  Kalemle çiz, yapışkan not ekle veya soldan şekil sürükle.
                </p>
                <div className="board-empty-actions">
                  <button
                    type="button"
                    onClick={() => setTool({ type: "pen" })}
                  >
                    Kalem
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      const sticky = BOARD_TOOLS.find((t) => t.id === "sticky");
                      if (sticky) setTool({ type: "shape", item: sticky });
                    }}
                  >
                    Yapışkan not
                  </button>
                  <button type="button" onClick={() => setLibOpen(true)}>
                    Şekiller
                  </button>
                </div>
              </div>
            )}

            <div className="board-float-bar" role="toolbar" aria-label="Board araçları">
              <Tip label="Seç (V)">
                <button
                  type="button"
                  className={tool.type === "select" ? "active" : ""}
                  onClick={() => setTool({ type: "select" })}
                >
                  <IconSelect size={18} />
                </button>
              </Tip>
              <Tip label="El / Kaydır (H, Space)">
                <button
                  type="button"
                  className={tool.type === "hand" || spaceDown ? "active" : ""}
                  onClick={() => setTool({ type: "hand" })}
                >
                  <IconHand size={18} />
                </button>
              </Tip>
              <Tip label="Kalem (P)">
                <button
                  type="button"
                  className={tool.type === "pen" ? "active" : ""}
                  onClick={() => setTool({ type: "pen" })}
                >
                  <IconPen size={18} />
                </button>
              </Tip>
              <Tip label="Silgi (E)">
                <button
                  type="button"
                  className={tool.type === "erase" ? "active" : ""}
                  onClick={() => setTool({ type: "erase" })}
                >
                  <IconEraser size={18} />
                </button>
              </Tip>
              <Tip label="Şekil kütüphanesi">
                <button
                  type="button"
                  className={
                    tool.type === "shape" || libOpen ? "active" : ""
                  }
                  onClick={() => {
                    setLibOpen((o) => !o);
                    if (!libOpen) {
                      const rect = BOARD_TOOLS.find((t) => t.id === "rect");
                      if (rect) setTool({ type: "shape", item: rect });
                    }
                  }}
                >
                  <IconShapes size={18} />
                </button>
              </Tip>
              <span className="board-float-sep" />
              <Tip label="Geri al (Ctrl+Z)">
                <button
                  type="button"
                  onClick={undo}
                  disabled={!history.current.canUndo()}
                  key={`u-${histTick}`}
                >
                  <IconUndo size={18} />
                </button>
              </Tip>
              <Tip label="Yinele (Ctrl+Y)">
                <button
                  type="button"
                  onClick={redo}
                  disabled={!history.current.canRedo()}
                  key={`r-${histTick}`}
                >
                  <IconRedo size={18} />
                </button>
              </Tip>
              <span className="board-float-sep" />
              <Tip label="Uzaklaştır">
                <button
                  type="button"
                  onClick={() =>
                    setCamera((c) => zoomAt(c, 400, 300, c.zoom / 1.15))
                  }
                >
                  <IconZoomOut size={18} />
                </button>
              </Tip>
              <button
                type="button"
                className="board-float-zoom"
                onClick={() => setCamera(resetCamera())}
                title="Zoom sıfırla (Ctrl+0)"
              >
                {zoomPct}%
              </button>
              <Tip label="Yakınlaştır">
                <button
                  type="button"
                  onClick={() =>
                    setCamera((c) => zoomAt(c, 400, 300, c.zoom * 1.15))
                  }
                >
                  <IconZoomIn size={18} />
                </button>
              </Tip>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
