const LIKED_PRODUCTS_STORAGE_KEY = "likedProductIds"
const WISHLIST_UPDATED_EVENT = "wishlistUpdated"

export function getLikedProductIds(): string[] {
  if (typeof window === "undefined") return []

  try {
    const storedLikes = localStorage.getItem(LIKED_PRODUCTS_STORAGE_KEY)
    if (!storedLikes) return []
    const parsedLikes: unknown = JSON.parse(storedLikes)

    if (!Array.isArray(parsedLikes)) return []
    return parsedLikes.filter((id): id is string => typeof id === "string")
  } catch {
    return []
  }
}

export function toggleLikedProduct(productId: string): string[] {
  const currentLikes = getLikedProductIds()
  const nextLikes = currentLikes.includes(productId)
    ? currentLikes.filter((id) => id !== productId)
    : [...currentLikes, productId]

  localStorage.setItem(LIKED_PRODUCTS_STORAGE_KEY, JSON.stringify(nextLikes))
  window.dispatchEvent(new Event(WISHLIST_UPDATED_EVENT))

  return nextLikes
}

export function wishlistUpdatedEventName(): string {
  return WISHLIST_UPDATED_EVENT
}

