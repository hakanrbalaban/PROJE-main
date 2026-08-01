import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { getSessionUser } from "@/lib/auth";
import { getActiveSqlitePath, resetSqliteConnection } from "@/lib/db";
import {
  loadSettings,
  resolveDataDir,
  saveSettings,
} from "@/lib/settings";

export async function GET() {
  try {
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json({ error: "Giriş gerekli" }, { status: 401 });
    }
    return NextResponse.json({
      dataDir: resolveDataDir(),
      dbPath: getActiveSqlitePath(),
    });
  } catch (err) {
    console.error("settings GET", err);
    return NextResponse.json({ error: "Ayarlar okunamadı" }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json({ error: "Giriş gerekli" }, { status: 401 });
    }

    const body = (await req.json()) as { dataDir?: string };
    const dataDir = (body.dataDir ?? "").trim();
    if (!dataDir) {
      return NextResponse.json({ error: "Klasör yolu gerekli" }, { status: 400 });
    }

    const resolved = path.resolve(dataDir);
    fs.mkdirSync(resolved, { recursive: true });

    // Yazılabilir mi dene
    const probe = path.join(resolved, ".balaban-write-test");
    fs.writeFileSync(probe, "ok");
    fs.unlinkSync(probe);

    saveSettings({ ...loadSettings(), dataDir: resolved });
    resetSqliteConnection();

    return NextResponse.json({
      ok: true,
      dataDir: resolved,
      dbPath: getActiveSqlitePath(),
      restartSuggested: true,
    });
  } catch (err) {
    console.error("settings PUT", err);
    return NextResponse.json(
      {
        error:
          err instanceof Error
            ? err.message
            : "Klasör ayarlanamadı (yazma izni var mı?)",
      },
      { status: 500 },
    );
  }
}
