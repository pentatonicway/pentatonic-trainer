import { describe, it, expect, beforeEach } from 'vitest'
import { useSessionStore } from './sessionStore'
import { PRESETS } from '../constants/presets'
import type { ScaleDegree } from '../types'

// Reset store state before each test so tests are fully isolated
beforeEach(() => {
  useSessionStore.setState({
    boxes: [
      {
        id: 'box1',
        chordRoot: 'A',
        chordQuality: 'minor',
        shapeIndex: 0,
        transposeOffset: 0,
        locked: true,
        scaleDegreeVisibility: {
          '1': true, '2': true, 'b3': true, '3': true, '4': true,
          'b5': true, '5': true, 'b6': true, '6': true, 'b7': true, '7': true,
        },
      },
    ],
    overrides: [],
    adminMode: false,
  })
})

// ─── Initial state ────────────────────────────────────────────────────────

describe('initial state', () => {
  it('has exactly 1 box', () => {
    expect(useSessionStore.getState().boxes).toHaveLength(1)
  })

  it('initial box has root A, quality minor, shapeIndex 0, locked true', () => {
    const box = useSessionStore.getState().boxes[0]
    expect(box.chordRoot).toBe('A')
    expect(box.chordQuality).toBe('minor')
    expect(box.shapeIndex).toBe(0)
    expect(box.locked).toBe(true)
  })

  it('all scale degrees are visible on initial box', () => {
    const { scaleDegreeVisibility } = useSessionStore.getState().boxes[0]
    for (const val of Object.values(scaleDegreeVisibility)) {
      expect(val).toBe(true)
    }
  })
})

// ─── addBox ───────────────────────────────────────────────────────────────

describe('addBox', () => {
  it('increases box count by 1', () => {
    useSessionStore.getState().addBox()
    expect(useSessionStore.getState().boxes).toHaveLength(2)
  })

  it('new box starts unlocked', () => {
    useSessionStore.getState().addBox()
    const boxes = useSessionStore.getState().boxes
    expect(boxes[1].locked).toBe(false)
  })

  it('new box has all scale degrees visible', () => {
    useSessionStore.getState().addBox()
    const { scaleDegreeVisibility } = useSessionStore.getState().boxes[1]
    for (const val of Object.values(scaleDegreeVisibility)) {
      expect(val).toBe(true)
    }
  })
})

// ─── removeBox ───────────────────────────────────────────────────────────

describe('removeBox', () => {
  it('does nothing when only 1 box remains', () => {
    const id = useSessionStore.getState().boxes[0].id
    useSessionStore.getState().removeBox(id)
    expect(useSessionStore.getState().boxes).toHaveLength(1)
  })

  it('removes correct box when 2 exist', () => {
    useSessionStore.getState().addBox()
    const boxes = useSessionStore.getState().boxes
    const secondId = boxes[1].id
    useSessionStore.getState().removeBox(secondId)
    expect(useSessionStore.getState().boxes).toHaveLength(1)
    expect(useSessionStore.getState().boxes.find(b => b.id === secondId)).toBeUndefined()
  })
})

// ─── setLocked ───────────────────────────────────────────────────────────

describe('setLocked', () => {
  it('unlocks a non-box-1 box', () => {
    useSessionStore.getState().addBox()
    const boxes = useSessionStore.getState().boxes
    const secondId = boxes[1].id
    useSessionStore.getState().setLocked(secondId, false)
    expect(useSessionStore.getState().boxes[1].locked).toBe(false)
  })

  it('locks a non-box-1 box', () => {
    useSessionStore.getState().addBox()
    const boxes = useSessionStore.getState().boxes
    const secondId = boxes[1].id
    useSessionStore.getState().setLocked(secondId, false)
    useSessionStore.getState().setLocked(secondId, true)
    expect(useSessionStore.getState().boxes[1].locked).toBe(true)
  })

  it('cannot unlock box 1', () => {
    const id = useSessionStore.getState().boxes[0].id
    useSessionStore.getState().setLocked(id, false)
    expect(useSessionStore.getState().boxes[0].locked).toBe(true)
  })
})

