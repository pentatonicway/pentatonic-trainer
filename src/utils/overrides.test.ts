import { describe, it, expect } from 'vitest'
import {
  buildRuleKey,
  addOrReplaceOverride,
  removeOverride,
  clearAllOverrides,
  serializeOverrides,
} from './overrides'
import type { OverrideRule } from '../types'

// ─── buildRuleKey ─────────────────────────────────────────────────────────

describe('buildRuleKey', () => {
  it('produces the pipe-delimited key format', () => {
    expect(buildRuleKey('minor', 0, 3)).toBe('minor|0|3')
  })

  it('works for all qualities', () => {
    expect(buildRuleKey('major',    1, 7)).toBe('major|1|7')
    expect(buildRuleKey('dominant', 4, 11)).toBe('dominant|4|11')
  })

  it('uses plain integers (no padding)', () => {
    expect(buildRuleKey('minor', 0, 0)).toBe('minor|0|0')
  })
})

// ─── addOrReplaceOverride ─────────────────────────────────────────────────

describe('addOrReplaceOverride', () => {
  const ruleA: OverrideRule = { key: 'minor|0|3', shapeIndex: 2 }
  const ruleB: OverrideRule = { key: 'major|1|5', shapeIndex: 4 }

  it('appends to empty array', () => {
    const result = addOrReplaceOverride([], ruleA)
    expect(result).toHaveLength(1)
    expect(result[0]).toEqual(ruleA)
  })

  it('replaces existing rule with same key, does not append', () => {
    const updated: OverrideRule = { key: 'minor|0|3', shapeIndex: 4 }
    const result = addOrReplaceOverride([ruleA], updated)
    expect(result).toHaveLength(1)
    expect(result[0].shapeIndex).toBe(4)
  })

  it('appends when key differs, resulting length = 2', () => {
    const result = addOrReplaceOverride([ruleA], ruleB)
    expect(result).toHaveLength(2)
  })

  it('does not mutate the original array', () => {
    const original = [ruleA]
    addOrReplaceOverride(original, ruleB)
    expect(original).toHaveLength(1)
  })

  it('preserves order of unchanged rules when replacing', () => {
    const rules = [ruleA, ruleB]
    const updated: OverrideRule = { key: 'minor|0|3', shapeIndex: 0 }
    const result = addOrReplaceOverride(rules, updated)
    expect(result[0].key).toBe('minor|0|3')
    expect(result[1].key).toBe('major|1|5')
  })
})

// ─── removeOverride ───────────────────────────────────────────────────────

describe('removeOverride', () => {
  const rules: OverrideRule[] = [
    { key: 'minor|0|3',  shapeIndex: 2 },
    { key: 'major|1|5',  shapeIndex: 4 },
    { key: 'dominant|2|7', shapeIndex: 1 },
  ]

  it('removes the rule with the matching key', () => {
    const result = removeOverride(rules, 'major|1|5')
    expect(result).toHaveLength(2)
    expect(result.find(r => r.key === 'major|1|5')).toBeUndefined()
  })

  it('returns array of same length when key not found', () => {
    const result = removeOverride(rules, 'minor|9|9')
    expect(result).toHaveLength(rules.length)
  })

  it('does not mutate the original array', () => {
    removeOverride(rules, 'minor|0|3')
    expect(rules).toHaveLength(3)
  })

  it('handles empty array without throwing', () => {
    expect(removeOverride([], 'minor|0|3')).toEqual([])
  })

  it('retains all other rules when one is removed', () => {
    const result = removeOverride(rules, 'minor|0|3')
    expect(result.map(r => r.key)).toEqual(['major|1|5', 'dominant|2|7'])
  })
})

// ─── clearAllOverrides ────────────────────────────────────────────────────

describe('clearAllOverrides', () => {
  it('returns an empty array', () => {
    expect(clearAllOverrides()).toEqual([])
  })

  it('returns empty array regardless of prior state (no args needed)', () => {
    expect(clearAllOverrides()).toHaveLength(0)
  })
})

// ─── serializeOverrides ───────────────────────────────────────────────────

describe('serializeOverrides', () => {
  const rules: OverrideRule[] = [
    { key: 'minor|0|3',  shapeIndex: 2 },
    { key: 'major|1|7',  shapeIndex: 4 },
  ]

  it('starts with the correct import statement', () => {
    const output = serializeOverrides(rules)
    expect(output.startsWith('import { OverrideRule } from "../types";')).toBe(true)
  })

  it('contains the correct key for each rule', () => {
    const output = serializeOverrides(rules)
    expect(output).toContain('"minor|0|3"')
    expect(output).toContain('"major|1|7"')
  })

  it('contains the correct shapeIndex for each rule', () => {
    const output = serializeOverrides(rules)
    expect(output).toContain('shapeIndex: 2')
    expect(output).toContain('shapeIndex: 4')
  })

  it('contains the export declaration', () => {
    const output = serializeOverrides(rules)
    expect(output).toContain('export const AUTO_SHAPE_OVERRIDES: OverrideRule[]')
  })

  it('serializes empty array to valid empty export', () => {
    const output = serializeOverrides([])
    expect(output).toContain('AUTO_SHAPE_OVERRIDES: OverrideRule[] = []')
    expect(output.startsWith('import { OverrideRule } from "../types";')).toBe(true)
  })

  it('round-trip: serialized output contains all rules', () => {
    const three: OverrideRule[] = [
      { key: 'minor|0|3',    shapeIndex: 2 },
      { key: 'major|1|7',    shapeIndex: 4 },
      { key: 'dominant|2|5', shapeIndex: 0 },
    ]
    const output = serializeOverrides(three)
    for (const rule of three) {
      expect(output).toContain(`"${rule.key}"`)
      expect(output).toContain(`shapeIndex: ${rule.shapeIndex}`)
    }
  })
})
