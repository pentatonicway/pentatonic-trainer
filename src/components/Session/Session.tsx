import { useState, useRef, useEffect, useCallback, useMemo } from 'react'
import { createPortal } from 'react-dom'
import { useSessionStore } from '../../store/sessionStore'
import { ChordBox } from '../ChordBox/ChordBox'
import { Toolbar } from '../Toolbar/Toolbar'
import { PresetPicker } from '../PresetPicker/PresetPicker'
import { ProgressionLibrary } from '../ProgressionLibrary/ProgressionLibrary'
import { ScaleDegreeModal } from '../ScaleDegreeModal/ScaleDegreeModal'
import { AdminPanel } from '../AdminPanel/AdminPanel'
import type { NoteRoot, ChordQuality, ScaleDegree, Progression } from '../../types'
import { useTheme } from '../../styles/ThemeContext'
import { getBaseShapes } from '../../constants/shapes'
import { transposeShape, getIntervalSigned } from '../../utils/transpose'

const S = {
  root: (bg: string) => ({
    display: 'flex',
    flexDirection: 'column' as const,
    height: '100%',
    fontFamily: "'DM Sans', 'Segoe UI', system-ui, sans-serif",
    overflow: 'hidden',
    background: bg,
  }),
  body: {
    display: 'flex',
    flex: 1,
    overflow: 'hidden',
  },
  scrollArea: {
    display: 'grid',
    overflowY: 'auto' as const,
    flex: 1,
    alignContent: 'start',
    scrollbarWidth: 'thin' as const,
    scrollbarColor: 'rgba(255,255,255,0.12) transparent',
  },
  boxWrapper: {
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    gap: 6,
    minWidth: 0,
  },
  removeBtn: {
    background: 'rgba(229,62,62,0.1)',
    border: '1px solid rgba(229,62,62,0.25)',
    borderRadius: 6,
    color: '#FC8181',
    cursor: 'pointer',
    fontSize: 11,
    fontWeight: 600,
    padding: '3px 10px',
    letterSpacing: '0.04em',
    transition: 'all 0.12s',
    width: '100%',
  },
  addBtn: {
    alignSelf: 'center',
    background: 'rgba(255,255,255,0.05)',
    border: '2px dashed rgba(255,255,255,0.15)',
    borderRadius: 14,
    color: '#718096',
    cursor: 'pointer',
    fontSize: 28,
    fontWeight: 300,
    width: 64,
    height: 64,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'all 0.15s',
    flexShrink: 0,
  },
}

// ScaledCard — scales card contents down when space is tight.
// The outer div fills the 1fr grid column; the inner div is scaled from top-left.
function ScaledCard({ scale, index, children }: { scale: number; index: number; children: React.ReactNode }) {
  const innerRef = useRef<HTMLDivElement>(null)
  const [naturalHeight, setNaturalHeight] = useState<number | null>(null)

  useEffect(() => {
    const el = innerRef.current
    if (!el) return
    const obs = new ResizeObserver(() => {
      // measure the unscaled height
      setNaturalHeight(el.scrollHeight)
    })
    obs.observe(el)
    return () => obs.disconnect()
  }, [scale])

  return (
    <div
      data-testid={`box-wrapper-${index}`}
      style={{
        // Always fill the 1fr column
        width: '100%',
        overflow: 'hidden',
        // Collapse vertical space to match scaled height
        height: naturalHeight != null ? naturalHeight * scale : undefined,
      }}
    >
      <div
        ref={innerRef}
        style={{
          transform: scale < 1 ? `scale(${scale})` : undefined,
          transformOrigin: 'top left',
          // When scaling, the inner div must be wider (1/scale * 100%) so that
          // after transform it fills the column. We clip it with overflow:hidden above.
          width: scale < 1 ? `${100 / scale}%` : '100%',
        }}
      >
        {children}
      </div>
    </div>
  )
}

