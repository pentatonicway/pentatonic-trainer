import type { Progression, BoxData, NoteRoot, ChordQuality } from '../types'

// ─── Helpers ─────────────────────────────────────────────────────────────────

const ALL_DEGREES_VISIBLE = {
  '1': true, '2': true, 'b3': true, '3': true, '4': true,
  'b5': true, '5': true, 'b6': true, '6': true, 'b7': true, '7': true,
} as const

let _counter = 0
function presetId(slug: string): string {
  return `preset-${slug}-${++_counter}`
}

function box(root: NoteRoot, quality: ChordQuality, index: number): BoxData {
  return {
    id: `preset-box-${root}-${quality}-${index}`,
    chordRoot: root,
    chordQuality: quality,
    shapeIndex: 0,
    transposeOffset: 0,
    locked: true,
    scaleDegreeVisibility: { ...ALL_DEGREES_VISIBLE },
  }
}

function prog(name: string, slug: string, chords: Array<[NoteRoot, ChordQuality]>): Progression {
  return {
    id: presetId(slug),
    name,
    boxes: chords.map(([root, quality], i) => box(root, quality, i)),
  }
}

// ─── Presets ──────────────────────────────────────────────────────────────────

export const PRESETS: Progression[] = [
  prog('I–IV–V', 'i-iv-v-major', [
    ['A', 'major'], ['D', 'major'], ['E', 'major'],
  ]),

  prog('I–V–vi–IV', 'i-v-vi-iv', [
    ['C', 'major'], ['G', 'major'], ['A', 'minor'], ['F', 'major'],
  ]),

  prog('12-Bar Blues', '12-bar-blues', [
    ['A', 'dominant'], ['A', 'dominant'], ['A', 'dominant'], ['A', 'dominant'],
    ['D', 'dominant'], ['D', 'dominant'], ['A', 'dominant'], ['A', 'dominant'],
    ['E', 'dominant'], ['D', 'dominant'], ['A', 'dominant'], ['E', 'dominant'],
  ]),

  prog('ii–V–I', 'ii-v-i', [
    ['D', 'minor'], ['G', 'dominant'], ['C', 'major'],
  ]),

  prog('I–vi–IV–V', 'i-vi-iv-v', [
    ['C', 'major'], ['A', 'minor'], ['F', 'major'], ['G', 'major'],
  ]),

  prog('vi–IV–I–V', 'vi-iv-i-v', [
    ['A', 'minor'], ['F', 'major'], ['C', 'major'], ['G', 'major'],
  ]),

  prog('I–IV–vi–V', 'i-iv-vi-v', [
    ['G', 'major'], ['C', 'major'], ['E', 'minor'], ['D', 'major'],
  ]),

  prog('Blues Shuffle', 'blues-shuffle', [
    ['E', 'dominant'], ['A', 'dominant'], ['B', 'dominant'],
  ]),

  prog('Minor i–VII–VI', 'minor-i-vii-vi', [
    ['A', 'minor'], ['G', 'major'], ['F', 'major'],
  ]),

  prog('i–iv–v', 'i-iv-v-minor', [
    ['A', 'minor'], ['D', 'minor'], ['E', 'minor'],
  ]),

  prog('I–II–IV–I', 'i-ii-iv-i', [
    ['A', 'major'], ['B', 'major'], ['D', 'major'], ['A', 'major'],
  ]),

  prog('Jazz ii–V–I', 'jazz-ii-v-i', [
    ['D', 'minor'], ['G', 'dominant'], ['C', 'major'], ['C', 'major'],
  ]),

  prog('Andalusian Cadence', 'andalusian', [
    ['A', 'minor'], ['G', 'major'], ['F', 'major'], ['E', 'major'],
  ]),

  prog('I–V–I', 'i-v-i', [
    ['G', 'major'], ['D', 'major'], ['G', 'major'],
  ]),

  prog('50s Progression', '50s', [
    ['C', 'major'], ['A', 'minor'], ['F', 'major'], ['G', 'major'],
  ]),

  prog('Pachelbel', 'pachelbel', [
    ['D', 'major'], ['A', 'major'], ['B', 'minor'], ['F#', 'minor'],
    ['G', 'major'], ['D', 'major'], ['G', 'major'], ['A', 'major'],
  ]),

  prog('Minor Blues', 'minor-blues', [
    ['A', 'minor'], ['D', 'minor'], ['A', 'minor'],
    ['E', 'minor'], ['D', 'minor'], ['A', 'minor'],
  ]),

  prog('I–iii–IV–V', 'i-iii-iv-v', [
    ['C', 'major'], ['E', 'minor'], ['F', 'major'], ['G', 'major'],
  ]),

  prog('Rhythm Changes A', 'rhythm-changes-a', [
    ['A#', 'major'], ['G', 'dominant'], ['C', 'minor'], ['F', 'dominant'],
  ]),

  prog('Pop Punk', 'pop-punk', [
    ['G', 'major'], ['D', 'major'], ['E', 'minor'], ['C', 'major'],
  ]),
]

export const VALID_ROOTS = new Set<string>([
  'A', 'A#', 'Bb', 'B', 'C', 'C#', 'Db', 'D', 'D#', 'Eb',
  'E', 'F', 'F#', 'Gb', 'G', 'G#', 'Ab',
])

export const VALID_QUALITIES = new Set<string>(['major', 'minor', 'dominant'])
