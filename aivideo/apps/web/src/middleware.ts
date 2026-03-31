import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const PROTECTED_PREFIX = "/dashboard";

function hasSupabaseSessionCookie(request: NextRequest) {
  const cookieNames = request.cookies.getAll().map(({ name }) => name);
  const hasLegacyPair =
    cookieNames.includes("sb-access-token") && cookieNames.includes("sb-refresh-token");
  if (hasLegacyPair) {
    return true;
  }

  return cookieNames.some(
    (name) =>
      name.startsWith("sb-") &&
      name.includes("-auth-token") &&
      !name.includes("-auth-token-code-verifier")
  );
}

export function middleware(request: NextRequest) {
  const isProtected = request.nextUrl.pathname.startsWith(PROTECTED_PREFIX);
  if (!isProtected) {
    return NextResponse.next();
  }

  if (!hasSupabaseSessionCookie(request)) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("next", request.nextUrl.pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*"]
};
