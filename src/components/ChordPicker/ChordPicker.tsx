import { useState, useEffect, useRef, useCallback } from 'react'
import type { NoteRoot, ChordQuality } from '../../types'

// ─── Types ───────────────────────────────────────────────────────────────────

export type ChordPickerProps = {
  currentRoot: NoteRoot
  currentQuality: ChordQuality
  onSelect: (root: NoteRoot, quality: ChordQuality) => void
  onClose: () => void
}

// ─── Constants ────────────────────────────────────────────────────────────────

const SHARP_ROOTS: NoteRoot[] = ['A', 'A#', 'B', 'C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#']
const QUALITIES: ChordQuality[] = ['major', 'minor', 'dominant']
const QUALITY_LABELS: Record<ChordQuality, string> = {
  major: 'Major',
  minor: 'Minor',
  dominant: 'Dominant',
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const S = {
  overlay: {
    position: 'fixed' as const,
    inset: 0,
    background: 'rgba(0, 0, 0, 0.72)',
    backdropFilter: 'blur(4px)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 9999,
  },
  card: {
    background: 'linear-gradient(160deg, #1e2436 0%, #171d2e 100%)',
    border: '1px solid rgba(255,255,255,0.09)',
    borderRadius: 18,
    padding: '28px 28px 24px',
    boxShadow: '0 24px 64px rgba(0,0,0,0.6), 0 1px 0 rgba(255,255,255,0.06) inset',
    width: 340,
    fontFamily: "'DM Sans', 'Segoe UI', system-ui, sans-serif",
    outline: 'none',
  },
  title: {
    fontSize: 11,
    fontWeight: 700,
    letterSpacing: '0.12em',
    textTransform: 'uppercase' as const,
    color: '#4A5568',
    marginBottom: 20,
  },
  sectionLabel: {
    fontSize: 10,
    fontWeight: 600,
    letterSpacing: '0.1em',
    textTransform: 'uppercase' as const,
    color: '#4A5568',
    marginBottom: 8,
  },
  rootGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(6, 1fr)',
    gap: 6,
    marginBottom: 20,
  },
  rootBtn: (active: boolean) => ({
    background: active
      ? 'linear-gradient(135deg, #E53E3E 0%, #C53030 100%)'
      : 'rgba(255,255,255,0.05)',
    border: `1px solid ${active ? '#E53E3E' : 'rgba(255,255,255,0.08)'}`,
    borderRadius: 8,
    color: active ? '#fff' : '#A0AEC0',
    cursor: 'pointer',
    fontSize: 13,
    fontWeight: active ? 700 : 500,
    padding: '8px 4px',
    textAlign: 'center' as const,
    transition: 'all 0.12s',
    boxShadow: active ? '0 2px 12px rgba(229,62,62,0.4)' : 'none',
  }),
  qualityRow: {
    display: 'flex',
    gap: 8,
    marginBottom: 24,
  },
  qualityBtn: (active: boolean) => ({
    flex: 1,
    background: active
      ? 'linear-gradient(135deg, #2B4C7E 0%, #1a3358 100%)'
      : 'rgba(255,255,255,0.05)',
    border: `1px solid ${active ? '#4A7FBF' : 'rgba(255,255,255,0.08)'}`,
    borderRadius: 9,
    color: active ? '#90CDF4' : '#718096',
    cursor: 'pointer',
    fontSize: 13,
    fontWeight: active ? 600 : 400,
    padding: '9px 6px',
    textAlign: 'center' as const,
    transition: 'all 0.12s',
    boxShadow: active ? '0 2px 12px rgba(43,76,126,0.5)' : 'none',
  }),
  footer: {
    display: 'flex',
    gap: 10,
    justifyContent: 'flex-end',
  },
  cancelBtn: {
    background: 'none',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: 9,
    color: '#718096',
    cursor: 'pointer',
    fontSize: 13,
    fontWeight: 500,
    padding: '9px 18px',
    transition: 'all 0.12s',
  },
  confirmBtn: {
    background: 'linear-gradient(135deg, #276749 0%, #1e5038 100%)',
    border: '1px solid #38A169',
    borderRadius: 9,
    color: '#9AE6B4',
    cursor: 'pointer',
    fontSize: 13,
    fontWeight: 600,
    padding: '9px 22px',
    transition: 'all 0.12s',
    boxShadow: '0 2px 12px rgba(39,103,73,0.4)',
  },
}

// ─── Component ────────────────────────────────────────────────────────────────

export function ChordPicker({ currentRoot, currentQuality, onSelect, onClose }: ChordPickerProps) {
  const [root, setRoot] = useState<NoteRoot>(currentRoot)
  const [quality, setQuality] = useState<ChordQuality>(currentQuality)
  const cardRef = useRef<HTMLDivElement>(null)

  // Focus the dialog on mount for accessibility
  useEffect(() => {
    cardRef.current?.focus()
  }, [])

  // Escape key closes
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      e.preventDefault()
      onClose()
    }
    // Focus trap: keep Tab within the modal
    if (e.key === 'Tab' && cardRef.current) {
      const focusable = cardRef.current.querySelectorAll<HTMLElement>(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      )
      const first = focusable[0]
      const last = focusable[focusable.length - 1]
      if (e.shiftKey) {
        if (document.activeElement === first) {
          e.preventDefault()
          last?.focus()
        }
      } else {
        if (document.activeElement === last) {
          e.preventDefault()
          first?.focus()
        }
      }
    }
  }, [onClose])

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [handleKeyDown])

  const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) onClose()
  }

  const handleConfirm = () => {
    onSelect(root, quality)
    onClose()
  }

  return (
    <div
      style={S.overlay}
      onClick={handleOverlayClick}
      data-testid="chord-picker-overlay"
    >
      <div
        ref={cardRef}
        role="dialog"
        aria-modal="true"
        aria-label="Select Chord"
        style={S.card}
        tabIndex={-1}
        data-testid="chord-picker-card"
      >
        <div style={S.title}>Select Chord</div>

        {/* ── Root selector ── */}
        <div style={S.sectionLabel}>Root</div>
        <div style={S.rootGrid} role="group" aria-label="Root note">
          {SHARP_ROOTS.map(note => (
            <button
              key={note}
              style={S.rootBtn(root === note)}
              onClick={() => setRoot(note)}
              aria-label={`Root ${note}`}
              aria-pressed={root === note}
              data-testid={`root-btn-${note}`}
            >
              {note}
            </button>
          ))}
        </div>

        {/* ── Quality selector ── */}
        <div style={S.sectionLabel}>Quality</div>
        <div style={S.qualityRow} role="group" aria-label="Chord quality">
          {QUALITIES.map(q => (
            <button
              key={q}
              style={S.qualityBtn(quality === q)}
              onClick={() => setQuality(q)}
              aria-label={QUALITY_LABELS[q]}
              aria-pressed={quality === q}
              data-testid={`quality-btn-${q}`}
            >
              {QUALITY_LABELS[q]}
            </button>
          ))}
        </div>

        {/* ── Footer ── */}
        <div style={S.footer}>
          <button
            style={S.cancelBtn}
            onClick={onClose}
            data-testid="cancel-btn"
          >
            Cancel
          </button>
          <button
            style={S.confirmBtn}
            onClick={handleConfirm}
            data-testid="confirm-btn"
          >
            Confirm
          </button>
        </div>
      </div>
    </div>
  )
}

export default ChordPicker
