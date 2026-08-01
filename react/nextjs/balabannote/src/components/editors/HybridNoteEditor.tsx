"use client";

import {
  IconArrow,
  IconBallpoint,
  IconBold,
  IconBrush,
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
  IconList,
  IconListCheck,
  IconListOrdered,
  IconMarker,
  IconOutdent,
  IconPen,
  IconPencil,
  IconRect,
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
import { FormulaLayer } from "@/components/editors/FormulaLayer";
import {
  NoteDiagramLayer,
  type DiagramTool,
} from "@/components/editors/NoteDiagramLayer";
import { uid } from "@/lib/id";
import {
  appendSmoothedPoint,
  defaultWidthForPen,
  drawLiveStroke,
  drawStroke,
  estimatePressure,
  finalizeStrokePoints,
} from "@/lib/pen";
import type {
  BoardShape,
  InkStroke,
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
  bgColor: string;
  pattern: PagePattern;
  onTitleChange: (title: string) => void;
  onContentChange: (content: string) => void;
  onStrokesChange: (strokes: InkStroke[]) => void;
  onShapesChange: (shapes: BoardShape[]) => void;
  onFormulasChange: (formulas: NoteFormula[]) => void;
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
  bgColor,
  pattern,
  onTitleChange,
  onContentChange,
  onStrokesChange,
  onShapesChange,
  onFormulasChange,
  onThemeChange,
}: HybridNoteEditorProps) {
  const textRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const drawing = useRef(false);
  const current = useRef<Point[]>([]);
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
  const [pen, setPen] = useState<PenKind>("fountain");
  const [color, setColor] = useState(COLOR_PRESETS[0]);
  const [widthScale, setWidthScale] = useState(1);
  const [shapeTool, setShapeTool] = useState<DiagramTool>("select");
  const [shapeFill, setShapeFill] = useState("transparent");
  const [shapeStroke, setShapeStroke] = useState(COLOR_PRESETS[0]);
  const [formulaOpen, setFormulaOpen] = useState(false);
  const [formulaEdit, setFormulaEdit] = useState<NoteFormula | null>(null);
  const [pageHeight, setPageHeight] = useState(900);
  const formulasRef = useRef(formulas);
  formulasRef.current = formulas;

  strokesRef.current = strokes;

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
  }, [pageId]);

  useEffect(() => {
    if (!textRef.current) return;
    if (textRef.current.innerHTML !== content) {
      textRef.current.innerHTML = content || "<p><br/></p>";
    }
    growPage();
  }, [pageId, content, growPage]);

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

  const redraw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const w = canvas.width / (window.devicePixelRatio || 1);
    const h = canvas.height / (window.devicePixelRatio || 1);
    ctx.clearRect(0, 0, w, h);

    for (const s of strokesRef.current) {
      drawStroke(ctx, { ...s, pen: s.pen ?? "ballpoint" });
    }

    if (current.current.length > 1 && (mode === "draw" || mode === "erase")) {
      if (mode === "draw") {
        drawLiveStroke(ctx, {
          id: "live",
          points: current.current,
          color,
          width: defaultWidthForPen(pen) * widthScale,
          pen,
        });
      } else {
        ctx.save();
        ctx.strokeStyle = "rgba(15,44,58,0.18)";
        ctx.lineWidth = 16;
        ctx.lineCap = "round";
        ctx.lineJoin = "round";
        const preview = finalizeStrokePoints(current.current);
        ctx.beginPath();
        ctx.moveTo(preview[0].x, preview[0].y);
        for (let i = 1; i < preview.length; i++) {
          ctx.lineTo(preview[i].x, preview[i].y);
        }
        ctx.stroke();
        ctx.restore();
      }
    }
  }, [color, pen, widthScale, mode]);

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
      redraw();
    };

    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(stage);
    return () => ro.disconnect();
  }, [pageId, redraw, pageHeight]);

  useEffect(() => {
    redraw();
  }, [strokes, redraw]);

  const localPoint = (e: ReactPointerEvent): Point => {
    const canvas = canvasRef.current!;
    const rect = canvas.getBoundingClientRect();
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
      p: estimatePressure(e),
    };
  };

  const onPointerDown = (e: ReactPointerEvent) => {
    if (mode !== "draw" && mode !== "erase") return;
    e.preventDefault();
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    drawing.current = true;
    current.current = [localPoint(e)];
  };

  const onPointerMove = (e: ReactPointerEvent) => {
    if (!drawing.current || (mode !== "draw" && mode !== "erase")) return;
    current.current = appendSmoothedPoint(current.current, localPoint(e));
    redraw();
  };

  const endStroke = () => {
    if (!drawing.current) return;
    drawing.current = false;
    const pts = finalizeStrokePoints(current.current);
    current.current = [];
    if (pts.length < 2) {
      redraw();
      return;
    }
    if (mode === "erase") {
      onStrokesChange(
        strokesRef.current.filter(
          (s) =>
            !s.points.some((p) =>
              pts.some((ep) => Math.hypot(p.x - ep.x, p.y - ep.y) < 16),
            ),
        ),
      );
      return;
    }
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
    { id: "sticky", label: "Yapışkan not", icon: <IconSticky size={16} />, tone: "tone-high" },
    { id: "arrow", label: "Ok", icon: <IconArrow size={16} />, tone: "tone-arrow" },
    { id: "line", label: "Çizgi", icon: <IconLine size={16} />, tone: "tone-line" },
    { id: "text", label: "Metin", icon: <IconText size={16} />, tone: "tone-write" },
  ];

  return (
    <div className="hybrid-editor">
      <header className="editor-header">
        <input
          className="page-title-input"
          value={title}
          onChange={(e) => onTitleChange(e.target.value)}
          placeholder="Başlıksız sayfa"
          aria-label="Sayfa başlığı"
        />
        <p className="editor-sub">
          Formülleri listeden seç, sürükle; kalemle üzerine çiz.
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
                  if (textRef.current) onContentChange(textRef.current.innerHTML);
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
                  if (textRef.current) onContentChange(textRef.current.innerHTML);
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
                if (textRef.current) onContentChange(textRef.current.innerHTML);
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
              {pens.map((p) => (
                <Tip key={p} label={PEN_PRESETS[p].label}>
                  <button
                    type="button"
                    className={`icon-tool pen-chip ${penTone[p]} ${pen === p && mode === "draw" ? "active" : ""}`}
                    onClick={() => {
                      setPen(p);
                      setMode("draw");
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
            <Tip label="Çizimleri temizle">
              <button
                type="button"
                className="icon-tool tool-btn danger"
                onClick={() => onStrokesChange([])}
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
            <Tip label="Diyagramı temizle">
              <button
                type="button"
                className="icon-tool tool-btn danger"
                onClick={() => onShapesChange([])}
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
            onInput={() => {
              if (textRef.current) {
                onContentChange(textRef.current.innerHTML);
                growPage();
              }
            }}
            onPaste={(e) => {
              if (mode !== "write") return;
              e.preventDefault();
              const html = e.clipboardData.getData("text/html");
              const plain = e.clipboardData.getData("text/plain");
              if (html.trim()) {
                document.execCommand("insertHTML", false, sanitizePasteHtml(html));
              } else {
                document.execCommand("insertText", false, plain);
              }
              if (textRef.current) {
                onContentChange(textRef.current.innerHTML);
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
          />
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
