import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { ChordBox } from './ChordBox'
import type { BoxData, ScaleDegree } from '../../types'

// ─── Fixtures ────────────────────────────────────────────────────────────────

const ALL_VISIBLE = Object.fromEntries(
  (['1', '2', 'b3', '3', '4', 'b5', '5', 'b6', '6', 'b7', '7'] as ScaleDegree[]).map(d => [d, true])
) as Record<ScaleDegree, boolean>

function makeBox(overrides: Partial<BoxData> = {}): BoxData {
  return {
    id: 'test-box-id',
    chordRoot: 'A',
    chordQuality: 'minor',
    shapeIndex: 0,
    transposeOffset: 0,
    locked: false,
    scaleDegreeVisibility: { ...ALL_VISIBLE },
    ...overrides,
  }
}

function makeCallbacks() {
  return {
    onLockToggle:      vi.fn(),
    onPrevShape:       vi.fn(),
    onNextShape:       vi.fn(),
    onResetShape:      vi.fn(),
    onToggleDegree:    vi.fn(),
    onToggleAllDegrees: vi.fn(),
  }
}

function renderBox(box: BoxData, boxIndex = 1, cbs = makeCallbacks()) {
  return { ...render(<ChordBox box={box} boxIndex={boxIndex} {...cbs} />), cbs }
}

// ─── Tests ───────────────────────────────────────────────────────────────────

