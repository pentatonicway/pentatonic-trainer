import { useState } from 'react'
import type { Progression } from '../../types'

// ─── Types ────────────────────────────────────────────────────────────────────

export type ProgressionLibraryProps = {
  progressions: Progression[]
  onLoad: (id: string) => void
  onDelete: (id: string) => void
  onRename: (id: string, name: string) => void
  onSave: (name: string) => void
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const S = {
  panel: {
    display: 'flex',
    flexDirection: 'column' as const,
    height: '100%',
    fontFamily: "'DM Sans', 'Segoe UI', system-ui, sans-serif",
    background: 'linear-gradient(180deg, #151b2a 0%, #111621 100%)',
    borderRight: '1px solid rgba(255,255,255,0.07)',
    minWidth: 260,
    maxWidth: 300,
    overflow: 'hidden',
  },
  saveSection: {
    padding: '16px 14px 14px',
    borderBottom: '1px solid rgba(255,255,255,0.07)',
    flexShrink: 0,
  },
  saveSectionLabel: {
    fontSize: 10,
    fontWeight: 700,
    letterSpacing: '0.1em',
    textTransform: 'uppercase' as const,
    color: '#4A5568',
    marginBottom: 8,
    display: 'block',
  },
  saveRow: {
    display: 'flex',
    gap: 6,
  },
  saveInput: {
    flex: 1,
    background: 'rgba(255,255,255,0.05)',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: 7,
    color: '#E2E8F0',
    fontSize: 13,
    padding: '7px 10px',
    outline: 'none',
    fontFamily: 'inherit',
    minWidth: 0,
  },
  saveBtn: {
    background: 'rgba(72,187,120,0.15)',
    border: '1px solid rgba(72,187,120,0.35)',
    borderRadius: 7,
    color: '#9AE6B4',
    cursor: 'pointer',
    fontSize: 12,
    fontWeight: 600,
    padding: '7px 12px',
    whiteSpace: 'nowrap' as const,
    transition: 'all 0.12s',
    flexShrink: 0,
  },
  listSection: {
    flex: 1,
    overflowY: 'auto' as const,
    padding: '8px 10px 16px',
    scrollbarWidth: 'thin' as const,
    scrollbarColor: 'rgba(255,255,255,0.08) transparent',
  },
  listLabel: {
    fontSize: 10,
    fontWeight: 700,
    letterSpacing: '0.1em',
    textTransform: 'uppercase' as const,
    color: '#4A5568',
    marginBottom: 6,
    display: 'block',
    padding: '0 4px',
  },
  emptyState: {
    textAlign: 'center' as const,
    color: '#4A5568',
    fontSize: 13,
    padding: '32px 16px',
    lineHeight: 1.6,
  },
  card: (renaming: boolean) => ({
    background: renaming ? 'rgba(99,179,237,0.06)' : 'rgba(255,255,255,0.04)',
    border: `1px solid ${renaming ? 'rgba(99,179,237,0.25)' : 'rgba(255,255,255,0.07)'}`,
    borderRadius: 10,
    padding: '10px 12px',
    marginBottom: 6,
    transition: 'border 0.15s',
  }),
  thumbnail: {
    fontSize: 13,
    fontWeight: 700,
    color: '#90CDF4',
    letterSpacing: '0.02em',
    marginBottom: 3,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap' as const,
  },
  progName: {
    fontSize: 12,
    color: '#A0AEC0',
    marginBottom: 8,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap' as const,
  },
  cardActions: {
    display: 'flex',
    gap: 4,
    alignItems: 'center',
  },
  actionBtn: (variant: 'default' | 'danger' | 'confirm' = 'default') => ({
    background: 'none',
    border: `1px solid ${
      variant === 'danger' ? 'rgba(229,62,62,0.35)' :
      variant === 'confirm' ? 'rgba(72,187,120,0.35)' :
      'rgba(255,255,255,0.1)'
    }`,
    borderRadius: 5,
    color:
      variant === 'danger' ? '#FC8181' :
      variant === 'confirm' ? '#9AE6B4' :
      '#718096',
    cursor: 'pointer',
    fontSize: 10,
    fontWeight: 600,
    padding: '3px 8px',
    transition: 'all 0.12s',
    letterSpacing: '0.04em',
  }),
  renameInput: {
    background: 'rgba(255,255,255,0.06)',
    border: '1px solid rgba(99,179,237,0.35)',
    borderRadius: 5,
    color: '#E2E8F0',
    fontSize: 12,
    padding: '3px 8px',
    outline: 'none',
    fontFamily: 'inherit',
    flex: 1,
    minWidth: 0,
  },
}

// ─── ProgressionCard sub-component ───────────────────────────────────────────

function ProgressionCard({
  progression,
  onLoad,
  onDelete,
  onRename,
}: {
  progression: Progression
  onLoad: (id: string) => void
  onDelete: (id: string) => void
  onRename: (id: string, name: string) => void
}) {
  const [renaming, setRenaming] = useState(false)
  const [renameValue, setRenameValue] = useState(progression.name)
  const [confirmDelete, setConfirmDelete] = useState(false)

  const commitRename = () => {
    if (renameValue.trim()) onRename(progression.id, renameValue.trim())
    setRenaming(false)
  }

  const thumbnail = progression.thumbnail || progression.boxes
    .slice(0, 4)
    .map(b => b.chordRoot + (b.chordQuality === 'minor' ? 'm' : b.chordQuality === 'dominant' ? '7' : ''))
    .join('–') + (progression.boxes.length > 4 ? '…' : '')

  return (
    <div style={S.card(renaming)} data-testid={`prog-card-${progression.id}`}>
      <div style={S.thumbnail} data-testid={`prog-thumbnail-${progression.id}`}>
        {thumbnail}
      </div>

      {renaming ? (
        <div style={{ display: 'flex', gap: 4, marginBottom: 8 }}>
          <input
            style={S.renameInput}
            value={renameValue}
            onChange={e => setRenameValue(e.target.value)}
            onKeyDown={e => {
              if (e.key === 'Enter') commitRename()
              if (e.key === 'Escape') { setRenaming(false); setRenameValue(progression.name) }
            }}
            autoFocus
            data-testid={`rename-input-${progression.id}`}
          />
        </div>
      ) : (
        <div style={S.progName} data-testid={`prog-name-${progression.id}`}>
          {progression.name}
        </div>
      )}

      <div style={S.cardActions}>
        {!renaming && !confirmDelete && (
          <>
            <button
              style={S.actionBtn('default')}
              onClick={() => onLoad(progression.id)}
              data-testid={`load-btn-${progression.id}`}
            >
              Load
            </button>
            <button
              style={S.actionBtn('default')}
              onClick={() => { setRenaming(true); setRenameValue(progression.name) }}
              data-testid={`rename-btn-${progression.id}`}
            >
              Rename
            </button>
            <button
              style={S.actionBtn('danger')}
              onClick={() => setConfirmDelete(true)}
              data-testid={`delete-btn-${progression.id}`}
            >
              Delete
            </button>
          </>
        )}

        {renaming && (
          <>
            <button
              style={S.actionBtn('confirm')}
              onClick={commitRename}
              data-testid={`rename-confirm-${progression.id}`}
            >
              ✓ Save
            </button>
            <button
              style={S.actionBtn('default')}
              onClick={() => { setRenaming(false); setRenameValue(progression.name) }}
              data-testid={`rename-cancel-${progression.id}`}
            >
              Cancel
            </button>
          </>
        )}

        {confirmDelete && (
          <>
            <span style={{ fontSize: 11, color: '#FC8181', marginRight: 4 }}>Delete?</span>
            <button
              style={S.actionBtn('danger')}
              onClick={() => onDelete(progression.id)}
              data-testid={`delete-confirm-${progression.id}`}
            >
              Yes
            </button>
            <button
              style={S.actionBtn('default')}
              onClick={() => setConfirmDelete(false)}
              data-testid={`delete-cancel-${progression.id}`}
            >
              No
            </button>
          </>
        )}
      </div>
    </div>
  )
}

// ─── Main component ───────────────────────────────────────────────────────────

export function ProgressionLibrary({
  progressions,
  onLoad,
  onDelete,
  onRename,
  onSave,
}: ProgressionLibraryProps) {
  const [saveName, setSaveName] = useState('')

  const handleSave = () => {
    onSave(saveName)
    setSaveName('')
  }

  return (
    <div style={S.panel} data-testid="progression-library">
      {/* ── Save current section ── */}
      <div style={S.saveSection}>
        <span style={S.saveSectionLabel}>Save Current</span>
        <div style={S.saveRow}>
          <input
            style={S.saveInput}
            placeholder="Progression name…"
            value={saveName}
            onChange={e => setSaveName(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSave()}
            data-testid="save-name-input"
            aria-label="Progression name"
          />
          <button
            style={S.saveBtn}
            onClick={handleSave}
            data-testid="save-btn"
            aria-label="Save current progression"
          >
            Save
          </button>
        </div>
      </div>

      {/* ── Saved list ── */}
      <div style={S.listSection}>
        <span style={S.listLabel}>Saved ({progressions.length})</span>

        {progressions.length === 0 ? (
          <div style={S.emptyState} data-testid="empty-state">
            No saved progressions yet.
          </div>
        ) : (
          progressions.map(p => (
            <ProgressionCard
              key={p.id}
              progression={p}
              onLoad={onLoad}
              onDelete={onDelete}
              onRename={onRename}
            />
          ))
        )}
      </div>
    </div>
  )
}

export default ProgressionLibrary
