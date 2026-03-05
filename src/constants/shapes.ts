/**
 * shapes.ts
 *
 * Five positions for each pentatonic quality, rooted at A.
 * Strings: 1 = high e (E4), 2 = B, 3 = G, 4 = D, 5 = A, 6 = low E (E2)
 * Fret numbers are absolute (0 = open string).
 *
 * A minor pentatonic  (A C D E G)  — degrees: 1 b3 4 5 b7
 * A major pentatonic  (A B C# E F#) — degrees: 1 2 3 5 6
 * A dominant pent.    (A B C# E G)  — degrees: 1 2 3 5 b7
 */

import type { ChordQuality, ShapeData } from '../types'

// ─── A MINOR PENTATONIC ────────────────────────────────────────────────────

export const AMINOR_SHAPES: ShapeData[] = [
  {
    id: 'minor-pos-1',
    label: 'Minor Position 1',
    baseFret: 5,
    strings: [
      { stringNumber: 6, dots: [{ fret: 5, degree: '1'  }, { fret: 8,  degree: 'b3' }] },
      { stringNumber: 5, dots: [{ fret: 5, degree: '4'  }, { fret: 7,  degree: '5'  }] },
      { stringNumber: 4, dots: [{ fret: 7, degree: '1'  }, { fret: 10, degree: 'b3' }] },
      { stringNumber: 3, dots: [{ fret: 7, degree: '4'  }, { fret: 9,  degree: '5'  }] },
      { stringNumber: 2, dots: [{ fret: 8, degree: 'b7' }, { fret: 10, degree: '1'  }] },
      { stringNumber: 1, dots: [{ fret: 5, degree: '1'  }, { fret: 8,  degree: 'b3' }] },
    ],
  },
  {
    id: 'minor-pos-2',
    label: 'Minor Position 2',
    baseFret: 7,
    strings: [
      { stringNumber: 6, dots: [{ fret: 8,  degree: 'b3' }, { fret: 10, degree: '4'  }] },
      { stringNumber: 5, dots: [{ fret: 7,  degree: '5'  }, { fret: 10, degree: 'b7' }] },
      { stringNumber: 4, dots: [{ fret: 7,  degree: '1'  }, { fret: 10, degree: 'b3' }] },
      { stringNumber: 3, dots: [{ fret: 9,  degree: '5'  }, { fret: 12, degree: 'b7' }] },
      { stringNumber: 2, dots: [{ fret: 10, degree: '1'  }, { fret: 13, degree: 'b3' }] },
      { stringNumber: 1, dots: [{ fret: 8,  degree: 'b3' }, { fret: 10, degree: '4'  }] },
    ],
  },
  {
    id: 'minor-pos-3',
    label: 'Minor Position 3',
    baseFret: 9,
    strings: [
      { stringNumber: 6, dots: [{ fret: 10, degree: '4'  }, { fret: 12, degree: '5'  }] },
      { stringNumber: 5, dots: [{ fret: 10, degree: 'b7' }, { fret: 12, degree: '1'  }] },
      { stringNumber: 4, dots: [{ fret: 10, degree: 'b3' }, { fret: 12, degree: '4'  }] },
      { stringNumber: 3, dots: [{ fret: 9,  degree: '5'  }, { fret: 12, degree: 'b7' }] },
      { stringNumber: 2, dots: [{ fret: 10, degree: '1'  }, { fret: 13, degree: 'b3' }] },
      { stringNumber: 1, dots: [{ fret: 10, degree: '4'  }, { fret: 12, degree: '5'  }] },
    ],
  },
  {
    id: 'minor-pos-4',
    label: 'Minor Position 4',
    baseFret: 12,
    strings: [
      { stringNumber: 6, dots: [{ fret: 12, degree: '5'  }, { fret: 15, degree: 'b7' }] },
      { stringNumber: 5, dots: [{ fret: 12, degree: '1'  }, { fret: 15, degree: 'b3' }] },
      { stringNumber: 4, dots: [{ fret: 12, degree: '4'  }, { fret: 14, degree: '5'  }] },
      { stringNumber: 3, dots: [{ fret: 12, degree: 'b7' }, { fret: 14, degree: '1'  }] },
      { stringNumber: 2, dots: [{ fret: 13, degree: 'b3' }, { fret: 15, degree: '4'  }] },
      { stringNumber: 1, dots: [{ fret: 12, degree: '5'  }, { fret: 15, degree: 'b7' }] },
    ],
  },
  {
    id: 'minor-pos-5',
    label: 'Minor Position 5',
    baseFret: 2,
    strings: [
      { stringNumber: 6, dots: [{ fret: 3, degree: 'b7' }, { fret: 5, degree: '1'  }] },
      { stringNumber: 5, dots: [{ fret: 3, degree: 'b3' }, { fret: 5, degree: '4'  }] },
      { stringNumber: 4, dots: [{ fret: 2, degree: '5'  }, { fret: 5, degree: 'b7' }] },
      { stringNumber: 3, dots: [{ fret: 2, degree: '1'  }, { fret: 5, degree: 'b3' }] },
      { stringNumber: 2, dots: [{ fret: 3, degree: '4'  }, { fret: 5, degree: '5'  }] },
      { stringNumber: 1, dots: [{ fret: 3, degree: 'b7' }, { fret: 5, degree: '1'  }] },
    ],
  },
]

