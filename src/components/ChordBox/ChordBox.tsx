import { useMemo, useState } from 'react'
import { createPortal } from 'react-dom'
import type { BoxData, NoteRoot, ChordQuality, ScaleDegree } from '../../types'
import { Fretboard } from '../Fretboard/Fretboard'
import { ChordPicker } from '../ChordPicker/ChordPicker'
import { getBaseShapes } from '../../constants/shapes'
import { transposeShapeToRoot } from '../../utils/transpose'

// ─── Types ───────────────────────────────────────────────────────────────────

export type ChordBoxProps = {
  box: BoxData
  boxIndex: number
  onLockToggle: (id: string) => void
  onPrevShape: (id: string) => void
  onNextShape: (id: string) => void
  onResetShape: (id: string) => void
  onToggleDegree: (id: string, degree: ScaleDegree) => void
  onToggleAllDegrees: (id: string, visible: boolean) => void
  onChordSelect: (id: string, root: NoteRoot, quality: ChordQuality) => void
  adminMode?: boolean
  onLearn?: (id: string) => void
}

// ─── Constants ────────────────────────────────────────────────────────────────

const ALL_DEGREES: ScaleDegree[] = ['1', '2', 'b3', '3', '4', 'b5', '5', 'b6', '6', 'b7', '7']

const DEGREE_COLORS: Record<ScaleDegree, string> = {
  '1':  '#E53E3E',
  'b3': '#6B46C1',
  '3':  '#2B6CB0',
  '4':  '#2F855A',
  '5':  '#C05621',
  'b7': '#B7791F',
  '2':  '#4A5568',
  '6':  '#4A5568',
  'b5': '#4A5568',
  '7':  '#4A5568',
  'b6': '#4A5568',
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1)
}

/** Returns the set of scale degrees actually present in a shape. */
function getShapeDegrees(shape: ReturnType<typeof getBaseShapes>[0]): ScaleDegree[] {
  const seen = new Set<ScaleDegree>()
  for (const str of shape.strings) {
    for (const dot of str.dots) {
      seen.add(dot.degree)
    }
  }
  return ALL_DEGREES.filter(d => seen.has(d))
}

// ─── Styles (inline, no external CSS dependency) ─────────────────────────────

