import { create } from "zustand";
import type {
  BoxData,
  ChordQuality,
  NoteRoot,
  OverrideRule,
  ScaleDegree,
  Progression,
} from "../types";
import { resolveShapeIndex } from "../utils/shapeSelector";
import {
  getInterval,
  getIntervalSigned,
  transposeNote,
  transposeShape,
} from "../utils/transpose";
import { AUTO_SHAPE_OVERRIDES } from "../constants/AUTO_SHAPE_OVERRIDES";
import { getBaseShapes } from "../constants/shapes";
import {
  buildRuleKey,
  addOrReplaceOverride,
  removeOverride as removeOverrideFn,
} from "../utils/overrides";
import { useToastStore } from "./toastStore";
import {
  loadSavedProgressions,
  saveProgressions,
  generateThumbnail,
} from "../utils/storage";

// ─── Constants ──────────────────────────────────────────────────────────────

const ALL_DEGREES: ScaleDegree[] = [
  "1",
  "2",
  "b3",
  "3",
  "4",
  "b5",
  "5",
  "b6",
  "6",
  "b7",
  "7",
];

function allDegreesVisible(): Record<ScaleDegree, boolean> {
  return Object.fromEntries(ALL_DEGREES.map((d) => [d, true])) as Record<
    ScaleDegree,
    boolean
  >;
}

function makeId(): string {
  return Math.random().toString(36).slice(2, 9);
}

// ─── Shape resolution helpers ───────────────────────────────────────────────

function resolveBox1ShapeIndex(_quality: ChordQuality): number {
  return 0;
}

function resolveAutoIndex(
  box: BoxData,
  box1: BoxData,
  overrides: OverrideRule[]
): number {
  const interval = getInterval(box1.chordRoot, box.chordRoot);
  const box1BaseShape = getBaseShapes(box1.chordQuality)[box1.shapeIndex];
  const box1TransposedShape = transposeShape(
    box1BaseShape,
    getIntervalSigned("A", box1.chordRoot)
  );
  const box1DotFrets = box1TransposedShape.strings.flatMap((s) =>
    s.dots.map((d) => d.fret)
  );
  const box1BaseFret = Math.round(
    (Math.min(...box1DotFrets) + Math.max(...box1DotFrets)) / 2
  );
  return resolveShapeIndex(
    {
      quality: box.chordQuality,
      chordRoot: box.chordRoot,
      box1ShapeIndex: box1.shapeIndex,
      intervalFromBox1: interval,
      box1BaseFret,
    },
    overrides
  );
}

function recalcUnlockedShapes(
  boxes: BoxData[],
  overrides: OverrideRule[]
): BoxData[] {
  if (boxes.length === 0) return boxes;
  const box1 = boxes[0];
  return boxes.map((box, i) => {
    if (i === 0) return box;
    if (box.locked) return box;
    return { ...box, shapeIndex: resolveAutoIndex(box, box1, overrides) };
  });
}

/**
 * Recalculate ALL boxes' shapeIndexes (used when loading a preset or transposing).
 */
function recalcAllShapes(
  boxes: BoxData[],
  overrides: OverrideRule[]
): BoxData[] {
  if (boxes.length === 0) return boxes;
  const box1 = boxes[0];
  return boxes.map((box, i) => {
    if (i === 0)
      return { ...box, shapeIndex: resolveBox1ShapeIndex(box.chordQuality) };
    return { ...box, shapeIndex: resolveAutoIndex(box, box1, overrides) };
  });
}

/**
 * Recalculate all LOCKED boxes (boxes 2+) based on the current Box 1.
 * Used when Box 1's shape changes.
 */
function recalcLockedShapes(
  boxes: BoxData[],
  overrides: OverrideRule[]
): BoxData[] {
  if (boxes.length === 0) return boxes;
  const box1 = boxes[0];
  return boxes.map((box, i) => {
    if (i === 0) return box;
    if (!box.locked) return box;
    return { ...box, shapeIndex: resolveAutoIndex(box, box1, overrides) };
  });
}

// ─── Initial box ─────────────────────────────────────────────────────────────

function makeInitialBox(): BoxData {
  return {
    id: makeId(),
    chordRoot: "A",
    chordQuality: "minor",
    shapeIndex: resolveBox1ShapeIndex("minor"),
    transposeOffset: 0,
    locked: true,
    scaleDegreeVisibility: allDegreesVisible(),
  };
}

// ─── State & Actions types ───────────────────────────────────────────────────

