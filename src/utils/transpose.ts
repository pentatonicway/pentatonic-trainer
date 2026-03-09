import type { NoteRoot, ShapeData } from "../types";
import { CHROMATIC_SCALE, normalizeNote } from "../constants/notes";

/**
 * Returns the number of semitones from `from` to `to` (0–11, always positive,
 * wraps around the chromatic scale).
 *
 * Examples:
 *   getInterval("A", "C")  → 3
 *   getInterval("G", "A")  → 2
 *   getInterval("A", "A")  → 0
 */
export function getInterval(from: NoteRoot, to: NoteRoot): number {
  const fromIdx = CHROMATIC_SCALE.indexOf(normalizeNote(from));
  const toIdx = CHROMATIC_SCALE.indexOf(normalizeNote(to));
  return (toIdx - fromIdx + 12) % 12;
}

/**
 * Shifts a note by `semitones` (positive or negative), wrapping around the
 * chromatic scale. Always returns a sharp-based spelling.
 *
 * Examples:
 *   transposeNote("A",  3) → "C"
 *   transposeNote("G#", 1) → "A"
 *   transposeNote("A", -1) → "G#"
 */
export function transposeNote(note: NoteRoot, semitones: number): NoteRoot {
  const idx = CHROMATIC_SCALE.indexOf(normalizeNote(note));
  const newIdx = (((idx + semitones) % 12) + 12) % 12;
  return CHROMATIC_SCALE[newIdx] as NoteRoot;
}

/**
 * Returns a new ShapeData with all fret numbers shifted by `semitones`.
 *
 * Fret guard: if any fret in the shifted shape would go below 0, the entire
 * shape is first raised one octave (+12 frets) before applying the shift.
 *
 * `id`, `label`, `stringNumber`, and all `degree` values are unchanged.
 */
export function transposeShape(shape: ShapeData, semitones: number): ShapeData {
  // Collect all fret values to check for underflow
  const allFrets = shape.strings.flatMap((s) => s.dots.map((d) => d.fret));
  const minFret = Math.min(...allFrets);

  // If the shift would take any fret below 0, add an octave first
  const octaveCorrection = minFret + semitones < 0 ? 12 : 0;
  const totalShift = semitones + octaveCorrection;

  return {
    ...shape,
    baseFret: shape.baseFret + totalShift,
    strings: shape.strings.map((str) => ({
      ...str,
      dots: str.dots.map((dot) => ({
        ...dot,
        fret: dot.fret + totalShift,
      })),
    })),
  };
}

/**
 * Returns the signed shortest-path interval from `from` to `to` (-6 to +6).
 * Used for rendering shapes at their actual neck position — avoids jumping
 * an octave up when going down a few semitones (e.g. A→G = -2, not +10).
 */
export function getIntervalSigned(from: NoteRoot, to: NoteRoot): number {
  const raw = getInterval(from, to);
  return raw > 6 ? raw - 12 : raw;
}

/**
 * Transposes a shape from one root note to another.
 * Uses the signed shortest-path interval so shapes stay in their natural
 * neck region rather than jumping an octave up.
 *
 * This is the primary function for rendering a shape at a given chord root.
 */
export function transposeShapeToRoot(
  shape: ShapeData,
  fromRoot: NoteRoot,
  toRoot: NoteRoot
): ShapeData {
  const semitones = getIntervalSigned(fromRoot, toRoot);
  return transposeShape(shape, semitones);
}
