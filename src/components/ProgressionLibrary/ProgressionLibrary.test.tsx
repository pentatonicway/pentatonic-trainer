import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { ProgressionLibrary } from './ProgressionLibrary'
import type { Progression, BoxData, ScaleDegree } from '../../types'

// ─── Fixtures ─────────────────────────────────────────────────────────────────

const ALL_VIS = Object.fromEntries(
  (['1', '2', 'b3', '3', '4', 'b5', '5', 'b6', '6', 'b7', '7'] as ScaleDegree[]).map(d => [d, true])
) as Record<ScaleDegree, boolean>

function makeBox(root: BoxData['chordRoot'], quality: BoxData['chordQuality']): BoxData {
  return { id: `b-${root}`, chordRoot: root, chordQuality: quality, shapeIndex: 0, transposeOffset: 0, locked: true, scaleDegreeVisibility: { ...ALL_VIS } }
}

function makeProg(id: string, name: string, thumbnail = 'Am–Dm–E7'): Progression {
  return {
    id,
    name,
    thumbnail,
    boxes: [makeBox('A', 'minor'), makeBox('D', 'minor'), makeBox('E', 'dominant')],
  }
}

function renderLib(progs: Progression[] = [], overrides: Partial<React.ComponentProps<typeof ProgressionLibrary>> = {}) {
  const cbs = {
    onLoad: vi.fn(),
    onDelete: vi.fn(),
    onRename: vi.fn(),
    onSave: vi.fn(),
  }
  const result = render(
    <ProgressionLibrary progressions={progs} {...cbs} {...overrides} />
  )
  return { ...result, cbs }
}

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('ProgressionLibrary', () => {

  // ── Empty state ───────────────────────────────────────────────────────────

  it('shows empty state message when no progressions', () => {
    renderLib([])
    expect(screen.getByTestId('empty-state')).toBeTruthy()
    expect(screen.getByTestId('empty-state').textContent).toContain('No saved progressions yet')
  })

  it('does NOT show empty state when progressions exist', () => {
    renderLib([makeProg('p1', 'My Prog')])
    expect(screen.queryByTestId('empty-state')).toBeNull()
  })

  // ── Rendering progressions ─────────────────────────────────────────────────

  it('renders a card for each progression', () => {
    renderLib([makeProg('p1', 'Blues'), makeProg('p2', 'Jazz'), makeProg('p3', 'Rock')])
    expect(screen.getByTestId('prog-card-p1')).toBeTruthy()
    expect(screen.getByTestId('prog-card-p2')).toBeTruthy()
    expect(screen.getByTestId('prog-card-p3')).toBeTruthy()
  })

  it('renders progression name for each card', () => {
    renderLib([makeProg('p1', 'Blues in A'), makeProg('p2', 'Jazz ii-V-I')])
    expect(screen.getByTestId('prog-name-p1').textContent).toBe('Blues in A')
    expect(screen.getByTestId('prog-name-p2').textContent).toBe('Jazz ii-V-I')
  })

  it('renders progression thumbnail prominently', () => {
    renderLib([makeProg('p1', 'Test', 'Am–Dm–E7')])
    expect(screen.getByTestId('prog-thumbnail-p1').textContent).toBe('Am–Dm–E7')
  })

  it('renders multiple progressions with correct thumbnails', () => {
    const progs = [
      makeProg('p1', 'A', 'C–Am–F–G'),
      makeProg('p2', 'B', 'A7–D7–E7'),
    ]
    renderLib(progs)
    expect(screen.getByTestId('prog-thumbnail-p1').textContent).toBe('C–Am–F–G')
    expect(screen.getByTestId('prog-thumbnail-p2').textContent).toBe('A7–D7–E7')
  })

  // ── Load ──────────────────────────────────────────────────────────────────

  it('Load button calls onLoad with correct id', () => {
    const { cbs } = renderLib([makeProg('prog-abc', 'My Prog')])
    fireEvent.click(screen.getByTestId('load-btn-prog-abc'))
    expect(cbs.onLoad).toHaveBeenCalledWith('prog-abc')
  })

  it('Load button does NOT call onDelete or onRename', () => {
    const { cbs } = renderLib([makeProg('p1', 'Test')])
    fireEvent.click(screen.getByTestId('load-btn-p1'))
    expect(cbs.onDelete).not.toHaveBeenCalled()
    expect(cbs.onRename).not.toHaveBeenCalled()
  })

  it('each progression has its own Load button', () => {
    renderLib([makeProg('p1', 'A'), makeProg('p2', 'B')])
    expect(screen.getByTestId('load-btn-p1')).toBeTruthy()
    expect(screen.getByTestId('load-btn-p2')).toBeTruthy()
  })

  // ── Delete (with confirmation) ────────────────────────────────────────────

  it('Delete button shows confirmation prompt', () => {
    renderLib([makeProg('p1', 'Test')])
    fireEvent.click(screen.getByTestId('delete-btn-p1'))
    expect(screen.getByTestId('delete-confirm-p1')).toBeTruthy()
  })

  it('confirming delete calls onDelete with correct id', () => {
    const { cbs } = renderLib([makeProg('p1', 'Test')])
    fireEvent.click(screen.getByTestId('delete-btn-p1'))
    fireEvent.click(screen.getByTestId('delete-confirm-p1'))
    expect(cbs.onDelete).toHaveBeenCalledWith('p1')
  })

  it('cancelling delete does NOT call onDelete', () => {
    const { cbs } = renderLib([makeProg('p1', 'Test')])
    fireEvent.click(screen.getByTestId('delete-btn-p1'))
    fireEvent.click(screen.getByTestId('delete-cancel-p1'))
    expect(cbs.onDelete).not.toHaveBeenCalled()
  })

  it('Delete button does NOT immediately call onDelete (requires confirmation)', () => {
    const { cbs } = renderLib([makeProg('p1', 'Test')])
    fireEvent.click(screen.getByTestId('delete-btn-p1'))
    expect(cbs.onDelete).not.toHaveBeenCalled()
  })

  // ── Rename (inline) ───────────────────────────────────────────────────────

  it('Rename button shows an inline text input', () => {
    renderLib([makeProg('p1', 'Original')])
    fireEvent.click(screen.getByTestId('rename-btn-p1'))
    expect(screen.getByTestId('rename-input-p1')).toBeTruthy()
  })

  it('Confirming rename calls onRename with id and new name', () => {
    const { cbs } = renderLib([makeProg('p1', 'Old Name')])
    fireEvent.click(screen.getByTestId('rename-btn-p1'))
    fireEvent.change(screen.getByTestId('rename-input-p1'), { target: { value: 'New Name' } })
    fireEvent.click(screen.getByTestId('rename-confirm-p1'))
    expect(cbs.onRename).toHaveBeenCalledWith('p1', 'New Name')
  })

  it('Cancelling rename does NOT call onRename', () => {
    const { cbs } = renderLib([makeProg('p1', 'Test')])
    fireEvent.click(screen.getByTestId('rename-btn-p1'))
    fireEvent.change(screen.getByTestId('rename-input-p1'), { target: { value: 'Abandoned' } })
    fireEvent.click(screen.getByTestId('rename-cancel-p1'))
    expect(cbs.onRename).not.toHaveBeenCalled()
  })

  // ── Save current section ───────────────────────────────────────────────────

  it('renders the save name input', () => {
    renderLib()
    expect(screen.getByTestId('save-name-input')).toBeTruthy()
  })

  it('renders the Save button', () => {
    renderLib()
    expect(screen.getByTestId('save-btn')).toBeTruthy()
  })

  it('Save button calls onSave with the current input value', () => {
    const { cbs } = renderLib()
    fireEvent.change(screen.getByTestId('save-name-input'), { target: { value: 'My Blues' } })
    fireEvent.click(screen.getByTestId('save-btn'))
    expect(cbs.onSave).toHaveBeenCalledWith('My Blues')
  })

  it('Save button calls onSave even with empty input', () => {
    const { cbs } = renderLib()
    fireEvent.click(screen.getByTestId('save-btn'))
    expect(cbs.onSave).toHaveBeenCalledWith('')
  })

  it('input is cleared after saving', () => {
    renderLib()
    const input = screen.getByTestId('save-name-input') as HTMLInputElement
    fireEvent.change(input, { target: { value: 'My Prog' } })
    fireEvent.click(screen.getByTestId('save-btn'))
    expect(input.value).toBe('')
  })

  it('pressing Enter in the name input calls onSave', () => {
    const { cbs } = renderLib()
    const input = screen.getByTestId('save-name-input')
    fireEvent.change(input, { target: { value: 'Enter Test' } })
    fireEvent.keyDown(input, { key: 'Enter' })
    expect(cbs.onSave).toHaveBeenCalledWith('Enter Test')
  })
})
