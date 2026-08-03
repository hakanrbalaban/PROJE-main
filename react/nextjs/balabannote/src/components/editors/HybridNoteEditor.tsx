"use client";

import {
  IconArrow,
  IconBallpoint,
  IconBold,
  IconBrush,
  IconChevronDown,
  IconChevronUp,
  IconClose,
  IconComment,
  IconDiamond,
  IconEllipse,
  IconEraser,
  IconFountain,
  IconFormula,
  IconHexagon,
  IconHighlighter,
  IconIndent,
  IconItalic,
  IconLine,
  IconChartBar,
  IconChartPie,
  IconChartLine,
  IconCloud,
  IconStar,
  IconConnector,
  IconList,
  IconListCheck,
  IconListOrdered,
  IconMarker,
  IconOutdent,
  IconPen,
  IconPencil,
  IconRect,
  IconSearch,
  IconSelect,
  IconShapes,
  IconSticky,
  IconText,
  IconTrash,
  IconTriangle,
  IconType,
  IconWidth,
} from "@/components/Icons";
import { Tip } from "@/components/Tip";
import { FormulaDialog } from "@/components/FormulaDialog";
import { FontPicker } from "@/components/FontPicker";
import { InsertExtras } from "@/components/InsertExtras";
import { FormulaLayer } from "@/components/editors/FormulaLayer";
import {
  NoteDiagramLayer,
  deleteSelectedShape,
  type DiagramTool,
} from "@/components/editors/NoteDiagramLayer";
import { createHistory } from "@/lib/history";
import { uid } from "@/lib/id";
import { wrapEmbedHtml } from "@/lib/embedShell";
import { useMediaEmbedControls } from "@/hooks/useMediaEmbedControls";
import {
  applyFindHighlights,
  clearFindMarks,
  htmlWithoutFindMarks,
} from "@/lib/pageFind";
import {
  appendStabilizedPoint,
  coalescedPointerSamples,
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
import type {
  BoardShape,
  InkStroke,
  NoteComment,
  NoteFormula,
  PagePattern,
  PenKind,
  Point,
} from "@/lib/types";
import {
  PAGE_BG_COLORS,
  PAGE_PATTERNS,
  PEN_PRESETS,
} from "@/lib/types";
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
  type ReactNode,
} from "react";

type Mode = "write" | "draw" | "shape" | "erase";
type InkTool = "pen" | "move";

function hitTestStroke(strokes: InkStroke[], x: number, y: number) {
  for (let i = strokes.length - 1; i >= 0; i--) {
    if (strokeHitTest(strokes[i], x, y)) return strokes[i].id;
  }
  return null;
}

function strokeBounds(s: InkStroke) {
  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;
  for (const p of s.points) {
    minX = Math.min(minX, p.x);
    minY = Math.min(minY, p.y);
    maxX = Math.max(maxX, p.x);
    maxY = Math.max(maxY, p.y);
  }
  const pad = Math.max(8, s.width);
  return {
    x: minX - pad,
    y: minY - pad,
    w: maxX - minX + pad * 2,
    h: maxY - minY + pad * 2,
  };
}

const COLOR_PRESETS = [
  "#0F2C3A",
  "#1A9B8E",
  "#2F6FED",
  "#C45B2A",
  "#7B5EA7",
  "#B4536A",
  "#1F7A3F",
  "#E2B714",
];

const SHAPE_FILLS = [
  "transparent",
  "#CCFBF1",
  "#DBEAFE",
  "#FEF3C7",
  "#FCE7F3",
  "#EDE9FE",
  "#FFFFFF",
];

type HybridNoteEditorProps = {
  pageId: string;
  title: string;
  content: string;
  strokes: InkStroke[];
  shapes: BoardShape[];
  formulas: NoteFormula[];
  comments: NoteComment[];
  bgColor: string;
  pattern: PagePattern;
  onTitleChange: (title: string) => void;
  onContentChange: (content: string) => void;
  onStrokesChange: (strokes: InkStroke[]) => void;
  onShapesChange: (shapes: BoardShape[]) => void;
  onFormulasChange: (formulas: NoteFormula[]) => void;
  onCommentsChange: (comments: NoteComment[]) => void;
  onThemeChange: (theme: { bgColor?: string; pattern?: PagePattern }) => void;
};

function runFmt(e: React.MouseEvent, cmd: string, value?: string) {
  e.preventDefault();
  document.execCommand(cmd, false, value);
}

function applyBlock(tag: string) {
  const block = tag.toLowerCase();
  // Chrome wants "h1", Firefox often wants "<h1>"
  if (!document.execCommand("formatBlock", false, block)) {
    document.execCommand("formatBlock", false, `<${block}>`);
  }
}

const TEXT_SIZES = [
  { id: "12px", label: "Küçük" },
  { id: "14px", label: "Normal" },
  { id: "16px", label: "Orta" },
  { id: "18px", label: "Büyük" },
  { id: "22px", label: "Daha büyük" },
  { id: "28px", label: "Çok büyük" },
] as const;

const BLOCK_STYLES = [
  { id: "p", label: "Paragraf" },
  { id: "h1", label: "Başlık 1" },
  { id: "h2", label: "Başlık 2" },
  { id: "h3", label: "Başlık 3" },
  { id: "h4", label: "Başlık 4" },
  { id: "h5", label: "Başlık 5" },
  { id: "h6", label: "Başlık 6" },
  { id: "blockquote", label: "Alıntı" },
] as const;

function applyFontSize(size: string, root: HTMLElement | null) {
  if (!root) return;
  document.execCommand("styleWithCSS", false, "true");
  document.execCommand("fontSize", false, "7");
  const candidates = root.querySelectorAll(
    'font[size="7"], span[style*="xx-large"], span[style*="font-size: 36"], span[style*="font-size:36"]',
  );
  candidates.forEach((el) => {
    const span = document.createElement("span");
    span.style.fontSize = size;
    while (el.firstChild) span.appendChild(el.firstChild);
    el.replaceWith(span);
  });
}

function applyFontFamily(family: string, root: HTMLElement | null) {
  if (!root) return;
  document.execCommand("styleWithCSS", false, "true");
  document.execCommand("fontName", false, family);
  root.querySelectorAll("font[face]").forEach((el) => {
    const span = document.createElement("span");
    span.style.fontFamily = family;
    while (el.firstChild) span.appendChild(el.firstChild);
    el.replaceWith(span);
  });
}

const TEXT_HIGHLIGHTS = [
  { id: "yellow", color: "#fde047", label: "Sarı" },
  { id: "lime", color: "#bef264", label: "Yeşil" },
  { id: "cyan", color: "#67e8f9", label: "Cyan" },
  { id: "pink", color: "#f9a8d4", label: "Pembe" },
  { id: "orange", color: "#fdba74", label: "Turuncu" },
  { id: "violet", color: "#c4b5fd", label: "Mor" },
] as const;

function removeHighlightsInSelection(root: HTMLElement) {
  const sel = window.getSelection();
  if (!sel || sel.rangeCount === 0) return;
  const range = sel.getRangeAt(0);
  if (!root.contains(range.commonAncestorContainer)) return;

  const marks = root.querySelectorAll("mark.bn-highlight");
  marks.forEach((mark) => {
    if (!range.intersectsNode(mark)) return;
    const parent = mark.parentNode;
    if (!parent) return;
    while (mark.firstChild) parent.insertBefore(mark.firstChild, mark);
    parent.removeChild(mark);
    parent.normalize();
  });
}

function applyTextHighlight(color: string, root: HTMLElement | null) {
  if (!root) return;
  const sel = window.getSelection();
  if (!sel || sel.rangeCount === 0 || sel.isCollapsed) return;
  const range = sel.getRangeAt(0);
  if (!root.contains(range.commonAncestorContainer)) return;

  // Önce seçimdeki eski highlight'ları aç
  removeHighlightsInSelection(root);

  const mark = document.createElement("mark");
  mark.className = "bn-highlight";
  mark.dataset.hl = color;
  mark.style.setProperty("--bn-hl", color);

  try {
    range.surroundContents(mark);
  } catch {
    const frag = range.extractContents();
    mark.appendChild(frag);
    range.insertNode(mark);
  }

  sel.removeAllRanges();
  const next = document.createRange();
  next.selectNodeContents(mark);
  sel.addRange(next);
}