// ─── A MAJOR PENTATONIC ────────────────────────────────────────────────────

export const AMAJOR_SHAPES: ShapeData[] = [
  {
    id: 'major-pos-1',
    label: 'Major Position 1',
    baseFret: 4,
    strings: [
      { stringNumber: 6, dots: [{ fret: 5, degree: '1' }, { fret: 7,  degree: '2' }] },
      { stringNumber: 5, dots: [{ fret: 4, degree: '3' }, { fret: 7,  degree: '5' }] },
      { stringNumber: 4, dots: [{ fret: 4, degree: '6' }, { fret: 7,  degree: '1' }] },
      { stringNumber: 3, dots: [{ fret: 4, degree: '2' }, { fret: 6,  degree: '3' }] },
      { stringNumber: 2, dots: [{ fret: 5, degree: '5' }, { fret: 7,  degree: '6' }] },
      { stringNumber: 1, dots: [{ fret: 5, degree: '1' }, { fret: 7,  degree: '2' }] },
    ],
  },
  {
    id: 'major-pos-2',
    label: 'Major Position 2',
    baseFret: 6,
    strings: [
      { stringNumber: 6, dots: [{ fret: 7,  degree: '2' }, { fret: 9,  degree: '3' }] },
      { stringNumber: 5, dots: [{ fret: 7,  degree: '5' }, { fret: 9,  degree: '6' }] },
      { stringNumber: 4, dots: [{ fret: 7,  degree: '1' }, { fret: 9,  degree: '2' }] },
      { stringNumber: 3, dots: [{ fret: 6,  degree: '3' }, { fret: 9,  degree: '5' }] },
      { stringNumber: 2, dots: [{ fret: 7,  degree: '6' }, { fret: 10, degree: '1' }] },
      { stringNumber: 1, dots: [{ fret: 7,  degree: '2' }, { fret: 9,  degree: '3' }] },
    ],
  },
  {
    id: 'major-pos-3',
    label: 'Major Position 3',
    baseFret: 9,
    strings: [
      { stringNumber: 6, dots: [{ fret: 9,  degree: '3' }, { fret: 12, degree: '5' }] },
      { stringNumber: 5, dots: [{ fret: 9,  degree: '6' }, { fret: 12, degree: '1' }] },
      { stringNumber: 4, dots: [{ fret: 9,  degree: '2' }, { fret: 11, degree: '3' }] },
      { stringNumber: 3, dots: [{ fret: 9,  degree: '5' }, { fret: 11, degree: '6' }] },
      { stringNumber: 2, dots: [{ fret: 10, degree: '1' }, { fret: 12, degree: '2' }] },
      { stringNumber: 1, dots: [{ fret: 9,  degree: '3' }, { fret: 12, degree: '5' }] },
    ],
  },
  {
    id: 'major-pos-4',
    label: 'Major Position 4',
    baseFret: 11,
    strings: [
      { stringNumber: 6, dots: [{ fret: 12, degree: '5' }, { fret: 14, degree: '6' }] },
      { stringNumber: 5, dots: [{ fret: 12, degree: '1' }, { fret: 14, degree: '2' }] },
      { stringNumber: 4, dots: [{ fret: 11, degree: '3' }, { fret: 14, degree: '5' }] },
      { stringNumber: 3, dots: [{ fret: 11, degree: '6' }, { fret: 14, degree: '1' }] },
      { stringNumber: 2, dots: [{ fret: 12, degree: '2' }, { fret: 14, degree: '3' }] },
      { stringNumber: 1, dots: [{ fret: 12, degree: '5' }, { fret: 14, degree: '6' }] },
    ],
  },
  {
    id: 'major-pos-5',
    label: 'Major Position 5',
    baseFret: 2,
    strings: [
      { stringNumber: 6, dots: [{ fret: 2, degree: '6' }, { fret: 5, degree: '1' }] },
      { stringNumber: 5, dots: [{ fret: 2, degree: '2' }, { fret: 4, degree: '3' }] },
      { stringNumber: 4, dots: [{ fret: 2, degree: '5' }, { fret: 4, degree: '6' }] },
      { stringNumber: 3, dots: [{ fret: 2, degree: '1' }, { fret: 4, degree: '2' }] },
      { stringNumber: 2, dots: [{ fret: 2, degree: '3' }, { fret: 5, degree: '5' }] },
      { stringNumber: 1, dots: [{ fret: 2, degree: '6' }, { fret: 5, degree: '1' }] },
    ],
  },
]

// ─── A DOMINANT PENTATONIC ─────────────────────────────────────────────────

