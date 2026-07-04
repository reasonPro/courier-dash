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

export default function WorkDashboard() {
  const router = useRouter();
  const { lang, setLanguage, t } = useLanguage();
  const [userId, setUserId] = useState<string | null>(null);
  
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [km, setKm] = useState("");
  const [hours, setHours] = useState("");
  const [earnings, setEarnings] = useState({ uber: "", wolt: "", bolt: "", glovo: "" });
  const [orders, setOrders] = useState({ uber: "", wolt: "", bolt: "", glovo: "" });
  const [tips, setTips] = useState({ uber: "", wolt: "", bolt: "", glovo: "" });
  const [bonuses, setBonuses] = useState({ uber: "", wolt: "", bolt: "", glovo: "" });
  const [showExtras, setShowExtras] = useState(false);
  
  const [activePlatforms, setActivePlatforms] = useState(["uber", "wolt"]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  
  const [showBestMonthDay, setShowBestMonthDay] = useState(false);
  const [includeTips, setIncludeTips] = useState(false);
  const [includeBonuses, setIncludeBonuses] = useState(false);
  const [showMobileTable, setShowMobileTable] = useState(false);

  const [shifts, setShifts] = useState<Shift[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7));

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
        checkNickname(session.user);
      }
    };
    checkUser();
  }, [router]);

  const checkNickname = async (sessionUser: any) => {
    const { data, error } = await supabase
      .from("profiles")
      .select("nickname")
      .eq("id", sessionUser.id)
      .single();

    if (error || !data || !data.nickname) {
      const metaNickname = sessionUser.user_metadata?.nickname;
      if (metaNickname) {
        await supabase.from("profiles").upsert({ id: sessionUser.id, nickname: metaNickname });
        setUserNickname(metaNickname);
      } else {
        setShowNicknameModal(true);
      }
    } else {
      setUserNickname(data.nickname);
    }
  };

  const handleNicknameSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId || !newNickname.trim()) return;
    setNicknameError(null);
    setIsSavingNickname(true);
    const cleanNickname = newNickname.trim();
    const { data: existing } = await supabase.from("profiles").select("nickname").eq("nickname", cleanNickname);
    if (existing && existing.length > 0) {
      setNicknameError(lang === "pl" ? "Ta nazwa jest już zajęta!" : lang === "en" ? "This nickname is already taken!" : lang === "ru" ? "Этот ник уже занят!" : "Цей нікнейм уже зайнятий!");
      setIsSavingNickname(false);
      return;
    }
    const { error } = await supabase.from("profiles").upsert({ id: userId, nickname: cleanNickname });
    if (error) setNicknameError(error.message);
    else { setUserNickname(cleanNickname); setShowNicknameModal(false); }
    setIsSavingNickname(false);
  };

  const fetchShifts = async (uid: string) => {
    setIsLoading(true);
    const { data, error } = await supabase
      .from("work_shifts")
      .select("*")
      .eq("user_id", uid)
      .order("date", { ascending: false });
    if (!error && data) setShifts(data);
    setIsLoading(false);
  };

  const handleLogout = async () => {
    setIsLoading(true);
    await supabase.auth.signOut();
    localStorage.removeItem("supabase.auth.token"); 
    router.push("/");
  };

  const handleEarningChange = (platform: string, value: string) => setEarnings((prev) => ({ ...prev, [platform]: value }));
  const handleOrderChange = (platform: string, value: string) => setOrders((prev) => ({ ...prev, [platform]: value }));
  const handleTipChange = (platform: string, value: string) => setTips((prev) => ({ ...prev, [platform]: value }));
  const handleBonusChange = (platform: string, value: string) => setBonuses((prev) => ({ ...prev, [platform]: value }));

  const removePlatform = (platform: string) => {
    setActivePlatforms(activePlatforms.filter(p => p !== platform));
    handleEarningChange(platform, "");
    handleOrderChange(platform, "");
    handleTipChange(platform, "");
    handleBonusChange(platform, "");
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
      
      orders_uber: activePlatforms.includes("uber") ? parseInt(orders.uber) || 0 : 0,
      orders_wolt: activePlatforms.includes("wolt") ? parseInt(orders.wolt) || 0 : 0,
      orders_bolt: activePlatforms.includes("bolt") ? parseInt(orders.bolt) || 0 : 0,
      orders_glovo: activePlatforms.includes("glovo") ? parseInt(orders.glovo) || 0 : 0,
      
      tips_uber: activePlatforms.includes("uber") ? parseFloat(tips.uber) || 0 : 0,
      tips_wolt: activePlatforms.includes("wolt") ? parseFloat(tips.wolt) || 0 : 0,
      tips_bolt: activePlatforms.includes("bolt") ? parseFloat(tips.bolt) || 0 : 0,
      tips_glovo: activePlatforms.includes("glovo") ? parseFloat(tips.glovo) || 0 : 0,
      
      bonuses_uber: activePlatforms.includes("uber") ? parseFloat(bonuses.uber) || 0 : 0,
      bonuses_wolt: activePlatforms.includes("wolt") ? parseFloat(bonuses.wolt) || 0 : 0,
      bonuses_bolt: activePlatforms.includes("bolt") ? parseFloat(bonuses.bolt) || 0 : 0,
      bonuses_glovo: activePlatforms.includes("glovo") ? parseFloat(bonuses.glovo) || 0 : 0,
      
      user_id: userId,
    };

    if (editingId) {
      const { error } = await supabase.from("work_shifts").update(shiftData).eq("id", editingId);
      if (error) alert(t.work.updateError + error.message);
      else { resetForm(); fetchShifts(userId); }
    } else {
      const { error } = await supabase.from("work_shifts").insert([shiftData]);
      if (error) {
        if (error.message.includes("duplicate key") || error.code === '23505') alert(t.work.duplicateError);
        else alert(t.work.errorPrefix + error.message);
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

    setOrders({
      uber: shift.orders_uber > 0 ? shift.orders_uber.toString() : "",
      wolt: shift.orders_wolt > 0 ? shift.orders_wolt.toString() : "",
      bolt: shift.orders_bolt > 0 ? shift.orders_bolt.toString() : "",
      glovo: shift.orders_glovo > 0 ? shift.orders_glovo.toString() : "",
    });

    setTips({
      uber: shift.tips_uber > 0 ? shift.tips_uber.toString() : "",
      wolt: shift.tips_wolt > 0 ? shift.tips_wolt.toString() : "",
      bolt: shift.tips_bolt > 0 ? shift.tips_bolt.toString() : "",
      glovo: shift.tips_glovo > 0 ? shift.tips_glovo.toString() : "",
    });

    setBonuses({
      uber: shift.bonuses_uber > 0 ? shift.bonuses_uber.toString() : "",
      wolt: shift.bonuses_wolt > 0 ? shift.bonuses_wolt.toString() : "",
      bolt: shift.bonuses_bolt > 0 ? shift.bonuses_bolt.toString() : "",
      glovo: shift.bonuses_glovo > 0 ? shift.bonuses_glovo.toString() : "",
    });

    const hasExtras = (
      (shift.tips_uber||0) + (shift.tips_wolt||0) + (shift.tips_bolt||0) + (shift.tips_glovo||0) + 
      (shift.bonuses_uber||0) + (shift.bonuses_wolt||0) + (shift.bonuses_bolt||0) + (shift.bonuses_glovo||0)
    ) > 0;
    
    setShowExtras(hasExtras);

    const active = [];
    if (shift.uber > 0 || shift.orders_uber > 0) active.push("uber");
    if (shift.wolt > 0 || shift.orders_wolt > 0) active.push("wolt");
    if (shift.bolt > 0 || shift.orders_bolt > 0) active.push("bolt");
    if (shift.glovo > 0 || shift.orders_glovo > 0) active.push("glovo");
    setActivePlatforms(active.length > 0 ? active : ["uber", "wolt"]);
    setIsFormOpen(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id: number) => {
    if (confirm(t.work.confirmDelete)) {
      const { error } = await supabase.from("work_shifts").delete().eq("id", id);
      if (error) alert(t.work.errorPrefix + error.message);
      else if (userId) fetchShifts(userId);
    }
  };

  const resetForm = () => {
    setEditingId(null);
    setDate(new Date().toISOString().split("T")[0]);
    setKm("");
    setHours("");
    setEarnings({ uber: "", wolt: "", bolt: "", glovo: "" });
    setOrders({ uber: "", wolt: "", bolt: "", glovo: "" });
    setTips({ uber: "", wolt: "", bolt: "", glovo: "" });
    setBonuses({ uber: "", wolt: "", bolt: "", glovo: "" });
    setShowExtras(false);
    setActivePlatforms(["uber", "wolt"]);
    setIsFormOpen(false);
  };

  if (!userId) return <div className="min-h-screen bg-[#121212] text-white flex items-center justify-center">{t.common.loading}</div>;

  const availableToAdd = ["uber", "wolt", "bolt", "glovo"].filter(p => !activePlatforms.includes(p));
  const filteredShifts = shifts.filter(shift => shift.date.startsWith(selectedMonth));

  let totalEarned = 0, totalHours = 0, totalKm = 0, totalOrders = 0;
  let maxEarned = 0, bestShiftDate = ""; 

  filteredShifts.forEach(shift => {
    let dailyTotal = shift.uber + shift.wolt + shift.bolt + shift.glovo;
    let dailyTips = (shift.tips_uber || 0) + (shift.tips_wolt || 0) + (shift.tips_bolt || 0) + (shift.tips_glovo || 0);
    let dailyBonuses = (shift.bonuses_uber || 0) + (shift.bonuses_wolt || 0) + (shift.bonuses_bolt || 0) + (shift.bonuses_glovo || 0);
    
    if (includeTips) dailyTotal += dailyTips;
    if (includeBonuses) dailyTotal += dailyBonuses;

    const dailyOrders = shift.orders_uber + shift.orders_wolt + shift.orders_bolt + shift.orders_glovo;

    totalEarned += dailyTotal;
    totalHours += shift.hours;
    totalKm += shift.km;
    totalOrders += dailyOrders;

    if (dailyTotal > maxEarned) { maxEarned = dailyTotal; bestShiftDate = shift.date; }
  });

  const totalDays = filteredShifts.length;
  const avgPerHour = totalHours > 0 ? (totalEarned / totalHours).toFixed(2) : "0.00";
  const avgPerKm = totalKm > 0 ? (totalEarned / totalKm).toFixed(2) : "0.00";
  const avgPerOrder = totalOrders > 0 ? (totalEarned / totalOrders).toFixed(2) : "0.00";
  
  const avgKmPerDay = totalDays > 0 ? (totalKm / totalDays).toFixed(1) : "0.0";
  const avgHoursPerDay = totalDays > 0 ? (totalHours / totalDays).toFixed(1) : "0.0";
  const avgOrdersPerDay = totalDays > 0 ? (totalOrders / totalDays).toFixed(1) : "0.0";
  const avgEarnedPerDay = totalDays > 0 ? (totalEarned / totalDays).toFixed(2) : "0.00";

  const chronologicalShifts = [...filteredShifts].reverse();

  const chartDatasets: any[] = [
    { type: 'bar', label: 'Uber', data: chronologicalShifts.map(s => s.uber), backgroundColor: "#4b5563", stack: 'Stack 0' },
    { type: 'bar', label: 'Wolt', data: chronologicalShifts.map(s => s.wolt), backgroundColor: "#00c2e8", stack: 'Stack 0' },
    { type: 'bar', label: 'Bolt', data: chronologicalShifts.map(s => s.bolt), backgroundColor: "#22c55e", stack: 'Stack 0' },
    { type: 'bar', label: 'Glovo', data: chronologicalShifts.map(s => s.glovo), backgroundColor: "#eab308", stack: 'Stack 0' }
  ];

  if (includeTips) {
    chartDatasets.push({ type: 'bar', label: t.work.tipsLabel, data: chronologicalShifts.map(s => (s.tips_uber||0) + (s.tips_wolt||0) + (s.tips_bolt||0) + (s.tips_glovo||0)), backgroundColor: "#f43f5e", stack: 'Stack 0' });
  }
  if (includeBonuses) {
    chartDatasets.push({ type: 'bar', label: t.work.bonusesLabel, data: chronologicalShifts.map(s => (s.bonuses_uber||0) + (s.bonuses_wolt||0) + (s.bonuses_bolt||0) + (s.bonuses_glovo||0)), backgroundColor: "#a855f7", stack: 'Stack 0' });
  }

  chartDatasets.push(
    {
      type: 'line', label: t.work.tableRate,
      data: chronologicalShifts.map(s => {
        let total = s.uber + s.wolt + s.bolt + s.glovo;
        if (includeTips) total += (s.tips_uber||0) + (s.tips_wolt||0) + (s.tips_bolt||0) + (s.tips_glovo||0);
        if (includeBonuses) total += (s.bonuses_uber||0) + (s.bonuses_wolt||0) + (s.bonuses_bolt||0) + (s.bonuses_glovo||0);
        return s.hours > 0 ? Number((total / s.hours).toFixed(2)) : 0;
      }),
      borderColor: "#00e5ff", backgroundColor: "#00e5ff", borderWidth: 4, pointRadius: 4, tension: 0.3, yAxisID: 'y1'
    },
    { type: 'line', label: t.work.tableKm, data: chronologicalShifts.map(s => s.km), borderColor: "rgba(168, 85, 247, 0.5)", backgroundColor: "rgba(168, 85, 247, 0.5)", borderWidth: 2, pointRadius: 2, yAxisID: 'y1' },
    { type: 'line', label: t.work.tableHours, data: chronologicalShifts.map(s => s.hours), borderColor: "rgba(244, 63, 94, 0.5)", backgroundColor: "rgba(244, 63, 94, 0.5)", borderWidth: 2, pointRadius: 2, yAxisID: 'y1' }
  );

  const monthlyChartData = {
    labels: chronologicalShifts.map(s => new Date(s.date).toLocaleDateString("uk-UA", { day: 'numeric' })),
    datasets: chartDatasets
  };

  const monthlyChartOptions = {
    responsive: true, maintainAspectRatio: false,
    scales: {
      x: { stacked: true, grid: { display: false } },
      y: { stacked: true, type: 'linear' as const, position: 'left' as const, grid: { color: 'rgba(255, 255, 255, 0.03)' } },
      y1: { stacked: false, type: 'linear' as const, position: 'right' as const, grid: { drawOnChartArea: false } },
    },
    plugins: { legend: { labels: { color: '#a0a0a0', boxWidth: 12 } } }
  };

  return (
    <div className="min-h-screen bg-[#121212] text-white p-4 md:p-10">
      <div className="max-w-6xl mx-auto">
        
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 border-b border-gray-800 pb-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold">{editingId ? t.work.editTitle : t.work.title}</h1>
            {userNickname && <p className="text-xs text-gray-500 mt-1">@ {userNickname}</p>}
          </div>
          <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
            <div className="flex bg-[#1e1e24] p-1 rounded-lg border border-gray-700 text-xs font-bold">
              {(["pl", "uk", "en", "ru"] as const).map((l) => (
                <button key={l} onClick={() => setLanguage(l)} className={`px-2 py-1.5 rounded-md uppercase transition-all ${lang === l ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-sm" : "text-gray-400 hover:text-white"}`}>
                  {l}
                </button>
              ))}
            </div>
            <Link href="/garage" className="bg-gray-800 hover:bg-gray-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition text-center">{t.work.garageBtn}</Link>
            <button onClick={handleLogout} className="bg-red-900/20 text-red-400 hover:bg-red-900/40 text-sm font-medium px-4 py-2 rounded-lg transition text-center">{t.common.logout}</button>
          </div>
        </div>

        {!isFormOpen && (
          <button onClick={() => setIsFormOpen(true)} className="w-full mb-6 bg-gradient-to-r from-green-600 to-green-500 hover:from-green-500 hover:to-green-400 text-white font-bold px-6 py-4 rounded-xl transition shadow-lg text-lg">
            {t.work.addShiftBtn}
          </button>
        )}

        <div className={`transition-all duration-500 ease-in-out overflow-hidden ${isFormOpen ? "max-h-[2000px] opacity-100 mb-8" : "max-h-0 opacity-0"}`}>
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

            <div className="border-t border-gray-800 pt-5 mb-4">
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
              
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
                {activePlatforms.map((platform) => (
                  <div key={platform} className="relative bg-[#252530] p-3.5 rounded-xl border border-gray-700/50 shadow-inner">
                    <div className="flex justify-between items-center mb-2.5">
                      <label className="text-sm font-bold text-gray-300 capitalize">{platform}</label>
                      {activePlatforms.length > 1 && (
                        <button type="button" onClick={() => removePlatform(platform)} className="text-gray-500 hover:text-red-500 text-sm">✕</button>
                      )}
                    </div>
                    <div className={`grid gap-3 ${showExtras ? "grid-cols-2" : "grid-cols-2"}`}>
                      <div>
                        <span className="block text-[10px] text-gray-400 uppercase tracking-wider mb-1">{t.work.incomePlatforms}</span>
                        <input type="number" step="0.01" value={earnings[platform as keyof typeof earnings]} onChange={(e) => handleEarningChange(platform, e.target.value)} placeholder="0.00" className="w-full bg-[#1e1e24] border border-gray-700 rounded-lg p-2.5 text-white text-sm md:text-base font-bold focus:outline-none focus:border-green-500 transition" />
                      </div>
                      <div>
                        <span className="block text-[10px] text-gray-400 uppercase tracking-wider mb-1">{t.work.ordersLabel}</span>
                        <input type="number" step="1" value={orders[platform as keyof typeof orders]} onChange={(e) => handleOrderChange(platform, e.target.value)} placeholder="0" className="w-full bg-[#1e1e24] border border-gray-700 rounded-lg p-2.5 text-white text-sm md:text-base font-bold focus:outline-none focus:border-blue-500 transition" />
                      </div>
                      {showExtras && (
                        <>
                          <div>
                            <span className="block text-[10px] text-gray-400 uppercase tracking-wider mb-1">{t.work.tipsLabel}</span>
                            <input type="number" step="0.01" value={tips[platform as keyof typeof tips]} onChange={(e) => handleTipChange(platform, e.target.value)} placeholder="0.00" className="w-full bg-[#1e1e24] border border-gray-700 rounded-lg p-2.5 text-rose-400 text-sm md:text-base font-bold focus:outline-none focus:border-rose-500 transition" />
                          </div>
                          <div>
                            <span className="block text-[10px] text-gray-400 uppercase tracking-wider mb-1">{t.work.bonusesLabel}</span>
                            <input type="number" step="0.01" value={bonuses[platform as keyof typeof bonuses]} onChange={(e) => handleBonusChange(platform, e.target.value)} placeholder="0.00" className="w-full bg-[#1e1e24] border border-gray-700 rounded-lg p-2.5 text-purple-400 text-sm md:text-base font-bold focus:outline-none focus:border-purple-500 transition" />
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="mb-6">
              <button type="button" onClick={() => setShowExtras(!showExtras)} className="text-sm font-medium text-blue-400 hover:text-blue-300 transition">
                {showExtras ? t.work.hideExtrasBtn : t.work.addExtrasBtn}
              </button>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <button type="submit" disabled={isSubmitting} className={`flex-1 py-4 rounded-xl font-bold text-lg transition ${editingId ? "bg-yellow-600 hover:bg-yellow-500 text-white" : "bg-green-600 hover:bg-green-500 text-white"} ${isSubmitting && "opacity-70 cursor-not-allowed"}`}>
                {isSubmitting ? t.work.saving : (editingId ? t.work.updateShift : t.work.saveShift)}
              </button>
              <button type="button" onClick={resetForm} className="sm:w-1/3 py-4 rounded-xl font-bold text-lg bg-gray-800 hover:bg-gray-700 border border-gray-700 transition">
                {t.common.cancel}
              </button>
            </div>
          </form>
        </div>

        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-4 border-b border-gray-800 pb-4">
          <h2 className="text-xl md:text-2xl font-bold">{t.work.statsTitle}</h2>
          <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
            <Link href="/work/year" className="flex-1 sm:flex-none text-center bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg font-medium transition text-sm">
              {t.work.yearReportBtn}
            </Link>
            <input type="month" value={selectedMonth} onChange={(e) => setSelectedMonth(e.target.value)} className="flex-1 sm:flex-none bg-[#2a2a35] border border-gray-700 rounded-lg p-1.5 text-white focus:outline-none focus:border-green-500 font-medium text-center" />
          </div>
        </div>

        <div className="flex flex-wrap gap-2 mb-5">
          <button onClick={() => setIncludeTips(!includeTips)} className={`px-4 py-2 rounded-full text-xs font-bold transition border shadow-sm ${includeTips ? 'bg-rose-500/20 text-rose-400 border-rose-500/50' : 'bg-[#1e1e24] text-gray-500 border-gray-800 hover:text-gray-300'}`}>
             {includeTips ? "✓ " : "+ "}{t.work.toggleTips}
          </button>
          <button onClick={() => setIncludeBonuses(!includeBonuses)} className={`px-4 py-2 rounded-full text-xs font-bold transition border shadow-sm ${includeBonuses ? 'bg-purple-500/20 text-purple-400 border-purple-500/50' : 'bg-[#1e1e24] text-gray-500 border-gray-800 hover:text-gray-300'}`}>
             {includeBonuses ? "✓ " : "+ "}{t.work.toggleBonuses}
          </button>
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
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="bg-gradient-to-br from-[#1e1e24] to-[#252530] p-4 md:p-5 rounded-xl border border-gray-800 text-center shadow-md">
              <h3 className="text-gray-400 text-[10px] md:text-xs uppercase tracking-wider mb-1">{t.work.totalIncome}</h3>
              <p className="text-xl sm:text-2xl md:text-3xl font-black text-green-400">{totalEarned.toFixed(2)} <span className="text-[10px] sm:text-sm md:text-base font-normal">{t.common.currency}</span></p>
            </div>
            <div className="bg-[#1e1e24] p-4 rounded-xl border border-gray-800 text-center flex flex-col justify-center">
              <h3 className="text-gray-400 text-[10px] md:text-xs uppercase tracking-wider mb-1">{t.work.totalOrders}</h3>
              <p className="text-xl md:text-2xl font-bold text-blue-400">{totalOrders} <span className="text-[10px] font-normal text-gray-500">{t.work.tableOrders}</span></p>
            </div>
            <div className="bg-[#1e1e24] p-4 rounded-xl border border-gray-800 text-center flex flex-col justify-center">
              <h3 className="text-gray-400 text-[10px] md:text-xs uppercase tracking-wider mb-1">{t.work.totalHours}</h3>
              <p className="text-xl md:text-2xl font-bold text-white">{totalHours.toFixed(1)} <span className="text-[10px] font-normal text-gray-500">{t.common.hrs}</span></p>
            </div>
            <div className="bg-[#1e1e24] p-4 rounded-xl border border-gray-800 text-center flex flex-col justify-center">
              <h3 className="text-gray-400 text-[10px] md:text-xs uppercase tracking-wider mb-1">{t.work.totalKm}</h3>
              <p className="text-xl md:text-2xl font-bold text-purple-400">{totalKm.toFixed(1)} <span className="text-[10px] font-normal text-gray-500">{t.common.km}</span></p>
            </div>
          </div>
        </div>

        <div className="mb-8">
          <span className="text-xs font-semibold text-gray-500 tracking-wider uppercase mb-2 block">{t.work.avgStatsTitle}</span>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2">
            <div className="bg-[#1e1e24] p-3 rounded-xl border border-gray-800 text-center border-b-2 border-green-500/50 shadow-sm">
              <h3 className="text-gray-400 text-[10px] uppercase tracking-wider mb-1">{t.work.incomePerDay}</h3>
              <p className="text-lg font-bold text-green-400">{avgEarnedPerDay} <span className="text-[10px] font-normal">{t.common.currency}</span></p>
            </div>
            <div className="bg-[#1e1e24] p-3 rounded-xl border border-gray-800 text-center flex flex-col justify-center">
              <h3 className="text-gray-400 text-[10px] uppercase tracking-wider mb-1">{t.work.ratePerHour}</h3>
              <p className="text-lg font-bold text-white">{avgPerHour} <span className="text-[10px] font-normal text-gray-500">{t.common.currency}</span></p>
            </div>
            <div className="bg-[#1e1e24] p-3 rounded-xl border border-gray-800 text-center flex flex-col justify-center">
              <h3 className="text-gray-400 text-[10px] uppercase tracking-wider mb-1">{t.work.ratePerOrder}</h3>
              <p className="text-lg font-bold text-blue-400">{avgPerOrder} <span className="text-[10px] font-normal text-gray-500">{t.common.currency}</span></p>
            </div>
            <div className="bg-[#1e1e24] p-3 rounded-xl border border-gray-800 text-center flex flex-col justify-center">
              <h3 className="text-gray-400 text-[10px] uppercase tracking-wider mb-1">{t.work.effPerKm}</h3>
              <p className="text-lg font-bold text-purple-400">{avgPerKm} <span className="text-[10px] font-normal text-gray-500">{t.common.currency}</span></p>
            </div>
            <div className="bg-[#1e1e24] p-3 rounded-xl border border-gray-800 text-center flex flex-col justify-center">
              <h3 className="text-gray-400 text-[10px] uppercase tracking-wider mb-1">{t.work.ordersPerDay}</h3>
              <p className="text-lg font-bold text-gray-300">{avgOrdersPerDay}</p>
            </div>
            <div className="bg-[#1e1e24] p-3 rounded-xl border border-gray-800 text-center flex flex-col justify-center">
              <h3 className="text-gray-400 text-[10px] uppercase tracking-wider mb-1">{t.work.hrsPerDay}</h3>
              <p className="text-lg font-bold text-gray-300">{avgHoursPerDay}</p>
            </div>
          </div>
        </div>

        {filteredShifts.length > 0 && (
          <div className="bg-[#1e1e24] p-3 md:p-6 rounded-xl border border-gray-800 mb-8 hidden sm:block shadow-sm">
            <h3 className="text-sm font-medium text-gray-400 mb-4">{t.work.chartTitle}</h3>
            <div className="w-full h-72 relative"><Bar data={monthlyChartData as any} options={monthlyChartOptions as any} /></div>
          </div>
        )}

        <div className="mb-2 flex justify-between items-end">
          <h2 className="text-lg font-medium text-white">{t.work.historyTitle}</h2>
          <span className="text-xs text-gray-400 bg-gray-800 px-2 py-1 rounded">{t.work.workDays} {filteredShifts.length}</span>
        </div>

        <div className="md:hidden mb-4">
          <button onClick={() => setShowMobileTable(!showMobileTable)} className="w-full bg-[#1e1e24] border border-gray-700 hover:bg-[#2a2a35] py-3 rounded-xl text-sm font-bold text-white transition">
            {showMobileTable ? (lang === "pl" ? "Ukryj tabelę" : lang === "en" ? "Hide Table" : lang === "ru" ? "Скрыть таблицу" : "Сховати таблицю") : 
                               (lang === "pl" ? "Pokaż tabelę (jak na PC)" : lang === "en" ? "Show Table (PC view)" : lang === "ru" ? "Показать таблицу (как на ПК)" : "Показати таблицю (як на ПК)")}
          </button>
        </div>

        <div className={`${showMobileTable ? 'block' : 'hidden'} md:block bg-[#1e1e24] rounded-xl border border-gray-800 overflow-x-auto mb-10`}>
          <table className="w-full text-left border-collapse whitespace-nowrap min-w-[800px]">
            <thead>
              <tr className="bg-[#2a2a35] text-gray-400 text-[11px] uppercase tracking-wider border-b border-gray-800">
                <th className="p-4 font-bold text-gray-300">{t.work.tableDate}</th>
                <th className="p-4 font-bold text-blue-400 bg-blue-500/5">{t.work.tableOrders} ℹ️</th>
                <th className="p-4 font-bold text-green-400 bg-green-500/5">{t.work.tableIncome} ℹ️</th>
                <th className="p-4 font-medium">{t.work.tableBonuses} ℹ️</th>
                <th className="p-4 font-medium">{t.work.tableTips} ℹ️</th>
                <th className="p-4 font-medium">{t.work.tableHours}</th>
                <th className="p-4 font-medium">{t.work.tableKm}</th>
                
                <th className="p-4 font-bold text-cyan-400 border-l-2 border-gray-700/70 bg-cyan-950/20">{t.work.tableRate}</th>
                <th className="p-4 font-bold text-purple-400 bg-purple-950/20">{t.work.tableEff}</th>
                <th className="p-4 font-bold text-yellow-400 bg-yellow-950/20">{t.work.orderUnit.toUpperCase()} ℹ️</th>
                
                <th className="p-4 font-medium text-right">{t.work.tableActions}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800 text-sm">
              {isLoading ? (
                <tr><td colSpan={11} className="p-8 text-center text-gray-500">{t.common.loading}</td></tr>
              ) : filteredShifts.length === 0 ? (
                <tr><td colSpan={11} className="p-8 text-center text-gray-500">{t.work.noRecords}</td></tr>
              ) : (
                filteredShifts.map((shift) => {
                  const dailyTotal = shift.uber + shift.wolt + shift.bolt + shift.glovo;
                  const dailyTips = (shift.tips_uber||0) + (shift.tips_wolt||0) + (shift.tips_bolt||0) + (shift.tips_glovo||0);
                  const dailyBonuses = (shift.bonuses_uber||0) + (shift.bonuses_wolt||0) + (shift.bonuses_bolt||0) + (shift.bonuses_glovo||0);
                  
                  let visualTotal = dailyTotal;
                  if (includeTips) visualTotal += dailyTips;
                  if (includeBonuses) visualTotal += dailyBonuses;
                  
                  const dailyOrders = shift.orders_uber + shift.orders_wolt + shift.orders_bolt + shift.orders_glovo;
                  
                  const dailyAvgHour = shift.hours > 0 ? (visualTotal / shift.hours).toFixed(2) : "0.00";
                  const dailyAvgKm = shift.km > 0 ? (visualTotal / shift.km).toFixed(2) : "0.00";
                  const dailyAvgOrder = dailyOrders > 0 ? (visualTotal / dailyOrders).toFixed(2) : "0.00";

                  const incomeTooltip = `Uber: ${shift.uber.toFixed(2)} \nWolt: ${shift.wolt.toFixed(2)} \nBolt: ${shift.bolt.toFixed(2)} \nGlovo: ${shift.glovo.toFixed(2)}`;
                  const ordersTooltip = `Uber: ${shift.orders_uber}\nWolt: ${shift.orders_wolt}\nBolt: ${shift.orders_bolt}\nGlovo: ${shift.orders_glovo}`;
                  const tipsTooltip = `Uber: ${(shift.tips_uber||0).toFixed(2)} \nWolt: ${(shift.tips_wolt||0).toFixed(2)} \nBolt: ${(shift.tips_bolt||0).toFixed(2)} \nGlovo: ${(shift.tips_glovo||0).toFixed(2)}`;
                  const bonusesTooltip = `Uber: ${(shift.bonuses_uber||0).toFixed(2)} \nWolt: ${(shift.bonuses_wolt||0).toFixed(2)} \nBolt: ${(shift.bonuses_bolt||0).toFixed(2)} \nGlovo: ${(shift.bonuses_glovo||0).toFixed(2)}`;
                  const orderPriceTooltip = `Uber: ${shift.orders_uber > 0 ? (shift.uber / shift.orders_uber).toFixed(2) : "0.00"} \nWolt: ${shift.orders_wolt > 0 ? (shift.wolt / shift.orders_wolt).toFixed(2) : "0.00"} \nBolt: ${shift.orders_bolt > 0 ? (shift.bolt / shift.orders_bolt).toFixed(2) : "0.00"} \nGlovo: ${shift.orders_glovo > 0 ? (shift.glovo / shift.orders_glovo).toFixed(2) : "0.00"}`;

                  return (
                    <tr key={shift.id} className="hover:bg-[#2a2a35] transition">
                      <td className="p-4 font-medium">{new Date(shift.date).toLocaleDateString("uk-UA")}</td>
                      <td className="p-4 text-blue-400 font-bold bg-blue-500/5 cursor-help" title={ordersTooltip}>{dailyOrders > 0 ? dailyOrders : "-"}</td>
                      <td className="p-4 font-bold text-green-400 bg-green-500/5 cursor-help" title={incomeTooltip}>{visualTotal.toFixed(2)}</td>
                      <td className="p-4 text-purple-400 cursor-help" title={bonusesTooltip}>{dailyBonuses > 0 ? `+${dailyBonuses.toFixed(2)}` : "-"}</td>
                      <td className="p-4 text-rose-400 cursor-help" title={tipsTooltip}>{dailyTips > 0 ? `+${dailyTips.toFixed(2)}` : "-"}</td>
                      <td className="p-4">{shift.hours}</td>
                      <td className="p-4 text-gray-400">{shift.km}</td>
                      
                      <td className="p-4 text-cyan-400 font-bold border-l-2 border-gray-700/70 bg-cyan-950/20">{dailyAvgHour}</td>
                      <td className="p-4 text-purple-400 font-bold bg-purple-950/20">{dailyAvgKm}</td>
                      <td className="p-4 text-yellow-400 font-bold bg-yellow-950/20 cursor-help" title={orderPriceTooltip}>{dailyAvgOrder}</td>
                      
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

        <div className={`${showMobileTable ? 'hidden' : 'flex'} md:hidden flex-col gap-3 pb-10`}>
          {isLoading ? (
            <div className="text-center text-gray-500 py-8 bg-[#1e1e24] rounded-xl border border-gray-800">{t.common.loading}</div>
          ) : filteredShifts.length === 0 ? (
            <div className="text-center text-gray-500 py-8 bg-[#1e1e24] rounded-xl border border-gray-800">{t.work.noRecords}</div>
          ) : (
            filteredShifts.map((shift) => {
              const dailyTotal = shift.uber + shift.wolt + shift.bolt + shift.glovo;
              const dailyTips = (shift.tips_uber||0) + (shift.tips_wolt||0) + (shift.tips_bolt||0) + (shift.tips_glovo||0);
              const dailyBonuses = (shift.bonuses_uber||0) + (shift.bonuses_wolt||0) + (shift.bonuses_bolt||0) + (shift.bonuses_glovo||0);
              
              let visualTotal = dailyTotal;
              if (includeTips) visualTotal += dailyTips;
              if (includeBonuses) visualTotal += dailyBonuses;
              
              const dailyOrders = shift.orders_uber + shift.orders_wolt + shift.orders_bolt + shift.orders_glovo;
              const dailyAvgHour = shift.hours > 0 ? (visualTotal / shift.hours).toFixed(2) : "0.00";
              const dailyAvgKm = shift.km > 0 ? (visualTotal / shift.km).toFixed(2) : "0.00";
              const dailyAvgOrder = dailyOrders > 0 ? (visualTotal / dailyOrders).toFixed(2) : "0.00";
              
              return (
                <div key={shift.id} className="bg-[#1e1e24] p-4 rounded-xl border border-gray-800 shadow-sm flex flex-col gap-3">
                  <div className="flex justify-between items-center border-b border-gray-700/50 pb-2.5">
                    <span className="font-bold text-white text-base">{new Date(shift.date).toLocaleDateString("uk-UA", { weekday: 'short', day: 'numeric', month: 'short' })}</span>
                    <span className="font-black text-green-400 text-lg">{visualTotal.toFixed(2)} <span className="text-[10px] font-normal">{t.common.currency}</span></span>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3 items-stretch">
                    <div className="flex flex-col gap-1.5 text-xs bg-[#17171d] p-2.5 rounded-lg border border-gray-800/60">
                      <span className="text-gray-500 uppercase text-[9px] tracking-wider font-semibold block mb-1">Дані зміни</span>
                      <div className="flex justify-between text-gray-300"><span>Замовлень:</span><strong className="text-blue-400">{dailyOrders}</strong></div>
                      <div className="flex justify-between text-gray-300"><span>Години:</span><strong className="text-white">{shift.hours} год</strong></div>
                      <div className="flex justify-between text-gray-300"><span>Пробіг:</span><strong className="text-purple-400">{shift.km} км</strong></div>
                      {dailyBonuses > 0 && <div className="flex justify-between text-purple-400"><span>Бонуси:</span><strong>+{dailyBonuses.toFixed(2)}</strong></div>}
                      {dailyTips > 0 && <div className="flex justify-between text-rose-400"><span>Чай:</span><strong>+{dailyTips.toFixed(2)}</strong></div>}
                    </div>

                    <div className="flex flex-col gap-1.5 text-xs bg-[#22222a]/50 p-2.5 rounded-lg border border-cyan-950/30 flex-1 justify-center">
                      <span className="text-gray-500 uppercase text-[9px] tracking-wider font-semibold block mb-1 text-center">Ефективність</span>
                      <div className="flex justify-between border-b border-gray-800/50 pb-1 text-cyan-400"><span>Зл/Год:</span><strong>{dailyAvgHour}</strong></div>
                      <div className="flex justify-between border-b border-gray-800/50 pb-1 text-purple-400"><span>Зл/Км:</span><strong>{dailyAvgKm}</strong></div>
                      <div className="flex justify-between text-yellow-400"><span>Зл/Зам:</span><strong>{dailyAvgOrder}</strong></div>
                    </div>
                  </div>
                  
                  <div className="flex justify-between gap-2 border-t border-gray-800/50 pt-2.5">
                    <button onClick={() => handleEdit(shift)} className="flex-1 bg-gray-800 hover:bg-gray-700 border border-gray-700 py-2 rounded-lg text-yellow-500 text-xs font-bold transition flex items-center justify-center gap-1">✏️ {t.common.edit}</button>
                    <button onClick={() => handleDelete(shift.id)} className="w-10 bg-red-900/10 hover:bg-red-900/30 border border-red-900/20 rounded-lg text-red-500 transition text-xs flex items-center justify-center">🗑️</button>
                  </div>
                </div>
              );
            })
          )}
        </div>

      </div>
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
            {nicknameError && <div className="bg-red-900/30 border border-red-700/50 text-red-400 p-3 rounded-xl text-xs mb-4 text-left">{nicknameError}</div>}
            <form onSubmit={handleNicknameSubmit} className="space-y-4">
              <div className="text-left">
                <input type="text" required pattern="^[a-zA-Z0-9_]{3,15}$" title="Від 3 до 15 символів" value={newNickname} onChange={(e) => setNewNickname(e.target.value.replace(/[^a-zA-Z0-9_]/g, ""))} placeholder="Courier_Hero_2026" className="w-full text-center font-bold tracking-wide text-lg bg-[#2a2a35] border border-gray-700 rounded-xl p-3.5 text-white focus:outline-none focus:border-blue-500" />
              </div>
              <button type="submit" disabled={isSavingNickname || !newNickname.trim()} className={`w-full py-4 rounded-xl font-bold text-lg text-white bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 transition shadow-lg ${(isSavingNickname || !newNickname.trim()) && "opacity-50 cursor-not-allowed"}`}>
                {isSavingNickname ? t.work.saving : (lang === "pl" ? "Zatwierdź" : lang === "en" ? "Confirm" : lang === "ru" ? "Подтвердить" : "Підтвердити 🚀")}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}