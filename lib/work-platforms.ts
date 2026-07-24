export const STANDARD_PLATFORM_KEYS = [
  "uber",
  "wolt",
  "bolt",
  "glovo",
  "stuart",
] as const

export const PLATFORM_KEYS = [...STANDARD_PLATFORM_KEYS, "other"] as const

export const TAX_PLATFORM_KEYS = ["uber", "wolt", "bolt", "glovo"] as const

export type StandardPlatformKey = (typeof STANDARD_PLATFORM_KEYS)[number]
export type PlatformKey = (typeof PLATFORM_KEYS)[number]
export type TaxPlatformKey = (typeof TAX_PLATFORM_KEYS)[number]

export type PlatformValues = Record<PlatformKey, string>

export type PlatformFormValues = {
  earnings: PlatformValues
  orders: PlatformValues
  tips: PlatformValues
  bonuses: PlatformValues
}

export type PlatformSelectionError =
  | "no_platforms"
  | "other_name_required"
  | null

export type PlatformPreference = {
  platforms: PlatformKey[]
  otherPlatformName: string
}

export type PlatformShiftPayload = {
  uber: number
  wolt: number
  bolt: number
  glovo: number
  stuart: number
  other_income: number
  orders_uber: number
  orders_wolt: number
  orders_bolt: number
  orders_glovo: number
  orders_stuart: number
  orders_other: number
  tips_uber: number
  tips_wolt: number
  tips_bolt: number
  tips_glovo: number
  tips_stuart: number
  tips_other: number
  bonuses_uber: number
  bonuses_wolt: number
  bonuses_bolt: number
  bonuses_glovo: number
  bonuses_stuart: number
  bonuses_other: number
  other_platform_name: string | null
}

export type PlatformMetricSource = {
  uber?: number | null
  wolt?: number | null
  bolt?: number | null
  glovo?: number | null
  stuart?: number | null
  other_income?: number | null
  orders_uber?: number | null
  orders_wolt?: number | null
  orders_bolt?: number | null
  orders_glovo?: number | null
  orders_stuart?: number | null
  orders_other?: number | null
  tips_uber?: number | null
  tips_wolt?: number | null
  tips_bolt?: number | null
  tips_glovo?: number | null
  tips_stuart?: number | null
  tips_other?: number | null
  bonuses_uber?: number | null
  bonuses_wolt?: number | null
  bonuses_bolt?: number | null
  bonuses_glovo?: number | null
  bonuses_stuart?: number | null
  bonuses_other?: number | null
  other_platform_name?: string | null
}

export type PlatformMetrics = {
  income: number
  orders: number
  tips: number
  bonuses: number
}

export const EMPTY_PLATFORM_VALUES: PlatformValues = {
  uber: "",
  wolt: "",
  bolt: "",
  glovo: "",
  stuart: "",
  other: "",
}

export const PLATFORM_LABELS: Record<StandardPlatformKey, string> = {
  uber: "Uber",
  wolt: "Wolt",
  bolt: "Bolt",
  glovo: "Glovo",
  stuart: "Stuart",
}

const PLATFORM_COLUMNS = {
  uber: {
    income: "uber",
    orders: "orders_uber",
    tips: "tips_uber",
    bonuses: "bonuses_uber",
  },
  wolt: {
    income: "wolt",
    orders: "orders_wolt",
    tips: "tips_wolt",
    bonuses: "bonuses_wolt",
  },
  bolt: {
    income: "bolt",
    orders: "orders_bolt",
    tips: "tips_bolt",
    bonuses: "bonuses_bolt",
  },
  glovo: {
    income: "glovo",
    orders: "orders_glovo",
    tips: "tips_glovo",
    bonuses: "bonuses_glovo",
  },
  stuart: {
    income: "stuart",
    orders: "orders_stuart",
    tips: "tips_stuart",
    bonuses: "bonuses_stuart",
  },
  other: {
    income: "other_income",
    orders: "orders_other",
    tips: "tips_other",
    bonuses: "bonuses_other",
  },
} as const

function numericValue(value: number | null | undefined) {
  return Number(value) || 0
}

export function createEmptyPlatformValues(): PlatformValues {
  return { ...EMPTY_PLATFORM_VALUES }
}

export function getPlatformPreferenceKey(userId: string) {
  return `courier_active_platforms:${userId}`
}

export function parsePlatformPreference(
  storedValue: string | null,
): PlatformPreference | null {
  if (!storedValue) {
    return null
  }

  try {
    const parsed: unknown = JSON.parse(storedValue)

    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
      return null
    }

    const preference = parsed as {
      platforms?: unknown
      otherPlatformName?: unknown
    }

    const storedPlatforms = preference.platforms
    if (!Array.isArray(storedPlatforms)) {
      return null
    }

    const platforms = PLATFORM_KEYS.filter((platform) =>
      storedPlatforms.includes(platform),
    )
    const otherPlatformName =
      typeof preference.otherPlatformName === "string"
        ? normalizeOtherPlatformName(preference.otherPlatformName)
        : ""

    return { platforms, otherPlatformName }
  } catch {
    return null
  }
}

export function serializePlatformPreference(
  platforms: PlatformKey[],
  otherPlatformName: string,
) {
  return JSON.stringify({
    platforms: PLATFORM_KEYS.filter((platform) => platforms.includes(platform)),
    otherPlatformName: platforms.includes("other")
      ? normalizeOtherPlatformName(otherPlatformName)
      : "",
  })
}

