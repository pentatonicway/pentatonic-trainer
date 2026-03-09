import type { ChordQuality, NoteRoot, OverrideRule } from "../types";
import { getBaseShapes } from "../constants/shapes";
import { getIntervalSigned, transposeShape } from "./transpose";

/** Parameters shared by all shape-selection functions. */
export interface ShapeSelectorParams {
  quality: ChordQuality;
  chordRoot: NoteRoot; // the actual chord root (used to transpose from A)
  box1ShapeIndex: number;
  intervalFromBox1: number; // kept for override key lookup
  box1BaseFret: number; // actual transposed baseFret of Box 1 on the neck
}

/**
 * Returns the best shape index (0–4) for a box.
 *
 * Strategy:
 *  1. Transpose each candidate shape from its A-root definition to its actual
 *     chord root using the signed shortest-path interval.
 *  2. Octave-wrap the resulting baseFret to land closest to box1BaseFret.
 *  3. Pick the candidate with the smallest distance to box1BaseFret.
 *  4. Ties broken by lower index.
 */
export function getDefaultShapeIndex({
  quality,
  chordRoot,
  box1BaseFret,
}: ShapeSelectorParams): number {
  const shapes = getBaseShapes(quality);
  const target = box1BaseFret;

  const candidates = shapes.map((shape, idx) => {
    const semitones = getIntervalSigned("A", chordRoot);
    const transposed = transposeShape(shape, semitones);

    // Use the midpoint of actual dot frets as the representative position
    const dotFrets = transposed.strings.flatMap((s) =>
      s.dots.map((d) => d.fret)
    );
    const dotMin = Math.min(...dotFrets);
    const dotMax = Math.max(...dotFrets);
    const mid = Math.round((dotMin + dotMax) / 2);

    // Consider natural position AND octave up/down — pick whichever octave
    // brings the shape closest to the target fret region
    const dist = Math.min(
      Math.abs(mid - target),
      Math.abs(mid + 12 - target),
      Math.abs(mid - 12 - target)
    );

    return { idx, dist };
  });

  let best: { idx: number; dist: number } | null = null;
  for (const { idx, dist } of candidates) {
    if (
      best === null ||
      dist < best.dist ||
      (dist === best.dist && idx < best.idx)
    ) {
      best = { idx, dist };
    }
  }

  return best!.idx;
}

/**
 * Builds the canonical rule key and searches overrides for a match.
 * Key format: `"<quality>|<box1ShapeIndex>|<intervalFromBox1>"`
 */
export function applyOverride(
  { quality, box1ShapeIndex, intervalFromBox1 }: ShapeSelectorParams,
  overrides: OverrideRule[]
): number | null {
  const key = `${quality}|${box1ShapeIndex}|${intervalFromBox1}`;
  const match = overrides.find((rule) => rule.key === key);
  return match !== undefined ? match.shapeIndex : null;
}

/**
 * Resolves the final shape index for a box:
 *  - If a matching override exists, returns its shapeIndex.
 *  - Otherwise delegates to `getDefaultShapeIndex`.
 */
export function resolveShapeIndex(
  params: ShapeSelectorParams,
  overrides: OverrideRule[]
): number {
  const overrideResult = applyOverride(params, overrides);
  if (overrideResult !== null) return overrideResult;
  return getDefaultShapeIndex(params);
}
