import { NextResponse } from "next/server";
import { attachSessionCookie, getSessionUser } from "@/lib/auth";
import { getWorkspaceData, saveWorkspaceData } from "@/lib/db";
import { createDefaultWorkspace, parseWorkspace } from "@/lib/storage";

export async function GET() {
  try {
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json({ error: "Giriş gerekli" }, { status: 401 });
    }

    const raw = await getWorkspaceData(user.id);
    const workspace = parseWorkspace(raw) ?? createDefaultWorkspace();

    if (!raw) {
      await saveWorkspaceData(user.id, workspace);
    }

    const res = NextResponse.json({ workspace });
    await attachSessionCookie(res, user);
    return res;
  } catch (err) {
    console.error("workspace GET", err);
    return NextResponse.json(
      { error: "Workspace yüklenemedi" },
      { status: 500 },
    );
  }
}

export async function PUT(req: Request) {
  try {
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json({ error: "Giriş gerekli" }, { status: 401 });
    }

    const body = (await req.json()) as { workspace?: unknown };
    const workspace = parseWorkspace(body.workspace);
    if (!workspace) {
      return NextResponse.json({ error: "Geçersiz workspace" }, { status: 400 });
    }

    await saveWorkspaceData(user.id, workspace);
    const res = NextResponse.json({ ok: true });
    await attachSessionCookie(res, user);
    return res;
  } catch (err) {
    console.error("workspace PUT", err);
    return NextResponse.json(
      { error: "Workspace kaydedilemedi" },
      { status: 500 },
    );
  }
}
