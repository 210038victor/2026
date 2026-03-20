/**
 * Read a JSON value from localStorage.
 * Returns null if key doesn't exist or JSON is invalid.
 */
export function readStorage<T>(key: string): T | null {
  try {
    const raw = localStorage.getItem(key)
    if (raw === null) return null
    return JSON.parse(raw) as T
  } catch {
    return null
  }
}

/**
 * Write a JSON-serializable value to localStorage.
 * Returns true on success, false on failure (e.g. quota exceeded).
 */
export function writeStorage<T>(key: string, value: T): boolean {
  try {
    localStorage.setItem(key, JSON.stringify(value))
    return true
  } catch {
    return false
  }
}

/**
 * Remove a key from localStorage.
 */
export function removeStorage(key: string): void {
  try {
    localStorage.removeItem(key)
  } catch {
    // ignore
  }
}
