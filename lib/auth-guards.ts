// lib/auth-guards.ts
import { NextResponse } from "next/server";
import { auth } from "@/auth";

type RouteHandlerReturn = Response | void | Promise<Response | void>;

export async function requireAdmin() {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  return null;
}

export function withAdminGuard<Fn extends (...args: never[]) => RouteHandlerReturn>(
  handler: Fn
): (...args: Parameters<Fn>) => ReturnType<Fn> {
  return (async (...args: Parameters<Fn>) => {
    const denied = await requireAdmin();
    if (denied) return denied as ReturnType<Fn>;
    return handler(...args);
  }) as (...args: Parameters<Fn>) => ReturnType<Fn>;
}
