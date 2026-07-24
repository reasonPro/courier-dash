import { describe, expect, it } from "vitest"

import {
  buildPlatformShiftPayload,
  createEmptyPlatformValues,
  getActivePlatformNames,
  getEditingPlatformKeys,
  getOtherPlatformNames,
  getPlatformPreferenceKey,
  getPlatformMetrics,
  getShiftPlatformTotals,
  isOtherPlatformNameValid,
  normalizeOtherPlatformName,
  parsePlatformPreference,
  serializePlatformPreference,
  validatePlatformSelection,
} from "../lib/work-platforms"

function createFormValues() {
  return {
    earnings: createEmptyPlatformValues(),
    orders: createEmptyPlatformValues(),
    tips: createEmptyPlatformValues(),
    bonuses: createEmptyPlatformValues(),
  }
}

describe("work platforms", () => {
  it("trims a custom platform name", () => {
    expect(normalizeOtherPlatformName("  Free Now  ")).toBe("Free Now")
  })

  it("rejects a whitespace-only custom platform name", () => {
    expect(isOtherPlatformNameValid("   ")).toBe(false)
    expect(isOtherPlatformNameValid(" Free Now ")).toBe(true)
  })

  it("reads Stuart metrics like a standard platform", () => {
    expect(
      getPlatformMetrics(
        {
          stuart: 120,
          orders_stuart: 8,
          tips_stuart: 12,
          bonuses_stuart: 5,
        },
        "stuart",
      ),
    ).toEqual({ income: 120, orders: 8, tips: 12, bonuses: 5 })
  })

  it("includes Stuart and a custom platform in shift totals", () => {
    expect(
      getShiftPlatformTotals({
        uber: 100,
        orders_uber: 5,
        stuart: 80,
        orders_stuart: 4,
        tips_stuart: 10,
        other_platform_name: "Xpress Delivery",
        other_income: 60,
        orders_other: 3,
        tips_other: 6,
        bonuses_other: 2,
      }),
    ).toEqual({ income: 240, orders: 12, tips: 16, bonuses: 2 })
  })

  it("uses the custom name in platform details", () => {
    expect(
      getActivePlatformNames(
        {
          stuart: 10,
          other_platform_name: "Xpress Delivery",
          other_income: 20,
        },
        "Other",
      ),
    ).toEqual(["Stuart", "Xpress Delivery"])
  })

  it("returns unique trimmed custom names for chart legends", () => {
    expect(
      getOtherPlatformNames([
        { other_platform_name: "Free Now", other_income: 10 },
        { other_platform_name: " Free Now ", other_income: 20 },
        { other_platform_name: "Xpress Delivery", orders_other: 1 },
      ]),
    ).toEqual(["Free Now", "Xpress Delivery"])
  })

  it("supports a shift with only Glovo", () => {
    const values = createFormValues()
    values.earnings.glovo = "125.50"
    values.orders.glovo = "7"

    const payload = buildPlatformShiftPayload(["glovo"], values, "")

    expect(validatePlatformSelection(["glovo"], "")).toBeNull()
    expect(payload.glovo).toBe(125.5)
    expect(payload.orders_glovo).toBe(7)
    expect(payload.uber).toBe(0)
    expect(payload.wolt).toBe(0)
  })

  it("supports a shift with only Stuart", () => {
    const values = createFormValues()
    values.earnings.stuart = "90"
    values.orders.stuart = "4"
    values.tips.stuart = "8"

    const payload = buildPlatformShiftPayload(["stuart"], values, "")

    expect(payload.stuart).toBe(90)
    expect(payload.orders_stuart).toBe(4)
    expect(payload.tips_stuart).toBe(8)
    expect(payload.uber).toBe(0)
    expect(payload.wolt).toBe(0)
  })

  it("supports Glovo and Wolt together", () => {
    const values = createFormValues()
    values.earnings.glovo = "60"
    values.earnings.wolt = "80"
    values.orders.glovo = "3"
    values.orders.wolt = "5"

    const payload = buildPlatformShiftPayload(["glovo", "wolt"], values, "")

    expect(payload.glovo).toBe(60)
    expect(payload.wolt).toBe(80)
    expect(payload.orders_glovo).toBe(3)
    expect(payload.orders_wolt).toBe(5)
  })

  it("does not validate or populate unselected Uber and Wolt", () => {
    const values = createFormValues()
    values.earnings.uber = "999"
    values.orders.wolt = "99"
    values.earnings.glovo = "50"

    expect(validatePlatformSelection(["glovo"], "")).toBeNull()
    expect(buildPlatformShiftPayload(["glovo"], values, "")).toMatchObject({
      uber: 0,
      wolt: 0,
      orders_uber: 0,
      orders_wolt: 0,
      glovo: 50,
    })
  })

  it("rejects a shift without any selected platform", () => {
    expect(validatePlatformSelection([], "")).toBe("no_platforms")
  })

  it("requires a name only when Other is active", () => {
    expect(validatePlatformSelection(["other"], "   ")).toBe(
      "other_name_required",
    )
    expect(validatePlatformSelection(["glovo"], "   ")).toBeNull()
  })

  it("opens platforms with saved data and preserves them while editing", () => {
    const existingShift = {
      uber: 100,
      orders_uber: 5,
      stuart: 70,
      orders_stuart: 4,
      tips_stuart: 6,
    }
    const values = createFormValues()
    values.earnings.uber = "120"
    values.orders.uber = "6"

    expect(getEditingPlatformKeys(existingShift)).toEqual(["uber", "stuart"])
    expect(
      buildPlatformShiftPayload(["uber"], values, "", existingShift),
    ).toMatchObject({
      uber: 120,
      orders_uber: 6,
      stuart: 70,
      orders_stuart: 4,
      tips_stuart: 6,
    })
  })

  it("keeps platform preferences isolated per user", () => {
    expect(getPlatformPreferenceKey("user-a")).not.toBe(
      getPlatformPreferenceKey("user-b"),
    )

    const storedPreference = serializePlatformPreference(
      ["glovo", "wolt"],
      "",
    )
    expect(parsePlatformPreference(storedPreference)).toEqual({
      platforms: ["wolt", "glovo"],
      otherPlatformName: "",
    })
  })
})