export const ADOMINANT_SHAPES: ShapeData[] = [
  {
    id: 'dominant-pos-1',
    label: 'Dominant Position 1',
    baseFret: 4,
    strings: [
      { stringNumber: 6, dots: [{ fret: 5, degree: '1'  }, { fret: 7,  degree: '2'  }] },
      { stringNumber: 5, dots: [{ fret: 4, degree: '3'  }, { fret: 7,  degree: '5'  }] },
      { stringNumber: 4, dots: [{ fret: 5, degree: 'b7' }, { fret: 7,  degree: '1'  }] },
      { stringNumber: 3, dots: [{ fret: 4, degree: '2'  }, { fret: 6,  degree: '3'  }] },
      { stringNumber: 2, dots: [{ fret: 5, degree: '5'  }, { fret: 8,  degree: 'b7' }] },
      { stringNumber: 1, dots: [{ fret: 5, degree: '1'  }, { fret: 7,  degree: '2'  }] },
    ],
  },
  {
    id: 'dominant-pos-2',
    label: 'Dominant Position 2',
    baseFret: 6,
    strings: [
      { stringNumber: 6, dots: [{ fret: 7,  degree: '2'  }, { fret: 9,  degree: '3'  }] },
      { stringNumber: 5, dots: [{ fret: 7,  degree: '5'  }, { fret: 10, degree: 'b7' }] },
      { stringNumber: 4, dots: [{ fret: 7,  degree: '1'  }, { fret: 9,  degree: '2'  }] },
      { stringNumber: 3, dots: [{ fret: 6,  degree: '3'  }, { fret: 9,  degree: '5'  }] },
      { stringNumber: 2, dots: [{ fret: 8,  degree: 'b7' }, { fret: 10, degree: '1'  }] },
      { stringNumber: 1, dots: [{ fret: 7,  degree: '2'  }, { fret: 9,  degree: '3'  }] },
    ],
  },
  {
    id: 'dominant-pos-3',
    label: 'Dominant Position 3',
    baseFret: 9,
    strings: [
      { stringNumber: 6, dots: [{ fret: 9,  degree: '3'  }, { fret: 12, degree: '5'  }] },
      { stringNumber: 5, dots: [{ fret: 10, degree: 'b7' }, { fret: 12, degree: '1'  }] },
      { stringNumber: 4, dots: [{ fret: 9,  degree: '2'  }, { fret: 11, degree: '3'  }] },
      { stringNumber: 3, dots: [{ fret: 9,  degree: '5'  }, { fret: 12, degree: 'b7' }] },
      { stringNumber: 2, dots: [{ fret: 10, degree: '1'  }, { fret: 12, degree: '2'  }] },
      { stringNumber: 1, dots: [{ fret: 9,  degree: '3'  }, { fret: 12, degree: '5'  }] },
    ],
  },
  {
    id: 'dominant-pos-4',
    label: 'Dominant Position 4',
    baseFret: 11,
    strings: [
      { stringNumber: 6, dots: [{ fret: 12, degree: '5'  }, { fret: 15, degree: 'b7' }] },
      { stringNumber: 5, dots: [{ fret: 12, degree: '1'  }, { fret: 14, degree: '2'  }] },
      { stringNumber: 4, dots: [{ fret: 11, degree: '3'  }, { fret: 14, degree: '5'  }] },
      { stringNumber: 3, dots: [{ fret: 12, degree: 'b7' }, { fret: 14, degree: '1'  }] },
      { stringNumber: 2, dots: [{ fret: 12, degree: '2'  }, { fret: 14, degree: '3'  }] },
      { stringNumber: 1, dots: [{ fret: 12, degree: '5'  }, { fret: 15, degree: 'b7' }] },
    ],
  },
  {
    id: 'dominant-pos-5',
    label: 'Dominant Position 5',
    baseFret: 2,
    strings: [
      { stringNumber: 6, dots: [{ fret: 3, degree: 'b7' }, { fret: 5, degree: '1'  }] },
      { stringNumber: 5, dots: [{ fret: 2, degree: '2'  }, { fret: 4, degree: '3'  }] },
      { stringNumber: 4, dots: [{ fret: 2, degree: '5'  }, { fret: 5, degree: 'b7' }] },
      { stringNumber: 3, dots: [{ fret: 2, degree: '1'  }, { fret: 4, degree: '2'  }] },
      { stringNumber: 2, dots: [{ fret: 2, degree: '3'  }, { fret: 5, degree: '5'  }] },
      { stringNumber: 1, dots: [{ fret: 3, degree: 'b7' }, { fret: 5, degree: '1'  }] },
    ],
  },
]

// ─── Helper ────────────────────────────────────────────────────────────────

export function getBaseShapes(quality: ChordQuality): ShapeData[] {
  switch (quality) {
    case 'minor':    return AMINOR_SHAPES
    case 'major':    return AMAJOR_SHAPES
    case 'dominant': return ADOMINANT_SHAPES
  }
}
