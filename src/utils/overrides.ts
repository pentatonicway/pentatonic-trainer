import type { OverrideRule } from '../types'

/**
 * Builds the canonical rule key used to identify an override.
 * Format: `"<quality>|<box1ShapeIndex>|<intervalFromBox1>"`
 */
export function buildRuleKey(
  quality: string,
  box1ShapeIndex: number,
  intervalFromBox1: number,
): string {
  return `${quality}|${box1ShapeIndex}|${intervalFromBox1}`
}

/**
 * Returns a new array with `newRule` added or replacing the existing rule
 * that shares the same key. Never mutates the input array.
 */
export function addOrReplaceOverride(
  overrides: OverrideRule[],
  newRule: OverrideRule,
): OverrideRule[] {
  const exists = overrides.some(r => r.key === newRule.key)
  if (exists) {
    return overrides.map(r => (r.key === newRule.key ? newRule : r))
  }
  return [...overrides, newRule]
}

/**
 * Returns a new array with the rule matching `key` removed.
 * If no match is found, returns a shallow copy of the original array.
 */
export function removeOverride(overrides: OverrideRule[], key: string): OverrideRule[] {
  return overrides.filter(r => r.key !== key)
}

/**
 * Returns an empty array, effectively clearing all overrides.
 */
export function clearAllOverrides(): OverrideRule[] {
  return []
}

/**
 * Serializes an overrides array into the string content of
 * AUTO_SHAPE_OVERRIDES.ts, ready to be written to disk.
 */
export function serializeOverrides(overrides: OverrideRule[]): string {
  const entries = overrides
    .map(r => `  { key: "${r.key}", shapeIndex: ${r.shapeIndex} },`)
    .join('\n')

  const body = entries.length > 0 ? `\n${entries}\n` : ''

  return [
    `import { OverrideRule } from "../types";`,
    ``,
    `export const AUTO_SHAPE_OVERRIDES: OverrideRule[] = [${body}];`,
    ``,
  ].join('\n')
}
