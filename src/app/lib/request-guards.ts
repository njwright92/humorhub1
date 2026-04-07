import "server-only";

type RateLimitOptions = {
  key: string;
  windowMs: number;
  maxRequests: number;
};

type RateLimitEntry = {
  count: number;
  resetAt: number;
};

type RateLimitStore = Map<string, RateLimitEntry>;

declare global {
  var __humorHubRateLimitStore: RateLimitStore | undefined;
}

const rateLimitStore =
  globalThis.__humorHubRateLimitStore ??
  (globalThis.__humorHubRateLimitStore = new Map());

export function getClientIp(request: Pick<Request, "headers">): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    const firstIp = forwarded.split(",")[0]?.trim();
    if (firstIp) return firstIp;
  }

  const realIp = request.headers.get("x-real-ip")?.trim();
  if (realIp) return realIp;

  const cloudflareIp = request.headers.get("cf-connecting-ip")?.trim();
  if (cloudflareIp) return cloudflareIp;

  return "unknown";
}

export function hasTrustedOrigin(
  request: Pick<Request, "headers"> & { nextUrl: { origin: string } },
): boolean {
  const origin = request.headers.get("origin");
  if (!origin) return true;

  try {
    return new URL(origin).origin === request.nextUrl.origin;
  } catch {
    return false;
  }
}

export function checkRateLimit(
  request: Pick<Request, "headers">,
  { key, windowMs, maxRequests }: RateLimitOptions,
) {
  const now = Date.now();

  for (const [storedKey, entry] of rateLimitStore.entries()) {
    if (entry.resetAt <= now) {
      rateLimitStore.delete(storedKey);
    }
  }

  const clientKey = `${key}:${getClientIp(request)}`;
  const existing = rateLimitStore.get(clientKey);

  if (!existing || existing.resetAt <= now) {
    rateLimitStore.set(clientKey, {
      count: 1,
      resetAt: now + windowMs,
    });

    return {
      allowed: true,
      remaining: Math.max(0, maxRequests - 1),
      retryAfterMs: 0,
    } as const;
  }

  if (existing.count >= maxRequests) {
    return {
      allowed: false,
      remaining: 0,
      retryAfterMs: Math.max(0, existing.resetAt - now),
    } as const;
  }

  existing.count += 1;
  rateLimitStore.set(clientKey, existing);

  return {
    allowed: true,
    remaining: Math.max(0, maxRequests - existing.count),
    retryAfterMs: 0,
  } as const;
}
