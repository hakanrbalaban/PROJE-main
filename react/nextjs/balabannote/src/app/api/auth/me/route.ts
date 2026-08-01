import { NextResponse } from "next/server";
import { attachSessionCookie, getSessionUser } from "@/lib/auth";

export async function GET() {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ user: null }, { status: 401 });
  }
  const res = NextResponse.json({ user });
  // Sliding session: aktif kullanımda süre yenilenir
  await attachSessionCookie(res, user);
  return res;
}
