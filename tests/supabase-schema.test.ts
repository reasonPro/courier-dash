import { describe, expect, it } from "vitest"

import schemaSnapshot from "../supabase/schema.snapshot.json"

const expectedTables = [
  "garage_history",
  "garage_rules",
  "profiles",
  "tax_settings",
  "work_shifts",
]

describe("Supabase schema snapshot", () => {
  it("contains the current application tables", () => {
    expect(schemaSnapshot.tables.map((table) => table.name).sort()).toEqual(
      expectedTables,
    )
  })

  it("has RLS enabled for every public application table", () => {
    expect(schemaSnapshot.tables).toHaveLength(expectedTables.length)
    expect(schemaSnapshot.tables.every((table) => table.rls_enabled)).toBe(true)
  })

  it("keeps mutation policies scoped to the authenticated user", () => {
    const ownerScopedTables = [
      "garage_history",
      "garage_rules",
      "profiles",
      "tax_settings",
      "work_shifts",
    ]

    ownerScopedTables.forEach((tableName) => {
      const mutationPolicies = schemaSnapshot.rls_policies.filter(
        (policy) =>
          policy.table === tableName &&
          ["ALL", "INSERT", "UPDATE", "DELETE"].includes(policy.command),
      )

      expect(mutationPolicies.length).toBeGreaterThan(0)
      mutationPolicies.forEach((policy) => {
        expect(`${policy.using ?? ""} ${policy.with_check ?? ""}`).toContain(
          "auth.uid()",
        )
      })
    })
  })

  it("links each user-owned table to auth.users", () => {
    const userForeignKeys = schemaSnapshot.foreign_keys.filter(
      (foreignKey) =>
        foreignKey.referenced_schema === "auth" &&
        foreignKey.referenced_table === "users",
    )

    expect(userForeignKeys.map((foreignKey) => foreignKey.table).sort()).toEqual(
      expectedTables,
    )
  })

  it("stores non-negative cash tips separately for every platform", () => {
    const expectedCashTipColumns = [
      "cash_tips_bolt",
      "cash_tips_glovo",
      "cash_tips_other",
      "cash_tips_stuart",
      "cash_tips_uber",
      "cash_tips_wolt",
    ]
    const cashTipColumns = schemaSnapshot.columns
      .filter(
        (column) =>
          column.table === "work_shifts" &&
          column.name.startsWith("cash_tips_"),
      )
      .sort((left, right) => left.name.localeCompare(right.name))

    expect(cashTipColumns.map((column) => column.name)).toEqual(
      expectedCashTipColumns,
    )
    cashTipColumns.forEach((column) => {
      expect(column.data_type).toBe("numeric")
      expect(column.nullable).toBe(false)
      expect(column.default).toBe("0")
    })

    const cashTipConstraints = schemaSnapshot.constraints.filter(
      (constraint) =>
        constraint.table === "work_shifts" &&
        constraint.name.includes("cash_tips"),
    )

    expectedCashTipColumns.forEach((columnName) => {
      expect(
        cashTipConstraints.some(
          (constraint) =>
            constraint.name ===
              `work_shifts_${columnName}_nonnegative` &&
            new RegExp(
              `${columnName}\\s*>=\\s*\\(?0\\)?(?:::numeric)?`,
            ).test(constraint.definition),
        ),
      ).toBe(true)
    })
    expect(
      cashTipConstraints.some(
        (constraint) =>
          constraint.name ===
            "work_shifts_other_cash_tips_require_name" &&
          constraint.definition.includes("other_platform_name IS NOT NULL"),
      ),
    ).toBe(true)
  })
})
