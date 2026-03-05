import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { isAdminMode } from './adminMode'

function setSearch(search: string) {
  vi.stubGlobal('window', {
    ...window,
    location: { ...window.location, search },
  })
}

afterEach(() => {
  vi.unstubAllGlobals()
})

describe('isAdminMode', () => {
  it('returns false when there is no query string', () => {
    setSearch('')
    expect(isAdminMode()).toBe(false)
  })

  it('returns false when query string has no admin param', () => {
    setSearch('?foo=bar')
    expect(isAdminMode()).toBe(false)
  })

  it('returns true when ?admin=true is present', () => {
    setSearch('?admin=true')
    expect(isAdminMode()).toBe(true)
  })

  it('returns false when ?admin=false', () => {
    setSearch('?admin=false')
    expect(isAdminMode()).toBe(false)
  })

  it('returns false when ?admin=1 (not strictly "true")', () => {
    setSearch('?admin=1')
    expect(isAdminMode()).toBe(false)
  })

  it('returns true when admin=true is among multiple params', () => {
    setSearch('?foo=bar&admin=true&baz=qux')
    expect(isAdminMode()).toBe(true)
  })

  it('returns false when admin=true appears in a value (not a key)', () => {
    setSearch('?foo=admin%3Dtrue')
    expect(isAdminMode()).toBe(false)
  })
})
