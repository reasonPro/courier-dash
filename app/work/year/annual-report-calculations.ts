import type { Tables } from "../../../lib/database.types";
import {
  PLATFORM_KEYS,
  getPlatformMetrics,
  type PlatformKey,
  type PlatformMetricSource,
  type PlatformMetrics,
} from "../../../lib/work-platforms";

type WorkShiftRow = Tables<"work_shifts">;

export type AnnualReportShift = PlatformMetricSource &
  Pick<WorkShiftRow, "date"> & {
    hours?: WorkShiftRow["hours"] | null;
    km?: WorkShiftRow["km"] | null;
  };

export type AnnualPlatformTotals = Record<PlatformKey, PlatformMetrics>;

export type AnnualReportTotals = {
  platforms: AnnualPlatformTotals;
  income: number;
  baseIncome: number;
  orders: number;
  appTips: number;
  cashTips: number;
  tips: number;
  bonuses: number;
  hours: number;
  km: number;
  daysCount: number;
};

function finiteNumber(value: number | null | undefined) {
  return typeof value === "number" && Number.isFinite(value) ? value : 0;
}

function createEmptyPlatformTotals(): AnnualPlatformTotals {
  return {
    uber: { income: 0, orders: 0, appTips: 0, cashTips: 0, tips: 0, bonuses: 0 },
    wolt: { income: 0, orders: 0, appTips: 0, cashTips: 0, tips: 0, bonuses: 0 },
    bolt: { income: 0, orders: 0, appTips: 0, cashTips: 0, tips: 0, bonuses: 0 },
    glovo: { income: 0, orders: 0, appTips: 0, cashTips: 0, tips: 0, bonuses: 0 },
    stuart: { income: 0, orders: 0, appTips: 0, cashTips: 0, tips: 0, bonuses: 0 },
    other: { income: 0, orders: 0, appTips: 0, cashTips: 0, tips: 0, bonuses: 0 },
  };
}

function getFinitePlatformMetrics(
  shift: AnnualReportShift,
  platform: PlatformKey,
): PlatformMetrics {
  const metrics = getPlatformMetrics(shift, platform);
  const appTips = finiteNumber(metrics.appTips);
  const cashTips = finiteNumber(metrics.cashTips);

  return {
    income: finiteNumber(metrics.income),
    orders: finiteNumber(metrics.orders),
    appTips,
    cashTips,
    tips: appTips + cashTips,
    bonuses: finiteNumber(metrics.bonuses),
  };
}

export function getAnnualPlatformIncome(
  metrics: PlatformMetrics,
  includeTips: boolean,
  includeBonuses: boolean,
) {
  return (
    finiteNumber(metrics.income) +
    (includeTips ? finiteNumber(metrics.tips) : 0) +
    (includeBonuses ? finiteNumber(metrics.bonuses) : 0)
  );
}

export function aggregateAnnualShifts(
  shifts: AnnualReportShift[],
  includeTips: boolean,
  includeBonuses: boolean,
): AnnualReportTotals {
  const platforms = createEmptyPlatformTotals();
  let hours = 0;
  let km = 0;

  shifts.forEach((shift) => {
    hours += finiteNumber(shift.hours);
    km += finiteNumber(shift.km);

    PLATFORM_KEYS.forEach((platform) => {
      const metrics = getFinitePlatformMetrics(shift, platform);
      const totals = platforms[platform];

      totals.income += metrics.income;
      totals.orders += metrics.orders;
      totals.appTips += metrics.appTips;
      totals.cashTips += metrics.cashTips;
      totals.tips += metrics.tips;
      totals.bonuses += metrics.bonuses;
    });
  });

  let income = 0;
  let baseIncome = 0;
  let orders = 0;
  let appTips = 0;
  let cashTips = 0;
  let tips = 0;
  let bonuses = 0;

  PLATFORM_KEYS.forEach((platform) => {
    const metrics = platforms[platform];

    income += getAnnualPlatformIncome(metrics, includeTips, includeBonuses);
    baseIncome += metrics.income;
    orders += metrics.orders;
    appTips += metrics.appTips;
    cashTips += metrics.cashTips;
    tips += metrics.tips;
    bonuses += metrics.bonuses;
  });

  return {
    platforms,
    income,
    baseIncome,
    orders,
    appTips,
    cashTips,
    tips,
    bonuses,
    hours,
    km,
    daysCount: shifts.length,
  };
}

export function safeAverage(
  numerator: number | null | undefined,
  denominator: number | null | undefined,
) {
  const safeNumerator = finiteNumber(numerator);
  const safeDenominator = finiteNumber(denominator);

  return safeDenominator > 0 ? safeNumerator / safeDenominator : 0;
}
