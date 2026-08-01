import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { createUser, findUserByEmail, saveWorkspaceData } from "@/lib/db";
import { attachSessionCookie } from "@/lib/auth";
import { createDefaultWorkspace } from "@/lib/storage";

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as {
      email?: string;
      password?: string;
      name?: string;
    };
    const email = (body.email ?? "").trim().toLowerCase();
    const password = body.password ?? "";
    const name = (body.name ?? "").trim() || email.split("@")[0] || "Kullanıcı";

    if (!email || !email.includes("@")) {
      return NextResponse.json({ error: "Geçerli e-posta gir" }, { status: 400 });
    }
    if (password.length < 4) {
      return NextResponse.json(
        { error: "Şifre en az 4 karakter olmalı" },
        { status: 400 },
      );
    }

    const existing = await findUserByEmail(email);
    if (existing) {
      return NextResponse.json(
        { error: "Bu e-posta zaten kayıtlı" },
        { status: 409 },
      );
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const userId = await createUser({ email, name, passwordHash });
    await saveWorkspaceData(userId, createDefaultWorkspace());

    const sessionUser = { id: userId, email, name };
    const res = NextResponse.json({ user: sessionUser });
    await attachSessionCookie(res, sessionUser);
    return res;
  } catch (err) {
    console.error("register", err);
    const message =
      err instanceof Error && /ECONNREFUSED|ENOTFOUND|ER_ACCESS/i.test(err.message)
        ? "MySQL’e bağlanılamadı. XAMPP’te MySQL’i başlat."
        : err instanceof Error
          ? `Kayıt başarısız: ${err.message}`
          : "Kayıt başarısız";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
