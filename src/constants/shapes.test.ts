import { describe, it, expect } from 'vitest'
import {
  AMINOR_SHAPES,
  AMAJOR_SHAPES,
  ADOMINANT_SHAPES,
  getBaseShapes,
} from './shapes'
import type { ScaleDegree, ShapeData } from '../types'

// All valid scale degrees
const VALID_DEGREES = new Set<ScaleDegree>([
  '1', '2', 'b3', '3', '4', 'b5', '5', 'b6', '6', 'b7', '7',
])

function validateShapeArray(shapes: ShapeData[], label: string) {
  describe(label, () => {
    it('has exactly 5 shapes', () => {
      expect(shapes).toHaveLength(5)
    })

    it('each shape has exactly 6 strings', () => {
      for (const shape of shapes) {
        expect(shape.strings).toHaveLength(6)
      }
    })

    it('every string has at least 1 dot', () => {
      for (const shape of shapes) {
        for (const str of shape.strings) {
          expect(str.dots.length).toBeGreaterThanOrEqual(1)
        }
      }
    })

    it('every dot has a valid ScaleDegree', () => {
      for (const shape of shapes) {
        for (const str of shape.strings) {
          for (const dot of str.dots) {
            expect(VALID_DEGREES.has(dot.degree)).toBe(true)
          }
        }
      }
    })

    it('root degree "1" appears at least once per shape', () => {
      for (const shape of shapes) {
        const allDots = shape.strings.flatMap(s => s.dots)
        const hasRoot = allDots.some(d => d.degree === '1')
        expect(hasRoot).toBe(true)
      }
    })

    it('each shape has a unique id', () => {
      const ids = shapes.map(s => s.id)
      expect(new Set(ids).size).toBe(ids.length)
    })

    it('each shape has a non-empty label', () => {
      for (const shape of shapes) {
        expect(shape.label.length).toBeGreaterThan(0)
      }
    })

    it('baseFret is a non-negative integer', () => {
      for (const shape of shapes) {
        expect(shape.baseFret).toBeGreaterThanOrEqual(0)
        expect(Number.isInteger(shape.baseFret)).toBe(true)
      }
    })
  })
}

// Run structural validation for all three qualities
validateShapeArray(AMINOR_SHAPES,    'AMINOR_SHAPES')
validateShapeArray(AMAJOR_SHAPES,    'AMAJOR_SHAPES')
validateShapeArray(ADOMINANT_SHAPES, 'ADOMINANT_SHAPES')

// getBaseShapes helper
describe('getBaseShapes', () => {
  it('returns AMINOR_SHAPES for "minor"', () => {
    expect(getBaseShapes('minor')).toBe(AMINOR_SHAPES)
  })

  it('returns AMAJOR_SHAPES for "major"', () => {
    expect(getBaseShapes('major')).toBe(AMAJOR_SHAPES)
  })

  it('returns ADOMINANT_SHAPES for "dominant"', () => {
    expect(getBaseShapes('dominant')).toBe(ADOMINANT_SHAPES)
  })
})
