import { useState } from "react";
import { createPortal } from "react-dom";
import { useSessionStore } from "../../store/sessionStore";
import { ChordBox } from "../ChordBox/ChordBox";
import { Toolbar } from "../Toolbar/Toolbar";
import { PresetPicker } from "../PresetPicker/PresetPicker";
import { ProgressionLibrary } from "../ProgressionLibrary/ProgressionLibrary";
import { ScaleDegreeModal } from "../ScaleDegreeModal/ScaleDegreeModal";
import { AdminPanel } from "../AdminPanel/AdminPanel";
import type {
  NoteRoot,
  ChordQuality,
  ScaleDegree,
  Progression,
} from "../../types";
import { useTheme } from "../../styles/ThemeContext";
import { getBaseShapes } from "../../constants/shapes";
import { transposeShape, getIntervalSigned } from "../../utils/transpose";

const S = {
  root: (bg: string) => ({
    display: "flex",
    flexDirection: "column" as const,
    height: "100%",
    fontFamily: "'DM Sans', 'Segoe UI', system-ui, sans-serif",
    overflow: "hidden",
    background: bg,
  }),
  body: {
    display: "flex",
    flex: 1,
    overflow: "hidden",
  },
  scrollArea: {
    display: "flex",
    flexDirection: "row" as const,
    alignItems: "flex-start",
    gap: 16,
    padding: "24px 24px 32px",
    overflowX: "auto" as const,
    flex: 1,
    scrollbarWidth: "thin" as const,
    scrollbarColor: "rgba(255,255,255,0.12) transparent",
  },
  boxWrapper: {
    display: "flex",
    flexDirection: "column" as const,
    alignItems: "center",
    gap: 6,
    flexShrink: 0,
  },
  removeBtn: {
    background: "rgba(229,62,62,0.1)",
    border: "1px solid rgba(229,62,62,0.25)",
    borderRadius: 6,
    color: "#FC8181",
    cursor: "pointer",
    fontSize: 11,
    fontWeight: 600,
    padding: "3px 10px",
    letterSpacing: "0.04em",
    transition: "all 0.12s",
    width: "100%",
  },
  addBtn: {
    alignSelf: "center",
    background: "rgba(255,255,255,0.05)",
    border: "2px dashed rgba(255,255,255,0.15)",
    borderRadius: 14,
    color: "#718096",
    cursor: "pointer",
    fontSize: 28,
    fontWeight: 300,
    width: 64,
    height: 64,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    transition: "all 0.15s",
    flexShrink: 0,
  },
};

