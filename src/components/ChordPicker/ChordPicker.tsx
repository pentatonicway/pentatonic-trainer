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

// Display notes using flats where conventional (matching the mockup)
const NOTE_DISPLAY: { root: NoteRoot; label: string }[] = [
  { root: 'C',  label: 'C'  },
  { root: 'C#', label: 'C#' },
  { root: 'D',  label: 'D'  },
  { root: 'D#', label: 'Eb' },
  { root: 'E',  label: 'E'  },
  { root: 'F',  label: 'F'  },
  { root: 'F#', label: 'F#' },
  { root: 'G',  label: 'G'  },
  { root: 'G#', label: 'Ab' },
  { root: 'A',  label: 'A'  },
  { root: 'A#', label: 'Bb' },
  { root: 'B',  label: 'B'  },
]

const QUALITY_OPTIONS: { value: ChordQuality; label: string }[] = [
  { value: 'major',    label: 'Maj' },
  { value: 'minor',    label: 'Min' },
  { value: 'dominant', label: 'Dom' },
]

const QUALITY_COLORS: Record<ChordQuality, string> = {
  major:    '#F6A623',
  minor:    '#29ABE2',
  dominant: '#7B4FD4',
}

// ─── Component ────────────────────────────────────────────────────────────────

export function ChordPicker({ currentRoot, currentQuality, onSelect, onClose }: ChordPickerProps) {
  const [root, setRoot] = useState<NoteRoot>(currentRoot)
  const [quality, setQuality] = useState<ChordQuality>(currentQuality)
  const cardRef = useRef<HTMLDivElement>(null)

  useEffect(() => { cardRef.current?.focus() }, [])

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Escape') { e.preventDefault(); onClose() }
    if (e.key === 'Tab' && cardRef.current) {
      const focusable = cardRef.current.querySelectorAll<HTMLElement>(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      )
      const first = focusable[0]
      const last = focusable[focusable.length - 1]
      if (e.shiftKey) {
        if (document.activeElement === first) { e.preventDefault(); last?.focus() }
      } else {
        if (document.activeElement === last) { e.preventDefault(); first?.focus() }
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

  const activeQualityColor = QUALITY_COLORS[quality]

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.55)',
        backdropFilter: 'blur(4px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9999,
      }}
      onClick={handleOverlayClick}
      data-testid="chord-picker-overlay"
    >
      <div
        ref={cardRef}
        role="dialog"
        aria-modal="true"
        aria-label="Choose Key & Type"
        tabIndex={-1}
        data-testid="chord-picker-card"
        style={{
          borderRadius: 18,
          overflow: 'hidden',
          width: 360,
          boxShadow: '0 24px 64px rgba(0,0,0,0.5)',
          fontFamily: "'DM Sans', 'Segoe UI', system-ui, sans-serif",
          outline: 'none',
        }}
      >
        {/* ── Dark header ─────────────────────────────────── */}
        <div style={{
          background: '#111827',
          padding: '20px 24px 18px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>
          <div>
            <div style={{
              fontSize: 18,
              fontWeight: 700,
              color: '#F9FAFB',
              lineHeight: 1.2,
            }}>
              Choose
            </div>
            <div style={{
              fontSize: 18,
              fontWeight: 700,
              color: '#F9FAFB',
              lineHeight: 1.2,
            }}>
              Key & Type
            </div>
          </div>
          <button
            onClick={handleConfirm}
            data-testid="confirm-btn"
            style={{
              background: activeQualityColor,
              border: 'none',
              borderRadius: 20,
              color: '#fff',
              cursor: 'pointer',
              fontSize: 14,
              fontWeight: 700,
              padding: '10px 22px',
              transition: 'all 0.15s',
              boxShadow: `0 4px 14px ${activeQualityColor}66`,
            }}
          >
            Done
          </button>
        </div>

        {/* ── White body ──────────────────────────────────── */}
        <div style={{
          background: '#FFFFFF',
          padding: '20px 24px 24px',
        }}>

          {/* ── Key grid ──────────────────────────────────── */}
          <div style={{
            fontSize: 11,
            fontWeight: 700,
            letterSpacing: '0.1em',
            textTransform: 'uppercase' as const,
            color: '#9CA3AF',
            marginBottom: 10,
          }}>
            Key
          </div>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: 8,
            marginBottom: 20,
          }} role="group" aria-label="Root note">
            {NOTE_DISPLAY.map(({ root: noteRoot, label }) => {
              const isActive = root === noteRoot
              return (
                <button
                  key={noteRoot}
                  onClick={() => setRoot(noteRoot)}
                  aria-label={`Root ${label}`}
                  aria-pressed={isActive}
                  data-testid={`root-btn-${noteRoot}`}
                  style={{
                    background: isActive ? activeQualityColor : '#F3F4F6',
                    border: `2px solid ${isActive ? activeQualityColor : 'transparent'}`,
                    borderRadius: 10,
                    color: isActive ? '#fff' : '#374151',
                    cursor: 'pointer',
                    fontSize: 14,
                    fontWeight: isActive ? 700 : 500,
                    padding: '10px 6px',
                    textAlign: 'center' as const,
                    transition: 'all 0.12s',
                    boxShadow: isActive ? `0 2px 10px ${activeQualityColor}55` : 'none',
                  }}
                >
                  {label}
                </button>
              )
            })}
          </div>

          {/* ── Tonality row ────────────────────────────────── */}
          <div style={{
            fontSize: 11,
            fontWeight: 700,
            letterSpacing: '0.1em',
            textTransform: 'uppercase' as const,
            color: '#9CA3AF',
            marginBottom: 10,
          }}>
            Tonality
          </div>
          <div style={{
            display: 'flex',
            gap: 8,
          }} role="group" aria-label="Chord quality">
            {QUALITY_OPTIONS.map(({ value, label }) => {
              const isActive = quality === value
              const color = QUALITY_COLORS[value]
              return (
                <button
                  key={value}
                  onClick={() => setQuality(value)}
                  aria-label={label}
                  aria-pressed={isActive}
                  data-testid={`quality-btn-${value}`}
                  style={{
                    flex: 1,
                    background: isActive ? color : '#F3F4F6',
                    border: `2px solid ${isActive ? color : 'transparent'}`,
                    borderRadius: 10,
                    color: isActive ? '#fff' : '#374151',
                    cursor: 'pointer',
                    fontSize: 14,
                    fontWeight: isActive ? 700 : 500,
                    padding: '11px 8px',
                    textAlign: 'center' as const,
                    transition: 'all 0.12s',
                    boxShadow: isActive ? `0 2px 10px ${color}55` : 'none',
                  }}
                >
                  {label}
                </button>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}

export default ChordPicker