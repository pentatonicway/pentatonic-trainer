import { useState } from 'react'
import { createPortal } from 'react-dom'
import { useSessionStore } from '../../store/sessionStore'
import { ChordBox } from '../ChordBox/ChordBox'
import { Toolbar } from '../Toolbar/Toolbar'
import { PresetPicker } from '../PresetPicker/PresetPicker'
import { ProgressionLibrary } from '../ProgressionLibrary/ProgressionLibrary'
import { AdminPanel } from '../AdminPanel/AdminPanel'
import type { NoteRoot, ChordQuality, ScaleDegree, Progression } from '../../types'
import { useTheme } from '../../styles/ThemeContext'

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
    display: 'flex',
    flexDirection: 'row' as const,
    alignItems: 'flex-start',
    gap: 16,
    padding: '24px 24px 32px',
    overflowX: 'auto' as const,
    flex: 1,
    scrollbarWidth: 'thin' as const,
    scrollbarColor: 'rgba(255,255,255,0.12) transparent',
  },
  boxWrapper: {
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    gap: 6,
    flexShrink: 0,
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
    setChordRoot, setChordQuality,
    loadPreset, transposeUp, transposeDown,
    learnShape, removeOverride, clearOverrides,
    saveCurrentProgression, deleteProgression,
    renameProgression, loadSavedProgression,
  } = useSessionStore()

  const [presetsOpen, setPresetsOpen] = useState(false)
  const [libraryOpen, setLibraryOpen] = useState(false)

  const handleLockToggle = (id: string) => {
    const box = boxes.find(b => b.id === id)
    if (box) setLocked(id, !box.locked)
  }

  const handleChordSelect = (id: string, root: NoteRoot, quality: ChordQuality) => {
    setChordRoot(id, root)
    setChordQuality(id, quality)
  }

  const handlePresetSelect = (preset: Progression) => {
    loadPreset(preset)
    setPresetsOpen(false)
  }

  return (
    <div style={S.root(theme.bg)}>
      <Toolbar
        transposeOffset={transposeOffset}
        onTransposeUp={transposeUp}
        onTransposeDown={transposeDown}
        onOpenPresets={() => setPresetsOpen(true)}
        onLockAll={() => setAllLocked(true)}
        onUnlockAll={() => setAllLocked(false)}
        onToggleTheme={toggleTheme}
        themeKey={themeKey}
        onToggleLibrary={() => setLibraryOpen(o => !o)}
        libraryOpen={libraryOpen}
      />

      <div style={S.body}>
        {/* ── Sidebar library ── */}
        {libraryOpen && (
          <ProgressionLibrary
            progressions={savedProgressions}
            onLoad={loadSavedProgression}
            onDelete={deleteProgression}
            onRename={renameProgression}
            onSave={saveCurrentProgression}
          />
        )}

        {/* ── Main box row ── */}
        <div style={S.scrollArea} data-testid="boxes-scroll-area">
          {boxes.map((box, i) => (
            <div key={box.id} style={S.boxWrapper} data-testid={`box-wrapper-${i}`}>
              <ChordBox
                box={box}
                boxIndex={i}
                onLockToggle={handleLockToggle}
                onPrevShape={decrementShape}
                onNextShape={incrementShape}
                onResetShape={resetShape}
                onToggleDegree={(id, deg) => toggleScaleDegree(id, deg as ScaleDegree)}
                onToggleAllDegrees={setAllScaleDegrees}
                onChordSelect={handleChordSelect}
              adminMode={adminMode}
              onLearn={adminMode ? learnShape : undefined}
              />
              {i > 0 && (
                <button
                  style={S.removeBtn}
                  onClick={() => removeBox(box.id)}
                  data-testid={`remove-box-${i}`}
                  aria-label={`Remove box ${i + 1}`}
                >
                  × Remove
                </button>
              )}
            </div>
          ))}

          <button
            style={S.addBtn}
            onClick={addBox}
            data-testid="add-box-btn"
            aria-label="Add chord box"
          >
            +
          </button>
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
    </div>
  )
}

export default Session
