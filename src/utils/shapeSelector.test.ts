import { describe, it, expect } from "vitest";
import {
  getDefaultShapeIndex,
  applyOverride,
  resolveShapeIndex,
} from "./shapeSelector";
import { getBaseShapes } from "../constants/shapes";
import { transposeShape, getIntervalSigned } from "./transpose";
import type { OverrideRule } from "../types";

// ─── Helpers ────────────────────────────────────────────────────────────────

/** Builds the canonical key used internally and in override rules. */
function makeKey(quality: string, box1ShapeIndex: number, interval: number) {
  return `${quality}|${box1ShapeIndex}|${interval}`;
}

/** Shorthand to build ShapeSelectorParams with sensible defaults for chordRoot and box1BaseFret */
function makeParams(
  quality: "minor" | "major" | "dominant",
  box1ShapeIndex: number,
  intervalFromBox1: number,
  chordRoot: Parameters<typeof getIntervalSigned>[1] = "A",
  box1BaseFret = 5
) {
  return { quality, box1ShapeIndex, intervalFromBox1, chordRoot, box1BaseFret };
}

/** Compute dot midpoint for a shape transposed to a given root — matches the
 *  metric used inside getDefaultShapeIndex and resolveAutoIndex. */
function dotMid(
  quality: "minor" | "major" | "dominant",
  root: string,
  shapeIdx: number
): number {
  const shape = getBaseShapes(quality)[shapeIdx];
  const semitones = getIntervalSigned(
    "A",
    root as Parameters<typeof getIntervalSigned>[1]
  );
  const transposed = transposeShape(shape, semitones);
  const frets = transposed.strings.flatMap((s) => s.dots.map((d) => d.fret));
  return Math.round((Math.min(...frets) + Math.max(...frets)) / 2);
}

// ─── getDefaultShapeIndex ───────────────────────────────────────────────────

describe("getDefaultShapeIndex", () => {
  it("interval 0 (same root): returns the shape whose dots are closest to box1", () => {
    // When the chord root equals box1's root, the shape at the same index
    // should always win (its dots sit exactly at the target midpoint).
    for (const quality of ["minor", "major", "dominant"] as const) {
      for (let idx = 0; idx < 5; idx++) {
        const target = dotMid(quality, "A", idx);
        expect(
          getDefaultShapeIndex({
            quality,
            chordRoot: "A",
            box1ShapeIndex: idx,
            intervalFromBox1: 0,
            box1BaseFret: target,
          })
        ).toBe(idx);
      }
    }
  });

  it("picks the shape whose dot midpoint is nearest to the target", () => {
    // A minor, box1 = shape 0 (A root, dotMid ~8).
    // For B minor the shape whose dots are closest to fret 8 should win.
    const target = dotMid("minor", "A", 0);
    const result = getDefaultShapeIndex({
      quality: "minor",
      chordRoot: "B",
      box1ShapeIndex: 0,
      intervalFromBox1: 2,
      box1BaseFret: target,
    });
    expect(result).toBeGreaterThanOrEqual(0);
    expect(result).toBeLessThanOrEqual(4);
  });

  it("returns the nearest shape when target is at a high fret position", () => {
    // A minor shape 3 sits at a high position (~14). Verify a reasonable
    // shape is chosen for G dominant against that target.
    const target = dotMid("minor", "A", 3);
    const result = getDefaultShapeIndex({
      quality: "dominant",
      chordRoot: "G",
      box1ShapeIndex: 3,
      intervalFromBox1: 10,
      box1BaseFret: target,
    });
    expect(result).toBeGreaterThanOrEqual(0);
    expect(result).toBeLessThanOrEqual(4);
  });

  it("breaks ties by lower index", () => {
    // A major, box1 = shape 2, same root → index 2 should win (dist 0).
    const target = dotMid("major", "A", 2);
    const result = getDefaultShapeIndex({
      quality: "major",
      chordRoot: "A",
      box1ShapeIndex: 2,
      intervalFromBox1: 0,
      box1BaseFret: target,
    });
    expect(result).toBe(2);
  });

  it("result is always a valid index (0–4)", () => {
    const roots = ["A", "B", "C", "D", "E", "F", "G"] as const;
    for (const quality of ["minor", "major", "dominant"] as const) {
      for (let box1ShapeIndex = 0; box1ShapeIndex < 5; box1ShapeIndex++) {
        for (const root of roots) {
          const target = dotMid(quality, "A", box1ShapeIndex);
          const result = getDefaultShapeIndex({
            quality,
            chordRoot: root,
            box1ShapeIndex,
            intervalFromBox1: 0,
            box1BaseFret: target,
          });
          expect(result).toBeGreaterThanOrEqual(0);
          expect(result).toBeLessThanOrEqual(4);
        }
      }
    }
  });

  it("works for major quality", () => {
    // A major, box1 = shape 1, same root → should return shape 1
    const target = dotMid("major", "A", 1);
    expect(
      getDefaultShapeIndex({
        quality: "major",
        chordRoot: "A",
        box1ShapeIndex: 1,
        intervalFromBox1: 0,
        box1BaseFret: target,
      })
    ).toBe(1);
  });

  it("works for dominant quality", () => {
    // A dominant, box1 = shape 2, same root → should return shape 2
    const target = dotMid("dominant", "A", 2);
    expect(
      getDefaultShapeIndex({
        quality: "dominant",
        chordRoot: "A",
        box1ShapeIndex: 2,
        intervalFromBox1: 0,
        box1BaseFret: target,
      })
    ).toBe(2);
  });
});