type SessionState = {
  boxes: BoxData[];
  overrides: OverrideRule[];
  adminMode: boolean;
  transposeOffset: number;
  originalRoots: NoteRoot[];
  savedProgressions: Progression[];
  currentProgressionName: string;
};

type SessionActions = {
  addBox: () => void;
  removeBox: (id: string) => void;
  setChordRoot: (id: string, root: NoteRoot) => void;
  setChordQuality: (id: string, quality: ChordQuality) => void;
  selectChord: (id: string, root: NoteRoot, quality: ChordQuality) => void;
  setShapeIndex: (id: string, index: number) => void;
  incrementShape: (id: string) => void;
  decrementShape: (id: string) => void;
  resetShape: (id: string) => void;
  setLocked: (id: string, locked: boolean) => void;
  setAllLocked: (locked: boolean) => void;
  toggleScaleDegree: (id: string, degree: ScaleDegree) => void;
  setAllScaleDegrees: (id: string, visible: boolean) => void;
  setGlobalDegree: (degree: ScaleDegree, visible: boolean) => void;
  setAllGlobalDegrees: (visible: boolean) => void;
  setAdminMode: (on: boolean) => void;
  loadProgression: (boxes: BoxData[]) => void;
  loadPreset: (preset: Progression) => void;
  transposeUp: () => void;
  transposeDown: () => void;
  saveCurrentProgression: (name: string) => void;
  deleteProgression: (id: string) => void;
  renameProgression: (id: string, name: string) => void;
  loadSavedProgression: (id: string) => void;
  initSavedProgressions: () => void;
  learnShape: (boxId: string) => void;
  removeOverride: (key: string) => void;
  clearOverrides: () => void;
};

// ─── Store ───────────────────────────────────────────────────────────────────

