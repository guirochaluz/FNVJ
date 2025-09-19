import { useEffect, useState } from 'react'

const isBrowser = () => typeof window !== 'undefined'

export function usePersistentState<T>(key: string, defaultValue: T) {
  const [state, setState] = useState<T>(() => {
    if (!isBrowser()) return defaultValue
    const stored = window.localStorage.getItem(key)
    if (!stored) return defaultValue
    try {
      return JSON.parse(stored) as T
    } catch (error) {
      console.warn('Failed to parse persisted state for', key, error)
      return defaultValue
    }
  })

  useEffect(() => {
    if (!isBrowser()) return
    try {
      window.localStorage.setItem(key, JSON.stringify(state))
    } catch (error) {
      console.warn('Failed to persist state for', key, error)
    }
  }, [key, state])

  return [state, setState] as const
}