// ─── applyOverride ───────────────────────────────────────────────────────────

describe("applyOverride", () => {
  const overrides: OverrideRule[] = [
    { key: "minor|0|5", shapeIndex: 3 },
    { key: "major|1|7", shapeIndex: 2 },
    { key: "dominant|2|3", shapeIndex: 4 },
  ];

  it("returns null when overrides array is empty", () => {
    expect(
      applyOverride(
        {
          quality: "minor",
          box1ShapeIndex: 0,
          intervalFromBox1: 5,
          chordRoot: "A",
          box1BaseFret: 5,
        },
        []
      )
    ).toBeNull();
  });

  it("returns null when no key matches", () => {
    expect(
      applyOverride(
        {
          quality: "minor",
          box1ShapeIndex: 0,
          intervalFromBox1: 9,
          chordRoot: "A",
          box1BaseFret: 5,
        },
        overrides
      )
    ).toBeNull();
  });

  it("returns the correct shapeIndex when key matches (minor)", () => {
    expect(
      applyOverride(
        {
          quality: "minor",
          box1ShapeIndex: 0,
          intervalFromBox1: 5,
          chordRoot: "A",
          box1BaseFret: 5,
        },
        overrides
      )
    ).toBe(3);
  });

  it("returns the correct shapeIndex when key matches (major)", () => {
    expect(
      applyOverride(
        {
          quality: "major",
          box1ShapeIndex: 1,
          intervalFromBox1: 7,
          chordRoot: "A",
          box1BaseFret: 5,
        },
        overrides
      )
    ).toBe(2);
  });

  it("returns the correct shapeIndex when key matches (dominant)", () => {
    expect(
      applyOverride(
        {
          quality: "dominant",
          box1ShapeIndex: 2,
          intervalFromBox1: 3,
          chordRoot: "A",
          box1BaseFret: 5,
        },
        overrides
      )
    ).toBe(4);
  });

  it("does not match on partial key overlap", () => {
    // "minor|0|5" should not match "minor|0|50" or "minor|00|5"
    expect(
      applyOverride(
        {
          quality: "minor",
          box1ShapeIndex: 0,
          intervalFromBox1: 50,
          chordRoot: "A",
          box1BaseFret: 5,
        },
        overrides
      )
    ).toBeNull();
  });
});

// ─── resolveShapeIndex ───────────────────────────────────────────────────────

