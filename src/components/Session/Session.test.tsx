import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { Session } from './Session'
import { useSessionStore } from '../../store/sessionStore'
import type { BoxData, ScaleDegree } from '../../types'

// ─── Fixture helpers ─────────────────────────────────────────────────────────

const ALL_VIS = Object.fromEntries(
  (['1', '2', 'b3', '3', '4', 'b5', '5', 'b6', '6', 'b7', '7'] as ScaleDegree[]).map(d => [d, true])
) as Record<ScaleDegree, boolean>

function makeBox(id: string, locked: boolean): BoxData {
  return {
    id,
    chordRoot: 'A',
    chordQuality: 'minor',
    shapeIndex: 0,
    transposeOffset: 0,
    locked,
    scaleDegreeVisibility: { ...ALL_VIS },
  }
}

function resetTo(boxes: BoxData[]) {
  useSessionStore.setState({ boxes, overrides: [], adminMode: false })
}

// Reset to single locked box before each test
beforeEach(() => {
  resetTo([makeBox('b1', true)])
})

// ─── Tests ───────────────────────────────────────────────────────────────────

describe('Session', () => {

  // ── Rendering ────────────────────────────────────────────────────────────

  describe('initial render', () => {
    it('renders without crashing', () => {
      expect(() => render(<Session />)).not.toThrow()
    })

    it('renders exactly 1 ChordBox wrapper initially', () => {
      render(<Session />)
      expect(screen.getByTestId('box-wrapper-0')).toBeTruthy()
      expect(screen.queryByTestId('box-wrapper-1')).toBeNull()
    })

    it('renders the Add Box button', () => {
      render(<Session />)
      expect(screen.getByTestId('add-box-btn')).toBeTruthy()
    })

    it('renders the Lock All / Unlock All toolbar button', () => {
      render(<Session />)
      expect(screen.getByTestId('lock-all-btn')).toBeTruthy()
    })

    it('chord name reflects store data', () => {
      render(<Session />)
      expect(screen.getByTestId('chord-name').textContent).toContain('A')
    })
  })

  // ── Add Box ───────────────────────────────────────────────────────────────

  describe('Add Box', () => {
    it('clicking Add Box shows a second box wrapper', () => {
      render(<Session />)
      fireEvent.click(screen.getByTestId('add-box-btn'))
      expect(screen.getByTestId('box-wrapper-1')).toBeTruthy()
    })

    it('clicking Add Box twice shows three wrappers', () => {
      render(<Session />)
      fireEvent.click(screen.getByTestId('add-box-btn'))
      fireEvent.click(screen.getByTestId('add-box-btn'))
      expect(screen.getByTestId('box-wrapper-2')).toBeTruthy()
    })

    it('store box count increases when Add Box is clicked', () => {
      render(<Session />)
      expect(useSessionStore.getState().boxes).toHaveLength(1)
      fireEvent.click(screen.getByTestId('add-box-btn'))
      expect(useSessionStore.getState().boxes).toHaveLength(2)
    })
  })

  // ── Remove Box ────────────────────────────────────────────────────────────

  describe('Remove Box', () => {
    it('remove button is NOT rendered when only 1 box exists', () => {
      render(<Session />)
      expect(screen.queryByTestId('remove-box-0')).toBeNull()
      expect(screen.queryByTestId('remove-box-1')).toBeNull()
    })

    it('remove button appears on box at index 1 when 2 boxes exist', () => {
      resetTo([makeBox('b1', true), makeBox('b2', false)])
      render(<Session />)
      expect(screen.getByTestId('remove-box-1')).toBeTruthy()
    })

    it('box 1 (index 0) never shows a remove button', () => {
      resetTo([makeBox('b1', true), makeBox('b2', false)])
      render(<Session />)
      expect(screen.queryByTestId('remove-box-0')).toBeNull()
    })

    it('clicking remove on box 2 reduces store count to 1', () => {
      resetTo([makeBox('b1', true), makeBox('b2', false)])
      render(<Session />)
      fireEvent.click(screen.getByTestId('remove-box-1'))
      expect(useSessionStore.getState().boxes).toHaveLength(1)
    })

    it('clicking remove eliminates the correct box by id', () => {
      resetTo([makeBox('b1', true), makeBox('b2', false)])
      render(<Session />)
      fireEvent.click(screen.getByTestId('remove-box-1'))
      const ids = useSessionStore.getState().boxes.map(b => b.id)
      expect(ids).toContain('b1')
      expect(ids).not.toContain('b2')
    })
  })

  // ── Lock All / Unlock All ─────────────────────────────────────────────────

  describe('Lock All / Unlock All toolbar', () => {
    it('renders a lock-all-btn in the toolbar', () => {
      render(<Session />)
      expect(screen.getByTestId('lock-all-btn')).toBeTruthy()
    })

    it('renders an unlock-all-btn in the toolbar', () => {
      render(<Session />)
      expect(screen.getByTestId('unlock-all-btn')).toBeTruthy()
    })

    it('"Lock All" button locks every non-box-1 box in the store', () => {
      resetTo([makeBox('b1', true), makeBox('b2', false), makeBox('b3', false)])
      render(<Session />)
      fireEvent.click(screen.getByTestId('lock-all-btn'))
      const boxes = useSessionStore.getState().boxes
      expect(boxes[1].locked).toBe(true)
      expect(boxes[2].locked).toBe(true)
    })

    it('"Unlock All" button unlocks non-box-1 boxes', () => {
      resetTo([makeBox('b1', true), makeBox('b2', true), makeBox('b3', true)])
      render(<Session />)
      fireEvent.click(screen.getByTestId('unlock-all-btn'))
      const boxes = useSessionStore.getState().boxes
      expect(boxes[0].locked).toBe(true)
      expect(boxes[1].locked).toBe(false)
      expect(boxes[2].locked).toBe(false)
    })
  })

  // ── ChordBox wiring ───────────────────────────────────────────────────────

  describe('ChordBox prop wiring', () => {
    it('lock toggle on box 2 correctly toggles its locked state in the store', () => {
      resetTo([makeBox('b1', true), makeBox('b2', false)])
      render(<Session />)

      // box2 is unlocked → lock button shows 🔓
      const lockBtns = screen.getAllByTestId('lock-btn')
      expect(lockBtns).toHaveLength(1) // only box 2 has a lock btn
      expect(lockBtns[0].textContent).toBe('🔓')

      fireEvent.click(lockBtns[0])

      expect(useSessionStore.getState().boxes[1].locked).toBe(true)
    })

    it('locking then unlocking box 2 cycles state correctly', () => {
      resetTo([makeBox('b1', true), makeBox('b2', false)])
      render(<Session />)
      const lockBtns = screen.getAllByTestId('lock-btn')
      fireEvent.click(lockBtns[0]) // lock
      expect(useSessionStore.getState().boxes[1].locked).toBe(true)
      fireEvent.click(lockBtns[0]) // unlock
      expect(useSessionStore.getState().boxes[1].locked).toBe(false)
    })

    it('next shape on unlocked box 2 increments its shapeIndex', () => {
      const b2 = { ...makeBox('b2', false), shapeIndex: 1 }
      resetTo([makeBox('b1', true), b2])
      render(<Session />)

      const nextBtns = screen.getAllByTestId('next-btn')
      // nextBtns[0] = box1 (disabled), nextBtns[1] = box2
      fireEvent.click(nextBtns[1])

      expect(useSessionStore.getState().boxes[1].shapeIndex).toBe(2)
    })

    it('prev shape on unlocked box 2 decrements its shapeIndex', () => {
      const b2 = { ...makeBox('b2', false), shapeIndex: 3 }
      resetTo([makeBox('b1', true), b2])
      render(<Session />)

      const prevBtns = screen.getAllByTestId('prev-btn')
      fireEvent.click(prevBtns[1])

      expect(useSessionStore.getState().boxes[1].shapeIndex).toBe(2)
    })

    it('degree toggle button flips visibility in the store', () => {
      render(<Session />)
      const before = useSessionStore.getState().boxes[0].scaleDegreeVisibility['1']
      fireEvent.click(screen.getByTestId('degree-btn-1'))
      expect(useSessionStore.getState().boxes[0].scaleDegreeVisibility['1']).toBe(!before)
    })

    it('"All" degrees button calls setAllScaleDegrees on the box', () => {
      // Make one degree invisible so "All" will turn everything on
      const b1: BoxData = {
        ...makeBox('b1', true),
        scaleDegreeVisibility: { ...ALL_VIS, '1': false },
      }
      resetTo([b1])
      render(<Session />)
      fireEvent.click(screen.getByTestId('all-degrees-btn'))
      // setAllScaleDegrees always restores all to visible
      expect(useSessionStore.getState().boxes[0].scaleDegreeVisibility['1']).toBe(true)
    })
  })
})