describe('ChordBox', () => {
  // ── Chord name rendering ──────────────────────────────────────────────────

  describe('chord name', () => {
    it('renders "A Minor" for root=A, quality=minor', () => {
      renderBox(makeBox({ chordRoot: 'A', chordQuality: 'minor' }))
      expect(screen.getByTestId('chord-name').textContent).toBe('A Minor')
    })

    it('renders "C Major" for root=C, quality=major', () => {
      renderBox(makeBox({ chordRoot: 'C', chordQuality: 'major' }))
      expect(screen.getByTestId('chord-name').textContent).toBe('C Major')
    })

    it('renders "E Dominant" for root=E, quality=dominant', () => {
      renderBox(makeBox({ chordRoot: 'E', chordQuality: 'dominant' }))
      expect(screen.getByTestId('chord-name').textContent).toBe('E Dominant')
    })

    it('capitalizes quality correctly', () => {
      renderBox(makeBox({ chordQuality: 'minor' }))
      const text = screen.getByTestId('chord-name').textContent ?? ''
      expect(text[text.indexOf(' ') + 1]).toMatch(/[A-Z]/)
    })
  })

  // ── Lock button ───────────────────────────────────────────────────────────

  describe('lock button', () => {
    it('calls onLockToggle with correct id when clicked', () => {
      const box = makeBox({ id: 'my-box-id', locked: false })
      const { cbs } = renderBox(box)
      fireEvent.click(screen.getByTestId('lock-btn'))
      expect(cbs.onLockToggle).toHaveBeenCalledWith('my-box-id')
    })

    it('shows lock icon (🔒) when box is locked', () => {
      renderBox(makeBox({ locked: true }))
      expect(screen.getByTestId('lock-btn').textContent).toBe('🔒')
    })

    it('shows unlock icon (🔓) when box is unlocked', () => {
      renderBox(makeBox({ locked: false }))
      expect(screen.getByTestId('lock-btn').textContent).toBe('🔓')
    })

    it('is NOT present for Box 1 (boxIndex 0)', () => {
      renderBox(makeBox(), 0)
      expect(screen.queryByTestId('lock-btn')).toBeNull()
    })

    it('IS present for boxIndex > 0', () => {
      renderBox(makeBox(), 1)
      expect(screen.getByTestId('lock-btn')).toBeTruthy()
    })
  })

  // ── Prev / Next buttons ───────────────────────────────────────────────────

  describe('Prev / Next shape buttons', () => {
    it('calls onPrevShape with box id when unlocked', () => {
      const box = makeBox({ id: 'abc', locked: false })
      const { cbs } = renderBox(box)
      fireEvent.click(screen.getByTestId('prev-btn'))
      expect(cbs.onPrevShape).toHaveBeenCalledWith('abc')
    })

    it('calls onNextShape with box id when unlocked', () => {
      const box = makeBox({ id: 'abc', locked: false })
      const { cbs } = renderBox(box)
      fireEvent.click(screen.getByTestId('next-btn'))
      expect(cbs.onNextShape).toHaveBeenCalledWith('abc')
    })

    it('prev button is disabled when locked', () => {
      renderBox(makeBox({ locked: true }))
      expect(screen.getByTestId('prev-btn')).toBeDisabled()
    })

    it('next button is disabled when locked', () => {
      renderBox(makeBox({ locked: true }))
      expect(screen.getByTestId('next-btn')).toBeDisabled()
    })

    it('prev button is NOT disabled when unlocked', () => {
      renderBox(makeBox({ locked: false }))
      expect(screen.getByTestId('prev-btn')).not.toBeDisabled()
    })

    it('next button is NOT disabled when unlocked', () => {
      renderBox(makeBox({ locked: false }))
      expect(screen.getByTestId('next-btn')).not.toBeDisabled()
    })

    it('does NOT call onPrevShape when button is disabled (locked)', () => {
      const box = makeBox({ locked: true })
      const { cbs } = renderBox(box)
      fireEvent.click(screen.getByTestId('prev-btn'))
      expect(cbs.onPrevShape).not.toHaveBeenCalled()
    })

    it('does NOT call onNextShape when button is disabled (locked)', () => {
      const box = makeBox({ locked: true })
      const { cbs } = renderBox(box)
      fireEvent.click(screen.getByTestId('next-btn'))
      expect(cbs.onNextShape).not.toHaveBeenCalled()
    })
  })

  // ── Reset button ──────────────────────────────────────────────────────────

  describe('Reset button', () => {
    it('calls onResetShape with box id when unlocked', () => {
      const box = makeBox({ id: 'xyz', locked: false })
      const { cbs } = renderBox(box)
      fireEvent.click(screen.getByTestId('reset-btn'))
      expect(cbs.onResetShape).toHaveBeenCalledWith('xyz')
    })

    it('is disabled when box is locked', () => {
      renderBox(makeBox({ locked: true }))
      expect(screen.getByTestId('reset-btn')).toBeDisabled()
    })

    it('does NOT call onResetShape when disabled', () => {
      const box = makeBox({ locked: true })
      const { cbs } = renderBox(box)
      fireEvent.click(screen.getByTestId('reset-btn'))
      expect(cbs.onResetShape).not.toHaveBeenCalled()
    })
  })

  // ── Degree toggle buttons ─────────────────────────────────────────────────

  describe('degree toggle buttons', () => {
    it('renders degree toggle buttons for degrees present in the shape', () => {
      renderBox(makeBox())
      // Minor pentatonic pos 1 has: 1, b3, 4, 5, b7
      expect(screen.getByTestId('degree-btn-1')).toBeTruthy()
      expect(screen.getByTestId('degree-btn-b3')).toBeTruthy()
      expect(screen.getByTestId('degree-btn-4')).toBeTruthy()
      expect(screen.getByTestId('degree-btn-5')).toBeTruthy()
      expect(screen.getByTestId('degree-btn-b7')).toBeTruthy()
    })

    it('does NOT render buttons for degrees not in the shape', () => {
      renderBox(makeBox()) // minor pentatonic has no "2" or "3"
      expect(screen.queryByTestId('degree-btn-2')).toBeNull()
      expect(screen.queryByTestId('degree-btn-3')).toBeNull()
    })

    it('calls onToggleDegree with id and degree when clicked', () => {
      const box = makeBox({ id: 'box-id' })
      const { cbs } = renderBox(box)
      fireEvent.click(screen.getByTestId('degree-btn-1'))
      expect(cbs.onToggleDegree).toHaveBeenCalledWith('box-id', '1')
    })

    it('degree button has aria-pressed=true when visible', () => {
      renderBox(makeBox({ scaleDegreeVisibility: { ...ALL_VISIBLE, '1': true } }))
      expect(screen.getByTestId('degree-btn-1').getAttribute('aria-pressed')).toBe('true')
    })

    it('degree button has aria-pressed=false when hidden', () => {
      renderBox(makeBox({ scaleDegreeVisibility: { ...ALL_VISIBLE, '1': false } }))
      expect(screen.getByTestId('degree-btn-1').getAttribute('aria-pressed')).toBe('false')
    })
  })

  // ── "All" toggle ──────────────────────────────────────────────────────────

  describe('"All" toggle button', () => {
    it('renders the All button', () => {
      renderBox(makeBox())
      expect(screen.getByTestId('all-degrees-btn')).toBeTruthy()
    })

    it('calls onToggleAllDegrees when clicked (turns off when some visible)', () => {
      const box = makeBox({ id: 'box-id' })
      const { cbs } = renderBox(box)
      fireEvent.click(screen.getByTestId('all-degrees-btn'))
      expect(cbs.onToggleAllDegrees).toHaveBeenCalledWith('box-id', expect.any(Boolean))
    })

    it('calls onToggleAllDegrees with false when all currently visible', () => {
      const box = makeBox({ id: 'b1', scaleDegreeVisibility: { ...ALL_VISIBLE } })
      const { cbs } = renderBox(box)
      fireEvent.click(screen.getByTestId('all-degrees-btn'))
      // anyVisible = true → toggles to false
      expect(cbs.onToggleAllDegrees).toHaveBeenCalledWith('b1', false)
    })

    it('calls onToggleAllDegrees with true when all currently hidden', () => {
      const allHidden = Object.fromEntries(
        (['1', '2', 'b3', '3', '4', 'b5', '5', 'b6', '6', 'b7', '7'] as ScaleDegree[]).map(d => [d, false])
      ) as Record<ScaleDegree, boolean>
      const box = makeBox({ id: 'b2', scaleDegreeVisibility: allHidden })
      const { cbs } = renderBox(box)
      fireEvent.click(screen.getByTestId('all-degrees-btn'))
      expect(cbs.onToggleAllDegrees).toHaveBeenCalledWith('b2', true)
    })
  })

  // ── Box 1 special rules ───────────────────────────────────────────────────

  describe('Box 1 rules (boxIndex === 0)', () => {
    it('does not show lock button for box 1', () => {
      renderBox(makeBox(), 0)
      expect(screen.queryByTestId('lock-btn')).toBeNull()
    })

    it('shows "Box 1" label in badge', () => {
      const { container } = renderBox(makeBox(), 0)
      expect(container.textContent).toContain('Box 1')
    })

    it('shows "Box 2" label for boxIndex 1', () => {
      const { container } = renderBox(makeBox(), 1)
      expect(container.textContent).toContain('Box 2')
    })
  })

  // ── Renders without crashing ──────────────────────────────────────────────

  describe('general rendering', () => {
    it('renders without crashing', () => {
      expect(() => renderBox(makeBox())).not.toThrow()
    })

    it('renders an SVG fretboard inside', () => {
      const { container } = renderBox(makeBox())
      expect(container.querySelector('svg')).toBeTruthy()
    })

    it('renders correctly for major quality', () => {
      expect(() => renderBox(makeBox({ chordQuality: 'major', chordRoot: 'G' }))).not.toThrow()
    })

    it('renders correctly for dominant quality', () => {
      expect(() => renderBox(makeBox({ chordQuality: 'dominant', chordRoot: 'D' }))).not.toThrow()
    })
  })
})
