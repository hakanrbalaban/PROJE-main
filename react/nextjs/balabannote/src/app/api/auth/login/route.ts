import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { findUserByEmail } from "@/lib/db";
import { attachSessionCookie } from "@/lib/auth";

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as { email?: string; password?: string };
    const email = (body.email ?? "").trim().toLowerCase();
    const password = body.password ?? "";

    if (!email || !password) {
      return NextResponse.json(
        { error: "E-posta ve şifre gerekli" },
        { status: 400 },
      );
    }

    const user = await findUserByEmail(email);
    if (!user) {
      return NextResponse.json(
        { error: "E-posta veya şifre hatalı" },
        { status: 401 },
      );
    }

    const ok = await bcrypt.compare(password, user.password_hash);
    if (!ok) {
      return NextResponse.json(
        { error: "E-posta veya şifre hatalı" },
        { status: 401 },
      );
    }

    const sessionUser = {
      id: user.id,
      email: user.email,
      name: user.name,
    };
    const res = NextResponse.json({ user: sessionUser });
    await attachSessionCookie(res, sessionUser);
    return res;
  } catch (err) {
    console.error("login", err);
    const message =
      err instanceof Error && /ECONNREFUSED|ENOTFOUND|ER_ACCESS/i.test(err.message)
        ? "Veritabanına bağlanılamadı"
        : err instanceof Error
          ? `Giriş başarısız: ${err.message}`
          : "Giriş başarısız";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
