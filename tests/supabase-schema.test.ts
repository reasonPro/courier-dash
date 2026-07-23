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
})
