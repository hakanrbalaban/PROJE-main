import { TODO_COLORS } from "./types";
import { uid } from "./id";
import type { LegacyPageKind, Notebook, NotePage, Workspace } from "./types";

const STORAGE_KEY = "balaban-note-workspace-v2";

const NOTEBOOK_COLORS = [
  "#1A9B8E",
  "#2F6FED",
  "#C45B2A",
  "#7B5EA7",
  "#3D7A4A",
  "#B4536A",
];

export function createDefaultWorkspace(): Workspace {
  const notebookId = uid("nb");
  const projectsId = uid("nb");
  const now = Date.now();

  const notebooks: Notebook[] = [
    {
      id: notebookId,
      title: "Günlük",
      color: NOTEBOOK_COLORS[0],
      createdAt: now,
    },
    {
      id: projectsId,
      title: "Projeler",
      color: NOTEBOOK_COLORS[1],
      createdAt: now,
    },
  ];

  const pages: NotePage[] = [
    {
      id: uid("pg"),
      notebookId,
      title: "Hoş geldin",
      kind: "note",
      updatedAt: now,
      content: `
        <h1>Balaban Note</h1>
        <p>Tek sayfada hem yaz hem çiz. Üstten <strong>Yaz</strong> / <strong>Kalem</strong> modunu değiştir.</p>
        <p>Kalemler: Kurşun, Tükenmez, Dolma, Keçeli, Fosfor, Fırça. Rengi paletten veya özel seçiciden ayarla.</p>
        <ul>
          <li>Metin satırlarının üzerine çizim yapabilirsin</li>
          <li>Board’da metin kutusu açılmaz — tıkla, düz ekle</li>
          <li>Şekiller varsayılan olarak dolgusuz çizilir</li>
        </ul>
        <h2>Hızlı ipuçları</h2>
        <p>Dolma kalem yavaşta kalınlaşır, hızlıda incelir. Kurşun hafif dokulu yazar. Fosfor metni vurgular.</p>
        <p></p>
        <p></p>
        <p></p>
        <p></p>
        <p></p>
        <p></p>
        <p></p>
        <p></p>
      `.trim(),
      strokes: [],
      shapes: [],
    },
    {
      id: uid("pg"),
      notebookId,
      title: "Haftalık plan",
      kind: "note",
      updatedAt: now - 1000,
      content: `
        <h1>Haftalık plan</h1>
        <h2>Bu hafta</h2>
        <ul>
          <li>Pazartesi — odak bloğu</li>
          <li>Salı — toplantı notları</li>
        </ul>
        <h3>Hatırlatmalar</h3>
        <ol>
          <li>Diyagram modunda şekil ekle</li>
          <li>Girinti için sekme araçlarını kullan</li>
        </ol>
        <p></p>
        <p></p>
        <p></p>
        <p></p>
        <p></p>
        <p></p>
        <p></p>
        <p></p>
      `.trim(),
      strokes: [],
      shapes: [],
    },
    {
      id: uid("pg"),
      notebookId,
      title: "Fikir tahtası",
      kind: "board",
      updatedAt: now - 2000,
      shapes: [
        {
          id: uid("sh"),
          kind: "rect",
          x: 70,
          y: 70,
          w: 170,
          h: 96,
          fill: "transparent",
          stroke: "#1A9B8E",
          strokeWidth: 2,
          text: "Keşif",
        },
        {
          id: uid("sh"),
          kind: "ellipse",
          x: 320,
          y: 55,
          w: 150,
          h: 110,
          fill: "transparent",
          stroke: "#2F6FED",
          strokeWidth: 2,
          text: "Çözüm",
        },
        {
          id: uid("sh"),
          kind: "diamond",
          x: 200,
          y: 230,
          w: 130,
          h: 130,
          fill: "transparent",
          stroke: "#C45B2A",
          strokeWidth: 2,
          text: "Karar?",
        },
        {
          id: uid("sh"),
          kind: "arrow",
          x: 240,
          y: 120,
          w: 0,
          h: 0,
          x2: 320,
          y2: 110,
          fill: "transparent",
          stroke: "#0F2C3A",
          strokeWidth: 2,
        },
        {
          id: uid("sh"),
          kind: "text",
          x: 70,
          y: 30,
          w: 220,
          h: 28,
          fill: "transparent",
          stroke: "transparent",
          strokeWidth: 0,
          text: "Ürün akışı — düz metin",
        },
        {
          id: uid("sh"),
          kind: "line",
          x: 80,
          y: 400,
          w: 0,
          h: 0,
          x2: 480,
          y2: 400,
          fill: "transparent",
          stroke: "#7B5EA7",
          strokeWidth: 2,
        },
      ],
    },
    {
      id: uid("pg"),
      notebookId,
      title: "Bugün",
      kind: "todo",
      updatedAt: now - 3000,
      todos: [
        {
          id: uid("td"),
          text: "Balaban Note hibrit sayfasını dene",
          done: false,
          createdAt: now,
          color: TODO_COLORS[0],
        },
        {
          id: uid("td"),
          text: "Dolma ve kurşun kalemle yaz",
          done: false,
          createdAt: now,
          color: TODO_COLORS[1],
        },
        {
          id: uid("td"),
          text: "Özel renk seçiciyi kullan",
          done: false,
          createdAt: now,
          color: TODO_COLORS[2],
        },
        {
          id: uid("td"),
          text: "Board’a düz metin ekle",
          done: false,
          createdAt: now,
          color: TODO_COLORS[3],
        },
        {
          id: uid("td"),
          text: "Dolgusuz şekil çiz",
          done: false,
          createdAt: now,
          color: TODO_COLORS[4],
        },
        {
          id: uid("td"),
          text: "Haftalık plan sayfasını doldur",
          done: false,
          createdAt: now,
          color: TODO_COLORS[5],
        },
      ],
    },
    {
      id: uid("pg"),
      notebookId: projectsId,
      title: "Ürün notları",
      kind: "note",
      updatedAt: now - 4000,
      content: `
        <h2>Balaban Note — vizyon</h2>
        <p>OneNote / Notion hissi, ama tek yüzeyde yazı + mürekkep.</p>
        <p>Board tarafı diyagram için; todo tarafı takip için.</p>
        <h2>Sonraki fikirler</h2>
        <ul>
          <li>Sayfa şablonları</li>
          <li>PDF dışa aktarım</li>
          <li>Basınçlı kalem tablet desteği</li>
        </ul>
        <p></p>
        <p></p>
        <p></p>
        <p></p>
        <p></p>
        <p></p>
        <p></p>
        <p></p>
      `.trim(),
      strokes: [],
      shapes: [],
    },
    {
      id: uid("pg"),
      notebookId: projectsId,
      title: "Sprint checklist",
      kind: "todo",
      updatedAt: now - 5000,
      todos: [
        {
          id: uid("td"),
          text: "Tasarım token’larını sabitle",
          done: true,
          createdAt: now,
          color: TODO_COLORS[6],
        },
        {
          id: uid("td"),
          text: "Kalem motorunu pürüzsüzleştir",
          done: true,
          createdAt: now,
          color: TODO_COLORS[1],
        },
        {
          id: uid("td"),
          text: "Mobil dokunmatik testi",
          done: false,
          createdAt: now,
          color: TODO_COLORS[7],
        },
        {
          id: uid("td"),
          text: "Klavye kısayolları",
          done: false,
          createdAt: now,
          color: TODO_COLORS[4],
        },
      ],
    },
  ];

  return {
    notebooks,
    pages,
    activeNotebookId: notebookId,
    activePageId: pages[0].id,
  };
}

