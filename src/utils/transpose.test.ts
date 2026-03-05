import { describe, it, expect } from 'vitest'
import { getInterval, transposeNote, transposeShape, transposeShapeToRoot } from './transpose'
import { AMINOR_SHAPES } from '../constants/shapes'
import type { ShapeData } from '../types'

// ─── getInterval ────────────────────────────────────────────────────────────

describe('getInterval', () => {
  it('same note → 0', () => {
    expect(getInterval('A', 'A')).toBe(0)
  })

  it('A → A# is 1 semitone', () => {
    expect(getInterval('A', 'A#')).toBe(1)
  })

  it('A → G# is 11 semitones (one below the octave)', () => {
    expect(getInterval('A', 'G#')).toBe(11)
  })

  it('G → A wraps correctly to 2', () => {
    expect(getInterval('G', 'A')).toBe(2)
  })

  it('A → C is 3 semitones', () => {
    expect(getInterval('A', 'C')).toBe(3)
  })

  it('handles flat enharmonics as source: Bb → C is 2', () => {
    expect(getInterval('Bb', 'C')).toBe(2)
  })

  it('handles flat enharmonics as target: A → Bb is 1', () => {
    expect(getInterval('A', 'Bb')).toBe(1)
  })

  it('result is always in range 0–11', () => {
    const roots = ['A', 'A#', 'B', 'C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#'] as const
    for (const from of roots) {
      for (const to of roots) {
        const interval = getInterval(from, to)
        expect(interval).toBeGreaterThanOrEqual(0)
        expect(interval).toBeLessThanOrEqual(11)
      }
    }
  })
})

// ─── transposeNote ──────────────────────────────────────────────────────────

describe('transposeNote', () => {
  it('0 semitones → same note', () => {
    expect(transposeNote('A', 0)).toBe('A')
  })

  it('+12 semitones (full octave) → same note', () => {
    expect(transposeNote('A', 12)).toBe('A')
  })

  it('G# + 1 → A', () => {
    expect(transposeNote('G#', 1)).toBe('A')
  })

  it('A - 1 → G#', () => {
    expect(transposeNote('A', -1)).toBe('G#')
  })

  it('A + 3 → C', () => {
    expect(transposeNote('A', 3)).toBe('C')
  })

  it('always returns sharp-based spelling', () => {
    // A + 1 = A#, not Bb
    expect(transposeNote('A', 1)).toBe('A#')
    // D + 1 = D#, not Eb
    expect(transposeNote('D', 1)).toBe('D#')
  })

  it('handles large positive shifts', () => {
    // A(idx=0) + 25: 25 % 12 = 1, so idx 1 = A#
    expect(transposeNote('A', 25)).toBe('A#')
    // C(idx=3) + 24: 24 % 12 = 0, so idx 3 = C
    expect(transposeNote('C', 24)).toBe('C')
  })

  it('handles large negative shifts', () => {
    expect(transposeNote('A', -13)).toBe('G#') // -13 % 12 = -1, A-1 = G#
  })

  it('flat inputs normalise before transposing: Bb + 0 → A#', () => {
    expect(transposeNote('Bb', 0)).toBe('A#')
  })
})

// ─── transposeShape ─────────────────────────────────────────────────────────