function unwrapCommentMark(root: HTMLElement, id: string) {
  root.querySelectorAll(`mark.bn-cmt[data-cid="${CSS.escape(id)}"]`).forEach((mark) => {
    const parent = mark.parentNode;
    if (!parent) return;
    while (mark.firstChild) parent.insertBefore(mark.firstChild, mark);
    parent.removeChild(mark);
    parent.normalize();
  });
}

/** Seçili metni yorum işaretine sar; başarıda mark döner */
function applyCommentMark(root: HTMLElement | null, id: string): HTMLElement | null {
  if (!root) return null;
  const sel = window.getSelection();
  if (!sel || sel.rangeCount === 0 || sel.isCollapsed) return null;
  const range = sel.getRangeAt(0);
  if (!root.contains(range.commonAncestorContainer)) return null;

  // Zaten yorum içindeyse yeniden sarma
  const anc =
    range.commonAncestorContainer instanceof Element
      ? range.commonAncestorContainer
      : range.commonAncestorContainer.parentElement;
  if (anc?.closest("mark.bn-cmt")) return null;

  const mark = document.createElement("mark");
  mark.className = "bn-cmt";
  mark.dataset.cid = id;

  try {
    range.surroundContents(mark);
  } catch {
    const frag = range.extractContents();
    mark.appendChild(frag);
    range.insertNode(mark);
  }

  sel.removeAllRanges();
  return mark;
}

function restoreTextSelection(range: Range | null, root: HTMLElement | null) {
  if (!range || !root) return;
  root.focus();
  const sel = window.getSelection();
  if (!sel) return;
  sel.removeAllRanges();
  sel.addRange(range);
}

/** Strip Word/web paste backgrounds and heavy chrome so text sits on the page. */
function sanitizePasteHtml(html: string): string {
  const doc = new DOMParser().parseFromString(html, "text/html");
  doc.querySelectorAll("style, meta, link, script, xml, o\\:p").forEach((n) => n.remove());
  doc.body.querySelectorAll("*").forEach((el) => {
    const htmlEl = el as HTMLElement;
    htmlEl.removeAttribute("bgcolor");
    htmlEl.removeAttribute("background");
    htmlEl.removeAttribute("color");
    htmlEl.removeAttribute("face");
    htmlEl.removeAttribute("size");
    htmlEl.removeAttribute("class");
    htmlEl.removeAttribute("id");
    const style = htmlEl.getAttribute("style");
    if (!style) return;
    const kept: string[] = [];
    for (const part of style.split(";")) {
      const [rawProp, ...rest] = part.split(":");
      if (!rawProp || rest.length === 0) continue;
      const prop = rawProp.trim().toLowerCase();
      const value = rest.join(":").trim();
      if (!value) continue;
      if (
        prop.startsWith("background") ||
        prop === "color" ||
        prop.startsWith("mso-") ||
        prop === "font-family" ||
        prop === "letter-spacing" ||
        prop === "text-indent" ||
        prop === "margin" ||
        prop === "margin-left" ||
        prop === "margin-right" ||
        prop === "padding" ||
        prop === "border" ||
        prop === "border-left" ||
        prop === "border-right" ||
        prop === "border-top" ||
        prop === "border-bottom" ||
        prop === "box-shadow" ||
        prop === "width" ||
        prop === "height" ||
        prop === "max-width" ||
        prop === "min-width"
      ) {
        continue;
      }
      // Keep useful text styles only
      if (
        prop === "font-weight" ||
        prop === "font-style" ||
        prop === "font-size" ||
        prop === "text-decoration" ||
        prop === "vertical-align"
      ) {
        kept.push(`${prop}: ${value}`);
      }
    }
    if (kept.length) htmlEl.setAttribute("style", kept.join("; "));
    else htmlEl.removeAttribute("style");
  });
  return doc.body.innerHTML;
}

function insertChecklist(e: React.MouseEvent) {
  e.preventDefault();
  document.execCommand(
    "insertHTML",
    false,
    '<ul class="bn-checklist"><li><input type="checkbox" /> Görev</li></ul><p><br/></p>',
  );
}