const styles = {
  card: {
    background: 'linear-gradient(160deg, #1a1f2e 0%, #161b27 100%)',
    border: '1px solid rgba(255,255,255,0.07)',
    borderRadius: 14,
    overflow: 'hidden',
    boxShadow: '0 4px 24px rgba(0,0,0,0.4), 0 1px 0 rgba(255,255,255,0.05) inset',
    fontFamily: "'DM Sans', 'Segoe UI', system-ui, sans-serif",
    width: 320,
    userSelect: 'none' as const,
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '12px 14px 10px',
    borderBottom: '1px solid rgba(255,255,255,0.06)',
  },
  headerLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
  },
  badge: {
    fontSize: 10,
    fontWeight: 700,
    letterSpacing: '0.08em',
    textTransform: 'uppercase' as const,
    color: '#4A5568',
    background: 'rgba(255,255,255,0.05)',
    borderRadius: 4,
    padding: '2px 6px',
  },
  chordNameBtn: {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    padding: '2px 6px',
    borderRadius: 6,
    fontSize: 15,
    fontWeight: 600,
    color: '#E2E8F0',
    letterSpacing: '-0.01em',
    transition: 'background 0.15s',
  },
  lockBtn: {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    fontSize: 15,
    padding: '3px 5px',
    borderRadius: 6,
    color: '#718096',
    transition: 'background 0.15s, color 0.15s',
    display: 'flex',
    alignItems: 'center',
  },
  fretboardWrap: {
    padding: '8px 8px 4px',
    background: 'rgba(0,0,0,0.2)',
  },
  controlsRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    padding: '8px 14px',
  },
  iconBtn: (disabled: boolean) => ({
    background: disabled ? 'rgba(255,255,255,0.03)' : 'rgba(255,255,255,0.07)',
    border: `1px solid ${disabled ? 'rgba(255,255,255,0.04)' : 'rgba(255,255,255,0.12)'}`,
    borderRadius: 7,
    color: disabled ? '#2D3748' : '#A0AEC0',
    cursor: disabled ? 'not-allowed' : 'pointer',
    fontSize: 12,
    fontWeight: 600,
    padding: '5px 10px',
    transition: 'all 0.12s',
    opacity: disabled ? 0.5 : 1,
  }),
  resetBtn: (disabled: boolean) => ({
    background: 'none',
    border: `1px solid ${disabled ? 'rgba(255,255,255,0.04)' : 'rgba(255,255,255,0.1)'}`,
    borderRadius: 7,
    color: disabled ? '#2D3748' : '#718096',
    cursor: disabled ? 'not-allowed' : 'pointer',
    fontSize: 11,
    fontWeight: 500,
    padding: '5px 9px',
    marginLeft: 'auto',
    transition: 'all 0.12s',
    opacity: disabled ? 0.4 : 1,
    letterSpacing: '0.02em',
  }),
  degreesRow: {
    display: 'flex',
    flexWrap: 'wrap' as const,
    gap: 4,
    padding: '6px 14px 14px',
  },
  degreeBtn: (active: boolean, degree: ScaleDegree) => ({
    background: active
      ? `${DEGREE_COLORS[degree]}22`
      : 'rgba(255,255,255,0.04)',
    border: `1px solid ${active ? DEGREE_COLORS[degree] : 'rgba(255,255,255,0.07)'}`,
    borderRadius: 5,
    color: active ? DEGREE_COLORS[degree] : '#4A5568',
    cursor: 'pointer',
    fontSize: 10,
    fontWeight: active ? 700 : 400,
    padding: '3px 7px',
    transition: 'all 0.12s',
    letterSpacing: '0.02em',
  }),
  learnBtn: {
    background: 'rgba(159,122,234,0.15)',
    border: '1px solid rgba(159,122,234,0.4)',
    borderRadius: 6,
    color: '#B794F4',
    cursor: 'pointer',
    fontSize: 10,
    fontWeight: 700,
    padding: '3px 9px',
    letterSpacing: '0.06em',
    textTransform: 'uppercase' as const,
    transition: 'all 0.12s',
  },
  allBtn: (anyVisible: boolean) => ({
    background: anyVisible ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.03)',
    border: `1px solid ${anyVisible ? 'rgba(255,255,255,0.15)' : 'rgba(255,255,255,0.06)'}`,
    borderRadius: 5,
    color: anyVisible ? '#CBD5E0' : '#4A5568',
    cursor: 'pointer',
    fontSize: 10,
    fontWeight: 600,
    padding: '3px 8px',
    transition: 'all 0.12s',
    letterSpacing: '0.04em',
  }),
}

// ─── Component ───────────────────────────────────────────────────────────────

