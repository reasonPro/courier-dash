"use client";

import { useState, useEffect } from "react";
import { supabase } from "../../../lib/supabase";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  PointElement,
  LineElement,
} from "chart.js";
import { Bar } from "react-chartjs-2";

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, PointElement, LineElement);

type Shift = {
  id: number;
  date: string;
  km: number;
  hours: number;
  uber: number;
  wolt: number;
  bolt: number;
  glovo: number;
  user_id: string;
};

export default function YearDashboard() {
  const router = useRouter();
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);
  
  const currentYear = new Date().getFullYear().toString();
  const [selectedYear, setSelectedYear] = useState(currentYear);

  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push("/login");
      } else {
        setUserId(session.user.id);
        fetchShifts(session.user.id, selectedYear);
      }
    };
    checkUser();
  }, [router, selectedYear]);

  const fetchShifts = async (uid: string, year: string) => {
    setIsLoading(true);
    const startDate = `${year}-01-01`;
    const endDate = `${year}-12-31`;

    const { data, error } = await supabase
      .from("work_shifts")
      .select("*")
      .eq("user_id", uid)
      .gte("date", startDate)
      .lte("date", endDate)
      .order("date", { ascending: true });

    if (!error && data) {
      setShifts(data);
    }
    setIsLoading(false);
  };

  if (!userId) {
    return <div className="min-h-screen bg-[#121212] text-white flex items-center justify-center">Перевірка доступу...</div>;
  }

  let totalYearEarned = 0, totalYearHours = 0, totalYearKm = 0;
  let maxDayEarned = 0, bestDayDate = "";

  const monthlyData = Array(12).fill(0).map(() => ({ uber: 0, wolt: 0, bolt: 0, glovo: 0, total: 0, hours: 0, km: 0 }));

  shifts.forEach(shift => {
    const dailyTotal = shift.uber + shift.wolt + shift.bolt + shift.glovo;
    totalYearEarned += dailyTotal;
    totalYearHours += shift.hours;
    totalYearKm += shift.km;

    if (dailyTotal > maxDayEarned) {
      maxDayEarned = dailyTotal;
      bestDayDate = shift.date;
    }

    const monthIndex = new Date(shift.date).getMonth();
    monthlyData[monthIndex].uber += shift.uber;
    monthlyData[monthIndex].wolt += shift.wolt;
    monthlyData[monthIndex].bolt += shift.bolt;
    monthlyData[monthIndex].glovo += shift.glovo;
    monthlyData[monthIndex].total += dailyTotal;
    monthlyData[monthIndex].hours += shift.hours;
    monthlyData[monthIndex].km += shift.km;
  });

  const avgYearPerHour = totalYearHours > 0 ? (totalYearEarned / totalYearHours).toFixed(2) : "0.00";
  const avgYearPerKm = totalYearKm > 0 ? (totalYearEarned / totalYearKm).toFixed(2) : "0.00";

  const chartData = {
    labels: ["Січ", "Лют", "Бер", "Кві", "Тра", "Чер", "Лип", "Сер", "Вер", "Жов", "Лис", "Гру"],
    datasets: [
      { type: 'bar' as const, label: "Uber", data: monthlyData.map(m => m.uber), backgroundColor: "#000000", borderColor: "#ffffff", borderWidth: 1, stack: "Stack 0" },
      { type: 'bar' as const, label: "Wolt", data: monthlyData.map(m => m.wolt), backgroundColor: "#00c2e8", stack: "Stack 0" },
      { type: 'bar' as const, label: "Bolt", data: monthlyData.map(m => m.bolt), backgroundColor: "#2eb872", stack: "Stack 0" },
      { type: 'bar' as const, label: "Glovo", data: monthlyData.map(m => m.glovo), backgroundColor: "#ffc244", stack: "Stack 0" },
      {
        type: 'line' as const,
        label: "Середня ставка (зл/год)",
        data: monthlyData.map(m => m.hours > 0 ? (m.total / m.hours).toFixed(2) : 0),
        borderColor: "#ff3366",
        backgroundColor: "#ff3366",
        borderWidth: 3,
        pointRadius: 4,
        yAxisID: 'y1',
      }
    ]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      y: { stacked: true, grid: { color: 'rgba(255, 255, 255, 0.05)' } },
      y1: { type: 'linear' as const, position: 'right' as const, grid: { drawOnChartArea: false } },
      x: { stacked: true, grid: { display: false } }
    },
    plugins: { legend: { labels: { color: '#fff' } } }
  };

  return (
    <div className="min-h-screen bg-[#121212] text-white p-6 md:p-10">
      <div className="max-w-5xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 border-b border-gray-800 pb-4 gap-4">
          <div className="flex items-center gap-4">
            <Link href="/work" className="bg-gray-800 hover:bg-gray-700 text-white px-4 py-2 rounded-lg transition font-medium">← Місяць</Link>
            <h1 className="text-3xl font-bold">📆 Річний звіт</h1>
          </div>
          <select 
            value={selectedYear} 
            onChange={(e) => setSelectedYear(e.target.value)}
            className="bg-[#1e1e24] border border-gray-700 rounded-lg p-2 text-white text-xl font-bold focus:outline-none focus:border-blue-500"
          >
            <option value="2024">2024</option>
            <option value="2025">2025</option>
            <option value="2026">2026</option>
          </select>
        </div>

        {bestDayDate && (
          <div className="mb-8 border-l-4 border-yellow-500 p-5 bg-gradient-to-r from-yellow-600/20 to-transparent rounded-r-xl flex justify-between items-center shadow-lg">
            <div>
              <h4 className="font-bold text-yellow-500 flex items-center gap-2">🏆 Рекорд року</h4>
              <p className="text-gray-400 text-sm mt-1">{new Date(bestDayDate).toLocaleDateString("uk-UA")}</p>
            </div>
            <div className="text-3xl font-black text-yellow-500">{maxDayEarned.toFixed(2)} зл</div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-gradient-to-br from-[#1e1e24] to-[#252530] p-6 rounded-xl border border-gray-700 shadow-lg">
            <h3 className="text-gray-400 mb-2 uppercase tracking-wide text-sm font-medium">Річний дохід</h3>
            <p className="text-4xl font-black text-green-400">{totalYearEarned.toFixed(2)} <span className="text-xl">зл</span></p>
          </div>
          <div className="bg-gradient-to-br from-[#1e1e24] to-[#252530] p-6 rounded-xl border border-gray-700 shadow-lg">
            <h3 className="text-gray-400 mb-2 uppercase tracking-wide text-sm font-medium">Річна ефективність</h3>
            <p className="text-4xl font-black text-blue-400">{avgYearPerHour} <span className="text-xl">зл/год</span></p>
          </div>
          <div className="bg-gradient-to-br from-[#1e1e24] to-[#252530] p-6 rounded-xl border border-gray-700 shadow-lg">
            <h3 className="text-gray-400 mb-2 uppercase tracking-wide text-sm font-medium">Вартість кілометра</h3>
            <p className="text-4xl font-black text-purple-400">{avgYearPerKm} <span className="text-xl">зл/км</span></p>
          </div>
        </div>

        {shifts.length > 0 ? (
          <div className="bg-[#1e1e24] p-4 md:p-8 rounded-xl border border-gray-800 shadow-xl mb-8">
            <h2 className="text-xl font-bold mb-6 text-gray-300">Дохід по місяцях та платформах</h2>
            <div className="w-full h-80 relative">
              <Bar data={chartData as any} options={chartOptions as any} />
            </div>
          </div>
        ) : (
           <div className="text-center py-20 text-gray-500 bg-[#1e1e24] rounded-xl border border-gray-800">
             Немає даних за цей рік
           </div>
        )}
      </div>
    </div>
  );
}