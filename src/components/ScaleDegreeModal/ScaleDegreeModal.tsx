import { useEffect, useRef, useCallback } from 'react'
import { useSessionStore } from '../../store/sessionStore'
import type { ScaleDegree } from '../../types'

// ─── Types ───────────────────────────────────────────────────────────────────

export type ScaleDegreeModalProps = {
  onClose: () => void
  themeKey?: 'dark' | 'light'
}

// ─── Constants ────────────────────────────────────────────────────────────────

const DEGREE_META: Record<ScaleDegree, { color: string; label: string; name: string }> = {
  '1':  { color: '#E53E3E', label: 'R',  name: 'Root'        },
  'b3': { color: '#6B46C1', label: 'b3', name: 'Minor 3rd'   },
  '4':  { color: '#2F855A', label: '4',  name: 'Perfect 4th' },
  '5':  { color: '#C05621', label: '5',  name: 'Perfect 5th' },
  'b7': { color: '#B7791F', label: 'b7', name: 'Minor 7th'   },
  '2':  { color: '#718096', label: '2',  name: 'Major 2nd'   },
  'b5': { color: '#718096', label: 'b5', name: 'Flat 5th'    },
  '3':  { color: '#2B6CB0', label: '3',  name: 'Major 3rd'   },
  'b6': { color: '#718096', label: 'b6', name: 'Minor 6th'   },
  '6':  { color: '#718096', label: '6',  name: 'Major 6th'   },
  '7':  { color: '#718096', label: '7',  name: 'Major 7th'   },
}

// ─── Component ────────────────────────────────────────────────────────────────

