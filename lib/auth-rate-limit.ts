// lib/auth-rate-limit.ts
import { getRedis } from "@/lib/redis";

const FAIL_PREFIX = "auth:login:fail:";
const LOCK_PREFIX = "auth:login:lock:";
const FAIL_WINDOW_SECONDS = 5 * 60;
const LOCK_SECONDS = 10 * 60;
const MAX_FAILURES = 5;

export function normalizeLoginKey(username: string) {
  return username.normalize("NFKC").trim().toLowerCase();
}

export async function isLoginLocked(usernameKey: string) {
  if (!usernameKey) return false;
  const redis = await getRedis();
  const locked = await redis.exists(`${LOCK_PREFIX}${usernameKey}`);
  return locked === 1;
}

export async function recordLoginFailure(usernameKey: string) {
  if (!usernameKey) return { locked: false, count: 0 };
  const redis = await getRedis();
  const failKey = `${FAIL_PREFIX}${usernameKey}`;
  const lockKey = `${LOCK_PREFIX}${usernameKey}`;

  const count = await redis.incr(failKey);
  if (count === 1) {
    await redis.expire(failKey, FAIL_WINDOW_SECONDS);
  }

  if (count >= MAX_FAILURES) {
    await redis.set(lockKey, "1", { EX: LOCK_SECONDS });
    return { locked: true, count };
  }

  return { locked: false, count };
}

export async function resetLoginFailures(usernameKey: string) {
  if (!usernameKey) return;
  const redis = await getRedis();
  await redis.del([`${FAIL_PREFIX}${usernameKey}`, `${LOCK_PREFIX}${usernameKey}`]);
}
