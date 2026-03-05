/**
 * Returns true if the current URL contains the query param `?admin=true`.
 * Works in both browser and test environments.
 */
export function isAdminMode(): boolean {
  try {
    const params = new URLSearchParams(window.location.search)
    return params.get('admin') === 'true'
  } catch {
    return false
  }
}
