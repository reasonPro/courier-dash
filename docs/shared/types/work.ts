/** Contract-owned additive fields for LOCAL migration 202609160001.
 * Not a claim that remote/generated database types already include Pyszne.
 * Missing fields in older reads are interpreted as no recorded Pyszne activity.
 */
export type PyszneShiftColumns = {
  pyszne: number
  orders_pyszne: number
  tips_pyszne: number
  cash_tips_pyszne: number
  bonuses_pyszne: number
}

export type PyszneTaxColumns = {
  /** PostgreSQL text; CHECK accepts WorkTaxMode. */
  pyszne_type: string
  pyszne_val: number
}

export type WorkTaxMode = "none" | "percent" | "fixed_week" | "fixed_month"

/** Additive tax_settings columns; requires the Stuart/Other tax migration before writes. */
export type StuartOtherTaxColumns = {
  /** PostgreSQL text; CHECK accepts WorkTaxMode. */
  stuart_type: string
  stuart_val: number
  other_type: string
  other_val: number
}
