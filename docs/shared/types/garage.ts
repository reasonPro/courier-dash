export const GARAGE_CONTRACT_VERSION = "0.3.0-draft" as const

export const GARAGE_SERVICE_TYPES = ["routine", "repair"] as const

export type GarageServiceType = (typeof GARAGE_SERVICE_TYPES)[number]
export type GarageDate = string
export type GarageMileage = number
export type GaragePlnAmount = number

export const GARAGE_MILEAGE_MIN = 0
export const GARAGE_MILEAGE_MAX = 2_147_483_647
export const GARAGE_PLN_DECIMAL_PLACES = 2
export const GARAGE_ODOMETER_OWNERSHIP = "client-local-only" as const

export const GARAGE_ERROR_CODES = [
  "GARAGE_AUTH_REQUIRED",
  "GARAGE_RULE_NOT_FOUND",
  "GARAGE_INVALID_DATE",
  "GARAGE_INVALID_ODOMETER",
  "GARAGE_INVALID_COST",
  "GARAGE_CONFLICT",
  "GARAGE_READ_FAILED",
  "GARAGE_WRITE_FAILED",
  "GARAGE_INVALID_HISTORY_TYPE",
] as const

export type GarageDomainErrorCode = (typeof GARAGE_ERROR_CODES)[number]

export const GARAGE_RPC_SQLSTATES = {
  GARAGE_AUTH_REQUIRED: "CDG01",
  GARAGE_RULE_NOT_FOUND: "CDG02",
  GARAGE_INVALID_DATE: "CDG03",
  GARAGE_INVALID_ODOMETER: "CDG04",
  GARAGE_INVALID_COST: "CDG05",
  GARAGE_CONFLICT: "CDG06",
  GARAGE_WRITE_FAILED: "CDG08",
  GARAGE_INVALID_HISTORY_TYPE: "CDG09",
} as const satisfies Partial<Record<GarageDomainErrorCode, string>>

export interface GarageRuleLegacyRow {
  id: number
  created_at: string
  name: string | null
  interval_km: number | null
  last_change_km: number | null
  user_id: string | null
}

export interface GarageRuleRow {
  id: number
  created_at: string
  name: string
  interval_km: GarageMileage
  last_change_km: GarageMileage
  user_id: string
}

interface GarageHistoryBaseRow {
  id: number
  created_at: string
  name: string
  date: GarageDate
  cost: GaragePlnAmount
  odometer: GarageMileage
  user_id: string
}

export interface GarageRepairHistoryRow extends GarageHistoryBaseRow {
  service_type: "repair"
  rule_id: null
}

export interface GarageRoutineHistoryRow extends GarageHistoryBaseRow {
  service_type: "routine"
  /** Null only after the linked rule was deleted with ON DELETE SET NULL. */
  rule_id: number | null
}

export type GarageHistoryRow =
  | GarageRepairHistoryRow
  | GarageRoutineHistoryRow

export interface GarageHistoryLegacyRow {
  id: number
  created_at: string
  service_type: string | null
  name: string | null
  date: string | null
  cost: number | null
  rule_id: number | null
  odometer: number | null
  user_id: string | null
}

export interface CreateGarageRuleInput {
  name: string
  interval_km: GarageMileage
  last_change_km: GarageMileage
}

/**
 * Temporary deployed-Web compatibility shape only. New Web and Mobile routine
 * completion must use CompleteGarageRoutineInput instead of a direct update.
 */
export interface UpdateGarageRuleInput {
  id: number
  last_change_km: GarageMileage
}

export interface CreateGarageRepairInput {
  service_type: "repair"
  name: string
  date: GarageDate
  odometer: GarageMileage
  cost: GaragePlnAmount
  rule_id: null
}

export interface CompleteGarageRoutineInput {
  p_rule_id: number
  p_expected_last_change_km: GarageMileage | null
  p_date: GarageDate
  p_odometer: GarageMileage
  p_cost: GaragePlnAmount
}

export interface CompleteGarageRoutineResult {
  history_id: number
  history_created_at: string
  rule_id: number
  rule_name: string
  service_type: "routine"
  service_date: GarageDate
  odometer: GarageMileage
  cost: GaragePlnAmount
  interval_km: GarageMileage
  last_change_km: GarageMileage
  next_service_odometer: number | null
}

export interface GarageDomainError {
  code: GarageDomainErrorCode
  retryable: boolean
}
