<<<<<<< HEAD
type CacheEntry<T> = {
  value: T
  expiresAt: number
}

const cacheStore = new Map<string, CacheEntry<unknown>>()
const inFlightRequests = new Map<string, Promise<unknown>>()

export async function cachedFetch<T>(
  key: string,
  fetcher: () => Promise<T>,
  ttlMs: number
): Promise<T> {
  const now = Date.now()
  const cached = cacheStore.get(key)

  if (cached && cached.expiresAt > now) {
    return cached.value as T
  }

  const pending = inFlightRequests.get(key)
  if (pending) {
    return pending as Promise<T>
  }

  const request = fetcher()
    .then((result) => {
      cacheStore.set(key, {
        value: result,
        expiresAt: Date.now() + ttlMs,
      })
      return result
    })
    .finally(() => {
      inFlightRequests.delete(key)
    })

  inFlightRequests.set(key, request)
  return request
}

export function invalidateCacheByPrefix(prefix: string): void {
  for (const key of cacheStore.keys()) {
    if (key.startsWith(prefix)) {
      cacheStore.delete(key)
    }
  }

  for (const key of inFlightRequests.keys()) {
    if (key.startsWith(prefix)) {
      inFlightRequests.delete(key)
=======
/**
 * Simple in-memory cache for API requests and data prefetching
 */

const cache = new Map<string, { data: any; timestamp: number }>();
const CACHE_TTL = 1000 * 60 * 5; // 5 minutes

export async function cachedFetch<T>(key: string, fetcher: () => Promise<T>): Promise<T> {
  const cached = cache.get(key);
  const now = Date.now();

  if (cached && now - cached.timestamp < CACHE_TTL) {
    return cached.data;
  }

  const data = await fetcher();
  cache.set(key, { data, timestamp: now });
  return data;
}

export function prefetch<T>(key: string, fetcher: () => Promise<T>): void {
  // If already in cache and not expired, don't refetch
  const cached = cache.get(key);
  const now = Date.now();
  if (cached && now - cached.timestamp < CACHE_TTL) return;

  // Background fetch
  fetcher()
    .then((data) => cache.set(key, { data, timestamp: Date.now() }))
    .catch((err) => console.error(`Prefetch failed for ${key}:`, err));
}

export function invalidateCacheByPrefix(prefix: string): void {
  for (const key of cache.keys()) {
    if (key.startsWith(prefix)) {
      cache.delete(key);
>>>>>>> f0c5806fdbc270e57f3a0d53d83bb4ae731097d1
    }
  }
}

<<<<<<< HEAD
export function prefetch<T>(key: string, fetcher: () => Promise<T>, ttlMs = 5 * 60 * 1000): void {
  void cachedFetch(key, fetcher, ttlMs)
}

=======
export function clearCache(): void {
  cache.clear();
}
>>>>>>> f0c5806fdbc270e57f3a0d53d83bb4ae731097d1
