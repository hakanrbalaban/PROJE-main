import { NextResponse } from "next/server";
import { attachSessionCookie, getSessionUser } from "@/lib/auth";
import { readTemplateDetail } from "@/lib/templates/store";

type Ctx = { params: Promise<{ id: string }> };

export async function GET(_req: Request, ctx: Ctx) {
  try {
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json({ error: "Giriş gerekli" }, { status: 401 });
    }

    const { id } = await ctx.params;
    const detail = readTemplateDetail(id);
    if (!detail) {
      return NextResponse.json({ error: "Şablon bulunamadı" }, { status: 404 });
    }

    const res = NextResponse.json(detail);
    await attachSessionCookie(res, user);
    return res;
  } catch (err) {
    console.error("template detail", err);
    return NextResponse.json({ error: "Şablon okunamadı" }, { status: 500 });
  }
}
