import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";

export type StockSource = "pexels" | "pixabay" | "unsplash";

export type StockHit = {
  id: string;
  source: StockSource;
  thumb: string;
  full: string;
  alt: string;
  photographer: string;
  pageUrl: string;
  license: string;
};

function configuredSources() {
  return {
    pexels: Boolean(process.env.PEXELS_API_KEY?.trim()),
    pixabay: Boolean(process.env.PIXABAY_API_KEY?.trim()),
    unsplash: Boolean(process.env.UNSPLASH_ACCESS_KEY?.trim()),
  };
}

async function searchPexels(q: string, perPage: number): Promise<StockHit[]> {
  const key = process.env.PEXELS_API_KEY?.trim();
  if (!key) return [];
  const url = new URL("https://api.pexels.com/v1/search");
  url.searchParams.set("query", q);
  url.searchParams.set("per_page", String(perPage));
  url.searchParams.set("orientation", "landscape");
  const res = await fetch(url, {
    headers: { Authorization: key },
    next: { revalidate: 0 },
  });
  if (!res.ok) return [];
  const data = (await res.json()) as {
    photos?: Array<{
      id: number;
      alt?: string;
      url: string;
      photographer?: string;
      src?: { medium?: string; large?: string; original?: string };
    }>;
  };
  return (data.photos ?? []).map((p) => ({
    id: `pexels-${p.id}`,
    source: "pexels" as const,
    thumb: p.src?.medium || p.src?.large || "",
    full: p.src?.large || p.src?.original || p.src?.medium || "",
    alt: p.alt || q,
    photographer: p.photographer || "Pexels",
    pageUrl: p.url,
    license: "Pexels License (ücretsiz kullanım)",
  }));
}

async function searchPixabay(q: string, perPage: number): Promise<StockHit[]> {
  const key = process.env.PIXABAY_API_KEY?.trim();
  if (!key) return [];
  const url = new URL("https://pixabay.com/api/");
  url.searchParams.set("key", key);
  url.searchParams.set("q", q);
  url.searchParams.set("image_type", "photo");
  url.searchParams.set("safesearch", "true");
  url.searchParams.set("per_page", String(perPage));
  const res = await fetch(url.toString(), { next: { revalidate: 0 } });
  if (!res.ok) return [];
  const data = (await res.json()) as {
    hits?: Array<{
      id: number;
      previewURL?: string;
      webformatURL?: string;
      largeImageURL?: string;
      pageURL?: string;
      user?: string;
      tags?: string;
    }>;
  };
  return (data.hits ?? []).map((p) => ({
    id: `pixabay-${p.id}`,
    source: "pixabay" as const,
    thumb: p.previewURL || p.webformatURL || "",
    full: p.largeImageURL || p.webformatURL || "",
    alt: p.tags || q,
    photographer: p.user || "Pixabay",
    pageUrl: p.pageURL || "",
    license: "Pixabay Content License (ücretsiz kullanım)",
  }));
}

async function searchUnsplash(q: string, perPage: number): Promise<StockHit[]> {
  const key = process.env.UNSPLASH_ACCESS_KEY?.trim();
  if (!key) return [];
  const url = new URL("https://api.unsplash.com/search/photos");
  url.searchParams.set("query", q);
  url.searchParams.set("per_page", String(perPage));
  url.searchParams.set("content_filter", "high");
  const res = await fetch(url, {
    headers: { Authorization: `Client-ID ${key}` },
    next: { revalidate: 0 },
  });
  if (!res.ok) return [];
  const data = (await res.json()) as {
    results?: Array<{
      id: string;
      description?: string | null;
      alt_description?: string | null;
      links?: { html?: string };
      user?: { name?: string };
      urls?: { small?: string; regular?: string; full?: string };
    }>;
  };
  return (data.results ?? []).map((p) => ({
    id: `unsplash-${p.id}`,
    source: "unsplash" as const,
    thumb: p.urls?.small || p.urls?.regular || "",
    full: p.urls?.regular || p.urls?.full || p.urls?.small || "",
    alt: p.alt_description || p.description || q,
    photographer: p.user?.name || "Unsplash",
    pageUrl: p.links?.html || "",
    license: "Unsplash License (ücretsiz kullanım)",
  }));
}

export async function GET(req: Request) {
  try {
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json({ error: "Giriş gerekli" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const q = (searchParams.get("q") || "").trim();
    const source = (searchParams.get("source") || "all") as StockSource | "all";
    const licensedOnly = searchParams.get("licensed") !== "0";
    const configured = configuredSources();

    if (!q) {
      return NextResponse.json({
        hits: [],
        configured,
        licensedOnly,
        hint: "Arama terimi girin",
      });
    }

    // Telif filtreli: yalnızca ücretsiz stok API'leri (Pexels / Pixabay / Unsplash)
    if (!licensedOnly) {
      return NextResponse.json({
        hits: [],
        configured,
        licensedOnly: false,
        error:
          "Açık web araması kapalı. Telif filtreli stok (Pexels / Pixabay / Unsplash) kullanın.",
      });
    }

    const per = 12;
    const tasks: Promise<StockHit[]>[] = [];
    if (source === "all" || source === "pexels") tasks.push(searchPexels(q, per));
    if (source === "all" || source === "pixabay") tasks.push(searchPixabay(q, per));
    if (source === "all" || source === "unsplash") tasks.push(searchUnsplash(q, per));

    const chunks = await Promise.all(tasks);
    const hits = chunks.flat().filter((h) => h.thumb && h.full);

    const anyKey = Object.values(configured).some(Boolean);
    return NextResponse.json({
      hits,
      configured,
      licensedOnly: true,
      hint: anyKey
        ? hits.length
          ? null
          : "Sonuç yok — başka bir kelime deneyin"
        : "API anahtarı yok. .env.local içine PEXELS_API_KEY, PIXABAY_API_KEY, UNSPLASH_ACCESS_KEY ekleyin (ücretsiz).",
    });
  } catch (err) {
    console.error("stock search", err);
    return NextResponse.json({ error: "Arama başarısız" }, { status: 500 });
  }
}
