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
    }
  }
}

export function clearCache(): void {
  cache.clear();
}
