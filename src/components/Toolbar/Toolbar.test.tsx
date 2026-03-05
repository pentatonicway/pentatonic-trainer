import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { Toolbar } from './Toolbar'

function renderToolbar(overrides: Partial<React.ComponentProps<typeof Toolbar>> = {}) {
  const cbs = {
    onTransposeUp: vi.fn(),
    onTransposeDown: vi.fn(),
    onOpenPresets: vi.fn(),
    onLockAll: vi.fn(),
    onUnlockAll: vi.fn(),
  }
  const props = {
    transposeOffset: 0,
    ...cbs,
    ...overrides,
  }
  const result = render(<Toolbar {...props} />)
  return { ...result, cbs }
}

describe('Toolbar', () => {

  // ── Rendering ─────────────────────────────────────────────────────────────

  it('renders without crashing', () => {
    expect(() => renderToolbar()).not.toThrow()
  })

  it('renders the Presets button', () => {
    renderToolbar()
    expect(screen.getByTestId('open-presets-btn')).toBeTruthy()
  })

  it('renders the transpose up button', () => {
    renderToolbar()
    expect(screen.getByTestId('transpose-up-btn')).toBeTruthy()
  })

  it('renders the transpose down button', () => {
    renderToolbar()
    expect(screen.getByTestId('transpose-down-btn')).toBeTruthy()
  })

  it('renders the transpose offset display', () => {
    renderToolbar()
    expect(screen.getByTestId('transpose-offset')).toBeTruthy()
  })

  it('renders Lock All and Unlock All buttons', () => {
    renderToolbar()
    expect(screen.getByTestId('lock-all-btn')).toBeTruthy()
    expect(screen.getByTestId('unlock-all-btn')).toBeTruthy()
  })

  // ── Transpose offset display ──────────────────────────────────────────────

  it('displays "0" when transposeOffset is 0', () => {
    renderToolbar({ transposeOffset: 0 })
    expect(screen.getByTestId('transpose-offset').textContent).toBe('0')
  })

  it('displays "+3" when transposeOffset is 3', () => {
    renderToolbar({ transposeOffset: 3 })
    expect(screen.getByTestId('transpose-offset').textContent).toBe('+3')
  })

  it('displays "+11" when transposeOffset is 11', () => {
    renderToolbar({ transposeOffset: 11 })
    expect(screen.getByTestId('transpose-offset').textContent).toBe('+11')
  })

  it('displays "0" when transposeOffset is 0 (wraps back)', () => {
    renderToolbar({ transposeOffset: 0 })
    expect(screen.getByTestId('transpose-offset').textContent).toBe('0')
  })

  // ── Callbacks ─────────────────────────────────────────────────────────────

  it('transpose up button calls onTransposeUp', () => {
    const { cbs } = renderToolbar()
    fireEvent.click(screen.getByTestId('transpose-up-btn'))
    expect(cbs.onTransposeUp).toHaveBeenCalledTimes(1)
  })

  it('transpose down button calls onTransposeDown', () => {
    const { cbs } = renderToolbar()
    fireEvent.click(screen.getByTestId('transpose-down-btn'))
    expect(cbs.onTransposeDown).toHaveBeenCalledTimes(1)
  })

  it('Presets button calls onOpenPresets', () => {
    const { cbs } = renderToolbar()
    fireEvent.click(screen.getByTestId('open-presets-btn'))
    expect(cbs.onOpenPresets).toHaveBeenCalledTimes(1)
  })

  it('Lock All button calls onLockAll', () => {
    const { cbs } = renderToolbar()
    fireEvent.click(screen.getByTestId('lock-all-btn'))
    expect(cbs.onLockAll).toHaveBeenCalledTimes(1)
  })

  it('Unlock All button calls onUnlockAll', () => {
    const { cbs } = renderToolbar()
    fireEvent.click(screen.getByTestId('unlock-all-btn'))
    expect(cbs.onUnlockAll).toHaveBeenCalledTimes(1)
  })

  it('transpose up does not call onTransposeDown', () => {
    const { cbs } = renderToolbar()
    fireEvent.click(screen.getByTestId('transpose-up-btn'))
    expect(cbs.onTransposeDown).not.toHaveBeenCalled()
  })

  it('transpose down does not call onTransposeUp', () => {
    const { cbs } = renderToolbar()
    fireEvent.click(screen.getByTestId('transpose-down-btn'))
    expect(cbs.onTransposeUp).not.toHaveBeenCalled()
  })

  it('clicking multiple times calls the callback multiple times', () => {
    const { cbs } = renderToolbar()
    fireEvent.click(screen.getByTestId('transpose-up-btn'))
    fireEvent.click(screen.getByTestId('transpose-up-btn'))
    fireEvent.click(screen.getByTestId('transpose-up-btn'))
    expect(cbs.onTransposeUp).toHaveBeenCalledTimes(3)
  })
})
