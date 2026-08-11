import { createHash } from "node:crypto"
import { readFileSync } from "node:fs"
import { resolve } from "node:path"

import { describe, expect, it } from "vitest"

import manifest from "../docs/shared/contract-manifest.json"
import expenseCases from "../docs/shared/fixtures/expense-calculations.json"
import {
  EXPENSES_CONTRACT_STATUS,
  EXPENSES_CONTRACT_VERSION,
  EXPENSES_CURRENCY,
  EXPENSE_CALCULATION_AVAILABILITY,
  EXPENSE_CALCULATION_MODES,
  EXPENSE_CATEGORIES,
  EXPENSE_CATEGORY_SOURCES,
  EXPENSE_FINAL_ROUNDING_INCREMENT,
  EXPENSE_FINAL_ROUNDING_MODE,
  EXPENSE_MONEY_DECIMAL_PLACES,
  EXPENSE_SOURCES,
  EXPENSE_T_DEPENDENT_MODES,
  MANUAL_EXPENSE_CATEGORIES,
} from "../docs/shared/types/expenses"

const PLN_INPUT_PATTERN = /^\d+(?:\.\d{1,2})?$/
const MINOR_UNITS_PER_PLN = BigInt("100")
const ROUNDING_COMPARISON_FACTOR = BigInt("2")

function toMinorUnits(value: string): bigint {
  if (!PLN_INPUT_PATTERN.test(value)) {
    throw new Error(`Invalid synthetic PLN input: ${value}`)
  }

  const [whole, fraction = ""] = value.split(".")
  return (
    BigInt(whole) * MINOR_UNITS_PER_PLN +
    BigInt(fraction.padEnd(2, "0"))
  )
}

function formatMinorUnits(value: bigint): string {
  const zero = BigInt("0")
  const sign = value < zero ? "-" : ""
  const absolute = value < zero ? -value : value
  const whole = absolute / MINOR_UNITS_PER_PLN
  const fraction = absolute % MINOR_UNITS_PER_PLN
  return `${sign}${whole}.${String(fraction).padStart(2, "0")}`
}

function roundPositiveRationalHalfUp(
  numerator: bigint,
  denominator: bigint,
): bigint {
  const zero = BigInt("0")
  const one = BigInt("1")
  if (numerator < zero || denominator <= zero) {
    throw new Error("Synthetic rational must be non-negative with denominator > 0")
  }

  const quotient = numerator / denominator
  const remainder = numerator % denominator
  return remainder * ROUNDING_COMPARISON_FACTOR >= denominator
    ? quotient + one
    : quotient
}

function roundDecimalToMinorUnitsHalfUp(value: string): string {
  const match = /^(\d+)(?:\.(\d+))?$/.exec(value)
  if (!match) throw new Error(`Invalid synthetic decimal: ${value}`)

  const whole = BigInt(match[1])
  const fraction = (match[2] ?? "").padEnd(3, "0")
  const base =
    whole * MINOR_UNITS_PER_PLN + BigInt(fraction.slice(0, 2))
  const rounded = fraction[2] >= "5" ? base + BigInt("1") : base
  return formatMinorUnits(rounded)
}