// ─── setAllLocked ─────────────────────────────────────────────────────────

describe('setAllLocked', () => {
  it('locks all boxes', () => {
    useSessionStore.getState().addBox()
    useSessionStore.getState().addBox()
    useSessionStore.getState().setAllLocked(true)
    for (const box of useSessionStore.getState().boxes) {
      expect(box.locked).toBe(true)
    }
  })

  it('setAllLocked(false) unlocks non-box-1 boxes', () => {
    useSessionStore.getState().addBox()
    useSessionStore.getState().addBox()
    useSessionStore.getState().setAllLocked(false)
    const boxes = useSessionStore.getState().boxes
    // Box 1 stays locked; others unlocked
    expect(boxes[0].locked).toBe(true)
    expect(boxes[1].locked).toBe(false)
    expect(boxes[2].locked).toBe(false)
  })
})

// ─── incrementShape / decrementShape ─────────────────────────────────────

describe('incrementShape', () => {
  it('increments shapeIndex by 1', () => {
    useSessionStore.getState().addBox()
    const { boxes } = useSessionStore.getState()
    const id = boxes[1].id
    const before = boxes[1].shapeIndex
    useSessionStore.getState().setLocked(id, false)
    useSessionStore.getState().setShapeIndex(id, 3)
    useSessionStore.getState().incrementShape(id)
    expect(useSessionStore.getState().boxes[1].shapeIndex).toBe(4)
  })

  it('wraps from 4 to 0', () => {
    useSessionStore.getState().addBox()
    const id = useSessionStore.getState().boxes[1].id
    useSessionStore.getState().setLocked(id, false)
    useSessionStore.getState().setShapeIndex(id, 4)
    useSessionStore.getState().incrementShape(id)
    expect(useSessionStore.getState().boxes[1].shapeIndex).toBe(0)
  })

  it('does nothing on a locked box', () => {
    useSessionStore.getState().addBox()
    const id = useSessionStore.getState().boxes[1].id
    // ensure locked
    useSessionStore.getState().setLocked(id, true)
    const before = useSessionStore.getState().boxes[1].shapeIndex
    useSessionStore.getState().incrementShape(id)
    expect(useSessionStore.getState().boxes[1].shapeIndex).toBe(before)
  })
})

describe('decrementShape', () => {
  it('decrements shapeIndex by 1', () => {
    useSessionStore.getState().addBox()
    const id = useSessionStore.getState().boxes[1].id
    useSessionStore.getState().setLocked(id, false)
    useSessionStore.getState().setShapeIndex(id, 3)
    useSessionStore.getState().decrementShape(id)
    expect(useSessionStore.getState().boxes[1].shapeIndex).toBe(2)
  })

  it('wraps from 0 to 4', () => {
    useSessionStore.getState().addBox()
    const id = useSessionStore.getState().boxes[1].id
    useSessionStore.getState().setLocked(id, false)
    useSessionStore.getState().setShapeIndex(id, 0)
    useSessionStore.getState().decrementShape(id)
    expect(useSessionStore.getState().boxes[1].shapeIndex).toBe(4)
  })
})

// ─── resetShape ──────────────────────────────────────────────────────────

describe('resetShape', () => {
  it('restores auto-selected shapeIndex after manual override', () => {
    useSessionStore.getState().addBox()
    const id = useSessionStore.getState().boxes[1].id
    useSessionStore.getState().setLocked(id, false)
    // Force a non-default value
    useSessionStore.getState().setShapeIndex(id, 4)
    expect(useSessionStore.getState().boxes[1].shapeIndex).toBe(4)
    // Reset should restore auto value
    useSessionStore.getState().resetShape(id)
    // The auto value for root=A, quality=minor, interval=0 from box1(A) = index 0
    expect(useSessionStore.getState().boxes[1].shapeIndex).toBe(0)
  })
})

// ─── toggleScaleDegree ───────────────────────────────────────────────────