export function ChordBox({
  box,
  boxIndex,
  onLockToggle,
  onPrevShape,
  onNextShape,
  onResetShape,
  onToggleDegree,
  onToggleAllDegrees,
  onChordSelect,
  adminMode = false,
  onLearn,
}: ChordBoxProps) {
  const isBox1 = boxIndex === 0
  const disabled = box.locked
  const [pickerOpen, setPickerOpen] = useState(false)

  // Derive transposed shape for rendering
  const transposedShape = useMemo(() => {
    const baseShape = getBaseShapes(box.chordQuality)[box.shapeIndex]
    return transposeShapeToRoot(baseShape, 'A', box.chordRoot)
  }, [box.chordQuality, box.shapeIndex, box.chordRoot])

  // Get degrees present in this shape
  const baseShape = getBaseShapes(box.chordQuality)[box.shapeIndex]
  const shapeDegrees = getShapeDegrees(baseShape)

  const anyVisible = shapeDegrees.some(d => box.scaleDegreeVisibility[d])
  const chordName = `${box.chordRoot} ${capitalize(box.chordQuality)}`

  const handleChordConfirm = (root: NoteRoot, quality: ChordQuality) => {
    onChordSelect(box.id, root, quality)
    setPickerOpen(false)
  }

  return (
    <div style={styles.card} data-testid={`chord-box-${boxIndex}`}>
      {/* ── Header ─────────────────────────────────────────── */}
      <div style={styles.header}>
        <div style={styles.headerLeft}>
          <span style={styles.badge} aria-label={`Box ${boxIndex + 1}`}>
            {isBox1 ? '🎸 Box 1' : `Box ${boxIndex + 1}`}
          </span>
          <button
            style={styles.chordNameBtn}
            onClick={() => setPickerOpen(true)}
            data-testid="chord-name"
            aria-label={`Change chord: ${chordName}`}
            title="Click to change chord"
          >
            {chordName}
          </button>
        </div>

        {/* Lock button — hidden for Box 1 */}
        {!isBox1 && (
          <button
            style={styles.lockBtn}
            onClick={() => onLockToggle(box.id)}
            aria-label={box.locked ? 'Unlock box' : 'Lock box'}
            data-testid="lock-btn"
            title={box.locked ? 'Unlock' : 'Lock'}
          >
            {box.locked ? '🔒' : '🔓'}
          </button>
        )}
      </div>

      {/* ── Fretboard ──────────────────────────────────────── */}
      <div style={styles.fretboardWrap}>
        <Fretboard
          shape={transposedShape}
          scaleDegreeVisibility={box.scaleDegreeVisibility}
          width={304}
          height={160}
        />
      </div>

      {/* ── Shape controls ─────────────────────────────────── */}
      <div style={styles.controlsRow}>
        <button
          style={styles.iconBtn(disabled)}
          disabled={disabled}
          onClick={() => !disabled && onPrevShape(box.id)}
          aria-label="Previous shape"
          data-testid="prev-btn"
        >
          ◀
        </button>
        <button
          style={styles.iconBtn(disabled)}
          disabled={disabled}
          onClick={() => !disabled && onNextShape(box.id)}
          aria-label="Next shape"
          data-testid="next-btn"
        >
          ▶
        </button>
        <button
          style={styles.resetBtn(disabled)}
          disabled={disabled}
          onClick={() => !disabled && onResetShape(box.id)}
          aria-label="Reset shape"
          data-testid="reset-btn"
        >
          Reset
        </button>
        {adminMode && !box.locked && boxIndex > 0 && onLearn && (
          <button
            style={styles.learnBtn}
            onClick={() => onLearn(box.id)}
            aria-label="Learn this shape override"
            data-testid="learn-btn"
          >
            Learn
          </button>
        )}
      </div>

      {/* ── Degree toggles ─────────────────────────────────── */}
      <div style={styles.degreesRow} data-testid="degrees-row">
        <button
          style={styles.allBtn(anyVisible)}
          onClick={() => onToggleAllDegrees(box.id, !anyVisible)}
          aria-label="Toggle all degrees"
          data-testid="all-degrees-btn"
        >
          All
        </button>

        {shapeDegrees.map(degree => {
          const active = box.scaleDegreeVisibility[degree]
          return (
            <button
              key={degree}
              style={styles.degreeBtn(active, degree)}
              onClick={() => onToggleDegree(box.id, degree)}
              aria-label={`Toggle degree ${degree}`}
              aria-pressed={active}
              data-testid={`degree-btn-${degree}`}
            >
              {degree}
            </button>
          )
        })}
      </div>

      {/* ── ChordPicker portal ─────────────────────────────── */}
      {pickerOpen && createPortal(
        <ChordPicker
          currentRoot={box.chordRoot}
          currentQuality={box.chordQuality}
          onSelect={handleChordConfirm}
          onClose={() => setPickerOpen(false)}
        />,
        document.body,
      )}
    </div>
  )
}

export default ChordBox
