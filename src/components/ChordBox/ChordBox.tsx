import { useMemo, useState } from "react";
import { useTheme } from "../../styles/ThemeContext";
import { createPortal } from "react-dom";
import type { BoxData, NoteRoot, ChordQuality, ScaleDegree } from "../../types";
import { Fretboard } from "../Fretboard/Fretboard";
import { ChordPicker } from "../ChordPicker/ChordPicker";
import { getBaseShapes } from "../../constants/shapes";
import { transposeShapeToRoot } from "../../utils/transpose";

// ─── Types ───────────────────────────────────────────────────────────────────

export type ChordBoxProps = {
  box: BoxData;
  boxIndex: number;
  box1BaseFret?: number;
  startFret?: number;
  onLockToggle: (id: string) => void;
  onPrevShape: (id: string) => void;
  onNextShape: (id: string) => void;
  onResetShape: (id: string) => void;
  onToggleDegree: (id: string, degree: ScaleDegree) => void;
  onToggleAllDegrees: (id: string, visible: boolean) => void;
  onChordSelect: (id: string, root: NoteRoot, quality: ChordQuality) => void;
  adminMode?: boolean;
  onLearn?: (id: string) => void;
  compact?: boolean;
};

// ─── Constants ────────────────────────────────────────────────────────────────

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

const DEGREE_COLORS: Record<ScaleDegree, string> = {
  "1": "#E53E3E",
  b3: "#6B46C1",
  "3": "#2B6CB0",
  "4": "#2F855A",
  "5": "#C05621",
  b7: "#B7791F",
  "2": "#4A5568",
  "6": "#4A5568",
  b5: "#4A5568",
  "7": "#4A5568",
  b6: "#4A5568",
};

// Chord quality → circle color
const QUALITY_COLORS: Record<ChordQuality, string> = {
  major: "#F6A623", // gold
  minor: "#29ABE2", // blue
  dominant: "#7B4FD4", // purple
};

// ─── Helpers ─────────────────────────────────────────────────────────────────

function getQualityLabel(quality: ChordQuality): string {
  if (quality === "major") return "MAJ";
  if (quality === "minor") return "MIN";
  return "DOM";
}

function getSuperscript(quality: ChordQuality): string {
  return quality === "dominant" ? "7" : "";
}

