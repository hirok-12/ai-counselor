import { NextRequest, NextResponse } from "next/server";
import { AUTH_COOKIE, passwordToken } from "@/lib/auth";

const PUBLIC_PATHS = ["/login", "/api/login"];

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  if (PUBLIC_PATHS.some((p) => pathname === p || pathname.startsWith(`${p}/`))) {
    return NextResponse.next();
  }

  const password = process.env.APP_PASSWORD;
  if (!password) {
    return new NextResponse(
      "APP_PASSWORD が設定されていません。wrangler secret put APP_PASSWORD（本番）または .dev.vars（ローカル）で設定してください。",
      { status: 503, headers: { "Content-Type": "text/plain; charset=utf-8" } },
    );
  }

  const cookie = req.cookies.get(AUTH_COOKIE)?.value;
  if (cookie && cookie === (await passwordToken(password))) {
    return NextResponse.next();
  }

  if (pathname.startsWith("/api/")) {
    return NextResponse.json({ error: "認証が必要です" }, { status: 401 });
  }

  const url = req.nextUrl.clone();
  url.pathname = "/login";
  url.search = "";
  return NextResponse.redirect(url);
}

export const config = {
  // 静的アセット以外すべてを保護
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
