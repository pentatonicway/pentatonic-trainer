import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { ChordPicker } from './ChordPicker'
import type { NoteRoot, ChordQuality } from '../../types'

// ─── Fixtures ────────────────────────────────────────────────────────────────

const SHARP_ROOTS: NoteRoot[] = ['A', 'A#', 'B', 'C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#']

function renderPicker(
  overrides: Partial<React.ComponentProps<typeof ChordPicker>> = {}
) {
  const cbs = {
    onSelect: vi.fn(),
    onClose: vi.fn(),
  }
  const props = {
    currentRoot: 'A' as NoteRoot,
    currentQuality: 'minor' as ChordQuality,
    ...cbs,
    ...overrides,
  }
  const result = render(<ChordPicker {...props} />)
  return { ...result, cbs }
}

// ─── Tests ───────────────────────────────────────────────────────────────────

describe('ChordPicker', () => {

  // ── Rendering ─────────────────────────────────────────────────────────────

  describe('rendering', () => {
    it('renders without crashing', () => {
      expect(() => renderPicker()).not.toThrow()
    })

    it('renders exactly 12 root note buttons', () => {
      renderPicker()
      const rootBtns = SHARP_ROOTS.map(n => screen.getByTestId(`root-btn-${n}`))
      expect(rootBtns).toHaveLength(12)
    })

    it('renders all 12 sharp root notes', () => {
      renderPicker()
      for (const note of SHARP_ROOTS) {
        expect(screen.getByTestId(`root-btn-${note}`)).toBeTruthy()
      }
    })

    it('renders exactly 3 quality buttons', () => {
      renderPicker()
      expect(screen.getByTestId('quality-btn-major')).toBeTruthy()
      expect(screen.getByTestId('quality-btn-minor')).toBeTruthy()
      expect(screen.getByTestId('quality-btn-dominant')).toBeTruthy()
    })

    it('renders a confirm button', () => {
      renderPicker()
      expect(screen.getByTestId('confirm-btn')).toBeTruthy()
    })

    it('renders a cancel button', () => {
      renderPicker()
      expect(screen.getByTestId('cancel-btn')).toBeTruthy()
    })

    it('has role="dialog" on the card', () => {
      renderPicker()
      expect(screen.getByRole('dialog')).toBeTruthy()
    })

    it('has aria-modal="true" on the dialog', () => {
      renderPicker()
      expect(screen.getByRole('dialog').getAttribute('aria-modal')).toBe('true')
    })
  })

  // ── Initial selection state ───────────────────────────────────────────────

  describe('initial selection', () => {
    it('currently selected root has aria-pressed=true', () => {
      renderPicker({ currentRoot: 'C' })
      expect(screen.getByTestId('root-btn-C').getAttribute('aria-pressed')).toBe('true')
    })

    it('non-selected roots have aria-pressed=false', () => {
      renderPicker({ currentRoot: 'C' })
      expect(screen.getByTestId('root-btn-A').getAttribute('aria-pressed')).toBe('false')
      expect(screen.getByTestId('root-btn-G').getAttribute('aria-pressed')).toBe('false')
    })

    it('currently selected quality has aria-pressed=true', () => {
      renderPicker({ currentQuality: 'major' })
      expect(screen.getByTestId('quality-btn-major').getAttribute('aria-pressed')).toBe('true')
    })

    it('non-selected qualities have aria-pressed=false', () => {
      renderPicker({ currentQuality: 'major' })
      expect(screen.getByTestId('quality-btn-minor').getAttribute('aria-pressed')).toBe('false')
      expect(screen.getByTestId('quality-btn-dominant').getAttribute('aria-pressed')).toBe('false')
    })
  })

  // ── Root selection ────────────────────────────────────────────────────────

  describe('root selection', () => {
    it('clicking a root button updates its aria-pressed to true', () => {
      renderPicker({ currentRoot: 'A' })
      fireEvent.click(screen.getByTestId('root-btn-F#'))
      expect(screen.getByTestId('root-btn-F#').getAttribute('aria-pressed')).toBe('true')
    })

    it('clicking a root deselects the previously selected root', () => {
      renderPicker({ currentRoot: 'A' })
      fireEvent.click(screen.getByTestId('root-btn-D'))
      expect(screen.getByTestId('root-btn-A').getAttribute('aria-pressed')).toBe('false')
    })

    it('only one root is selected at a time', () => {
      renderPicker({ currentRoot: 'A' })
      fireEvent.click(screen.getByTestId('root-btn-E'))
      const pressedRoots = SHARP_ROOTS.filter(
        n => screen.getByTestId(`root-btn-${n}`).getAttribute('aria-pressed') === 'true'
      )
      expect(pressedRoots).toHaveLength(1)
      expect(pressedRoots[0]).toBe('E')
    })
  })

  // ── Quality selection ─────────────────────────────────────────────────────

  describe('quality selection', () => {
    it('clicking a quality button updates selection', () => {
      renderPicker({ currentQuality: 'minor' })
      fireEvent.click(screen.getByTestId('quality-btn-major'))
      expect(screen.getByTestId('quality-btn-major').getAttribute('aria-pressed')).toBe('true')
      expect(screen.getByTestId('quality-btn-minor').getAttribute('aria-pressed')).toBe('false')
    })

    it('clicking dominant selects dominant', () => {
      renderPicker({ currentQuality: 'minor' })
      fireEvent.click(screen.getByTestId('quality-btn-dominant'))
      expect(screen.getByTestId('quality-btn-dominant').getAttribute('aria-pressed')).toBe('true')
    })

    it('only one quality is selected at a time', () => {
      renderPicker({ currentQuality: 'minor' })
      fireEvent.click(screen.getByTestId('quality-btn-dominant'))
      const qualities = ['major', 'minor', 'dominant'] as ChordQuality[]
      const selected = qualities.filter(
        q => screen.getByTestId(`quality-btn-${q}`).getAttribute('aria-pressed') === 'true'
      )
      expect(selected).toHaveLength(1)
    })
  })

  // ── Confirm ───────────────────────────────────────────────────────────────

  describe('confirm button', () => {
    it('calls onSelect with current root and quality on confirm', () => {
      const { cbs } = renderPicker({ currentRoot: 'A', currentQuality: 'minor' })
      fireEvent.click(screen.getByTestId('confirm-btn'))
      expect(cbs.onSelect).toHaveBeenCalledWith('A', 'minor')
    })

    it('calls onSelect with newly selected root', () => {
      const { cbs } = renderPicker({ currentRoot: 'A', currentQuality: 'minor' })
      fireEvent.click(screen.getByTestId('root-btn-G#'))
      fireEvent.click(screen.getByTestId('confirm-btn'))
      expect(cbs.onSelect).toHaveBeenCalledWith('G#', 'minor')
    })

    it('calls onSelect with newly selected quality', () => {
      const { cbs } = renderPicker({ currentRoot: 'E', currentQuality: 'minor' })
      fireEvent.click(screen.getByTestId('quality-btn-dominant'))
      fireEvent.click(screen.getByTestId('confirm-btn'))
      expect(cbs.onSelect).toHaveBeenCalledWith('E', 'dominant')
    })

    it('calls onSelect with both changed root and quality', () => {
      const { cbs } = renderPicker({ currentRoot: 'A', currentQuality: 'minor' })
      fireEvent.click(screen.getByTestId('root-btn-C#'))
      fireEvent.click(screen.getByTestId('quality-btn-major'))
      fireEvent.click(screen.getByTestId('confirm-btn'))
      expect(cbs.onSelect).toHaveBeenCalledWith('C#', 'major')
    })

    it('calls onClose after confirm', () => {
      const { cbs } = renderPicker()
      fireEvent.click(screen.getByTestId('confirm-btn'))
      expect(cbs.onClose).toHaveBeenCalled()
    })

    it('confirm button is always enabled', () => {
      renderPicker()
      expect(screen.getByTestId('confirm-btn')).not.toBeDisabled()
    })
  })

  // ── Cancel ────────────────────────────────────────────────────────────────

  describe('cancel button', () => {
    it('calls onClose when cancel is clicked', () => {
      const { cbs } = renderPicker()
      fireEvent.click(screen.getByTestId('cancel-btn'))
      expect(cbs.onClose).toHaveBeenCalled()
    })

    it('does NOT call onSelect when cancel is clicked', () => {
      const { cbs } = renderPicker()
      fireEvent.click(screen.getByTestId('cancel-btn'))
      expect(cbs.onSelect).not.toHaveBeenCalled()
    })
  })

  // ── Escape key ────────────────────────────────────────────────────────────

  describe('escape key', () => {
    it('calls onClose when Escape is pressed', () => {
      const { cbs } = renderPicker()
      fireEvent.keyDown(document, { key: 'Escape' })
      expect(cbs.onClose).toHaveBeenCalled()
    })

    it('does NOT call onSelect when Escape is pressed', () => {
      const { cbs } = renderPicker()
      fireEvent.keyDown(document, { key: 'Escape' })
      expect(cbs.onSelect).not.toHaveBeenCalled()
    })
  })

  // ── Overlay click ─────────────────────────────────────────────────────────

  describe('overlay click', () => {
    it('calls onClose when overlay background is clicked', () => {
      const { cbs } = renderPicker()
      fireEvent.click(screen.getByTestId('chord-picker-overlay'))
      expect(cbs.onClose).toHaveBeenCalled()
    })

    it('does NOT call onClose when the card itself is clicked', () => {
      const { cbs } = renderPicker()
      fireEvent.click(screen.getByTestId('chord-picker-card'))
      expect(cbs.onClose).not.toHaveBeenCalled()
    })
  })
})
