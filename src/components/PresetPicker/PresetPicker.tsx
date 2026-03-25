import { useState, useEffect, useRef, useCallback } from 'react'
import type { MouseEvent } from 'react'
import { PRESETS } from '../../constants/presets'
import type { Progression } from '../../types'
// ─── Types ────────────────────────────────────────────────────────────────────
export type PresetPickerProps = {
  onSelect: (preset: Progression) => void
  onClose: () => void
}
// ─── Styles ───────────────────────────────────────────────────────────────────
const S = {
  overlay: {
    position: 'fixed' as const,
    inset: 0,
    background: 'rgba(0,0,0,0.75)',
    backdropFilter: 'blur(5px)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 9999,
  },
  card: {
    background: 'linear-gradient(160deg, #1a2035 0%, #141928 100%)',
    border: '1px solid rgba(255,255,255,0.09)',
    borderRadius: 18,
    boxShadow: '0 28px 72px rgba(0,0,0,0.65), 0 1px 0 rgba(255,255,255,0.06) inset',
    width: 380,
    maxHeight: '80vh',
    display: 'flex',
    flexDirection: 'column' as const,
    fontFamily: "'DM Sans', 'Segoe UI', system-ui, sans-serif",
    outline: 'none',
    overflow: 'hidden',
  },
  header: {
    padding: '20px 20px 14px',
    borderBottom: '1px solid rgba(255,255,255,0.07)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexShrink: 0,
  },
  title: {
    fontSize: 11,
    fontWeight: 700,
    letterSpacing: '0.12em',
    textTransform: 'uppercase' as const,
    color: '#4A5568',
  },
  closeBtn: {
    background: 'none',
    border: 'none',
    color: '#4A5568',
    cursor: 'pointer',
    fontSize: 18,
    lineHeight: 1,
    padding: '2px 6px',
    borderRadius: 6,
    transition: 'color 0.15s',
  },
  list: {
    overflowY: 'auto' as const,
    flex: 1,
    padding: '8px 10px 12px',
    scrollbarWidth: 'thin' as const,
    scrollbarColor: 'rgba(255,255,255,0.1) transparent',
  },
  row: (hovered: boolean) => ({
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '10px 12px',
    borderRadius: 9,
    cursor: 'pointer',
    transition: 'background 0.1s',
    background: hovered ? 'rgba(255,255,255,0.07)' : 'transparent',
    marginBottom: 2,
  }),
  rowName: {
    fontSize: 14,
    fontWeight: 500,
    color: '#CBD5E0',
    letterSpacing: '-0.01em',
  },
  rowMeta: {
    fontSize: 11,
    color: '#4A5568',
  },
}
// ─── Component ────────────────────────────────────────────────────────────────
export function PresetPicker({ onSelect, onClose }: PresetPickerProps) {
  const cardRef = useRef<HTMLDivElement>(null)
  useEffect(() => {
    cardRef.current?.focus()
  }, [])
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      e.preventDefault()
      onClose()
    }
  }, [onClose])
  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [handleKeyDown])
  const handleOverlayClick = (e: MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) onClose()
  }
  const handleSelect = (preset: typeof PRESETS[0]) => {
    onSelect(preset)
    onClose()
  }
  return (
    <div
      style={S.overlay}
      onClick={handleOverlayClick}
      data-testid="preset-picker-overlay"
    >
      <div
        ref={cardRef}
        role="dialog"
        aria-modal="true"
        aria-label="Load Preset Progression"
        style={S.card}
        tabIndex={-1}
        data-testid="preset-picker-card"
      >
        {/* ── Header ── */}
        <div style={S.header}>
          <span style={S.title}>Load Preset Progression</span>
          <button
            style={S.closeBtn}
            onClick={onClose}
            aria-label="Close preset picker"
            data-testid="preset-picker-close"
          >
            ×
          </button>
        </div>
        {/* ── Preset list ── */}
        <div style={S.list} data-testid="preset-list">
          {PRESETS.map((preset, idx) => (
            <PresetRow
              key={preset.id}
              preset={preset}
              index={idx}
              onSelect={handleSelect}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
// ─── Row sub-component (handles its own hover state) ─────────────────────────
function PresetRow({
  preset,
  index,
  onSelect,
}: {
  preset: Progression
  index: number
  onSelect: (p: Progression) => void
}) {
  const [hovered, setHovered] = useState(false)
  return (
    <div
      style={S.row(hovered)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={() => onSelect(preset)}
      role="button"
      tabIndex={0}
      onKeyDown={e => e.key === 'Enter' && onSelect(preset)}
      aria-label={`Load ${preset.name}`}
      data-testid={`preset-row-${index}`}
    >
      <span style={S.rowName}>{preset.name}</span>
      <span style={S.rowMeta}>{preset.boxes.length} chords</span>
    </div>
  )
}
// ─── React import needed for useState in sub-component ───────────────────────
export default PresetPicker