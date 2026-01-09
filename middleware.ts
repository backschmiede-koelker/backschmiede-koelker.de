// middleware.ts
import { NextResponse, type NextRequest } from "next/server";
import { auth } from "@/auth";
import { v4 as uuid } from "uuid";

type ReqWithAuth = NextRequest & {
  auth?: { user?: { role?: string | null } } | null;
};

export default auth((req: ReqWithAuth) => {
  const url = req.nextUrl;
  const { pathname } = url;

  const base = NextResponse.next();

  // sid Cookie
  const existingSid = req.cookies.get("sid")?.value;
  if (!existingSid) {
    base.cookies.set("sid", uuid(), {
      httpOnly: true,
      sameSite: "lax",
      secure: true,
      maxAge: 60 * 60 * 24,
      path: "/",
    });
  }

  const redirectWithCookies = (to: string) => {
    const r = NextResponse.redirect(new URL(to, url.origin));
    const sidCookie = base.cookies.get("sid");
    if (sidCookie) r.cookies.set(sidCookie);
    return r;
  };

  const isAdmin = req.auth?.user?.role === "ADMIN";

  // Upload: immer Admin
  if (pathname.startsWith("/api/upload")) {
    return isAdmin ? base : redirectWithCookies("/login");
  }

  // Admin pages: immer Admin
  if (pathname.startsWith("/admin")) {
    return isAdmin ? base : redirectWithCookies("/login");
  }

  // Products / Jobs: GET öffentlich, sonst Admin
  if (pathname.startsWith("/api/products")) {
    if (req.method === "GET") return base;
    return isAdmin ? base : redirectWithCookies("/login");
  }

  if (pathname.startsWith("/api/jobs")) {
    if (req.method === "GET") return base;
    return isAdmin ? base : redirectWithCookies("/login");
  }

  if (pathname.startsWith("/api/about")) {
    if (pathname === "/api/about" && req.method === "GET") return base;
    return isAdmin ? base : redirectWithCookies("/login");
  }

  if (pathname.startsWith("/api/events")) {
    if (req.method === "GET") return base;
    return isAdmin ? base : redirectWithCookies("/login");
  }

  return base;
});

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml|images|fonts).*)",
  ],
  runtime: "nodejs",
};
