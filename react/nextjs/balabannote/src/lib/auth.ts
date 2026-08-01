import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import type { NextResponse } from "next/server";

export const SESSION_COOKIE = "bn_session";

/** 1 yıl — uygulama oturumu; çıkış yapılana veya süre dolana kadar */
export const SESSION_TTL = "365d";
export const SESSION_MAX_AGE_SEC = 60 * 60 * 24 * 365;

export type SessionUser = {
  id: number;
  email: string;
  name: string;
};

function secretKey() {
  const secret = process.env.AUTH_SECRET;
  if (!secret || secret.length < 16) {
    throw new Error("AUTH_SECRET env eksik veya çok kısa");
  }
  return new TextEncoder().encode(secret);
}

export async function createSessionToken(user: SessionUser): Promise<string> {
  return new SignJWT({
    email: user.email,
    name: user.name,
  })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(String(user.id))
    .setIssuedAt()
    .setExpirationTime(SESSION_TTL)
    .sign(secretKey());
}

export async function verifySessionToken(
  token: string,
): Promise<SessionUser | null> {
  try {
    const { payload } = await jwtVerify(token, secretKey());
    const id = Number(payload.sub);
    if (
      !id ||
      typeof payload.email !== "string" ||
      typeof payload.name !== "string"
    ) {
      return null;
    }
    return { id, email: payload.email, name: payload.name };
  } catch {
    return null;
  }
}

export async function getSessionUser(): Promise<SessionUser | null> {
  const jar = await cookies();
  const token = jar.get(SESSION_COOKIE)?.value;
  if (!token) return null;
  return verifySessionToken(token);
}

export function sessionCookieOptions(maxAge = SESSION_MAX_AGE_SEC) {
  return {
    httpOnly: true,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge,
    // Prefer keeping the cookie when the browser discards others under pressure
    priority: "high" as const,
  };
}

/** Sliding session: her güvenli istekte süreyi baştan başlat */
export async function attachSessionCookie(
  res: NextResponse,
  user: SessionUser,
): Promise<void> {
  const token = await createSessionToken(user);
  res.cookies.set(SESSION_COOKIE, token, sessionCookieOptions());
}

export async function clearSessionCookie(res: NextResponse): Promise<void> {
  res.cookies.set(SESSION_COOKIE, "", {
    ...sessionCookieOptions(0),
    maxAge: 0,
  });
}
