import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { PUBLIC_ROUTES_SET } from "@/lib/public-routes";

export function proxy(request: NextRequest) {
  const token = request.cookies.get("access_token");
  const { pathname } = request.nextUrl;

  if (token && PUBLIC_ROUTES_SET.has(pathname)) {
    return NextResponse.redirect(new URL("/triagem", request.url));
  }

  if (!token && !PUBLIC_ROUTES_SET.has(pathname)) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|icon\\.svg|icon\\.png|apple-icon\\.png|.*\\.ico).*)"],
};
