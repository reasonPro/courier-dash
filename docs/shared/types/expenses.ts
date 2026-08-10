export const EXPENSES_CONTRACT_VERSION = "0.3.0-draft" as const

export const EXPENSES_CONTRACT_STATUS =
  "owner_approved_contract_draft" as const

export const EXPENSES_CURRENCY = "PLN" as const

export const EXPENSE_MONEY_DECIMAL_PLACES = 2 as const
export const EXPENSE_FINAL_ROUNDING_INCREMENT = "0.01" as const
export const EXPENSE_FINAL_ROUNDING_MODE = "ROUND_HALF_UP" as const

/** Canonical base-10 PLN text; clients validate non-negative scale <= 2. */
export type ExpensePlnDecimal = string

/** Exact device-local calendar date in YYYY-MM-DD form; never UTC-converted. */
export type ExpenseCalendarDate = string

export const EXPENSE_CATEGORIES = [
  "fuel",
  "rental",
  "maintenance",
  "repair",
  "food_on_shift",
] as const

export type ExpenseCategory = (typeof EXPENSE_CATEGORIES)[number]

export const MANUAL_EXPENSE_CATEGORIES = [
  "fuel",
  "maintenance",
  "repair",
  "food_on_shift",
] as const

export type ManualExpenseCategory =
  (typeof MANUAL_EXPENSE_CATEGORIES)[number]

export const EXPENSE_SOURCES = ["manual", "rental_period", "garage"] as const

export type ExpenseSource = (typeof EXPENSE_SOURCES)[number]

export const EXPENSE_CATEGORY_SOURCES = {
  fuel: ["manual"],
  rental: ["rental_period"],
  maintenance: ["manual", "garage"],
  repair: ["manual", "garage"],
  food_on_shift: ["manual"],
} as const satisfies Record<ExpenseCategory, readonly ExpenseSource[]>

export const EXPENSE_CALCULATION_MODES = [
  "gross",
  "after_tax_and_fees",
  "after_recorded_expenses",
  "after_all_deductions",
] as const

export type ExpenseCalculationMode =
  (typeof EXPENSE_CALCULATION_MODES)[number]

export const EXPENSE_T_DEPENDENT_MODES = [
  "after_tax_and_fees",
  "after_all_deductions",
] as const

export type ExpenseTaxDependentMode =
  (typeof EXPENSE_T_DEPENDENT_MODES)[number]

export const EXPENSE_CALCULATION_AVAILABILITY = [
  "available",
  "partial",
  "unavailable",
  "not_configured",
] as const

export type ExpenseCalculationAvailability =
  (typeof EXPENSE_CALCULATION_AVAILABILITY)[number]

export const EXPENSE_CALCULATION_COMPONENTS = [
  "gross",
  "taxAndFees",
  "recordedExpenses",
] as const

export type ExpenseCalculationComponent =
  (typeof EXPENSE_CALCULATION_COMPONENTS)[number]

export interface ExpenseSourceReference {
  source: ExpenseSource
  sourceRecordId: string
}

export interface ManualExpenseInput {
  category: ManualExpenseCategory
  expenseDate: ExpenseCalendarDate
  amount: ExpensePlnDecimal
}

export interface ManualExpenseRecord extends ManualExpenseInput {
  source: "manual"
  sourceRecordId: string
  /** Technical record-creation instant; never used for financial attribution. */
  createdAt: string
}

export interface RentalPeriodSourceRecord {
  source: "rental_period"
  sourceRecordId: string
  weeklyAmount: ExpensePlnDecimal
  validFrom: ExpenseCalendarDate
  validTo: ExpenseCalendarDate | null
}

export interface CreateRentalPeriodInput {
  weeklyAmount: ExpensePlnDecimal
  validFrom: ExpenseCalendarDate
  validTo: ExpenseCalendarDate | null
  idempotencyKey: string
}

export interface CloseAndCreateRentalPeriodInput {
  currentSourceRecordId: string
  replacement: CreateRentalPeriodInput
}

export interface ExpenseGrossComponents {
  baseIncome: ExpensePlnDecimal
  appTips: ExpensePlnDecimal
  cashTips: ExpensePlnDecimal
  bonuses: ExpensePlnDecimal
}

export interface ExpenseCalculationComponents {
  gross: ExpensePlnDecimal | null
  taxAndFees: ExpensePlnDecimal | null
  recordedExpenses: ExpensePlnDecimal | null
}

interface ExpenseCalculationResultBase {
  mode: ExpenseCalculationMode
  currency: typeof EXPENSES_CURRENCY
  components: ExpenseCalculationComponents
}

export interface AvailableExpenseCalculationResult
  extends ExpenseCalculationResultBase {
  availability: "available"
  value: ExpensePlnDecimal
  missingComponents: []
  isFinal: true
}

export interface PartialExpenseCalculationResult
  extends ExpenseCalculationResultBase {
  availability: "partial"
  value: ExpensePlnDecimal | null
  missingComponents: [
    ExpenseCalculationComponent,
    ...ExpenseCalculationComponent[],
  ]
  isFinal: false
}

export interface UnavailableExpenseCalculationResult
  extends ExpenseCalculationResultBase {
  availability: "unavailable" | "not_configured"
  value: null
  missingComponents: ExpenseCalculationComponent[]
  isFinal: false
}

export type ExpenseCalculationResult =
  | AvailableExpenseCalculationResult
  | PartialExpenseCalculationResult
  | UnavailableExpenseCalculationResult
