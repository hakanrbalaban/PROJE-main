import type {
  BoardShape,
  BoardShapeKind,
  NoteFormula,
  PageKind,
  PagePattern,
  TodoItem,
} from "@/lib/types";
import type { TemplateMeta, TemplatePagePayload } from "./types";

type Rng = () => number;

function mulberry32(seed: number): Rng {
  let t = seed >>> 0;
  return () => {
    t += 0x6d2b79f5;
    let r = Math.imul(t ^ (t >>> 15), 1 | t);
    r ^= r + Math.imul(r ^ (r >>> 7), 61 | r);
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
  };
}

function pick<T>(rng: Rng, arr: readonly T[]): T {
  return arr[Math.floor(rng() * arr.length)]!;
}

function int(rng: Rng, min: number, max: number) {
  return min + Math.floor(rng() * (max - min + 1));
}

function jitter(rng: Rng, base: number, span: number) {
  return base + (rng() - 0.5) * 2 * span;
}

function clamp(n: number, lo: number, hi: number) {
  return Math.max(lo, Math.min(hi, n));
}

/** HSL → hex */
function hsl(h: number, s: number, l: number): string {
  h = ((h % 360) + 360) % 360;
  s = clamp(s, 0, 100) / 100;
  l = clamp(l, 0, 100) / 100;
  const c = (1 - Math.abs(2 * l - 1)) * s;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = l - c / 2;
  let r = 0,
    g = 0,
    b = 0;
  if (h < 60) [r, g, b] = [c, x, 0];
  else if (h < 120) [r, g, b] = [x, c, 0];
  else if (h < 180) [r, g, b] = [0, c, x];
  else if (h < 240) [r, g, b] = [0, x, c];
  else if (h < 300) [r, g, b] = [x, 0, c];
  else [r, g, b] = [c, 0, x];
  const toHex = (v: number) =>
    Math.round((v + m) * 255)
      .toString(16)
      .padStart(2, "0");
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

type Palette = {
  accent: string;
  accent2: string;
  accent3: string;
  fill: string;
  fill2: string;
  fill3: string;
  fill4: string;
  bg: string;
  ink: string;
  soft: string;
};

/**
 * Her şablon için tek, uyumlu karışım — sabit renk listesi yok.
 * Hue şablona özel; analog / triad / split varyasyonları rastgele.
 */
function harmoniousPalette(rng: Rng, uniqueHue: number): Palette {
  const mode = pick(rng, ["analog", "split", "triad", "complement"] as const);
  const s = 48 + rng() * 28;
  const l = 38 + rng() * 16;
  let h2 = uniqueHue;
  let h3 = uniqueHue;
  if (mode === "analog") {
    h2 = uniqueHue + 18 + rng() * 22;
    h3 = uniqueHue - 18 - rng() * 22;
  } else if (mode === "split") {
    h2 = uniqueHue + 150 + rng() * 20;
    h3 = uniqueHue - 150 - rng() * 20;
  } else if (mode === "triad") {
    h2 = uniqueHue + 120;
    h3 = uniqueHue + 240;
  } else {
    h2 = uniqueHue + 180 + (rng() - 0.5) * 16;
    h3 = uniqueHue + 40 + rng() * 30;
  }

  return {
    accent: hsl(uniqueHue, s, l),
    accent2: hsl(h2, s - 4, l + 6),
    accent3: hsl(h3, s - 8, l + 2),
    fill: hsl(uniqueHue, 42, 90),
    fill2: hsl(h2, 40, 88),
    fill3: hsl(h3, 38, 89),
    fill4: hsl(uniqueHue + 55, 36, 91),
    bg: hsl(uniqueHue, 28, 97),
    ink: hsl(uniqueHue, 35, 18),
    soft: hsl(uniqueHue, 18, 42),
  };
}

const PATTERNS: PagePattern[] = [
  "lined",
  "grid",
  "dots",
  "graph",
  "margin",
  "none",
];

type LayoutKind =
  | "flow"
  | "mind"
  | "swot"
  | "kanban"
  | "timeline"
  | "org"
  | "cycle"
  | "compare"
  | "cluster"
  | "pyramid"
  | "matrix"
  | "hub"
  | "steps"
  | "funnel"
  | "gridcards";

type CategoryDef = {
  category: string;
  tags: string[];
  kinds: PageKind[];
  layouts: LayoutKind[];
  nouns: string[];
  verbs: string[];
  description: string;
};

const CATEGORIES: CategoryDef[] = [
  {
    category: "Toplantı",
    tags: ["toplantı", "ajanda", "aksiyon"],
    kinds: ["note", "board"],
    layouts: ["flow", "steps", "hub", "cluster"],
    nouns: ["Senkron", "Briefing", "Kickoff", "Review", "Karar", "Ajanda", "Müşteri", "Standup"],
    verbs: ["özeti", "notları", "planı", "akışı", "defteri", "haritası"],
    description: "Toplantı ajandası ve aksiyon diyagramı",
  },
  {
    category: "Ders",
    tags: ["ders", "çalışma", "özet"],
    kinds: ["note", "board"],
    layouts: ["mind", "pyramid", "cluster", "hub"],
    nouns: ["Konu", "Ünite", "Modül", "Sınav", "Okuma", "Özet", "Formül", "Teori"],
    verbs: ["haritası", "notu", "iskeleti", "kartı", "şeması", "defteri"],
    description: "Ders özeti ve konu diyagramı",
  },
  {
    category: "Proje",
    tags: ["proje", "plan", "milestone"],
    kinds: ["board", "note"],
    layouts: ["timeline", "funnel", "org", "matrix"],
    nouns: ["Proje", "Milestone", "Teslim", "Kapsam", "Risk", "Faz", "Paket", "Epic"],
    verbs: ["panosu", "yolu", "matrisı", "şeması", "çizelgesi", "planı"],
    description: "Proje planı ve milestone diyagramı",
  },
  {
    category: "Günlük",
    tags: ["günlük", "journal", "reflekt"],
    kinds: ["note", "todo"],
    layouts: ["compare", "gridcards", "cluster"],
    nouns: ["Sabah", "Akşam", "Gün", "Hafta", "Enerji", "Odak", "Ruh hali", "Alışkanlık"],
    verbs: ["günlüğü", "planı", "yansıması", "takibi", "listesi", "notu"],
    description: "Günlük yazı ve takip şablonu",
  },
  {
    category: "Brainstorm",
    tags: ["fikir", "brainstorm", "yaratıclık"],
    kinds: ["board"],
    layouts: ["mind", "cluster", "hub", "gridcards"],
    nouns: ["Fikir", "İlham", "Problem", "Çözüm", "Hipotez", "Konsept", "Sketch", "Insight"],
    verbs: ["fırtınası", "ağacı", "bulutu", "panosu", "ağı", "haritası"],
    description: "Brainstorm ve fikir ağı",
  },
  {
    category: "SWOT",
    tags: ["swot", "analiz", "strateji"],
    kinds: ["board"],
    layouts: ["swot", "matrix", "compare"],
    nouns: ["SWOT", "Rekabet", "Strateji", "Pazar", "Ürün", "Risk", "Fırsat", "Konum"],
    verbs: ["analizi", "matrisı", "panosu", "taraması", "haritası"],
    description: "Strateji / SWOT diyagramı",
  },
  {
    category: "Kanban",
    tags: ["kanban", "iş akışı", "agile"],
    kinds: ["board", "todo"],
    layouts: ["kanban", "steps", "funnel"],
    nouns: ["Kanban", "Pipeline", "Triage", "Backlog", "Sprint", "Akış", "Kuyruk", "Board"],
    verbs: ["panosu", "sütunları", "akışı", "listesi", "şeması"],
    description: "İş akışı / kanban panosu",
  },
  {
    category: "Timeline",
    tags: ["timeline", "roadmap", "zaman"],
    kinds: ["board", "note"],
    layouts: ["timeline", "steps", "funnel"],
    nouns: ["Yol haritası", "Takvim", "Çeyrek", "Launch", "Kampanya", "Sezon", "Program", "Serüven"],
    verbs: ["çizelgesi", "yolu", "planı", "akışı", "haritası"],
    description: "Zaman çizelgesi / roadmap",
  },
  {
    category: "Sprint",
    tags: ["sprint", "scrum", "retro"],
    kinds: ["note", "board", "todo"],
    layouts: ["cycle", "kanban", "compare", "steps"],
    nouns: ["Sprint", "Retro", "Review", "Kapasite", "DoD", "Planning", "Burn", "Velocity"],
    verbs: ["planı", "notları", "panosu", "özeti", "kartı"],
    description: "Sprint / agile şablonu",
  },
  {
    category: "Checklist",
    tags: ["todo", "checklist", "görev"],
    kinds: ["todo"],
    layouts: ["gridcards"],
    nouns: ["Kontrol", "Lansman", "Hazırlık", "Paket", "Kalite", "Seyahat", "Alışveriş", "Rutin"],
    verbs: ["listesi", "checklisti", "kontrolü", "paketi", "görevleri"],
    description: "Görev / checklist",
  },
  {
    category: "Finans",
    tags: ["finans", "bütçe", "maliyet"],
    kinds: ["note", "board"],
    layouts: ["compare", "pyramid", "matrix", "funnel"],
    nouns: ["Bütçe", "Gider", "Gelir", "ROI", "Nakit", "Fiyat", "Maliyet", "Yatırım"],
    verbs: ["özeti", "takibi", "analizı", "tablosu", "şeması", "planı"],
    description: "Finans ve bütçe şablonu",
  },
  {
    category: "Bilim",
    tags: ["bilim", "formül", "lab"],
    kinds: ["note", "board"],
    layouts: ["flow", "hub", "pyramid", "steps"],
    nouns: ["Deney", "Lab", "Hipotez", "Ölçüm", "Model", "Formül", "Veri", "Sonuç"],
    verbs: ["defteri", "planı", "şeması", "kartı", "akışı", "panosu"],
    description: "Bilim / lab notu",
  },
  {
    category: "Organizasyon",
    tags: ["org", "ekip", "yapı"],
    kinds: ["board"],
    layouts: ["org", "hub", "pyramid", "matrix"],
    nouns: ["Organizasyon", "Rol", "RACI", "Ekip", "Birim", "Ağ", "Hiyerarşi", "Sorumluluk"],
    verbs: ["şeması", "haritası", "panosu", "diyagramı", "yapısı"],
    description: "Organizasyon / rol diyagramı",
  },
  {
    category: "Süreç",
    tags: ["süreç", "akış", "flowchart"],
    kinds: ["board"],
    layouts: ["flow", "steps", "funnel", "cycle"],
    nouns: ["Süreç", "Onay", "Yolculuk", "Destek", "Üretim", "İşlem", "Pipeline", "Protokol"],
    verbs: ["akışı", "şeması", "diyagramı", "haritası", "adımları"],
    description: "Süreç / akış diyagramı",
  },
  {
    category: "OKR",
    tags: ["okr", "hedef", "kpi"],
    kinds: ["note", "board"],
    layouts: ["pyramid", "hub", "matrix", "cluster"],
    nouns: ["OKR", "Hedef", "KPI", "Metrik", "Başarı", "Çeyrek", "Sonuç", "Gösterge"],
    verbs: ["panosu", "kırılımı", "kartı", "ağacı", "matrisı"],
    description: "Hedef / OKR şablonu",
  },
  {
    category: "Araştırma",
    tags: ["araştırma", "insight", "user"],
    kinds: ["note", "board"],
    layouts: ["mind", "cluster", "compare", "hub"],
    nouns: ["Araştırma", "Görüşme", "Persona", "Insight", "Literatür", "Bulgu", "Kanıt", "Soru"],
    verbs: ["özeti", "panosu", "notu", "haritası", "defteri"],
    description: "Araştırma ve insight şablonu",
  },
  {
    category: "Sunum",
    tags: ["sunum", "pitch", "outline"],
    kinds: ["note", "board"],
    layouts: ["steps", "timeline", "pyramid", "funnel"],
    nouns: ["Pitch", "Sunum", "Demo", "Hikâye", "Slayt", "Senaryo", "Outline", "Anlatı"],
    verbs: ["iskeleti", "akışı", "planı", "özeti", "şeması"],
    description: "Sunum / pitch iskeleti",
  },
  {
    category: "Haftalık",
    tags: ["haftalık", "plan", "takvim"],
    kinds: ["note", "todo", "board"],
    layouts: ["gridcards", "timeline", "compare", "kanban"],
    nouns: ["Hafta", "Odak", "Program", "Antrenman", "İçerik", "Blok", "Rutin", "Takvim"],
    verbs: ["planı", "takvimi", "listesi", "şeması", "panosu"],
    description: "Haftalık plan şablonu",
  },
  {
    category: "Retrospektif",
    tags: ["retro", "iyileştirme", "ekip"],
    kinds: ["board", "note"],
    layouts: ["kanban", "compare", "cluster", "matrix"],
    nouns: ["Retro", "İyileştirme", "Aksiyon", "Geri bildirim", "Öğrenim", "Bloker", "Kazanım", "Deney"],
    verbs: ["panosu", "notları", "matrisı", "listesi", "haritası"],
    description: "Retrospektif panosu",
  },
  {
    category: "Diyagram",
    tags: ["diyagram", "şekil", "görsel"],
    kinds: ["board"],
    layouts: ["cycle", "hub", "cluster", "matrix", "pyramid", "funnel"],
    nouns: ["Diyagram", "Model", "Katman", "Döngü", "Ağ", "Sistem", "Çerçeve", "Şema"],
    verbs: ["çizimi", "panosu", "haritası", "yapısı", "şeması"],
    description: "Serbest görsel diyagram",
  },
];

const NODE_WORDS = [
  "Başla", "Plan", "Analiz", "Tasarım", "Geliştir", "Test", "Yayın", "Ölç",
  "Öğren", "Karar", "Risk", "Fırsat", "Aksiyon", "Bekle", "Onay", "Red",
  "Ara", "Yaz", "Çiz", "Paylaş", "Gözden geçir", "İyileştir", "Özet", "Detay",
  "A", "B", "C", "D", "E", "F", "Girdi", "Çıktı", "Merkez", "Dal", "Kök",
  "Faz 1", "Faz 2", "Faz 3", "Q1", "Q2", "Q3", "Q4", "MVP", "Beta", "GA",
  "Kırmızı", "Sarı", "Yeşil", "Kritik", "Orta", "Düşük", "Yüksek", "Opsiyon",
];

const SECTION_HEADS = [
  "Özet", "Bağlam", "Hedefler", "Adımlar", "Riskler", "Notlar", "Kararlar",
  "Kaynaklar", "Sonraki", "Ölçüm", "Varsayımlar", "Bulgular", "Aksiyonlar",
];

const BODY_BITS = [
  "Kritik noktaları işaretle.",
  "Diyagramı ihtiyaca göre düzenle.",
  "Boş satırlara kendi notlarını yaz.",
  "Renkler uyumlu paletten üretildi.",
  "Şekilleri sürükleyip özelleştir.",
  "Bu sayfa tek seferlik benzersiz düzen.",
];

function shape(
  id: string,
  kind: BoardShapeKind,
  x: number,
  y: number,
  w: number,
  h: number,
  fill: string,
  stroke: string,
  text?: string,
  extra?: Partial<BoardShape>,
): BoardShape {
  return {
    id,
    kind,
    x: Math.round(x),
    y: Math.round(y),
    w: Math.round(w),
    h: Math.round(h),
    fill,
    stroke,
    strokeWidth: 1.5 + Math.round((w + h) / 180),
    text,
    ...extra,
  };
}

function nodeKind(rng: Rng): BoardShapeKind {
  return pick(rng, [
    "roundRect",
    "rect",
    "ellipse",
    "diamond",
    "hexagon",
    "parallelogram",
    "triangle",
    "sticky",
  ] as const);
}

function fills(p: Palette): string[] {
  return [p.fill, p.fill2, p.fill3, p.fill4, "#ffffff"];
}

function strokes(p: Palette): string[] {
  return [p.accent, p.accent2, p.accent3];
}

function word(rng: Rng, n: number, i: number) {
  return `${pick(rng, NODE_WORDS)}${rng() > 0.65 ? ` ${i + 1}` : ""}`;
}

function connect(
  sid: (n: number) => string,
  from: { x: number; y: number; w: number; h: number },
  to: { x: number; y: number; w: number; h: number },
  stroke: string,
  id: number,
  useArrow: boolean,
): BoardShape {
  const x1 = from.x + from.w / 2;
  const y1 = from.y + from.h / 2;
  const x2 = to.x + to.w / 2;
  const y2 = to.y + to.h / 2;
  if (useArrow) {
    return shape(
      sid(id),
      "arrow",
      Math.min(x1, x2),
      Math.min(y1, y2),
      Math.max(40, Math.abs(x2 - x1)),
      Math.max(24, Math.abs(y2 - y1)),
      "transparent",
      stroke,
    );
  }
  return shape(sid(id), "line", x1, y1, 2, 2, "transparent", stroke, undefined, {
    x2,
    y2,
  });
}

/** Her çağrıda geometri, sayı, etiket ve bağlantı farklı */
function buildUniqueShapes(
  layout: LayoutKind,
  p: Palette,
  rng: Rng,
  index: number,
): BoardShape[] {
  const sid = (n: number) => `shp_${index}_${n}`;
  const F = fills(p);
  const S = strokes(p);
  const out: BoardShape[] = [];
  let id = 1;

  const pushNode = (
    kind: BoardShapeKind,
    x: number,
    y: number,
    w: number,
    h: number,
    label?: string,
  ) => {
    const node = shape(
      sid(id++),
      kind,
      x,
      y,
      w,
      h,
      pick(rng, F),
      pick(rng, S),
      label ?? word(rng, index, id),
    );
    out.push(node);
    return node;
  };

  if (layout === "swot") {
    const gap = 12 + int(rng, 0, 20);
    const ww = 180 + int(rng, 0, 80);
    const hh = 130 + int(rng, 0, 60);
    const ox = 20 + int(rng, 0, 40);
    const oy = 20 + int(rng, 0, 40);
    const labels = pick(rng, [
      ["Güçlü", "Zayıf", "Fırsat", "Tehdit"],
      ["İç +", "İç −", "Dış +", "Dış −"],
      ["Avantaj", "Eksik", "Potansiyel", "Risk"],
      ["Keep", "Stop", "Start", "Watch"],
    ] as const);
    const cells = [
      [ox, oy, labels[0], p.fill, p.accent],
      [ox + ww + gap, oy, labels[1], p.fill2, p.accent2],
      [ox, oy + hh + gap, labels[2], p.fill3, p.accent3],
      [ox + ww + gap, oy + hh + gap, labels[3], p.fill4, p.ink],
    ] as const;
    for (const [x, y, t, fill, stroke] of cells) {
      out.push(
        shape(
          sid(id++),
          pick(rng, ["roundRect", "rect"] as const),
          x + jitter(rng, 0, 8),
          y + jitter(rng, 0, 8),
          ww + jitter(rng, 0, 12),
          hh + jitter(rng, 0, 10),
          fill,
          stroke,
          t,
        ),
      );
    }
    if (rng() > 0.4) {
      pushNode("diamond", ox + ww / 2 + gap / 2, oy + hh / 2 + gap / 2, 70, 70, "odak");
    }
    return out;
  }

  if (layout === "kanban") {
    const cols = 3 + int(rng, 0, 2);
    const colW = 140 + int(rng, 0, 50);
    const colH = 280 + int(rng, 0, 120);
    const startX = 16 + int(rng, 0, 30);
    const names = pick(rng, [
      ["Backlog", "Doing", "Done"],
      ["Yapılacak", "Devam", "Bitti", "Bekle"],
      ["Idea", "Build", "Ship", "Learn"],
      ["Inbox", "Active", "Review", "Archive", "Blocked"],
    ]);
    const colNodes: BoardShape[] = [];
    for (let c = 0; c < cols; c++) {
      const x = startX + c * (colW + 18);
      const col = shape(
        sid(id++),
        "roundRect",
        x,
        24 + jitter(rng, 0, 10),
        colW,
        colH,
        F[c % F.length]!,
        S[c % S.length]!,
        names[c % names.length],
      );
      out.push(col);
      colNodes.push(col);
      const cards = 1 + int(rng, 0, 3);
      for (let k = 0; k < cards; k++) {
        out.push(
          shape(
            sid(id++),
            "sticky",
            x + 12 + jitter(rng, 0, 8),
            70 + k * (70 + int(rng, 0, 20)) + jitter(rng, 0, 10),
            colW - 28,
            54 + int(rng, 0, 20),
            pick(rng, F),
            pick(rng, S),
            word(rng, index, k + c * 10),
          ),
        );
      }
    }
    return out;
  }

  if (layout === "mind" || layout === "hub" || layout === "cluster") {
    const cx = 280 + jitter(rng, 0, 40);
    const cy = 200 + jitter(rng, 0, 30);
    const arms = 4 + int(rng, 0, 5);
    const hub = pushNode(
      pick(rng, ["ellipse", "hexagon", "roundRect"] as const),
      cx - 70,
      cy - 50,
      140 + int(rng, 0, 40),
      90 + int(rng, 0, 30),
      pick(rng, ["Merkez", "Çekirdek", "Tema", "Soru", "Hedef"]),
    );
    for (let i = 0; i < arms; i++) {
      const ang = (Math.PI * 2 * i) / arms + rng() * 0.35;
      const dist = 150 + int(rng, 0, 90);
      const nx = cx + Math.cos(ang) * dist - 55;
      const ny = cy + Math.sin(ang) * dist - 35;
      const leaf = pushNode(
        nodeKind(rng),
        clamp(nx, 10, 620),
        clamp(ny, 10, 420),
        100 + int(rng, 0, 50),
        60 + int(rng, 0, 30),
      );
      out.push(
        connect(sid, hub, leaf, pick(rng, S), id++, rng() > 0.55),
      );
      if (rng() > 0.55) {
        const ang2 = ang + (rng() - 0.5) * 0.6;
        const nx2 = leaf.x + Math.cos(ang2) * 90;
        const ny2 = leaf.y + Math.sin(ang2) * 70;
        const sub = pushNode(
          pick(rng, ["sticky", "ellipse", "diamond"] as const),
          clamp(nx2, 10, 640),
          clamp(ny2, 10, 440),
          80 + int(rng, 0, 30),
          50 + int(rng, 0, 20),
        );
        out.push(connect(sid, leaf, sub, pick(rng, S), id++, false));
      }
    }
    return out;
  }

  if (layout === "timeline" || layout === "steps") {
    const count = 4 + int(rng, 0, 4);
    const y = 160 + int(rng, 0, 60);
    const startX = 30 + int(rng, 0, 40);
    const span = 560 / Math.max(1, count - 1);
    const nodes: BoardShape[] = [];
    out.push(
      shape(
        sid(id++),
        "line",
        startX,
        y + 30,
        2,
        2,
        "transparent",
        p.accent,
        undefined,
        { x2: startX + span * (count - 1) + 40, y2: y + 30 + jitter(rng, 0, 20) },
      ),
    );
    for (let i = 0; i < count; i++) {
      const x = startX + i * span;
      const up = i % 2 === 0;
      const node = pushNode(
        pick(rng, ["ellipse", "roundRect", "diamond", "hexagon"] as const),
        x,
        y + (up ? -40 - int(rng, 0, 30) : 40 + int(rng, 0, 30)),
        70 + int(rng, 0, 40),
        55 + int(rng, 0, 25),
        `${pick(rng, ["Aşama", "Adım", "Faz", "Nokta"])} ${i + 1}`,
      );
      nodes.push(node);
      if (rng() > 0.35) {
        pushNode(
          "sticky",
          x - 10,
          up ? y + 70 : y - 90,
          90 + int(rng, 0, 30),
          48,
          word(rng, index, i),
        );
      }
    }
    for (let i = 0; i < nodes.length - 1; i++) {
      if (rng() > 0.3) {
        out.push(connect(sid, nodes[i]!, nodes[i + 1]!, pick(rng, S), id++, true));
      }
    }
    return out;
  }

  if (layout === "org" || layout === "pyramid") {
    const levels = 2 + int(rng, 0, 2);
    const prev: BoardShape[] = [];
    for (let lv = 0; lv < levels; lv++) {
      const count = lv === 0 ? 1 : 2 + int(rng, 0, lv + 1);
      const row: BoardShape[] = [];
      const totalW = count * 140;
      const startX = 340 - totalW / 2 + jitter(rng, 0, 20);
      for (let i = 0; i < count; i++) {
        const node = pushNode(
          pick(rng, ["roundRect", "rect", "parallelogram"] as const),
          startX + i * 150 + jitter(rng, 0, 12),
          30 + lv * (100 + int(rng, 0, 30)),
          120 + int(rng, 0, 30),
          58 + int(rng, 0, 16),
          lv === 0
            ? pick(rng, ["Lider", "Root", "CEO", "Üst"])
            : word(rng, index, lv * 10 + i),
        );
        row.push(node);
        if (prev.length) {
          const parent = prev[Math.min(i, prev.length - 1)]!;
          out.push(connect(sid, parent, node, pick(rng, S), id++, false));
        }
      }
      prev.length = 0;
      prev.push(...row);
    }
    return out;
  }

  if (layout === "cycle") {
    const count = 4 + int(rng, 0, 3);
    const cx = 320;
    const cy = 210;
    const r = 140 + int(rng, 0, 40);
    const nodes: BoardShape[] = [];
    for (let i = 0; i < count; i++) {
      const ang = (Math.PI * 2 * i) / count - Math.PI / 2;
      const node = pushNode(
        pick(rng, ["hexagon", "ellipse", "roundRect"] as const),
        cx + Math.cos(ang) * r - 50,
        cy + Math.sin(ang) * r - 35,
        100 + int(rng, 0, 30),
        70 + int(rng, 0, 20),
        pick(rng, ["Plan", "Yap", "Kontrol", "İyileştir", "Ölç", "Karar", "Uygula"]),
      );
      nodes.push(node);
    }
    for (let i = 0; i < nodes.length; i++) {
      out.push(
        connect(
          sid,
          nodes[i]!,
          nodes[(i + 1) % nodes.length]!,
          pick(rng, S),
          id++,
          true,
        ),
      );
    }
    if (rng() > 0.4) {
      pushNode("ellipse", cx - 45, cy - 35, 90, 70, pick(rng, ["Döngü", "Loop", "Core"]));
    }
    return out;
  }

  if (layout === "compare" || layout === "matrix") {
    if (layout === "matrix" || rng() > 0.45) {
      const rows = 2 + int(rng, 0, 1);
      const cols = 2 + int(rng, 0, 1);
      const cellW = 140 + int(rng, 0, 40);
      const cellH = 100 + int(rng, 0, 40);
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          pushNode(
            pick(rng, ["roundRect", "rect"] as const),
            40 + c * (cellW + 16) + jitter(rng, 0, 8),
            40 + r * (cellH + 16) + jitter(rng, 0, 8),
            cellW,
            cellH,
            `${pick(rng, ["Hücre", "Alan", "Bölge"])} ${r + 1}${c + 1}`,
          );
        }
      }
      return out;
    }
    const left = pushNode(
      "roundRect",
      30 + jitter(rng, 0, 20),
      40 + jitter(rng, 0, 20),
      220 + int(rng, 0, 40),
      260 + int(rng, 0, 60),
      pick(rng, ["Seçenek A", "Şimdi", "Plan A", "İçerik"]),
    );
    const right = pushNode(
      "roundRect",
      340 + jitter(rng, 0, 20),
      40 + jitter(rng, 0, 20),
      220 + int(rng, 0, 40),
      260 + int(rng, 0, 60),
      pick(rng, ["Seçenek B", "Sonra", "Plan B", "Alternatif"]),
    );
    pushNode("diamond", 270 + jitter(rng, 0, 20), 140 + jitter(rng, 0, 40), 80, 80, "vs");
    if (rng() > 0.5) out.push(connect(sid, left, right, p.accent3, id++, false));
    return out;
  }

  if (layout === "funnel") {
    const layers = 4 + int(rng, 0, 2);
    for (let i = 0; i < layers; i++) {
      const w = 420 - i * (50 + int(rng, 0, 20));
      pushNode(
        pick(rng, ["parallelogram", "roundRect", "rect"] as const),
        340 - w / 2 + jitter(rng, 0, 10),
        30 + i * (70 + int(rng, 0, 16)),
        w,
        55 + int(rng, 0, 14),
        `${pick(rng, ["Aşama", "Filtre", "Katman", "Seviye"])} ${i + 1}`,
      );
    }
    return out;
  }

  if (layout === "gridcards") {
    const cols = 2 + int(rng, 0, 2);
    const rows = 2 + int(rng, 0, 2);
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        pushNode(
          pick(rng, ["sticky", "roundRect", "ellipse"] as const),
          30 + c * (170 + int(rng, 0, 30)) + jitter(rng, 0, 12),
          30 + r * (130 + int(rng, 0, 30)) + jitter(rng, 0, 12),
          130 + int(rng, 0, 40),
          90 + int(rng, 0, 30),
        );
      }
    }
    return out;
  }

  // flow default — benzersiz düğüm sayısı ve yol
  {
    const count = 4 + int(rng, 0, 4);
    const nodes: BoardShape[] = [];
    let x = 20 + int(rng, 0, 30);
    let y = 80 + int(rng, 0, 40);
    for (let i = 0; i < count; i++) {
      const vertical = rng() > 0.55;
      const kind =
        i === 0
          ? "ellipse"
          : i === count - 1
            ? pick(rng, ["ellipse", "roundRect"] as const)
            : rng() > 0.55
              ? "diamond"
              : nodeKind(rng);
      const node = pushNode(
        kind,
        x,
        y,
        100 + int(rng, 0, 50),
        60 + int(rng, 0, 30),
        i === 0
          ? pick(rng, ["Başla", "Giriş", "Start"])
          : i === count - 1
            ? pick(rng, ["Bitti", "Çıkış", "Son"])
            : word(rng, index, i),
      );
      nodes.push(node);
      if (vertical) {
        y += 90 + int(rng, 0, 40);
        x += jitter(rng, 20, 50);
      } else {
        x += 130 + int(rng, 0, 50);
        y += jitter(rng, 0, 40);
      }
      x = clamp(x, 10, 560);
      y = clamp(y, 20, 380);
    }
    for (let i = 0; i < nodes.length - 1; i++) {
      out.push(connect(sid, nodes[i]!, nodes[i + 1]!, pick(rng, S), id++, rng() > 0.4));
    }
    // rastgele yan dal
    if (nodes.length > 2 && rng() > 0.4) {
      const base = nodes[1 + int(rng, 0, nodes.length - 2)]!;
      const branch = pushNode(
        nodeKind(rng),
        clamp(base.x + 40, 10, 580),
        clamp(base.y + 110, 20, 400),
        100,
        60,
        pick(rng, ["Yan yol", "İstisna", "Alt süreç"]),
      );
      out.push(connect(sid, base, branch, p.accent3, id++, false));
    }
    return out;
  }
}

