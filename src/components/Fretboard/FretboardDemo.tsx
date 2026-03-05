import { Fretboard } from './Fretboard'
import { AMINOR_SHAPES } from '../../constants/shapes'
import type { ScaleDegree } from '../../types'

const ALL_DEGREES_VISIBLE = Object.fromEntries(
  (['1', '2', 'b3', '3', '4', 'b5', '5', 'b6', '6', 'b7', '7'] as ScaleDegree[]).map(d => [d, true])
) as Record<ScaleDegree, boolean>

export function FretboardDemo() {
  return (
    <div style={{ padding: 32, fontFamily: 'sans-serif', background: '#F7FAFC', minHeight: '100vh' }}>
      <h1 style={{ color: '#1A202C', marginBottom: 8 }}>Fretboard Component Demo</h1>
      <p style={{ color: '#718096', marginBottom: 32 }}>A minor pentatonic — all 5 positions</p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
        {AMINOR_SHAPES.map((shape, i) => (
          <div key={shape.id} style={{
            background: 'white',
            borderRadius: 12,
            padding: 24,
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
          }}>
            <h2 style={{ color: '#2D3748', marginBottom: 16, fontSize: 16 }}>
              {shape.label} <span style={{ color: '#A0AEC0', fontWeight: 400 }}>baseFret {shape.baseFret}</span>
            </h2>
            <Fretboard
              shape={shape}
              scaleDegreeVisibility={ALL_DEGREES_VISIBLE}
              width={480}
              height={200}
            />
          </div>
        ))}
      </div>

      <div style={{ marginTop: 40 }}>
        <h2 style={{ color: '#2D3748', marginBottom: 16 }}>Degree visibility demo (Position 1 — root hidden)</h2>
        <div style={{
          background: 'white',
          borderRadius: 12,
          padding: 24,
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
        }}>
          <Fretboard
            shape={AMINOR_SHAPES[0]}
            scaleDegreeVisibility={{
              ...ALL_DEGREES_VISIBLE,
              '1': false,
            }}
            width={480}
            height={200}
          />
          <p style={{ color: '#718096', marginTop: 8, fontSize: 13 }}>
            Root dots (red) rendered at 20% opacity when visibility is false
          </p>
        </div>
      </div>
    </div>
  )
}

export default FretboardDemo
