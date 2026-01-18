// app/api/auth/login-state/route.ts
import { NextResponse } from "next/server"
import { getRedis } from "@/lib/redis"
import { normalizeLoginKey } from "@/lib/auth-rate-limit"

const FAIL_PREFIX = "auth:login:fail:"
const LOCK_PREFIX = "auth:login:lock:"
const FAIL_WINDOW_SECONDS = 5 * 60
const LOCK_SECONDS = 10 * 60
const MAX_FAILURES = 5

export const runtime = "nodejs"

export async function POST(req: Request) {
  let username = ""

  try {
    const body = (await req.json()) as { username?: unknown }
    username = String(body?.username ?? "").trim()
  } catch {
    username = ""
  }

  if (!username) {
    return NextResponse.json(
      {
        locked: false,
        retryAfterSec: 0,
        failCount: 0,
        failWindowSecLeft: 0,
        maxFailures: MAX_FAILURES,
        lockSeconds: LOCK_SECONDS,
        failWindowSeconds: FAIL_WINDOW_SECONDS,
      },
      { headers: { "Cache-Control": "no-store" } }
    )
  }

  const usernameKey = normalizeLoginKey(username)
  const redis = await getRedis()

  const failKey = `${FAIL_PREFIX}${usernameKey}`
  const lockKey = `${LOCK_PREFIX}${usernameKey}`

  const [failCountStr, failTtl, lockTtl] = await Promise.all([
    redis.get(failKey),
    redis.ttl(failKey),
    redis.ttl(lockKey),
  ])

  const failCount = Math.max(0, Number(failCountStr ?? 0) || 0)
  const locked = lockTtl > 0
  const retryAfterSec = locked ? lockTtl : 0
  const failWindowSecLeft = failTtl > 0 ? failTtl : 0

  return NextResponse.json(
    {
      locked,
      retryAfterSec,
      failCount,
      failWindowSecLeft,
      maxFailures: MAX_FAILURES,
      lockSeconds: LOCK_SECONDS,
      failWindowSeconds: FAIL_WINDOW_SECONDS,
    },
    { headers: { "Cache-Control": "no-store" } }
  )
}