export const useSessionStore = create<SessionState & SessionActions>(
  (set, get) => ({
    // ── Initial state ──
    boxes: [makeInitialBox()],
    overrides: AUTO_SHAPE_OVERRIDES,
    adminMode: false,
    transposeOffset: 0,
    originalRoots: ["A"],
    savedProgressions: [],
    currentProgressionName: "",

    // ── Actions ──

    addBox() {
      set((state) => {
        const box1 = state.boxes[0];
        const newBox: BoxData = {
          id: makeId(),
          chordRoot: "A",
          chordQuality: "minor",
          shapeIndex: 0,
          transposeOffset: 0,
          locked: true,
          scaleDegreeVisibility: allDegreesVisible(),
        };
        newBox.shapeIndex = resolveAutoIndex(newBox, box1, state.overrides);
        return {
          boxes: [...state.boxes, newBox],
          originalRoots: [...state.originalRoots, "A"],
        };
      });
    },

    removeBox(id) {
      set((state) => {
        if (state.boxes.length <= 1) return state;
        const idx = state.boxes.findIndex((b) => b.id === id);
        return {
          boxes: state.boxes.filter((b) => b.id !== id),
          originalRoots: state.originalRoots.filter((_, i) => i !== idx),
        };
      });
    },

    setChordRoot(id, root) {
      set((state) => {
        const updated = state.boxes.map((b) =>
          b.id === id ? { ...b, chordRoot: root } : b
        );
        const newOriginals = state.boxes.map((b, i) =>
          b.id === id ? root : state.originalRoots[i] ?? b.chordRoot
        );
        return {
          boxes: recalcUnlockedShapes(updated, state.overrides),
          originalRoots: newOriginals,
        };
      });
    },

    setChordQuality(id, quality) {
      set((state) => {
        const updated = state.boxes.map((b, i) => {
          if (b.id !== id) return b;
          const shapeIndex =
            i === 0 ? resolveBox1ShapeIndex(quality) : b.shapeIndex;
          return { ...b, chordQuality: quality, shapeIndex };
        });
        return { boxes: recalcUnlockedShapes(updated, state.overrides) };
      });
    },

    // Atomically set both root and quality, then recalc all locked shapes in one pass
    selectChord(id, root, quality) {
      set((state) => {
        const boxIndex = state.boxes.findIndex((b) => b.id === id);
        const box1 = state.boxes[0];

        // First apply the chord change to the target box
        const updated = state.boxes.map((b, i) => {
          if (b.id !== id) return b;
          // For box 1, resolve its own shape by quality; for others, resolve against box1
          const shapeIndex =
            i === 0
              ? resolveBox1ShapeIndex(quality)
              : resolveAutoIndex(
                  { ...b, chordRoot: root, chordQuality: quality },
                  box1,
                  state.overrides
                );
          return { ...b, chordRoot: root, chordQuality: quality, shapeIndex };
        });

        const newOriginals = state.originalRoots.map((r, i) =>
          state.boxes[i]?.id === id ? root : r
        );

        // If box 1 changed, recalc all boxes 2+ against the new box 1
        const newBox1 = updated[0];
        const recalced =
          boxIndex === 0
            ? updated.map((box, i) => {
                if (i === 0) return box;
                return {
                  ...box,
                  shapeIndex: resolveAutoIndex(box, newBox1, state.overrides),
                };
              })
            : updated;

        return { boxes: recalced, originalRoots: newOriginals };
      });
    },

    setShapeIndex(id, index) {
      set((state) => {
        const boxIndex = state.boxes.findIndex((b) => b.id === id);
        // For Box 1: always allow, then recalc locked boxes
        if (boxIndex === 0) {
          const updated = state.boxes.map((b) =>
            b.id === id ? { ...b, shapeIndex: index } : b
          );
          return { boxes: recalcLockedShapes(updated, state.overrides) };
        }
        return {
          boxes: state.boxes.map((b) =>
            b.id === id && !b.locked ? { ...b, shapeIndex: index } : b
          ),
        };
      });
    },

    incrementShape(id) {
      set((state) => {
        const boxIndex = state.boxes.findIndex((b) => b.id === id);
        // Box 1: always allow cycling, then recalc locked boxes
        if (boxIndex === 0) {
          const updated = state.boxes.map((b) =>
            b.id === id ? { ...b, shapeIndex: (b.shapeIndex + 1) % 5 } : b
          );
          return { boxes: recalcLockedShapes(updated, state.overrides) };
        }
        return {
          boxes: state.boxes.map((b) => {
            if (b.id !== id || b.locked) return b;
            return { ...b, shapeIndex: (b.shapeIndex + 1) % 5 };
          }),
        };
      });
    },

    decrementShape(id) {
      set((state) => {
        const boxIndex = state.boxes.findIndex((b) => b.id === id);
        // Box 1: always allow cycling, then recalc locked boxes
        if (boxIndex === 0) {
          const updated = state.boxes.map((b) =>
            b.id === id ? { ...b, shapeIndex: (b.shapeIndex + 4) % 5 } : b
          );
          return { boxes: recalcLockedShapes(updated, state.overrides) };
        }
        return {
          boxes: state.boxes.map((b) => {
            if (b.id !== id || b.locked) return b;
            return { ...b, shapeIndex: (b.shapeIndex + 4) % 5 };
          }),
        };
      });
    },

    resetShape(id) {
      set((state) => {
        const boxIndex = state.boxes.findIndex((b) => b.id === id);
        // Box 1: reset to shape 0, then recalc locked boxes
        if (boxIndex === 0) {
          const updated = state.boxes.map((b) =>
            b.id === id
              ? { ...b, shapeIndex: resolveBox1ShapeIndex(b.chordQuality) }
              : b
          );
          return { boxes: recalcLockedShapes(updated, state.overrides) };
        }
        const box1 = state.boxes[0];
        return {
          boxes: state.boxes.map((b) => {
            if (b.id !== id) return b;
            return {
              ...b,
              shapeIndex: resolveAutoIndex(b, box1, state.overrides),
            };
          }),
        };
      });
    },

    setLocked(id, locked) {
      set((state) => {
        const boxIndex = state.boxes.findIndex((b) => b.id === id);
        if (boxIndex === 0) return state;
        return {
          boxes: state.boxes.map((b) => (b.id === id ? { ...b, locked } : b)),
        };
      });
    },

    setAllLocked(locked) {
      set((state) => ({
        boxes: state.boxes.map((b, i) => (i === 0 ? b : { ...b, locked })),
      }));
    },

    toggleScaleDegree(id, degree) {
      set((state) => ({
        boxes: state.boxes.map((b) => {
          if (b.id !== id) return b;
          return {
            ...b,
            scaleDegreeVisibility: {
              ...b.scaleDegreeVisibility,
              [degree]: !b.scaleDegreeVisibility[degree],
            },
          };
        }),
      }));
    },

    setAllScaleDegrees(id, _visible) {
      set((state) => ({
        boxes: state.boxes.map((b) => {
          if (b.id !== id) return b;
          return { ...b, scaleDegreeVisibility: allDegreesVisible() };
        }),
      }));
    },

    setGlobalDegree(degree, visible) {
      set((state) => ({
        boxes: state.boxes.map((b) => ({
          ...b,
          scaleDegreeVisibility: {
            ...b.scaleDegreeVisibility,
            [degree]: visible,
          },
        })),
      }));
    },

    setAllGlobalDegrees(visible) {
      set((state) => ({
        boxes: state.boxes.map((b) => ({
          ...b,
          scaleDegreeVisibility: Object.fromEntries(
            ALL_DEGREES.map((d) => [d, visible])
          ) as Record<ScaleDegree, boolean>,
        })),
      }));
    },

    setAdminMode(on) {
      set({ adminMode: on });
    },

    loadProgression(boxes) {
      set({
        boxes,
        originalRoots: boxes.map((b) => b.chordRoot),
        transposeOffset: 0,
      });
    },

    loadPreset(preset) {
      set((state) => {
        const recalced = recalcAllShapes(preset.boxes, state.overrides);
        return {
          boxes: recalced,
          originalRoots: preset.boxes.map((b) => b.chordRoot),
          transposeOffset: 0,
        };
      });
    },

    transposeUp() {
      set((state) => {
        const newOffset = (state.transposeOffset + 1) % 12;
        const transposedBoxes = state.boxes.map((box, i) => {
          const origRoot = state.originalRoots[i] ?? box.chordRoot;
          const newRoot = transposeNote(origRoot, newOffset);
          return { ...box, chordRoot: newRoot };
        });
        return {
          transposeOffset: newOffset,
          boxes: recalcAllShapes(transposedBoxes, state.overrides),
        };
      });
    },

    transposeDown() {
      set((state) => {
        const newOffset = (state.transposeOffset + 11) % 12;
        const transposedBoxes = state.boxes.map((box, i) => {
          const origRoot = state.originalRoots[i] ?? box.chordRoot;
          const newRoot = transposeNote(origRoot, newOffset);
          return { ...box, chordRoot: newRoot };
        });
        return {
          transposeOffset: newOffset,
          boxes: recalcAllShapes(transposedBoxes, state.overrides),
        };
      });
    },

    saveCurrentProgression(name) {
      set((state) => {
        const id = Math.random().toString(36).slice(2, 10);
        const thumbnail = generateThumbnail(state.boxes);
        const newProg: Progression = {
          id,
          name: name.trim() || "Untitled",
          boxes: state.boxes.map((b) => ({ ...b })),
          thumbnail,
        };
        const updated = [...state.savedProgressions, newProg];
        saveProgressions(updated);
        try {
          useToastStore.getState().showToast("Progression saved! ✓", "success");
        } catch {}
        return {
          savedProgressions: updated,
          currentProgressionName: newProg.name,
        };
      });
    },

    deleteProgression(id) {
      set((state) => {
        const updated = state.savedProgressions.filter((p) => p.id !== id);
        saveProgressions(updated);
        return { savedProgressions: updated };
      });
    },

    renameProgression(id, name) {
      set((state) => {
        const updated = state.savedProgressions.map((p) =>
          p.id === id ? { ...p, name: name.trim() || p.name } : p
        );
        saveProgressions(updated);
        return { savedProgressions: updated };
      });
    },

    loadSavedProgression(id) {
      const state = get();
      const prog = state.savedProgressions.find((p) => p.id === id);
      if (!prog) return;
      const recalced = recalcAllShapes(prog.boxes, state.overrides);
      set({
        boxes: recalced,
        originalRoots: prog.boxes.map((b) => b.chordRoot),
        transposeOffset: 0,
        currentProgressionName: prog.name,
      });
    },

    initSavedProgressions() {
      const progressions = loadSavedProgressions();
      set({ savedProgressions: progressions });
    },

    learnShape(boxId) {
      const state = get();
      const box = state.boxes.find((b) => b.id === boxId);
      if (!box) return;
      const box1 = state.boxes[0];
      const interval = getInterval(box1.chordRoot, box.chordRoot);
      const key = buildRuleKey(box.chordQuality, box1.shapeIndex, interval);
      const newRule = { key, shapeIndex: box.shapeIndex };
      const updated = addOrReplaceOverride(state.overrides, newRule);
      console.log(
        `[Admin Learn] Override saved: ${key} → shapeIndex ${box.shapeIndex}`
      );
      try {
        useToastStore
          .getState()
          .showToast(`Override saved for ${key} ✓`, "success");
      } catch {}
      set({ overrides: updated });
    },

    removeOverride(key) {
      set((state) => ({
        overrides: removeOverrideFn(state.overrides, key),
      }));
    },

    clearOverrides() {
      set({ overrides: [] });
    },
  })
);