export function Session() {
  const { theme, themeKey, toggleTheme } = useTheme()
  const boxes = useSessionStore(s => s.boxes)
  const transposeOffset = useSessionStore(s => s.transposeOffset)
  const savedProgressions = useSessionStore(s => s.savedProgressions)
  const adminMode = useSessionStore(s => s.adminMode)
  const overrides = useSessionStore(s => s.overrides)
  const {
    addBox, removeBox, setLocked, setAllLocked,
    decrementShape, incrementShape, resetShape,
    toggleScaleDegree, setAllScaleDegrees,
    setChordRoot, setChordQuality, selectChord,
    loadPreset, transposeUp, transposeDown,
    learnShape, removeOverride, clearOverrides,
    saveCurrentProgression, deleteProgression,
    renameProgression, loadSavedProgression,
  } = useSessionStore()

  const [presetsOpen, setPresetsOpen] = useState(false)
  const [libraryOpen, setLibraryOpen] = useState(false)
  const [cardCount, setCardCount] = useState(() => boxes.length)
  const [scaleDegreeModalOpen, setScaleDegreeModalOpen] = useState(false)

  // Responsive scaling — measure the scroll area and shrink cards to fit 4 across
  const scrollAreaRef = useRef<HTMLDivElement>(null)
  const [cardScale, setCardScale] = useState(1)
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 480)
  const CARD_WIDTH = 320
  const MOBILE_BREAKPOINT = 480

  const recalcScale = useCallback(() => {
    const el = scrollAreaRef.current
    if (!el) return
    const w = el.getBoundingClientRect().width
    const mobile = window.innerWidth <= MOBILE_BREAKPOINT
    setIsMobile(mobile)
    const gap = mobile ? 4 : 16
    const padding = mobile ? 8 : 32
    const available = w - padding
    const natural = CARD_WIDTH * 4 + gap * 3
    setCardScale(Math.min(1, available / natural))
  }, [])

  useEffect(() => {
    const el = scrollAreaRef.current
    if (!el) return
    // Fire immediately on mount
    recalcScale()
    const obs = new ResizeObserver(recalcScale)
    obs.observe(el)
    return () => obs.disconnect()
  }, [recalcScale])

  // Neck position = box 1's current shapeIndex (1-based for display)
  const neckPosition = (boxes[0]?.shapeIndex ?? 0) + 1

  const handleNeckUp = () => {
    incrementShape(boxes[0].id)
  }
  const handleNeckDown = () => {
    decrementShape(boxes[0].id)
  }

  // Sync card count with actual box count
  const handleSetCardCount = (n: number) => {
    setCardCount(n)
    const current = boxes.length
    if (n > current) {
      for (let i = 0; i < n - current; i++) addBox()
    } else if (n < current) {
      // Remove from the end
      const toRemove = boxes.slice(n)
      toRemove.forEach(b => removeBox(b.id))
    }
  }

  const handleLockToggle = (id: string) => {
    const box = boxes.find(b => b.id === id)
    if (box) setLocked(id, !box.locked)
  }

  const handleChordSelect = (id: string, root: NoteRoot, quality: ChordQuality) => {
    selectChord(id, root, quality)
  }

  const handlePresetSelect = (preset: Progression) => {
    loadPreset(preset)
    setPresetsOpen(false)
  }

  // Compute shared fret window start from Box 1's shape position
  const b1Start = (() => {
    const b1 = boxes[0]
    const b1Shape = getBaseShapes(b1.chordQuality)[b1.shapeIndex]
    const b1Transposed = transposeShape(b1Shape, getIntervalSigned('A', b1.chordRoot))
    const b1Frets = b1Transposed.strings.flatMap(s => s.dots.map(d => d.fret)).sort((a, b) => a - b)
    const b1Min = b1Frets[0]
    const b1Max = b1Frets[b1Frets.length - 1]
    const b1Center = Math.round((b1Min + b1Max) / 2)
    return Math.max(1, b1Center - 4)
  })()

  return (
    <div style={S.root(theme.bg)}>
      <Toolbar
        neckPosition={neckPosition}
        onNeckUp={handleNeckUp}
        onNeckDown={handleNeckDown}
        currentKey={boxes[0]?.chordRoot ?? 'A'}
        onTransposeUp={transposeUp}
        onTransposeDown={transposeDown}
        cardCount={cardCount}
        onSetCardCount={handleSetCardCount}
        onOpenPopular={() => setPresetsOpen(true)}
        onToggleLibrary={() => setLibraryOpen(o => !o)}
        libraryOpen={libraryOpen}
        onOpenScaleDegrees={() => setScaleDegreeModalOpen(true)}
        onToggleTheme={toggleTheme}
        themeKey={themeKey}
      />

      <div style={S.body}>
        {/* ── Library modal ── */}
        {libraryOpen && (
          <ProgressionLibrary
            progressions={savedProgressions}
            onLoad={loadSavedProgression}
            onDelete={deleteProgression}
            onRename={renameProgression}
            onSave={saveCurrentProgression}
            onClose={() => setLibraryOpen(false)}
            themeKey={themeKey}
          />
        )}

        {/* ── Main box row ── */}
        <div
          style={{
            ...S.scrollArea,
            gridTemplateColumns: `repeat(${Math.max(Math.min(boxes.length, 4), boxes.length === 1 ? 2 : 1)}, 1fr)`,
            gap: isMobile ? 4 : 16,
            padding: isMobile ? '4px 4px 8px' : '16px 16px 24px',
          }}
          data-testid="boxes-scroll-area"
          ref={scrollAreaRef}
        >
          {boxes.map((box, i) => (
            <ScaledCard key={box.id} scale={cardScale} index={i}>
              <ChordBox
                box={box}
                boxIndex={i}
                box1BaseFret={(() => {
                  const b1 = boxes[0]
                  const shape = getBaseShapes(b1.chordQuality)[b1.shapeIndex]
                  const transposed = transposeShape(shape, getIntervalSigned('A', b1.chordRoot))
                  const frets = transposed.strings.flatMap(s => s.dots.map(d => d.fret))
                  return Math.round((Math.min(...frets) + Math.max(...frets)) / 2)
                })()}
                startFret={b1Start}
                onLockToggle={handleLockToggle}
                onPrevShape={decrementShape}
                onNextShape={incrementShape}
                onResetShape={resetShape}
                onToggleDegree={(id, deg) => toggleScaleDegree(id, deg as ScaleDegree)}
                onToggleAllDegrees={setAllScaleDegrees}
                onChordSelect={handleChordSelect}
                compact={i > 0}
                adminMode={adminMode}
                onLearn={adminMode ? learnShape : undefined}
              />
            </ScaledCard>
          ))}

          {/* ── Placeholder card — shown when only 1 chord exists ── */}
          {boxes.length === 1 && (
            <div
              onClick={() => handleSetCardCount(2)}
              style={{
                border: `2px dashed ${theme.border}`,
                borderRadius: 16,
                background: themeKey === 'light' ? '#FFFFFF' : '#000000',
                display: 'flex',
                flexDirection: 'column' as const,
                alignItems: 'center',
                justifyContent: 'center',
                gap: 12,
                cursor: 'pointer',
                opacity: 0.5,
                transition: 'opacity 0.2s',
                minHeight: 200,
              }}
              onMouseEnter={e => (e.currentTarget.style.opacity = '0.8')}
              onMouseLeave={e => (e.currentTarget.style.opacity = '0.5')}
              aria-label="Add a chord"
            >
              <div style={{
                width: 48,
                height: 48,
                borderRadius: '50%',
                border: `2px dashed ${theme.border}`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 24,
                color: theme.textMuted,
              }}>
                +
              </div>
              <span style={{
                fontSize: 13,
                fontWeight: 600,
                color: theme.textMuted,
                letterSpacing: '0.02em',
              }}>
                Add a Chord
              </span>
            </div>
          )}
        </div>
      </div>

      {adminMode && (
        <AdminPanel
          overrides={overrides}
          onClearAll={clearOverrides}
          onRemoveOverride={removeOverride}
        />
      )}

      {presetsOpen && createPortal(
        <PresetPicker
          onSelect={handlePresetSelect}
          onClose={() => setPresetsOpen(false)}
        />,
        document.body,
      )}

      {scaleDegreeModalOpen && createPortal(
        <ScaleDegreeModal
          onClose={() => setScaleDegreeModalOpen(false)}
          themeKey={themeKey}
        />,
        document.body,
      )}
    </div>
  )
}

export default Session