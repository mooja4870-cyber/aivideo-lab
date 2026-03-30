import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const PROTECTED_PREFIX = "/dashboard";

export function middleware(request: NextRequest) {
  const isProtected = request.nextUrl.pathname.startsWith(PROTECTED_PREFIX);
  if (!isProtected) {
    return NextResponse.next();
  }

  const hasAccessToken = request.cookies.has("sb-access-token");
  const hasRefreshToken = request.cookies.has("sb-refresh-token");
  if (!hasAccessToken || !hasRefreshToken) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("next", request.nextUrl.pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*"]
};