export function Session() {
  const { theme, themeKey, toggleTheme } = useTheme();
  const boxes = useSessionStore((s) => s.boxes);
  const transposeOffset = useSessionStore((s) => s.transposeOffset);
  const savedProgressions = useSessionStore((s) => s.savedProgressions);
  const adminMode = useSessionStore((s) => s.adminMode);
  const overrides = useSessionStore((s) => s.overrides);
  const {
    addBox,
    removeBox,
    setLocked,
    setAllLocked,
    decrementShape,
    incrementShape,
    resetShape,
    toggleScaleDegree,
    setAllScaleDegrees,
    setChordRoot,
    setChordQuality,
    selectChord,
    loadPreset,
    transposeUp,
    transposeDown,
    learnShape,
    removeOverride,
    clearOverrides,
    saveCurrentProgression,
    deleteProgression,
    renameProgression,
    loadSavedProgression,
  } = useSessionStore();

  const [presetsOpen, setPresetsOpen] = useState(false);
  const [libraryOpen, setLibraryOpen] = useState(false);
  const [cardCount, setCardCount] = useState(() => boxes.length);
  const [scaleDegreeModalOpen, setScaleDegreeModalOpen] = useState(false);

  // Neck position = box 1's current shapeIndex (1-based for display)
  const neckPosition = (boxes[0]?.shapeIndex ?? 0) + 1;

  const handleNeckUp = () => {
    incrementShape(boxes[0].id);
  };
  const handleNeckDown = () => {
    decrementShape(boxes[0].id);
  };

  // Sync card count with actual box count
  const handleSetCardCount = (n: number) => {
    setCardCount(n);
    const current = boxes.length;
    if (n > current) {
      for (let i = 0; i < n - current; i++) addBox();
    } else if (n < current) {
      // Remove from the end
      const toRemove = boxes.slice(n);
      toRemove.forEach((b) => removeBox(b.id));
    }
  };

  const handleLockToggle = (id: string) => {
    const box = boxes.find((b) => b.id === id);
    if (box) setLocked(id, !box.locked);
  };

  const handleChordSelect = (
    id: string,
    root: NoteRoot,
    quality: ChordQuality
  ) => {
    selectChord(id, root, quality);
  };

  const handlePresetSelect = (preset: Progression) => {
    loadPreset(preset);
    setPresetsOpen(false);
  };

  // Compute shared fret window start from Box 1's shape position
  const b1Start = (() => {
    const b1 = boxes[0];
    const b1Shape = getBaseShapes(b1.chordQuality)[b1.shapeIndex];
    const b1Transposed = transposeShape(
      b1Shape,
      getIntervalSigned("A", b1.chordRoot)
    );
    const b1Frets = b1Transposed.strings
      .flatMap((s) => s.dots.map((d) => d.fret))
      .sort((a, b) => a - b);
    const b1Min = b1Frets[0];
    const b1Max = b1Frets[b1Frets.length - 1];
    const b1Center = Math.round((b1Min + b1Max) / 2);
    return Math.max(1, b1Center - 4);
  })();

  return (
    <div style={S.root(theme.bg)}>
      <Toolbar
        neckPosition={neckPosition}
        onNeckUp={handleNeckUp}
        onNeckDown={handleNeckDown}
        cardCount={cardCount}
        onSetCardCount={handleSetCardCount}
        onOpenPopular={() => setPresetsOpen(true)}
        onToggleLibrary={() => setLibraryOpen((o) => !o)}
        libraryOpen={libraryOpen}
        onOpenScaleDegrees={() => setScaleDegreeModalOpen(true)}
        onToggleTheme={toggleTheme}
        themeKey={themeKey}
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
            <div
              key={box.id}
              style={S.boxWrapper}
              data-testid={`box-wrapper-${i}`}
            >
              <ChordBox
                box={box}
                boxIndex={i}
                box1BaseFret={(() => {
                  const b1 = boxes[0];
                  const shape = getBaseShapes(b1.chordQuality)[b1.shapeIndex];
                  const transposed = transposeShape(
                    shape,
                    getIntervalSigned("A", b1.chordRoot)
                  );
                  const frets = transposed.strings.flatMap((s) =>
                    s.dots.map((d) => d.fret)
                  );
                  return Math.round(
                    (Math.min(...frets) + Math.max(...frets)) / 2
                  );
                })()}
                startFret={b1Start}
                onLockToggle={handleLockToggle}
                onPrevShape={decrementShape}
                onNextShape={incrementShape}
                onResetShape={resetShape}
                onToggleDegree={(id, deg) =>
                  toggleScaleDegree(id, deg as ScaleDegree)
                }
                onToggleAllDegrees={setAllScaleDegrees}
                onChordSelect={handleChordSelect}
                compact={i > 0}
                adminMode={adminMode}
                onLearn={adminMode ? learnShape : undefined}
              />
            </div>
          ))}
        </div>
      </div>

      {adminMode && (
        <AdminPanel
          overrides={overrides}
          onClearAll={clearOverrides}
          onRemoveOverride={removeOverride}
        />
      )}

      {presetsOpen &&
        createPortal(
          <PresetPicker
            onSelect={handlePresetSelect}
            onClose={() => setPresetsOpen(false)}
          />,
          document.body
        )}

      {scaleDegreeModalOpen &&
        createPortal(
          <ScaleDegreeModal
            onClose={() => setScaleDegreeModalOpen(false)}
            themeKey={themeKey}
          />,
          document.body
        )}
    </div>
  );
}

export default Session;
