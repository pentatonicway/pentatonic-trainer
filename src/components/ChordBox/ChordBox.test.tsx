import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { ChordBox } from "./ChordBox";
import type { BoxData, ScaleDegree } from "../../types";

// ─── Fixtures ────────────────────────────────────────────────────────────────

const ALL_VISIBLE = Object.fromEntries(
  (
    ["1", "2", "b3", "3", "4", "b5", "5", "b6", "6", "b7", "7"] as ScaleDegree[]
  ).map((d) => [d, true])
) as Record<ScaleDegree, boolean>;

function makeBox(overrides: Partial<BoxData> = {}): BoxData {
  return {
    id: "test-box-id",
    chordRoot: "A",
    chordQuality: "minor",
    shapeIndex: 0,
    transposeOffset: 0,
    locked: false,
    scaleDegreeVisibility: { ...ALL_VISIBLE },
    ...overrides,
  };
}

function makeCallbacks() {
  return {
    onLockToggle: vi.fn(),
    onPrevShape: vi.fn(),
    onNextShape: vi.fn(),
    onResetShape: vi.fn(),
    onToggleDegree: vi.fn(),
    onToggleAllDegrees: vi.fn(),
    onChordSelect: vi.fn(),
  };
}

function renderBox(box: BoxData, boxIndex = 1, cbs = makeCallbacks()) {
  return {
    ...render(<ChordBox box={box} boxIndex={boxIndex} {...cbs} />),
    cbs,
  };
}

// ─── Tests ───────────────────────────────────────────────────────────────────

