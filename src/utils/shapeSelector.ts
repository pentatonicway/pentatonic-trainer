import type { ChordQuality, OverrideRule } from '../types'
import { getBaseShapes } from '../constants/shapes'
import { transposeShape } from './transpose'

// The "A" root used for all base shape definitions
const BASE_ROOT = 'A' as const

/** Parameters shared by all shape-selection functions. */
export interface ShapeSelectorParams {
  quality: ChordQuality
  box1ShapeIndex: number
  intervalFromBox1: number
}

/**
 * Returns the best shape index (0–4) for a box given the quality, the
 * reference shape index from Box 1, and the semitone interval from Box 1's
 * root to this box's root.
 *
 * Strategy:
 *  1. Transpose every candidate shape by `intervalFromBox1` semitones.
 *  2. Compare each candidate's resulting baseFret against the Box 1
 *     shape's baseFret (un-transposed — Box 1 anchors the neck region).
 *  3. Prefer candidates within ±8 frets; if none qualify, fall back to
 *     the nearest regardless of distance.
 *  4. Ties broken by lower index.
 */
export function getDefaultShapeIndex({
  quality,
  box1ShapeIndex,
  intervalFromBox1,
}: ShapeSelectorParams): number {
  const shapes = getBaseShapes(quality)
  const box1BaseFret = shapes[box1ShapeIndex].baseFret

  // Build (index, transposedBaseFret) pairs
  const candidates = shapes.map((shape, idx) => {
    const transposed = transposeShape(shape, intervalFromBox1)
    return { idx, transposedBaseFret: transposed.baseFret }
  })

  const WINDOW = 8

  // Score each candidate: distance from box1BaseFret, within window or not
  let best: { idx: number; dist: number; inWindow: boolean } | null = null

  for (const { idx, transposedBaseFret } of candidates) {
    const dist = Math.abs(transposedBaseFret - box1BaseFret)
    const inWindow = dist <= WINDOW

    if (best === null) {
      best = { idx, dist, inWindow }
      continue
    }

    // Prefer in-window over out-of-window
    if (inWindow && !best.inWindow) {
      best = { idx, dist, inWindow }
      continue
    }
    if (!inWindow && best.inWindow) {
      continue
    }

    // Same window status: prefer smaller distance, then lower index
    if (dist < best.dist || (dist === best.dist && idx < best.idx)) {
      best = { idx, dist, inWindow }
    }
  }

  // best is never null because shapes always has 5 entries
  return best!.idx
}

/**
 * Builds the canonical rule key for the given params and searches the
 * overrides array for a match.
 *
 * Key format: `"<quality>|<box1ShapeIndex>|<intervalFromBox1>"`
 *
 * Returns the override shapeIndex if found, otherwise null.
 */
export function applyOverride(
  { quality, box1ShapeIndex, intervalFromBox1 }: ShapeSelectorParams,
  overrides: OverrideRule[],
): number | null {
  const key = `${quality}|${box1ShapeIndex}|${intervalFromBox1}`
  const match = overrides.find(rule => rule.key === key)
  return match !== undefined ? match.shapeIndex : null
}

/**
 * Resolves the final shape index for a box:
 *  - If a matching override exists, returns its shapeIndex.
 *  - Otherwise delegates to `getDefaultShapeIndex`.
 */
export function resolveShapeIndex(
  params: ShapeSelectorParams,
  overrides: OverrideRule[],
): number {
  const overrideResult = applyOverride(params, overrides)
  if (overrideResult !== null) return overrideResult
  return getDefaultShapeIndex(params)
}