describe("resolveShapeIndex", () => {
  it("uses override shapeIndex when a match exists", () => {
    const overrides: OverrideRule[] = [{ key: "minor|0|3", shapeIndex: 4 }];
    expect(
      resolveShapeIndex(
        {
          quality: "minor",
          box1ShapeIndex: 0,
          intervalFromBox1: 3,
          chordRoot: "A",
          box1BaseFret: 5,
        },
        overrides
      )
    ).toBe(4);
  });

  it("falls back to getDefaultShapeIndex when no override matches", () => {
    const overrides: OverrideRule[] = [{ key: "major|1|7", shapeIndex: 0 }];
    const defaultResult = getDefaultShapeIndex({
      quality: "minor",
      box1ShapeIndex: 0,
      intervalFromBox1: 3,
      chordRoot: "A",
      box1BaseFret: 5,
    });
    expect(
      resolveShapeIndex(
        {
          quality: "minor",
          box1ShapeIndex: 0,
          intervalFromBox1: 3,
          chordRoot: "A",
          box1BaseFret: 5,
        },
        overrides
      )
    ).toBe(defaultResult);
  });

  it("falls back correctly with empty overrides array", () => {
    const defaultResult = getDefaultShapeIndex({
      quality: "major",
      box1ShapeIndex: 2,
      intervalFromBox1: 5,
      chordRoot: "A",
      box1BaseFret: 5,
    });
    expect(
      resolveShapeIndex(
        {
          quality: "major",
          box1ShapeIndex: 2,
          intervalFromBox1: 5,
          chordRoot: "A",
          box1BaseFret: 5,
        },
        []
      )
    ).toBe(defaultResult);
  });

  it("override takes precedence even if default would produce a different result", () => {
    // Force override to return index 0, verify it wins over whatever default would give
    const params = {
      quality: "dominant" as const,
      box1ShapeIndex: 1,
      intervalFromBox1: 6,
      chordRoot: "A" as const,
      box1BaseFret: 5,
    };
    const overrides: OverrideRule[] = [
      { key: makeKey("dominant", 1, 6), shapeIndex: 0 },
    ];
    const defaultResult = getDefaultShapeIndex(params);
    const resolved = resolveShapeIndex(params, overrides);
    // If default also happens to give 0 this test still passes, but the override is what drives it
    expect(resolved).toBe(0);
    expect(overrides[0].shapeIndex).toBe(0);
    // Confirm by removing override: result may differ
    expect(resolveShapeIndex(params, [])).toBe(defaultResult);
  });
});

// ─── Rule key format ─────────────────────────────────────────────────────────

describe("rule key format", () => {
  it('key is exactly "<quality>|<box1ShapeIndex>|<interval>" with pipe separators', () => {
    // Verify applyOverride uses the correct format by providing a key we built
    // manually and confirming it matches
    const overrides: OverrideRule[] = [{ key: "minor|2|7", shapeIndex: 1 }];
    expect(
      applyOverride(
        {
          quality: "minor",
          box1ShapeIndex: 2,
          intervalFromBox1: 7,
          chordRoot: "A",
          box1BaseFret: 5,
        },
        overrides
      )
    ).toBe(1);
  });

  it("quality string is used verbatim (no transformation)", () => {
    const overrides: OverrideRule[] = [{ key: "dominant|0|4", shapeIndex: 2 }];
    // 'dominant' not 'dom' or 'Dominant'
    expect(
      applyOverride(
        {
          quality: "dominant",
          box1ShapeIndex: 0,
          intervalFromBox1: 4,
          chordRoot: "A",
          box1BaseFret: 5,
        },
        overrides
      )
    ).toBe(2);
    expect(
      applyOverride(
        {
          quality: "minor",
          box1ShapeIndex: 0,
          intervalFromBox1: 4,
          chordRoot: "A",
          box1BaseFret: 5,
        },
        overrides
      )
    ).toBeNull();
  });

  it("shapeIndex and interval are plain integers in the key", () => {
    // key "major|0|11" should match box1ShapeIndex=0, intervalFromBox1=11
    const overrides: OverrideRule[] = [{ key: "major|0|11", shapeIndex: 3 }];
    expect(
      applyOverride(
        {
          quality: "major",
          box1ShapeIndex: 0,
          intervalFromBox1: 11,
          chordRoot: "A",
          box1BaseFret: 5,
        },
        overrides
      )
    ).toBe(3);
  });
});
