import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { getSessionUser } from "@/lib/auth";
import { mimeFromExt, resolveMediaPath } from "@/lib/media";

type Ctx = { params: Promise<{ id: string }> };

export async function GET(_req: Request, ctx: Ctx) {
  try {
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json({ error: "Giriş gerekli" }, { status: 401 });
    }

    const { id: raw } = await ctx.params;
    const id = decodeURIComponent(raw || "");
    const filePath = resolveMediaPath(id);
    if (!filePath || !fs.existsSync(filePath)) {
      return NextResponse.json({ error: "Dosya yok" }, { status: 404 });
    }

    const data = fs.readFileSync(filePath);
    const ext = path.extname(filePath);
    return new NextResponse(data, {
      headers: {
        "Content-Type": mimeFromExt(ext),
        "Content-Length": String(data.length),
        "Cache-Control": "private, max-age=31536000, immutable",
        "Content-Disposition": `inline; filename="${path.basename(filePath)}"`,
      },
    });
  } catch (err) {
    console.error("media GET", err);
    return NextResponse.json({ error: "Okunamadı" }, { status: 500 });
  }
}