describe("ChordBox", () => {
  // ── Chord name rendering ──────────────────────────────────────────────────

  describe("chord name", () => {
    it('renders "A Minor" for root=A, quality=minor', () => {
      renderBox(makeBox({ chordRoot: "A", chordQuality: "minor" }));
      const el = screen.getByTestId("chord-name");
      expect(el.textContent).toContain("A");
      expect(el.textContent).toContain("MIN");
    });

    it('renders "C Major" for root=C, quality=major', () => {
      renderBox(makeBox({ chordRoot: "C", chordQuality: "major" }));
      const el = screen.getByTestId("chord-name");
      expect(el.textContent).toContain("C");
      expect(el.textContent).toContain("MAJ");
    });

    it('renders "E Dominant" for root=E, quality=dominant', () => {
      renderBox(makeBox({ chordRoot: "E", chordQuality: "dominant" }));
      const el = screen.getByTestId("chord-name");
      expect(el.textContent).toContain("E");
      expect(el.textContent).toContain("DOM");
    });

    it("capitalizes quality correctly", () => {
      renderBox(makeBox({ chordQuality: "minor" }));
      const text = screen.getByTestId("chord-name").textContent ?? "";
      expect(text[text.indexOf(" ") + 1]).toMatch(/[A-Z]/);
    });
  });

  // ── Lock button ───────────────────────────────────────────────────────────

  describe("lock button", () => {
    it("calls onLockToggle with correct id when clicked", () => {
      const box = makeBox({ id: "my-box-id", locked: false });
      const { cbs } = renderBox(box);
      fireEvent.click(screen.getByTestId("lock-btn"));
      expect(cbs.onLockToggle).toHaveBeenCalledWith("my-box-id");
    });

    it("shows lock icon (🔒) when box is locked", () => {
      renderBox(makeBox({ locked: true }));
      expect(screen.getByTestId("lock-btn").textContent).toBe("🔒");
    });

    it("shows unlock icon (🔓) when box is unlocked", () => {
      renderBox(makeBox({ locked: false }));
      expect(screen.getByTestId("lock-btn").textContent).toBe("🔓");
    });

    it("is NOT present for Box 1 (boxIndex 0)", () => {
      renderBox(makeBox(), 0);
      expect(screen.queryByTestId("lock-btn")).toBeNull();
    });

    it("IS present for boxIndex > 0", () => {
      renderBox(makeBox(), 1);
      expect(screen.getByTestId("lock-btn")).toBeTruthy();
    });
  });

  // ── Prev / Next buttons ───────────────────────────────────────────────────

  describe("Prev / Next shape buttons", () => {
    it("calls onPrevShape with box id when unlocked", () => {
      const box = makeBox({ id: "abc", locked: false });
      const { cbs } = renderBox(box);
      fireEvent.click(screen.getByTestId("prev-btn"));
      expect(cbs.onPrevShape).toHaveBeenCalledWith("abc");
    });

    it("calls onNextShape with box id when unlocked", () => {
      const box = makeBox({ id: "abc", locked: false });
      const { cbs } = renderBox(box);
      fireEvent.click(screen.getByTestId("next-btn"));
      expect(cbs.onNextShape).toHaveBeenCalledWith("abc");
    });

    it("prev button is disabled when locked", () => {
      renderBox(makeBox({ locked: true }));
      expect(screen.getByTestId("prev-btn")).toBeDisabled();
    });

    it("next button is disabled when locked", () => {
      renderBox(makeBox({ locked: true }));
      expect(screen.getByTestId("next-btn")).toBeDisabled();
    });

    it("prev button is NOT disabled when unlocked", () => {
      renderBox(makeBox({ locked: false }));
      expect(screen.getByTestId("prev-btn")).not.toBeDisabled();
    });

    it("next button is NOT disabled when unlocked", () => {
      renderBox(makeBox({ locked: false }));
      expect(screen.getByTestId("next-btn")).not.toBeDisabled();
    });

    it("does NOT call onPrevShape when button is disabled (locked)", () => {
      const box = makeBox({ locked: true });
      const { cbs } = renderBox(box);
      fireEvent.click(screen.getByTestId("prev-btn"));
      expect(cbs.onPrevShape).not.toHaveBeenCalled();
    });

    it("does NOT call onNextShape when button is disabled (locked)", () => {
      const box = makeBox({ locked: true });
      const { cbs } = renderBox(box);
      fireEvent.click(screen.getByTestId("next-btn"));
      expect(cbs.onNextShape).not.toHaveBeenCalled();
    });
  });

  // ── Reset button ──────────────────────────────────────────────────────────

  describe("Reset button", () => {
    it("calls onResetShape with box id when unlocked", () => {
      const box = makeBox({ id: "xyz", locked: false });
      const { cbs } = renderBox(box);
      fireEvent.click(screen.getByTestId("reset-btn"));
      expect(cbs.onResetShape).toHaveBeenCalledWith("xyz");
    });

    it("is disabled when box is locked", () => {
      renderBox(makeBox({ locked: true }));
      expect(screen.getByTestId("reset-btn")).toBeDisabled();
    });

    it("does NOT call onResetShape when disabled", () => {
      const box = makeBox({ locked: true });
      const { cbs } = renderBox(box);
      fireEvent.click(screen.getByTestId("reset-btn"));
      expect(cbs.onResetShape).not.toHaveBeenCalled();
    });
  });

  // ── Degree toggle buttons ─────────────────────────────────────────────────

  describe("degree toggle buttons", () => {
    it("does NOT render individual degree toggle buttons (moved to Scale Degree Controls modal)", () => {
      renderBox(makeBox());
      expect(screen.queryByTestId("degree-btn-1")).toBeNull();
      expect(screen.queryByTestId("degree-btn-b3")).toBeNull();
      expect(screen.queryByTestId("degree-btn-4")).toBeNull();
    });

    it("does NOT render degrees not in the shape", () => {
      renderBox(makeBox());
      expect(screen.queryByTestId("degree-btn-2")).toBeNull();
      expect(screen.queryByTestId("degree-btn-3")).toBeNull();
    });
  });

  // ── "All" toggle ──────────────────────────────────────────────────────────

  describe('"All" toggle button', () => {
    it("does NOT render the All button (moved to Scale Degree Controls modal)", () => {
      renderBox(makeBox());
      expect(screen.queryByTestId("all-degrees-btn")).toBeNull();
    });
  });

  // ── Box 1 special rules ───────────────────────────────────────────────────

  describe("Box 1 rules (boxIndex === 0)", () => {
    it("does not show lock button for box 1", () => {
      renderBox(makeBox(), 0);
      expect(screen.queryByTestId("lock-btn")).toBeNull();
    });

    it('shows "CHORD 1" label in badge', () => {
      const { container } = renderBox(makeBox(), 0);
      expect(container.textContent).toContain("CHORD 1");
    });

    it('shows "CHORD 2" label for boxIndex 1', () => {
      const { container } = renderBox(makeBox(), 1);
      expect(container.textContent).toContain("CHORD 2");
    });
  });

  // ── Renders without crashing ──────────────────────────────────────────────

  describe("general rendering", () => {
    it("renders without crashing", () => {
      expect(() => renderBox(makeBox())).not.toThrow();
    });

    it("renders an SVG fretboard inside", () => {
      const { container } = renderBox(makeBox());
      expect(container.querySelector("svg")).toBeTruthy();
    });

    it("renders correctly for major quality", () => {
      expect(() =>
        renderBox(makeBox({ chordQuality: "major", chordRoot: "G" }))
      ).not.toThrow();
    });

    it("renders correctly for dominant quality", () => {
      expect(() =>
        renderBox(makeBox({ chordQuality: "dominant", chordRoot: "D" }))
      ).not.toThrow();
    });
  });
});
