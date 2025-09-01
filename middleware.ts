// /middleware.ts
import { NextResponse, type NextRequest } from "next/server"
import { auth } from "@/auth"

type NextRequestWithSession = NextRequest & {
  auth?: { user?: { role?: string | null } } | null
}

export default auth((req: NextRequestWithSession) => {
  const { pathname } = req.nextUrl

  if (pathname.startsWith("/api/upload")) {
    return (req.auth?.user?.role === "ADMIN")
      ? NextResponse.next()
      : NextResponse.redirect(new URL("/login", req.nextUrl.origin))
  }

  if (pathname.startsWith("/admin")) {
    return (req.auth?.user?.role === "ADMIN")
      ? NextResponse.next()
      : NextResponse.redirect(new URL("/login", req.nextUrl.origin))
  }

  if (pathname.startsWith("/api/products")) {
    if (req.method === "GET") return NextResponse.next()
    return (req.auth?.user?.role === "ADMIN")
      ? NextResponse.next()
      : NextResponse.redirect(new URL("/login", req.nextUrl.origin))
  }

  return NextResponse.next()
})

export const config = {
  matcher: ["/admin/:path*", "/api/products/:path*", "/api/offers/:path*", "/api/upload/:path*"],
}
