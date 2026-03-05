import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { AdminPanel } from './AdminPanel'
import type { OverrideRule } from '../../types'

function makeRule(quality: string, box1Shape: number, interval: number, shapeIndex: number): OverrideRule {
  return { key: `${quality}|${box1Shape}|${interval}`, shapeIndex }
}

function renderPanel(overrides: OverrideRule[] = [], overrideFns: Partial<{ onClearAll: () => void; onRemoveOverride: (key: string) => void }> = {}) {
  const cbs = {
    onClearAll: vi.fn(),
    onRemoveOverride: vi.fn(),
    ...overrideFns,
  }
  render(<AdminPanel overrides={overrides} {...cbs} />)
  return cbs
}

describe('AdminPanel', () => {

  // ── Rendering ─────────────────────────────────────────────────────────────

  it('renders without crashing', () => {
    expect(() => renderPanel()).not.toThrow()
  })

  it('shows the ADMIN badge', () => {
    renderPanel()
    expect(screen.getByTestId('admin-panel')).toBeTruthy()
    // The badge text "Admin" is present inside the panel
    const panel = screen.getByTestId('admin-panel')
    expect(panel.textContent).toMatch(/admin/i)
  })

  it('shows "Copy Override File" button', () => {
    renderPanel()
    expect(screen.getByTestId('copy-overrides-btn')).toBeTruthy()
  })

  it('shows "Clear All" button', () => {
    renderPanel()
    expect(screen.getByTestId('clear-overrides-btn')).toBeTruthy()
  })

  // ── Override count ────────────────────────────────────────────────────────

  it('shows "0 overrides active" when empty', () => {
    renderPanel([])
    expect(screen.getByTestId('override-count').textContent).toContain('0')
  })

  it('shows correct count for 1 override', () => {
    renderPanel([makeRule('minor', 0, 3, 1)])
    expect(screen.getByTestId('override-count').textContent).toContain('1')
  })

  it('shows correct count for 3 overrides', () => {
    renderPanel([makeRule('minor', 0, 3, 1), makeRule('major', 0, 5, 2), makeRule('dominant', 0, 7, 3)])
    expect(screen.getByTestId('override-count').textContent).toContain('3')
  })

  it('shows "overrides" (plural) for 0', () => {
    renderPanel([])
    expect(screen.getByTestId('override-count').textContent).toMatch(/overrides/)
  })

  it('shows "override" (singular) for 1', () => {
    renderPanel([makeRule('minor', 0, 3, 1)])
    expect(screen.getByTestId('override-count').textContent).toMatch(/1 override/)
  })

  // ── Override list ─────────────────────────────────────────────────────────

  it('shows empty state when no overrides', () => {
    renderPanel([])
    expect(screen.getByTestId('no-overrides')).toBeTruthy()
  })

  it('renders a row for each override', () => {
    const rules = [makeRule('minor', 0, 3, 1), makeRule('major', 0, 5, 2)]
    renderPanel(rules)
    expect(screen.getByTestId(`override-row-minor|0|3`)).toBeTruthy()
    expect(screen.getByTestId(`override-row-major|0|5`)).toBeTruthy()
  })

  it('shows the rule key in each row', () => {
    renderPanel([makeRule('minor', 0, 5, 2)])
    expect(screen.getByText('minor|0|5')).toBeTruthy()
  })

  it('remove button for each override row is present', () => {
    renderPanel([makeRule('minor', 0, 3, 1)])
    expect(screen.getByTestId('remove-override-minor|0|3')).toBeTruthy()
  })

  it('clicking remove override button calls onRemoveOverride with correct key', () => {
    const cbs = renderPanel([makeRule('minor', 0, 5, 2)])
    fireEvent.click(screen.getByTestId('remove-override-minor|0|5'))
    expect(cbs.onRemoveOverride).toHaveBeenCalledWith('minor|0|5')
  })

  // ── Clear All (with confirmation) ─────────────────────────────────────────

  it('clicking "Clear All" once shows a confirmation prompt', () => {
    renderPanel([makeRule('minor', 0, 3, 1)])
    fireEvent.click(screen.getByTestId('clear-overrides-btn'))
    expect(screen.getByTestId('clear-overrides-btn').textContent).toContain('Confirm')
  })

  it('clicking "Clear All" twice calls onClearAll', () => {
    const cbs = renderPanel([makeRule('minor', 0, 3, 1)])
    fireEvent.click(screen.getByTestId('clear-overrides-btn')) // first: confirm prompt
    fireEvent.click(screen.getByTestId('clear-overrides-btn')) // second: actual clear
    expect(cbs.onClearAll).toHaveBeenCalledTimes(1)
  })

  it('clicking "Clear All" once does NOT immediately call onClearAll', () => {
    const cbs = renderPanel([makeRule('minor', 0, 3, 1)])
    fireEvent.click(screen.getByTestId('clear-overrides-btn'))
    expect(cbs.onClearAll).not.toHaveBeenCalled()
  })

  // ── Copy Override File ────────────────────────────────────────────────────

  it('copy button is always present', () => {
    renderPanel()
    expect(screen.getByTestId('copy-overrides-btn')).toBeTruthy()
  })

  it('copy button has accessible label', () => {
    renderPanel()
    const btn = screen.getByTestId('copy-overrides-btn')
    expect(btn.getAttribute('aria-label')).toBeTruthy()
  })
})