export function HybridNoteEditor({
  pageId,
  title,
  content,
  strokes,
  shapes,
  formulas,
  comments,
  bgColor,
  pattern,
  onTitleChange,
  onContentChange,
  onStrokesChange,
  onShapesChange,
  onFormulasChange,
  onCommentsChange,
  onThemeChange,
}: HybridNoteEditorProps) {
  const textRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  /** Offscreen layer for committed strokes — avoids full redraw while inking. */
  const committedCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const committedDirty = useRef(true);
  const stageRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const drawing = useRef(false);
  const current = useRef<Point[]>([]);
  /** Predicted tip (not persisted) — keeps the ink head under the stylus. */
  const predictedTip = useRef<Point | null>(null);
  const stabilizer = useRef<StabilizerState>(createStabilizer());
  const rafId = useRef(0);
  const strokesRef = useRef(strokes);
  const savedRange = useRef<Range | null>(null);

  const rememberSelection = () => {
    const sel = window.getSelection();
    if (!sel || sel.rangeCount === 0) return;
    const node = sel.anchorNode;
    if (!node || !textRef.current?.contains(node)) return;
    savedRange.current = sel.getRangeAt(0).cloneRange();
  };

  const [mode, setMode] = useState<Mode>("write");
  const [inkTool, setInkTool] = useState<InkTool>("pen");
  const [selectedStrokeId, setSelectedStrokeId] = useState<string | null>(null);
  const [diagramSelectedId, setDiagramSelectedId] = useState<string | null>(
    null,
  );
  const [pen, setPen] = useState<PenKind>("fountain");
  const [color, setColor] = useState(COLOR_PRESETS[0]);
  const [widthScale, setWidthScale] = useState(1);
  const [penSpeed, setPenSpeed] = useState(() => {
    if (typeof window === "undefined") return 1;
    const raw = Number(localStorage.getItem("balaban-pen-speed"));
    return Number.isFinite(raw) && raw >= 0.35 && raw <= 1.75 ? raw : 1;
  });
  const penSpeedRef = useRef(penSpeed);
  penSpeedRef.current = penSpeed;
  const [shapeTool, setShapeTool] = useState<DiagramTool>("select");
  const [shapeFill, setShapeFill] = useState("transparent");
  const [shapeStroke, setShapeStroke] = useState(COLOR_PRESETS[0]);
  const [formulaOpen, setFormulaOpen] = useState(false);
  const [formulaEdit, setFormulaEdit] = useState<NoteFormula | null>(null);
  const [pageHeight, setPageHeight] = useState(900);
  const [findOpen, setFindOpen] = useState(false);
  const [findQuery, setFindQuery] = useState("");
  const [findCount, setFindCount] = useState(0);
  const [findIndex, setFindIndex] = useState(0);
  const [commentOpen, setCommentOpen] = useState<{
    id: string;
    draft: string;
    isNew: boolean;
    editing: boolean;
    x: number;
    y: number;
  } | null>(null);
  const [commentTip, setCommentTip] = useState<{
    text: string;
    x: number;
    y: number;
  } | null>(null);
  const findInputRef = useRef<HTMLInputElement>(null);
  const findIndexRef = useRef(0);
  const formulasRef = useRef(formulas);
  formulasRef.current = formulas;
  const commentsRef = useRef(comments);
  commentsRef.current = comments;
  const inkMove = useRef<{
    id: string;
    ox: number;
    oy: number;
    points: Point[];
    dx: number;
    dy: number;
  } | null>(null);
  const selectedStrokeIdRef = useRef<string | null>(null);
  const modeRef = useRef(mode);
  const inkToolRef = useRef(inkTool);
  const strokeHistory = useRef(createHistory<InkStroke[]>(50));

  strokesRef.current = strokes;
  selectedStrokeIdRef.current = selectedStrokeId;
  modeRef.current = mode;
  inkToolRef.current = inkTool;
  findIndexRef.current = findIndex;

  const pushStrokeUndo = useCallback(() => {
    strokeHistory.current.push(strokesRef.current);
  }, []);

  const undoStroke = useCallback(() => {
    const prev = strokeHistory.current.undo(strokesRef.current);
    if (prev) onStrokesChange(prev);
  }, [onStrokesChange]);

  const redoStroke = useCallback(() => {
    const next = strokeHistory.current.redo(strokesRef.current);
    if (next) onStrokesChange(next);
  }, [onStrokesChange]);

  const emitContent = useCallback(() => {
    const root = textRef.current;
    if (!root) return;
    onContentChange(htmlWithoutFindMarks(root));
    const alive = new Set(
      Array.from(root.querySelectorAll("mark.bn-cmt")).map(
        (n) => (n as HTMLElement).dataset.cid,
      ),
    );
    const next = commentsRef.current.filter((c) => alive.has(c.id));
    if (next.length !== commentsRef.current.length) {
      onCommentsChange(next);
    }
  }, [onContentChange, onCommentsChange]);

  const positionNearMark = useCallback((anchor: HTMLElement) => {
    const root = stageRef.current ?? textRef.current;
    if (!root) return { x: 24, y: 80 };
    const a = anchor.getBoundingClientRect();
    const r = root.getBoundingClientRect();
    return {
      x: Math.min(Math.max(8, a.left - r.left), Math.max(8, r.width - 280)),
      y: a.bottom - r.top + 8,
    };
  }, []);

  const openCommentEditor = useCallback(
    (id: string, isNew: boolean, anchor?: HTMLElement | null) => {
      const c = commentsRef.current.find((x) => x.id === id);
      const pos = anchor ? positionNearMark(anchor) : { x: 24, y: 80 };
      setCommentTip(null);
      setCommentOpen({
        id,
        draft: c?.text ?? "",
        isNew,
        editing: isNew,
        x: pos.x,
        y: pos.y,
      });
    },
    [positionNearMark],
  );

  const deleteCommentById = useCallback(
    (id: string) => {
      if (textRef.current) unwrapCommentMark(textRef.current, id);
      onCommentsChange(commentsRef.current.filter((c) => c.id !== id));
      const root = textRef.current;
      if (root) onContentChange(htmlWithoutFindMarks(root));
      setCommentOpen(null);
      setCommentTip(null);
    },
    [onCommentsChange, onContentChange],
  );

  const saveCommentDraft = useCallback(() => {
    if (!commentOpen) return;
    const text = commentOpen.draft.trim();
    if (!text) {
      deleteCommentById(commentOpen.id);
      return;
    }
    onCommentsChange(
      commentsRef.current.map((c) =>
        c.id === commentOpen.id
          ? { ...c, text, updatedAt: Date.now() }
          : c,
      ),
    );
    setCommentOpen((prev) =>
      prev
        ? { ...prev, draft: text, isNew: false, editing: false }
        : null,
    );
  }, [commentOpen, deleteCommentById, onCommentsChange]);

  const startCommentFromSelection = useCallback(() => {
    rememberSelection();
    restoreTextSelection(savedRange.current, textRef.current);
    const id = uid("cmt");
    const mark = applyCommentMark(textRef.current, id);
    if (!mark) return;
    const now = Date.now();
    onCommentsChange([
      ...commentsRef.current,
      { id, text: "", createdAt: now, updatedAt: now },
    ]);
    const root = textRef.current;
    if (root) onContentChange(htmlWithoutFindMarks(root));
    openCommentEditor(id, true, mark);
  }, [onCommentsChange, onContentChange, openCommentEditor]);

  useEffect(() => {
    const root = textRef.current;
    if (!root) return;
    root.querySelectorAll("mark.bn-cmt").forEach((node) => {
      const el = node as HTMLElement;
      const id = el.dataset.cid;
      const c = comments.find((x) => x.id === id);
      const tip = c?.text?.trim() || "";
      if (tip) el.setAttribute("data-tip", tip);
      else el.removeAttribute("data-tip");
    });
  }, [comments, content, pageId]);

  useMediaEmbedControls(textRef, mode === "write", emitContent);

  const runFind = useCallback(
    (query: string, index: number) => {
      const root = textRef.current;
      if (!root) return;
      const result = applyFindHighlights(root, query, index);
      setFindCount(result.count);
      setFindIndex(result.count === 0 ? 0 : result.active);
    },
    [],
  );

  const closeFind = useCallback(() => {
    setFindOpen(false);
    setFindQuery("");
    setFindCount(0);
    setFindIndex(0);
    if (textRef.current) clearFindMarks(textRef.current);
  }, []);

  const openFind = useCallback(() => {
    setFindOpen(true);
    setMode("write");
    requestAnimationFrame(() => {
      findInputRef.current?.focus();
      findInputRef.current?.select();
    });
  }, []);

  useEffect(() => {
    if (!findOpen) return;
    runFind(findQuery, 0);
  }, [findQuery, findOpen, runFind]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const mod = e.ctrlKey || e.metaKey;
      if (mod && e.key.toLowerCase() === "f") {
        e.preventDefault();
        openFind();
        return;
      }
      if (!findOpen) return;
      if (e.key === "Escape") {
        e.preventDefault();
        closeFind();
        return;
      }
      if (e.key === "Enter" && (e.target === findInputRef.current || mod)) {
        e.preventDefault();
        if (findCount === 0) return;
        const next = e.shiftKey
          ? findIndexRef.current - 1
          : findIndexRef.current + 1;
        runFind(findQuery, next);
      }
      if (mod && e.key.toLowerCase() === "g") {
        e.preventDefault();
        if (findCount === 0) return;
        const next = e.shiftKey
          ? findIndexRef.current - 1
          : findIndexRef.current + 1;
        runFind(findQuery, next);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [findOpen, findQuery, findCount, openFind, closeFind, runFind]);

  const growPage = useCallback(() => {
    const text = textRef.current;
    const scroll = scrollRef.current;
    if (!text) return;

    // text is position:absolute; inset:0 → scrollHeight ≈ clientHeight for short
    // content. Only grow when content actually overflows, or a formula sits low.
    const overflow = text.scrollHeight - text.clientHeight;
    let formulaBottom = 0;
    for (const f of formulasRef.current) {
      formulaBottom = Math.max(formulaBottom, f.y + 120);
    }
    const viewport = scroll?.clientHeight ?? 700;
    const floor = Math.max(900, viewport + 40);

    setPageHeight((h) => {
      let next = Math.max(h, floor);
      if (overflow > 8) next = Math.max(next, h + overflow + 200);
      if (formulaBottom + 160 > next) next = formulaBottom + 160;
      return Math.abs(next - h) > 8 ? next : h;
    });

    if (scroll && mode === "write" && overflow > 8) {
      const nearBottom =
        scroll.scrollTop + scroll.clientHeight > scroll.scrollHeight - 180;
      if (nearBottom) {
        requestAnimationFrame(() => {
          scroll.scrollTop = Math.max(
            0,
            scroll.scrollHeight - scroll.clientHeight,
          );
        });
      }
    }
  }, [mode]);

  useEffect(() => {
    setPageHeight(900);
    closeFind();
    setCommentOpen(null);
    setCommentTip(null);
  }, [pageId, closeFind]);

  useEffect(() => {
    if (!textRef.current) return;
    const next = content || "<p><br/></p>";
    const clean = htmlWithoutFindMarks(textRef.current);
    if (clean !== next) {
      textRef.current.innerHTML = next;
      if (findOpen && findQuery.trim()) {
        runFind(findQuery, findIndexRef.current);
      }
    }
    growPage();
  }, [pageId, content, growPage, findOpen, findQuery, runFind]);

  useEffect(() => {
    growPage();
  }, [formulas, growPage]);

  const insertFormula = (latex: string, displayMode: boolean) => {
    if (formulaEdit) {
      onFormulasChange(
        formulas.map((f) =>
          f.id === formulaEdit.id
            ? { ...f, latex, display: displayMode }
            : f,
        ),
      );
      setFormulaEdit(null);
      return;
    }
    const stage = stageRef.current?.getBoundingClientRect();
    // Align with writing margin / rule lines — no card offset
    const x = 66;
    const y = 48 + formulas.length * 40;
    onFormulasChange([
      ...formulas,
      {
        id: uid("fm"),
        latex,
        display: displayMode,
        scale: 1,
        x: Math.min(x, Math.max(24, (stage?.width ?? 400) - 160)),
        y: Math.min(y, Math.max(24, (stage?.height ?? 400) - 60)),
      },
    ]);
  };

  const redrawCommitted = useCallback((cssW: number, cssH: number, dpr: number) => {
    let off = committedCanvasRef.current;
    if (!off) {
      off = document.createElement("canvas");
      committedCanvasRef.current = off;
    }
    const bw = Math.floor(cssW * dpr);
    const bh = Math.floor(cssH * dpr);
    if (off.width !== bw || off.height !== bh) {
      off.width = bw;
      off.height = bh;
    }
    const ctx = off.getContext("2d");
    if (!ctx) return;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, cssW, cssH);

    const moving = inkMove.current;
    const selectedId = selectedStrokeIdRef.current;

    for (const s of strokesRef.current) {
      const pen = s.pen ?? "ballpoint";
      if (moving && s.id === moving.id) {
        const shifted: InkStroke = {
          ...s,
          pen,
          points: moving.points.map((pt) => ({
            ...pt,
            x: pt.x + moving.dx,
            y: pt.y + moving.dy,
          })),
        };
        drawStroke(ctx, shifted);
        const b = strokeBounds(shifted);
        ctx.save();
        ctx.strokeStyle = "rgba(26, 155, 142, 0.95)";
        ctx.lineWidth = 1.5;
        ctx.setLineDash([5, 4]);
        ctx.strokeRect(b.x, b.y, b.w, b.h);
        ctx.restore();
        continue;
      }
      drawStroke(ctx, { ...s, pen });
      if (s.id === selectedId) {
        const b = strokeBounds(s);
        ctx.save();
        ctx.strokeStyle = "rgba(26, 155, 142, 0.95)";
        ctx.lineWidth = 1.5;
        ctx.setLineDash([5, 4]);
        ctx.strokeRect(b.x, b.y, b.w, b.h);
        ctx.restore();
      }
    }
    committedDirty.current = false;
  }, []);

  const redraw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const dpr = window.devicePixelRatio || 1;
    const w = canvas.width / dpr;
    const h = canvas.height / dpr;

    // While dragging a stroke, committed layer must refresh each frame.
    if (inkMove.current) committedDirty.current = true;

    if (committedDirty.current || !committedCanvasRef.current) {
      redrawCommitted(w, h, dpr);
    }

    ctx.clearRect(0, 0, w, h);
    const off = committedCanvasRef.current;
    if (off) {
      ctx.save();
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.drawImage(off, 0, 0);
      ctx.restore();
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    if (
      current.current.length > 1 &&
      (mode === "draw" || mode === "erase") &&
      !(mode === "draw" && inkTool === "move")
    ) {
      if (mode === "draw") {
        const pts = current.current;
        const tip = predictedTip.current;
        if (tip) pts.push(tip);
        drawLiveStroke(ctx, {
          id: "live",
          points: pts,
          color,
          width: defaultWidthForPen(pen) * widthScale,
          pen,
        });
        if (tip) pts.pop();
      } else {
        ctx.save();
        ctx.strokeStyle = "rgba(15,44,58,0.18)";
        ctx.lineWidth = 16;
        ctx.lineCap = "round";
        ctx.lineJoin = "round";
        const pts = current.current;
        ctx.beginPath();
        ctx.moveTo(pts[0].x, pts[0].y);
        for (let i = 1; i < pts.length; i++) {
          ctx.lineTo(pts[i].x, pts[i].y);
        }
        ctx.stroke();
        ctx.restore();
      }
    }
  }, [color, pen, widthScale, mode, inkTool, redrawCommitted]);

  const scheduleRedraw = useCallback(() => {
    if (rafId.current) return;
    rafId.current = requestAnimationFrame(() => {
      rafId.current = 0;
      redraw();
    });
  }, [redraw]);

  useEffect(() => {
    const stage = stageRef.current;
    const canvas = canvasRef.current;
    if (!stage || !canvas) return;

    const resize = () => {
      const rect = stage.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      canvas.width = Math.floor(rect.width * dpr);
      canvas.height = Math.floor(rect.height * dpr);
      canvas.style.width = `${rect.width}px`;
      canvas.style.height = `${rect.height}px`;
      const ctx = canvas.getContext("2d");
      ctx?.setTransform(dpr, 0, 0, dpr, 0, 0);
      committedDirty.current = true;
      redraw();
    };

    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(stage);
    return () => {
      ro.disconnect();
      if (rafId.current) {
        cancelAnimationFrame(rafId.current);
        rafId.current = 0;
      }
    };
  }, [pageId, redraw, pageHeight]);

  useEffect(() => {
    committedDirty.current = true;
    scheduleRedraw();
  }, [strokes, selectedStrokeId, scheduleRedraw]);

  const localPoint = (e: ReactPointerEvent): Point => {
    const canvas = canvasRef.current!;
    const rect = canvas.getBoundingClientRect();
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
      p: estimatePressure(e),
    };
  };

  const ingestPointerSamples = useCallback(
    (native: PointerEvent) => {
      if (!drawing.current) return;
      if (modeRef.current === "draw" && inkToolRef.current === "move") return;
      if (modeRef.current !== "draw" && modeRef.current !== "erase") return;

      const canvas = canvasRef.current;
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();
      const samples = coalescedPointerSamples(native, rect);
      let changed = false;
      for (const sample of samples) {
        if (
          appendStabilizedPoint(
            current.current,
            sample,
            stabilizer.current,
            penSpeedRef.current,
          )
        ) {
          changed = true;
        }
      }

      const predictedEv = native as PointerEvent & {
        getPredictedEvents?: () => PointerEvent[];
      };
      const predicted =
        typeof predictedEv.getPredictedEvents === "function"
          ? predictedEv.getPredictedEvents()
          : [];
      if (predicted.length > 0) {
        const tip = predicted[predicted.length - 1];
        predictedTip.current = {
          x: tip.clientX - rect.left,
          y: tip.clientY - rect.top,
          p: estimatePressure(tip),
        };
        changed = true;
      } else {
        predictedTip.current = null;
      }

      if (changed) scheduleRedraw();
    },
    [scheduleRedraw],
  );

  // High-frequency stylus samples (Electron / Chromium) — OneNote-like density
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !("onpointerrawupdate" in window)) return;
    const onRaw = (e: Event) => {
      ingestPointerSamples(e as PointerEvent);
    };
    canvas.addEventListener("pointerrawupdate", onRaw);
    return () => canvas.removeEventListener("pointerrawupdate", onRaw);
  }, [ingestPointerSamples, pageId]);

  const onPointerDown = (e: ReactPointerEvent) => {
    if (mode !== "draw" && mode !== "erase") return;
    if (e.button !== 0) return;
    e.preventDefault();
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    const p = localPoint(e);

    if (mode === "draw" && inkTool === "move") {
      const id = hitTestStroke(strokesRef.current, p.x, p.y);
      setSelectedStrokeId(id);
      if (!id) {
        inkMove.current = null;
        committedDirty.current = true;
        scheduleRedraw();
        return;
      }
      const stroke = strokesRef.current.find((s) => s.id === id);
      if (!stroke) return;
      pushStrokeUndo();
      inkMove.current = {
        id,
        ox: p.x,
        oy: p.y,
        points: stroke.points.map((pt) => ({ ...pt })),
        dx: 0,
        dy: 0,
      };
      drawing.current = true;
      committedDirty.current = true;
      scheduleRedraw();
      return;
    }

    // Tap erase: remove stroke under cursor without dragging
    if (mode === "erase") {
      const id = hitTestStroke(strokesRef.current, p.x, p.y);
      if (id) {
        pushStrokeUndo();
        onStrokesChange(strokesRef.current.filter((s) => s.id !== id));
        return;
      }
    }

    drawing.current = true;
    current.current = [p];
    predictedTip.current = null;
    resetStabilizer(stabilizer.current, p);
    setSelectedStrokeId(null);
  };

  const onPointerMove = (e: ReactPointerEvent) => {
    if (!drawing.current) return;
    if (mode === "draw" && inkTool === "move" && inkMove.current) {
      const p = localPoint(e);
      const d = inkMove.current;
      d.dx = p.x - d.ox;
      d.dy = p.y - d.oy;
      scheduleRedraw();
      return;
    }
    // pointerrawupdate already feeds samples in Chromium/Electron
    if ("onpointerrawupdate" in window) return;
    ingestPointerSamples(e.nativeEvent);
  };

  const endStroke = () => {
    if (!drawing.current) return;
    drawing.current = false;
    predictedTip.current = null;

    if (mode === "draw" && inkTool === "move") {
      const d = inkMove.current;
      inkMove.current = null;
      if (d && (d.dx !== 0 || d.dy !== 0)) {
        onStrokesChange(
          strokesRef.current.map((s) =>
            s.id === d.id
              ? {
                  ...s,
                  points: d.points.map((pt) => ({
                    ...pt,
                    x: pt.x + d.dx,
                    y: pt.y + d.dy,
                  })),
                }
              : s,
          ),
        );
        return;
      }
      committedDirty.current = true;
      scheduleRedraw();
      return;
    }

    const pts = finalizeStrokePoints(current.current);
    current.current = [];
    if (pts.length < 2) {
      scheduleRedraw();
      return;
    }
    if (mode === "erase") {
      const next = strokesRef.current.filter(
        (s) => !strokeIntersectsEraser(s, pts, 16),
      );
      if (next.length !== strokesRef.current.length) {
        pushStrokeUndo();
        onStrokesChange(next);
      } else {
        scheduleRedraw();
      }
      return;
    }
    pushStrokeUndo();
    onStrokesChange([
      ...strokesRef.current,
      {
        id: uid("ink"),
        points: pts,
        color,
        width: defaultWidthForPen(pen) * widthScale,
        pen,
      },
    ]);
  };

  useEffect(() => {
    if (mode !== "draw" && mode !== "erase") {
      setSelectedStrokeId(null);
      setInkTool("pen");
    }
  }, [mode]);

  useEffect(() => {
    strokeHistory.current.clear();
  }, [pageId]);

  useEffect(() => {
    const desktop = window.balabanDesktop;
    if (!desktop?.onAppCommand) return;
    return desktop.onAppCommand((cmd) => {
      if (cmd === "undo") undoStroke();
      else if (cmd === "redo") redoStroke();
    });
  }, [undoStroke, redoStroke]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement | null;
      const typing =
        t &&
        (t.tagName === "INPUT" ||
          t.tagName === "TEXTAREA" ||
          t.isContentEditable);

      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "z" && !e.shiftKey) {
        if (typing) return;
        if (mode === "draw" || mode === "erase") {
          e.preventDefault();
          undoStroke();
          return;
        }
      }
      if (
        (e.ctrlKey || e.metaKey) &&
        (e.key.toLowerCase() === "y" ||
          (e.key.toLowerCase() === "z" && e.shiftKey))
      ) {
        if (typing) return;
        if (mode === "draw" || mode === "erase") {
          e.preventDefault();
          redoStroke();
          return;
        }
      }

      if (e.key !== "Delete" && e.key !== "Backspace") return;
      if (!selectedStrokeId || mode !== "draw" || inkTool !== "move") return;
      if (typing) return;
      e.preventDefault();
      pushStrokeUndo();
      onStrokesChange(strokesRef.current.filter((s) => s.id !== selectedStrokeId));
      setSelectedStrokeId(null);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [
    selectedStrokeId,
    mode,
    inkTool,
    onStrokesChange,
    undoStroke,
    redoStroke,
    pushStrokeUndo,
  ]);

  const pens = Object.keys(PEN_PRESETS) as PenKind[];
  const penIcons: Record<PenKind, ReactNode> = {
    pencil: <IconPencil size={16} />,
    ballpoint: <IconBallpoint size={16} />,
    fountain: <IconFountain size={16} />,
    marker: <IconMarker size={16} />,
    highlighter: <IconHighlighter size={16} />,
    brush: <IconBrush size={16} />,
  };
  const penTone: Record<PenKind, string> = {
    pencil: "tone-pencil",
    ballpoint: "tone-ball",
    fountain: "tone-fountain",
    marker: "tone-marker",
    highlighter: "tone-high",
    brush: "tone-brush",
  };

  const diagramTools: { id: DiagramTool; label: string; icon: ReactNode; tone: string }[] = [
    { id: "select", label: "Seç", icon: <IconSelect size={16} />, tone: "tone-select" },
    { id: "rect", label: "Kutu", icon: <IconRect size={16} />, tone: "tone-rect" },
    { id: "roundRect", label: "Yuvarlak kutu", icon: <IconRect size={16} />, tone: "tone-ellipse" },
    { id: "ellipse", label: "Oval", icon: <IconEllipse size={16} />, tone: "tone-ellipse" },
    { id: "diamond", label: "Elmas", icon: <IconDiamond size={16} />, tone: "tone-diamond" },
    { id: "triangle", label: "Üçgen", icon: <IconTriangle size={16} />, tone: "tone-marker" },
    { id: "hexagon", label: "Altıgen", icon: <IconHexagon size={16} />, tone: "tone-fountain" },
    { id: "parallelogram", label: "Paralelkenar", icon: <IconRect size={16} />, tone: "tone-arrow" },
    { id: "cylinder", label: "Silindir", icon: <IconEllipse size={16} />, tone: "tone-ellipse" },
    { id: "cloud", label: "Bulut", icon: <IconCloud size={16} />, tone: "tone-brush" },
    { id: "star", label: "Yıldız", icon: <IconStar size={16} />, tone: "tone-high" },
    { id: "callout", label: "Konuşma", icon: <IconComment size={16} />, tone: "tone-marker" },
    { id: "document", label: "Belge", icon: <IconRect size={16} />, tone: "tone-write" },
    { id: "process", label: "Süreç", icon: <IconRect size={16} />, tone: "tone-fountain" },
    { id: "sticky", label: "Yapışkan not", icon: <IconSticky size={16} />, tone: "tone-high" },
    { id: "arrow", label: "Ok", icon: <IconArrow size={16} />, tone: "tone-arrow" },
    { id: "line", label: "Çizgi", icon: <IconLine size={16} />, tone: "tone-line" },
    { id: "connector", label: "Elbow", icon: <IconConnector size={16} />, tone: "tone-arrow" },
    { id: "text", label: "Metin", icon: <IconText size={16} />, tone: "tone-write" },
    { id: "chartBar", label: "Bar chart", icon: <IconChartBar size={16} />, tone: "tone-rect" },
    { id: "chartPie", label: "Pie chart", icon: <IconChartPie size={16} />, tone: "tone-diamond" },
    { id: "chartLine", label: "Line chart", icon: <IconChartLine size={16} />, tone: "tone-line" },
  ];

  return (
    <div className="hybrid-editor">
      <header className="editor-header">
        <div className="editor-header-row">
          <input
            className="page-title-input"
            value={title}
            onChange={(e) => onTitleChange(e.target.value)}
            placeholder="Başlıksız sayfa"
            aria-label="Sayfa başlığı"
          />
          <Tip label="Sayfada ara (Ctrl+F)">
            <button
              type="button"
              className={`icon-tool ${findOpen ? "active" : ""}`}
              onClick={() => (findOpen ? closeFind() : openFind())}
              aria-label="Sayfada ara"
            >
              <IconSearch size={16} />
            </button>
          </Tip>
        </div>
        {findOpen && (
          <div className="page-find-bar" role="search">
            <input
              ref={findInputRef}
              className="page-find-input"
              value={findQuery}
              onChange={(e) => {
                setFindQuery(e.target.value);
                setFindIndex(0);
              }}
              placeholder="Sayfada bul…"
              aria-label="Sayfada bul"
            />
            <span className="page-find-count">
              {findQuery.trim()
                ? findCount === 0
                  ? "0 / 0"
                  : `${findIndex + 1} / ${findCount}`
                : "—"}
            </span>
            <Tip label="Önceki (Shift+Enter)">
              <button
                type="button"
                className="icon-tool"
                disabled={findCount === 0}
                onClick={() => runFind(findQuery, findIndex - 1)}
                aria-label="Önceki eşleşme"
              >
                <IconChevronUp size={16} />
              </button>
            </Tip>
            <Tip label="Sonraki (Enter)">
              <button
                type="button"
                className="icon-tool"
                disabled={findCount === 0}
                onClick={() => runFind(findQuery, findIndex + 1)}
                aria-label="Sonraki eşleşme"
              >
                <IconChevronDown size={16} />
              </button>
            </Tip>
            <Tip label="Kapat (Esc)">
              <button
                type="button"
                className="icon-tool"
                onClick={closeFind}
                aria-label="Aramayı kapat"
              >
                <IconClose size={16} />
              </button>
            </Tip>
          </div>
        )}
        <p className="editor-sub">
          Formülleri listeden seç, sürükle; kalemle üzerine çiz. · Ctrl+F sayfada ara
        </p>
      </header>

      <div className="hybrid-toolbar" role="toolbar" aria-label="Not araçları">
        <div className="mode-switch" role="group" aria-label="Mod">
          <Tip label="Yaz">
            <button
              type="button"
              className={`icon-tool tone-write ${mode === "write" ? "active" : ""}`}
              onClick={() => setMode("write")}
              aria-label="Yaz"
            >
              <IconType size={16} />
            </button>
          </Tip>
          <Tip label="Kalem">
            <button
              type="button"
              className={`icon-tool tone-pen ${mode === "draw" ? "active" : ""}`}
              onClick={() => setMode("draw")}
              aria-label="Kalem"
            >
              <IconPen size={16} />
            </button>
          </Tip>
          <Tip label="Diyagram">
            <button
              type="button"
              className={`icon-tool tone-fountain ${mode === "shape" ? "active" : ""}`}
              onClick={() => setMode("shape")}
              aria-label="Diyagram"
            >
              <IconShapes size={16} />
            </button>
          </Tip>
          <Tip label="Silgi">
            <button
              type="button"
              className={`icon-tool tone-erase ${mode === "erase" ? "active" : ""}`}
              onClick={() => setMode("erase")}
              aria-label="Silgi"
            >
              <IconEraser size={16} />
            </button>
          </Tip>
        </div>

        {mode === "write" && (
          <div className="format-group wrap">
            <label className="page-theme-select">
              <span>Stil</span>
              <select
                defaultValue="p"
                aria-label="Yazı stili"
                onFocus={rememberSelection}
                onMouseDown={rememberSelection}
                onChange={(e) => {
                  restoreTextSelection(savedRange.current, textRef.current);
                  applyBlock(e.target.value);
                  if (textRef.current) emitContent();
                }}
              >
                {BLOCK_STYLES.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.label}
                  </option>
                ))}
              </select>
            </label>
            <label className="page-theme-select">
              <span>Boyut</span>
              <select
                defaultValue="14px"
                aria-label="Yazı boyutu"
                onFocus={rememberSelection}
                onMouseDown={rememberSelection}
                onChange={(e) => {
                  restoreTextSelection(savedRange.current, textRef.current);
                  applyFontSize(e.target.value, textRef.current);
                  if (textRef.current) emitContent();
                }}
              >
                {TEXT_SIZES.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.label}
                  </option>
                ))}
              </select>
            </label>
            <FontPicker
              onRememberSelection={rememberSelection}
              onPick={(family) => {
                restoreTextSelection(savedRange.current, textRef.current);
                applyFontFamily(family, textRef.current);
                if (textRef.current) emitContent();
              }}
            />
            <span className="toolbar-sep" />
            <Tip label="Kalın">
              <button type="button" className="icon-tool" aria-label="Kalın" onMouseDown={(e) => runFmt(e, "bold")}>
                <IconBold size={16} />
              </button>
            </Tip>
            <Tip label="İtalik">
              <button type="button" className="icon-tool" aria-label="İtalik" onMouseDown={(e) => runFmt(e, "italic")}>
                <IconItalic size={16} />
              </button>
            </Tip>
            <div className="text-highlight-group" role="group" aria-label="Vurgu">
              <Tip label="Vurgu (metin seç)">
                <span className="text-highlight-label">
                  <IconHighlighter size={15} />
                </span>
              </Tip>
              {TEXT_HIGHLIGHTS.map((h) => (
                <Tip key={h.id} label={`Vurgu: ${h.label}`}>
                  <button
                    type="button"
                    className="hl-swatch"
                    style={{ background: h.color }}
                    aria-label={`Vurgu ${h.label}`}
                    onMouseDown={(e) => {
                      e.preventDefault();
                      rememberSelection();
                      restoreTextSelection(savedRange.current, textRef.current);
                      applyTextHighlight(h.color, textRef.current);
                      emitContent();
                    }}
                  />
                </Tip>
              ))}
              <Tip label="Vurguları kaldır">
                <button
                  type="button"
                  className="icon-tool hl-clear"
                  aria-label="Vurguları kaldır"
                  onMouseDown={(e) => {
                    e.preventDefault();
                    rememberSelection();
                    restoreTextSelection(savedRange.current, textRef.current);
                    if (textRef.current) removeHighlightsInSelection(textRef.current);
                    emitContent();
                  }}
                >
                  <IconClose size={14} />
                </button>
              </Tip>
            </div>
            <Tip label="Yorum ekle (metin seç)">
              <button
                type="button"
                className="icon-tool tone-write"
                aria-label="Yorum ekle"
                onMouseDown={(e) => {
                  e.preventDefault();
                  startCommentFromSelection();
                }}
              >
                <IconComment size={16} />
              </button>
            </Tip>
            <span className="toolbar-sep" />
            <Tip label="Madde listesi">
              <button type="button" className="icon-tool tone-pen" aria-label="Madde" onMouseDown={(e) => runFmt(e, "insertUnorderedList")}>
                <IconList size={16} />
              </button>
            </Tip>
            <Tip label="Numaralı liste">
              <button type="button" className="icon-tool tone-write" aria-label="Numaralı" onMouseDown={(e) => runFmt(e, "insertOrderedList")}>
                <IconListOrdered size={16} />
              </button>
            </Tip>
            <Tip label="Kontrol listesi">
              <button type="button" className="icon-tool tone-brush" aria-label="Checklist" onMouseDown={insertChecklist}>
                <IconListCheck size={16} />
              </button>
            </Tip>
            <span className="toolbar-sep" />
            <Tip label="Girinti azalt">
              <button type="button" className="icon-tool" aria-label="Outdent" onMouseDown={(e) => runFmt(e, "outdent")}>
                <IconOutdent size={16} />
              </button>
            </Tip>
            <Tip label="Girinti artır">
              <button type="button" className="icon-tool" aria-label="Indent" onMouseDown={(e) => runFmt(e, "indent")}>
                <IconIndent size={16} />
              </button>
            </Tip>
            <span className="toolbar-sep" />
            <Tip label="Formül (LaTeX)">
              <button
                type="button"
                className="icon-tool tone-fountain"
                aria-label="Formül"
                onMouseDown={(e) => {
                  e.preventDefault();
                  setFormulaEdit(null);
                  setFormulaOpen(true);
                }}
              >
                <IconFormula size={16} />
              </button>
            </Tip>
            <span className="toolbar-sep" />
            <InsertExtras
              onRememberSelection={rememberSelection}
              onInsertHtml={(html) => {
                restoreTextSelection(savedRange.current, textRef.current);
                textRef.current?.focus();
                document.execCommand("insertHTML", false, html);
                emitContent();
                growPage();
              }}
              onInsertText={(text) => {
                restoreTextSelection(savedRange.current, textRef.current);
                textRef.current?.focus();
                document.execCommand("insertText", false, text);
                emitContent();
              }}
            />
            <span className="toolbar-sep" />
            <div className="page-theme-group" role="group" aria-label="Sayfa görünümü">
              <label className="page-theme-select">
                <span>Desen</span>
                <select
                  value={pattern}
                  onChange={(e) =>
                    onThemeChange({ pattern: e.target.value as PagePattern })
                  }
                  aria-label="Sayfa deseni"
                >
                  {PAGE_PATTERNS.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.label}
                    </option>
                  ))}
                </select>
              </label>
              <label className="page-theme-select">
                <span>Renk</span>
                <select
                  value={
                    PAGE_BG_COLORS.some((c) => c.value === bgColor)
                      ? bgColor
                      : "__custom__"
                  }
                  onChange={(e) => {
                    if (e.target.value === "__custom__") return;
                    onThemeChange({ bgColor: e.target.value });
                  }}
                  aria-label="Sayfa rengi"
                >
                  {PAGE_BG_COLORS.map((c) => (
                    <option key={c.value} value={c.value}>
                      {c.label}
                    </option>
                  ))}
                  {!PAGE_BG_COLORS.some((c) => c.value === bgColor) && (
                    <option value="__custom__">Özel ({bgColor})</option>
                  )}
                </select>
              </label>
              <Tip label="Özel renk">
                <label className="color-picker-wrap">
                  <input
                    type="color"
                    value={
                      bgColor.startsWith("#") && bgColor.length <= 7
                        ? bgColor
                        : "#F7F9FB"
                    }
                    onChange={(e) => onThemeChange({ bgColor: e.target.value })}
                    aria-label="Özel arka plan rengi"
                  />
                </label>
              </Tip>
            </div>
          </div>
        )}

        {(mode === "draw" || mode === "erase") && (
          <>
            <div className="pen-group">
              <Tip label="Seç / taşı / sil">
                <button
                  type="button"
                  className={`icon-tool tone-select ${mode === "draw" && inkTool === "move" ? "active" : ""}`}
                  onClick={() => {
                    setMode("draw");
                    setInkTool("move");
                  }}
                  aria-label="Çizim seç ve taşı"
                >
                  <IconSelect size={16} />
                </button>
              </Tip>
              {pens.map((p) => (
                <Tip key={p} label={PEN_PRESETS[p].label}>
                  <button
                    type="button"
                    className={`icon-tool pen-chip ${penTone[p]} ${pen === p && mode === "draw" && inkTool === "pen" ? "active" : ""}`}
                    onClick={() => {
                      setPen(p);
                      setMode("draw");
                      setInkTool("pen");
                    }}
                    aria-label={PEN_PRESETS[p].label}
                  >
                    {penIcons[p]}
                  </button>
                </Tip>
              ))}
            </div>
            <div className="swatches">
              {COLOR_PRESETS.map((c) => (
                <Tip key={c} label={`Renk ${c}`}>
                  <button
                    type="button"
                    className={`swatch ${color === c ? "active" : ""}`}
                    style={{ background: c }}
                    onClick={() => {
                      setColor(c);
                      setMode("draw");
                    }}
                    aria-label={`Renk ${c}`}
                  />
                </Tip>
              ))}
              <Tip label="Özel renk">
                <label className="color-picker-wrap">
                  <input
                    type="color"
                    value={color}
                    onChange={(e) => {
                      setColor(e.target.value);
                      setMode("draw");
                    }}
                    aria-label="Özel kalem rengi"
                  />
                </label>
              </Tip>
            </div>
            <label className="width-slider" title="Kalınlık">
              <IconWidth size={14} />
              <input
                type="range"
                min={0.6}
                max={2.4}
                step={0.1}
                value={widthScale}
                onChange={(e) => setWidthScale(Number(e.target.value))}
                aria-label="Kalem kalınlığı"
              />
            </label>
            <label className="width-slider pen-speed-slider" title="Yazma hızı / yanıt">
              <span className="pen-speed-label">Hız</span>
              <input
                type="range"
                min={0.35}
                max={1.75}
                step={0.05}
                value={penSpeed}
                onChange={(e) => {
                  const v = Number(e.target.value);
                  setPenSpeed(v);
                  try {
                    localStorage.setItem("balaban-pen-speed", String(v));
                  } catch {
                    /* ignore */
                  }
                }}
                aria-label="Kalem yazma hızı"
              />
            </label>
            <Tip label="Seçilen çizimi sil">
              <button
                type="button"
                className="icon-tool tool-btn danger"
                disabled={!selectedStrokeId}
                onClick={() => {
                  if (!selectedStrokeId) return;
                  onStrokesChange(
                    strokes.filter((s) => s.id !== selectedStrokeId),
                  );
                  setSelectedStrokeId(null);
                }}
                aria-label="Seçilen çizimi sil"
              >
                <IconClose size={16} />
              </button>
            </Tip>
            <Tip label="Çizimleri temizle">
              <button
                type="button"
                className="icon-tool tool-btn danger"
                onClick={() => {
                  onStrokesChange([]);
                  setSelectedStrokeId(null);
                }}
                aria-label="Çizimleri temizle"
              >
                <IconTrash size={16} />
              </button>
            </Tip>
          </>
        )}

        {mode === "shape" && (
          <>
            <div className="pen-group wrap">
              {diagramTools.map((t) => (
                <Tip key={t.id} label={t.label}>
                  <button
                    type="button"
                    className={`icon-tool ${t.tone} ${shapeTool === t.id ? "active" : ""}`}
                    onClick={() => setShapeTool(t.id)}
                    aria-label={t.label}
                  >
                    {t.icon}
                  </button>
                </Tip>
              ))}
            </div>
            <div className="swatches" title="Dolgu">
              {SHAPE_FILLS.map((c) => (
                <Tip key={c} label={c === "transparent" ? "Dolgusuz" : "Dolgu"}>
                  <button
                    type="button"
                    className={`swatch ${shapeFill === c ? "active" : ""} ${c === "transparent" ? "swatch-none" : ""}`}
                    style={{ background: c === "transparent" ? "transparent" : c }}
                    onClick={() => setShapeFill(c)}
                    aria-label={c === "transparent" ? "Dolgusuz" : `Dolgu ${c}`}
                  />
                </Tip>
              ))}
            </div>
            <div className="swatches" title="Çizgi">
              {COLOR_PRESETS.map((c) => (
                <Tip key={c} label="Kenarlık">
                  <button
                    type="button"
                    className={`swatch ${shapeStroke === c ? "active" : ""}`}
                    style={{ background: c }}
                    onClick={() => setShapeStroke(c)}
                    aria-label={`Kenarlık ${c}`}
                  />
                </Tip>
              ))}
            </div>
            <Tip label="Seçileni sil">
              <button
                type="button"
                className="icon-tool tool-btn danger"
                disabled={!diagramSelectedId}
                onClick={() => {
                  onShapesChange(
                    deleteSelectedShape(shapes, diagramSelectedId),
                  );
                  setDiagramSelectedId(null);
                }}
                aria-label="Seçilen şekli sil"
              >
                <IconClose size={16} />
              </button>
            </Tip>
            <Tip label="Diyagramı temizle">
              <button
                type="button"
                className="icon-tool tool-btn danger"
                onClick={() => {
                  onShapesChange([]);
                  setDiagramSelectedId(null);
                }}
                aria-label="Diyagramı temizle"
              >
                <IconTrash size={16} />
              </button>
            </Tip>
          </>
        )}
      </div>

      <div ref={scrollRef} className="hybrid-scroll">
        <div
          ref={stageRef}
          className={`hybrid-stage mode-${mode} pattern-${pattern}`}
          style={{ minHeight: pageHeight, backgroundColor: bgColor }}
          data-dark={bgColor.toLowerCase() === "#1e293b" ? "true" : undefined}
        >
          <div
            ref={textRef}
            className="hybrid-text"
            contentEditable={mode === "write"}
            suppressContentEditableWarning
            onClick={(e) => {
              if (mode !== "write") return;
              const t = e.target as HTMLElement | null;
              const mark = t?.closest?.("mark.bn-cmt") as HTMLElement | null;
              if (!mark || !textRef.current?.contains(mark)) return;
              const id = mark.dataset.cid;
              if (!id) return;
              e.preventDefault();
              openCommentEditor(id, false, mark);
            }}
            onMouseOver={(e) => {
              if (mode !== "write" || commentOpen) return;
              const t = e.target as HTMLElement | null;
              const mark = t?.closest?.("mark.bn-cmt") as HTMLElement | null;
              if (!mark || !textRef.current?.contains(mark)) return;
              const tip = mark.getAttribute("data-tip")?.trim();
              if (!tip) return;
              const root = stageRef.current ?? textRef.current;
              if (!root) return;
              const a = mark.getBoundingClientRect();
              const r = root.getBoundingClientRect();
              setCommentTip({
                text: tip,
                x: Math.min(
                  Math.max(8, a.left - r.left),
                  Math.max(8, r.width - 200),
                ),
                y: a.top - r.top - 6,
              });
            }}
            onMouseOut={(e) => {
              const related = e.relatedTarget as HTMLElement | null;
              if (related?.closest?.("mark.bn-cmt")) return;
              setCommentTip(null);
            }}
            onInput={() => {
              if (textRef.current) {
                emitContent();
                if (findOpen && findQuery.trim()) {
                  runFind(findQuery, findIndexRef.current);
                }
                growPage();
              }
            }}
            onPaste={(e) => {
              if (mode !== "write") return;
              const items = Array.from(e.clipboardData?.items ?? []);
              const imageItem = items.find(
                (it) => it.kind === "file" && it.type.startsWith("image/"),
              );
              if (imageItem) {
                e.preventDefault();
                const file = imageItem.getAsFile();
                if (!file) return;
                const body = new FormData();
                body.append("file", file, file.name || "paste.png");
                void fetch("/api/media", { method: "POST", body })
                  .then(async (res) => {
                    const data = (await res.json()) as {
                      url?: string;
                      id?: string;
                      name?: string;
                      error?: string;
                    };
                    if (!res.ok || !data.url || !data.id) {
                      throw new Error(data.error || "Yapıştırma başarısız");
                    }
                    const html = wrapEmbedHtml(
                      "image",
                      `<img class="bn-media bn-media-img" src="${data.url}" alt="${data.name || "görsel"}" data-media-id="${data.id}" />`,
                    );
                    document.execCommand("insertHTML", false, html);
                    emitContent();
                    growPage();
                  })
                  .catch((err) => {
                    console.error(err);
                  });
                return;
              }
              e.preventDefault();
              const html = e.clipboardData.getData("text/html");
              const plain = e.clipboardData.getData("text/plain");
              if (html.trim()) {
                document.execCommand("insertHTML", false, sanitizePasteHtml(html));
              } else {
                document.execCommand("insertText", false, plain);
              }
              if (textRef.current) {
                emitContent();
                if (findOpen && findQuery.trim()) {
                  runFind(findQuery, findIndexRef.current);
                }
                growPage();
              }
            }}
            onKeyUp={growPage}
            data-placeholder="Yazmaya başla… Sayfa alta doğru sınırsız uzar."
          />
          <FormulaLayer
            formulas={formulas}
            interactive={mode === "write"}
            onChange={onFormulasChange}
            onEdit={(f) => {
              setFormulaEdit(f);
              setFormulaOpen(true);
              setMode("write");
            }}
          />
          <canvas
            ref={canvasRef}
            className="hybrid-ink"
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={endStroke}
            onPointerCancel={endStroke}
          />
          <NoteDiagramLayer
            shapes={shapes}
            tool={shapeTool}
            fill={shapeFill}
            stroke={shapeStroke}
            active={mode === "shape"}
            onChange={onShapesChange}
            onToolChange={setShapeTool}
            onSelectedChange={setDiagramSelectedId}
          />
          {commentTip && !commentOpen && (
            <div
              className="bn-cmt-tip"
              style={{ left: commentTip.x, top: commentTip.y }}
              role="tooltip"
            >
              {commentTip.text}
            </div>
          )}
          {commentOpen && (
            <div
              className="bn-cmt-popover"
              style={{ left: commentOpen.x, top: commentOpen.y }}
              onMouseDown={(e) => e.stopPropagation()}
            >
              <div className="bn-cmt-popover-label">Yorum</div>
              {commentOpen.editing ? (
                <textarea
                  className="bn-cmt-popover-input"
                  rows={3}
                  autoFocus
                  value={commentOpen.draft}
                  placeholder="Yorumunu yaz…"
                  onChange={(e) =>
                    setCommentOpen((prev) =>
                      prev ? { ...prev, draft: e.target.value } : prev,
                    )
                  }
                  onKeyDown={(e) => {
                    if (e.key === "Escape") {
                      e.preventDefault();
                      if (commentOpen.isNew) {
                        deleteCommentById(commentOpen.id);
                      } else {
                        const c = commentsRef.current.find(
                          (x) => x.id === commentOpen.id,
                        );
                        setCommentOpen((prev) =>
                          prev
                            ? {
                                ...prev,
                                draft: c?.text ?? prev.draft,
                                editing: false,
                              }
                            : prev,
                        );
                      }
                    }
                    if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
                      e.preventDefault();
                      saveCommentDraft();
                    }
                  }}
                />
              ) : (
                <p className="bn-cmt-popover-body">
                  {commentOpen.draft.trim() || "Boş yorum"}
                </p>
              )}
              <div className="bn-cmt-popover-actions">
                <button
                  type="button"
                  className="bn-cmt-btn danger"
                  onClick={() => deleteCommentById(commentOpen.id)}
                >
                  Sil
                </button>
                {commentOpen.editing ? (
                  <>
                    <button
                      type="button"
                      className="bn-cmt-btn"
                      onClick={() => {
                        if (commentOpen.isNew) {
                          deleteCommentById(commentOpen.id);
                          return;
                        }
                        const c = commentsRef.current.find(
                          (x) => x.id === commentOpen.id,
                        );
                        setCommentOpen((prev) =>
                          prev
                            ? {
                                ...prev,
                                draft: c?.text ?? prev.draft,
                                editing: false,
                              }
                            : prev,
                        );
                      }}
                    >
                      İptal
                    </button>
                    <button
                      type="button"
                      className="bn-cmt-btn primary"
                      onClick={saveCommentDraft}
                    >
                      Kaydet
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      type="button"
                      className="bn-cmt-btn"
                      onClick={() => setCommentOpen(null)}
                    >
                      Kapat
                    </button>
                    <button
                      type="button"
                      className="bn-cmt-btn primary"
                      onClick={() =>
                        setCommentOpen((prev) =>
                          prev ? { ...prev, editing: true } : prev,
                        )
                      }
                    >
                      Edit
                    </button>
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      <FormulaDialog
        open={formulaOpen}
        initialLatex={formulaEdit?.latex ?? ""}
        initialDisplay={formulaEdit?.display ?? true}
        onClose={() => {
          setFormulaOpen(false);
          setFormulaEdit(null);
        }}
        onInsert={insertFormula}
      />
    </div>
  );
}
