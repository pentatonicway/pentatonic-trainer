import { useMemo, useState } from 'react'
import { useTheme } from '../../styles/ThemeContext'
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
  box1BaseFret?: number
  startFret?: number
  onLockToggle: (id: string) => void
  onPrevShape: (id: string) => void
  onNextShape: (id: string) => void
  onResetShape: (id: string) => void
  onToggleDegree: (id: string, degree: ScaleDegree) => void
  onToggleAllDegrees: (id: string, visible: boolean) => void
  onChordSelect: (id: string, root: NoteRoot, quality: ChordQuality) => void
  adminMode?: boolean
  onLearn?: (id: string) => void
  compact?: boolean
}

// ─── Constants ────────────────────────────────────────────────────────────────

// Chord quality → circle color
const QUALITY_COLORS: Record<ChordQuality, string> = {
  major:     '#F6A623',   // gold
  minor:     '#29ABE2',   // blue
  dominant:  '#7B4FD4',   // purple
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function getQualityLabel(quality: ChordQuality): string {
  if (quality === 'major') return 'MAJ'
  if (quality === 'minor') return 'MIN'
  return 'DOM'
}

function getSuperscript(quality: ChordQuality): string {
  return quality === 'dominant' ? '7' : ''
}

// ─── Component ───────────────────────────────────────────────────────────────

export function ChordBox({
  box,
  boxIndex,
  box1BaseFret,
  startFret,
  onLockToggle,
  onPrevShape,
  onNextShape,
  onResetShape,
  onToggleDegree,
  onToggleAllDegrees,
  onChordSelect,
  adminMode = false,
  onLearn,
  compact = false,
}: ChordBoxProps) {
  const { themeKey, theme } = useTheme()
  const isBox1 = boxIndex === 0
  const [pickerOpen, setPickerOpen] = useState(false)
  const isLight = themeKey === 'light'

  const circleColor = QUALITY_COLORS[box.chordQuality]
  const qualityLabel = getQualityLabel(box.chordQuality)
  const superscript = getSuperscript(box.chordQuality)

  // Theme-aware styles
  const cardStyle = {
    background: isLight ? '#FFFFFF' : '#000000',
    border: `1px solid ${isLight ? '#E2E8F0' : 'rgba(255,255,255,0.07)'}`,
    borderRadius: compact ? 8 : 16,
    overflow: 'hidden' as const,
    boxShadow: isLight
      ? '0 2px 12px rgba(0,0,0,0.08)'
      : '0 4px 24px rgba(0,0,0,0.4)',
    fontFamily: "'DM Sans', 'Segoe UI', system-ui, sans-serif",
    width: '100%',
    userSelect: 'none' as const,
  }

  // Derive transposed shape for rendering
  const transposedShape = useMemo(() => {
    const baseShape = getBaseShapes(box.chordQuality)[box.shapeIndex]
    const shape = transposeShapeToRoot(baseShape, 'A', box.chordRoot)
    const target = box1BaseFret ?? 6

    const dotFrets = shape.strings.flatMap(s => s.dots.map(d => d.fret))
    const dotMid = Math.round((Math.min(...dotFrets) + Math.max(...dotFrets)) / 2)

    // Pick the octave shift (0, +12, -12) that brings dotMid closest to target
    const dists = [
      { shift: 0,   dist: Math.abs(dotMid - target) },
      { shift: 12,  dist: Math.abs(dotMid + 12 - target) },
      { shift: -12, dist: Math.abs(dotMid - 12 - target) },
    ]
    const shift = dists.reduce((a, b) => b.dist < a.dist ? b : a).shift

    if (shift === 0) return shape
    return {
      ...shape,
      baseFret: shape.baseFret + shift,
      strings: shape.strings.map(str => ({
        ...str,
        dots: str.dots.map(dot => ({ ...dot, fret: dot.fret + shift })),
      })),
    }
  }, [box.chordQuality, box.shapeIndex, box.chordRoot, box1BaseFret])

  // Called on every root/quality change — updates the chord without closing
  const handleChordSelect = (root: NoteRoot, quality: ChordQuality) => {
    onChordSelect(box.id, root, quality)
  }

  // Called only when the picker should close (quality click or outside click)
  const handlePickerClose = () => {
    setPickerOpen(false)
  }

  return (
    <div
      style={{ ...cardStyle, cursor: 'pointer' }}
      data-testid={`chord-box-${boxIndex}`}
      onClick={() => setPickerOpen(true)}
      onMouseEnter={e => (e.currentTarget.style.boxShadow = isLight ? '0 4px 20px rgba(0,0,0,0.15)' : '0 4px 32px rgba(0,0,0,0.6)')}
      onMouseLeave={e => (e.currentTarget.style.boxShadow = isLight ? '0 2px 12px rgba(0,0,0,0.08)' : '0 4px 24px rgba(0,0,0,0.4)')}
    >

      {/* ── Chord Circle Header ─────────────────────────────── */}
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        paddingTop: 20,
        paddingBottom: 8,
        position: 'relative',
      }}>
        {/* No lock button — cards 2+ always follow card 1's neck position */}

        {/* Chord circle */}
        <button
          data-testid="chord-name"
          aria-label={`Change chord: ${box.chordRoot} ${box.chordQuality}`}
          title="Click to change chord"
          style={{
            width: 90,
            height: 90,
            borderRadius: '50%',
            background: circleColor,
            border: 'none',
            cursor: 'pointer',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: `0 4px 16px ${circleColor}55`,
            transition: 'transform 0.12s, box-shadow 0.12s',
            padding: 0,
            pointerEvents: 'none',
          }}
        >
          <div style={{
            display: 'flex',
            alignItems: 'flex-start',
            lineHeight: 1,
          }}>
            <span style={{
              fontSize: 52,
              fontWeight: 900,
              color: box.chordQuality === 'major' ? '#000' : 'white',
              letterSpacing: '-0.02em',
              fontFamily: "'DM Sans', 'Segoe UI', system-ui, sans-serif",
            }}>
              {box.chordRoot[0]}
            </span>
            {box.chordRoot.length > 1 && (
              <span style={{
                fontSize: 28,
                fontWeight: 900,
                color: box.chordQuality === 'major' ? '#000' : 'white',
                marginTop: 6,
                letterSpacing: '-0.02em',
                fontFamily: "'DM Sans', 'Segoe UI', system-ui, sans-serif",
              }}>
                {box.chordRoot.slice(1)}
              </span>
            )}
            {superscript && (
              <span style={{
                fontSize: 22,
                fontWeight: 900,
                color: box.chordQuality === 'major' ? '#000' : 'white',
                marginTop: 4,
              }}>
                {superscript}
              </span>
            )}
          </div>
          <span style={{
            fontSize: 19,
            fontWeight: 900,
            color: box.chordQuality === 'major' ? 'rgba(0,0,0,0.75)' : 'rgba(255,255,255,0.85)',
            letterSpacing: '0.1em',
            marginTop: -4,
          }}>
            {qualityLabel}
          </span>
        </button>
      </div>

      {/* ── Fretboard ──────────────────────────────────────── */}
      <div style={{
        padding: compact ? '2px 2px 10px' : '4px 8px 16px',
        background: isLight ? '#FFFFFF' : 'rgba(0,0,0,0.2)',
      }}>
        <Fretboard
          startFret={startFret}
          themeKey={themeKey}
          shape={transposedShape}
          scaleDegreeVisibility={box.scaleDegreeVisibility}
          width={304}
          height={160}
          style={{ width: '100%', height: 'auto', display: 'block' }}
        />
      </div>

      {/* ── ChordPicker portal ─────────────────────────────── */}
      {pickerOpen && createPortal(
        <ChordPicker
          currentRoot={box.chordRoot}
          currentQuality={box.chordQuality}
          onSelect={handleChordSelect}
          onClose={handlePickerClose}
        />,
        document.body,
      )}
    </div>
  )
}

export default ChordBox