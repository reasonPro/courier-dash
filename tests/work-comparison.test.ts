import { describe, expect, it } from "vitest"
import { compareWorkPeriods, comparisonPeriods, localCalendarDate, percentChange } from "../lib/work-comparison"

const taxes = { uber_type: "percent", uber_val: 10, wolt_type: "none", wolt_val: 0, bolt_type: "none", bolt_val: 0, glovo_type: "none", glovo_val: 0 }
const options = { platforms: null, app: true, cash: true, bonus: true, netto: false, taxes, state: "ready" as const }
const rows = [
  { date: "2026-08-10", hours: 10, km: 1, uber: 100, tips_uber: 10, cash_tips_uber: 20, bonuses_uber: 30 },
  { date: "2026-09-10", hours: 5, km: 1, uber: 200, tips_uber: 20, cash_tips_uber: 40, bonuses_uber: 60 },
  { date: "2026-09-20", hours: 100, km: 1, uber: 9999 },
]
describe("Work calendar comparisons", () => {
  it("uses local date getters, not UTC date conversion", () => {
    expect(localCalendarDate(new Date(2026, 8, 20, 0, 1))).toBe("2026-09-20")
  })
  it("compares completed calendar days and handles first day and future", () => {
    expect(comparisonPeriods("2026-09", "2026-09-20")).toMatchObject({ end: "2026-09-19", previousEnd: "2026-08-19", reason: null })
    expect(comparisonPeriods("2026-09", "2026-09-01").reason).toBe("noDays")
    expect(comparisonPeriods("2026-10", "2026-09-20").reason).toBe("future")
  })
  it("handles year rollover, leap February and full historical months", () => {
    expect(comparisonPeriods("2026-01", "2026-01-20").previousStart).toBe("2025-12-01")
    expect(comparisonPeriods("2024-03", "2024-03-31")).toMatchObject({ end: "2024-03-29", previousEnd: "2024-02-29" })
    expect(comparisonPeriods("2026-03", "2026-03-31").end).toBe("2026-03-28")
    expect(comparisonPeriods("2026-03", "2026-09-20")).toMatchObject({ end: "2026-03-31", previousEnd: "2026-02-28" })
  })
  it("uses summed income / summed hours and excludes today from comparisons only", () => {
    const result = compareWorkPeriods(rows, "2026-09", "2026-09-20", options)
    expect(result.income).toMatchObject({ current: 320, previous: 160, percent: 100 })
    expect(result.rate).toMatchObject({ current: 64, previous: 16, percent: 300 })
    expect(rows[2].uber).toBe(9999)
  })
  it("applies flags to both periods and includes previous-only platforms for All", () => {
    const added = [...rows, { date: "2026-08-01", hours: 5, km: 1, wolt: 100 }]
    expect(compareWorkPeriods(added, "2026-09", "2026-09-20", { ...options, app: false, cash: false, bonus: false }).income.previous).toBe(200)
    const filtered = compareWorkPeriods(added, "2026-09", "2026-09-20", { ...options, platforms: ["uber"] })
    expect(filtered.income.previous).toBe(160)
    expect(filtered.rate.reason).toBe("hours")
  })
  it("preserves cash under percent taxes and rejects partial fixed-fee NETTO", () => {
    expect(compareWorkPeriods(rows, "2026-09", "2026-09-20", { ...options, netto: true }).income).toMatchObject({ current: 292, previous: 146 })
    expect(compareWorkPeriods(rows, "2026-09", "2026-09-20", { ...options, netto: true, taxes: { ...taxes, uber_type: "fixed_month" } }).income.reason).toBe("fixed")
    expect(compareWorkPeriods(rows, "2026-09", "2026-09-20", { ...options, netto: true, taxes: null }).income.reason).toBe("taxes")
  })
  it("distinguishes loading, errors, missing records and zero hours", () => {
    for (const state of ["loading", "error"] as const) expect(compareWorkPeriods(rows, "2026-09", "2026-09-20", { ...options, state }).income.reason).toBe(state)
    expect(compareWorkPeriods([], "2026-09", "2026-09-20", options).income.reason).toBe("noRecords")
    expect(compareWorkPeriods(rows.map(r => ({ ...r, hours: 0 })), "2026-09", "2026-09-20", options).rate.reason).toBe("hours")
  })
  it("handles growth, decline, zero and invalid percentage bases without infinity", () => {
    expect(percentChange(110, 100).percent).toBe(10)
    expect(percentChange(90, 100).percent).toBe(-10)
    expect(percentChange(0, 100).percent).toBe(-100)
    expect(percentChange(100, 100).percent).toBe(0)
    expect(percentChange(100, 0).reason).toBe("base")
    expect(percentChange(100, -1).reason).toBe("base")
    expect(percentChange(null, 100).percent).toBeNull()
  })
})
