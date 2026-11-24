import { LRUCache } from "lru-cache";

const WINDOW_MS = 60 * 1000;

function createRateLimiter() {
  const hits = new LRUCache<string, number>({ max: 5000, ttl: WINDOW_MS });

  return {
    check(limit: number, token: string): boolean {
      const count = (hits.get(token) ?? 0) + 1;
      hits.set(token, count, { noUpdateTTL: count > 1 });
      return count <= limit;
    },
  };
}

export const limiter = createRateLimiter();

export function getRequestIp(headerStore: Headers): string {
  const chain = (headerStore.get("x-forwarded-for") ?? "")
    .split(",")
    .map((part) => part.trim())
    .filter(Boolean);
  if (chain.length > 0) {
    return chain[chain.length - 1];
  }
  return headerStore.get("x-real-ip")?.trim() || "unknown";
}
