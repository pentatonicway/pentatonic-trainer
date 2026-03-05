import { describe, it, expect } from 'vitest'
import { PRESETS, VALID_ROOTS, VALID_QUALITIES } from './presets'

describe('PRESETS', () => {

  it('contains exactly 20 progressions', () => {
    expect(PRESETS).toHaveLength(20)
  })

  it('every preset has a non-empty name', () => {
    for (const p of PRESETS) {
      expect(p.name.length).toBeGreaterThan(0)
    }
  })

  it('every preset has a unique id', () => {
    const ids = PRESETS.map(p => p.id)
    expect(new Set(ids).size).toBe(PRESETS.length)
  })

  it('every preset has at least 1 box', () => {
    for (const p of PRESETS) {
      expect(p.boxes.length).toBeGreaterThan(0)
    }
  })

  it('every box has a valid NoteRoot', () => {
    for (const p of PRESETS) {
      for (const box of p.boxes) {
        expect(VALID_ROOTS.has(box.chordRoot), `"${box.chordRoot}" is not a valid NoteRoot in "${p.name}"`).toBe(true)
      }
    }
  })

  it('every box has a valid ChordQuality', () => {
    for (const p of PRESETS) {
      for (const box of p.boxes) {
        expect(VALID_QUALITIES.has(box.chordQuality), `"${box.chordQuality}" is not a valid ChordQuality in "${p.name}"`).toBe(true)
      }
    }
  })

  it('every box starts with shapeIndex 0', () => {
    for (const p of PRESETS) {
      for (const box of p.boxes) {
        expect(box.shapeIndex).toBe(0)
      }
    }
  })

  it('every box starts locked', () => {
    for (const p of PRESETS) {
      for (const box of p.boxes) {
        expect(box.locked).toBe(true)
      }
    }
  })

  it('every box has all scale degrees visible', () => {
    const degrees = ['1', '2', 'b3', '3', '4', 'b5', '5', 'b6', '6', 'b7', '7']
    for (const p of PRESETS) {
      for (const box of p.boxes) {
        for (const d of degrees) {
          expect(box.scaleDegreeVisibility[d as keyof typeof box.scaleDegreeVisibility]).toBe(true)
        }
      }
    }
  })

  // ── Spot-check specific presets ──────────────────────────────────────────

  it('"I–IV–V" has 3 boxes: A major, D major, E major', () => {
    const p = PRESETS.find(p => p.name === 'I–IV–V')!
    expect(p).toBeTruthy()
    expect(p.boxes).toHaveLength(3)
    expect(p.boxes[0].chordRoot).toBe('A')
    expect(p.boxes[0].chordQuality).toBe('major')
    expect(p.boxes[1].chordRoot).toBe('D')
    expect(p.boxes[2].chordRoot).toBe('E')
  })

  it('"12-Bar Blues" has 12 boxes', () => {
    const p = PRESETS.find(p => p.name === '12-Bar Blues')!
    expect(p).toBeTruthy()
    expect(p.boxes).toHaveLength(12)
  })

  it('"12-Bar Blues" boxes are all dominant quality', () => {
    const p = PRESETS.find(p => p.name === '12-Bar Blues')!
    for (const box of p.boxes) {
      expect(box.chordQuality).toBe('dominant')
    }
  })

  it('"Pachelbel" has 8 boxes', () => {
    const p = PRESETS.find(p => p.name === 'Pachelbel')!
    expect(p).toBeTruthy()
    expect(p.boxes).toHaveLength(8)
  })

  it('"ii–V–I" has D minor → G dominant → C major', () => {
    const p = PRESETS.find(p => p.name === 'ii–V–I')!
    expect(p.boxes[0]).toMatchObject({ chordRoot: 'D', chordQuality: 'minor' })
    expect(p.boxes[1]).toMatchObject({ chordRoot: 'G', chordQuality: 'dominant' })
    expect(p.boxes[2]).toMatchObject({ chordRoot: 'C', chordQuality: 'major' })
  })

  it('"Andalusian Cadence" ends with E major', () => {
    const p = PRESETS.find(p => p.name === 'Andalusian Cadence')!
    const last = p.boxes[p.boxes.length - 1]
    expect(last.chordRoot).toBe('E')
    expect(last.chordQuality).toBe('major')
  })
})
