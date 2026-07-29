import { describe, expect, it } from "vitest";

import { getNextLandingTabIndex } from "../lib/landing-tabs";

describe("getNextLandingTabIndex", () => {
  it("moves right and wraps to the first tab", () => {
    expect(getNextLandingTabIndex(3, "ArrowRight", 4)).toBe(0);
  });

  it("moves left and wraps to the last tab", () => {
    expect(getNextLandingTabIndex(0, "ArrowLeft", 4)).toBe(3);
  });

  it("moves to the first tab with Home", () => {
    expect(getNextLandingTabIndex(2, "Home", 4)).toBe(0);
  });

  it("moves to the last tab with End", () => {
    expect(getNextLandingTabIndex(1, "End", 4)).toBe(3);
  });
});
