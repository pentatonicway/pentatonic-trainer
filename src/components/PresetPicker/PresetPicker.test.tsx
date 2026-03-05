import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { PresetPicker } from './PresetPicker'
import { PRESETS } from '../../constants/presets'
import type { Progression } from '../../types'

function renderPicker(overrides: Partial<React.ComponentProps<typeof PresetPicker>> = {}) {
  const cbs = {
    onSelect: vi.fn(),
    onClose: vi.fn(),
  }
  const result = render(<PresetPicker {...cbs} {...overrides} />)
  return { ...result, cbs }
}

describe('PresetPicker', () => {

  // ── Rendering ─────────────────────────────────────────────────────────────

  it('renders without crashing', () => {
    expect(() => renderPicker()).not.toThrow()
  })

  it('renders all 20 preset rows', () => {
    renderPicker()
    const rows = screen.getAllByRole('button').filter(
      el => el.getAttribute('data-testid')?.startsWith('preset-row-')
    )
    expect(rows).toHaveLength(20)
  })

  it('renders all 20 preset names as text', () => {
    renderPicker()
    for (const preset of PRESETS) {
      expect(screen.getByText(preset.name)).toBeTruthy()
    }
  })

  it('has role="dialog" on the card', () => {
    renderPicker()
    expect(screen.getByRole('dialog')).toBeTruthy()
  })

  it('shows chord count for each preset', () => {
    renderPicker()
    // 12-Bar Blues has 12 chords → "12 chords" visible
    expect(screen.getByText('12 chords')).toBeTruthy()
  })

  // ── Preset selection ──────────────────────────────────────────────────────

  it('clicking a preset row calls onSelect with that preset', () => {
    const { cbs } = renderPicker()
    fireEvent.click(screen.getByTestId('preset-row-0'))
    expect(cbs.onSelect).toHaveBeenCalledWith(PRESETS[0])
  })

  it('clicking different preset rows calls onSelect with the correct preset', () => {
    const { cbs } = renderPicker()
    fireEvent.click(screen.getByTestId('preset-row-4'))
    expect(cbs.onSelect).toHaveBeenCalledWith(PRESETS[4])
  })

  it('clicking a preset also calls onClose', () => {
    const { cbs } = renderPicker()
    fireEvent.click(screen.getByTestId('preset-row-0'))
    expect(cbs.onClose).toHaveBeenCalled()
  })

  it('clicking "12-Bar Blues" row selects the correct preset', () => {
    const { cbs } = renderPicker()
    const bluesIdx = PRESETS.findIndex(p => p.name === '12-Bar Blues')
    fireEvent.click(screen.getByTestId(`preset-row-${bluesIdx}`))
    const arg = cbs.onSelect.mock.calls[0][0] as Progression
    expect(arg.name).toBe('12-Bar Blues')
    expect(arg.boxes).toHaveLength(12)
  })

  // ── Close behaviours ──────────────────────────────────────────────────────

  it('close (×) button calls onClose', () => {
    const { cbs } = renderPicker()
    fireEvent.click(screen.getByTestId('preset-picker-close'))
    expect(cbs.onClose).toHaveBeenCalled()
  })

  it('Escape key calls onClose', () => {
    const { cbs } = renderPicker()
    fireEvent.keyDown(document, { key: 'Escape' })
    expect(cbs.onClose).toHaveBeenCalled()
  })

  it('clicking the overlay background calls onClose', () => {
    const { cbs } = renderPicker()
    fireEvent.click(screen.getByTestId('preset-picker-overlay'))
    expect(cbs.onClose).toHaveBeenCalled()
  })

  it('clicking the card itself does NOT call onClose', () => {
    const { cbs } = renderPicker()
    fireEvent.click(screen.getByTestId('preset-picker-card'))
    expect(cbs.onClose).not.toHaveBeenCalled()
  })

  it('Escape does NOT call onSelect', () => {
    const { cbs } = renderPicker()
    fireEvent.keyDown(document, { key: 'Escape' })
    expect(cbs.onSelect).not.toHaveBeenCalled()
  })
})
