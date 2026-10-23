import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { isAccessTokenValid } from "@/lib/access-token";

const ACCESS_TOKEN_COOKIE = "access_token";

export function proxy(request: NextRequest) {
  const token = request.cookies.get(ACCESS_TOKEN_COOKIE)?.value;
  const isAuthenticated = isAccessTokenValid(token);
  const { pathname } = request.nextUrl;
  const isAuthPage = pathname === "/sign-in" || pathname === "/sign-up";
  const isProtectedPage =
    pathname === "/dashboard" ||
    pathname === "/chat" ||
    pathname.startsWith("/chat/");

  if (isAuthenticated && isAuthPage) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  if (!isAuthenticated && isProtectedPage && !token) {
    const signInUrl = new URL("/sign-in", request.url);
    signInUrl.searchParams.set(
      "next",
      `${pathname}${request.nextUrl.search}`,
    );

    return NextResponse.redirect(signInUrl);
  }

  if (token && !isAuthenticated) {
    const response = NextResponse.next();
    if (!isProtectedPage) {
      response.cookies.delete(ACCESS_TOKEN_COOKIE);
    }
    return response;
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/chat/:path*", "/sign-in", "/sign-up"],
};