function uniqueTitle(cat: CategoryDef, rng: Rng, n: number): string {
  const noun = pick(rng, cat.nouns);
  const verb = pick(rng, cat.verbs);
  const spice = pick(rng, [
    "",
    " · v2",
    " · mini",
    " · detay",
    " · hızlı",
    " · görsel",
    ` · ${pick(rng, ["A", "B", "C", "X", "Z"])}`,
  ]);
  // numara sonda ama başlık gövdesi kombinatoryal benzersiz
  return `${noun} ${verb}${spice}`.trim() + ` #${n}`;
}

function buildNoteHtml(
  title: string,
  cat: CategoryDef,
  p: Palette,
  rng: Rng,
  n: number,
): string {
  const heads = [...SECTION_HEADS].sort(() => rng() - 0.5).slice(0, 2 + int(rng, 0, 2));
  const chips = [...cat.tags, pick(rng, NODE_WORDS).toLowerCase()]
    .slice(0, 3 + int(rng, 0, 1))
    .map(
      (t) =>
        `<span style="display:inline-block;margin:0 0.35rem 0.35rem 0;padding:0.2rem 0.55rem;border-radius:999px;background:${p.accent}22;color:${p.accent};font-size:0.85em;font-weight:600;">#${t}</span>`,
    )
    .join("");

  const listStyle = rng() > 0.5 ? "ul" : "ol";
  const items = Array.from({ length: 3 + int(rng, 0, 3) }, (_, i) => {
    const bit = pick(rng, BODY_BITS);
    return `<li>${pick(rng, NODE_WORDS)} — ${bit.replace(/\.$/, "")} (${i + 1})</li>`;
  }).join("");

  const blocks = [
    `<div style="height:10px;border-radius:999px;background:linear-gradient(90deg,${p.accent},${p.accent2},${p.accent3});margin:0 0 1rem;"></div>`,
    `<h1 style="color:${p.accent}">${title}</h1>`,
    `<p>${chips}</p>`,
    `<p style="color:${p.soft}"><strong style="color:${p.ink}">Amaç:</strong> ${cat.description}. Düzen #${n} benzersiz üretildi.</p>`,
  ];

  for (const h of heads) {
    blocks.push(`<h2 style="color:${p.accent2}">${h}</h2>`);
    if (rng() > 0.4) {
      blocks.push(`<${listStyle}>${items}</${listStyle}>`);
    } else {
      blocks.push(`<p>${pick(rng, BODY_BITS)} ${pick(rng, BODY_BITS)}</p>`);
    }
  }

  if (rng() > 0.35) {
    blocks.push(
      `<blockquote style="border-left:4px solid ${p.accent3};padding-left:0.75rem;color:${p.soft}">${pick(rng, BODY_BITS)}</blockquote>`,
    );
  }

  // benzersiz renkli mini kartlar
  const cardCount = 2 + int(rng, 0, 2);
  const cardHtml = Array.from({ length: cardCount }, (_, i) => {
    const bg = [p.fill, p.fill2, p.fill3, p.fill4][i % 4];
    return `<div style="display:inline-block;width:46%;min-width:140px;margin:0.35rem 1% 0.35rem 0;padding:0.65rem 0.75rem;border-radius:0.75rem;background:${bg};border:1px solid ${p.accent}33;vertical-align:top;"><strong style="color:${p.accent}">Kart ${i + 1}</strong><br/><span style="color:${p.soft};font-size:0.9em">${word(rng, n, i)}</span></div>`;
  }).join("");
  blocks.push(`<h3 style="color:${p.accent3}">Bloklar</h3>`, `<div>${cardHtml}</div>`);
  blocks.push(`<p></p><p></p><p></p><p></p>`);

  return blocks.join("\n");
}