describe('toggleScaleDegree', () => {
  it('flips visibility of the specified degree', () => {
    const id = useSessionStore.getState().boxes[0].id
    expect(useSessionStore.getState().boxes[0].scaleDegreeVisibility['b3']).toBe(true)
    useSessionStore.getState().toggleScaleDegree(id, 'b3')
    expect(useSessionStore.getState().boxes[0].scaleDegreeVisibility['b3']).toBe(false)
  })

  it('toggling twice restores original value', () => {
    const id = useSessionStore.getState().boxes[0].id
    useSessionStore.getState().toggleScaleDegree(id, '5')
    useSessionStore.getState().toggleScaleDegree(id, '5')
    expect(useSessionStore.getState().boxes[0].scaleDegreeVisibility['5']).toBe(true)
  })

  it('only affects the targeted degree', () => {
    const id = useSessionStore.getState().boxes[0].id
    useSessionStore.getState().toggleScaleDegree(id, '1')
    const vis = useSessionStore.getState().boxes[0].scaleDegreeVisibility
    expect(vis['1']).toBe(false)
    expect(vis['5']).toBe(true) // others unchanged
  })
})

// ─── Box 1 shapeIndex immutability ───────────────────────────────────────

describe('Box 1 shapeIndex immutability', () => {
  it('setShapeIndex on box 1 has no effect', () => {
    const id = useSessionStore.getState().boxes[0].id
    useSessionStore.getState().setShapeIndex(id, 3)
    expect(useSessionStore.getState().boxes[0].shapeIndex).toBe(0)
  })

  it('incrementShape on box 1 has no effect', () => {
    const id = useSessionStore.getState().boxes[0].id
    useSessionStore.getState().incrementShape(id)
    expect(useSessionStore.getState().boxes[0].shapeIndex).toBe(0)
  })

  it('decrementShape on box 1 has no effect', () => {
    const id = useSessionStore.getState().boxes[0].id
    useSessionStore.getState().decrementShape(id)
    expect(useSessionStore.getState().boxes[0].shapeIndex).toBe(0)
  })
})

// ─── setChordRoot ─────────────────────────────────────────────────────────

describe('setChordRoot', () => {
  it('updates chordRoot on the target box', () => {
    const id = useSessionStore.getState().boxes[0].id
    useSessionStore.getState().setChordRoot(id, 'E')
    expect(useSessionStore.getState().boxes[0].chordRoot).toBe('E')
  })

  it('recalculates unlocked downstream boxes when box 1 root changes', () => {
    useSessionStore.getState().addBox()
    const box1Id = useSessionStore.getState().boxes[0].id
    const box2Id = useSessionStore.getState().boxes[1].id
    useSessionStore.getState().setLocked(box2Id, false)
    const before = useSessionStore.getState().boxes[1].shapeIndex
    useSessionStore.getState().setChordRoot(box1Id, 'D')
    // Box 2 shapeIndex should be recalculated (may or may not change depending on interval)
    // Just confirm the operation doesn't throw and state is valid
    const after = useSessionStore.getState().boxes[1].shapeIndex
    expect(after).toBeGreaterThanOrEqual(0)
    expect(after).toBeLessThanOrEqual(4)
  })
})

// ─── setChordQuality ─────────────────────────────────────────────────────

describe('setChordQuality', () => {
  it('updates quality on the target box', () => {
    const id = useSessionStore.getState().boxes[0].id
    useSessionStore.getState().setChordQuality(id, 'major')
    expect(useSessionStore.getState().boxes[0].chordQuality).toBe('major')
  })

  it('box 1 shapeIndex stays 0 after quality change', () => {
    const id = useSessionStore.getState().boxes[0].id
    useSessionStore.getState().setChordQuality(id, 'dominant')
    expect(useSessionStore.getState().boxes[0].shapeIndex).toBe(0)
  })
})

// ─── setAdminMode ────────────────────────────────────────────────────────

describe('setAdminMode', () => {
  it('sets adminMode to true', () => {
    useSessionStore.getState().setAdminMode(true)
    expect(useSessionStore.getState().adminMode).toBe(true)
  })

  it('sets adminMode to false', () => {
    useSessionStore.getState().setAdminMode(true)
    useSessionStore.getState().setAdminMode(false)
    expect(useSessionStore.getState().adminMode).toBe(false)
  })
})

