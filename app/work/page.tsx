"use client";

import { useState, useEffect } from "react";
import { supabase } from "../../lib/supabase";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Bar } from "react-chartjs-2";

ChartJS.register(CategoryScale, LinearScale, BarElement, PointElement, LineElement, Title, Tooltip, Legend);

type Shift = {
  id: number;
  date: string;
  km: number;
  hours: number;
  uber: number;
  wolt: number;
  bolt: number;
  glovo: number;
  user_id: string; // Додали user_id
};

export default function WorkDashboard() {
  const router = useRouter();
  const [userId, setUserId] = useState<string | null>(null);
  
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [km, setKm] = useState("");
  const [hours, setHours] = useState("");
  const [earnings, setEarnings] = useState({ uber: "", wolt: "", bolt: "", glovo: "" });
  const [activePlatforms, setActivePlatforms] = useState(["uber", "wolt"]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [showBestMonthDay, setShowBestMonthDay] = useState(false);

  const [shifts, setShifts] = useState<Shift[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7));

  // Перевірка сесії при завантаженні сторінки
  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push("/login"); // Якщо не залогінений - викидаємо на логін
      } else {
        setUserId(session.user.id);
        fetchShifts(session.user.id);
      }
    };
    checkUser();
  }, [router]);

  // Завантажуємо тільки свої зміни!
  const fetchShifts = async (uid: string) => {
    setIsLoading(true);
    const { data, error } = await supabase
      .from("work_shifts")
      .select("*")
      .eq("user_id", uid) // ФІЛЬТР ПО КОРИСТУВАЧУ
      .order("date", { ascending: false });

    if (!error && data) {
      setShifts(data);
    }
    setIsLoading(false);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/login");
  };

  const handleEarningChange = (platform: string, value: string) => {
    setEarnings((prev) => ({ ...prev, [platform]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId) return;
    setIsSubmitting(true);

    const shiftData = {
      date: date,
      km: parseFloat(km) || 0,
      hours: parseFloat(hours) || 0,
      uber: activePlatforms.includes("uber") ? parseFloat(earnings.uber) || 0 : 0,
      wolt: activePlatforms.includes("wolt") ? parseFloat(earnings.wolt) || 0 : 0,
      bolt: activePlatforms.includes("bolt") ? parseFloat(earnings.bolt) || 0 : 0,
      glovo: activePlatforms.includes("glovo") ? parseFloat(earnings.glovo) || 0 : 0,
      user_id: userId, // ЗАПИСУЄМО ВЛАСНИКА ЗМІНИ
    };

    if (editingId) {
      const { error } = await supabase.from("work_shifts").update(shiftData).eq("id", editingId);
      if (error) alert("Помилка оновлення: " + error.message);
      else { resetForm(); fetchShifts(userId); }
    } else {
      const { error } = await supabase.from("work_shifts").insert([shiftData]);
      if (error) {
        alert("Помилка: " + error.message);
      } else { resetForm(); fetchShifts(userId); }
    }
    setIsSubmitting(false);
  };

  const handleEdit = (shift: Shift) => {
    setEditingId(shift.id);
    setDate(shift.date);
    setKm(shift.km.toString());
    setHours(shift.hours.toString());
    
    setEarnings({
      uber: shift.uber > 0 ? shift.uber.toString() : "",
      wolt: shift.wolt > 0 ? shift.wolt.toString() : "",
      bolt: shift.bolt > 0 ? shift.bolt.toString() : "",
      glovo: shift.glovo > 0 ? shift.glovo.toString() : "",
    });

    const active = [];
    if (shift.uber > 0) active.push("uber");
    if (shift.wolt > 0) active.push("wolt");
    if (shift.bolt > 0) active.push("bolt");
    if (shift.glovo > 0) active.push("glovo");
    
    setActivePlatforms(active.length > 0 ? active : ["uber", "wolt"]);
    setIsFormOpen(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id: number) => {
    if (confirm("Ти впевнений, що хочеш видалити цю зміну? Дія незворотна.")) {
      const { error } = await supabase.from("work_shifts").delete().eq("id", id);
      
      if (error) {
        alert("Помилка видалення: " + error.message);
      } else if (userId) {
        fetchShifts(userId);
      }
    }
  };

  const resetForm = () => {
    setEditingId(null);
    setDate(new Date().toISOString().split("T")[0]);
    setKm("");
    setHours("");
    setEarnings({ uber: "", wolt: "", bolt: "", glovo: "" });
    setActivePlatforms(["uber", "wolt"]);
    setIsFormOpen(false);
  };

  if (!userId) {
    return <div className="min-h-screen bg-[#121212] text-white flex items-center justify-center">Завантаження профілю...</div>;
  }

  const availableToAdd = ["uber", "wolt", "bolt", "glovo"].filter(p => !activePlatforms.includes(p));
  const filteredShifts = shifts.filter(shift => shift.date.startsWith(selectedMonth));

  let totalEarned = 0, totalHours = 0, totalKm = 0;
  let maxEarned = 0;
  let bestShiftDate = ""; 

  filteredShifts.forEach(shift => {
    const dailyTotal = shift.uber + shift.wolt + shift.bolt + shift.glovo;
    totalEarned += dailyTotal;
    totalHours += shift.hours;
    totalKm += shift.km;

    if (dailyTotal > maxEarned) {
      maxEarned = dailyTotal;
      bestShiftDate = shift.date;
    }
  });

  const totalDays = filteredShifts.length;
  const avgPerHour = totalHours > 0 ? (totalEarned / totalHours).toFixed(2) : "0.00";
  const avgPerKm = totalKm > 0 ? (totalEarned / totalKm).toFixed(2) : "0.00";
  const avgKmPerDay = totalDays > 0 ? (totalKm / totalDays).toFixed(1) : "0.0";
  const avgHoursPerDay = totalDays > 0 ? (totalHours / totalDays).toFixed(1) : "0.0";
  const avgEarnedPerDay = totalDays > 0 ? (totalEarned / totalDays).toFixed(2) : "0.00";

  const chronologicalShifts = [...filteredShifts].reverse();

  const monthlyChartData = {
    labels: chronologicalShifts.map(s => new Date(s.date).toLocaleDateString("uk-UA", { day: 'numeric' })),
    datasets: [
      {
        type: 'bar' as const,
        label: "Дохід (зл)",
        data: chronologicalShifts.map(s => s.uber + s.wolt + s.bolt + s.glovo),
        backgroundColor: "rgba(76, 175, 80, 0.1)",
        borderColor: "rgba(76, 175, 80, 0.3)",
        borderWidth: 1,
        yAxisID: 'y',
      },
      {
        type: 'line' as const,
        label: "Зл/Год",
        data: chronologicalShifts.map(s => {
          const total = s.uber + s.wolt + s.bolt + s.glovo;
          return s.hours > 0 ? Number((total / s.hours).toFixed(2)) : 0;
        }),
        borderColor: "#00e5ff",
        backgroundColor: "#00e5ff",
        borderWidth: 4,
        pointRadius: 4,
        tension: 0.3,
        yAxisID: 'y1',
      },
      {
        type: 'line' as const,
        label: "Пробіг (км)",
        data: chronologicalShifts.map(s => s.km),
        borderColor: "rgba(168, 85, 247, 0.5)",
        backgroundColor: "rgba(168, 85, 247, 0.5)",
        borderWidth: 2,
        pointRadius: 2,
        yAxisID: 'y1',
      },
      {
        type: 'line' as const,
        label: "Години",
        data: chronologicalShifts.map(s => s.hours),
        borderColor: "rgba(244, 63, 94, 0.5)",
        backgroundColor: "rgba(244, 63, 94, 0.5)",
        borderWidth: 2,
        pointRadius: 2,
        yAxisID: 'y1',
      }
    ]
  };

  const monthlyChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      y: { type: 'linear' as const, position: 'left' as const, grid: { color: 'rgba(255, 255, 255, 0.03)' } },
      y1: { type: 'linear' as const, position: 'right' as const, grid: { drawOnChartArea: false } },
      x: { grid: { display: false } }
    },
    plugins: { legend: { labels: { color: '#a0a0a0', boxWidth: 12 } } }
  };

  return (
    <div className="min-h-screen bg-[#121212] text-white p-6 md:p-10">
      <div className="max-w-5xl mx-auto">
        
        {/* НОВА ШАПКА З КНОПКОЮ ВИХОДУ */}
        <div className="flex justify-between items-center mb-8 border-b border-gray-800 pb-4">
          <h1 className="text-3xl font-bold">
            {editingId ? "✏️ Редагування зміни" : "📊 Робоча зміна"}
          </h1>
          
          <div className="flex items-center gap-4">
            <Link href="/garage" className="bg-gray-800 hover:bg-gray-700 text-white font-medium px-4 py-2 rounded-lg transition">
              🏍️ Гараж
            </Link>
            <button onClick={handleLogout} className="text-gray-400 hover:text-red-500 text-sm font-medium transition">
              Вийти 🚪
            </button>
          </div>
        </div>

        {/* Кнопка "Додати зміну" переїхала сюди для краси */}
        {!isFormOpen && (
          <button 
            onClick={() => setIsFormOpen(true)}
            className="w-full mb-8 bg-green-600 hover:bg-green-500 text-white font-bold px-6 py-4 rounded-xl transition shadow-lg"
          >
            + Додати робочу зміну
          </button>
        )}

        <div className={`transition-all duration-500 ease-in-out overflow-hidden ${isFormOpen ? "max-h-[1000px] opacity-100 mb-10" : "max-h-0 opacity-0"}`}>
          <form onSubmit={handleSubmit} className={`p-6 rounded-xl border shadow-lg transition-all ${editingId ? 'bg-[#25251a] border-yellow-700/50' : 'bg-[#1e1e24] border-gray-800'}`}>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div>
                <label className="block text-sm text-gray-400 mb-2">Дата</label>
                <input type="date" required value={date} onChange={(e) => setDate(e.target.value)} disabled={editingId !== null} className="w-full bg-[#2a2a35] border border-gray-700 rounded-lg p-3 text-white focus:outline-none focus:border-green-500 disabled:opacity-50" />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-2">Пробіг (км)</label>
                <input type="number" step="0.1" required value={km} onChange={(e) => setKm(e.target.value)} placeholder="Напр. 120.5" className="w-full bg-[#2a2a35] border border-gray-700 rounded-lg p-3 text-white focus:outline-none focus:border-green-500" />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-2">Години</label>
                <input type="number" step="0.1" required value={hours} onChange={(e) => setHours(e.target.value)} placeholder="Напр. 8.5" className="w-full bg-[#2a2a35] border border-gray-700 rounded-lg p-3 text-white focus:outline-none focus:border-green-500" />
              </div>
            </div>

            <div className="border-t border-gray-800 pt-6 mb-8">
              <h2 className="text-lg font-medium mb-4 flex items-center justify-between">
                Дохід по платформах (зл)
                {availableToAdd.length > 0 && (
                  <div className="flex gap-2">
                    {availableToAdd.map(platform => (
                      <button key={platform} type="button" onClick={() => setActivePlatforms([...activePlatforms, platform])} className="text-xs bg-gray-800 hover:bg-gray-700 px-3 py-1.5 rounded-full transition capitalize">+ {platform}</button>
                    ))}
                  </div>
                )}
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {activePlatforms.map((platform) => (
                  <div key={platform} className="relative">
                    <label className="block text-sm text-gray-400 mb-2 capitalize">{platform}</label>
                    <input type="number" step="0.01" value={earnings[platform as keyof typeof earnings]} onChange={(e) => handleEarningChange(platform, e.target.value)} placeholder="0.00" className="w-full bg-[#2a2a35] border border-gray-700 rounded-lg p-3 text-white focus:outline-none focus:border-green-500 transition" />
                    {activePlatforms.length > 1 && (
                      <button type="button" onClick={() => { setActivePlatforms(activePlatforms.filter(p => p !== platform)); handleEarningChange(platform, ""); }} className="absolute top-0 right-0 text-gray-500 hover:text-red-500 text-xs p-1">✕</button>
                    )}
                  </div>
                ))}
              </div>
            </div>
            
            <div className="flex gap-4">
              <button type="submit" disabled={isSubmitting} className={`flex-1 py-4 rounded-lg font-bold text-lg transition ${editingId ? "bg-yellow-600 hover:bg-yellow-500 text-white" : "bg-green-600 hover:bg-green-500 text-white"} ${isSubmitting && "opacity-70 cursor-not-allowed"}`}>
                {isSubmitting ? "Зберігаємо..." : (editingId ? "Оновити зміну" : "Зберегти зміну")}
              </button>
              <button type="button" onClick={resetForm} className="px-6 py-4 rounded-lg font-bold text-lg bg-gray-700 hover:bg-gray-600 transition">
                Скасувати
              </button>
            </div>
          </form>
        </div>

        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6 border-b border-gray-800 pb-4">
          <h2 className="text-2xl font-bold">Місячна статистика</h2>
          <div className="flex items-center gap-4 w-full md:w-auto">
            <Link href="/work/year" className="flex-1 md:flex-none text-center bg-blue-600 hover:bg-blue-500 text-white px-5 py-2 rounded-lg font-medium transition">
              📊 Річний звіт
            </Link>
            <input 
              type="month" 
              value={selectedMonth} 
              onChange={(e) => setSelectedMonth(e.target.value)} 
              className="flex-1 md:flex-none bg-[#2a2a35] border border-gray-700 rounded-lg p-2 text-white focus:outline-none focus:border-green-500 font-medium"
            />
          </div>
        </div>

        {bestShiftDate && (
          <div className="mb-6">
            <button 
              onClick={() => setShowBestMonthDay(!showBestMonthDay)}
              className="w-full bg-[#24242d] hover:bg-[#2c2c38] border border-gray-800 p-4 rounded-xl font-medium text-yellow-500 transition flex justify-between items-center"
            >
              <span>{showBestMonthDay ? "👇 Сховати рекорд місяця" : "🏆 Показати найкращий день місяця"}</span>
              <span className="text-xs bg-gray-800 px-3 py-1 rounded text-gray-400">Натисни щоб подивитись</span>
            </button>
            
            <div className={`transition-all duration-500 ease-in-out overflow-hidden ${showBestMonthDay ? "max-h-40 opacity-100 mt-2 border-l-4 border-yellow-500 p-5 bg-gradient-to-r from-yellow-600/20 to-transparent rounded-r-xl" : "max-h-0 opacity-0"}`}>
              <div className="flex justify-between items-center w-full">
                <div>
                  <h4 className="font-bold text-yellow-500">🔥 Найкращий день місяця</h4>
                  <p className="text-gray-400 text-sm mt-1">Дата: {new Date(bestShiftDate).toLocaleDateString("uk-UA")}</p>
                </div>
                <div className="text-2xl md:text-3xl font-black text-yellow-500">
                  {maxEarned.toFixed(2)} зл
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="mb-4">
          <span className="text-xs font-semibold text-gray-500 tracking-wider uppercase">Загальні значення за місяць</span>
          <div className="grid grid-cols-3 gap-4 mt-2">
            <div className="bg-[#1e1e24] p-4 rounded-xl border border-gray-800 text-center">
              <h3 className="text-gray-400 text-xs md:text-sm mb-1">Загальний дохід</h3>
              <p className="text-xl md:text-2xl font-bold text-green-400">{totalEarned.toFixed(2)} зл</p>
            </div>
            <div className="bg-[#1e1e24] p-4 rounded-xl border border-gray-800 text-center">
              <h3 className="text-gray-400 text-xs md:text-sm mb-1">Всього годин</h3>
              <p className="text-xl md:text-2xl font-bold text-white">{totalHours.toFixed(1)} год</p>
            </div>
            <div className="bg-[#1e1e24] p-4 rounded-xl border border-gray-800 text-center">
              <h3 className="text-gray-400 text-xs md:text-sm mb-1">Загальний пробіг</h3>
              <p className="text-xl md:text-2xl font-bold text-purple-400">{totalKm.toFixed(1)} км</p>
            </div>
          </div>
        </div>

        <div className="mb-8">
          <span className="text-xs font-semibold text-gray-500 tracking-wider uppercase">Середні показники ефективності</span>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mt-2">
            <div className="bg-[#1e1e24] p-4 rounded-xl border border-gray-800 text-center border-b-2 border-green-500/50">
              <h3 className="text-gray-400 text-xs mb-1">Дохід/День (сер.)</h3>
              <p className="text-lg md:text-xl font-bold text-green-400">{avgEarnedPerDay} зл</p>
            </div>
            <div className="bg-[#1e1e24] p-4 rounded-xl border border-gray-800 text-center">
              <h3 className="text-gray-400 text-xs mb-1">Ставка зл/год</h3>
              <p className="text-lg md:text-xl font-bold text-blue-400">{avgPerHour} зл</p>
            </div>
            <div className="bg-[#1e1e24] p-4 rounded-xl border border-gray-800 text-center">
              <h3 className="text-gray-400 text-xs mb-1">Ефективність зл/км</h3>
              <p className="text-lg md:text-xl font-bold text-purple-400">{avgPerKm} зл</p>
            </div>
            <div className="bg-[#1e1e24] p-4 rounded-xl border border-gray-800 text-center">
              <h3 className="text-gray-400 text-xs mb-1">Км на день (сер.)</h3>
              <p className="text-lg md:text-xl font-bold text-gray-300">{avgKmPerDay} км</p>
            </div>
            <div className="bg-[#1e1e24] p-4 rounded-xl border border-gray-800 text-center">
              <h3 className="text-gray-400 text-xs mb-1">Годин на день (сер.)</h3>
              <p className="text-lg md:text-xl font-bold text-gray-300">{avgHoursPerDay} год</p>
            </div>
          </div>
        </div>

        {filteredShifts.length > 0 && (
          <div className="bg-[#1e1e24] p-4 md:p-6 rounded-xl border border-gray-800 mb-8 flex flex-col items-center justify-center">
            <h3 className="text-sm font-medium text-gray-400 mb-4 self-start">Графік активності за місяць</h3>
            <div className="w-full max-w-4xl h-64 relative mx-auto flex justify-center">
              <Bar data={monthlyChartData as any} options={monthlyChartOptions as any} />
            </div>
          </div>
        )}

        <div className="bg-[#1e1e24] rounded-xl border border-gray-800 overflow-hidden">
          <div className="p-4 border-b border-gray-800 flex justify-between items-center">
            <h2 className="text-lg font-medium">Зміни за місяць</h2>
            <span className="text-sm text-gray-400">Робочих днів: {filteredShifts.length}</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#2a2a35] text-gray-400 text-sm">
                  <th className="p-4 font-medium">Дата</th>
                  <th className="p-4 font-medium">Дохід</th>
                  <th className="p-4 font-medium">Години</th>
                  <th className="p-4 font-medium">Зл/Год</th>
                  <th className="p-4 font-medium">Пробіг</th>
                  <th className="p-4 font-medium">Зл/Км</th>
                  <th className="p-4 font-medium text-right">Дії</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800">
                {isLoading ? (
                  <tr><td colSpan={7} className="p-4 text-center text-gray-500">Завантаження...</td></tr>
                ) : filteredShifts.length === 0 ? (
                  <tr><td colSpan={7} className="p-4 text-center text-gray-500">У цьому місяці записів немає</td></tr>
                ) : (
                  filteredShifts.map((shift) => {
                    const dailyTotal = shift.uber + shift.wolt + shift.bolt + shift.glovo;
                    const dailyAvgHour = shift.hours > 0 ? (dailyTotal / shift.hours).toFixed(2) : "0.00";
                    const dailyAvgKm = shift.km > 0 ? (dailyTotal / shift.km).toFixed(2) : "0.00";
                    
                    return (
                      <tr key={shift.id} className="hover:bg-[#2a2a35] transition">
                        <td className="p-4">{new Date(shift.date).toLocaleDateString("uk-UA")}</td>
                        <td className="p-4 font-bold text-green-400">{dailyTotal.toFixed(2)} зл</td>
                        <td className="p-4">{shift.hours}</td>
                        <td className="p-4 text-blue-400">{dailyAvgHour}</td>
                        <td className="p-4 text-gray-400">{shift.km} км</td>
                        <td className="p-4 text-purple-400">{dailyAvgKm}</td>
                        <td className="p-4 text-right">
                          <button onClick={() => handleEdit(shift)} className="text-gray-400 hover:text-yellow-500 p-2 transition" title="Редагувати">✏️</button>
                          <button onClick={() => handleDelete(shift.id)} className="text-gray-400 hover:text-red-500 p-2 transition" title="Видалити">🗑️</button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}