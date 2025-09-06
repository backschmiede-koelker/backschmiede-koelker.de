// /middleware.ts
import { NextResponse, type NextRequest } from "next/server";
import { auth } from "@/auth";
import { v4 as uuid } from "uuid";

type NextRequestWithSession = NextRequest & {
  auth?: { user?: { role?: string | null } } | null;
};

export default auth((req: NextRequestWithSession) => {
  const url = req.nextUrl;
  const { pathname } = url;

  // Immer eine Response-Instanz haben, damit wir Cookies setzen können
  const base = NextResponse.next();

  // 1) Anonyme, kurzlebige SID (24h) für Sessions (kein Profiling)
  const existingSid = req.cookies.get("sid")?.value;
  if (!existingSid) {
    base.cookies.set("sid", uuid(), {
      httpOnly: true,
      sameSite: "lax",
      secure: true,
      maxAge: 60 * 60 * 24, // 24h
      path: "/",
    });
  }

  // 2) Deine bestehenden Schutzregeln (unverändert, aber Cookie in Redirects mitschicken)
  const redirectWithCookies = (to: string) => {
    const r = NextResponse.redirect(new URL(to, url.origin));
    const sidCookie = base.cookies.get("sid");
    if (sidCookie) r.cookies.set(sidCookie); 
    return r;
  };

  if (pathname.startsWith("/api/upload")) {
    return (req.auth?.user?.role === "ADMIN")
      ? base
      : redirectWithCookies("/login");
  }

  if (pathname.startsWith("/admin")) {
    return (req.auth?.user?.role === "ADMIN")
      ? base
      : redirectWithCookies("/login");
  }

  if (pathname.startsWith("/api/products")) {
    if (req.method === "GET") return base;
    return (req.auth?.user?.role === "ADMIN")
      ? base
      : redirectWithCookies("/login");
  }

  return base;
});

// Matcher: SID möglichst überall setzen, aber statische Assets ausschließen
export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml|images|fonts).*)",
  ],
};