function buildTodos(title: string, rng: Rng, n: number, p: Palette): TodoItem[] {
  const count = 4 + int(rng, 0, 5);
  const now = Date.now();
  const colors = [p.accent, p.accent2, p.accent3, p.fill, p.fill2, "#14B8A6", "#F59E0B"];
  return Array.from({ length: count }, (_, i) => ({
    id: `td_tpl_${n}_${i}`,
    text: `${pick(rng, NODE_WORDS)} — ${pick(rng, BODY_BITS).replace(/\.$/, "")}${i === 0 ? ` (${title.split("#")[0]?.trim()})` : ""}`,
    done: rng() > 0.82,
    createdAt: now - i * 1700,
    color: colors[i % colors.length],
  }));
}

function buildFormulas(rng: Rng, n: number): NoteFormula[] | undefined {
  if (rng() > 0.35) return undefined;
  const samples = [
    "E = mc^{2}",
    "\\int_{a}^{b} f(x)\\,dx",
    "\\bar{x} = \\dfrac{1}{n}\\sum_{i=1}^{n} x_i",
    "a^{2}+b^{2}=c^{2}",
    "F = ma",
    "\\nabla \\cdot \\vec{E} = \\dfrac{\\rho}{\\varepsilon_0}",
    "PV = nRT",
    "\\sin^{2}\\theta + \\cos^{2}\\theta = 1",
  ];
  const count = 1 + (rng() > 0.7 ? 1 : 0);
  return Array.from({ length: count }, (_, i) => ({
    id: `fm_tpl_${n}_${i}`,
    latex: pick(rng, samples),
    display: true,
    x: 60 + i * 180 + int(rng, 0, 120),
    y: 30 + int(rng, 0, 80),
    scale: 0.85 + rng() * 0.4,
  }));
}

