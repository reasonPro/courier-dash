import type { Database } from "./database.types"
import type { PyszneShiftColumns, PyszneTaxColumns } from "../docs/shared/types/work"

// Explicit local schema extension, not a hand-edited generated artifact.
// Requires 202609160001 before writes. Replace after verified type generation.
type ExtendTable<T extends { Row: object; Insert: object; Update: object }, C> =
  Omit<T, "Row" | "Insert" | "Update"> & {
    Row: T["Row"] & Partial<C>
    Insert: T["Insert"] & Partial<C>
    Update: T["Update"] & Partial<C>
  }
type Tables = Database["public"]["Tables"]
export type WorkDatabase = Omit<Database, "public"> & {
  public: Omit<Database["public"], "Tables"> & {
    Tables: Omit<Tables, "work_shifts" | "tax_settings"> & {
      work_shifts: ExtendTable<Tables["work_shifts"], PyszneShiftColumns>
      tax_settings: ExtendTable<Tables["tax_settings"], PyszneTaxColumns>
    }
  }
}
