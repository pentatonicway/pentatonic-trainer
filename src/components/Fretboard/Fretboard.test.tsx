import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Fretboard } from './Fretboard'
import { AMINOR_SHAPES } from '../../constants/shapes'
import type { ScaleDegree, ShapeData } from '../../types'

// ─── Fixtures ────────────────────────────────────────────────────────────────

const ALL_VISIBLE = Object.fromEntries(
  (['1', '2', 'b3', '3', '4', 'b5', '5', 'b6', '6', 'b7', '7'] as ScaleDegree[]).map(d => [d, true])
) as Record<ScaleDegree, boolean>

// Position 1: 12 total dots, 4 root dots
const pos1 = AMINOR_SHAPES[0]

function renderPos1(overrides: Partial<React.ComponentProps<typeof Fretboard>> = {}) {
  return render(
    <Fretboard
      shape={pos1}
      scaleDegreeVisibility={ALL_VISIBLE}
      {...overrides}
    />
  )
}

// ─── Tests ───────────────────────────────────────────────────────────────────

describe('Fretboard', () => {
  it('renders without crashing given valid props', () => {
    expect(() => renderPos1()).not.toThrow()
  })

  it('renders an SVG element', () => {
    const { container } = renderPos1()
    const svg = container.querySelector('svg')
    expect(svg).not.toBeNull()
  })

  it('renders exactly 6 string lines', () => {
    const { container } = renderPos1()
    const strings = container.querySelectorAll('[data-testid^="string-line-"]')
    expect(strings).toHaveLength(6)
  })

  it('renders correct total number of dots matching shape data', () => {
    const { container } = renderPos1()
    // pos1 has 12 dots across all 6 strings
    const dots = container.querySelectorAll('[data-testid^="dot-"]')
    expect(dots).toHaveLength(12)
  })

  it('root dots ("1") have red fill', () => {
    const { container } = renderPos1()
    // pos1 has 4 root dots — find all dots with data-degree="1"
    const rootGroups = container.querySelectorAll('[data-degree="1"]')
    expect(rootGroups.length).toBeGreaterThan(0)
    for (const group of Array.from(rootGroups)) {
      const circle = group.querySelector('circle')
      expect(circle?.getAttribute('fill')).toBe('#E53E3E')
    }
  })

  it('non-root dots do NOT have red fill', () => {
    const { container } = renderPos1()
    const nonRootGroups = container.querySelectorAll('[data-degree]:not([data-degree="1"])')
    expect(nonRootGroups.length).toBeGreaterThan(0)
    for (const group of Array.from(nonRootGroups)) {
      const circle = group.querySelector('circle')
      expect(circle?.getAttribute('fill')).not.toBe('#E53E3E')
    }
  })

  it('dots with visible=false have 20% opacity', () => {
    const hiddenVisibility: Record<ScaleDegree, boolean> = {
      ...ALL_VISIBLE,
      '1': false, // hide roots
    }
    const { container } = render(
      <Fretboard shape={pos1} scaleDegreeVisibility={hiddenVisibility} />
    )
    const rootGroups = container.querySelectorAll('[data-degree="1"]')
    expect(rootGroups.length).toBeGreaterThan(0)
    for (const group of Array.from(rootGroups)) {
      expect((group as SVGElement).getAttribute('opacity')).toBe('0.2')
    }
  })

  it('dots with visible=true have full opacity (1)', () => {
    const { container } = renderPos1()
    const dots = container.querySelectorAll('[data-testid^="dot-"]')
    for (const dot of Array.from(dots)) {
      expect((dot as SVGElement).getAttribute('opacity')).toBe('1')
    }
  })

  it('aria-label attributes are present on all dot groups', () => {
    const { container } = renderPos1()
    const dotGroups = container.querySelectorAll('[data-testid^="dot-"]')
    expect(dotGroups.length).toBeGreaterThan(0)
    for (const group of Array.from(dotGroups)) {
      const label = group.getAttribute('aria-label')
      expect(label).toBeTruthy()
      expect(label).toMatch(/String \d, Fret \d+,/)
    }
  })

  it('aria-label for root dot on string 6 fret 5 is correct', () => {
    const { container } = renderPos1()
    const rootDot = container.querySelector('[data-testid="dot-6-5"]')
    expect(rootDot?.getAttribute('aria-label')).toBe('String 6, Fret 5, Root')
  })

  it('applies default width and height when not provided', () => {
    const { container } = renderPos1()
    const svg = container.querySelector('svg')
    expect(svg?.getAttribute('width')).toBe('300')
    expect(svg?.getAttribute('height')).toBe('180')
  })

  it('respects custom width and height props', () => {
    const { container } = render(
      <Fretboard shape={pos1} scaleDegreeVisibility={ALL_VISIBLE} width={500} height={250} />
    )
    const svg = container.querySelector('svg')
    expect(svg?.getAttribute('width')).toBe('500')
    expect(svg?.getAttribute('height')).toBe('250')
  })

  it('renders a nut (thick left border) when shape includes fret 0', () => {
    // Build a minimal shape that includes fret 0
    const shapeWithOpenString: ShapeData = {
      id: 'test-open',
      label: 'Test Open',
      baseFret: 0,
      strings: [
        { stringNumber: 1, dots: [{ fret: 0, degree: '1' }] },
        { stringNumber: 2, dots: [{ fret: 2, degree: '5' }] },
        { stringNumber: 3, dots: [{ fret: 2, degree: '4' }] },
        { stringNumber: 4, dots: [{ fret: 2, degree: '1' }] },
        { stringNumber: 5, dots: [{ fret: 0, degree: '5' }] },
        { stringNumber: 6, dots: [{ fret: 0, degree: '1' }] },
      ],
    }
    const { container } = render(
      <Fretboard shape={shapeWithOpenString} scaleDegreeVisibility={ALL_VISIBLE} />
    )
    // Nut is a thick line (strokeWidth 4) — other fret lines have strokeWidth 1
    const lines = container.querySelectorAll('line')
    const nutLine = Array.from(lines).find(l => l.getAttribute('stroke-width') === '4')
    expect(nutLine).toBeTruthy()
  })

  it('does NOT render a nut when shape has no fret 0', () => {
    const { container } = renderPos1() // pos1 starts at fret 5
    const lines = container.querySelectorAll('line')
    const nutLine = Array.from(lines).find(l => l.getAttribute('stroke-width') === '4')
    expect(nutLine).toBeUndefined()
  })

  it('renders degree text inside each dot', () => {
    const { container } = renderPos1()
    // Spot-check: a root dot should have "1" text
    const rootDotGroup = container.querySelector('[data-degree="1"]')
    const text = rootDotGroup?.querySelector('text')
    expect(text?.textContent).toBe('1')
  })

  it('renders correctly for a different shape (pos 4)', () => {
    const pos4 = AMINOR_SHAPES[3] // baseFret 12
    expect(() =>
      render(<Fretboard shape={pos4} scaleDegreeVisibility={ALL_VISIBLE} />)
    ).not.toThrow()
    const { container } = render(
      <Fretboard shape={pos4} scaleDegreeVisibility={ALL_VISIBLE} />
    )
    const dots = container.querySelectorAll('[data-testid^="dot-"]')
    // pos4 has 12 dots
    expect(dots).toHaveLength(12)
  })
})
