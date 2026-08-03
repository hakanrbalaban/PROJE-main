import { NextResponse } from "next/server";
import fs from "fs";
import { attachSessionCookie, getSessionUser } from "@/lib/auth";
import { templateThumbPath } from "@/lib/templates/paths";

type Ctx = { params: Promise<{ id: string }> };

export async function GET(_req: Request, ctx: Ctx) {
  try {
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json({ error: "Giriş gerekli" }, { status: 401 });
    }

    const { id } = await ctx.params;
    const safe = id.replace(/[^a-zA-Z0-9_-]/g, "");
    const file = templateThumbPath(safe);
    if (!fs.existsSync(file)) {
      return NextResponse.json({ error: "Kapak yok" }, { status: 404 });
    }

    const svg = fs.readFileSync(file, "utf8");
    const res = new NextResponse(svg, {
      headers: {
        "Content-Type": "image/svg+xml; charset=utf-8",
        "Cache-Control": "public, max-age=86400",
      },
    });
    await attachSessionCookie(res, user);
    return res;
  } catch (err) {
    console.error("template thumb", err);
    return NextResponse.json({ error: "Kapak okunamadı" }, { status: 500 });
  }
}
