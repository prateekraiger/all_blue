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
    }
  }
}

export function prefetch<T>(key: string, fetcher: () => Promise<T>, ttlMs = 5 * 60 * 1000): void {
  void cachedFetch(key, fetcher, ttlMs)
}