export function ScaleDegreeModal({ onClose, themeKey = 'light' }: ScaleDegreeModalProps) {
  const boxes = useSessionStore(s => s.boxes)
  const { setGlobalDegree, setAllGlobalDegrees } = useSessionStore()
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

  // A degree is "on" if it's visible in ALL boxes that have it
  const isDegreeOn = (degree: ScaleDegree): boolean => {
    return boxes.every(b => b.scaleDegreeVisibility[degree])
  }

  const ALL_DEGREES = Object.keys(DEGREE_META) as ScaleDegree[]
  const allOn = ALL_DEGREES.every(isDegreeOn)

  // Theme tokens
  const bodyBg   = isLight ? '#FFFFFF' : '#1A202C'
  const sectionBg = isLight ? '#F7FAFC' : '#111827'
  const textPrimary = isLight ? '#111827' : '#F9FAFB'
  const textMuted   = isLight ? '#6B7280' : '#9CA3AF'
  const borderColor = isLight ? '#E5E7EB' : 'rgba(255,255,255,0.08)'

  const DegreeButton = ({ degree }: { degree: ScaleDegree }) => {
    const meta = DEGREE_META[degree]
    const on = isDegreeOn(degree)
    return (
      <button
        onClick={() => setGlobalDegree(degree, !on)}
        aria-label={`Toggle ${meta.name}`}
        aria-pressed={on}
        data-testid={`global-degree-${degree}`}
        title={meta.name}
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 4,
          background: on ? `${meta.color}18` : (isLight ? '#F3F4F6' : 'rgba(255,255,255,0.05)'),
          border: `2px solid ${on ? meta.color : 'transparent'}`,
          borderRadius: 10,
          padding: '10px 6px 8px',
          cursor: 'pointer',
          transition: 'all 0.12s',
          minWidth: 52,
        }}
      >
        {/* Dot */}
        <div style={{
          width: 34,
          height: 34,
          borderRadius: '50%',
          background: on ? meta.color : (isLight ? '#D1D5DB' : '#4A5568'),
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 12,
          fontWeight: 800,
          color: on ? '#fff' : (isLight ? '#6B7280' : '#9CA3AF'),
          transition: 'all 0.12s',
          boxShadow: on ? `0 2px 8px ${meta.color}55` : 'none',
        }}>
          {meta.label}
        </div>
        {/* Name */}
        <span style={{
          fontSize: 9,
          fontWeight: 600,
          color: on ? meta.color : textMuted,
          letterSpacing: '0.03em',
          textAlign: 'center',
          lineHeight: 1.2,
          maxWidth: 48,
        }}>
          {meta.name}
        </span>
      </button>
    )
  }

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
      onClick={e => { if (e.target === e.currentTarget) onClose() }}
      data-testid="scale-degree-modal-overlay"
    >
      <div
        ref={cardRef}
        role="dialog"
        aria-modal="true"
        aria-label="Scale Degree Controls"
        tabIndex={-1}
        data-testid="scale-degree-modal"
        style={{
          borderRadius: 18,
          overflow: 'hidden',
          width: 420,
          boxShadow: '0 24px 64px rgba(0,0,0,0.45)',
          fontFamily: "'DM Sans', 'Segoe UI', system-ui, sans-serif",
          outline: 'none',
          background: bodyBg,
        }}
      >
        {/* ── Dark header ───────────────────────────────────── */}
        <div style={{
          background: '#111827',
          padding: '18px 24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>
          <div>
            <div style={{ fontSize: 18, fontWeight: 700, color: '#F9FAFB', lineHeight: 1.2 }}>
              🎚 Scale Degree
            </div>
            <div style={{ fontSize: 18, fontWeight: 700, color: '#F9FAFB', lineHeight: 1.2 }}>
              Controls
            </div>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button
              onClick={() => setAllGlobalDegrees(true)}
              data-testid="global-all-on-btn"
              style={{
                background: 'rgba(255,255,255,0.1)',
                border: '1px solid rgba(255,255,255,0.2)',
                borderRadius: 8,
                color: '#F9FAFB',
                cursor: 'pointer',
                fontSize: 12,
                fontWeight: 600,
                padding: '7px 14px',
              }}
            >
              All On
            </button>
            <button
              onClick={() => setAllGlobalDegrees(false)}
              data-testid="global-all-off-btn"
              style={{
                background: 'rgba(255,255,255,0.06)',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: 8,
                color: '#9CA3AF',
                cursor: 'pointer',
                fontSize: 12,
                fontWeight: 600,
                padding: '7px 14px',
              }}
            >
              All Off
            </button>
          </div>
        </div>

        {/* ── Body ──────────────────────────────────────────── */}
        <div style={{ padding: '20px 24px 24px', background: bodyBg }}>

          {/* All degrees in order */}
          <div style={{
            fontSize: 10,
            fontWeight: 700,
            letterSpacing: '0.1em',
            textTransform: 'uppercase' as const,
            color: textMuted,
            marginBottom: 12,
          }}>
            Scale Degrees
          </div>
          <div style={{
            background: sectionBg,
            borderRadius: 12,
            border: `1px solid ${borderColor}`,
            padding: '14px 12px',
            display: 'flex',
            gap: 8,
            justifyContent: 'center',
            marginBottom: 16,
            flexWrap: 'wrap' as const,
          }}>
            {(['1', 'b2', '2', 'b3', '3', '4', 'b5', '5', 'b6', '6', 'b7', '7'] as ScaleDegree[])
              .filter(d => d in DEGREE_META)
              .map(d => <DegreeButton key={d} degree={d} />)}
          </div>

          {/* Note */}
          <p style={{
            fontSize: 11,
            color: textMuted,
            textAlign: 'center' as const,
            margin: 0,
            lineHeight: 1.5,
          }}>
            Changes apply to all chords simultaneously.
          </p>

          {/* Close */}
          <div style={{ display: 'flex', justifyContent: 'center', marginTop: 16 }}>
            <button
              onClick={onClose}
              data-testid="scale-degree-modal-close"
              style={{
                background: '#F6A623',
                border: 'none',
                borderRadius: 20,
                color: '#000',
                cursor: 'pointer',
                fontSize: 14,
                fontWeight: 700,
                padding: '10px 32px',
                boxShadow: '0 4px 14px #F6A62366',
              }}
            >
              Done
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ScaleDegreeModal