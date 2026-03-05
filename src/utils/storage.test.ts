import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { generateThumbnail, loadSavedProgressions, saveProgressions } from './storage'
import type { BoxData, Progression, ScaleDegree } from '../types'

// ─── Fixtures ─────────────────────────────────────────────────────────────────

const ALL_VIS = Object.fromEntries(
  (['1', '2', 'b3', '3', '4', 'b5', '5', 'b6', '6', 'b7', '7'] as ScaleDegree[]).map(d => [d, true])
) as Record<ScaleDegree, boolean>

function box(root: BoxData['chordRoot'], quality: BoxData['chordQuality']): BoxData {
  return {
    id: `box-${root}-${quality}`,
    chordRoot: root,
    chordQuality: quality,
    shapeIndex: 0,
    transposeOffset: 0,
    locked: true,
    scaleDegreeVisibility: { ...ALL_VIS },
  }
}

function prog(name: string, boxes: BoxData[]): Progression {
  return { id: `prog-${name}`, name, boxes }
}

// ─── localStorage mock ────────────────────────────────────────────────────────

let store: Record<string, string> = {}

beforeEach(() => {
  store = {}
  vi.stubGlobal('localStorage', {
    getItem: (key: string) => store[key] ?? null,
    setItem: (key: string, val: string) => { store[key] = val },
    removeItem: (key: string) => { delete store[key] },
    clear: () => { store = {} },
  })
})

afterEach(() => {
  vi.unstubAllGlobals()
})

// ─── generateThumbnail ────────────────────────────────────────────────────────

describe('generateThumbnail', () => {
  it('formats a single major box as root only (no suffix)', () => {
    expect(generateThumbnail([box('C', 'major')])).toBe('C')
  })

  it('formats minor as "m" suffix', () => {
    expect(generateThumbnail([box('A', 'minor')])).toBe('Am')
  })

  it('formats dominant as "7" suffix', () => {
    expect(generateThumbnail([box('G', 'dominant')])).toBe('G7')
  })

  it('joins 3 boxes with em-dashes', () => {
    const boxes = [box('A', 'minor'), box('D', 'minor'), box('E', 'dominant')]
    expect(generateThumbnail(boxes)).toBe('Am–Dm–E7')
  })

  it('shows all 4 boxes without ellipsis', () => {
    const boxes = [box('C', 'major'), box('A', 'minor'), box('F', 'major'), box('G', 'major')]
    expect(generateThumbnail(boxes)).toBe('C–Am–F–G')
  })

  it('truncates at 4 boxes and appends "…" for 5 boxes', () => {
    const boxes = [
      box('C', 'major'), box('A', 'minor'), box('F', 'major'),
      box('G', 'major'), box('E', 'minor'),
    ]
    const result = generateThumbnail(boxes)
    expect(result).toContain('…')
    expect(result).toBe('C–Am–F–G…')
  })

  it('truncates at 4 boxes for 12-bar blues (12 boxes)', () => {
    const boxes = Array(12).fill(null).map(() => box('A', 'dominant'))
    const result = generateThumbnail(boxes)
    expect(result).toBe('A7–A7–A7–A7…')
  })

  it('handles empty boxes array', () => {
    expect(generateThumbnail([])).toBe('')
  })

  it('Am–Dm–E7 example from spec', () => {
    const boxes = [box('A', 'minor'), box('D', 'minor'), box('E', 'dominant')]
    expect(generateThumbnail(boxes)).toBe('Am–Dm–E7')
  })
})

// ─── loadSavedProgressions ────────────────────────────────────────────────────

describe('loadSavedProgressions', () => {
  it('returns [] when localStorage is empty', () => {
    expect(loadSavedProgressions()).toEqual([])
  })

  it('returns [] when the key is missing', () => {
    expect(loadSavedProgressions()).toEqual([])
  })

  it('returns [] when stored value is invalid JSON', () => {
    store['pentatonic_progressions'] = 'not json {'
    expect(loadSavedProgressions()).toEqual([])
  })

  it('returns [] when stored value is not an array', () => {
    store['pentatonic_progressions'] = JSON.stringify({ invalid: true })
    expect(loadSavedProgressions()).toEqual([])
  })
})

// ─── saveProgressions / loadSavedProgressions round-trip ─────────────────────

describe('saveProgressions + loadSavedProgressions round-trip', () => {
  it('saves and reloads a single progression', () => {
    const prog1 = prog('Test', [box('A', 'minor'), box('D', 'minor')])
    saveProgressions([prog1])
    const loaded = loadSavedProgressions()
    expect(loaded).toHaveLength(1)
    expect(loaded[0].name).toBe('Test')
    expect(loaded[0].boxes).toHaveLength(2)
  })

  it('saves and reloads multiple progressions preserving order', () => {
    const progs = [
      prog('First', [box('C', 'major')]),
      prog('Second', [box('G', 'major')]),
      prog('Third', [box('A', 'minor')]),
    ]
    saveProgressions(progs)
    const loaded = loadSavedProgressions()
    expect(loaded).toHaveLength(3)
    expect(loaded.map(p => p.name)).toEqual(['First', 'Second', 'Third'])
  })

  it('overwrite replaces previous save', () => {
    saveProgressions([prog('Old', [box('A', 'minor')])])
    saveProgressions([prog('New', [box('G', 'major')])])
    const loaded = loadSavedProgressions()
    expect(loaded).toHaveLength(1)
    expect(loaded[0].name).toBe('New')
  })

  it('saving empty array clears storage', () => {
    saveProgressions([prog('Something', [box('A', 'minor')])])
    saveProgressions([])
    expect(loadSavedProgressions()).toEqual([])
  })

  it('preserves box data through round-trip', () => {
    const boxes = [box('F#', 'minor'), box('B', 'dominant')]
    saveProgressions([prog('Sharp', boxes)])
    const loaded = loadSavedProgressions()
    expect(loaded[0].boxes[0].chordRoot).toBe('F#')
    expect(loaded[0].boxes[1].chordQuality).toBe('dominant')
  })
})