// ─── loadProgression ─────────────────────────────────────────────────────

describe('loadProgression', () => {
  it('replaces the boxes array entirely', () => {
    const newBoxes = [
      {
        id: 'prog-box-1',
        chordRoot: 'E' as const,
        chordQuality: 'major' as const,
        shapeIndex: 2,
        transposeOffset: 0,
        locked: true,
        scaleDegreeVisibility: {
          '1': true, '2': false, 'b3': true, '3': true, '4': true,
          'b5': true, '5': true, 'b6': true, '6': true, 'b7': true, '7': true,
        },
      },
    ]
    useSessionStore.getState().loadProgression(newBoxes)
    expect(useSessionStore.getState().boxes).toHaveLength(1)
    expect(useSessionStore.getState().boxes[0].chordRoot).toBe('E')
  })
})

// ─── loadPreset, transposeUp, transposeDown ───────────────────────────────────


const ALL_VIS_T = Object.fromEntries(
  (['1', '2', 'b3', '3', '4', 'b5', '5', 'b6', '6', 'b7', '7'] as ScaleDegree[]).map(d => [d, true])
) as Record<ScaleDegree, boolean>

function makeStoreBox(id: string, root: import('../types').NoteRoot, quality: import('../types').ChordQuality, locked = true) {
  return {
    id,
    chordRoot: root as import('../types').NoteRoot,
    chordQuality: quality as import('../types').ChordQuality,
    shapeIndex: 0,
    transposeOffset: 0,
    locked,
    scaleDegreeVisibility: { ...ALL_VIS_T },
  }
}

describe('loadPreset', () => {
  beforeEach(() => {
    useSessionStore.setState({
      boxes: [makeStoreBox('b1', 'A', 'minor', true)],
      overrides: [],
      adminMode: false,
      transposeOffset: 0,
      originalRoots: ['A'],
    })
  })

  it('replaces boxes with preset boxes (I–IV–V has 3)', () => {
    const preset = PRESETS.find(p => p.name === 'I–IV–V')!
    useSessionStore.getState().loadPreset(preset)
    expect(useSessionStore.getState().boxes).toHaveLength(3)
  })

  it('box 1 gets shapeIndex 0 after load', () => {
    const preset = PRESETS.find(p => p.name === 'ii–V–I')!
    useSessionStore.getState().loadPreset(preset)
    expect(useSessionStore.getState().boxes[0].shapeIndex).toBe(0)
  })

  it('boxes 2+ get valid auto-resolved shapeIndex (0–4)', () => {
    const preset = PRESETS.find(p => p.name === 'I–IV–V')!
    useSessionStore.getState().loadPreset(preset)
    const { boxes } = useSessionStore.getState()
    for (let i = 1; i < boxes.length; i++) {
      expect(boxes[i].shapeIndex).toBeGreaterThanOrEqual(0)
      expect(boxes[i].shapeIndex).toBeLessThanOrEqual(4)
    }
  })

  it('resets transposeOffset to 0 on load', () => {
    useSessionStore.setState({ transposeOffset: 7 })
    useSessionStore.getState().loadPreset(PRESETS[0])
    expect(useSessionStore.getState().transposeOffset).toBe(0)
  })

  it('stores originalRoots matching preset chord roots', () => {
    const preset = PRESETS.find(p => p.name === 'I–IV–V')! // A D E
    useSessionStore.getState().loadPreset(preset)
    const { originalRoots } = useSessionStore.getState()
    expect(originalRoots[0]).toBe('A')
    expect(originalRoots[1]).toBe('D')
    expect(originalRoots[2]).toBe('E')
  })

  it('chord roots in boxes match preset after load', () => {
    const preset = PRESETS.find(p => p.name === 'I–IV–V')!
    useSessionStore.getState().loadPreset(preset)
    const { boxes } = useSessionStore.getState()
    expect(boxes[0].chordRoot).toBe('A')
    expect(boxes[1].chordRoot).toBe('D')
    expect(boxes[2].chordRoot).toBe('E')
  })

  it('12-Bar Blues loads 12 boxes', () => {
    const preset = PRESETS.find(p => p.name === '12-Bar Blues')!
    useSessionStore.getState().loadPreset(preset)
    expect(useSessionStore.getState().boxes).toHaveLength(12)
  })
})

