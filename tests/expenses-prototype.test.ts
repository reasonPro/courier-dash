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
  isPositivePlnInput,
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

describe("Expenses exact client calculations", () => {
  it("validates the approved amount range with exact minor-unit arithmetic", () => {
    expect(isPositivePlnInput("0.00")).toBe(false)
    expect(isPositivePlnInput("0.01")).toBe(true)
    expect(isPositivePlnInput("999999.99")).toBe(true)
    expect(isPositivePlnInput("1000000.00")).toBe(false)
    expect(isValidPlnInput("19.999")).toBe(false)
    expect(isValidPlnInput("-0.01")).toBe(false)
    expect(
      formatMinorUnits(
        plnToMinorUnits("999999.98") + plnToMinorUnits("0.01"),
      ),
    ).toBe("999999.99")
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