describe("Expenses shared-contract owner decisions", () => {
  it("defines only the owner-approved PLN category and source vocabulary", () => {
    expect(EXPENSES_CONTRACT_VERSION).toBe("0.3.0-draft")
    expect(EXPENSES_CONTRACT_STATUS).toBe("owner_approved_contract_draft")
    expect(EXPENSES_CURRENCY).toBe("PLN")
    expect(EXPENSE_CATEGORIES).toEqual([
      "fuel",
      "rental",
      "maintenance",
      "repair",
      "food_on_shift",
    ])
    expect(MANUAL_EXPENSE_CATEGORIES).toEqual([
      "fuel",
      "maintenance",
      "repair",
      "food_on_shift",
    ])
    expect(EXPENSE_SOURCES).toEqual(["manual", "rental_period", "garage"])
    expect(EXPENSE_CATEGORY_SOURCES).toEqual({
      fuel: ["manual"],
      rental: ["rental_period"],
      maintenance: ["manual", "garage"],
      repair: ["manual", "garage"],
      food_on_shift: ["manual"],
    })
  })

  it("keeps all four calculation modes independent of presentation toggles", () => {
    const calculationCase = expenseCases.cases.find(
      ({ caseId }) => caseId === "expense-four-calculation-modes",
    )

    expect(calculationCase).toBeDefined()
    expect(EXPENSE_CALCULATION_MODES).toEqual([
      "gross",
      "after_tax_and_fees",
      "after_recorded_expenses",
      "after_all_deductions",
    ])

    const input = calculationCase?.input as unknown as {
      grossComponents: Record<string, string>
      taxAndFees: string
      recordedExpenses: string
    }
    const expected = calculationCase?.expected as unknown as Record<
      string,
      string
    >
    const gross = Object.values(input.grossComponents).reduce(
      (total, value) => total + toMinorUnits(value),
      BigInt("0"),
    )

    expect(formatMinorUnits(gross)).toBe(expected.gross)
    expect(formatMinorUnits(gross - toMinorUnits(input.taxAndFees))).toBe(
      expected.after_tax_and_fees,
    )
    expect(formatMinorUnits(gross - toMinorUnits(input.recordedExpenses))).toBe(
      expected.after_recorded_expenses,
    )
    expect(
      formatMinorUnits(
        gross -
          toMinorUnits(input.taxAndFees) -
          toMinorUnits(input.recordedExpenses),
      ),
    ).toBe(expected.after_all_deductions)
  })

  it("locks PLN scale, decimal rental proration, and final ROUND_HALF_UP", () => {
    const moneyCase = expenseCases.cases.find(
      ({ caseId }) => caseId === "expense-pln-decimal-and-rental-rounding",
    )
    const input = moneyCase?.input as unknown as {
      acceptedPlnInputs: string[]
      rejectedPlnInputs: string[]
      roundHalfUpTie: string
    }
    const expected = moneyCase?.expected as unknown as {
      decimalPlacesMaximum: number
      intermediateRounding: boolean
      finalIncrement: string
      roundingMode: string
      roundHalfUpTieResult: string
    }

    expect(input.acceptedPlnInputs.every((value) => PLN_INPUT_PATTERN.test(value))).toBe(true)
    expect(input.rejectedPlnInputs.every((value) => !PLN_INPUT_PATTERN.test(value))).toBe(true)
    expect(EXPENSE_MONEY_DECIMAL_PLACES).toBe(expected.decimalPlacesMaximum)
    expect(EXPENSE_FINAL_ROUNDING_INCREMENT).toBe(expected.finalIncrement)
    expect(EXPENSE_FINAL_ROUNDING_MODE).toBe(expected.roundingMode)
    expect(expected.intermediateRounding).toBe(false)

    expect(roundDecimalToMinorUnitsHalfUp(input.roundHalfUpTie)).toBe(
      expected.roundHalfUpTieResult,
    )
  })

  it("keeps PLN exact beyond the JavaScript safe integer range", () => {
    const largeValueCase = expenseCases.cases.find(
      ({ caseId }) =>
        caseId === "expense-pln-beyond-javascript-safe-integer",
    )
    const input = largeValueCase?.input as unknown as { amounts: string[] }
    const expected = largeValueCase?.expected as unknown as { total: string }
    const total = input.amounts.reduce(
      (sum, value) => sum + toMinorUnits(value),
      BigInt("0"),
    )

    expect(formatMinorUnits(total)).toBe(expected.total)
  })

  it("keeps non-terminating rental proration rational until final rounding", () => {
    const rentalCase = expenseCases.cases.find(
      ({ caseId }) =>
        caseId === "rental-non-terminating-proration-round-half-up",
    )
    const input = rentalCase?.input as unknown as {
      weeklyAmount: string
      activeCalendarDays: string
      daysPerWeek: string
    }
    const expected = rentalCase?.expected as unknown as {
      minorUnitNumerator: string
      minorUnitDenominator: string
      intermediateRounding: boolean
      finalAmount: string
      roundingMode: string
    }
    const numerator =
      toMinorUnits(input.weeklyAmount) * BigInt(input.activeCalendarDays)
    const denominator = BigInt(input.daysPerWeek)

    expect(String(numerator)).toBe(expected.minorUnitNumerator)
    expect(String(denominator)).toBe(expected.minorUnitDenominator)
    expect(expected.intermediateRounding).toBe(false)
    expect(expected.roundingMode).toBe(EXPENSE_FINAL_ROUNDING_MODE)
    expect(
      formatMinorUnits(
        roundPositiveRationalHalfUp(numerator, denominator),
      ),
    ).toBe(expected.finalAmount)
  })

  it("requires completeness evidence and gates modes that depend on T", () => {
    expect(EXPENSE_CALCULATION_AVAILABILITY).toEqual([
      "available",
      "partial",
      "unavailable",
      "not_configured",
    ])
    expect(EXPENSE_T_DEPENDENT_MODES).toEqual([
      "after_tax_and_fees",
      "after_all_deductions",
    ])

    const availabilityCase = expenseCases.cases.find(
      ({ caseId }) => caseId === "expense-result-availability-vocabulary",
    )
    const expected = availabilityCase?.expected as unknown as {
      states: string[]
      complete: { missingComponents: string[]; isFinal: boolean }
      partial: { missingComponents: string[]; isFinal: boolean }
      taxDependentWithoutReliableT: {
        availability: string
        availableAllowed: boolean
        isFinal: boolean
      }
    }

    expect(expected.states).toEqual([...EXPENSE_CALCULATION_AVAILABILITY])
    expect(expected.complete.missingComponents).toEqual([])
    expect(expected.complete.isFinal).toBe(true)
    expect(expected.partial.missingComponents.length).toBeGreaterThan(0)
    expect(expected.partial.isFinal).toBe(false)
    expect(expected.taxDependentWithoutReliableT.availability).not.toBe(
      "available",
    )
    expect(expected.taxDependentWithoutReliableT.availableAllowed).toBe(false)
    expect(expected.taxDependentWithoutReliableT.isFinal).toBe(false)
  })

  it("attributes backdated manual expenses to expenseDate, not createdAt", () => {
    const dateCase = expenseCases.cases.find(
      ({ caseId }) => caseId === "expense-backdated-manual-attribution",
    )
    const input = dateCase?.input as unknown as {
      manualExpense: { expenseDate: string; createdAt: string }
      selectedRange: { from: string; to: string }
    }
    const expected = dateCase?.expected as unknown as {
      included: boolean
      backdatedCreateAllowed: boolean
      attributionField: string
      createdAtUsedForAttribution: boolean
      utcDateConversionAllowed: boolean
    }

    expect(input.manualExpense.expenseDate).not.toBe(
      input.manualExpense.createdAt.slice(0, 10),
    )
    expect(
      input.manualExpense.expenseDate >= input.selectedRange.from &&
        input.manualExpense.expenseDate <= input.selectedRange.to,
    ).toBe(expected.included)
    expect(expected.backdatedCreateAllowed).toBe(true)
    expect(expected.attributionField).toBe("expenseDate")
    expect(expected.createdAtUsedForAttribution).toBe(false)
    expect(expected.utcDateConversionAllowed).toBe(false)
  })

  it("keeps Garage and rental records separate from manual expenses", () => {
    const sourceCase = expenseCases.cases.find(
      ({ caseId }) => caseId === "expense-garage-reference-no-copy",
    )
    const input = sourceCase?.input as unknown as {
      sources: Array<{
        source: string
        sourceRecordId: string
        amount: string
      }>
    }
    const expected = sourceCase?.expected as unknown as {
      recordedExpenses: string
      uniqueSourceReferences: number
      copiedGarageRowsInManualExpenses: number
      manualDuplicateAllowed: boolean
      garageCorrectionOwner: string
    }

    expect(
      formatMinorUnits(
        input.sources.reduce(
          (total, source) => total + toMinorUnits(source.amount),
          BigInt("0"),
        ),
      ),
    ).toBe(expected.recordedExpenses)
    expect(
      new Set(
        input.sources.map(
          ({ source, sourceRecordId }) => `${source}:${sourceRecordId}`,
        ),
      ).size,
    ).toBe(expected.uniqueSourceReferences)
    expect(expected.copiedGarageRowsInManualExpenses).toBe(0)
    expect(expected.manualDuplicateAllowed).toBe(false)
    expect(expected.garageCorrectionOwner).toBe("garage")

    const rentalCase = expenseCases.cases.find(
      ({ caseId }) =>
        caseId === "rental-owner-overlap-atomicity-and-idempotency",
    )
    expect(rentalCase?.expected).toMatchObject({
      overlapAllowed: false,
      closeAndCreateAtomic: true,
      correctionIsSeparateControlledAction: true,
      retryWithSameIdempotencyKeyCreatesSecondPeriod: false,
      source: "rental_period",
    })
  })

  it("records all five owner-approved gates while keeping implementation deferred", () => {
    const expensesFlow = manifest.sharedFlows.find(
      (flow) => flow.id === "expenses",
    )
    const contract = readFileSync(
      resolve(process.cwd(), "docs/shared/EXPENSES_CONTRACT.md"),
      "utf8",
    )
    const gateSections = contract.match(
      /^### Gate [1-5] —[\s\S]*?(?=^### Gate|^## Migration)/gm,
    )

    expect(expensesFlow?.implementationStatus).toBe("planned")
    expect(expensesFlow?.implementationCommit).toBeNull()
    expect(expensesFlow?.reviewStatus).toBe("passed")
    expect(expensesFlow?.acceptanceStatus).toBe("accepted_by_web")
    expect(expensesFlow?.missingCapabilities).not.toContain(
      "owner_decision_gates",
    )
    expect(contract).toContain("Status: `owner_approved_contract_draft`")
    expect(gateSections).toHaveLength(5)
    gateSections?.forEach((gate) => {
      expect(gate).toContain("`OWNER APPROVED`")
      expect(gate).not.toContain("`PROPOSED`")
    })
    expect(contract).toContain("Production implementation has not started")
  })

  it("keeps manifest hashes synchronized for every Expenses-related artifact", () => {
    const expenseArtifactPaths = [
      "docs/shared/SHARED_ARCHITECTURE.md",
      "docs/shared/BUSINESS_RULES.md",
      "docs/shared/EXPENSES_CONTRACT.md",
      "docs/shared/types/expenses.ts",
      "docs/shared/CHANGELOG.md",
      "docs/shared/fixtures/expense-calculations.json",
      "docs/MOBILE_INTEGRATION.md",
    ]

    expenseArtifactPaths.forEach((path) => {
      const artifact = manifest.artifacts.find((entry) => entry.path === path)
      const actualHash = createHash("sha256")
        .update(readFileSync(resolve(process.cwd(), path)))
        .digest("hex")

      expect(artifact, path).toBeDefined()
      expect(artifact?.sha256, path).toBe(actualHash)
    })
  })
})