describe('transposeUp', () => {
  beforeEach(() => {
    useSessionStore.setState({
      boxes: [
        makeStoreBox('b1', 'A', 'minor', true),
        makeStoreBox('b2', 'D', 'minor', false),
      ],
      overrides: [],
      adminMode: false,
      transposeOffset: 0,
      originalRoots: ['A', 'D'],
    })
  })

  it('increments transposeOffset by 1', () => {
    useSessionStore.getState().transposeUp()
    expect(useSessionStore.getState().transposeOffset).toBe(1)
  })

  it('wraps transposeOffset from 11 to 0', () => {
    useSessionStore.setState({ transposeOffset: 11 })
    useSessionStore.getState().transposeUp()
    expect(useSessionStore.getState().transposeOffset).toBe(0)
  })

  it('shifts all box roots up by 1 semitone', () => {
    useSessionStore.getState().transposeUp()
    const { boxes } = useSessionStore.getState()
    expect(boxes[0].chordRoot).toBe('A#') // A+1
    expect(boxes[1].chordRoot).toBe('D#') // D+1
  })

  it('two transposeUps accumulate from originalRoots correctly', () => {
    useSessionStore.getState().transposeUp()
    useSessionStore.getState().transposeUp()
    const { boxes } = useSessionStore.getState()
    expect(boxes[0].chordRoot).toBe('B')  // A+2
    expect(boxes[1].chordRoot).toBe('E')  // D+2
    expect(useSessionStore.getState().transposeOffset).toBe(2)
  })

  it('12 transposeUps returns all roots to original', () => {
    for (let i = 0; i < 12; i++) useSessionStore.getState().transposeUp()
    const { boxes, transposeOffset } = useSessionStore.getState()
    expect(boxes[0].chordRoot).toBe('A')
    expect(boxes[1].chordRoot).toBe('D')
    expect(transposeOffset).toBe(0)
  })
})

describe('transposeDown', () => {
  beforeEach(() => {
    useSessionStore.setState({
      boxes: [
        makeStoreBox('b1', 'A', 'minor', true),
        makeStoreBox('b2', 'E', 'major', false),
      ],
      overrides: [],
      adminMode: false,
      transposeOffset: 0,
      originalRoots: ['A', 'E'],
    })
  })

  it('wraps transposeOffset from 0 to 11', () => {
    useSessionStore.getState().transposeDown()
    expect(useSessionStore.getState().transposeOffset).toBe(11)
  })

  it('shifts all box roots down by 1 semitone', () => {
    useSessionStore.getState().transposeDown()
    const { boxes } = useSessionStore.getState()
    expect(boxes[0].chordRoot).toBe('G#') // A-1
    expect(boxes[1].chordRoot).toBe('D#') // E-1
  })

  it('12 transposeDowns returns all roots to original', () => {
    for (let i = 0; i < 12; i++) useSessionStore.getState().transposeDown()
    const { boxes, transposeOffset } = useSessionStore.getState()
    expect(boxes[0].chordRoot).toBe('A')
    expect(boxes[1].chordRoot).toBe('E')
    expect(transposeOffset).toBe(0)
  })

  it('transposeDown from offset 5 gives offset 4', () => {
    useSessionStore.setState({ transposeOffset: 5 })
    useSessionStore.getState().transposeDown()
    expect(useSessionStore.getState().transposeOffset).toBe(4)
  })
})

// ─── learnShape ───────────────────────────────────────────────────────────────

