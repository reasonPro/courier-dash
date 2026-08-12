import { readFileSync } from "node:fs"
import { resolve } from "node:path"

import { describe, expect, it } from "vitest"

import {
  addCalendarDays,
  calculateExpensesForRange,
  createEmptyExpensesPrototypeState,
  formatMinorUnits,
  getExpensesForRange,
  getMonthRange,
  isCalendarDate,
  isValidPlnInput,
  plnToMinorUnits,
  readExpensesPrototype,
  writeExpensesPrototype,
  type PrototypeExpenseRecord,
  type StorageReaderWriter,
} from "../lib/expenses-prototype"

function expense(
  overrides: Partial<PrototypeExpenseRecord> = {},
): PrototypeExpenseRecord {
  return {
    id: "expense-1",
    source: "manual",
    category: "fuel",
    expenseDate: "2026-08-03",
    amount: "75.00",
    paidPeriodFrom: null,
    paidPeriodTo: null,
    createdAt: "2026-08-10T10:00:00.000Z",
    updatedAt: "2026-08-10T10:00:00.000Z",
    ...overrides,
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

  it("counts a rental payment only in its actual payment month", () => {
    const state = createEmptyExpensesPrototypeState()
    state.manualExpenses = [
      expense({
        category: "rental",
        expenseDate: "2026-08-28",
        amount: "700.00",
        paidPeriodFrom: "2026-08-28",
        paidPeriodTo: "2026-09-03",
      }),
    ]

    expect(
      calculateExpensesForRange(state, "2026-08-01", "2026-08-31")
        .byCategory.rental,
    ).toBe("700.00")
    expect(
      calculateExpensesForRange(state, "2026-09-01", "2026-09-30")
        .byCategory.rental,
    ).toBe("0.00")
  })

  it("moves the full rental total when payment amount and date are edited", () => {
    const state = createEmptyExpensesPrototypeState()
    state.manualExpenses = [
      expense({
        category: "rental",
        expenseDate: "2026-08-28",
        amount: "700.00",
        paidPeriodFrom: "2026-08-28",
        paidPeriodTo: "2026-09-03",
      }),
    ]
    state.manualExpenses[0] = {
      ...state.manualExpenses[0],
      expenseDate: "2026-09-01",
      amount: "725.00",
    }

    expect(
      calculateExpensesForRange(state, "2026-08-01", "2026-08-31").total,
    ).toBe("0.00")
    expect(
      calculateExpensesForRange(state, "2026-09-01", "2026-09-30").total,
    ).toBe("725.00")
  })

  it("removes a deleted rental payment from totals and history", () => {
    const state = createEmptyExpensesPrototypeState()
    state.manualExpenses = [
      expense({
        category: "rental",
        expenseDate: "2026-08-28",
        amount: "700.00",
        paidPeriodFrom: "2026-08-28",
        paidPeriodTo: "2026-09-03",
      }),
    ]
    state.manualExpenses = state.manualExpenses.filter(
      (record) => record.id !== "expense-1",
    )

    expect(getExpensesForRange(state, "2026-08-01", "2026-08-31")).toEqual([])
    expect(
      calculateExpensesForRange(state, "2026-08-01", "2026-08-31").total,
    ).toBe("0.00")
  })

  it("filters the history by the rental category", () => {
    const state = createEmptyExpensesPrototypeState()
    state.manualExpenses = [
      expense(),
      expense({
        id: "expense-rental",
        category: "rental",
        expenseDate: "2026-08-28",
        amount: "700.00",
        paidPeriodFrom: "2026-08-28",
        paidPeriodTo: "2026-09-03",
      }),
    ]

    expect(
      getExpensesForRange(
        state,
        "2026-08-01",
        "2026-08-31",
        "rental",
      ).map(({ id }) => id),
    ).toEqual(["expense-rental"])
  })

  it("keeps the filter UI category-only", () => {
    const filterSource = readFileSync(
      resolve(process.cwd(), "app/expenses/components/ExpenseFiltersModal.tsx"),
      "utf8",
    )
    expect(filterSource).not.toContain("ExpenseSource")
    expect(filterSource).not.toContain("copy.source")
    expect(filterSource).not.toContain('type="date"')
  })

  it("preserves legacy manual rows and ignores incompatible rental periods", () => {
    let stored = JSON.stringify({
      version: 1,
      enabled: true,
      activeCategories: ["fuel", "rental"],
      manualExpenses: [
        {
          id: "legacy-manual",
          source: "manual",
          category: "fuel",
          expenseDate: "2026-08-03",
          amount: "75.00",
          createdAt: "2026-08-03T10:00:00.000Z",
          updatedAt: "2026-08-03T10:00:00.000Z",
        },
      ],
      rentalPeriods: [
        {
          id: "legacy-rental",
          source: "rental_period",
          weeklyAmount: "350.00",
          validFrom: "2026-08-01",
          validTo: null,
          createdAt: "2026-08-01T10:00:00.000Z",
          updatedAt: "2026-08-01T10:00:00.000Z",
        },
      ],
    })
    const storage: StorageReaderWriter = {
      getItem: () => stored,
      setItem: (_key, value) => {
        stored = value
      },
    }
    const result = readExpensesPrototype(storage)

    expect(result.error).toBeNull()
    expect(result.state.version).toBe(2)
    expect(result.state.manualExpenses).toEqual([
      expense({
        id: "legacy-manual",
        createdAt: "2026-08-03T10:00:00.000Z",
        updatedAt: "2026-08-03T10:00:00.000Z",
      }),
    ])
    expect(result.state).not.toHaveProperty("rentalPeriods")
    expect(
      calculateExpensesForRange(
        result.state,
        "2026-08-01",
        "2026-08-31",
      ).byCategory.rental,
    ).toBe("0.00")
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