describe('transposeShape', () => {
  // Use minor pos-1 as a concrete fixture (baseFret=5, frets range 5–10)
  const pos1 = AMINOR_SHAPES[0]

  it('shifts all frets by +2', () => {
    const result = transposeShape(pos1, 2)
    const originalFrets = pos1.strings.flatMap(s => s.dots.map(d => d.fret))
    const resultFrets   = result.strings.flatMap(s => s.dots.map(d => d.fret))
    for (let i = 0; i < originalFrets.length; i++) {
      expect(resultFrets[i]).toBe(originalFrets[i] + 2)
    }
  })

  it('baseFret updates correctly on positive shift', () => {
    const result = transposeShape(pos1, 3)
    expect(result.baseFret).toBe(pos1.baseFret + 3)
  })

  it('no fret goes negative after downward transposition', () => {
    // Shifting pos1 (minFret=5) down by 7 would bring fret 5 → -2, so
    // the function must add an octave correction
    const result = transposeShape(pos1, -7)
    const allFrets = result.strings.flatMap(s => s.dots.map(d => d.fret))
    for (const fret of allFrets) {
      expect(fret).toBeGreaterThanOrEqual(0)
    }
  })

  it('octave correction kicks in when shift would produce fret < 0', () => {
    // pos5 has baseFret=2, minFret=2; shifting by -3 would give fret -1 → needs +12
    const pos5 = AMINOR_SHAPES[4]
    const result = transposeShape(pos5, -3)
    const allFrets = result.strings.flatMap(s => s.dots.map(d => d.fret))
    for (const fret of allFrets) {
      expect(fret).toBeGreaterThanOrEqual(0)
    }
  })

  it('id is unchanged', () => {
    expect(transposeShape(pos1, 5).id).toBe(pos1.id)
  })

  it('label is unchanged', () => {
    expect(transposeShape(pos1, 5).label).toBe(pos1.label)
  })

  it('stringNumber values are unchanged', () => {
    const result = transposeShape(pos1, 4)
    for (let i = 0; i < pos1.strings.length; i++) {
      expect(result.strings[i].stringNumber).toBe(pos1.strings[i].stringNumber)
    }
  })

  it('all degree values are unchanged', () => {
    const result = transposeShape(pos1, 4)
    for (let si = 0; si < pos1.strings.length; si++) {
      for (let di = 0; di < pos1.strings[si].dots.length; di++) {
        expect(result.strings[si].dots[di].degree)
          .toBe(pos1.strings[si].dots[di].degree)
      }
    }
  })

  it('zero shift returns shape with identical frets', () => {
    const result = transposeShape(pos1, 0)
    const originalFrets = pos1.strings.flatMap(s => s.dots.map(d => d.fret))
    const resultFrets   = result.strings.flatMap(s => s.dots.map(d => d.fret))
    expect(resultFrets).toEqual(originalFrets)
  })
})

// ─── transposeShapeToRoot ────────────────────────────────────────────────────

describe('transposeShapeToRoot', () => {
  const pos1 = AMINOR_SHAPES[0] // baseFret = 5, rooted at A

  it('A → C shifts baseFret by +3', () => {
    const result = transposeShapeToRoot(pos1, 'A', 'C')
    expect(result.baseFret).toBe(pos1.baseFret + 3)
  })

  it('A → A (identity) leaves baseFret unchanged', () => {
    const result = transposeShapeToRoot(pos1, 'A', 'A')
    expect(result.baseFret).toBe(pos1.baseFret)
  })

  it('A → E shifts baseFret by +7', () => {
    const result = transposeShapeToRoot(pos1, 'A', 'E')
    expect(result.baseFret).toBe(pos1.baseFret + 7)
  })

  it('no fret is negative in any transposition from A to all 12 roots', () => {
    const roots = ['A', 'A#', 'B', 'C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#'] as const
    for (const pos of AMINOR_SHAPES) {
      for (const root of roots) {
        const result = transposeShapeToRoot(pos, 'A', root)
        const allFrets = result.strings.flatMap(s => s.dots.map(d => d.fret))
        for (const fret of allFrets) {
          expect(fret).toBeGreaterThanOrEqual(0)
        }
      }
    }
  })

  it('handles flat target root: A → Bb shifts by 1', () => {
    const result = transposeShapeToRoot(pos1, 'A', 'Bb')
    expect(result.baseFret).toBe(pos1.baseFret + 1)
  })

  it('degrees are preserved after transposition to a new root', () => {
    const result = transposeShapeToRoot(pos1, 'A', 'D')
    for (let si = 0; si < pos1.strings.length; si++) {
      for (let di = 0; di < pos1.strings[si].dots.length; di++) {
        expect(result.strings[si].dots[di].degree)
          .toBe(pos1.strings[si].dots[di].degree)
      }
    }
  })
})
