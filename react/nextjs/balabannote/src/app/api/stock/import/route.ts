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

const ALLOWED_HOSTS = [
  "images.pexels.com",
  "www.pexels.com",
  "pixabay.com",
  "cdn.pixabay.com",
  "images.unsplash.com",
  "plus.unsplash.com",
];

function hostAllowed(hostname: string) {
  const h = hostname.toLowerCase();
  return ALLOWED_HOSTS.some((a) => h === a || h.endsWith(`.${a}`));
}

export async function POST(req: Request) {
  try {
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json({ error: "Giriş gerekli" }, { status: 401 });
    }

    const body = (await req.json()) as {
      url?: string;
      name?: string;
      attribution?: string;
    };
    const remote = (body.url || "").trim();
    if (!remote) {
      return NextResponse.json({ error: "URL gerekli" }, { status: 400 });
    }

    let parsed: URL;
    try {
      parsed = new URL(remote);
    } catch {
      return NextResponse.json({ error: "Geçersiz URL" }, { status: 400 });
    }
    if (parsed.protocol !== "https:" && parsed.protocol !== "http:") {
      return NextResponse.json({ error: "Sadece http(s)" }, { status: 400 });
    }
    if (!hostAllowed(parsed.hostname)) {
      return NextResponse.json(
        { error: "Yalnızca Pexels / Pixabay / Unsplash görselleri" },
        { status: 400 },
      );
    }

    const res = await fetch(remote, {
      headers: {
        "User-Agent": "BalabanNote/1.0",
        Accept: "image/*",
      },
      redirect: "follow",
    });
    if (!res.ok) {
      return NextResponse.json({ error: "Görsel indirilemedi" }, { status: 502 });
    }

    const ctype = (res.headers.get("content-type") || "").split(";")[0].trim();
    if (ctype && !ctype.startsWith("image/")) {
      return NextResponse.json({ error: "URL bir görsel değil" }, { status: 400 });
    }

    const buf = Buffer.from(await res.arrayBuffer());
    if (buf.length <= 0 || buf.length > mediaMaxBytes()) {
      return NextResponse.json({ error: "Dosya boyutu uygun değil" }, { status: 400 });
    }

    const extFromType =
      ctype === "image/png"
        ? ".png"
        : ctype === "image/webp"
          ? ".webp"
          : ctype === "image/gif"
            ? ".gif"
            : ".jpg";
    const hintName = sanitizeOriginalName(body.name || `stock${extFromType}`);
    const withExt = path.extname(hintName) ? hintName : `${hintName}${extFromType}`;
    const id = makeMediaId(withExt);
    const dest = resolveMediaPath(id);
    if (!dest) {
      return NextResponse.json({ error: "Geçersiz dosya" }, { status: 400 });
    }
    mediaRootDir();
    fs.writeFileSync(dest, buf);

    const ext = path.extname(id);
    return NextResponse.json({
      id,
      kind: classifyExt(ext),
      name: withExt,
      url: `/api/media/${encodeURIComponent(id)}`,
      mime: mimeFromExt(ext),
      size: buf.length,
      attribution: body.attribution || "",
    });
  } catch (err) {
    console.error("stock import", err);
    return NextResponse.json({ error: "İçe aktarma başarısız" }, { status: 500 });
  }
}
