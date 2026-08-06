import { NextResponse } from "next/server";
import { AUTH_COOKIE, passwordToken } from "@/lib/auth";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const expected = process.env.APP_PASSWORD;
  if (!expected) {
    return NextResponse.json(
      { error: "APP_PASSWORD が設定されていません" },
      { status: 503 },
    );
  }

  const { password } = (await req.json().catch(() => ({}))) as {
    password?: string;
  };

  if (!password || password !== expected) {
    return NextResponse.json(
      { error: "パスワードが違います" },
      { status: 401 },
    );
  }

  const res = NextResponse.json({ ok: true });
  res.cookies.set(AUTH_COOKIE, await passwordToken(expected), {
    httpOnly: true,
    sameSite: "lax",
    secure: new URL(req.url).protocol === "https:",
    path: "/",
    maxAge: 60 * 60 * 24 * 30, // 30日
  });
  return res;
}
