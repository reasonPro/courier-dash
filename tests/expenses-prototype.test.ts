import { describe, expect, it } from "vitest"

import {
  addCalendarDays,
  calculateExpensesForRange,
  calculateRentalForRange,
  createEmptyExpensesPrototypeState,
  formatMinorUnits,
  getMonthRange,
  hasOverlappingRentalPeriods,
  isCalendarDate,
  isValidPlnInput,
  plnToMinorUnits,
  readExpensesPrototype,
  writeExpensesPrototype,
  type PrototypeRentalPeriod,
  type StorageReaderWriter,
} from "../lib/expenses-prototype"

function rental(
  id: string,
  weeklyAmount: string,
  validFrom: string,
  validTo: string | null,
): PrototypeRentalPeriod {
  return {
    id,
    source: "rental_period",
    weeklyAmount,
    validFrom,
    validTo,
    createdAt: "2026-08-01T10:00:00.000Z",
    updatedAt: "2026-08-01T10:00:00.000Z",
  }
}

describe("Expenses local prototype data layer", () => {
  it("validates exact PLN strings without a JavaScript safe-integer cap", () => {
    expect(isValidPlnInput("9007199254740993.00")).toBe(true)
    expect(isValidPlnInput("19.999")).toBe(false)
    expect(isValidPlnInput("-0.01")).toBe(false)
    expect(
      formatMinorUnits(
        plnToMinorUnits("9007199254740993.00") + plnToMinorUnits("0.01"),
      ),
    ).toBe("9007199254740993.01")
  })

  it("keeps calendar dates local and handles leap-month boundaries", () => {
    expect(isCalendarDate("2028-02-29")).toBe(true)
    expect(isCalendarDate("2027-02-29")).toBe(false)
    expect(addCalendarDays("2028-03-01", -1)).toBe("2028-02-29")
    expect(getMonthRange("2028-02")).toEqual({
      from: "2028-02-01",
      to: "2028-02-29",
    })
  })

  it("keeps rental proration rational until final ROUND_HALF_UP", () => {
    expect(
      calculateRentalForRange(
        [rental("r1", "100.00", "2026-08-01", null)],
        "2026-08-01",
        "2026-08-01",
      ),
    ).toBe("14.29")
  })

  it("uses inclusive rental dates and preserves historical rates", () => {
    const periods = [
      rental("old", "350.00", "2026-08-01", "2026-08-14"),
      rental("new", "420.00", "2026-08-15", null),
    ]
    expect(hasOverlappingRentalPeriods(periods)).toBe(false)
    expect(calculateRentalForRange(periods, "2026-08-01", "2026-08-21")).toBe(
      "1120.00",
    )
  })

  it("sums manual and rental sources once for a calendar range", () => {
    const state = createEmptyExpensesPrototypeState()
    state.enabled = true
    state.activeCategories = ["fuel", "rental"]
    state.manualExpenses = [
      {
        id: "manual-1",
        source: "manual",
        category: "fuel",
        expenseDate: "2026-08-03",
        amount: "75.00",
        createdAt: "2026-08-10T10:00:00.000Z",
        updatedAt: "2026-08-10T10:00:00.000Z",
      },
    ]
    state.rentalPeriods = [rental("r1", "350.00", "2026-08-01", null)]
    const totals = calculateExpensesForRange(
      state,
      "2026-08-01",
      "2026-08-07",
    )
    expect(totals.byCategory.fuel).toBe("75.00")
    expect(totals.byCategory.rental).toBe("350.00")
    expect(totals.total).toBe("425.00")
  })

  it("reports corrupt prototype storage instead of silently replacing it", () => {
    let stored = "not-json"
    const storage: StorageReaderWriter = {
      getItem: () => stored,
      setItem: (_key, value) => {
        stored = value
      },
    }
    expect(readExpensesPrototype(storage).error).toBe(
      "EXPENSES_PROTOTYPE_READ_FAILED",
    )
    const state = createEmptyExpensesPrototypeState()
    state.enabled = true
    state.activeCategories = ["fuel"]
    writeExpensesPrototype(storage, state)
    expect(readExpensesPrototype(storage)).toEqual({ state, error: null })
  })
})
