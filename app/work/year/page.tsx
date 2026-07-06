"use client";

import { useState, useEffect } from "react";
import { supabase } from "../../../lib/supabase";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useLanguage } from "../../../context/LanguageContext";
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

type Shift = {
  id: number;
  date: string;
  km: number;
  hours: number;
  uber: number;
  wolt: number;
  bolt: number;
  glovo: number;
  orders_uber: number;
  orders_wolt: number;
  orders_bolt: number;
  orders_glovo: number;
  tips_uber: number;
  tips_wolt: number;
  tips_bolt: number;
  tips_glovo: number;
  bonuses_uber: number;
  bonuses_wolt: number;
  bonuses_bolt: number;
  bonuses_glovo: number;
  user_id: string;
};

export default function YearReport() {
  const router = useRouter();
  const { lang, t } = useLanguage();
  const [userId, setUserId] = useState<string | null>(null);
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear().toString());
  
  const [includeTips, setIncludeTips] = useState(true);
  const [includeBonuses, setIncludeBonuses] = useState(true);
  
  const [showYearRecords, setShowYearRecords] = useState(false);
  const [expandedMonth, setExpandedMonth] = useState<string | null>(null);

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

  if (!userId) return <div className="min-h-screen bg-[#121212] text-white flex items-center justify-center">{t.common.loading}</div>;

  const yearShifts = shifts.filter(s => s.date.startsWith(selectedYear));

  const monthsData = Array.from({ length: 12 }, (_, i) => {
    const monthNum = String(i + 1).padStart(2, "0");
    return {
      monthNum,
      name: new Date(2026, i, 1).toLocaleDateString(lang === "uk" ? "uk-UA" : lang === "pl" ? "pl-PL" : "en-US", { month: "long" }),
      uber: 0, wolt: 0, bolt: 0, glovo: 0,
      orders_uber: 0, orders_wolt: 0, orders_bolt: 0, orders_glovo: 0,
      tips_uber: 0, tips_wolt: 0, tips_bolt: 0, tips_glovo: 0,
      bonuses_uber: 0, bonuses_wolt: 0, bonuses_bolt: 0, bonuses_glovo: 0,
      km: 0, hours: 0, daysCount: 0
    };
  });

  yearShifts.forEach(shift => {
    const monthIndex = parseInt(shift.date.split("-")[1]) - 1;
    if (monthIndex >= 0 && monthIndex < 12) {
      const m = monthsData[monthIndex];
      m.daysCount += 1;
      m.hours += shift.hours;
      m.km += shift.km;
      
      m.uber += shift.uber;
      m.wolt += shift.wolt;
      m.bolt += shift.bolt;
      m.glovo += shift.glovo;

      m.orders_uber += shift.orders_uber || 0;
      m.orders_wolt += shift.orders_wolt || 0;
      m.orders_bolt += shift.orders_bolt || 0;
      m.orders_glovo += shift.orders_glovo || 0;

      m.tips_uber += shift.tips_uber || 0;
      m.tips_wolt += shift.tips_wolt || 0;
      m.tips_bolt += shift.tips_bolt || 0;
      m.tips_glovo += shift.tips_glovo || 0;

      m.bonuses_uber += shift.bonuses_uber || 0;
      m.bonuses_wolt += shift.bonuses_wolt || 0;
      m.bonuses_bolt += shift.bonuses_bolt || 0;
      m.bonuses_glovo += shift.bonuses_glovo || 0;
    }
  });

  let yearlyIncome = 0, yearlyHours = 0, yearlyKm = 0, yearlyOrders = 0;
  let absoluteYearlyTips = 0, absoluteYearlyTotal = 0;

  const platformTotals = {
    uber: { base: 0, orders: 0, tips: 0, bonuses: 0 },
    wolt: { base: 0, orders: 0, tips: 0, bonuses: 0 },
    bolt: { base: 0, orders: 0, tips: 0, bonuses: 0 },
    glovo: { base: 0, orders: 0, tips: 0, bonuses: 0 },
  };

  monthsData.forEach(m => {
    const platforms = ["uber", "wolt", "bolt", "glovo"] as const;
    platforms.forEach(p => {
      platformTotals[p].base += m[p];
      platformTotals[p].orders += m[`orders_${p}`];
      platformTotals[p].tips += m[`tips_${p}`];
      platformTotals[p].bonuses += m[`bonuses_${p}`];

      let platTotal = m[p];
      if (includeTips) platTotal += m[`tips_${p}`];
      if (includeBonuses) platTotal += m[`bonuses_${p}`];
      yearlyIncome += platTotal;
    });

    yearlyHours += m.hours;
    yearlyKm += m.km;
    yearlyOrders += (m.orders_uber + m.orders_wolt + m.orders_bolt + m.orders_glovo);
    
    // Для розрахунку відсотка чаю беремо завжди абсолютні повні суми
    const mTips = m.tips_uber + m.tips_wolt + m.tips_bolt + m.tips_glovo;
    const mBaseAndBonuses = m.uber + m.wolt + m.bolt + m.glovo + m.bonuses_uber + m.bonuses_wolt + m.bonuses_bolt + m.bonuses_glovo;
    absoluteYearlyTips += mTips;
    absoluteYearlyTotal += (mTips + mBaseAndBonuses);
  });

  const yearlyAvgHour = yearlyHours > 0 ? (yearlyIncome / yearlyHours).toFixed(2) : "0.00";
  const yearlyAvgKm = yearlyKm > 0 ? (yearlyIncome / yearlyKm).toFixed(2) : "0.00";
  const yearlyAvgOrder = yearlyOrders > 0 ? (yearlyIncome / yearlyOrders).toFixed(2) : "0.00";
  const globalTipsPercent = absoluteYearlyTotal > 0 ? ((absoluteYearlyTips / absoluteYearlyTotal) * 100).toFixed(1) : "0.0";

  // =========================================================
  // РЕКОРДИ ТА КРАЩІ ПОКАЗНИКИ
  // =========================================================
  let bestMonthName = "-", maxMonthIncome = 0;
  let maxMonthHourlyRateName = "-", maxMonthHourlyRate = 0;

  monthsData.forEach(m => {
    if (m.daysCount > 0) {
      let mTotal = m.uber + m.wolt + m.bolt + m.glovo;
      if (includeTips) mTotal += (m.tips_uber + m.tips_wolt + m.tips_bolt + m.tips_glovo);
      if (includeBonuses) mTotal += (m.bonuses_uber + m.bonuses_wolt + m.bonuses_bolt + m.bonuses_glovo);

      if (mTotal > maxMonthIncome) { maxMonthIncome = mTotal; bestMonthName = m.name; }

      const mRate = m.hours > 0 ? mTotal / m.hours : 0;
      if (mRate > maxMonthHourlyRate) { maxMonthHourlyRate = mRate; maxMonthHourlyRateName = m.name; }
    }
  });

  let bestDayDate = "-", bestDayIncome = 0;
  let maxDayTipsDate = "-", maxDayTips = 0;
  let maxDayHourlyRateDate = "-", maxDayHourlyRate = 0;
  let maxDayOrdersDate = "-", maxDayOrders = 0;

  yearShifts.forEach(shift => {
    let dailyBase = shift.uber + shift.wolt + shift.bolt + shift.glovo;
    const dailyTips = (shift.tips_uber || 0) + (shift.tips_wolt || 0) + (shift.tips_bolt || 0) + (shift.tips_glovo || 0);
    const dailyBonuses = (shift.bonuses_uber || 0) + (shift.bonuses_wolt || 0) + (shift.bonuses_bolt || 0) + (shift.bonuses_glovo || 0);

    let dailyTotal = dailyBase;
    if (includeTips) dailyTotal += dailyTips;
    if (includeBonuses) dailyTotal += dailyBonuses;

    if (dailyTotal > bestDayIncome) { bestDayIncome = dailyTotal; bestDayDate = shift.date; }
    if (dailyTips > maxDayTips) { maxDayTips = dailyTips; maxDayTipsDate = shift.date; }
    
    const dailyRate = shift.hours > 0 ? dailyTotal / shift.hours : 0;
    if (dailyRate > maxDayHourlyRate) { maxDayHourlyRate = dailyRate; maxDayHourlyRateDate = shift.date; }

    const dailyOrders = shift.orders_uber + shift.orders_wolt + shift.orders_bolt + shift.orders_glovo;
    if (dailyOrders > maxDayOrders) { maxDayOrders = dailyOrders; maxDayOrdersDate = shift.date; }
  });

  const formatDate = (dateStr: string) => {
    if (dateStr === "-") return "-";
    return new Date(dateStr).toLocaleDateString("uk-UA", { day: 'numeric', month: 'short' });
  };

  // =========================================================
  // НАЛАШТУВАННЯ ГРАФІКІВ
  // =========================================================
  const chartDatasets: any[] = [
    { type: 'bar', label: 'Uber', data: monthsData.map(m => m.uber), backgroundColor: "rgba(75, 85, 99, 0.4)", borderColor: "rgba(75, 85, 99, 1)", borderWidth: 1, stack: 'Stack 0', order: 2 },
    { type: 'bar', label: 'Wolt', data: monthsData.map(m => m.wolt), backgroundColor: "rgba(0, 194, 232, 0.4)", borderColor: "rgba(0, 194, 232, 1)", borderWidth: 1, stack: 'Stack 0', order: 2 },
    { type: 'bar', label: 'Bolt', data: monthsData.map(m => m.bolt), backgroundColor: "rgba(34, 197, 94, 0.4)", borderColor: "rgba(34, 197, 94, 1)", borderWidth: 1, stack: 'Stack 0', order: 2 },
    { type: 'bar', label: 'Glovo', data: monthsData.map(m => m.glovo), backgroundColor: "rgba(234, 179, 8, 0.4)", borderColor: "rgba(234, 179, 8, 1)", borderWidth: 1, stack: 'Stack 0', order: 2 }
  ];

  if (includeTips) {
    chartDatasets.push({ type: 'bar', label: 'Чайові', data: monthsData.map(m => m.tips_uber + m.tips_wolt + m.tips_bolt + m.tips_glovo), backgroundColor: "rgba(244, 63, 94, 0.4)", borderColor: "rgba(244, 63, 94, 1)", borderWidth: 1, stack: 'Stack 0', order: 2 });
  }
  if (includeBonuses) {
    chartDatasets.push({ type: 'bar', label: 'Бонуси', data: monthsData.map(m => m.bonuses_uber + m.bonuses_wolt + m.bonuses_bolt + m.bonuses_glovo), backgroundColor: "rgba(168, 85, 247, 0.4)", borderColor: "rgba(168, 85, 247, 1)", borderWidth: 1, stack: 'Stack 0', order: 2 });
  }

  chartDatasets.push({
    type: 'line', label: 'Зл/Год',
    data: monthsData.map(m => {
      let total = m.uber + m.wolt + m.bolt + m.glovo;
      if (includeTips) total += (m.tips_uber + m.tips_wolt + m.tips_bolt + m.tips_glovo);
      if (includeBonuses) total += (m.bonuses_uber + m.bonuses_wolt + m.bonuses_bolt + m.bonuses_glovo);
      return m.hours > 0 ? Number((total / m.hours).toFixed(2)) : 0;
    }),
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

  // Дані для кругової діаграми
  const getPlatValue = (p: keyof typeof platformTotals) => {
    let val = platformTotals[p].base;
    if (includeTips) val += platformTotals[p].tips;
    if (includeBonuses) val += platformTotals[p].bonuses;
    return val;
  };

  const doughnutData = {
    labels: ['Uber', 'Wolt', 'Bolt', 'Glovo'],
    datasets: [{
      data: [getPlatValue('uber'), getPlatValue('wolt'), getPlatValue('bolt'), getPlatValue('glovo')],
      backgroundColor: ['rgba(75, 85, 99, 0.8)', 'rgba(0, 194, 232, 0.8)', 'rgba(34, 197, 94, 0.8)', 'rgba(234, 179, 8, 0.8)'],
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
            <p className="text-xs text-gray-500 mt-1">Аналітика за додатками, чайовими та бонусами</p>
          </div>
          <Link href="/work" className="bg-gray-800 hover:bg-gray-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition">
            🔙 Назад
          </Link>
        </div>

        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 bg-[#1e1e24] p-4 rounded-xl border border-gray-800">
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-400">Рік:</span>
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
              <span className="flex items-center gap-2">👑 Кращі показники та рекорди {selectedYear} року</span>
              <span className="text-xs bg-gray-800 px-3 py-1 rounded text-gray-400">{showYearRecords ? "Сховати ▲" : "Показати ▼"}</span>
            </button>
            
            <div className={`transition-all duration-500 ease-in-out overflow-hidden ${showYearRecords ? "max-h-[1000px] opacity-100 mt-3" : "max-h-0 opacity-0"}`}>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3 bg-gradient-to-b from-[#1e1e24] to-[#17171d] p-4 md:p-5 rounded-xl border border-yellow-600/30 shadow-inner">
                <div className="bg-[#121212]/50 p-3.5 rounded-xl border border-gray-800/80">
                  <span className="block text-[10px] uppercase font-bold text-gray-500 tracking-wider mb-1">Кращий місяць року</span>
                  <span className="text-sm font-black text-white capitalize block mb-0.5">{bestMonthName}</span>
                  <span className="text-base font-black text-green-400">{maxMonthIncome.toFixed(2)} <span className="text-[10px] font-normal">{t.common.currency}</span></span>
                </div>
                <div className="bg-[#121212]/50 p-3.5 rounded-xl border border-gray-800/80">
                  <span className="block text-[10px] uppercase font-bold text-gray-500 tracking-wider mb-1">Кращий день року</span>
                  <span className="text-sm font-black text-white block mb-0.5">{formatDate(bestDayDate)}</span>
                  <span className="text-base font-black text-green-400">{bestDayIncome.toFixed(2)} <span className="text-[10px] font-normal">{t.common.currency}</span></span>
                </div>
                <div className="bg-[#121212]/50 p-3.5 rounded-xl border border-gray-800/80">
                  <span className="block text-[10px] uppercase font-bold text-rose-500 tracking-wider mb-1">Макс. чайових за день</span>
                  <span className="text-sm font-black text-white block mb-0.5">{formatDate(maxDayTipsDate)}</span>
                  <span className="text-base font-black text-rose-400">{maxDayTips.toFixed(2)} <span className="text-[10px] font-normal">{t.common.currency}</span></span>
                </div>
                <div className="bg-[#121212]/50 p-3.5 rounded-xl border border-gray-800/80">
                  <span className="block text-[10px] uppercase font-bold text-cyan-500 tracking-wider mb-1">Макс. ставка за день</span>
                  <span className="text-sm font-black text-white block mb-0.5">{formatDate(maxDayHourlyRateDate)}</span>
                  <span className="text-base font-black text-cyan-400">{maxDayHourlyRate.toFixed(2)} <span className="text-[10px] font-normal">зл/год</span></span>
                </div>
                <div className="bg-[#121212]/50 p-3.5 rounded-xl border border-gray-800/80">
                  <span className="block text-[10px] uppercase font-bold text-cyan-500 tracking-wider mb-1">Макс. ставка за місяць</span>
                  <span className="text-sm font-black text-white capitalize block mb-0.5">{maxMonthHourlyRateName}</span>
                  <span className="text-base font-black text-cyan-400">{maxMonthHourlyRate.toFixed(2)} <span className="text-[10px] font-normal">зл/год</span></span>
                </div>
                <div className="bg-[#121212]/50 p-3.5 rounded-xl border border-gray-800/80">
                  <span className="block text-[10px] uppercase font-bold text-blue-500 tracking-wider mb-1">Рекорд замовлень за день</span>
                  <span className="text-sm font-black text-white block mb-0.5">{formatDate(maxDayOrdersDate)}</span>
                  <span className="text-base font-black text-blue-400">{maxDayOrders} <span className="text-[10px] font-normal">зам.</span></span>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-6">
          <div className="col-span-2 md:col-span-1 bg-gradient-to-br from-[#1e1e24] to-[#252530] p-4 rounded-xl border border-gray-800 text-center shadow-md">
            <h3 className="text-gray-400 text-[10px] md:text-xs uppercase tracking-wider mb-1">Річний дохід</h3>
            <p className="text-2xl md:text-3xl font-black text-green-400">{yearlyIncome.toFixed(2)} <span className="text-xs font-normal">{t.common.currency}</span></p>
          </div>
          <div className="bg-[#1e1e24] p-4 rounded-xl border border-gray-800 text-center flex flex-col justify-center">
            <h3 className="text-gray-400 text-[10px] md:text-xs uppercase tracking-wider mb-1">Зл/Год (сер.)</h3>
            <p className="text-xl font-bold text-cyan-400">{yearlyAvgHour}</p>
          </div>
          <div className="bg-[#1e1e24] p-4 rounded-xl border border-gray-800 text-center flex flex-col justify-center">
            <h3 className="text-gray-400 text-[10px] md:text-xs uppercase tracking-wider mb-1">Зл/Км (сер.)</h3>
            <p className="text-xl font-bold text-purple-400">{yearlyAvgKm}</p>
          </div>
          <div className="bg-[#1e1e24] p-4 rounded-xl border border-gray-800 text-center flex flex-col justify-center">
            <h3 className="text-gray-400 text-[10px] md:text-xs uppercase tracking-wider mb-1">Зл/Зам (сер.)</h3>
            <p className="text-xl font-bold text-yellow-400">{yearlyAvgOrder}</p>
          </div>
          <div className="bg-[#1e1e24] p-4 rounded-xl border border-gray-800 text-center flex flex-col justify-center">
            <h3 className="text-gray-400 text-[10px] md:text-xs uppercase tracking-wider mb-1">% Чайових</h3>
            <p className="text-xl font-bold text-rose-400">{globalTipsPercent}%</p>
          </div>
        </div>

        {/* 📊 ГРАФІКИ РОКУ */}
        {yearShifts.length > 0 && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            <div className="lg:col-span-2 bg-[#1e1e24] p-4 md:p-6 rounded-xl border border-gray-800 shadow-sm">
              <h3 className="text-sm font-medium text-gray-400 mb-4 uppercase tracking-wider">Динаміка доходу по місяцях</h3>
              <div className="w-full h-72 relative">
                <Bar data={yearChartData as any} options={yearChartOptions as any} />
              </div>
            </div>
            <div className="bg-[#1e1e24] p-4 md:p-6 rounded-xl border border-gray-800 shadow-sm flex flex-col">
              <h3 className="text-sm font-medium text-gray-400 mb-4 uppercase tracking-wider">Частка додатків</h3>
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
                <th className="p-4 font-bold text-gray-300">Місяць</th>
                <th className="p-4 font-bold text-green-400">Загальний дохід</th>
                <th className="p-4">Замовлень</th>
                <th className="p-4">Години</th>
                <th className="p-4">Пробіг (км)</th>
                <th className="p-4 text-cyan-400 border-l border-gray-800">Зл/Год</th>
                <th className="p-4 text-purple-400">Зл/Км</th>
                <th className="p-4 text-yellow-400">Зл/Зам</th>
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

                  const monthBase = m.uber + m.wolt + m.bolt + m.glovo;
                  const monthTips = m.tips_uber + m.tips_wolt + m.tips_bolt + m.tips_glovo;
                  const monthBonuses = m.bonuses_uber + m.bonuses_wolt + m.bonuses_bolt + m.bonuses_glovo;
                  const monthOrders = m.orders_uber + m.orders_wolt + m.orders_bolt + m.orders_glovo;

                  let monthVisualTotal = monthBase;
                  if (includeTips) monthVisualTotal += monthTips;
                  if (includeBonuses) monthVisualTotal += monthBonuses;

                  const mAvgHour = m.hours > 0 ? (monthVisualTotal / m.hours).toFixed(2) : "0.00";
                  const mAvgKm = m.km > 0 ? (monthVisualTotal / m.km).toFixed(2) : "0.00";
                  const mAvgOrder = monthOrders > 0 ? (monthVisualTotal / monthOrders).toFixed(2) : "0.00";

                  const tooltipText = `Uber: ${(m.uber + (includeTips?m.tips_uber:0) + (includeBonuses?m.bonuses_uber:0)).toFixed(2)} зл\nWolt: ${(m.wolt + (includeTips?m.tips_wolt:0) + (includeBonuses?m.bonuses_wolt:0)).toFixed(2)} зл\nBolt: ${(m.bolt + (includeTips?m.tips_bolt:0) + (includeBonuses?m.bonuses_bolt:0)).toFixed(2)} зл\nGlovo: ${(m.glovo + (includeTips?m.tips_glovo:0) + (includeBonuses?m.bonuses_glovo:0)).toFixed(2)} зл`;

                  return (
                    <tr key={m.monthNum} className="hover:bg-[#2a2a35] transition cursor-help" title={tooltipText}>
                      <td className="p-4 font-bold capitalize">{m.name}</td>
                      <td className="p-4 font-black text-green-400">{monthVisualTotal.toFixed(2)}</td>
                      <td className="p-4 text-blue-400 font-bold">{monthOrders}</td>
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

              const monthBase = m.uber + m.wolt + m.bolt + m.glovo;
              const monthTips = m.tips_uber + m.tips_wolt + m.tips_bolt + m.tips_glovo;
              const monthBonuses = m.bonuses_uber + m.bonuses_wolt + m.bonuses_bolt + m.bonuses_glovo;
              const monthOrders = m.orders_uber + m.orders_wolt + m.orders_bolt + m.orders_glovo;

              let monthVisualTotal = monthBase;
              if (includeTips) monthVisualTotal += monthTips;
              if (includeBonuses) monthVisualTotal += monthBonuses;

              const isExpanded = expandedMonth === m.monthNum;

              return (
                <div key={m.monthNum} className="bg-[#1e1e24] rounded-xl border border-gray-800 overflow-hidden shadow-sm">
                  <button onClick={() => setExpandedMonth(isExpanded ? null : m.monthNum)} className="w-full p-4 flex justify-between items-center text-left bg-[#252530]/40 hover:bg-[#252530] transition">
                    <div>
                      <span className="font-bold text-white capitalize text-base">{m.name}</span>
                      <span className="text-[10px] text-gray-500 block">Робочих днів: {m.daysCount}</span>
                    </div>
                    <div className="text-right flex items-center gap-3">
                      <span className="font-black text-green-400 text-base">{monthVisualTotal.toFixed(2)} зл</span>
                      <span className="text-gray-500 text-xs">{isExpanded ? "▲" : "▼"}</span>
                    </div>
                  </button>

                  <div className={`transition-all duration-300 ease-in-out overflow-hidden ${isExpanded ? "max-h-[500px] border-t border-gray-800 p-4 bg-[#17171d]" : "max-h-0"}`}>
                    <div className="grid grid-cols-2 gap-3 mb-4 text-xs">
                      <div className="bg-[#2a2a35]/40 p-2 rounded-lg"><span>Годин:</span> <strong className="text-white float-right">{m.hours.toFixed(1)}</strong></div>
                      <div className="bg-[#2a2a35]/40 p-2 rounded-lg"><span>Пробіг:</span> <strong className="text-purple-400 float-right">{m.km.toFixed(1)} км</strong></div>
                      <div className="bg-[#2a2a35]/40 p-2 rounded-lg"><span>Замовлень:</span> <strong className="text-blue-400 float-right">{monthOrders}</strong></div>
                      <div className="bg-[#2a2a35]/40 p-2 rounded-lg"><span>Зл/Год:</span> <strong className="text-cyan-400 float-right">{(monthVisualTotal/m.hours).toFixed(2)}</strong></div>
                    </div>

                    <span className="text-[9px] uppercase font-bold tracking-wider text-gray-500 block mb-2">Розбивка по додатках</span>
                    <div className="space-y-1.5 text-xs">
                      {[
                        { id: "uber", label: "Uber", base: m.uber, tips: m.tips_uber, bon: m.bonuses_uber, orders: m.orders_uber },
                        { id: "wolt", label: "Wolt", base: m.wolt, tips: m.tips_wolt, bon: m.bonuses_wolt, orders: m.orders_wolt },
                        { id: "bolt", label: "Bolt", base: m.bolt, tips: m.tips_bolt, bon: m.bonuses_bolt, orders: m.orders_bolt },
                        { id: "glovo", label: "Glovo", base: m.glovo, tips: m.tips_glovo, bon: m.bonuses_glovo, orders: m.orders_glovo }
                      ].map(p => {
                        let platTotal = p.base;
                        if (includeTips) platTotal += p.tips;
                        if (includeBonuses) platTotal += p.bon;
                        if (platTotal === 0 && p.orders === 0) return null;

                        return (
                          <div key={p.id} className="bg-[#22222a] p-2.5 rounded-lg border border-gray-800 flex justify-between items-center">
                            <span className="font-bold text-gray-300">{p.label}</span>
                            <div className="text-right">
                              <span className="font-bold text-white block">{platTotal.toFixed(2)} зл</span>
                              <span className="text-[9px] text-gray-500">
                                Ставка: {p.base.toFixed(2)} | Чай: {p.tips.toFixed(2)} | Бон: {p.bon.toFixed(2)}
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
          <h2 className="text-sm font-bold mb-4 text-gray-400 uppercase tracking-wider">Річні підсумки по кожному додатку</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
            {[
              { id: "uber", name: "Uber", color: "border-gray-600 bg-gray-900/10" },
              { id: "wolt", name: "Wolt", color: "border-cyan-600 bg-cyan-900/10" },
              { id: "bolt", name: "Bolt", color: "border-green-600 bg-green-900/10" },
              { id: "glovo", name: "Glovo", color: "border-yellow-600 bg-yellow-900/10" }
            ].map(p => {
              const data = platformTotals[p.id as keyof typeof platformTotals];
              let total = data.base;
              if (includeTips) total += data.tips;
              if (includeBonuses) total += data.bonuses;

              const absTotalForPercent = data.base + data.tips + data.bonuses;
              const tipsPercent = absTotalForPercent > 0 ? ((data.tips / absTotalForPercent) * 100).toFixed(1) : "0.0";

              return (
                <div key={p.id} className={`p-4 rounded-xl border ${p.color} shadow-sm flex flex-col gap-2 relative overflow-hidden`}>
                  <div className="flex justify-between items-start z-10">
                    <h3 className="font-black text-lg text-white">{p.name}</h3>
                    {data.tips > 0 && (
                      <span className="text-[10px] font-bold text-rose-400 bg-rose-500/10 px-2 py-1 rounded-md border border-rose-500/20">
                        {tipsPercent}% чаю
                      </span>
                    )}
                  </div>
                  <div className="text-2xl font-black text-green-400 mb-1 z-10">{total.toFixed(2)} <span className="text-xs font-normal">зл</span></div>
                  <div className="text-xs space-y-1 text-gray-400 border-t border-gray-800/60 pt-2 z-10">
                    <div className="flex justify-between"><span>Суха ставка:</span><strong className="text-white">{data.base.toFixed(2)} зл</strong></div>
                    <div className="flex justify-between text-rose-400"><span>Всього чаю:</span><strong>{data.tips.toFixed(2)} зл</strong></div>
                    <div className="flex justify-between text-purple-400"><span>Всього бонусів:</span><strong>{data.bonuses.toFixed(2)} зл</strong></div>
                    <div className="flex justify-between text-blue-400 border-t border-gray-800/40 mt-1 pt-1"><span>Замовлень:</span><strong>{data.orders} зам</strong></div>
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