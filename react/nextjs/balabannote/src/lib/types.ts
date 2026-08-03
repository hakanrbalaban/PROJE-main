export type PageKind = "note" | "board" | "todo";

/** Legacy kind kept only for migration from older localStorage payloads */
export type LegacyPageKind = PageKind | "ink";

export type PenKind =
  | "pencil"
  | "ballpoint"
  | "fountain"
  | "marker"
  | "highlighter"
  | "brush";

export type Point = {
  x: number;
  y: number;
  /** 0–1 pressure / speed-derived intensity */
  p?: number;
};

export type InkStroke = {
  id: string;
  points: Point[];
  color: string;
  width: number;
  pen: PenKind;
};

export type BoardShapeKind =
  | "rect"
  | "roundRect"
  | "ellipse"
  | "diamond"
  | "triangle"
  | "hexagon"
  | "parallelogram"
  | "cylinder"
  | "cloud"
  | "star"
  | "callout"
  | "document"
  | "process"
  | "arrow"
  | "line"
  | "connector"
  | "text"
  | "sticky"
  | "chartBar"
  | "chartPie"
  | "chartLine";

export type BoardLineStyle = "solid" | "dashed" | "dotted";
export type BoardArrowEnds = "none" | "end" | "start" | "both";

export type BoardChartData = {
  labels: string[];
  values: number[];
  colors?: string[];
};

export type BoardShape = {
  id: string;
  kind: BoardShapeKind;
  x: number;
  y: number;
  w: number;
  h: number;
  fill: string;
  stroke: string;
  strokeWidth: number;
  text?: string;
  x2?: number;
  y2?: number;
  lineStyle?: BoardLineStyle;
  arrowEnds?: BoardArrowEnds;
  /** Elbow connector mid points (absolute coords) */
  points?: { x: number; y: number }[];
  chart?: BoardChartData;
};

export type TodoItem = {
  id: string;
  text: string;
  done: boolean;
  createdAt: number;
  /** Accent color for the card */
  color?: string;
};

export const TODO_COLORS = [
  "#14B8A6",
  "#3B82F6",
  "#F59E0B",
  "#EC4899",
  "#8B5CF6",
  "#EF4444",
  "#22C55E",
  "#06B6D4",
] as const;


export type PagePattern =
  | "lined"
  | "grid"
  | "dots"
  | "graph"
  | "margin"
  | "none";

export type NoteComment = {
  id: string;
  text: string;
  createdAt: number;
  updatedAt: number;
};

export type NotePage = {
  id: string;
  notebookId: string;
  title: string;
  kind: PageKind;
  updatedAt: number;
  content?: string;
  strokes?: InkStroke[];
  shapes?: BoardShape[];
  formulas?: NoteFormula[];
  comments?: NoteComment[];
  todos?: TodoItem[];
  /** Notion-style favorite / OneNote pin */
  pinned?: boolean;
  /** Soft-deleted → recycle bin */
  deletedAt?: number;
  /** Note paper background */
  bgColor?: string;
  pattern?: PagePattern;
};

export const PAGE_PATTERNS: { id: PagePattern; label: string }[] = [
  { id: "lined", label: "Çizgili" },
  { id: "margin", label: "Kenarlı çizgili" },
  { id: "grid", label: "Kareli" },
  { id: "graph", label: "Grafik kâğıdı" },
  { id: "dots", label: "Noktalı" },
  { id: "none", label: "Düz (desensiz)" },
];

export const PAGE_BG_COLORS: { value: string; label: string }[] = [
  { value: "#F7F9FB", label: "Bulut gri" },
  { value: "#FFFFFF", label: "Beyaz" },
  { value: "#FFF9F0", label: "Krem" },
  { value: "#F0F7F4", label: "Nane" },
  { value: "#F3F0FF", label: "Lavanta" },
  { value: "#FFF1F2", label: "Pudra" },
  { value: "#EEF6FF", label: "Buz mavisi" },
  { value: "#1E293B", label: "Gece" },
];

export type NoteFormula = {
  id: string;
  latex: string;
  display: boolean;
  x: number;
  y: number;
  /** Visual scale relative to base size (default 1) */
  scale?: number;
};

export type Notebook = {
  id: string;
  title: string;
  color: string;
  createdAt: number;
  /** Soft-deleted → recycle bin */
  deletedAt?: number;
};

export type Workspace = {
  notebooks: Notebook[];
  pages: NotePage[];
  activeNotebookId: string | null;
  activePageId: string | null;
};

export const PEN_PRESETS: Record<
  PenKind,
  {
    label: string;
    baseWidth: number;
    opacity: number;
    minScale: number;
    maxScale: number;
    tip: CanvasLineCap;
  }
> = {
  pencil: {
    label: "Kurşun",
    baseWidth: 1.55,
    opacity: 0.78,
    minScale: 0.92,
    maxScale: 1.08,
    tip: "round",
  },
  ballpoint: {
    label: "Tükenmez",
    baseWidth: 1.9,
    opacity: 1,
    minScale: 0.96,
    maxScale: 1.04,
    tip: "round",
  },
  fountain: {
    label: "Dolma",
    baseWidth: 2.35,
    opacity: 0.96,
    minScale: 0.72,
    maxScale: 1.28,
    tip: "round",
  },
  marker: {
    label: "Keçeli",
    baseWidth: 5.2,
    opacity: 0.9,
    minScale: 0.95,
    maxScale: 1.05,
    tip: "round",
  },
  highlighter: {
    label: "Fosfor",
    baseWidth: 14,
    opacity: 0.28,
    minScale: 0.98,
    maxScale: 1.02,
    tip: "butt",
  },
  brush: {
    label: "Fırça",
    baseWidth: 6.5,
    opacity: 0.86,
    minScale: 0.65,
    maxScale: 1.35,
    tip: "round",
  },
};
