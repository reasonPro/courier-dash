import { describe, expect, it } from "vitest";

import {
  aggregateAnnualShifts,
  safeAverage,
  type AnnualReportShift,
} from "../app/work/year/annual-report-calculations";

describe("annual report calculations", () => {
  it("includes a Stuart-only shift in income and orders", () => {
    const totals = aggregateAnnualShifts(
      [{ date: "2026-01-10", stuart: 80, orders_stuart: 4 }],
      true,
      true,
    );

    expect(totals.income).toBe(80);
    expect(totals.orders).toBe(4);
    expect(totals.platforms.stuart.income).toBe(80);
    expect(totals.platforms.stuart.orders).toBe(4);
  });

  it("includes an Other-only shift in income and orders", () => {
    const totals = aggregateAnnualShifts(
      [{ date: "2026-02-10", other_income: 70, orders_other: 3 }],
      true,
      true,
    );

    expect(totals.income).toBe(70);
    expect(totals.orders).toBe(3);
    expect(totals.platforms.other.income).toBe(70);
    expect(totals.platforms.other.orders).toBe(3);
  });

  it("adds cash tips to total income without merging their stored meaning", () => {
    const totals = aggregateAnnualShifts(
      [
        {
          date: "2026-03-10",
          uber: 100,
          tips_uber: 10,
          cash_tips_uber: 20,
        },
      ],
      true,
      true,
    );

    expect(totals.income).toBe(130);
    expect(totals.appTips).toBe(10);
    expect(totals.cashTips).toBe(20);
    expect(totals.tips).toBe(30);
  });

  it("sums every supported platform and component exactly once", () => {
    const totals = aggregateAnnualShifts(
      [
        {
          date: "2026-04-10",
          uber: 100,
          wolt: 200,
          bolt: 300,
          glovo: 400,
          stuart: 500,
          other_income: 600,
          orders_uber: 1,
          orders_wolt: 2,
          orders_bolt: 3,
          orders_glovo: 4,
          orders_stuart: 5,
          orders_other: 6,
          tips_uber: 10,
          tips_wolt: 20,
          tips_bolt: 30,
          tips_glovo: 40,
          tips_stuart: 50,
          tips_other: 60,
          cash_tips_uber: 1,
          cash_tips_wolt: 2,
          cash_tips_bolt: 3,
          cash_tips_glovo: 4,
          cash_tips_stuart: 5,
          cash_tips_other: 6,
          bonuses_uber: 5,
          bonuses_wolt: 10,
          bonuses_bolt: 15,
          bonuses_glovo: 20,
          bonuses_stuart: 25,
          bonuses_other: 30,
        },
      ],
      true,
      true,
    );

    expect(totals.baseIncome).toBe(2100);
    expect(totals.appTips).toBe(210);
    expect(totals.cashTips).toBe(21);
    expect(totals.tips).toBe(231);
    expect(totals.bonuses).toBe(105);
    expect(totals.income).toBe(2436);
    expect(totals.orders).toBe(21);
  });

  it("treats missing and null fields in an old shift as zero", () => {
    const oldShift: AnnualReportShift = {
      date: "2025-01-10",
      uber: 100,
      hours: undefined,
      km: null,
      orders_uber: null,
      stuart: undefined,
      other_income: null,
      orders_stuart: null,
      orders_other: undefined,
      cash_tips_stuart: null,
    };
    const totals = aggregateAnnualShifts([oldShift], true, true);

    expect(totals.income).toBe(100);
    expect(totals.orders).toBe(0);
    expect(totals.hours).toBe(0);
    expect(totals.km).toBe(0);
    expect(Number.isFinite(totals.income)).toBe(true);
  });

  it("returns a neutral value when orders are zero", () => {
    const totals = aggregateAnnualShifts(
      [{ date: "2026-05-10", wolt: 120, orders_wolt: 0 }],
      true,
      true,
    );

    expect(safeAverage(totals.income, totals.orders)).toBe(0);
  });

  it("returns a neutral value when hours are zero", () => {
    const totals = aggregateAnnualShifts(
      [{ date: "2026-06-10", bolt: 150, hours: 0 }],
      true,
      true,
    );

    expect(safeAverage(totals.income, totals.hours)).toBe(0);
  });

  it("keeps an empty year finite and zero-valued", () => {
    const totals = aggregateAnnualShifts([], true, true);

    expect(totals.income).toBe(0);
    expect(totals.orders).toBe(0);
    expect(totals.hours).toBe(0);
    expect(safeAverage(totals.income, totals.hours)).toBe(0);
    expect(Number.isFinite(safeAverage(totals.income, totals.orders))).toBe(
      true,
    );
  });

  it("preserves the existing Uber, Wolt, Bolt and Glovo totals", () => {
    const totals = aggregateAnnualShifts(
      [
        {
          date: "2026-07-10",
          uber: 100,
          wolt: 200,
          bolt: 300,
          glovo: 400,
          orders_uber: 2,
          orders_wolt: 3,
          orders_bolt: 4,
          orders_glovo: 5,
          tips_uber: 10,
          tips_wolt: 20,
          tips_bolt: 30,
          tips_glovo: 40,
          bonuses_uber: 1,
          bonuses_wolt: 2,
          bonuses_bolt: 3,
          bonuses_glovo: 4,
        },
      ],
      true,
      true,
    );

    expect(totals.income).toBe(1110);
    expect(totals.orders).toBe(14);
  });

  it("excludes both tip types and bonuses only from the selected total", () => {
    const totals = aggregateAnnualShifts(
      [
        {
          date: "2026-08-10",
          glovo: 100,
          tips_glovo: 10,
          cash_tips_glovo: 20,
          bonuses_glovo: 30,
        },
      ],
      false,
      false,
    );

    expect(totals.income).toBe(100);
    expect(totals.appTips).toBe(10);
    expect(totals.cashTips).toBe(20);
    expect(totals.bonuses).toBe(30);
  });
});
