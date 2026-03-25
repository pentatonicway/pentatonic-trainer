import { useState, useEffect, useRef, useCallback } from 'react'
import type { Progression } from '../../types'

export type ProgressionLibraryProps = {
  progressions: Progression[]
  onLoad: (id: string) => void
  onDelete: (id: string) => void
  onRename: (id: string, name: string) => void
  onSave: (name: string) => void
  onClose: () => void
  themeKey?: 'dark' | 'light'
}

function ProgressionCard({
  progression, onLoad, onDelete, onRename, isLight,
}: {
  progression: Progression
  onLoad: (id: string) => void
  onDelete: (id: string) => void
  onRename: (id: string, name: string) => void
  isLight: boolean
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

  const actionBtn = (variant: 'default' | 'danger' | 'confirm' = 'default') => ({
    background: 'none',
    border: `1px solid ${
      variant === 'danger'  ? (isLight ? 'rgba(197,48,48,0.4)' : 'rgba(229,62,62,0.35)') :
      variant === 'confirm' ? (isLight ? 'rgba(39,103,73,0.4)' : 'rgba(72,187,120,0.35)') :
      (isLight ? '#CBD5E0' : 'rgba(255,255,255,0.1)')
    }`,
    borderRadius: 5,
    color:
      variant === 'danger'  ? (isLight ? '#C53030' : '#FC8181') :
      variant === 'confirm' ? (isLight ? '#276749' : '#9AE6B4') :
      (isLight ? '#718096' : '#718096'),
    cursor: 'pointer',
    fontSize: 10,
    fontWeight: 600,
    padding: '3px 8px',
    transition: 'all 0.12s',
    letterSpacing: '0.04em',
  })

  return (
    <div style={{
      background: isLight ? (renaming ? 'rgba(49,130,206,0.06)' : '#F9FAFB') : (renaming ? 'rgba(99,179,237,0.06)' : 'rgba(255,255,255,0.04)'),
      border: `1px solid ${isLight ? (renaming ? 'rgba(49,130,206,0.3)' : '#E5E7EB') : (renaming ? 'rgba(99,179,237,0.25)' : 'rgba(255,255,255,0.07)')}`,
      borderRadius: 10,
      padding: '10px 12px',
      marginBottom: 8,
      transition: 'border 0.15s',
    }} data-testid={`prog-card-${progression.id}`}>
      <div style={{ fontSize: 13, fontWeight: 700, color: isLight ? '#2B6CB0' : '#90CDF4', marginBottom: 3, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' as const }}
        data-testid={`prog-thumbnail-${progression.id}`}>{thumbnail}</div>
      {renaming ? (
        <div style={{ display: 'flex', gap: 4, marginBottom: 8 }}>
          <input
            style={{ background: isLight ? '#fff' : 'rgba(255,255,255,0.06)', border: `1px solid ${isLight ? '#93C5FD' : 'rgba(99,179,237,0.35)'}`, borderRadius: 5, color: isLight ? '#111827' : '#E2E8F0', fontSize: 12, padding: '3px 8px', outline: 'none', fontFamily: 'inherit', flex: 1, minWidth: 0 }}
            value={renameValue}
            onChange={e => setRenameValue(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') commitRename(); if (e.key === 'Escape') { setRenaming(false); setRenameValue(progression.name) } }}
            autoFocus
            data-testid={`rename-input-${progression.id}`}
          />
        </div>
      ) : (
        <div style={{ fontSize: 12, color: isLight ? '#4A5568' : '#A0AEC0', marginBottom: 8, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' as const }}
          data-testid={`prog-name-${progression.id}`}>{progression.name}</div>
      )}
      <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
        {!renaming && !confirmDelete && (<>
          <button style={actionBtn()} onClick={() => onLoad(progression.id)} data-testid={`load-btn-${progression.id}`}>Load</button>
          <button style={actionBtn()} onClick={() => { setRenaming(true); setRenameValue(progression.name) }} data-testid={`rename-btn-${progression.id}`}>Rename</button>
          <button style={actionBtn('danger')} onClick={() => setConfirmDelete(true)} data-testid={`delete-btn-${progression.id}`}>Delete</button>
        </>)}
        {renaming && (<>
          <button style={actionBtn('confirm')} onClick={commitRename} data-testid={`rename-confirm-${progression.id}`}>✓ Save</button>
          <button style={actionBtn()} onClick={() => { setRenaming(false); setRenameValue(progression.name) }} data-testid={`rename-cancel-${progression.id}`}>Cancel</button>
        </>)}
        {confirmDelete && (<>
          <span style={{ fontSize: 11, color: isLight ? '#C53030' : '#FC8181', marginRight: 4 }}>Delete?</span>
          <button style={actionBtn('danger')} onClick={() => onDelete(progression.id)} data-testid={`delete-confirm-${progression.id}`}>Yes</button>
          <button style={actionBtn()} onClick={() => setConfirmDelete(false)} data-testid={`delete-cancel-${progression.id}`}>No</button>
        </>)}
      </div>
    </div>
  )
}

export function ProgressionLibrary({ progressions, onLoad, onDelete, onRename, onSave, onClose, themeKey = 'light' }: ProgressionLibraryProps) {
  const [saveName, setSaveName] = useState('')
  const cardRef = useRef<HTMLDivElement>(null)
  const isLight = themeKey === 'light'

  useEffect(() => { cardRef.current?.focus() }, [])

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Escape') { e.preventDefault(); onClose() }
  }, [onClose])

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [handleKeyDown])

  const handleSave = () => { onSave(saveName); setSaveName('') }

  const bodyBg = isLight ? '#FFFFFF' : '#1A202C'
  const textMuted = isLight ? '#6B7280' : '#9CA3AF'
  const borderColor = isLight ? '#E5E7EB' : 'rgba(255,255,255,0.08)'

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999 }}
      onClick={e => { if (e.target === e.currentTarget) onClose() }}
      data-testid="progression-library">
      <div ref={cardRef} role="dialog" aria-modal="true" aria-label="Progression Library" tabIndex={-1}
        style={{ borderRadius: 18, overflow: 'hidden', width: 440, maxHeight: '80vh', display: 'flex', flexDirection: 'column', boxShadow: '0 24px 64px rgba(0,0,0,0.45)', fontFamily: "'DM Sans', 'Segoe UI', system-ui, sans-serif", outline: 'none', background: bodyBg }}>

        {/* Header */}
        <div style={{ background: '#111827', padding: '18px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
          <div>
            <div style={{ fontSize: 18, fontWeight: 700, color: '#F9FAFB', lineHeight: 1.2 }}>📚 Progression</div>
            <div style={{ fontSize: 18, fontWeight: 700, color: '#F9FAFB', lineHeight: 1.2 }}>Library</div>
          </div>
          <button onClick={onClose} style={{ background: '#F6A623', border: 'none', borderRadius: 5, color: '#000', cursor: 'pointer', fontSize: 14, fontWeight: 700, padding: '8px 20px' }}>Done</button>
        </div>

        {/* Save section */}
        <div style={{ padding: '16px 24px', borderBottom: `1px solid ${borderColor}`, flexShrink: 0, background: bodyBg }}>
          <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase' as const, color: textMuted, marginBottom: 8 }}>Save Current Progression</div>
          <div style={{ display: 'flex', gap: 8 }}>
            <input
              style={{ flex: 1, background: isLight ? '#F9FAFB' : 'rgba(255,255,255,0.05)', border: `1px solid ${isLight ? '#D1D5DB' : 'rgba(255,255,255,0.1)'}`, borderRadius: 5, color: isLight ? '#111827' : '#E2E8F0', fontSize: 13, padding: '8px 12px', outline: 'none', fontFamily: 'inherit', minWidth: 0 }}
              placeholder="Progression name…"
              value={saveName}
              onChange={e => setSaveName(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSave()}
              data-testid="save-name-input"
              aria-label="Progression name"
            />
            <button onClick={handleSave} data-testid="save-btn" aria-label="Save current progression"
              style={{ background: '#F6A623', border: '1px solid #F6A623', borderRadius: 5, color: '#000', cursor: 'pointer', fontSize: 13, fontWeight: 700, padding: '8px 18px', whiteSpace: 'nowrap' as const }}>
              Save
            </button>
          </div>
        </div>

        {/* List */}
        <div style={{ flex: 1, overflowY: 'auto' as const, padding: '16px 24px', scrollbarWidth: 'thin' as const, background: bodyBg }}>
          <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase' as const, color: textMuted, marginBottom: 10 }}>
            Saved ({progressions.length})
          </div>
          {progressions.length === 0 ? (
            <div style={{ textAlign: 'center' as const, color: textMuted, fontSize: 13, padding: '32px 16px', lineHeight: 1.6 }} data-testid="empty-state">
              No saved progressions yet.
            </div>
          ) : (
            progressions.map(p => (
              <ProgressionCard key={p.id} progression={p} onLoad={id => { onLoad(id); onClose() }} onDelete={onDelete} onRename={onRename} isLight={isLight} />
            ))
          )}
        </div>
      </div>
    </div>
  )
}

export default ProgressionLibrary