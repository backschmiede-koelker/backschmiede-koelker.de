"use server";

import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { updateProductPricesVisible } from "@/app/lib/site-settings.server";

type SessionLike = { user?: { role?: string | null } | null } | null | undefined;

function mustBeAdmin(session: SessionLike) {
  if (session?.user?.role !== "ADMIN") redirect("/login");
}

export async function saveGlobalProductPriceVisibility(input: { visible: boolean }) {
  const session = (await auth()) as SessionLike;
  mustBeAdmin(session);

  try {
    const visible = await updateProductPricesVisible(!!input.visible);
    return { ok: true, visible };
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : "Schalter konnte nicht gespeichert werden.",
    };
  }
}
