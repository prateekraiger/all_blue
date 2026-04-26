"use client"

import { useState, useEffect } from "react"

/**
 * useDebounce — Debounces a value by the given delay.
 *
 * @param value  The value to debounce
 * @param delay  Debounce delay in ms (default: 350)
 * @returns Debounced value
 *
 * @example
 * const debouncedQuery = useDebounce(searchQuery, 400)
 * useEffect(() => { fetchResults(debouncedQuery) }, [debouncedQuery])
 */
export function useDebounce<T>(value: T, delay = 350): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value)

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)

    return () => {
      clearTimeout(timer)
    }
  }, [value, delay])

  return debouncedValue
}