export function isTaxPlatformKey(
  platform: PlatformKey,
): platform is TaxPlatformKey {
  return (TAX_PLATFORM_KEYS as readonly PlatformKey[]).includes(platform)
}

export function normalizeOtherPlatformName(name: string) {
  return name.trim()
}

export function isOtherPlatformNameValid(name: string) {
  return normalizeOtherPlatformName(name) !== ""
}

export function validatePlatformSelection(
  activePlatforms: PlatformKey[],
  otherPlatformName: string,
): PlatformSelectionError {
  if (activePlatforms.length === 0) {
    return "no_platforms"
  }

  if (
    activePlatforms.includes("other") &&
    !isOtherPlatformNameValid(otherPlatformName)
  ) {
    return "other_name_required"
  }

  return null
}

export function getPlatformMetrics(
  source: PlatformMetricSource,
  platform: PlatformKey,
): PlatformMetrics {
  const columns = PLATFORM_COLUMNS[platform]

  return {
    income: numericValue(source[columns.income]),
    orders: numericValue(source[columns.orders]),
    tips: numericValue(source[columns.tips]),
    bonuses: numericValue(source[columns.bonuses]),
  }
}

export function getPlatformDisplayName(
  source: PlatformMetricSource,
  platform: PlatformKey,
  otherFallback: string,
) {
  if (platform === "other") {
    return normalizeOtherPlatformName(source.other_platform_name ?? "") || otherFallback
  }

  return PLATFORM_LABELS[platform]
}

export function isPlatformActive(
  source: PlatformMetricSource,
  platform: PlatformKey,
) {
  const metrics = getPlatformMetrics(source, platform)

  return (
    metrics.income !== 0 ||
    metrics.orders !== 0 ||
    metrics.tips !== 0 ||
    metrics.bonuses !== 0 ||
    (platform === "other" &&
      normalizeOtherPlatformName(source.other_platform_name ?? "") !== "")
  )
}

export function getShiftPlatformTotals(source: PlatformMetricSource) {
  return PLATFORM_KEYS.reduce(
    (totals, platform) => {
      const metrics = getPlatformMetrics(source, platform)
      totals.income += metrics.income
      totals.orders += metrics.orders
      totals.tips += metrics.tips
      totals.bonuses += metrics.bonuses
      return totals
    },
    { income: 0, orders: 0, tips: 0, bonuses: 0 },
  )
}

export function getActivePlatformNames(
  source: PlatformMetricSource,
  otherFallback: string,
) {
  return PLATFORM_KEYS.filter((platform) => isPlatformActive(source, platform)).map(
    (platform) => getPlatformDisplayName(source, platform, otherFallback),
  )
}

export function getOtherPlatformNames(sources: PlatformMetricSource[]) {
  return Array.from(
    new Set(
      sources
        .filter((source) => isPlatformActive(source, "other"))
        .map((source) => normalizeOtherPlatformName(source.other_platform_name ?? ""))
        .filter(Boolean),
    ),
  )
}

export function getEditingPlatformKeys(source: PlatformMetricSource) {
  return PLATFORM_KEYS.filter((platform) => isPlatformActive(source, platform))
}

function parsedNumber(value: string, integer = false) {
  return integer ? parseInt(value, 10) || 0 : parseFloat(value) || 0
}

export function buildPlatformShiftPayload(
  activePlatforms: PlatformKey[],
  formValues: PlatformFormValues,
  otherPlatformName: string,
  existingShift?: PlatformMetricSource,
): PlatformShiftPayload {
  const payload: PlatformShiftPayload = {
    uber: 0,
    wolt: 0,
    bolt: 0,
    glovo: 0,
    stuart: 0,
    other_income: 0,
    orders_uber: 0,
    orders_wolt: 0,
    orders_bolt: 0,
    orders_glovo: 0,
    orders_stuart: 0,
    orders_other: 0,
    tips_uber: 0,
    tips_wolt: 0,
    tips_bolt: 0,
    tips_glovo: 0,
    tips_stuart: 0,
    tips_other: 0,
    bonuses_uber: 0,
    bonuses_wolt: 0,
    bonuses_bolt: 0,
    bonuses_glovo: 0,
    bonuses_stuart: 0,
    bonuses_other: 0,
    other_platform_name: null,
  }

  PLATFORM_KEYS.forEach((platform) => {
    const isActive = activePlatforms.includes(platform)
    const existingMetrics = existingShift
      ? getPlatformMetrics(existingShift, platform)
      : { income: 0, orders: 0, tips: 0, bonuses: 0 }
    const metrics = isActive
      ? {
          income: parsedNumber(formValues.earnings[platform]),
          orders: parsedNumber(formValues.orders[platform], true),
          tips: parsedNumber(formValues.tips[platform]),
          bonuses: parsedNumber(formValues.bonuses[platform]),
        }
      : existingMetrics

    const columns = PLATFORM_COLUMNS[platform]
    payload[columns.income] = metrics.income
    payload[columns.orders] = metrics.orders
    payload[columns.tips] = metrics.tips
    payload[columns.bonuses] = metrics.bonuses
  })

  if (activePlatforms.includes("other")) {
    payload.other_platform_name = normalizeOtherPlatformName(otherPlatformName)
  } else if (existingShift?.other_platform_name) {
    payload.other_platform_name = existingShift.other_platform_name
  }

  return payload
}