function migrate(raw: unknown): Workspace | null {
  if (!raw || typeof raw !== "object") return null;
  const data = raw as {
    notebooks?: Notebook[];
    pages?: Array<Omit<NotePage, "kind"> & { kind: LegacyPageKind }>;
    activeNotebookId?: string | null;
    activePageId?: string | null;
  };
  if (!data.notebooks?.length || !data.pages) return null;

  const pages: NotePage[] = data.pages.map((p) => {
    if (p.kind === "ink") {
      return {
        ...p,
        kind: "note",
        content: p.content ?? "<p></p>",
        strokes: p.strokes ?? [],
      };
    }
    return {
      ...p,
      kind: p.kind,
      strokes: p.kind === "note" ? (p.strokes ?? []) : p.strokes,
    };
  });

  return {
    notebooks: data.notebooks,
    pages,
    activeNotebookId: data.activeNotebookId ?? data.notebooks[0].id,
    activePageId: data.activePageId ?? pages[0]?.id ?? null,
  };
}

/** Validate / migrate any workspace JSON (local or MySQL). */
export function parseWorkspace(raw: unknown): Workspace | null {
  return migrate(raw);
}

export function loadWorkspace(): Workspace {
  if (typeof window === "undefined") return createDefaultWorkspace();
  try {
    const v2 = localStorage.getItem(STORAGE_KEY);
    if (v2) {
      const migrated = migrate(JSON.parse(v2));
      if (migrated) return migrated;
    }
    const v1 = localStorage.getItem("balaban-note-workspace-v1");
    if (v1) {
      const migrated = migrate(JSON.parse(v1));
      if (migrated) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(migrated));
        return migrated;
      }
    }
    return createDefaultWorkspace();
  } catch {
    return createDefaultWorkspace();
  }
}

export function saveWorkspace(workspace: Workspace): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(workspace));
}

export function nextNotebookColor(existing: Notebook[]): string {
  return NOTEBOOK_COLORS[existing.length % NOTEBOOK_COLORS.length];
}

export { NOTEBOOK_COLORS };
