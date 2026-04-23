import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { Toolbar } from "./Toolbar";

function renderToolbar(
  overrides: Partial<React.ComponentProps<typeof Toolbar>> = {}
) {
  const cbs = {
    onNeckUp: vi.fn(),
    onNeckDown: vi.fn(),
    onTransposeUp: vi.fn(),
    onTransposeDown: vi.fn(),
    onSetCardCount: vi.fn(),
    onOpenPopular: vi.fn(),
    onToggleLibrary: vi.fn(),
    onOpenScaleDegrees: vi.fn(),
    onToggleTheme: vi.fn(),
  };
  const props = {
    neckPosition: 1,
    currentKey: "A",
    cardCount: 4,
    ...cbs,
    ...overrides,
  };
  const result = render(<Toolbar {...props} />);
  return { ...result, cbs };
}

describe("Toolbar", () => {
  it("renders without crashing", () => {
    expect(() => renderToolbar()).not.toThrow();
  });

  it("renders the Popular button", () => {
    renderToolbar();
    expect(screen.getByTestId("open-popular-btn")).toBeTruthy();
  });

  it("renders the Library button", () => {
    renderToolbar();
    expect(screen.getByTestId("toggle-library-btn")).toBeTruthy();
  });

  it("renders the Scale Degree Controls button", () => {
    renderToolbar();
    expect(screen.getByTestId("open-scale-degrees-btn")).toBeTruthy();
  });

  it("renders the neck position display", () => {
    renderToolbar();
    expect(screen.getByTestId("neck-position-display")).toBeTruthy();
  });

  it("renders the neck up and down buttons", () => {
    renderToolbar();
    expect(screen.getByTestId("neck-up-btn")).toBeTruthy();
    expect(screen.getByTestId("neck-down-btn")).toBeTruthy();
  });

  it("renders card count buttons", () => {
    renderToolbar();
    [2, 4, 8, 12, 16].forEach((n) => {
      expect(screen.getByTestId(`card-count-${n}`)).toBeTruthy();
    });
  });

  it("displays neckPosition=1", () => {
    renderToolbar({ neckPosition: 1 });
    expect(screen.getByTestId("neck-position-display").textContent).toBe("1");
  });

  it("displays neckPosition=3", () => {
    renderToolbar({ neckPosition: 3 });
    expect(screen.getByTestId("neck-position-display").textContent).toBe("3");
  });

  it("card-count-4 has aria-pressed=true when cardCount=4", () => {
    renderToolbar({ cardCount: 4 });
    expect(
      screen.getByTestId("card-count-4").getAttribute("aria-pressed")
    ).toBe("true");
  });

  it("card-count-8 has aria-pressed=true when cardCount=8", () => {
    renderToolbar({ cardCount: 8 });
    expect(
      screen.getByTestId("card-count-8").getAttribute("aria-pressed")
    ).toBe("true");
  });

  it("non-active card count buttons have aria-pressed=false", () => {
    renderToolbar({ cardCount: 4 });
    expect(
      screen.getByTestId("card-count-2").getAttribute("aria-pressed")
    ).toBe("false");
    expect(
      screen.getByTestId("card-count-8").getAttribute("aria-pressed")
    ).toBe("false");
  });

  it("neck up button calls onNeckUp", () => {
    const { cbs } = renderToolbar();
    fireEvent.click(screen.getByTestId("neck-up-btn"));
    expect(cbs.onNeckUp).toHaveBeenCalledTimes(1);
  });

  it("neck down button calls onNeckDown", () => {
    const { cbs } = renderToolbar();
    fireEvent.click(screen.getByTestId("neck-down-btn"));
    expect(cbs.onNeckDown).toHaveBeenCalledTimes(1);
  });

  it("neck up does not call onNeckDown", () => {
    const { cbs } = renderToolbar();
    fireEvent.click(screen.getByTestId("neck-up-btn"));
    expect(cbs.onNeckDown).not.toHaveBeenCalled();
  });

  it("neck down does not call onNeckUp", () => {
    const { cbs } = renderToolbar();
    fireEvent.click(screen.getByTestId("neck-down-btn"));
    expect(cbs.onNeckUp).not.toHaveBeenCalled();
  });

  it("Popular button calls onOpenPopular", () => {
    const { cbs } = renderToolbar();
    fireEvent.click(screen.getByTestId("open-popular-btn"));
    expect(cbs.onOpenPopular).toHaveBeenCalledTimes(1);
  });

  it("Library button calls onToggleLibrary", () => {
    const { cbs } = renderToolbar();
    fireEvent.click(screen.getByTestId("toggle-library-btn"));
    expect(cbs.onToggleLibrary).toHaveBeenCalledTimes(1);
  });

  it("Scale Degree Controls button calls onOpenScaleDegrees", () => {
    const { cbs } = renderToolbar();
    fireEvent.click(screen.getByTestId("open-scale-degrees-btn"));
    expect(cbs.onOpenScaleDegrees).toHaveBeenCalledTimes(1);
  });

  it("card count button calls onSetCardCount with correct value", () => {
    const { cbs } = renderToolbar();
    fireEvent.click(screen.getByTestId("card-count-8"));
    expect(cbs.onSetCardCount).toHaveBeenCalledWith(8);
  });

  it("clicking neck up multiple times calls callback multiple times", () => {
    const { cbs } = renderToolbar();
    fireEvent.click(screen.getByTestId("neck-up-btn"));
    fireEvent.click(screen.getByTestId("neck-up-btn"));
    fireEvent.click(screen.getByTestId("neck-up-btn"));
    expect(cbs.onNeckUp).toHaveBeenCalledTimes(3);
  });
});
