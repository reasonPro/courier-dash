import type { Tables } from "../../lib/database.types";
import type { PyszneShiftColumns } from "../../docs/shared/types/work";
import type { translations, LangType } from "../../lib/translations";

export type Shift = Tables<"work_shifts"> & Partial<PyszneShiftColumns>;

export type TaxSettings = {
  uber_type: string;
  uber_val: number | string;
  wolt_type: string;
  wolt_val: number | string;
  bolt_type: string;
  bolt_val: number | string;
  glovo_type: string;
  glovo_val: number | string;
  pyszne_type: string;
  pyszne_val: number | string;
};

export type FieldSettings = {
  km: boolean;
  hours: boolean;
  orders: boolean;
};

export type WorkBreak = {
  start: string;
  end: string;
};

export type ToastMessage = {
  message: string;
  type: "error" | "warning" | "success";
};

export type WorkTranslations = typeof translations.pl;

export type WorkLanguage = LangType;
