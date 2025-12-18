// app/api/about/_auth.ts
import { NextResponse } from "next/server";
import { auth } from "@/auth";

export async function requireAdminOr401() {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  return null;
}
