import { createClient } from "redis";

let client:
  | ReturnType<typeof createClient>
  | null = null;
let connecting: Promise<ReturnType<typeof createClient>> | null = null;

function requireRedisUrl() {
  const url = process.env.REDIS_URL;
  if (!url) {
    throw new Error("Missing REDIS_URL");
  }
  return url;
}

export async function getRedis() {
  if (client?.isOpen) return client;
  if (connecting) return connecting;

  const url = requireRedisUrl();
  const next = createClient({
    url,
    socket: {
      reconnectStrategy: (retries) => Math.min(1000 * 2 ** retries, 10_000),
    },
  });
  next.on("error", () => {});
  client = next;

  connecting = next
    .connect()
    .then(() => {
      connecting = null;
      return next;
    })
    .catch((err) => {
      connecting = null;
      client = null;
      throw err;
    });
  return connecting;
}
