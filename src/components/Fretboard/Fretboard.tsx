import type { ShapeData, ScaleDegree } from '../../types'

// ─── Types ──────────────────────────────────────────────────────────────────

export type FretboardProps = {
  shape: ShapeData
  scaleDegreeVisibility: Record<ScaleDegree, boolean>
  width?: number
  height?: number
  startFret?: number
  themeKey?: 'dark' | 'light'
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

// String names from top (high e) to bottom (low E)
const STRING_NAMES = ['e', 'B', 'G', 'D', 'A', 'E']

const NUM_STRINGS = 6
const WINDOW_SIZE = 8
const FRET_MARKERS = new Set([3, 5, 7, 9, 12, 15, 17, 19, 21])
const DOUBLE_MARKERS = new Set([12, 24])

// ─── Theme configs ────────────────────────────────────────────────────────────

const LIGHT_FB = {
  boardBg: '#F5E6C8',        // warm wood tone
  boardBg2: '#EDD9A3',       // second gradient stop
  fretLine: '#8B7355',       // dark wood fret lines
  firstFretLine: '#5C4A2A',  // darker nut
  string: '#8B7355',         // warm string color
  marker: '#8B7355',
  markerOpacity: 0.25,
  fretLabel: '#8B7355',
  stringLabel: '#8B7355',
  dotStroke: 'rgba(0,0,0,0.15)',
}

const DARK_FB = {
  boardBg: '#1e2535',
  boardBg2: '#1a2035',
  fretLine: '#CBD5E0',
  firstFretLine: '#A0AEC0',
  string: '#718096',
  marker: '#4A5568',
  markerOpacity: 0.4,
  fretLabel: '#718096',
  stringLabel: '#718096',
  dotStroke: 'rgba(255,255,255,0.1)',
}

// ─── Layout helpers ──────────────────────────────────────────────────────────

function getShapeFrets(shape: ShapeData): number[] {
  const frets = new Set<number>()
  for (const str of shape.strings) {
    for (const dot of str.dots) {
      frets.add(dot.fret)
    }
  }
  return Array.from(frets).sort((a, b) => a - b)
}

function buildFretWindow(shapeFrets: number[]): number[] {
  if (shapeFrets.length === 0) return [1, 2, 3, 4, 5, 6, 7, 8]
  const hasOpenStrings = shapeFrets.includes(0)
  const min = shapeFrets[0]
  const max = shapeFrets[shapeFrets.length - 1]
  const center = Math.round((min + max) / 2)
  let start = center - Math.floor(WINDOW_SIZE / 2)
  const floor = hasOpenStrings ? 0 : 1
  if (start < floor) start = floor
  const raw: number[] = []
  for (let f = start; f < start + WINDOW_SIZE; f++) raw.push(f)
  return raw
}

// ─── Component ───────────────────────────────────────────────────────────────

export function Fretboard({
  shape,
  scaleDegreeVisibility,
  width = 300,
  height = 160,
  startFret,
  themeKey = 'dark',
}: FretboardProps) {
  const fb = themeKey === 'light' ? LIGHT_FB : DARK_FB

  const shapeFrets = getShapeFrets(shape)
  const autoWindow = buildFretWindow(shapeFrets)
  const fretWindow = startFret !== undefined
    ? Array.from({ length: WINDOW_SIZE }, (_, i) => startFret + i)
    : autoWindow

  // Layout margins — leave room on left for string labels
  const marginTop    = 16
  const marginBottom = 24
  const marginLeft   = 28   // wider for string labels
  const marginRight  = 8

  const boardWidth  = width  - marginLeft - marginRight
  const boardHeight = height - marginTop  - marginBottom

  const numSlots    = WINDOW_SIZE
  const slotWidth   = boardWidth / numSlots
  const stringSpacing = boardHeight / (NUM_STRINGS - 1)

  function fretX(fretNum: number): number {
    const idx = fretWindow.indexOf(fretNum)
    return marginLeft + idx * slotWidth
  }

  function stringY(stringNumber: number): number {
    return marginTop + (stringNumber - 1) * stringSpacing
  }

  function stringStrokeWidth(stringNumber: number): number {
    return 0.6 + ((stringNumber - 1) / (NUM_STRINGS - 1)) * 1.8
  }

  function slotCenterX(fretNum: number): number {
    return fretX(fretNum) + slotWidth / 2
  }

  const dotRadius = Math.min(slotWidth, stringSpacing) * 0.36
  const gradId = `fbGrad-${shape.label.replace(/\s/g, '')}`

  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      role="img"
      aria-label={`Guitar fretboard: ${shape.label}`}
    >
      <defs>
        <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={fb.boardBg} />
          <stop offset="100%" stopColor={fb.boardBg2} />
        </linearGradient>
      </defs>

      {/* ── Board background ────────────────────────────────── */}
      <rect
        x={marginLeft}
        y={marginTop}
        width={boardWidth}
        height={boardHeight}
        fill={`url(#${gradId})`}
        rx={2}
      />

      {/* ── Fret lines ──────────────────────────────────────── */}
      {[...fretWindow, fretWindow[fretWindow.length - 1] + 1].map((_, idx) => {
        const x = marginLeft + idx * slotWidth
        const isFirst = idx === 0
        return (
          <line
            key={`fret-line-${idx}`}
            x1={x} y1={marginTop}
            x2={x} y2={marginTop + boardHeight}
            stroke={isFirst ? fb.firstFretLine : fb.fretLine}
            strokeWidth={isFirst ? 3 : 1}
            opacity={isFirst ? 1 : 0.5}
          />
        )
      })}

      {/* ── Strings ─────────────────────────────────────────── */}
      {Array.from({ length: NUM_STRINGS }, (_, i) => i + 1).map(stringNum => {
        const y = stringY(stringNum)
        return (
          <line
            key={`string-${stringNum}`}
            x1={marginLeft} y1={y}
            x2={marginLeft + boardWidth} y2={y}
            stroke={fb.string}
            strokeWidth={stringStrokeWidth(stringNum)}
            opacity={0.7}
            data-testid={`string-line-${stringNum}`}
          />
        )
      })}

      {/* ── String labels (left side) ───────────────────────── */}
      {Array.from({ length: NUM_STRINGS }, (_, i) => i + 1).map(stringNum => {
        const y = stringY(stringNum)
        const label = STRING_NAMES[stringNum - 1]
        return (
          <text
            key={`string-label-${stringNum}`}
            x={marginLeft - 6}
            y={y}
            textAnchor="end"
            dominantBaseline="middle"
            fontSize={9}
            fill={fb.stringLabel}
            fontWeight="600"
            fontFamily="monospace"
            opacity={0.8}
          >
            {label}
          </text>
        )
      })}

      {/* ── Fret position markers ────────────────────────────── */}
      {fretWindow.map(fretNum => {
        if (!FRET_MARKERS.has(fretNum)) return null
        const x = slotCenterX(fretNum)
        const midY = marginTop + boardHeight / 2
        const isDouble = DOUBLE_MARKERS.has(fretNum)
        return (
          <g key={`marker-${fretNum}`}>
            {isDouble ? (
              <>
                <circle cx={x} cy={midY - stringSpacing} r={3.5} fill={fb.marker} opacity={fb.markerOpacity} />
                <circle cx={x} cy={midY + stringSpacing} r={3.5} fill={fb.marker} opacity={fb.markerOpacity} />
              </>
            ) : (
              <circle cx={x} cy={midY} r={3.5} fill={fb.marker} opacity={fb.markerOpacity} />
            )}
          </g>
        )
      })}

      {/* ── Fret number labels ──────────────────────────────── */}
      {fretWindow.map(fretNum => {
        const x = slotCenterX(fretNum)
        const y = height - 6
        return (
          <text
            key={`fret-label-${fretNum}`}
            x={x} y={y}
            textAnchor="middle"
            fontSize={9}
            fill={fb.fretLabel}
            opacity={0.8}
          >
            {fretNum}
          </text>
        )
      })}

      {/* ── Dots ────────────────────────────────────────────── */}
      {shape.strings.map(guitarString =>
        guitarString.dots.map(dot => {
          if (!fretWindow.includes(dot.fret)) return null

          const cx = slotCenterX(dot.fret)
          const cy = stringY(guitarString.stringNumber)
          const color = DEGREE_COLORS[dot.degree]
          const visible = scaleDegreeVisibility[dot.degree]
          const ariaLabel = `String ${guitarString.stringNumber}, Fret ${dot.fret}, ${DEGREE_LABELS[dot.degree]}`
          // Show "R" for root instead of "1"
          const label = dot.degree === '1' ? 'R' : dot.degree

          return (
            <g
              key={`dot-${guitarString.stringNumber}-${dot.fret}`}
              aria-label={ariaLabel}
              role="img"
              data-testid={`dot-${guitarString.stringNumber}-${dot.fret}`}
              data-degree={dot.degree}
            >
              <circle
                cx={cx} cy={cy} r={dotRadius}
                fill={visible ? color : '#222222'}
                stroke={fb.dotStroke}
                strokeWidth={1}
              />
              {visible && (
                <text
                  x={cx} y={cy + 0.5}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fontSize={dotRadius * 1.0}
                  fill="white"
                  fontWeight="bold"
                  style={{ userSelect: 'none', pointerEvents: 'none' }}
                >
                  {label}
                </text>
              )}
            </g>
          )
        })
      )}
    </svg>
  )
}

export default Fretboard