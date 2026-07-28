"use client";

import { useState, useEffect } from "react";
import type {
  ChartData,
  ChartDatasetCustomTypesPerDataset,
} from "chart.js";
import { supabase } from "../../../lib/supabase";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useLanguage } from "../../../context/LanguageContext";
import type { PlatformKey } from "../../../lib/work-platforms";
import {
  aggregateAnnualShifts,
  getAnnualPlatformIncome,
  safeAverage,
  type AnnualReportShift,
} from "./annual-report-calculations";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  LineController,
  BarController,
  ArcElement,
  Title,
  Tooltip as ChartTooltip,
  Legend,
} from "chart.js";
import { Bar, Doughnut } from "react-chartjs-2";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  LineController,
  BarController,
  ArcElement,
  Title,
  ChartTooltip,
  Legend
);

export default function YearReport() {
  const router = useRouter();
  const { lang, t } = useLanguage();
  const [userId, setUserId] = useState<string | null>(null);
  const [shifts, setShifts] = useState<AnnualReportShift[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear().toString());
  
  const [includeTips, setIncludeTips] = useState(true);
  const [includeBonuses, setIncludeBonuses] = useState(true);
  
  const [showYearRecords, setShowYearRecords] = useState(false);
  const [expandedMonth, setExpandedMonth] = useState<string | null>(null);

  const dateLocale = lang === "uk" ? "uk-UA" : lang === "pl" ? "pl-PL" : lang === "ru" ? "ru-RU" : "en-US";

  const fetchYearShifts = async (uid: string) => {
    setIsLoading(true);
    const { data, error } = await supabase
      .from("work_shifts")
      .select("*")
      .eq("user_id", uid)
      .order("date", { ascending: true });
    if (!error && data) setShifts(data);
    setIsLoading(false);
  };

  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push("/");
      } else {
        setUserId(session.user.id);
        fetchYearShifts(session.user.id);
      }
    };
    checkUser();
  }, [router]);

  if (!userId) return <div className="min-h-screen bg-[#121212] text-white flex items-center justify-center">{t.common.loading}</div>;

  const yearShifts = shifts.filter(s => s.date.startsWith(selectedYear));

  const platformDefinitions: {
    id: PlatformKey;
    name: string;
    chartBackground: string;
    chartBorder: string;
    cardColor: string;
  }[] = [
    { id: "uber", name: "Uber", chartBackground: "rgba(75, 85, 99, 0.4)", chartBorder: "rgba(75, 85, 99, 1)", cardColor: "border-gray-600 bg-gray-900/10" },
    { id: "wolt", name: "Wolt", chartBackground: "rgba(0, 194, 232, 0.4)", chartBorder: "rgba(0, 194, 232, 1)", cardColor: "border-cyan-600 bg-cyan-900/10" },
    { id: "bolt", name: "Bolt", chartBackground: "rgba(34, 197, 94, 0.4)", chartBorder: "rgba(34, 197, 94, 1)", cardColor: "border-green-600 bg-green-900/10" },
    { id: "glovo", name: "Glovo", chartBackground: "rgba(234, 179, 8, 0.4)", chartBorder: "rgba(234, 179, 8, 1)", cardColor: "border-yellow-600 bg-yellow-900/10" },
    { id: "stuart", name: "Stuart", chartBackground: "rgba(249, 115, 22, 0.4)", chartBorder: "rgba(249, 115, 22, 1)", cardColor: "border-orange-600 bg-orange-900/10" },
    { id: "other", name: t.work.otherPlatform, chartBackground: "rgba(99, 102, 241, 0.4)", chartBorder: "rgba(99, 102, 241, 1)", cardColor: "border-indigo-600 bg-indigo-900/10" },
  ];

  const monthsData = Array.from({ length: 12 }, (_, i) => {
    const monthNum = String(i + 1).padStart(2, "0");
    const monthShifts = yearShifts.filter(
      (shift) => shift.date.split("-")[1] === monthNum,
    );

    return {
      monthNum,
      name: new Date(2026, i, 1).toLocaleDateString(dateLocale, { month: "long" }),
      ...aggregateAnnualShifts(monthShifts, includeTips, includeBonuses),
    };
  });

  const yearlyTotals = aggregateAnnualShifts(
    yearShifts,
    includeTips,
    includeBonuses,
  );
  const platformTotals = yearlyTotals.platforms;
  const absoluteYearlyTotal =
    yearlyTotals.baseIncome + yearlyTotals.tips + yearlyTotals.bonuses;

  const yearlyAvgHour = safeAverage(yearlyTotals.income, yearlyTotals.hours).toFixed(2);
  const yearlyAvgKm = safeAverage(yearlyTotals.income, yearlyTotals.km).toFixed(2);
  const yearlyAvgOrder = safeAverage(yearlyTotals.income, yearlyTotals.orders).toFixed(2);
  const globalTipsPercent = (
    safeAverage(yearlyTotals.tips, absoluteYearlyTotal) * 100
  ).toFixed(1);

  // =========================================================
  // РЕКОРДИ ТА КРАЩІ ПОКАЗНИКИ
  // =========================================================
  let bestMonthName = "-", maxMonthIncome = 0;
  let maxMonthHourlyRateName = "-", maxMonthHourlyRate = 0;

  monthsData.forEach(m => {
    if (m.daysCount > 0) {
      const mTotal = m.income;

      if (mTotal > maxMonthIncome) { maxMonthIncome = mTotal; bestMonthName = m.name; }

      const mRate = safeAverage(mTotal, m.hours);
      if (mRate > maxMonthHourlyRate) { maxMonthHourlyRate = mRate; maxMonthHourlyRateName = m.name; }
    }
  });

  let bestDayDate = "-", bestDayIncome = 0;
  let maxDayTipsDate = "-", maxDayTips = 0;
  let maxDayHourlyRateDate = "-", maxDayHourlyRate = 0;
  let maxDayOrdersDate = "-", maxDayOrders = 0;

  yearShifts.forEach(shift => {
    const dailyTotals = aggregateAnnualShifts(
      [shift],
      includeTips,
      includeBonuses,
    );
    const dailyTotal = dailyTotals.income;
    const dailyTips = dailyTotals.tips;

    if (dailyTotal > bestDayIncome) { bestDayIncome = dailyTotal; bestDayDate = shift.date; }
    if (dailyTips > maxDayTips) { maxDayTips = dailyTips; maxDayTipsDate = shift.date; }
    
    const dailyRate = safeAverage(dailyTotal, dailyTotals.hours);
    if (dailyRate > maxDayHourlyRate) { maxDayHourlyRate = dailyRate; maxDayHourlyRateDate = shift.date; }

    const dailyOrders = dailyTotals.orders;
    if (dailyOrders > maxDayOrders) { maxDayOrders = dailyOrders; maxDayOrdersDate = shift.date; }
  });

  const formatDate = (dateStr: string) => {
    if (dateStr === "-") return "-";
    return new Date(dateStr).toLocaleDateString(dateLocale, { day: 'numeric', month: 'short' });
  };

  // =========================================================
  // НАЛАШТУВАННЯ ГРАФІКІВ
  // =========================================================
  const chartDatasets: ChartDatasetCustomTypesPerDataset<
    "bar" | "line",
    number[]
  >[] = platformDefinitions.map((platform) => ({
    type: "bar" as const,
    label: platform.name,
    data: monthsData.map((month) => month.platforms[platform.id].income),
    backgroundColor: platform.chartBackground,
    borderColor: platform.chartBorder,
    borderWidth: 1,
    stack: "Stack 0",
    order: 2,
  }));

  if (includeTips) {
    chartDatasets.push({ type: 'bar', label: t.work.tipsLabel, data: monthsData.map(m => m.tips), backgroundColor: "rgba(244, 63, 94, 0.4)", borderColor: "rgba(244, 63, 94, 1)", borderWidth: 1, stack: 'Stack 0', order: 2 });
  }
  if (includeBonuses) {
    chartDatasets.push({ type: 'bar', label: t.work.bonusesLabel, data: monthsData.map(m => m.bonuses), backgroundColor: "rgba(168, 85, 247, 0.4)", borderColor: "rgba(168, 85, 247, 1)", borderWidth: 1, stack: 'Stack 0', order: 2 });
  }

  chartDatasets.push({
    type: 'line', label: t.yearReport.ratePerHour,
    data: monthsData.map(m => Number(safeAverage(m.income, m.hours).toFixed(2))),
    borderColor: "#00e5ff", backgroundColor: "#00e5ff", borderWidth: 3, pointRadius: 4, tension: 0.3, yAxisID: 'y1', order: 1
  });

  const yearChartData = {
    labels: monthsData.map(m => m.name.substring(0, 3)),
    datasets: chartDatasets
  };

  const yearChartOptions = {
    responsive: true, maintainAspectRatio: false,
    scales: {
      x: { stacked: true, grid: { display: false } },
      y: { stacked: true, type: 'linear' as const, position: 'left' as const, grid: { color: 'rgba(255, 255, 255, 0.03)' } },
      y1: { stacked: false, type: 'linear' as const, position: 'right' as const, grid: { drawOnChartArea: false } },
    },
    plugins: { legend: { labels: { color: '#a0a0a0', boxWidth: 12 } } }
  };

  const doughnutData = {
    labels: platformDefinitions.map((platform) => platform.name),
    datasets: [{
      data: platformDefinitions.map((platform) =>
        getAnnualPlatformIncome(
          platformTotals[platform.id],
          includeTips,
          includeBonuses,
        ),
      ),
      backgroundColor: platformDefinitions.map((platform) =>
        platform.chartBackground.replace("0.4", "0.8"),
      ),
      borderColor: '#1e1e24',
      borderWidth: 2,
    }]
  };

  const doughnutOptions = {
    responsive: true, maintainAspectRatio: false,
    plugins: { legend: { position: 'bottom' as const, labels: { color: '#a0a0a0', boxWidth: 12 } } }
  };

  return (
    <div className="min-h-screen bg-[#121212] text-white p-4 md:p-10">
      <div className="max-w-6xl mx-auto">
        
        <div className="flex justify-between items-center mb-6 border-b border-gray-800 pb-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-black">{t.work.yearReportBtn}</h1>
            <p className="text-xs text-gray-500 mt-1">{t.yearReport.subtitle}</p>
          </div>
          <Link href="/work" className="bg-gray-800 hover:bg-gray-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition">
            🔙 {t.yearReport.back}
          </Link>
        </div>

        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 bg-[#1e1e24] p-4 rounded-xl border border-gray-800">
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-400">{t.yearReport.yearLabel}</span>
            <select value={selectedYear} onChange={(e) => setSelectedYear(e.target.value)} className="bg-[#2a2a35] border border-gray-700 rounded-lg p-2 text-white font-bold focus:outline-none">
              {["2025", "2026", "2027"].map(y => <option key={y} value={y}>{y}</option>)}
            </select>
          </div>
          <div className="flex gap-2">
            <button onClick={() => setIncludeTips(!includeTips)} className={`px-4 py-2 rounded-full text-xs font-bold transition border shadow-sm ${includeTips ? 'bg-rose-500/20 text-rose-400 border-rose-500/50' : 'bg-[#121212] text-gray-500 border-gray-800 hover:text-gray-300'}`}>
               {includeTips ? "✓ " : "+ "}{t.work.toggleTips}
            </button>
            <button onClick={() => setIncludeBonuses(!includeBonuses)} className={`px-4 py-2 rounded-full text-xs font-bold transition border shadow-sm ${includeBonuses ? 'bg-purple-500/20 text-purple-400 border-purple-500/50' : 'bg-[#121212] text-gray-500 border-gray-800 hover:text-gray-300'}`}>
               {includeBonuses ? "✓ " : "+ "}{t.work.toggleBonuses}
            </button>
          </div>
        </div>

        {yearShifts.length > 0 && (
          <div className="mb-6">
            <button onClick={() => setShowYearRecords(!showYearRecords)} className="w-full bg-[#24242d] hover:bg-[#2c2c38] border border-gray-800 p-4 rounded-xl font-bold text-yellow-500 transition flex justify-between items-center text-sm md:text-base shadow-md">
              <span className="flex items-center gap-2">{t.yearReport.recordsTitle.replace("{year}", selectedYear)}</span>
              <span className="text-xs bg-gray-800 px-3 py-1 rounded text-gray-400">{showYearRecords ? t.yearReport.hideRecords : t.yearReport.showRecords}</span>
            </button>
            
            <div className={`transition-all duration-500 ease-in-out overflow-hidden ${showYearRecords ? "max-h-[1000px] opacity-100 mt-3" : "max-h-0 opacity-0"}`}>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3 bg-gradient-to-b from-[#1e1e24] to-[#17171d] p-4 md:p-5 rounded-xl border border-yellow-600/30 shadow-inner">
                <div className="bg-[#121212]/50 p-3.5 rounded-xl border border-gray-800/80">
                  <span className="block text-[10px] uppercase font-bold text-gray-500 tracking-wider mb-1">{t.yearReport.bestMonth}</span>
                  <span className="text-sm font-black text-white capitalize block mb-0.5">{bestMonthName}</span>
                  <span className="text-base font-black text-green-400">{maxMonthIncome.toFixed(2)} <span className="text-[10px] font-normal">{t.common.currency}</span></span>
                </div>
                <div className="bg-[#121212]/50 p-3.5 rounded-xl border border-gray-800/80">
                  <span className="block text-[10px] uppercase font-bold text-gray-500 tracking-wider mb-1">{t.yearReport.bestDay}</span>
                  <span className="text-sm font-black text-white block mb-0.5">{formatDate(bestDayDate)}</span>
                  <span className="text-base font-black text-green-400">{bestDayIncome.toFixed(2)} <span className="text-[10px] font-normal">{t.common.currency}</span></span>
                </div>
                <div className="bg-[#121212]/50 p-3.5 rounded-xl border border-gray-800/80">
                  <span className="block text-[10px] uppercase font-bold text-rose-500 tracking-wider mb-1">{t.yearReport.maxDailyTips}</span>
                  <span className="text-sm font-black text-white block mb-0.5">{formatDate(maxDayTipsDate)}</span>
                  <span className="text-base font-black text-rose-400">{maxDayTips.toFixed(2)} <span className="text-[10px] font-normal">{t.common.currency}</span></span>
                </div>
                <div className="bg-[#121212]/50 p-3.5 rounded-xl border border-gray-800/80">
                  <span className="block text-[10px] uppercase font-bold text-cyan-500 tracking-wider mb-1">{t.yearReport.maxDailyRate}</span>
                  <span className="text-sm font-black text-white block mb-0.5">{formatDate(maxDayHourlyRateDate)}</span>
                  <span className="text-base font-black text-cyan-400">{maxDayHourlyRate.toFixed(2)} <span className="text-[10px] font-normal">{t.yearReport.hourlyRateUnit}</span></span>
                </div>
                <div className="bg-[#121212]/50 p-3.5 rounded-xl border border-gray-800/80">
                  <span className="block text-[10px] uppercase font-bold text-cyan-500 tracking-wider mb-1">{t.yearReport.maxMonthlyRate}</span>
                  <span className="text-sm font-black text-white capitalize block mb-0.5">{maxMonthHourlyRateName}</span>
                  <span className="text-base font-black text-cyan-400">{maxMonthHourlyRate.toFixed(2)} <span className="text-[10px] font-normal">{t.yearReport.hourlyRateUnit}</span></span>
                </div>
                <div className="bg-[#121212]/50 p-3.5 rounded-xl border border-gray-800/80">
                  <span className="block text-[10px] uppercase font-bold text-blue-500 tracking-wider mb-1">{t.yearReport.maxDailyOrders}</span>
                  <span className="text-sm font-black text-white block mb-0.5">{formatDate(maxDayOrdersDate)}</span>
                  <span className="text-base font-black text-blue-400">{maxDayOrders} <span className="text-[10px] font-normal">{t.yearReport.ordersShort}</span></span>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-6">
          <div className="col-span-2 md:col-span-1 bg-gradient-to-br from-[#1e1e24] to-[#252530] p-4 rounded-xl border border-gray-800 text-center shadow-md">
            <h3 className="text-gray-400 text-[10px] md:text-xs uppercase tracking-wider mb-1">{t.yearReport.annualIncome}</h3>
            <p className="text-2xl md:text-3xl font-black text-green-400">{yearlyTotals.income.toFixed(2)} <span className="text-xs font-normal">{t.common.currency}</span></p>
          </div>
          <div className="bg-[#1e1e24] p-4 rounded-xl border border-gray-800 text-center flex flex-col justify-center">
            <h3 className="text-gray-400 text-[10px] md:text-xs uppercase tracking-wider mb-1">{t.yearReport.avgHourlyRate}</h3>
            <p className="text-xl font-bold text-cyan-400">{yearlyAvgHour}</p>
          </div>
          <div className="bg-[#1e1e24] p-4 rounded-xl border border-gray-800 text-center flex flex-col justify-center">
            <h3 className="text-gray-400 text-[10px] md:text-xs uppercase tracking-wider mb-1">{t.yearReport.avgPerKm}</h3>
            <p className="text-xl font-bold text-purple-400">{yearlyAvgKm}</p>
          </div>
          <div className="bg-[#1e1e24] p-4 rounded-xl border border-gray-800 text-center flex flex-col justify-center">
            <h3 className="text-gray-400 text-[10px] md:text-xs uppercase tracking-wider mb-1">{t.yearReport.avgPerOrder}</h3>
            <p className="text-xl font-bold text-yellow-400">{yearlyAvgOrder}</p>
          </div>
          <div className="bg-[#1e1e24] p-4 rounded-xl border border-gray-800 text-center flex flex-col justify-center">
            <h3 className="text-gray-400 text-[10px] md:text-xs uppercase tracking-wider mb-1">{t.work.tipsPercent}</h3>
            <p className="text-xl font-bold text-rose-400">{globalTipsPercent}%</p>
          </div>
        </div>

        {/* 📊 ГРАФІКИ РОКУ */}
        {yearShifts.length > 0 && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            <div className="lg:col-span-2 bg-[#1e1e24] p-4 md:p-6 rounded-xl border border-gray-800 shadow-sm">
              <h3 className="text-sm font-medium text-gray-400 mb-4 uppercase tracking-wider">{t.yearReport.incomeTrend}</h3>
              <div className="w-full h-72 relative">
                <Bar
                  data={yearChartData as ChartData<"bar", number[], string>}
                  options={yearChartOptions}
                />
              </div>
            </div>
            <div className="bg-[#1e1e24] p-4 md:p-6 rounded-xl border border-gray-800 shadow-sm flex flex-col">
              <h3 className="text-sm font-medium text-gray-400 mb-4 uppercase tracking-wider">{t.yearReport.platformShare}</h3>
              <div className="flex-1 w-full h-64 relative flex items-center justify-center">
                <Doughnut data={doughnutData} options={doughnutOptions} />
              </div>
            </div>
          </div>
        )}

        <div className="hidden md:block bg-[#1e1e24] rounded-xl border border-gray-800 overflow-hidden mb-8">
          <table className="w-full text-left border-collapse whitespace-nowrap">
            <thead>
              <tr className="bg-[#2a2a35] text-gray-400 text-[11px] uppercase tracking-wider border-b border-gray-800">
                <th className="p-4 font-bold text-gray-300">{t.yearReport.month}</th>
                <th className="p-4 font-bold text-green-400">{t.yearReport.totalIncome}</th>
                <th className="p-4">{t.yearReport.orders}</th>
                <th className="p-4">{t.yearReport.hours}</th>
                <th className="p-4">{t.yearReport.distance}</th>
                <th className="p-4 text-cyan-400 border-l border-gray-800">{t.yearReport.ratePerHour}</th>
                <th className="p-4 text-purple-400">{t.yearReport.ratePerKm}</th>
                <th className="p-4 text-yellow-400">{t.yearReport.ratePerOrder}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800 text-sm">
              {isLoading ? (
                <tr><td colSpan={8} className="p-8 text-center text-gray-500">{t.common.loading}</td></tr>
              ) : yearShifts.length === 0 ? (
                <tr><td colSpan={8} className="p-8 text-center text-gray-500">{t.work.noRecords}</td></tr>
              ) : (
                monthsData.map((m) => {
                  if (m.daysCount === 0) return null;

                  const mAvgHour = safeAverage(m.income, m.hours).toFixed(2);
                  const mAvgKm = safeAverage(m.income, m.km).toFixed(2);
                  const mAvgOrder = safeAverage(m.income, m.orders).toFixed(2);
                  const tooltipText = platformDefinitions
                    .map((platform) => {
                      const platformIncome = getAnnualPlatformIncome(
                        m.platforms[platform.id],
                        includeTips,
                        includeBonuses,
                      );
                      return `${platform.name}: ${platformIncome.toFixed(2)} ${t.common.currency}`;
                    })
                    .join("\n");

                  return (
                    <tr key={m.monthNum} className="hover:bg-[#2a2a35] transition cursor-help" title={tooltipText}>
                      <td className="p-4 font-bold capitalize">{m.name}</td>
                      <td className="p-4 font-black text-green-400">{m.income.toFixed(2)}</td>
                      <td className="p-4 text-blue-400 font-bold">{m.orders}</td>
                      <td className="p-4">{m.hours.toFixed(1)}</td>
                      <td className="p-4 text-gray-400">{m.km.toFixed(1)}</td>
                      <td className="p-4 text-cyan-400 font-bold border-l border-gray-800">{mAvgHour}</td>
                      <td className="p-4 text-purple-400 font-bold">{mAvgKm}</td>
                      <td className="p-4 text-yellow-400 font-bold">{mAvgOrder}</td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        <div className="md:hidden flex flex-col gap-2 mb-8">
          {isLoading ? (
            <div className="text-center text-gray-500 p-4 bg-[#1e1e24] rounded-xl border border-gray-800">{t.common.loading}</div>
          ) : yearShifts.length === 0 ? (
            <div className="text-center text-gray-500 p-4 bg-[#1e1e24] rounded-xl border border-gray-800">{t.work.noRecords}</div>
          ) : (
            monthsData.map((m) => {
              if (m.daysCount === 0) return null;

              const isExpanded = expandedMonth === m.monthNum;

              return (
                <div key={m.monthNum} className="bg-[#1e1e24] rounded-xl border border-gray-800 overflow-hidden shadow-sm">
                  <button onClick={() => setExpandedMonth(isExpanded ? null : m.monthNum)} className="w-full p-4 flex justify-between items-center text-left bg-[#252530]/40 hover:bg-[#252530] transition">
                    <div>
                      <span className="font-bold text-white capitalize text-base">{m.name}</span>
                      <span className="text-[10px] text-gray-500 block">{t.yearReport.workingDays.replace("{count}", String(m.daysCount))}</span>
                    </div>
                    <div className="text-right flex items-center gap-3">
                      <span className="font-black text-green-400 text-base">{m.income.toFixed(2)} {t.common.currency}</span>
                      <span className="text-gray-500 text-xs">{isExpanded ? "▲" : "▼"}</span>
                    </div>
                  </button>

                  <div className={`transition-all duration-300 ease-in-out overflow-hidden ${isExpanded ? "max-h-[500px] border-t border-gray-800 p-4 bg-[#17171d]" : "max-h-0"}`}>
                    <div className="grid grid-cols-2 gap-3 mb-4 text-xs">
                      <div className="bg-[#2a2a35]/40 p-2 rounded-lg"><span>{t.yearReport.hours}:</span> <strong className="text-white float-right">{m.hours.toFixed(1)}</strong></div>
                      <div className="bg-[#2a2a35]/40 p-2 rounded-lg"><span>{t.work.totalKm}:</span> <strong className="text-purple-400 float-right">{m.km.toFixed(1)} {t.common.km}</strong></div>
                      <div className="bg-[#2a2a35]/40 p-2 rounded-lg"><span>{t.yearReport.orders}:</span> <strong className="text-blue-400 float-right">{m.orders}</strong></div>
                      <div className="bg-[#2a2a35]/40 p-2 rounded-lg"><span>{t.yearReport.ratePerHour}:</span> <strong className="text-cyan-400 float-right">{safeAverage(m.income, m.hours).toFixed(2)}</strong></div>
                    </div>

                    <span className="text-[9px] uppercase font-bold tracking-wider text-gray-500 block mb-2">{t.yearReport.platformBreakdown}</span>
                    <div className="space-y-1.5 text-xs">
                      {platformDefinitions.map((platform) => {
                        const metrics = m.platforms[platform.id];
                        const platformIncome = getAnnualPlatformIncome(
                          metrics,
                          includeTips,
                          includeBonuses,
                        );
                        if (platformIncome === 0 && metrics.orders === 0) return null;

                        return (
                          <div key={platform.id} className="bg-[#22222a] p-2.5 rounded-lg border border-gray-800 flex justify-between items-center">
                            <span className="font-bold text-gray-300">{platform.name}</span>
                            <div className="text-right">
                              <span className="font-bold text-white block">{platformIncome.toFixed(2)} {t.common.currency}</span>
                              <span className="text-[9px] text-gray-500">
                                {t.yearReport.platformDetails
                                  .replace("{base}", metrics.income.toFixed(2))
                                  .replace("{tips}", metrics.tips.toFixed(2))
                                  .replace("{bonuses}", metrics.bonuses.toFixed(2))}
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        <div className="border-t border-gray-800 pt-6">
          <h2 className="text-sm font-bold mb-4 text-gray-400 uppercase tracking-wider">{t.yearReport.platformSummary}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
            {platformDefinitions.map((platform) => {
              const data = platformTotals[platform.id];
              const total = getAnnualPlatformIncome(
                data,
                includeTips,
                includeBonuses,
              );
              const absTotalForPercent = data.income + data.tips + data.bonuses;
              const tipsPercent = (
                safeAverage(data.tips, absTotalForPercent) * 100
              ).toFixed(1);

              return (
                <div key={platform.id} className={`p-4 rounded-xl border ${platform.cardColor} shadow-sm flex flex-col gap-2 relative overflow-hidden`}>
                  <div className="flex justify-between items-start z-10">
                    <h3 className="font-black text-lg text-white">{platform.name}</h3>
                    {data.tips > 0 && (
                      <span className="text-[10px] font-bold text-rose-400 bg-rose-500/10 px-2 py-1 rounded-md border border-rose-500/20">
                        {t.yearReport.tipsShare.replace("{percent}", tipsPercent)}
                      </span>
                    )}
                  </div>
                  <div className="text-2xl font-black text-green-400 mb-1 z-10">{total.toFixed(2)} <span className="text-xs font-normal">{t.common.currency}</span></div>
                  <div className="text-xs space-y-1 text-gray-400 border-t border-gray-800/60 pt-2 z-10">
                    <div className="flex justify-between"><span>{t.yearReport.baseRate}</span><strong className="text-white">{data.income.toFixed(2)} {t.common.currency}</strong></div>
                    <div className="flex justify-between text-rose-400"><span>{t.yearReport.totalTips}</span><strong>{data.tips.toFixed(2)} {t.common.currency}</strong></div>
                    <div className="flex justify-between text-purple-400"><span>{t.yearReport.totalBonuses}</span><strong>{data.bonuses.toFixed(2)} {t.common.currency}</strong></div>
                    <div className="flex justify-between text-blue-400 border-t border-gray-800/40 mt-1 pt-1"><span>{t.yearReport.orders}:</span><strong>{data.orders} {t.yearReport.ordersShort}</strong></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </div>
    </div>
  );
}
