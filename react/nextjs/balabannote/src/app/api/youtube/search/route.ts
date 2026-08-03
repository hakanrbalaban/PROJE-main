import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";

export type YoutubeHit = {
  id: string;
  title: string;
  channel: string;
  thumb: string;
  publishedAt: string;
};

export async function GET(req: Request) {
  try {
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json({ error: "Giriş gerekli" }, { status: 401 });
    }

    const key = process.env.YOUTUBE_API_KEY?.trim();
    if (!key) {
      return NextResponse.json({
        hits: [],
        configured: false,
        hint: "YOUTUBE_API_KEY .env.local içine ekleyin (Google Cloud → YouTube Data API v3).",
      });
    }

    const q = new URL(req.url).searchParams.get("q")?.trim() || "";
    if (!q) {
      return NextResponse.json({
        hits: [],
        configured: true,
        hint: "Arama terimi girin",
      });
    }

    const url = new URL("https://www.googleapis.com/youtube/v3/search");
    url.searchParams.set("part", "snippet");
    url.searchParams.set("type", "video");
    url.searchParams.set("maxResults", "12");
    url.searchParams.set("safeSearch", "moderate");
    url.searchParams.set("q", q);
    url.searchParams.set("key", key);

    const res = await fetch(url.toString(), { next: { revalidate: 0 } });
    const data = (await res.json()) as {
      error?: { message?: string };
      items?: Array<{
        id?: { videoId?: string };
        snippet?: {
          title?: string;
          channelTitle?: string;
          publishedAt?: string;
          thumbnails?: {
            medium?: { url?: string };
            high?: { url?: string };
            default?: { url?: string };
          };
        };
      }>;
    };

    if (!res.ok) {
      return NextResponse.json(
        {
          hits: [],
          configured: true,
          error: data.error?.message || "YouTube arama başarısız",
        },
        { status: 502 },
      );
    }

    const hits: YoutubeHit[] = (data.items ?? [])
      .map((item) => {
        const id = item.id?.videoId;
        if (!id) return null;
        const sn = item.snippet;
        return {
          id,
          title: sn?.title || "Video",
          channel: sn?.channelTitle || "YouTube",
          thumb:
            sn?.thumbnails?.medium?.url ||
            sn?.thumbnails?.high?.url ||
            sn?.thumbnails?.default?.url ||
            "",
          publishedAt: sn?.publishedAt || "",
        };
      })
      .filter((h): h is YoutubeHit => Boolean(h?.id));

    return NextResponse.json({
      hits,
      configured: true,
      hint: hits.length ? null : "Sonuç yok — başka kelime deneyin",
    });
  } catch (err) {
    console.error("youtube search", err);
    return NextResponse.json({ error: "Arama başarısız" }, { status: 500 });
  }
}