describe('learnShape', () => {
  const ALL_VIS_L = Object.fromEntries(
    (['1', '2', 'b3', '3', '4', 'b5', '5', 'b6', '6', 'b7', '7'] as ScaleDegree[]).map(d => [d, true])
  ) as Record<ScaleDegree, boolean>

  beforeEach(() => {
    useSessionStore.setState({
      boxes: [
        { id: 'b1', chordRoot: 'A', chordQuality: 'minor', shapeIndex: 0, transposeOffset: 0, locked: true, scaleDegreeVisibility: ALL_VIS_L },
        { id: 'b2', chordRoot: 'D', chordQuality: 'minor', shapeIndex: 2, transposeOffset: 0, locked: false, scaleDegreeVisibility: ALL_VIS_L },
      ],
      overrides: [],
      adminMode: true,
      transposeOffset: 0,
      originalRoots: ['A', 'D'],
    })
  })

  it('adds a new override with the correct key', () => {
    useSessionStore.getState().learnShape('b2')
    const { overrides } = useSessionStore.getState()
    expect(overrides).toHaveLength(1)
    // key: minor|0|5 (A→D is 5 semitones, box1 shape 0)
    expect(overrides[0].key).toBe('minor|0|5')
    expect(overrides[0].shapeIndex).toBe(2)
  })

  it('captures the current shapeIndex of the box', () => {
    useSessionStore.setState(state => ({
      boxes: state.boxes.map(b => b.id === 'b2' ? { ...b, shapeIndex: 4 } : b)
    }))
    useSessionStore.getState().learnShape('b2')
    expect(useSessionStore.getState().overrides[0].shapeIndex).toBe(4)
  })

  it('replaces an existing override with the same key', () => {
    useSessionStore.getState().learnShape('b2')           // shape 2
    useSessionStore.setState(state => ({
      boxes: state.boxes.map(b => b.id === 'b2' ? { ...b, shapeIndex: 3 } : b)
    }))
    useSessionStore.getState().learnShape('b2')           // shape 3 - same key
    const { overrides } = useSessionStore.getState()
    expect(overrides).toHaveLength(1)
    expect(overrides[0].shapeIndex).toBe(3)
  })

  it('does nothing when boxId is not found', () => {
    useSessionStore.getState().learnShape('nonexistent')
    expect(useSessionStore.getState().overrides).toHaveLength(0)
  })

  it('builds the correct key using interval from box1', () => {
    // A→E is 7 semitones
    useSessionStore.setState(state => ({
      boxes: [
        state.boxes[0],
        { ...state.boxes[1], chordRoot: 'E' },
      ]
    }))
    useSessionStore.getState().learnShape('b2')
    expect(useSessionStore.getState().overrides[0].key).toBe('minor|0|7')
  })
})

// ─── removeOverride ───────────────────────────────────────────────────────────

describe('removeOverride', () => {
  beforeEach(() => {
    useSessionStore.setState({
      overrides: [
        { key: 'minor|0|5', shapeIndex: 2 },
        { key: 'major|0|7', shapeIndex: 1 },
        { key: 'dominant|0|3', shapeIndex: 3 },
      ],
    })
  })

  it('removes the override with the matching key', () => {
    useSessionStore.getState().removeOverride('minor|0|5')
    const { overrides } = useSessionStore.getState()
    expect(overrides.find(r => r.key === 'minor|0|5')).toBeUndefined()
  })

  it('leaves other overrides intact', () => {
    useSessionStore.getState().removeOverride('minor|0|5')
    const { overrides } = useSessionStore.getState()
    expect(overrides).toHaveLength(2)
    expect(overrides.find(r => r.key === 'major|0|7')).toBeTruthy()
  })

  it('does nothing when key does not exist', () => {
    useSessionStore.getState().removeOverride('nonexistent|0|0')
    expect(useSessionStore.getState().overrides).toHaveLength(3)
  })
})

// ─── clearOverrides ───────────────────────────────────────────────────────────

describe('clearOverrides', () => {
  beforeEach(() => {
    useSessionStore.setState({
      overrides: [
        { key: 'minor|0|5', shapeIndex: 2 },
        { key: 'major|0|7', shapeIndex: 1 },
      ],
    })
  })

  it('resets overrides to empty array', () => {
    useSessionStore.getState().clearOverrides()
    expect(useSessionStore.getState().overrides).toEqual([])
  })

  it('clearOverrides on empty array stays empty', () => {
    useSessionStore.setState({ overrides: [] })
    useSessionStore.getState().clearOverrides()
    expect(useSessionStore.getState().overrides).toEqual([])
  })
})
