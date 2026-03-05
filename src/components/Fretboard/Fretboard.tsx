import type { ShapeData, ScaleDegree } from '../../types'

// ─── Types ──────────────────────────────────────────────────────────────────

export type FretboardProps = {
  shape: ShapeData
  scaleDegreeVisibility: Record<ScaleDegree, boolean>
  width?: number
  height?: number
}

// ─── Constants ───────────────────────────────────────────────────────────────

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

const DEGREE_LABELS: Record<ScaleDegree, string> = {
  '1':  'Root',
  '2':  '2nd',
  'b3': 'Minor 3rd',
  '3':  'Major 3rd',
  '4':  'Fourth',
  'b5': 'Flat 5th',
  '5':  'Fifth',
  'b6': 'Flat 6th',
  '6':  'Sixth',
  'b7': 'Minor 7th',
  '7':  'Major 7th',
}

const NUM_STRINGS = 6

// ─── Layout helpers ──────────────────────────────────────────────────────────

/** Collect every fret number that appears across all strings. */
function getShapeFrets(shape: ShapeData): number[] {
  const frets = new Set<number>()
  for (const str of shape.strings) {
    for (const dot of str.dots) {
      frets.add(dot.fret)
    }
  }
  return Array.from(frets).sort((a, b) => a - b)
}

/**
 * Build the ordered list of fret slots to render.
 * We show: min(shapeFrets)-1  …  max(shapeFrets)+1
 * with a minimum window of 5 slots.
 */
function buildFretWindow(shapeFrets: number[]): number[] {
  if (shapeFrets.length === 0) return [0, 1, 2, 3, 4]

  const min = Math.max(0, shapeFrets[0] - 1)
  const max = shapeFrets[shapeFrets.length - 1] + 1
  const raw: number[] = []
  for (let f = min; f <= max; f++) raw.push(f)

  // Pad to at least 5 slots
  while (raw.length < 5) raw.push(raw[raw.length - 1] + 1)
  return raw
}

// ─── Component ───────────────────────────────────────────────────────────────

export function Fretboard({
  shape,
  scaleDegreeVisibility,
  width = 300,
  height = 180,
}: FretboardProps) {
  const shapeFrets = getShapeFrets(shape)
  const fretWindow = buildFretWindow(shapeFrets)
  const showNut = fretWindow.includes(0)

  // Layout margins
  const marginTop    = 20
  const marginBottom = 30   // room for fret numbers
  const marginLeft   = showNut ? 24 : 16
  const marginRight  = 16

  const boardWidth  = width  - marginLeft - marginRight
  const boardHeight = height - marginTop  - marginBottom

  // Number of fret *slots* (spaces between fret lines) = fretWindow.length - 1
  // We render fretWindow.length+1 vertical lines: one before first fret and after last
  // Actually: fretWindow contains fret numbers. We render vertical lines AT each fret position.
  // Slot width = boardWidth / (fretWindow.length - 1) when there are N frets → N-1 gaps
  const numSlots = Math.max(fretWindow.length - 1, 1)
  const slotWidth = boardWidth / numSlots

  // String spacing
  const stringSpacing = boardHeight / (NUM_STRINGS - 1)

  // Map fret number → x coordinate
  function fretX(fretNum: number): number {
    const idx = fretWindow.indexOf(fretNum)
    return marginLeft + idx * slotWidth
  }

  // Map string number (1=top, 6=bottom) → y coordinate
  function stringY(stringNumber: number): number {
    // string 1 = top (marginTop), string 6 = bottom (marginTop + boardHeight)
    return marginTop + (stringNumber - 1) * stringSpacing
  }

  // String stroke widths — string 6 (low E) is thickest
  function stringStrokeWidth(stringNumber: number): number {
    // string 1 = 0.8, string 6 = 2.4 — linear
    return 0.8 + ((stringNumber - 1) / (NUM_STRINGS - 1)) * 1.6
  }

  const dotRadius = Math.min(slotWidth, stringSpacing) * 0.35

  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      role="img"
      aria-label={`Guitar fretboard: ${shape.label}`}
    >
      {/* ── Nut ─────────────────────────────────────────────── */}
      {showNut && (
        <line
          x1={marginLeft}
          y1={marginTop}
          x2={marginLeft}
          y2={marginTop + boardHeight}
          stroke="#1A202C"
          strokeWidth={4}
          strokeLinecap="round"
        />
      )}

      {/* ── Fret lines ──────────────────────────────────────── */}
      {fretWindow.map(fretNum => {
        const x = fretX(fretNum)
        return (
          <line
            key={`fret-${fretNum}`}
            x1={x}
            y1={marginTop}
            x2={x}
            y2={marginTop + boardHeight}
            stroke="#CBD5E0"
            strokeWidth={1}
          />
        )
      })}

      {/* ── Strings ─────────────────────────────────────────── */}
      {Array.from({ length: NUM_STRINGS }, (_, i) => i + 1).map(stringNum => {
        const y = stringY(stringNum)
        return (
          <line
            key={`string-${stringNum}`}
            x1={marginLeft}
            y1={y}
            x2={marginLeft + boardWidth}
            y2={y}
            stroke="#718096"
            strokeWidth={stringStrokeWidth(stringNum)}
            data-testid={`string-line-${stringNum}`}
          />
        )
      })}

      {/* ── Fret number labels ──────────────────────────────── */}
      {fretWindow.map(fretNum => {
        if (fretNum === 0) return null // no label for open string / nut position
        const x = fretX(fretNum) - slotWidth / 2
        const y = height - marginBottom + 14
        return (
          <text
            key={`fret-label-${fretNum}`}
            x={x}
            y={y}
            textAnchor="middle"
            fontSize={10}
            fill="#718096"
          >
            {fretNum}
          </text>
        )
      })}

      {/* ── Dots ────────────────────────────────────────────── */}
      {shape.strings.map(guitarString =>
        guitarString.dots.map(dot => {
          const cx = fretX(dot.fret) - slotWidth / 2
          const cy = stringY(guitarString.stringNumber)
          const color = DEGREE_COLORS[dot.degree]
          const visible = scaleDegreeVisibility[dot.degree]
          const opacity = visible ? 1 : 0.2
          const ariaLabel = `String ${guitarString.stringNumber}, Fret ${dot.fret}, ${DEGREE_LABELS[dot.degree]}`

          return (
            <g
              key={`dot-${guitarString.stringNumber}-${dot.fret}`}
              opacity={opacity}
              aria-label={ariaLabel}
              role="img"
              data-testid={`dot-${guitarString.stringNumber}-${dot.fret}`}
              data-degree={dot.degree}
            >
              <circle
                cx={cx}
                cy={cy}
                r={dotRadius}
                fill={color}
              />
              <text
                x={cx}
                y={cy + 1}
                textAnchor="middle"
                dominantBaseline="middle"
                fontSize={dotRadius * 0.9}
                fill="white"
                fontWeight="bold"
                style={{ userSelect: 'none', pointerEvents: 'none' }}
              >
                {dot.degree}
              </text>
            </g>
          )
        })
      )}
    </svg>
  )
}

export default Fretboard