function getShapeDegrees(
  shape: ReturnType<typeof getBaseShapes>[0]
): ScaleDegree[] {
  const seen = new Set<ScaleDegree>();
  for (const str of shape.strings) {
    for (const dot of str.dots) seen.add(dot.degree);
  }
  return ALL_DEGREES.filter((d) => seen.has(d));
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
  const { themeKey, theme } = useTheme();
  const isBox1 = boxIndex === 0;
  const disabled = box.locked && !isBox1;
  const [pickerOpen, setPickerOpen] = useState(false);
  const isLight = themeKey === "light";

  const circleColor = QUALITY_COLORS[box.chordQuality];
  const qualityLabel = getQualityLabel(box.chordQuality);
  const superscript = getSuperscript(box.chordQuality);

  // Theme-aware styles
  const cardStyle = {
    background: isLight
      ? "#FFFFFF"
      : "linear-gradient(160deg, #1a1f2e 0%, #161b27 100%)",
    border: `1px solid ${isLight ? "#E2E8F0" : "rgba(255,255,255,0.07)"}`,
    borderRadius: 16,
    overflow: "hidden" as const,
    boxShadow: isLight
      ? "0 2px 12px rgba(0,0,0,0.08)"
      : "0 4px 24px rgba(0,0,0,0.4)",
    fontFamily: "'DM Sans', 'Segoe UI', system-ui, sans-serif",
    width: 320,
    userSelect: "none" as const,
  };

  // Derive transposed shape for rendering
  const transposedShape = useMemo(() => {
    const baseShape = getBaseShapes(box.chordQuality)[box.shapeIndex];
    const shape = transposeShapeToRoot(baseShape, "A", box.chordRoot);
    const target = box1BaseFret ?? 6;

    const dotFrets = shape.strings.flatMap((s) => s.dots.map((d) => d.fret));
    const dotMid = Math.round(
      (Math.min(...dotFrets) + Math.max(...dotFrets)) / 2
    );

    // Pick the octave shift (0, +12, -12) that brings dotMid closest to target
    const dists = [
      { shift: 0, dist: Math.abs(dotMid - target) },
      { shift: 12, dist: Math.abs(dotMid + 12 - target) },
      { shift: -12, dist: Math.abs(dotMid - 12 - target) },
    ];
    const shift = dists.reduce((a, b) => (b.dist < a.dist ? b : a)).shift;

    if (shift === 0) return shape;
    return {
      ...shape,
      baseFret: shape.baseFret + shift,
      strings: shape.strings.map((str) => ({
        ...str,
        dots: str.dots.map((dot) => ({ ...dot, fret: dot.fret + shift })),
      })),
    };
  }, [box.chordQuality, box.shapeIndex, box.chordRoot, box1BaseFret]);

  const baseShape = getBaseShapes(box.chordQuality)[box.shapeIndex];
  const shapeDegrees = getShapeDegrees(baseShape);
  const anyVisible = shapeDegrees.some((d) => box.scaleDegreeVisibility[d]);

  const handleChordConfirm = (root: NoteRoot, quality: ChordQuality) => {
    onChordSelect(box.id, root, quality);
    setPickerOpen(false);
  };

  return (
    <div style={cardStyle} data-testid={`chord-box-${boxIndex}`}>
      {/* ── Chord Circle Header ─────────────────────────────── */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          paddingTop: 20,
          paddingBottom: 8,
          position: "relative",
        }}
      >
        {/* Box number badge */}
        <span
          style={{
            position: "absolute",
            top: 10,
            left: 14,
            fontSize: 10,
            fontWeight: 700,
            letterSpacing: "0.08em",
            textTransform: "uppercase" as const,
            color: isLight ? "#A0AEC0" : "#4A5568",
            background: isLight ? "#F7FAFC" : "rgba(255,255,255,0.05)",
            borderRadius: 4,
            padding: "2px 6px",
          }}
        >
          {isBox1 ? "🎸 CHORD 1" : `CHORD ${boxIndex + 1}`}
        </span>

        {/* Lock button for boxes 2+ */}
        {!isBox1 && (
          <button
            style={{
              position: "absolute",
              top: 8,
              right: 12,
              background: "none",
              border: "none",
              cursor: "pointer",
              fontSize: 14,
              padding: "3px 5px",
              borderRadius: 6,
              color: isLight ? "#A0AEC0" : "#718096",
            }}
            onClick={() => onLockToggle(box.id)}
            aria-label={box.locked ? "Unlock box" : "Lock box"}
            data-testid="lock-btn"
            title={box.locked ? "Unlock" : "Lock"}
          >
            {box.locked ? "🔒" : "🔓"}
          </button>
        )}

        {/* Chord circle — clickable to open picker */}
        <button
          onClick={() => setPickerOpen(true)}
          data-testid="chord-name"
          aria-label={`Change chord: ${box.chordRoot} ${box.chordQuality}`}
          title="Click to change chord"
          style={{
            width: 90,
            height: 90,
            borderRadius: "50%",
            background: circleColor,
            border: "none",
            cursor: "pointer",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: `0 4px 16px ${circleColor}55`,
            transition: "transform 0.12s, box-shadow 0.12s",
            padding: 0,
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLButtonElement).style.transform =
              "scale(1.05)";
            (
              e.currentTarget as HTMLButtonElement
            ).style.boxShadow = `0 6px 20px ${circleColor}77`;
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLButtonElement).style.transform = "scale(1)";
            (
              e.currentTarget as HTMLButtonElement
            ).style.boxShadow = `0 4px 16px ${circleColor}55`;
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "flex-start",
              lineHeight: 1,
            }}
          >
            <span
              style={{
                fontSize: 32,
                fontWeight: 900,
                color: "white",
                letterSpacing: "-0.02em",
                fontFamily: "'DM Sans', 'Segoe UI', system-ui, sans-serif",
              }}
            >
              {box.chordRoot}
            </span>
            {superscript && (
              <span
                style={{
                  fontSize: 14,
                  fontWeight: 700,
                  color: "white",
                  marginTop: 4,
                }}
              >
                {superscript}
              </span>
            )}
          </div>
          <span
            style={{
              fontSize: 11,
              fontWeight: 700,
              color: "rgba(255,255,255,0.85)",
              letterSpacing: "0.1em",
              marginTop: 2,
            }}
          >
            {qualityLabel}
          </span>
        </button>
      </div>

      {/* ── Fretboard ──────────────────────────────────────── */}
      <div
        style={{
          padding: "4px 8px 4px",
          background: isLight ? "rgba(0,0,0,0.02)" : "rgba(0,0,0,0.2)",
        }}
      >
        <Fretboard
          startFret={startFret}
          themeKey={themeKey}
          shape={transposedShape}
          scaleDegreeVisibility={box.scaleDegreeVisibility}
          width={304}
          height={160}
        />
      </div>

      {/* ── Shape controls ─────────────────────────────────── */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 6,
          padding: "8px 14px",
        }}
      >
        {[
          {
            label: "◀",
            action: () => !disabled && onPrevShape(box.id),
            testId: "prev-btn",
            ariaLabel: "Previous shape",
          },
          {
            label: "▶",
            action: () => !disabled && onNextShape(box.id),
            testId: "next-btn",
            ariaLabel: "Next shape",
          },
        ].map((btn) => (
          <button
            key={btn.testId}
            style={{
              background: disabled
                ? isLight
                  ? "#F7FAFC"
                  : "rgba(255,255,255,0.03)"
                : isLight
                ? "#EDF2F7"
                : "rgba(255,255,255,0.07)",
              border: `1px solid ${
                disabled
                  ? isLight
                    ? "#E2E8F0"
                    : "rgba(255,255,255,0.04)"
                  : isLight
                  ? "#CBD5E0"
                  : "rgba(255,255,255,0.12)"
              }`,
              borderRadius: 7,
              color: disabled
                ? isLight
                  ? "#CBD5E0"
                  : "#2D3748"
                : isLight
                ? "#4A5568"
                : "#A0AEC0",
              cursor: disabled ? "not-allowed" : "pointer",
              fontSize: 12,
              fontWeight: 600,
              padding: "5px 10px",
              transition: "all 0.12s",
              opacity: disabled ? 0.5 : 1,
            }}
            disabled={disabled}
            onClick={btn.action}
            aria-label={btn.ariaLabel}
            data-testid={btn.testId}
          >
            {btn.label}
          </button>
        ))}
        <button
          style={{
            background: "none",
            border: `1px solid ${
              disabled
                ? isLight
                  ? "#E2E8F0"
                  : "rgba(255,255,255,0.04)"
                : isLight
                ? "#CBD5E0"
                : "rgba(255,255,255,0.1)"
            }`,
            borderRadius: 7,
            color: disabled
              ? isLight
                ? "#CBD5E0"
                : "#2D3748"
              : isLight
              ? "#718096"
              : "#718096",
            cursor: disabled ? "not-allowed" : "pointer",
            fontSize: 11,
            fontWeight: 500,
            padding: "5px 9px",
            marginLeft: "auto",
            transition: "all 0.12s",
            opacity: disabled ? 0.4 : 1,
            letterSpacing: "0.02em",
          }}
          disabled={disabled}
          onClick={() => !disabled && onResetShape(box.id)}
          aria-label="Reset shape"
          data-testid="reset-btn"
        >
          Reset
        </button>
        {adminMode && !box.locked && boxIndex > 0 && onLearn && (
          <button
            style={{
              background: "rgba(159,122,234,0.15)",
              border: "1px solid rgba(159,122,234,0.4)",
              borderRadius: 6,
              color: "#B794F4",
              cursor: "pointer",
              fontSize: 10,
              fontWeight: 700,
              padding: "3px 9px",
              letterSpacing: "0.06em",
              textTransform: "uppercase" as const,
            }}
            onClick={() => onLearn(box.id)}
            aria-label="Learn this shape override"
            data-testid="learn-btn"
          >
            Learn
          </button>
        )}
      </div>

      {/* ── Degree toggles ─────────────────────────────────── */}
      <div
        style={{
          display: "flex",
          flexWrap: "wrap" as const,
          gap: 4,
          padding: "4px 14px 14px",
        }}
        data-testid="degrees-row"
      >
        <button
          style={{
            background: anyVisible
              ? isLight
                ? "#EDF2F7"
                : "rgba(255,255,255,0.08)"
              : isLight
              ? "#F7FAFC"
              : "rgba(255,255,255,0.03)",
            border: `1px solid ${
              anyVisible
                ? isLight
                  ? "#CBD5E0"
                  : "rgba(255,255,255,0.15)"
                : isLight
                ? "#E2E8F0"
                : "rgba(255,255,255,0.06)"
            }`,
            borderRadius: 5,
            color: anyVisible
              ? isLight
                ? "#2D3748"
                : "#CBD5E0"
              : isLight
              ? "#A0AEC0"
              : "#4A5568",
            cursor: "pointer",
            fontSize: 10,
            fontWeight: 600,
            padding: "3px 8px",
            transition: "all 0.12s",
            letterSpacing: "0.04em",
          }}
          onClick={() => onToggleAllDegrees(box.id, !anyVisible)}
          aria-label="Toggle all degrees"
          data-testid="all-degrees-btn"
        >
          All
        </button>

        {shapeDegrees.map((degree) => {
          const active = box.scaleDegreeVisibility[degree];
          const label = degree === "1" ? "R" : degree;
          return (
            <button
              key={degree}
              style={{
                background: active ? `${DEGREE_COLORS[degree]}22` : "#222222",
                border: `1px solid ${
                  active ? DEGREE_COLORS[degree] : "#222222"
                }`,
                borderRadius: 5,
                color: active ? DEGREE_COLORS[degree] : "transparent",
                cursor: "pointer",
                fontSize: 10,
                fontWeight: 700,
                padding: "3px 7px",
                transition: "all 0.12s",
                letterSpacing: "0.02em",
                minWidth: 28,
              }}
              onClick={() => onToggleDegree(box.id, degree)}
              aria-label={`Toggle degree ${label}`}
              aria-pressed={active}
              data-testid={`degree-btn-${degree}`}
            >
              {label}
            </button>
          );
        })}
      </div>

      {/* ── ChordPicker portal ─────────────────────────────── */}
      {pickerOpen &&
        createPortal(
          <ChordPicker
            currentRoot={box.chordRoot}
            currentQuality={box.chordQuality}
            onSelect={handleChordConfirm}
            onClose={() => setPickerOpen(false)}
          />,
          document.body
        )}
    </div>
  );
}

export default ChordBox;
