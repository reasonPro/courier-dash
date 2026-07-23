import { describe, expect, it } from "vitest"

import { calculateWorkedHours } from "../lib/work-hours"

describe("calculateWorkedHours", () => {
  it("calculates a daytime shift without breaks", () => {
    expect(calculateWorkedHours("09:00", "17:00", [])).toBe(8)
  })

  it("subtracts completed breaks", () => {
    expect(
      calculateWorkedHours("09:00", "17:00", [
        { start: "12:00", end: "12:30" },
        { start: "15:00", end: "15:15" },
      ]),
    ).toBe(7.25)
  })

  it("supports a shift and breaks that cross midnight", () => {
    expect(
      calculateWorkedHours("22:00", "02:00", [
        { start: "23:30", end: "00:00" },
        { start: "00:30", end: "01:00" },
      ]),
    ).toBe(3)
  })

  it("ignores an incomplete break as the existing form does", () => {
    expect(
      calculateWorkedHours("09:00", "17:00", [
        { start: "12:00", end: "" },
      ]),
    ).toBe(8)
  })
})
