"use client";

import { useState, useEffect } from "react";
import { supabase } from "../../lib/supabase";
import Link from "next/link";
import { useRouter } from "next/navigation";

type GarageRule = {
  id: number;
  name: string;
  interval_km: number; 
  last_change_km: number;
  user_id: string;
};

type GarageHistory = {
  id: number;
  service_type: "routine" | "repair";
  name: string;
  date: string;
  odometer: number;
  cost: number;
  rule_id: number | null;
  user_id: string;
};

export default function GarageDashboard() {
  const router = useRouter();
  const [userId, setUserId] = useState<string | null>(null);

  const [rules, setRules] = useState<GarageRule[]>([]);
  const [history, setHistory] = useState<GarageHistory[]>([]);
  const [currentOdometer, setCurrentOdometer] = useState("0");
  
  const [historyFilter, setHistoryFilter] = useState("all");

  const [isLoading, setIsLoading] = useState(true);
  const [activeForm, setActiveForm] = useState<"none" | "new_rule" | "new_repair">("none");
  const [updateModalRule, setUpdateModalRule] = useState<GarageRule | null>(null);

  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [ruleName, setRuleName] = useState("");
  const [hasInterval, setHasInterval] = useState(true); 
  const [ruleInterval, setRuleInterval] = useState("");
  const [ruleLastOdo, setRuleLastOdo] = useState("");

  const [repairName, setRepairName] = useState("");
  const [repairCost, setRepairCost] = useState("");
  const [repairDate, setRepairDate] = useState(new Date().toISOString().split("T")[0]);
  const [repairOdo, setRepairOdo] = useState("");

  const [updateCost, setUpdateCost] = useState("");
  const [updateDate, setUpdateDate] = useState(new Date().toISOString().split("T")[0]);
  const [updateOdo, setUpdateOdo] = useState("");

  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push("/login");
      } else {
        setUserId(session.user.id);
        fetchData(session.user.id);
      }
    };
    checkUser();
  }, [router]);

  const fetchData = async (uid: string) => {
    setIsLoading(true);
    
    const savedOdo = localStorage.getItem("garage_current_odometer");
    if (savedOdo) {
      setCurrentOdometer(savedOdo);
      setRepairOdo(savedOdo);
      setUpdateOdo(savedOdo);
    }

    const { data: rulesData } = await supabase.from("garage_rules").select("*").eq("user_id", uid).order("id", { ascending: true });
    if (rulesData) setRules(rulesData as GarageRule[]);
      
    const { data: historyData } = await supabase.from("garage_history").select("*").eq("user_id", uid).order("odometer", { ascending: false });
    if (historyData) setHistory(historyData as GarageHistory[]);
    
    setIsLoading(false);
  };

  const handleOdometerChange = (val: string) => {
    setCurrentOdometer(val);
    localStorage.setItem("garage_current_odometer", val);
    if (activeForm === "none" && !updateModalRule) {
      setRepairOdo(val);
      setUpdateOdo(val);
    }
  };

  const handleAddRule = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId) return;
    setIsSubmitting(true);
    const newRule = {
      name: ruleName,
      interval_km: hasInterval ? parseFloat(ruleInterval) : 0,
      last_change_km: ruleLastOdo ? parseFloat(ruleLastOdo) : 0,
      user_id: userId,
    };
    const { error } = await supabase.from("garage_rules").insert([newRule]);
    if (!error) {
      setRuleName(""); setRuleInterval(""); setRuleLastOdo(""); setHasInterval(true);
      setActiveForm("none"); fetchData(userId);
    } else alert("Помилка: " + error.message);
    setIsSubmitting(false);
  };

  const handleAddRepair = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId) return;
    setIsSubmitting(true);
    const newRepair = {
      service_type: "repair",
      name: repairName,
      date: repairDate,
      odometer: parseFloat(repairOdo) || 0,
      cost: parseFloat(repairCost) || 0,
      user_id: userId,
    };
    const { error } = await supabase.from("garage_history").insert([newRepair]);
    if (!error) {
      setRepairName(""); setRepairCost("");
      setActiveForm("none"); fetchData(userId);
    } else alert("Помилка: " + error.message);
    setIsSubmitting(false);
  };

  const handleUpdateRoutine = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!updateModalRule || !userId) return;
    setIsSubmitting(true);
    
    const newOdo = parseFloat(updateOdo) || 0;

    const historyRecord = {
      service_type: "routine",
      name: updateModalRule.name,
      date: updateDate,
      odometer: newOdo,
      cost: parseFloat(updateCost) || 0,
      rule_id: updateModalRule.id,
      user_id: userId,
    };

    const { error: histError } = await supabase.from("garage_history").insert([historyRecord]);
    
    if (!histError) {
      await supabase.from("garage_rules").update({ last_change_km: newOdo }).eq("id", updateModalRule.id);
      setUpdateCost("");
      setUpdateModalRule(null);
      fetchData(userId);
    } else alert("Помилка: " + histError.message);
    
    setIsSubmitting(false);
  };

  const handleDeleteRule = async (id: number) => {
    if (!userId) return;
    if (confirm("Видалити деталь? Її історія замін залишиться у статистиці.")) {
      const { error } = await supabase.from("garage_rules").delete().eq("id", id);
      if (!error) fetchData(userId);
    }
  };

  if (!userId) {
    return <div className="min-h-screen bg-[#121212] text-white flex items-center justify-center">Перевірка доступу...</div>;
  }

  const odoNum = parseFloat(currentOdometer) || 0;

  const totalCost = history.reduce((sum, item) => sum + item.cost, 0);
  
  let monthlyAvgCost = 0;
  if (history.length > 0) {
    const dates = history.map(h => new Date(h.date).getTime());
    const minDate = new Date(Math.min(...dates));
    const maxDate = new Date(); 
    let monthsDiff = (maxDate.getFullYear() - minDate.getFullYear()) * 12 + (maxDate.getMonth() - minDate.getMonth());
    if (monthsDiff <= 0) monthsDiff = 1; 
    monthlyAvgCost = totalCost / monthsDiff;
  }

  const historyWithIntervals = history.map(record => {
    const prevRecord = history.find(h => h.name === record.name && h.odometer < record.odometer);
    const actualResource = prevRecord ? (record.odometer - prevRecord.odometer) : null;
    return { ...record, actualResource };
  });

  const uniqueNames = Array.from(new Set(history.map(h => h.name)));
  
  const filteredHistory = historyFilter === "all" 
    ? historyWithIntervals 
    : historyWithIntervals.filter(h => h.name === historyFilter);

  const filteredTotalCost = filteredHistory.reduce((sum, item) => sum + item.cost, 0);

  const getActualIntervals = (ruleId: number) => {
    const ruleHistory = history.filter(h => h.rule_id === ruleId).sort((a, b) => a.odometer - b.odometer);
    if (ruleHistory.length < 2) return null;
    const intervals = [];
    for (let i = 1; i < ruleHistory.length; i++) {
      intervals.push(ruleHistory[i].odometer - ruleHistory[i-1].odometer);
    }
    return intervals;
  };

  return (
    <div className="min-h-screen bg-[#121212] text-white p-4 md:p-8 relative">
      <div className="max-w-6xl mx-auto">
        
        <div className="flex justify-between items-center mb-6 border-b border-gray-800 pb-3">
          <div className="flex items-center gap-3">
            <Link href="/work" className="bg-gray-800 hover:bg-gray-700 text-white px-3 py-1.5 rounded-lg transition text-sm font-medium">
              ← Робота
            </Link>
            <h1 className="text-2xl font-bold">🏍️ Гараж</h1>
          </div>
        </div>

        <div className="bg-gradient-to-r from-[#1e1e24] to-[#1a1a20] p-4 rounded-xl border border-gray-800 flex flex-col md:flex-row justify-between items-start md:items-center gap-3 mb-6 shadow-md">
          <div>
            <h2 className="text-lg font-bold text-blue-400 mb-0.5">Одометр ТЗ</h2>
            <p className="text-xs text-gray-500">Оновлюй цю цифру з приборної панелі.</p>
          </div>
          <div className="flex items-center gap-2 w-full md:w-auto">
            <input 
              type="number" 
              value={currentOdometer} 
              onChange={(e) => handleOdometerChange(e.target.value)}
              className="bg-[#2a2a35] border-2 border-blue-500 rounded-lg p-2 text-white font-black text-xl w-full md:w-40 text-center focus:outline-none focus:shadow-[0_0_10px_rgba(59,130,246,0.2)] transition"
            />
            <span className="text-gray-400 font-bold text-sm">км</span>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <button 
            onClick={() => setActiveForm(activeForm === "new_rule" ? "none" : "new_rule")}
            className={`flex-1 font-bold py-2.5 rounded-lg transition border text-sm ${activeForm === "new_rule" ? "bg-gray-800 border-gray-600 text-white" : "bg-[#1e1e24] border-gray-800 hover:border-blue-500 text-blue-400"}`}
          >
            + Додати деталь
          </button>
          <button 
            onClick={() => setActiveForm(activeForm === "new_repair" ? "none" : "new_repair")}
            className={`flex-1 font-bold py-2.5 rounded-lg transition border text-sm ${activeForm === "new_repair" ? "bg-gray-800 border-gray-600 text-white" : "bg-[#1e1e24] border-gray-800 hover:border-red-500 text-red-400"}`}
          >
            🛠 Внести ремонт
          </button>
        </div>

        <div className={`transition-all duration-300 ease-in-out overflow-hidden ${activeForm === "new_rule" ? "max-h-[500px] opacity-100 mb-6" : "max-h-0 opacity-0"}`}>
          <form onSubmit={handleAddRule} className="p-4 bg-gradient-to-br from-blue-900/10 to-[#1e1e24] border border-blue-900/30 rounded-xl shadow-md">
            <div className="mb-3">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={hasInterval} onChange={(e) => setHasInterval(e.target.checked)} className="w-4 h-4 accent-blue-500 rounded bg-gray-700 border-gray-600"/>
                <span className="text-gray-300 text-sm font-medium">Має чіткий ресурс (км) до заміни</span>
              </label>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
              <div className={hasInterval ? "" : "sm:col-span-2"}>
                <label className="block text-xs text-gray-400 mb-1">Назва</label>
                <input type="text" required value={ruleName} onChange={(e) => setRuleName(e.target.value)} className="w-full bg-[#2a2a35] border border-gray-700 rounded-lg p-2.5 text-sm text-white focus:outline-none focus:border-blue-500" />
              </div>
              {hasInterval && (
                <div>
                  <label className="block text-xs text-gray-400 mb-1">Ресурс (км)</label>
                  <input type="number" required value={ruleInterval} onChange={(e) => setRuleInterval(e.target.value)} className="w-full bg-[#2a2a35] border border-gray-700 rounded-lg p-2.5 text-sm text-white focus:outline-none focus:border-blue-500" />
                </div>
              )}
              <div>
                <label className="block text-xs text-gray-400 mb-1">Пробіг останньої заміни</label>
                <input type="number" value={ruleLastOdo} onChange={(e) => setRuleLastOdo(e.target.value)} placeholder="0" className="w-full bg-[#2a2a35] border border-gray-700 rounded-lg p-2.5 text-sm text-white focus:outline-none focus:border-blue-500" />
              </div>
            </div>
            <button type="submit" disabled={isSubmitting} className="w-full bg-blue-600 hover:bg-blue-500 text-white py-2.5 rounded-lg text-sm font-bold transition">Зберегти в Гараж</button>
          </form>
        </div>

        <div className={`transition-all duration-300 ease-in-out overflow-hidden ${activeForm === "new_repair" ? "max-h-[500px] opacity-100 mb-6" : "max-h-0 opacity-0"}`}>
          <form onSubmit={handleAddRepair} className="p-4 bg-gradient-to-br from-red-900/10 to-[#1e1e24] border border-red-900/30 rounded-xl shadow-md">
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 mb-4">
              <div className="sm:col-span-2">
                <label className="block text-xs text-gray-400 mb-1">Що ремонтувалося?</label>
                <input type="text" required value={repairName} onChange={(e) => setRepairName(e.target.value)} className="w-full bg-[#2a2a35] border border-gray-700 rounded-lg p-2.5 text-sm text-white focus:outline-none focus:border-red-500" />
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-1">Дата</label>
                <input type="date" required value={repairDate} onChange={(e) => setRepairDate(e.target.value)} className="w-full bg-[#2a2a35] border border-gray-700 rounded-lg p-2.5 text-sm text-white focus:outline-none focus:border-red-500" />
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-1">Пробіг (км)</label>
                <input type="number" required value={repairOdo} onChange={(e) => setRepairOdo(e.target.value)} className="w-full bg-[#2a2a35] border border-gray-700 rounded-lg p-2.5 text-sm text-white focus:outline-none focus:border-red-500" />
              </div>
            </div>
            <div className="mb-4 w-full sm:w-1/2">
              <label className="block text-xs text-gray-400 mb-1">Вартість (зл)</label>
              <input type="number" step="0.01" required value={repairCost} onChange={(e) => setRepairCost(e.target.value)} placeholder="0.00" className="w-full bg-[#2a2a35] border border-gray-700 rounded-lg p-2.5 text-sm text-white font-bold focus:outline-none focus:border-red-500" />
            </div>
            <button type="submit" disabled={isSubmitting} className="w-full bg-red-600 hover:bg-red-500 text-white py-2.5 rounded-lg text-sm font-bold transition">Додати в статистику витрат</button>
          </form>
        </div>

        <div className="mb-10">
          <h2 className="text-lg font-bold mb-4 flex items-center gap-2">🛠 Стан деталей</h2>
          {isLoading ? (
            <p className="text-gray-500 text-sm">Завантаження...</p>
          ) : rules.length === 0 ? (
            <div className="bg-[#1e1e24] p-6 rounded-xl border border-gray-800 text-center text-sm text-gray-500">
              Гараж порожній.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {rules.map((rule) => {
                const isTrackOnly = rule.interval_km === 0;
                const kmsDrivenSinceChange = odoNum - rule.last_change_km;
                
                const kmsLeft = isTrackOnly ? 0 : rule.interval_km - kmsDrivenSinceChange;
                let percentUsed = isTrackOnly ? 100 : Math.min(Math.max((kmsDrivenSinceChange / rule.interval_km) * 100, 0), 100);
                
                let barColor = "bg-green-500";
                let textColor = "text-green-400";
                let statusText = "В нормі";

                if (isTrackOnly) {
                  barColor = "bg-blue-500/50";
                  textColor = "text-blue-400";
                  statusText = "Спостереження";
                } else {
                  if (kmsDrivenSinceChange >= rule.interval_km) {
                    barColor = "bg-red-500 animate-pulse";
                    textColor = "text-red-500";
                    statusText = "ЗАМІНА!";
                  } else if (percentUsed >= 80) {
                    barColor = "bg-yellow-500";
                    textColor = "text-yellow-500";
                    statusText = "Готуйся";
                  }
                }

                const intervals = getActualIntervals(rule.id);

                return (
                  <div key={rule.id} className={`bg-[#1e1e24] border ${isTrackOnly ? 'border-blue-900/30' : 'border-gray-800'} rounded-xl p-4 shadow-md relative flex flex-col justify-between`}>
                    <div>
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="text-base font-bold flex flex-wrap items-center gap-1.5 leading-tight">
                          <span className="truncate max-w-[140px]" title={rule.name}>{rule.name}</span>
                          <span className={`text-[10px] px-1.5 py-0.5 rounded bg-gray-800 font-normal whitespace-nowrap ${textColor}`}>
                            {statusText}
                          </span>
                        </h3>
                        <button onClick={() => handleDeleteRule(rule.id)} className="text-gray-600 hover:text-red-500 text-xs p-1 -mt-1 -mr-1">🗑️</button>
                      </div>

                      <div className="flex justify-between items-end mb-2">
                        <div className="text-xs text-gray-400 leading-tight">
                          {isTrackOnly ? "Безлімітна" : `Ресурс: ${rule.interval_km} км`}
                        </div>
                        <div className="text-right leading-tight">
                          {isTrackOnly ? (
                            <span className={`font-bold block text-base ${textColor}`}>{kmsDrivenSinceChange.toFixed(0)}</span>
                          ) : kmsLeft <= 0 ? (
                            <span className="text-red-500 font-bold block text-base">-{Math.abs(kmsLeft).toFixed(0)}</span>
                          ) : (
                            <span className={`font-bold block text-base ${textColor}`}>{kmsLeft.toFixed(0)}</span>
                          )}
                          <span className="text-[10px] text-gray-500 uppercase tracking-wide">
                            {isTrackOnly ? "Пройдено" : "Залишилось"}
                          </span>
                        </div>
                      </div>

                      <div className="w-full bg-[#2a2a35] h-2 rounded-full overflow-hidden border border-gray-800 mb-1.5">
                        <div className={`h-full transition-all duration-1000 ${barColor}`} style={{ width: `${percentUsed}%` }} />
                      </div>
                      
                      <div className="flex justify-between text-[10px] text-gray-500 mb-3">
                        <span>{isTrackOnly ? "Працює до зносу" : `Пройшло: ${kmsDrivenSinceChange.toFixed(0)}`}</span>
                        <span>Минула: {rule.last_change_km.toFixed(0)}</span>
                      </div>

                      {intervals && intervals.length > 0 && !isTrackOnly && (
                         <div className="bg-[#2a2a35] rounded p-2 text-[10px] text-gray-400 mb-3 border border-gray-700/50">
                           <span className="block text-gray-500 mb-0.5">Фактичні інтервали:</span>
                           <span className="font-medium text-gray-300">{intervals.map(i => `${i.toFixed(0)}`).join(', ')}</span>
                         </div>
                      )}
                    </div>

                    <button 
                      onClick={() => {
                        setUpdateModalRule(rule);
                        setUpdateOdo(currentOdometer);
                        setUpdateDate(new Date().toISOString().split("T")[0]);
                        setUpdateCost("");
                      }}
                      className="w-full bg-blue-600/10 hover:bg-blue-600/20 text-blue-400 border border-blue-900/50 py-2 rounded-lg text-sm font-bold transition flex items-center justify-center gap-1.5 mt-auto"
                    >
                      <span>⚙️</span> Внести заміну
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div>
          <h2 className="text-lg font-bold mb-4 flex items-center gap-2">💰 Статистика та Історія</h2>
          
          <div className="grid grid-cols-2 gap-3 mb-6">
            <div className="bg-gradient-to-br from-gray-800 to-[#1e1e24] p-4 rounded-xl border border-gray-700">
              <h3 className="text-gray-400 mb-0.5 text-[10px] uppercase tracking-wide">Всього витрачено</h3>
              <p className="text-2xl font-black text-white">{totalCost.toFixed(2)} <span className="text-sm text-gray-500">зл</span></p>
            </div>
            <div className="bg-gradient-to-br from-purple-900/20 to-[#1e1e24] p-4 rounded-xl border border-purple-900/30">
              <h3 className="text-gray-400 mb-0.5 text-[10px] uppercase tracking-wide">В середньому</h3>
              <p className="text-2xl font-black text-purple-400">{monthlyAvgCost.toFixed(2)} <span className="text-sm">зл/міс</span></p>
            </div>
          </div>

          <div className="bg-[#1e1e24] rounded-xl border border-gray-800 overflow-hidden">
            <div className="p-3 border-b border-gray-800 flex flex-col sm:flex-row justify-between items-start sm:items-center bg-[#2a2a35]/50 gap-3">
              <h2 className="text-sm font-medium">Історія обслуговування</h2>
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <select 
                  value={historyFilter}
                  onChange={(e) => setHistoryFilter(e.target.value)}
                  className="w-full sm:w-auto bg-[#1e1e24] border border-gray-600 rounded p-1.5 text-gray-300 text-xs focus:outline-none focus:border-blue-500"
                >
                  <option value="all">Усі записи</option>
                  {uniqueNames.map(name => (
                    <option key={name} value={name}>{name}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse whitespace-nowrap">
                <thead>
                  <tr className="bg-[#2a2a35] text-gray-400 text-xs">
                    <th className="p-3 font-medium">Дата</th>
                    <th className="p-3 font-medium">Тип</th>
                    <th className="p-3 font-medium">Що робилось</th>
                    <th className="p-3 font-medium">Пробіг</th>
                    <th className="p-3 font-medium">Пройшло (км)</th>
                    <th className="p-3 font-medium">Вартість</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-800 text-sm">
                  {filteredHistory.length === 0 ? (
                    <tr><td colSpan={6} className="p-6 text-center text-gray-500 text-xs">Записів немає.</td></tr>
                  ) : (
                    filteredHistory.map((record) => (
                      <tr key={record.id} className="hover:bg-[#2a2a35] transition">
                        <td className="p-3 text-gray-400 text-xs">{new Date(record.date).toLocaleDateString("uk-UA")}</td>
                        <td className="p-3">
                          {record.service_type === "routine" 
                            ? <span className="text-[10px] bg-blue-900/50 text-blue-300 px-1.5 py-0.5 rounded">ТО</span>
                            : <span className="text-[10px] bg-red-900/50 text-red-300 px-1.5 py-0.5 rounded">Ремонт</span>
                          }
                        </td>
                        <td className="p-3 font-medium text-white text-xs">{record.name}</td>
                        <td className="p-3 text-gray-400 text-xs">{record.odometer.toFixed(0)}</td>
                        <td className="p-3 text-blue-400 text-xs">
                          {record.actualResource ? `+ ${record.actualResource.toFixed(0)}` : "—"}
                        </td>
                        <td className="p-3 font-bold text-white text-xs">{record.cost.toFixed(2)} зл</td>
                      </tr>
                    ))
                  )}
                </tbody>
                {filteredHistory.length > 0 && (
                  <tfoot className="bg-[#2a2a35]/80 text-white font-bold text-xs border-t border-gray-700">
                    <tr>
                      <td colSpan={5} className="p-3 text-right uppercase tracking-wider text-gray-400">
                        Підсумок за вибраним:
                      </td>
                      <td className="p-3 text-blue-400 text-sm">
                        {filteredTotalCost.toFixed(2)} зл
                      </td>
                    </tr>
                  </tfoot>
                )}
              </table>
            </div>
          </div>
        </div>

      </div>

      {updateModalRule && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-[#1e1e24] rounded-2xl border border-blue-900/50 w-full max-w-sm p-5 shadow-2xl animate-fadeIn">
            <h2 className="text-xl font-bold text-white mb-1">Заміна: {updateModalRule.name}</h2>
            <p className="text-gray-400 text-xs mb-5">Внеси дані про поточну заміну.</p>
            
            <form onSubmit={handleUpdateRoutine}>
              <div className="space-y-3 mb-5">
                <div>
                  <label className="block text-xs text-gray-400 mb-1">Дата заміни</label>
                  <input type="date" required value={updateDate} onChange={(e) => setUpdateDate(e.target.value)} className="w-full bg-[#2a2a35] border border-gray-700 rounded-lg p-2.5 text-sm text-white focus:outline-none focus:border-blue-500" />
                </div>
                <div>
                  <label className="block text-xs text-gray-400 mb-1">Пробіг (км)</label>
                  <input type="number" required value={updateOdo} onChange={(e) => setUpdateOdo(e.target.value)} className="w-full bg-[#2a2a35] border border-gray-700 rounded-lg p-2.5 text-sm text-white focus:outline-none focus:border-blue-500" />
                </div>
                <div>
                  <label className="block text-xs text-gray-400 mb-1">Вартість (зл)</label>
                  <input type="number" step="0.01" required value={updateCost} onChange={(e) => setUpdateCost(e.target.value)} placeholder="0.00" className="w-full bg-[#2a2a35] border border-gray-700 rounded-lg p-2.5 text-sm text-white font-bold focus:outline-none focus:border-blue-500" />
                </div>
              </div>
              
              <div className="flex gap-2">
                <button type="submit" disabled={isSubmitting} className="flex-1 bg-blue-600 hover:bg-blue-500 text-white py-2.5 rounded-lg text-sm font-bold transition">Зберегти</button>
                <button type="button" onClick={() => setUpdateModalRule(null)} className="px-4 py-2.5 bg-gray-800 hover:bg-gray-700 rounded-lg text-sm font-bold transition">Скасувати</button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
