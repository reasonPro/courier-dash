export const EXPENSES_CONTRACT_VERSION = "0.3.0-draft" as const

export const EXPENSES_CONTRACT_STATUS =
  "owner_approved_web_implemented_staging_verified" as const

export const EXPENSES_CURRENCY = "PLN" as const
export const EXPENSE_MONEY_DECIMAL_PLACES = 2 as const
export const EXPENSE_MIN_AMOUNT = "0.01" as const
export const EXPENSE_MAX_AMOUNT = "999999.99" as const

/** Canonical base-10 PLN text. Clients must not use binary floating point. */
export type ExpensePlnDecimal = string

/** Device-local calendar date in YYYY-MM-DD form; never UTC-converted. */
export type ExpenseCalendarDate = string

export const EXPENSE_CATEGORIES = [
  "fuel",
  "rental",
  "maintenance",
  "repair",
  "food_on_shift",
] as const

export type ExpenseCategory = (typeof EXPENSE_CATEGORIES)[number]

/** All Expenses V1 categories are entered as user-owned expense rows. */
export const MANUAL_EXPENSE_CATEGORIES = EXPENSE_CATEGORIES
export type ManualExpenseCategory = ExpenseCategory

export interface ExpenseSettingsRow {
  userId: string
  enabled: boolean
  activeCategories: ExpenseCategory[]
  createdAt: string
  updatedAt: string
}

export interface ExpenseInput {
  category: ExpenseCategory
  expenseDate: ExpenseCalendarDate
  amount: ExpensePlnDecimal
  /** Required only for rental and inclusive at both ends. */
  paidPeriodFrom: ExpenseCalendarDate | null
  /** Required only for rental and inclusive at both ends. */
  paidPeriodTo: ExpenseCalendarDate | null
}

export type CreateExpenseInput = ExpenseInput
export type UpdateExpenseInput = ExpenseInput

export interface ExpenseRow extends ExpenseInput {
  id: string
  userId: string
  currency: typeof EXPENSES_CURRENCY
  /** Technical timestamp; never used for financial month attribution. */
  createdAt: string
  updatedAt: string
}

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

export const EXPENSE_DOMAIN_ERROR_CODES = [
  "EXPENSES_AUTH_REQUIRED",
  "EXPENSES_READ_FAILED",
  "EXPENSES_WRITE_FAILED",
  "EXPENSES_INVALID_CATEGORY",
  "EXPENSES_INVALID_AMOUNT",
  "EXPENSES_INVALID_DATE",
  "EXPENSES_INVALID_RENTAL_PERIOD",
] as const

export type ExpenseDomainErrorCode =
  (typeof EXPENSE_DOMAIN_ERROR_CODES)[number]
