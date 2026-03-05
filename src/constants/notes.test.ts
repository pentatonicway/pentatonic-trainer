import { describe, it, expect } from 'vitest'
import { normalizeNote, CHROMATIC_SCALE, ENHARMONIC_MAP } from './notes'
import type { NoteRoot } from '../types'

describe('normalizeNote', () => {
  it('converts Bb to A#', () => {
    expect(normalizeNote('Bb')).toBe('A#')
  })

  it('keeps A as A (no-op for natural notes)', () => {
    expect(normalizeNote('A')).toBe('A')
  })

  it('converts Gb to F#', () => {
    expect(normalizeNote('Gb')).toBe('F#')
  })

  it('converts all flat enharmonics correctly', () => {
    const flatMappings: Array<[NoteRoot, string]> = [
      ['Bb', 'A#'],
      ['Db', 'C#'],
      ['Eb', 'D#'],
      ['Gb', 'F#'],
      ['Ab', 'G#'],
    ]
    for (const [flat, sharp] of flatMappings) {
      expect(normalizeNote(flat)).toBe(sharp)
    }
  })

  it('all 12 chromatic notes normalize to a value in CHROMATIC_SCALE', () => {
    const allNotes: NoteRoot[] = [
      'A', 'A#', 'Bb', 'B', 'C', 'C#', 'Db',
      'D', 'D#', 'Eb', 'E', 'F', 'F#', 'Gb',
      'G', 'G#', 'Ab',
    ]
    for (const note of allNotes) {
      expect(CHROMATIC_SCALE).toContain(normalizeNote(note))
    }
  })

  it('sharp notes pass through unchanged', () => {
    const sharpNotes: NoteRoot[] = ['A#', 'C#', 'D#', 'F#', 'G#']
    for (const note of sharpNotes) {
      expect(normalizeNote(note)).toBe(note)
    }
  })

  it('natural notes pass through unchanged', () => {
    const naturalNotes: NoteRoot[] = ['A', 'B', 'C', 'D', 'E', 'F', 'G']
    for (const note of naturalNotes) {
      expect(normalizeNote(note)).toBe(note)
    }
  })

  it('ENHARMONIC_MAP covers all 5 flat spellings', () => {
    expect(Object.keys(ENHARMONIC_MAP)).toHaveLength(5)
  })

  it('CHROMATIC_SCALE has exactly 12 notes', () => {
    expect(CHROMATIC_SCALE).toHaveLength(12)
  })

  it('CHROMATIC_SCALE starts with A', () => {
    expect(CHROMATIC_SCALE[0]).toBe('A')
  })

  it('CHROMATIC_SCALE contains no duplicates', () => {
    const unique = new Set(CHROMATIC_SCALE)
    expect(unique.size).toBe(12)
  })
})
