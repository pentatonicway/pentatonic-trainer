import { useToastStore } from '../store/toastStore'
import type { Progression, BoxData, ChordQuality } from '../types'

const STORAGE_KEY = 'pentatonic_progressions'

// ─── Quality abbreviations ────────────────────────────────────────────────────

const QUALITY_ABBR: Record<ChordQuality, string> = {
  major:    '',
  minor:    'm',
  dominant: '7',
}

// ─── Public API ───────────────────────────────────────────────────────────────

/**
 * Reads saved progressions from localStorage.
 * Returns [] on any failure or when the key is absent.
 */
export function loadSavedProgressions(): Progression[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    if (!Array.isArray(parsed)) return []
    return parsed as Progression[]
  } catch {
    return []
  }
}

/**
 * Serializes progressions to JSON and persists to localStorage.
 * Logs a warning if the write fails.
 */
export function saveProgressions(progressions: Progression[], silent = false): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(progressions))
  } catch (err) {
    console.warn('[storage] Failed to save progressions:', err)
    if (!silent) {
      try {
        useToastStore.getState().showToast('Could not save — storage unavailable', 'error')
      } catch {}
    }
  }
}

/**
 * Generates a short text thumbnail from a box array.
 * Format: "Am–Dm–E7" using root + quality abbreviation.
 * Shows at most 4 boxes; appends "…" if there are more.
 */
export function generateThumbnail(boxes: BoxData[]): string {
  const MAX = 4
  const shown = boxes.slice(0, MAX)
  const parts = shown.map(b => `${b.chordRoot}${QUALITY_ABBR[b.chordQuality]}`)
  const suffix = boxes.length > MAX ? '…' : ''
  return parts.join('–') + suffix
}
