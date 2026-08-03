import { NextResponse } from "next/server";
import { attachSessionCookie, getSessionUser } from "@/lib/auth";
import { TEMPLATE_TARGET_COUNT } from "@/lib/templates/generate";
import { writeTemplateLibrary } from "@/lib/templates/store";

export async function POST(req: Request) {
  try {
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json({ error: "Giriş gerekli" }, { status: 401 });
    }

    const body = (await req.json().catch(() => ({}))) as { count?: number };
    const count = Math.min(
      5000,
      Math.max(1, Number(body.count) || TEMPLATE_TARGET_COUNT),
    );

    const index = writeTemplateLibrary(count);

    const res = NextResponse.json({
      ok: true,
      count: index.count,
      root: index.root,
      categories: index.categories,
      generatedAt: index.generatedAt,
    });
    await attachSessionCookie(res, user);
    return res;
  } catch (err) {
    console.error("templates generate", err);
    return NextResponse.json(
      { error: "Şablon üretimi başarısız", detail: String(err) },
      { status: 500 },
    );
  }
}
