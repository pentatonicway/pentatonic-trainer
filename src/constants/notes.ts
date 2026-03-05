import type { NoteRoot } from '../types'

export const CHROMATIC_SCALE: string[] = [
  "A", "A#", "B", "C", "C#", "D", "D#", "E", "F", "F#", "G", "G#"
]

export const ENHARMONIC_MAP: Partial<Record<NoteRoot, string>> = {
  "Bb": "A#",
  "Db": "C#",
  "Eb": "D#",
  "Gb": "F#",
  "Ab": "G#",
}

/**
 * Converts any NoteRoot (including flat spellings) to its
 * sharp-based chromatic scale equivalent.
 */
export function normalizeNote(note: NoteRoot): string {
  return ENHARMONIC_MAP[note] ?? note
}
