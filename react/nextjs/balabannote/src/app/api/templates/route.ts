import { NextResponse } from "next/server";
import { attachSessionCookie, getSessionUser } from "@/lib/auth";
import { queryTemplates, templateLibraryStats } from "@/lib/templates/store";

export async function GET(req: Request) {
  try {
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json({ error: "Giriş gerekli" }, { status: 401 });
    }

    const url = new URL(req.url);
    const action = url.searchParams.get("action");

    if (action === "stats") {
      const res = NextResponse.json(templateLibraryStats());
      await attachSessionCookie(res, user);
      return res;
    }

    const data = queryTemplates({
      q: url.searchParams.get("q") ?? undefined,
      category: url.searchParams.get("category") ?? undefined,
      kind: url.searchParams.get("kind") ?? undefined,
      page: Number(url.searchParams.get("page") ?? "1") || 1,
      pageSize: Number(url.searchParams.get("pageSize") ?? "24") || 24,
    });

    const res = NextResponse.json(data);
    await attachSessionCookie(res, user);
    return res;
  } catch (err) {
    console.error("templates GET", err);
    return NextResponse.json({ error: "Şablonlar yüklenemedi" }, { status: 500 });
  }
}
