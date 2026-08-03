import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { getSessionUser } from "@/lib/auth";
import {
  classifyExt,
  makeMediaId,
  mediaMaxBytes,
  mediaRootDir,
  mimeFromExt,
  resolveMediaPath,
  sanitizeOriginalName,
} from "@/lib/media";

export async function POST(req: Request) {
  try {
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json({ error: "Giriş gerekli" }, { status: 401 });
    }

    const form = await req.formData();
    const file = form.get("file");
    if (!(file instanceof File)) {
      return NextResponse.json({ error: "Dosya gerekli" }, { status: 400 });
    }
    if (file.size <= 0 || file.size > mediaMaxBytes()) {
      return NextResponse.json(
        { error: `Dosya boyutu 1 byte – ${Math.round(mediaMaxBytes() / 1024 / 1024)} MB olmalı` },
        { status: 400 },
      );
    }

    const original = sanitizeOriginalName(file.name || "dosya");
    const id = makeMediaId(original);
    const dest = resolveMediaPath(id);
    if (!dest) {
      return NextResponse.json({ error: "Geçersiz dosya adı" }, { status: 400 });
    }

    mediaRootDir();
    const buf = Buffer.from(await file.arrayBuffer());
    fs.writeFileSync(dest, buf);

    const ext = path.extname(id);
    const kind = classifyExt(ext);
    return NextResponse.json({
      id,
      kind,
      name: original,
      url: `/api/media/${encodeURIComponent(id)}`,
      mime: file.type || mimeFromExt(ext),
      size: file.size,
    });
  } catch (err) {
    console.error("media POST", err);
    return NextResponse.json({ error: "Yükleme başarısız" }, { status: 500 });
  }
}
