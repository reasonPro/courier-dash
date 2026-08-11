import { createHash } from "node:crypto"
import { readFileSync, readdirSync } from "node:fs"
import { resolve } from "node:path"

import { describe, expect, it } from "vitest"

import manifest from "../docs/shared/contract-manifest.json"
import manifestSchema from "../docs/shared/contract-manifest.schema.json"
import fixtureSchema from "../docs/shared/fixtures/fixture.schema.json"
import garageCases from "../docs/shared/fixtures/garage-cases.json"
import {
  GARAGE_CONTRACT_VERSION,
  GARAGE_ERROR_CODES,
  GARAGE_MILEAGE_MAX,
  GARAGE_MILEAGE_MIN,
  GARAGE_ODOMETER_OWNERSHIP,
  GARAGE_PLN_DECIMAL_PLACES,
  GARAGE_RPC_SQLSTATES,
  GARAGE_SERVICE_TYPES,
} from "../docs/shared/types/garage"

const migrationPath = resolve(
  process.cwd(),
  "supabase/migrations/202608090001_expand_garage_contract.sql",
)
const migration = readFileSync(migrationPath, "utf8")

describe("Garage shared contract 0.3 draft", () => {
  it("conforms to the repository contract-schema shape", () => {
    manifestSchema.required.forEach((property) => {
      expect(manifest).toHaveProperty(property)
    })

    expect(manifestSchema.$defs.flow.properties.id.enum).toContain("garage")
    expect(manifest.sharedFlows).toHaveLength(8)

    manifest.sharedFlows.forEach((flow) => {
      manifestSchema.$defs.flow.required.forEach((property) => {
        expect(flow).toHaveProperty(property)
      })
      expect(manifestSchema.$defs.flow.properties.id.enum).toContain(flow.id)
    })

    manifest.artifacts.forEach((artifact) => {
      manifestSchema.$defs.artifact.required.forEach((property) => {
        expect(artifact).toHaveProperty(property)
      })

      const artifactBytes = readFileSync(resolve(process.cwd(), artifact.path))
      const actualHash = createHash("sha256")
        .update(artifactBytes)
        .digest("hex")
      expect(actualHash, artifact.path).toBe(artifact.sha256)
    })
  })

  it("registers Garage in the canonical manifest", () => {
    expect(GARAGE_CONTRACT_VERSION).toBe("0.3.0-draft")
    expect(manifest.contractVersion).toBe(GARAGE_CONTRACT_VERSION)
    expect(manifest.snapshotVersion).toBe("0.3.0-draft.1")
    expect(manifest.sharedFlows.some((flow) => flow.id === "garage")).toBe(true)
  })

  it("defines only the approved service types and local odometer ownership", () => {
    expect(GARAGE_SERVICE_TYPES).toEqual(["routine", "repair"])
    expect(GARAGE_ODOMETER_OWNERSHIP).toBe("client-local-only")
    expect(GARAGE_MILEAGE_MIN).toBe(0)
    expect(GARAGE_MILEAGE_MAX).toBe(2_147_483_647)
    expect(GARAGE_PLN_DECIMAL_PLACES).toBe(2)
  })

  it("uses synthetic Garage fixtures covered by the fixture schema", () => {
    expect(fixtureSchema.properties.fixtureType.enum).toContain("garage")
    expect(garageCases.fixtureType).toBe("garage")
    expect(garageCases.contractVersion).toBe(GARAGE_CONTRACT_VERSION)
    expect(garageCases.status).toBe("proposed")
    expect(garageCases.cases.length).toBeGreaterThanOrEqual(8)

    const serialized = JSON.stringify(garageCases)
    expect(serialized).not.toMatch(/[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}/i)
    expect(serialized).not.toMatch(/[\w.+-]+@[\w.-]+\.[a-z]{2,}/i)
  })

  it("keeps every fixture on the current contract and schema shape", () => {
    const fixtureDirectory = resolve(process.cwd(), "docs/shared/fixtures")
    const fixtureFiles = readdirSync(fixtureDirectory).filter(
      (fileName) => fileName.endsWith(".json") && fileName !== "fixture.schema.json",
    )

    fixtureFiles.forEach((fileName) => {
      const fixture = JSON.parse(
        readFileSync(resolve(fixtureDirectory, fileName), "utf8"),
      ) as {
        fixtureType: string
        contractVersion: string
        status: string
        cases: Array<Record<string, unknown>>
      }

      fixtureSchema.required.forEach((property) => {
        expect(fixture, fileName).toHaveProperty(property)
      })
      expect(fixtureSchema.properties.fixtureType.enum).toContain(
        fixture.fixtureType,
      )
      expect(fixture.contractVersion).toBe(GARAGE_CONTRACT_VERSION)
      expect(Array.isArray(fixture.cases)).toBe(true)

      fixture.cases.forEach((fixtureCase) => {
        fixtureSchema.$defs.case.required.forEach((property) => {
          expect(fixtureCase, `${fileName}:${property}`).toHaveProperty(property)
        })
      })
    })
  })

  it("keeps SQL and TypeScript conflict codes aligned", () => {
    expect(GARAGE_ERROR_CODES).toContain("GARAGE_CONFLICT")
    expect(GARAGE_RPC_SQLSTATES.GARAGE_CONFLICT).toBe("CDG06")
    expect(migration).toContain("errcode = 'CDG06'")
    expect(migration).toContain("message = 'GARAGE_CONFLICT'")
  })

  it("defines an atomic owner-scoped routine RPC without client user_id", () => {
    const signature = migration.match(
      /create function public\.complete_garage_routine\(([\s\S]*?)\)\s*returns table/,
    )?.[1]

    expect(signature).toBeDefined()
    expect(signature).not.toContain("user_id")
    expect(migration).toContain("v_user_id := auth.uid()")
    expect(migration).toContain("for update")
    expect(migration).toContain(
      "v_last_change_km is distinct from p_expected_last_change_km",
    )
    expect(migration).toContain("security definer")
    expect(migration).toContain("set search_path = ''")
    expect(migration).toContain("to authenticated")
  })

  it("preserves history through ON DELETE SET NULL and legacy NOT VALID guards", () => {
    expect(migration).toContain("on delete set null")
    expect(migration).toContain("not valid")
    expect(migration).not.toContain("create table public.garage_odometer")
    expect(migration).not.toMatch(/delete\s+from\s+public\.garage_/i)
  })

  it("does not prematurely harden the deployed direct-insert policy", () => {
    expect(migration).not.toMatch(/drop\s+policy/i)
    expect(migration).not.toMatch(/alter\s+policy/i)
    expect(migration).not.toMatch(/create\s+policy/i)
  })
})