function buildThumbSvg(
  p: Palette,
  layout: LayoutKind,
  kind: PageKind,
  rng: Rng,
): string {
  const blobs: string[] = [];
  const count = 3 + int(rng, 0, 4);
  for (let i = 0; i < count; i++) {
    const x = 18 + int(rng, 0, 140);
    const y = 36 + int(rng, 0, 80);
    const w = 28 + int(rng, 0, 50);
    const h = 20 + int(rng, 0, 36);
    const fill = [p.fill, p.fill2, p.fill3, p.accent2][i % 4]!;
    const stroke = [p.accent, p.accent2, p.accent3][i % 3]!;
    if (layout === "timeline" && i === 0) {
      blobs.push(
        `<line x1="20" y1="90" x2="200" y2="90" stroke="${p.accent}" stroke-width="3"/>`,
      );
    }
    if (rng() > 0.5) {
      blobs.push(
        `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${4 + int(rng, 0, 8)}" fill="${fill}" stroke="${stroke}" opacity="0.9"/>`,
      );
    } else if (rng() > 0.4) {
      blobs.push(
        `<ellipse cx="${x + w / 2}" cy="${y + h / 2}" rx="${w / 2}" ry="${h / 2}" fill="${fill}" stroke="${stroke}"/>`,
      );
    } else {
      const cx = x + w / 2;
      const cy = y + h / 2;
      blobs.push(
        `<polygon points="${cx},${y} ${x + w},${cy} ${cx},${y + h} ${x},${cy}" fill="${fill}" stroke="${stroke}"/>`,
      );
    }
  }
  const kindLabel =
    kind === "board" ? "BOARD" : kind === "todo" ? "TODO" : "NOTE";

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="220" height="160" viewBox="0 0 220 160">
  <defs>
    <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="${p.accent}" stop-opacity="0.2"/>
      <stop offset="50%" stop-color="${p.accent2}" stop-opacity="0.25"/>
      <stop offset="100%" stop-color="${p.accent3}" stop-opacity="0.35"/>
    </linearGradient>
  </defs>
  <rect width="220" height="160" rx="16" fill="url(#g)"/>
  <rect x="10" y="10" width="200" height="140" rx="12" fill="#ffffffcc" stroke="${p.accent}" stroke-opacity="0.35"/>
  <text x="20" y="28" font-family="Segoe UI,sans-serif" font-size="11" font-weight="700" fill="${p.accent}">${kindLabel}</text>
  ${blobs.join("")}
</svg>`;
}

export function generateOneTemplate(index: number): {
  meta: TemplateMeta;
  page: TemplatePagePayload;
  thumbSvg: string;
} {
  const n = index + 1;
  // Her index için bağımsız tohum — aynı şekil/renk döngüsü yok
  const rng = mulberry32(0x9e3779b9 ^ (n * 0x85ebca6b));
  const cat = CATEGORIES[index % CATEGORIES.length]!;
  // Hue uzayı 1000 şablona yayılır (aynı rengin 10–20 kopyası olmasın)
  const uniqueHue = (n * 137.508) % 360;
  const palette = harmoniousPalette(rng, uniqueHue);
  const kind = pick(rng, cat.kinds);
  const layout = pick(rng, cat.layouts);
  const title = uniqueTitle(cat, rng, n);
  const id = `tpl_${String(n).padStart(4, "0")}`;

  const shapes =
    kind === "todo" ? undefined : buildUniqueShapes(layout, palette, rng, n);

  const page: TemplatePagePayload = {
    title,
    kind,
    content: kind === "note" ? buildNoteHtml(title, cat, palette, rng, n) : undefined,
    strokes: kind === "note" ? [] : undefined,
    shapes: kind === "note" || kind === "board" ? shapes : undefined,
    formulas: kind === "note" ? buildFormulas(rng, n) : undefined,
    comments: kind === "note" ? [] : undefined,
    todos: kind === "todo" ? buildTodos(title, rng, n, palette) : undefined,
    bgColor: kind === "note" ? palette.bg : undefined,
    pattern: kind === "note" ? pick(rng, PATTERNS) : undefined,
  };

  const meta: TemplateMeta = {
    id,
    title,
    category: cat.category,
    tags: cat.tags,
    kind,
    accent: palette.accent,
    accent2: palette.accent2,
    description: `${cat.description} · ${layout}`,
    thumb: `thumbs/${id}.svg`,
    updatedAt: Date.UTC(2026, 7, 1) + n * 1000,
  };

  return {
    meta,
    page,
    thumbSvg: buildThumbSvg(palette, layout, kind, rng),
  };
}

export function listCategories(): string[] {
  return CATEGORIES.map((c) => c.category);
}

export const TEMPLATE_TARGET_COUNT = 1000;
