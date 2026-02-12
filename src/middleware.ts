import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const AUTH_COOKIE_NAME = "shira_admin_auth";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (
    pathname === "/admin/login" ||
    pathname.startsWith("/api/public") ||
    pathname === "/api/health" ||
    !pathname.startsWith("/admin")
  ) {
    return NextResponse.next();
  }

  const authCookie = request.cookies.get(AUTH_COOKIE_NAME);

  if (!authCookie) {
    const loginUrl = new URL("/admin/login", request.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
