"use client";

import { useState, useEffect } from "react";
import { supabase } from "../../lib/supabase";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useLanguage } from "../../context/LanguageContext";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  LineController,
  BarController,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Bar } from "react-chartjs-2";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  LineController,
  BarController,
  Title,
  Tooltip,
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
  user_id: string;
};

export default function WorkDashboard() {
  const router = useRouter();
  const { lang, setLanguage, t } = useLanguage();
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

  // СТАН СТВОРЕННЯ НІКНЕЙМУ (Примусовий)
  const [userNickname, setUserNickname] = useState<string | null>(null);
  const [showNicknameModal, setShowNicknameModal] = useState(false);
  const [newNickname, setNewNickname] = useState("");
  const [nicknameError, setNicknameError] = useState<string | null>(null);
  const [isSavingNickname, setIsSavingNickname] = useState(false);

  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push("/");
      } else {
        setUserId(session.user.id);
        fetchShifts(session.user.id);
        checkNickname(session.user); // Перевіряємо нікнейм при вході
      }
    };
    checkUser();
  }, [router]);

  // Функція перевірки нікнейму в базі
  const checkNickname = async (sessionUser: any) => {
    const { data, error } = await supabase
      .from("profiles")
      .select("nickname")
      .eq("id", sessionUser.id)
      .single();

    if (error || !data || !data.nickname) {
      // Якщо в таблиці профілів ще нічого немає, перевіряємо, чи ми не зберегли нікнейм під час нової реєстрації
      const metaNickname = sessionUser.user_metadata?.nickname;
      
      if (metaNickname) {
        // О! Людина зареєструвалася через нову форму. Непомітно зберігаємо нікнейм у базу і не мучимо її модалкою!
        await supabase.from("profiles").upsert({ id: sessionUser.id, nickname: metaNickname });
        setUserNickname(metaNickname);
      } else {
        // Це старий користувач, у якого в метаданих пусто. Показуємо примусове модальне вікно.
        setShowNicknameModal(true);
      }
    } else {
      setUserNickname(data.nickname);
    }
  };

  // Збереження нікнейму
  const handleNicknameSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId || !newNickname.trim()) return;
    setNicknameError(null);
    setIsSavingNickname(true);

    const cleanNickname = newNickname.trim();

    // 1. Спочатку перевіряємо чи такий нік вже не зайнятий
    const { data: existing } = await supabase
      .from("profiles")
      .select("nickname")
      .eq("nickname", cleanNickname);

    if (existing && existing.length > 0) {
      setNicknameError(lang === "pl" ? "Ta nazwa jest już zajęta!" : lang === "en" ? "This nickname is already taken!" : lang === "ru" ? "Этот ник уже занят!" : "Цей нікнейм уже зайнятий!");
      setIsSavingNickname(false);
      return;
    }

    // 2. Пробуємо зберегти (використовуємо upsert, щоб створити або оновити запис)
    const { error } = await supabase
      .from("profiles")
      .upsert({ id: userId, nickname: cleanNickname });

    if (error) {
      setNicknameError(error.message);
    } else {
      setUserNickname(cleanNickname);
      setShowNicknameModal(false);
    }
    setIsSavingNickname(false);
  };

  const fetchShifts = async (uid: string) => {
    setIsLoading(true);
    const { data, error } = await supabase
      .from("work_shifts")
      .select("*")
      .eq("user_id", uid)
      .order("date", { ascending: false });

    if (!error && data) {
      setShifts(data);
    }
    setIsLoading(false);
  };

  const handleLogout = async () => {
    setIsLoading(true);
    await supabase.auth.signOut();
    localStorage.removeItem("supabase.auth.token"); 
    router.push("/");
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
      user_id: userId,
    };

    if (editingId) {
      const { error } = await supabase.from("work_shifts").update(shiftData).eq("id", editingId);
      if (error) alert(t.work.updateError + error.message);
      else { resetForm(); fetchShifts(userId); }
    } else {
      const { error } = await supabase.from("work_shifts").insert([shiftData]);
      if (error) {
        if (error.message.includes("duplicate key") || error.code === '23505') {
          alert(t.work.duplicateError);
        } else {
          alert(t.work.errorPrefix + error.message);
        }
      } else { 
        resetForm(); 
        fetchShifts(userId); 
      }
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
    if (confirm(t.work.confirmDelete)) {
      const { error } = await supabase.from("work_shifts").delete().eq("id", id);
      
      if (error) {
        alert(t.work.errorPrefix + error.message);
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
    return <div className="min-h-screen bg-[#121212] text-white flex items-center justify-center">{t.common.loading}</div>;
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
        label: t.work.tableIncome,
        data: chronologicalShifts.map(s => s.uber + s.wolt + s.bolt + s.glovo),
        backgroundColor: "rgba(76, 175, 80, 0.1)",
        borderColor: "rgba(76, 175, 80, 0.3)",
        borderWidth: 1,
        yAxisID: 'y',
      },
      {
        type: 'line' as const,
        label: t.work.tableRate,
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
        label: t.work.tableKm,
        data: chronologicalShifts.map(s => s.km),
        borderColor: "rgba(168, 85, 247, 0.5)",
        backgroundColor: "rgba(168, 85, 247, 0.5)",
        borderWidth: 2,
        pointRadius: 2,
        yAxisID: 'y1',
      },
      {
        type: 'line' as const,
        label: t.work.tableHours,
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
    <div className="min-h-screen bg-[#121212] text-white p-4 md:p-10">
      <div className="max-w-5xl mx-auto">
        
        {/* Шапка з мовами */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 border-b border-gray-800 pb-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold">
              {editingId ? t.work.editTitle : t.work.title}
            </h1>
            {userNickname && <p className="text-xs text-gray-500 mt-1">@ {userNickname}</p>}
          </div>
          
          <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
            <div className="flex bg-[#1e1e24] p-1 rounded-lg border border-gray-700 text-xs font-bold">
              {(["pl", "uk", "en", "ru"] as const).map((l) => (
                <button
                  key={l}
                  onClick={() => setLanguage(l)}
                  className={`px-2 py-1.5 rounded-md uppercase transition-all ${
                    lang === l ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-sm" : "text-gray-400 hover:text-white"
                  }`}
                >
                  {l}
                </button>
              ))}
            </div>

            <Link href="/garage" className="bg-gray-800 hover:bg-gray-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition text-center">
              {t.work.garageBtn}
            </Link>
            <button onClick={handleLogout} className="bg-red-900/20 text-red-400 hover:bg-red-900/40 text-sm font-medium px-4 py-2 rounded-lg transition text-center">
              {t.common.logout}
            </button>
          </div>
        </div>

        {/* ... Решта інтерфейсу дашборду без змін ... */}
        {!isFormOpen && (
          <button onClick={() => setIsFormOpen(true)} className="w-full mb-6 bg-gradient-to-r from-green-600 to-green-500 hover:from-green-500 hover:to-green-400 text-white font-bold px-6 py-4 rounded-xl transition shadow-lg text-lg">
            {t.work.addShiftBtn}
          </button>
        )}

        <div className={`transition-all duration-500 ease-in-out overflow-hidden ${isFormOpen ? "max-h-[1200px] opacity-100 mb-8" : "max-h-0 opacity-0"}`}>
          <form onSubmit={handleSubmit} className={`p-5 md:p-6 rounded-xl border shadow-lg transition-all ${editingId ? 'bg-[#25251a] border-yellow-700/50' : 'bg-[#1e1e24] border-gray-800'}`}>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 mb-6">
              <div>
                <label className="block text-sm text-gray-400 mb-1.5">{t.work.date}</label>
                <input type="date" required value={date} onChange={(e) => setDate(e.target.value)} disabled={editingId !== null} className="w-full bg-[#2a2a35] border border-gray-700 rounded-xl p-3.5 text-white focus:outline-none focus:border-green-500 disabled:opacity-50 text-base" />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1.5">{t.work.mileage}</label>
                <input type="number" step="0.1" required value={km} onChange={(e) => setKm(e.target.value)} className="w-full bg-[#2a2a35] border border-gray-700 rounded-xl p-3.5 text-white focus:outline-none focus:border-green-500 text-base font-medium" />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1.5">{t.work.hours}</label>
                <input type="number" step="0.1" required value={hours} onChange={(e) => setHours(e.target.value)} className="w-full bg-[#2a2a35] border border-gray-700 rounded-xl p-3.5 text-white focus:outline-none focus:border-green-500 text-base font-medium" />
              </div>
            </div>

            <div className="border-t border-gray-800 pt-5 mb-6">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-4">
                <h2 className="text-lg font-medium">{t.work.incomePlatforms}</h2>
                {availableToAdd.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {availableToAdd.map(platform => (
                      <button key={platform} type="button" onClick={() => setActivePlatforms([...activePlatforms, platform])} className="text-xs bg-gray-800 hover:bg-gray-700 border border-gray-700 px-3 py-2 rounded-lg transition capitalize font-medium">+ {platform}</button>
                    ))}
                  </div>
                )}
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
                {activePlatforms.map((platform) => (
                  <div key={platform} className="relative">
                    <label className="block text-xs text-gray-400 mb-1.5 capitalize pl-1">{platform}</label>
                    <input type="number" step="0.01" value={earnings[platform as keyof typeof earnings]} onChange={(e) => handleEarningChange(platform, e.target.value)} placeholder="0.00" className="w-full bg-[#2a2a35] border border-gray-700 rounded-xl p-3 text-white text-lg font-bold focus:outline-none focus:border-green-500 transition" />
                    {activePlatforms.length > 1 && (
                      <button type="button" onClick={() => { setActivePlatforms(activePlatforms.filter(p => p !== platform)); handleEarningChange(platform, ""); }} className="absolute top-0 right-0 text-gray-500 hover:text-red-500 text-sm p-2">✕</button>
                    )}
                  </div>
                ))}
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-3">
              <button type="submit" disabled={isSubmitting} className={`flex-1 py-4 rounded-xl font-bold text-lg transition ${editingId ? "bg-yellow-600 hover:bg-yellow-500 text-white" : "bg-green-600 hover:bg-green-500 text-white"} ${isSubmitting && "opacity-70 cursor-not-allowed"}`}>
                {isSubmitting ? t.work.saving : (editingId ? t.work.updateShift : t.work.saveShift)}
              </button>
              <button type="button" onClick={resetForm} className="sm:w-1/3 py-4 rounded-xl font-bold text-lg bg-gray-800 hover:bg-gray-700 border border-gray-700 transition">
                {t.common.cancel}
              </button>
            </div>
          </form>
        </div>

        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-6 border-b border-gray-800 pb-4">
          <h2 className="text-xl md:text-2xl font-bold">{t.work.statsTitle}</h2>
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Link href="/work/year" className="flex-1 sm:flex-none text-center bg-blue-600 hover:bg-blue-500 text-white px-4 py-2.5 rounded-lg font-medium transition text-sm">
              {t.work.yearReportBtn}
            </Link>
            <input type="month" value={selectedMonth} onChange={(e) => setSelectedMonth(e.target.value)} className="flex-1 sm:flex-none bg-[#2a2a35] border border-gray-700 rounded-lg p-2 text-white focus:outline-none focus:border-green-500 font-medium text-center" />
          </div>
        </div>

        {bestShiftDate && (
          <div className="mb-6">
            <button onClick={() => setShowBestMonthDay(!showBestMonthDay)} className="w-full bg-[#24242d] hover:bg-[#2c2c38] border border-gray-800 p-4 rounded-xl font-medium text-yellow-500 transition flex justify-between items-center text-sm md:text-base">
              <span>{showBestMonthDay ? t.work.hideBestDay : t.work.showBestDay}</span>
              <span className="text-xs bg-gray-800 px-2 md:px-3 py-1 rounded text-gray-400 hidden sm:inline-block">{t.work.clickToView}</span>
            </button>
            <div className={`transition-all duration-500 ease-in-out overflow-hidden ${showBestMonthDay ? "max-h-40 opacity-100 mt-2 border-l-4 border-yellow-500 p-4 md:p-5 bg-gradient-to-r from-yellow-600/20 to-transparent rounded-r-xl" : "max-h-0 opacity-0"}`}>
              <div className="flex justify-between items-center w-full">
                <div>
                  <h4 className="font-bold text-yellow-500 text-sm md:text-base">{t.work.bestDayTitle}</h4>
                  <p className="text-gray-400 text-xs md:text-sm mt-1">{t.work.date}: {new Date(bestShiftDate).toLocaleDateString("uk-UA")}</p>
                </div>
                <div className="text-2xl md:text-3xl font-black text-yellow-500">{maxEarned.toFixed(2)} {t.common.currency}</div>
              </div>
            </div>
          </div>
        )}

        <div className="mb-4">
          <span className="text-xs font-semibold text-gray-500 tracking-wider uppercase mb-2 block">{t.work.totalMonthTitle}</span>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="bg-gradient-to-br from-[#1e1e24] to-[#252530] p-4 md:p-5 rounded-xl border border-gray-800 text-center shadow-md">
              <h3 className="text-gray-400 text-[10px] md:text-xs uppercase tracking-wider mb-1">{t.work.totalIncome}</h3>
              <p className="text-2xl md:text-3xl font-black text-green-400">{totalEarned.toFixed(2)} <span className="text-sm md:text-base font-normal">{t.common.currency}</span></p>
            </div>
            <div className="bg-[#1e1e24] p-4 rounded-xl border border-gray-800 text-center flex flex-col justify-center">
              <h3 className="text-gray-400 text-[10px] md:text-xs uppercase tracking-wider mb-1">{t.work.totalHours}</h3>
              <p className="text-xl md:text-2xl font-bold text-white">{totalHours.toFixed(1)} <span className="text-xs md:text-sm font-normal text-gray-500">{t.common.hrs}</span></p>
            </div>
            <div className="bg-[#1e1e24] p-4 rounded-xl border border-gray-800 text-center flex flex-col justify-center">
              <h3 className="text-gray-400 text-[10px] md:text-xs uppercase tracking-wider mb-1">{t.work.totalKm}</h3>
              <p className="text-xl md:text-2xl font-bold text-purple-400">{totalKm.toFixed(1)} <span className="text-xs md:text-sm font-normal text-gray-500">{t.common.km}</span></p>
            </div>
          </div>
        </div>

        <div className="mb-8">
          <span className="text-xs font-semibold text-gray-500 tracking-wider uppercase mb-2 block">{t.work.avgStatsTitle}</span>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            <div className="col-span-2 md:col-span-1 bg-[#1e1e24] p-4 rounded-xl border border-gray-800 text-center border-b-2 border-green-500/50 shadow-sm">
              <h3 className="text-gray-400 text-xs uppercase tracking-wider mb-1">{t.work.incomePerDay}</h3>
              <p className="text-2xl md:text-lg font-bold text-green-400">{avgEarnedPerDay} <span className="text-sm md:text-xs font-normal">{t.common.currency}</span></p>
            </div>
            <div className="bg-[#1e1e24] p-3 md:p-4 rounded-xl border border-gray-800 text-center flex flex-col justify-center">
              <h3 className="text-gray-400 text-[10px] uppercase tracking-wider mb-1">{t.work.ratePerHour}</h3>
              <p className="text-base md:text-lg font-bold text-blue-400">{avgPerHour} <span className="text-xs font-normal">{t.common.currency}</span></p>
            </div>
            <div className="bg-[#1e1e24] p-3 md:p-4 rounded-xl border border-gray-800 text-center flex flex-col justify-center">
              <h3 className="text-gray-400 text-[10px] uppercase tracking-wider mb-1">{t.work.effPerKm}</h3>
              <p className="text-base md:text-lg font-bold text-purple-400">{avgPerKm} <span className="text-xs font-normal">{t.common.currency}</span></p>
            </div>
            <div className="bg-[#1e1e24] p-3 md:p-4 rounded-xl border border-gray-800 text-center flex flex-col justify-center">
              <h3 className="text-gray-400 text-[10px] uppercase tracking-wider mb-1">{t.work.kmPerDay}</h3>
              <p className="text-base md:text-lg font-bold text-gray-300">{avgKmPerDay} <span className="text-xs font-normal">{t.common.km}</span></p>
            </div>
            <div className="bg-[#1e1e24] p-3 md:p-4 rounded-xl border border-gray-800 text-center flex flex-col justify-center">
              <h3 className="text-gray-400 text-[10px] uppercase tracking-wider mb-1">{t.work.hrsPerDay}</h3>
              <p className="text-base md:text-lg font-bold text-gray-300">{avgHoursPerDay} <span className="text-xs font-normal">{t.common.hrs}</span></p>
            </div>
          </div>
        </div>

        {filteredShifts.length > 0 && (
          <div className="bg-[#1e1e24] p-3 md:p-6 rounded-xl border border-gray-800 mb-8 hidden sm:block">
            <h3 className="text-sm font-medium text-gray-400 mb-4">{t.work.chartTitle}</h3>
            <div className="w-full h-64 relative"><Bar data={monthlyChartData as any} options={monthlyChartOptions as any} /></div>
          </div>
        )}

        <div className="mb-2 flex justify-between items-end">
          <h2 className="text-lg font-medium text-white">{t.work.historyTitle}</h2>
          <span className="text-xs text-gray-400 bg-gray-800 px-2 py-1 rounded">{t.work.workDays} {filteredShifts.length}</span>
        </div>

        <div className="hidden md:block bg-[#1e1e24] rounded-xl border border-gray-800 overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#2a2a35] text-gray-400 text-sm">
                <th className="p-4 font-medium">{t.work.tableDate}</th>
                <th className="p-4 font-medium">{t.work.tableIncome}</th>
                <th className="p-4 font-medium">{t.work.tableHours}</th>
                <th className="p-4 font-medium">{t.work.tableRate}</th>
                <th className="p-4 font-medium">{t.work.tableKm}</th>
                <th className="p-4 font-medium">{t.work.tableEff}</th>
                <th className="p-4 font-medium text-right">{t.work.tableActions}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {isLoading ? (
                <tr><td colSpan={7} className="p-8 text-center text-gray-500">{t.common.loading}</td></tr>
              ) : filteredShifts.length === 0 ? (
                <tr><td colSpan={7} className="p-8 text-center text-gray-500">{t.work.noRecords}</td></tr>
              ) : (
                filteredShifts.map((shift) => {
                  const dailyTotal = shift.uber + shift.wolt + shift.bolt + shift.glovo;
                  const dailyAvgHour = shift.hours > 0 ? (dailyTotal / shift.hours).toFixed(2) : "0.00";
                  const dailyAvgKm = shift.km > 0 ? (dailyTotal / shift.km).toFixed(2) : "0.00";
                  return (
                    <tr key={shift.id} className="hover:bg-[#2a2a35] transition">
                      <td className="p-4 font-medium">{new Date(shift.date).toLocaleDateString("uk-UA")}</td>
                      <td className="p-4 font-bold text-green-400">{dailyTotal.toFixed(2)} {t.common.currency}</td>
                      <td className="p-4">{shift.hours}</td>
                      <td className="p-4 text-blue-400">{dailyAvgHour}</td>
                      <td className="p-4 text-gray-400">{shift.km} {t.common.km}</td>
                      <td className="p-4 text-purple-400">{dailyAvgKm}</td>
                      <td className="p-4 text-right">
                        <button onClick={() => handleEdit(shift)} className="text-gray-400 hover:text-yellow-500 p-2 transition">✏️</button>
                        <button onClick={() => handleDelete(shift.id)} className="text-gray-400 hover:text-red-500 p-2 transition">🗑️</button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        <div className="md:hidden flex flex-col gap-3 pb-10">
          {isLoading ? (
            <div className="text-center text-gray-500 py-8 bg-[#1e1e24] rounded-xl border border-gray-800">{t.common.loading}</div>
          ) : filteredShifts.length === 0 ? (
            <div className="text-center text-gray-500 py-8 bg-[#1e1e24] rounded-xl border border-gray-800">{t.work.noRecords}</div>
          ) : (
            filteredShifts.map((shift) => {
              const dailyTotal = shift.uber + shift.wolt + shift.bolt + shift.glovo;
              const dailyAvgHour = shift.hours > 0 ? (dailyTotal / shift.hours).toFixed(2) : "0.00";
              const dailyAvgKm = shift.km > 0 ? (dailyTotal / shift.km).toFixed(2) : "0.00";
              return (
                <div key={shift.id} className="bg-[#1e1e24] p-4 rounded-xl border border-gray-800 shadow-sm relative">
                  <div className="flex justify-between items-center mb-3 border-b border-gray-700/50 pb-3">
                    <span className="font-bold text-white text-lg">{new Date(shift.date).toLocaleDateString("uk-UA", { weekday: 'short', day: 'numeric', month: 'short' })}</span>
                    <span className="font-black text-green-400 text-xl">{dailyTotal.toFixed(2)} <span className="text-sm font-normal">{t.common.currency}</span></span>
                  </div>
                  <div className="grid grid-cols-2 gap-y-3 gap-x-4 text-sm mb-4">
                    <div className="bg-[#2a2a35] p-2 rounded-lg"><span className="text-gray-400 block text-[10px] uppercase">{t.work.tableHours}</span> <span className="font-bold">{shift.hours}</span></div>
                    <div className="bg-[#2a2a35] p-2 rounded-lg"><span className="text-gray-400 block text-[10px] uppercase">{t.work.tableKm}</span> <span className="font-bold">{shift.km} <span className="text-xs font-normal">{t.common.km}</span></span></div>
                    <div className="bg-[#2a2a35] p-2 rounded-lg"><span className="text-gray-400 block text-[10px] uppercase">{t.work.rateUnit}</span> <span className="font-bold text-blue-400">{dailyAvgHour}</span></div>
                    <div className="bg-[#2a2a35] p-2 rounded-lg"><span className="text-gray-400 block text-[10px] uppercase">{t.work.effUnit}</span> <span className="font-bold text-purple-400">{dailyAvgKm}</span></div>
                  </div>
                  <div className="flex justify-between gap-2 pt-1">
                    <button onClick={() => handleEdit(shift)} className="flex-1 bg-gray-800 hover:bg-gray-700 border border-gray-700 py-2.5 rounded-lg text-yellow-500 text-sm font-bold transition flex items-center justify-center gap-1">✏️ {t.common.edit}</button>
                    <button onClick={() => handleDelete(shift.id)} className="w-12 bg-red-900/20 hover:bg-red-900/40 border border-red-900/30 rounded-lg text-red-500 transition flex items-center justify-center">🗑️</button>
                  </div>
                </div>
              );
            })
          )}
        </div>

      </div>

      {/* ПРИМУСОВЕ МОДАЛЬНЕ ВІКНО ДЛЯ СТВОРЕННЯ НІКНЕЙМУ */}
      {showNicknameModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-xl">
          <div className="bg-[#1e1e24] border border-gray-800 rounded-2xl w-full max-w-md p-6 md:p-8 relative shadow-2xl text-center">
            
            <h2 className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500 mb-2">
              {lang === "pl" ? "Wybierz swój pseudonim" : lang === "en" ? "Choose your nickname" : lang === "ru" ? "Выбери свой никнейм" : "Придумай свій нікнейм"}
            </h2>
            
            <p className="text-gray-400 text-sm mb-6">
              {lang === "pl" ? "Wprowadzamy globalny ranking kurierów! Wybierz unikalną nazwę, aby brać udział i widzieć wyniki innych." : 
               lang === "en" ? "We are introducing a global courier leaderboard! Choose a unique name to participate and see others' stats." : 
               lang === "ru" ? "Мы внедряем глобальный рейтинг курьеров! Выбери уникальное имя, чтобы участвовать и видеть результаты других." : 
               "Ми впроваджуємо загальний рейтинг кур'єрів! Обери унікальне ім'я, щоб брати участь та бачити результати друзів."}
            </p>

            {nicknameError && (
              <div className="bg-red-900/30 border border-red-700/50 text-red-400 p-3 rounded-xl text-xs mb-4 text-left">
                {nicknameError}
              </div>
            )}

            <form onSubmit={handleNicknameSubmit} className="space-y-4">
              <div className="text-left">
                <input 
                  type="text" 
                  required
                  pattern="^[a-zA-TR-Z0-9_]{3,15}$"
                  title="Від 3 до 15 символів (англійські літери, цифри, підкреслення)"
                  value={newNickname}
                  onChange={(e) => setNewNickname(e.target.value.replace(/[^a-zA-Z0-9_]/g, ""))} // тільки англ літери і цифри
                  placeholder="Courier_Hero_2026"
                  className="w-full text-center font-bold tracking-wide text-lg bg-[#2a2a35] border border-gray-700 rounded-xl p-3.5 text-white focus:outline-none focus:border-blue-500"
                />
                <span className="text-[10px] text-gray-500 mt-1.5 block text-center">
                  * Тільки англійські літери, цифри та символ "_" (3-15 символів).
                </span>
              </div>

              <button 
                type="submit" 
                disabled={isSavingNickname || !newNickname.trim()}
                className={`w-full py-4 rounded-xl font-bold text-lg text-white bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 transition shadow-lg ${
                  (isSavingNickname || !newNickname.trim()) && "opacity-50 cursor-not-allowed"
                }`}
              >
                {isSavingNickname ? t.work.saving : (lang === "pl" ? "Zatwierdź" : lang === "en" ? "Confirm" : lang === "ru" ? "Подтвердить" : "Підтвердити 🚀")}
              </button>
            </form>

          </div>
        </div>
      )}
    </div>
  );
}