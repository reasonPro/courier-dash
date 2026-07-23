"use client";

import { useState, useEffect } from "react";
import { supabase } from "../../lib/supabase";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useLanguage } from "../../context/LanguageContext";
import { calculateWorkedHours } from "../../lib/work-hours";
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
  id: number; date: string; km: number; hours: number;
  uber: number; wolt: number; bolt: number; glovo: number;
  orders_uber: number; orders_wolt: number; orders_bolt: number; orders_glovo: number;
  tips_uber: number; tips_wolt: number; tips_bolt: number; tips_glovo: number;
  bonuses_uber: number; bonuses_wolt: number; bonuses_bolt: number; bonuses_glovo: number;
  user_id: string;
};

type TaxSettings = {
  uber_type: string; uber_val: number | string;
  wolt_type: string; wolt_val: number | string;
  bolt_type: string; bolt_val: number | string;
  glovo_type: string; glovo_val: number | string;
};

export default function WorkDashboard() {
  const router = useRouter();
  const { lang, setLanguage, t } = useLanguage();
  const [userId, setUserId] = useState<string | null>(null);
  
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [km, setKm] = useState("");
  const [hours, setHours] = useState("");
  
  const [showCalc, setShowCalc] = useState(false);
  const [showCalcInfo, setShowCalcInfo] = useState(false);
  const [shiftStart, setShiftStart] = useState("");
  const [shiftEnd, setShiftEnd] = useState("");
  const [breaks, setBreaks] = useState<{start: string, end: string}[]>([]);

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
  const [includeTips, setIncludeTips] = useState(true);
  const [includeBonuses, setIncludeBonuses] = useState(true);
  const [showMobileTable, setShowMobileTable] = useState(false);

  const [shifts, setShifts] = useState<Shift[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7));

  const [userNickname, setUserNickname] = useState<string | null>(null);
  const [showNicknameModal, setShowNicknameModal] = useState(false);
  const [newNickname, setNewNickname] = useState("");
  const [nicknameError, setNicknameError] = useState<string | null>(null);
  const [isSavingNickname, setIsSavingNickname] = useState(false);

  const [taxSettings, setTaxSettings] = useState<TaxSettings | null>(null);
  const [isNetto, setIsNetto] = useState(false);
  const [showTaxModal, setShowTaxModal] = useState(false);
  const [isSavingTaxes, setIsSavingTaxes] = useState(false);
  const [taxForm, setTaxForm] = useState<TaxSettings>({
    uber_type: 'none', uber_val: "", wolt_type: 'none', wolt_val: "",
    bolt_type: 'none', bolt_val: "", glovo_type: 'none', glovo_val: ""
  });

  const [toast, setToast] = useState<{message: string, type: 'error'|'warning'|'success'} | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<number | null>(null);

  // === НАЛАШТУВАННЯ ВВОДУ ДАНИХ (ПРОБІГ, ГОДИНИ) ===
  const [showFieldSettings, setShowFieldSettings] = useState(false);
  const [fieldSettings, setFieldSettings] = useState({ km: true, hours: true, orders: true });

  const fDict = {
    pl: { formTitle: "Szczegóły zmiany", title: "Ustawienia pól", desc: "Uwaga: jeśli wyłączysz te pola, odpowiednie statystyki (np. zł/km, zł/godz) nie będą obliczane, a formularz nie będzie ich wymagał.", trackKm: "Wymagaj przebiegu (km)", trackHrs: "Wymagaj godzin", trackOrd: "Wymagaj zamówień", close: "Gotowe" },
    en: { formTitle: "Shift Details", title: "Field Settings", desc: "Note: disabling these fields will hide the corresponding statistics (e.g., pln/km, pln/hr) and remove them from the required form fields.", trackKm: "Require mileage (km)", trackHrs: "Require hours", trackOrd: "Require orders", close: "Done" },
    ru: { formTitle: "Детали смены", title: "Настройки полей", desc: "Внимание: при отключении этих полей соответствующая статистика (зл/км, зл/час) рассчитываться не будет, а форма перестанет их требовать.", trackKm: "Требовать пробег (км)", trackHrs: "Требовать часы", trackOrd: "Требовать заказы", close: "Готово" },
    uk: { formTitle: "Деталі зміни", title: "Налаштування полів", desc: "Увага: при вимкненні цих полів відповідна статистика (зл/км, зл/год) не буде розраховуватися, а форма перестане вимагати їх обов'язкове заповнення.", trackKm: "Вимагати пробіг (км)", trackHrs: "Вимагати години", trackOrd: "Вимагати замовлення", close: "Зберегти налаштування" }
  };
  const fText = fDict[lang as keyof typeof fDict] || fDict.uk;

  // СЛОВНИК ДЛЯ КНОПКИ TELEGRAM
  const tgDict = {
    pl: "Aktualności",
    en: "News",
    ru: "Новости",
    uk: "Новини"
  };
  const tgLabel = tgDict[lang as keyof typeof tgDict] || tgDict.uk;

  useEffect(() => {
    const savedFields = localStorage.getItem("courier_field_settings");
    if (savedFields) {
      try { setFieldSettings(JSON.parse(savedFields)); } catch (e) {}
    }
  }, []);

  const updateFieldSetting = (key: keyof typeof fieldSettings, val: boolean) => {
    const newVal = { ...fieldSettings, [key]: val };
    setFieldSettings(newVal);
    localStorage.setItem("courier_field_settings", JSON.stringify(newVal));
    if (!val) {
      if (key === 'km') setKm("");
      if (key === 'hours') { setHours(""); setShowCalc(false); }
      if (key === 'orders') setOrders({ uber: "", wolt: "", bolt: "", glovo: "" });
    }
  };
  // ===============================================

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  const showToast = (message: string, type: 'error'|'warning'|'success') => {
    setToast({ message, type });
  };

  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push("/");
      } else {
        setUserId(session.user.id);
        fetchShifts(session.user.id);
        checkNickname(session.user);
        fetchTaxSettings(session.user.id);
      }
    };
    checkUser();
  }, [router]);

  const checkNickname = async (sessionUser: any) => {
    const { data, error } = await supabase.from("profiles").select("nickname").eq("id", sessionUser.id).single();
    if (error || !data || !data.nickname) {
      const metaNickname = sessionUser.user_metadata?.nickname;
      if (metaNickname) {
        await supabase.from("profiles").upsert({ id: sessionUser.id, nickname: metaNickname });
        setUserNickname(metaNickname);
      } else { setShowNicknameModal(true); }
    } else { setUserNickname(data.nickname); }
  };

  const fetchTaxSettings = async (uid: string) => {
    let { data, error } = await supabase.from("tax_settings").select("*").eq("user_id", uid).single();
    if (error || !data) {
      const { data: newData } = await supabase.from("tax_settings").insert([{ user_id: uid }]).select().single();
      if (newData) data = newData;
    }
    if (data) {
      setTaxSettings(data as TaxSettings);
      setTaxForm({
        uber_type: data.uber_type || 'none', uber_val: data.uber_val || "",
        wolt_type: data.wolt_type || 'none', wolt_val: data.wolt_val || "",
        bolt_type: data.bolt_type || 'none', bolt_val: data.bolt_val || "",
        glovo_type: data.glovo_type || 'none', glovo_val: data.glovo_val || ""
      });
    }
  };

  const saveTaxSettings = async () => {
    if (!userId) return;
    setIsSavingTaxes(true);
    
    const cleanData = {
      uber_type: taxForm.uber_type, uber_val: parseFloat(String(taxForm.uber_val).replace(',', '.')) || 0,
      wolt_type: taxForm.wolt_type, wolt_val: parseFloat(String(taxForm.wolt_val).replace(',', '.')) || 0,
      bolt_type: taxForm.bolt_type, bolt_val: parseFloat(String(taxForm.bolt_val).replace(',', '.')) || 0,
      glovo_type: taxForm.glovo_type, glovo_val: parseFloat(String(taxForm.glovo_val).replace(',', '.')) || 0,
    };

    const { error } = await supabase.from("tax_settings").update(cleanData).eq("user_id", userId);
    if (!error) {
      setTaxSettings(cleanData);
      setTaxForm({
        uber_type: cleanData.uber_type, uber_val: cleanData.uber_val || "",
        wolt_type: cleanData.wolt_type, wolt_val: cleanData.wolt_val || "",
        bolt_type: cleanData.bolt_type, bolt_val: cleanData.bolt_val || "",
        glovo_type: cleanData.glovo_type, glovo_val: cleanData.glovo_val || ""
      });
      showToast(lang === "pl" ? "Zapisano pomyślnie!" : lang === "en" ? "Saved successfully!" : lang === "ru" ? "Успешно сохранено!" : "Успішно збережено!", "success");
    } else {
      showToast(t.work.errorPrefix + error.message, "error");
    }
    setIsSavingTaxes(false);
    setShowTaxModal(false);
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
      setIsSavingNickname(false); return;
    }
    const { error } = await supabase.from("profiles").upsert({ id: userId, nickname: cleanNickname });
    if (error) setNicknameError(error.message);
    else { setUserNickname(cleanNickname); setShowNicknameModal(false); }
    setIsSavingNickname(false);
  };

  const fetchShifts = async (uid: string) => {
    setIsLoading(true);
    const { data, error } = await supabase.from("work_shifts").select("*").eq("user_id", uid).order("date", { ascending: false });
    if (!error && data) setShifts(data as Shift[]);
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
    handleEarningChange(platform, ""); handleOrderChange(platform, ""); handleTipChange(platform, ""); handleBonusChange(platform, "");
  };

  const calculateHours = () => {
    if (!shiftStart || !shiftEnd) return;
    setHours(calculateWorkedHours(shiftStart, shiftEnd, breaks).toFixed(2));
    setShowCalc(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId) return;
    setIsSubmitting(true);

    const shiftData = {
      date: date, km: parseFloat(km) || 0, hours: parseFloat(hours) || 0,
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
      if (error) showToast(t.work.updateError + error.message, "error");
      else { 
        resetForm(); fetchShifts(userId);
        showToast(lang === "pl" ? "Zaktualizowano!" : lang === "en" ? "Updated!" : lang === "ru" ? "Обновлено!" : "Оновлено!", "success");
      }
    } else {
      const { error } = await supabase.from("work_shifts").insert([shiftData]);
      if (error) {
        if (error.message.includes("duplicate key") || error.code === '23505') {
          showToast(t.work.duplicateError, "error");
        } else {
          showToast(t.work.errorPrefix + error.message, "error");
        }
      } else { 
        resetForm(); fetchShifts(userId);
        showToast(lang === "pl" ? "Zapisano zmianę!" : lang === "en" ? "Shift saved!" : lang === "ru" ? "Смена сохранена!" : "Зміну збережено!", "success");
      }
    }
    setIsSubmitting(false);
  };

  const handleEdit = (shift: Shift) => {
    setEditingId(shift.id); setDate(shift.date); setKm(shift.km.toString()); setHours(shift.hours.toString());
    setEarnings({ uber: shift.uber > 0 ? shift.uber.toString() : "", wolt: shift.wolt > 0 ? shift.wolt.toString() : "", bolt: shift.bolt > 0 ? shift.bolt.toString() : "", glovo: shift.glovo > 0 ? shift.glovo.toString() : "" });
    setOrders({ uber: shift.orders_uber > 0 ? shift.orders_uber.toString() : "", wolt: shift.orders_wolt > 0 ? shift.orders_wolt.toString() : "", bolt: shift.orders_bolt > 0 ? shift.orders_bolt.toString() : "", glovo: shift.orders_glovo > 0 ? shift.orders_glovo.toString() : "" });
    setTips({ uber: shift.tips_uber > 0 ? shift.tips_uber.toString() : "", wolt: shift.tips_wolt > 0 ? shift.tips_wolt.toString() : "", bolt: shift.tips_bolt > 0 ? shift.tips_bolt.toString() : "", glovo: shift.tips_glovo > 0 ? shift.tips_glovo.toString() : "" });
    setBonuses({ uber: shift.bonuses_uber > 0 ? shift.bonuses_uber.toString() : "", wolt: shift.bonuses_wolt > 0 ? shift.bonuses_wolt.toString() : "", bolt: shift.bonuses_bolt > 0 ? shift.bonuses_bolt.toString() : "", glovo: shift.bonuses_glovo > 0 ? shift.bonuses_glovo.toString() : "" });

    const hasExtras = ((shift.tips_uber||0) + (shift.tips_wolt||0) + (shift.tips_bolt||0) + (shift.tips_glovo||0) + (shift.bonuses_uber||0) + (shift.bonuses_wolt||0) + (shift.bonuses_bolt||0) + (shift.bonuses_glovo||0)) > 0;
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

  const confirmDelete = (id: number) => {
    setDeleteConfirmId(id);
  };

  const executeDelete = async () => {
    if (!deleteConfirmId) return;
    const { error } = await supabase.from("work_shifts").delete().eq("id", deleteConfirmId);
    if (error) {
      showToast(t.work.errorPrefix + error.message, "error");
    } else {
      if (userId) fetchShifts(userId);
      showToast(lang === "pl" ? "Usunięto pomyślnie!" : lang === "en" ? "Deleted successfully!" : lang === "ru" ? "Успешно удалено!" : "Успішно видалено!", "success");
    }
    setDeleteConfirmId(null);
  };

  const resetForm = () => {
    setEditingId(null); setDate(new Date().toISOString().split("T")[0]); setKm(""); setHours("");
    setShiftStart(""); setShiftEnd(""); setBreaks([]); setShowCalc(false); setShowCalcInfo(false);
    setEarnings({ uber: "", wolt: "", bolt: "", glovo: "" });
    setOrders({ uber: "", wolt: "", bolt: "", glovo: "" });
    setTips({ uber: "", wolt: "", bolt: "", glovo: "" });
    setBonuses({ uber: "", wolt: "", bolt: "", glovo: "" });
    setShowExtras(false); setActivePlatforms(["uber", "wolt"]); setIsFormOpen(false);
  };

  const hasTaxesConfigured = () => {
    if (!taxSettings) return false;
    return (["uber", "wolt", "bolt", "glovo"] as const).some(p => {
       const type = taxSettings[`${p}_type` as keyof TaxSettings];
       const val = Number(taxSettings[`${p}_val` as keyof TaxSettings]) || 0;
       return type !== 'none' && val > 0;
    });
  };

  const handleNettoToggle = () => {
    if (hasTaxesConfigured()) {
      setIsNetto(true);
    } else {
      const msg = lang === "pl" ? "Skonfiguruj podatki, aby zobaczyć NETTO!" : lang === "en" ? "Set up taxes to see NET income!" : lang === "ru" ? "Настройте налоги, чтобы увидеть НЕТТО!" : "Налаштуйте податки та комісії, щоб побачити розрахунок НЕТТО!";
      showToast(msg, 'warning');
      setShowTaxModal(true);
    }
  };

  if (!userId) return <div className="min-h-screen bg-[#121212] text-white flex items-center justify-center">{t.common.loading}</div>;

  const availableToAdd = ["uber", "wolt", "bolt", "glovo"].filter(p => !activePlatforms.includes(p));
  const filteredShifts = shifts.filter(shift => shift.date.startsWith(selectedMonth));

  const getISOWeek = (dateStr: string) => {
    const d = new Date(dateStr); d.setHours(0, 0, 0, 0); d.setDate(d.getDate() + 3 - (d.getDay() || 7));
    const week1 = new Date(d.getFullYear(), 0, 4);
    return 1 + Math.round(((d.getTime() - week1.getTime()) / 86400000 - 3 + (week1.getDay() || 7)) / 7);
  };

  const platStats = {
    uber: { gross: 0, days: 0, weeks: new Set<number>() },
    wolt: { gross: 0, days: 0, weeks: new Set<number>() },
    bolt: { gross: 0, days: 0, weeks: new Set<number>() },
    glovo: { gross: 0, days: 0, weeks: new Set<number>() }
  };

  let totalFleetGross = 0;

  filteredShifts.forEach(s => {
    const w = getISOWeek(s.date);
    (["uber", "wolt", "bolt", "glovo"] as const).forEach(p => {
      let pGross = s[p];
      if (includeTips) pGross += (s[`tips_${p}` as keyof Shift] as number || 0);
      if (includeBonuses) pGross += (s[`bonuses_${p}` as keyof Shift] as number || 0);
      if (pGross > 0 || (s[`orders_${p}` as keyof Shift] as number) > 0) {
        platStats[p].gross += pGross;
        platStats[p].days += 1;
        platStats[p].weeks.add(w);
        if (p !== "glovo") totalFleetGross += pGross;
      }
    });
  });

  const platPercents = { uber: 0, wolt: 0, bolt: 0, glovo: 0 };
  let totalFixedTax = 0; 
  
  if (taxSettings) {
    (["uber", "wolt", "bolt", "glovo"] as const).forEach(p => {
      const type = taxSettings[`${p}_type` as keyof TaxSettings];
      const val = Number(taxSettings[`${p}_val` as keyof TaxSettings]) || 0;
      
      if (type === 'percent') {
        platPercents[p] = val / 100;
      } else if (platStats[p].days > 0) {
        if (type === 'fixed_week') {
          const weeksCount = Math.min(4, platStats[p].weeks.size);
          totalFixedTax += val * weeksCount;
        } else if (type === 'fixed_month') {
          totalFixedTax += val;
        }
      }
    });
  }

  const fleetFixedRatio = totalFleetGross > 0 ? (totalFixedTax / totalFleetGross) : 0;

  const getPlatNetto = (gross: number, p: "uber"|"wolt"|"bolt"|"glovo") => {
    if (gross <= 0) return 0;
    let net = gross - (gross * platPercents[p]);
    if (p !== "glovo") {
      net -= (gross * fleetFixedRatio); 
    }
    return net;
  };
  
  let totalVisualEarned = 0, totalHours = 0, totalKm = 0, totalOrders = 0;
  let absTotalTips = 0, absTotalBaseAndBonuses = 0; 
  let maxEarned = 0, bestShiftDate = ""; 

  filteredShifts.forEach(shift => {
    let shiftVisualTotal = 0;
    let dailyBase = shift.uber + shift.wolt + shift.bolt + shift.glovo;
    const dailyTips = (shift.tips_uber || 0) + (shift.tips_wolt || 0) + (shift.tips_bolt || 0) + (shift.tips_glovo || 0);
    const dailyBonuses = (shift.bonuses_uber || 0) + (shift.bonuses_wolt || 0) + (shift.bonuses_bolt || 0) + (shift.bonuses_glovo || 0);
    
    (["uber", "wolt", "bolt", "glovo"] as const).forEach(p => {
      let pGross = shift[p];
      if (includeTips) pGross += (shift[`tips_${p}` as keyof Shift] as number || 0);
      if (includeBonuses) pGross += (shift[`bonuses_${p}` as keyof Shift] as number || 0);
      shiftVisualTotal += (isNetto && pGross > 0) ? getPlatNetto(pGross, p) : pGross;
    });

    absTotalTips += dailyTips;
    absTotalBaseAndBonuses += (dailyBase + dailyBonuses);

    const dailyOrders = shift.orders_uber + shift.orders_wolt + shift.orders_bolt + shift.orders_glovo;

    totalVisualEarned += shiftVisualTotal;
    totalHours += shift.hours;
    totalKm += shift.km;
    totalOrders += dailyOrders;

    if (shiftVisualTotal > maxEarned) { maxEarned = shiftVisualTotal; bestShiftDate = shift.date; }
  });

  const totalDays = filteredShifts.length;
  // Елегантні прочерки, якщо даних немає (замість кривих 0.00)
  const avgPerHour = totalHours > 0 ? (totalVisualEarned / totalHours).toFixed(2) : "—";
  const avgPerKm = totalKm > 0 ? (totalVisualEarned / totalKm).toFixed(2) : "—";
  const avgPerOrder = totalOrders > 0 ? (totalVisualEarned / totalOrders).toFixed(2) : "—";
  
  const avgKmPerDay = totalDays > 0 ? (totalKm / totalDays).toFixed(1) : "—";
  const avgHoursPerDay = totalDays > 0 ? (totalHours / totalDays).toFixed(1) : "—";
  const avgOrdersPerDay = totalDays > 0 ? (totalOrders / totalDays).toFixed(1) : "—";
  const avgEarnedPerDay = totalDays > 0 ? (totalVisualEarned / totalDays).toFixed(2) : "0.00";

  const absoluteTotalIncome = absTotalBaseAndBonuses + absTotalTips;
  const tipsPercent = absoluteTotalIncome > 0 ? ((absTotalTips / absoluteTotalIncome) * 100).toFixed(1) : "0.0";

  const chronologicalShifts = [...filteredShifts].reverse();

  const getChartVal = (shift: Shift, p: "uber"|"wolt"|"bolt"|"glovo", type: "base"|"tips"|"bonuses") => {
    let pGross = shift[p];
    let pTips = shift[`tips_${p}` as keyof Shift] as number || 0;
    let pBon = shift[`bonuses_${p}` as keyof Shift] as number || 0;
    let totalGross = pGross + (includeTips ? pTips : 0) + (includeBonuses ? pBon : 0);
    
    let rawVal = type === "base" ? pGross : (type === "tips" ? pTips : pBon);
    if (!isNetto || totalGross <= 0) return rawVal;
    
    const netto = getPlatNetto(totalGross, p);
    const ratio = netto / totalGross;
    return rawVal * ratio;
  };

  const chartDatasets: any[] = [
    { type: 'bar', label: 'Uber', data: chronologicalShifts.map(s => getChartVal(s, "uber", "base")), backgroundColor: "rgba(75, 85, 99, 0.4)", borderColor: "rgba(75, 85, 99, 1)", borderWidth: 1, stack: 'Stack 0', order: 2 },
    { type: 'bar', label: 'Wolt', data: chronologicalShifts.map(s => getChartVal(s, "wolt", "base")), backgroundColor: "rgba(0, 194, 232, 0.4)", borderColor: "rgba(0, 194, 232, 1)", borderWidth: 1, stack: 'Stack 0', order: 2 },
    { type: 'bar', label: 'Bolt', data: chronologicalShifts.map(s => getChartVal(s, "bolt", "base")), backgroundColor: "rgba(34, 197, 94, 0.4)", borderColor: "rgba(34, 197, 94, 1)", borderWidth: 1, stack: 'Stack 0', order: 2 },
    { type: 'bar', label: 'Glovo', data: chronologicalShifts.map(s => getChartVal(s, "glovo", "base")), backgroundColor: "rgba(234, 179, 8, 0.4)", borderColor: "rgba(234, 179, 8, 1)", borderWidth: 1, stack: 'Stack 0', order: 2 }
  ];

  if (includeTips) {
    chartDatasets.push({ type: 'bar', label: t.work.tipsLabel, data: chronologicalShifts.map(s => getChartVal(s,"uber","tips") + getChartVal(s,"wolt","tips") + getChartVal(s,"bolt","tips") + getChartVal(s,"glovo","tips")), backgroundColor: "rgba(244, 63, 94, 0.4)", borderColor: "rgba(244, 63, 94, 1)", borderWidth: 1, stack: 'Stack 0', order: 2 });
  }
  if (includeBonuses) {
    chartDatasets.push({ type: 'bar', label: t.work.bonusesLabel, data: chronologicalShifts.map(s => getChartVal(s,"uber","bonuses") + getChartVal(s,"wolt","bonuses") + getChartVal(s,"bolt","bonuses") + getChartVal(s,"glovo","bonuses")), backgroundColor: "rgba(168, 85, 247, 0.4)", borderColor: "rgba(168, 85, 247, 1)", borderWidth: 1, stack: 'Stack 0', order: 2 });
  }

  chartDatasets.push(
    {
      type: 'line', label: t.work.tableRate,
      data: chronologicalShifts.map(s => {
        let sVisual = 0;
        (["uber", "wolt", "bolt", "glovo"] as const).forEach(p => {
          let pGross = s[p] + (includeTips ? (s[`tips_${p}` as keyof Shift] as number||0) : 0) + (includeBonuses ? (s[`bonuses_${p}` as keyof Shift] as number||0) : 0);
          sVisual += (isNetto && pGross > 0) ? getPlatNetto(pGross, p) : pGross;
        });
        return s.hours > 0 ? Number((sVisual / s.hours).toFixed(2)) : 0;
      }),
      borderColor: "#00e5ff", backgroundColor: "#00e5ff", borderWidth: 4, pointRadius: 4, tension: 0.3, yAxisID: 'y1', order: 1
    },
    { type: 'line', label: t.work.tableKm, data: chronologicalShifts.map(s => s.km), borderColor: "#a855f7", backgroundColor: "#a855f7", borderWidth: 3, pointRadius: 3, tension: 0.3, yAxisID: 'y1', order: 1 },
    { type: 'line', label: t.work.tableHours, data: chronologicalShifts.map(s => s.hours), borderColor: "#f43f5e", backgroundColor: "#f43f5e", borderWidth: 3, pointRadius: 3, tension: 0.3, yAxisID: 'y1', order: 1 }
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
    <div className="min-h-screen bg-[#121212] text-white p-4 md:p-10 relative">
      
      <div className={`fixed top-6 left-1/2 -translate-x-1/2 z-[100] transition-all duration-500 ease-out ${toast ? 'translate-y-0 opacity-100' : '-translate-y-10 opacity-0 pointer-events-none'}`}>
        {toast && (
          <div className={`flex items-center gap-3 px-5 py-3.5 rounded-xl shadow-2xl border backdrop-blur-md font-medium text-sm text-white
            ${toast.type === 'error' ? 'bg-red-900/80 border-red-500/50' : 
              toast.type === 'warning' ? 'bg-yellow-900/80 border-yellow-500/50 text-yellow-100' : 
              'bg-green-900/80 border-green-500/50'}
          `}>
            <span className="text-xl">{toast.type === 'error' ? '⚠️' : toast.type === 'warning' ? '🔒' : '✅'}</span>
            <span>{toast.message}</span>
          </div>
        )}
      </div>

      <div className="max-w-6xl mx-auto">
        
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 pb-4">
          
          {/* TITLE & MOBILE LANG SWITCHER */}
          <div className="flex justify-between items-center w-full sm:w-auto">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold">{editingId ? t.work.editTitle : t.work.title}</h1>
              {userNickname && <p className="text-xs text-gray-500 mt-1">@ {userNickname}</p>}
            </div>
            
            {/* Мобільний перемикач мов (справа від заголовка) */}
            <div className="sm:hidden relative">
              <select
                value={lang}
                onChange={(e) => setLanguage(e.target.value as "pl" | "uk" | "en" | "ru")}
                className="bg-[#1e1e24] border border-gray-700 text-white text-[11px] font-bold pl-2 pr-5 py-2 rounded-lg appearance-none uppercase h-[34px] w-[60px] outline-none focus:border-sky-500 transition-colors cursor-pointer text-center shadow-sm"
              >
                <option value="pl">PL</option>
                <option value="uk">UK</option>
                <option value="en">EN</option>
                <option value="ru">RU</option>
              </select>
              <span className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none text-[10px]">▼</span>
            </div>
          </div>
          
          {/* ACTION BUTTONS & DESKTOP LANG SWITCHER */}
          <div className="grid grid-cols-3 sm:flex sm:flex-row items-center gap-2.5 w-full sm:w-auto mt-1 sm:mt-0">
            
            {/* ПК перемикач мов */}
            <div className="hidden sm:block relative">
              <select
                value={lang}
                onChange={(e) => setLanguage(e.target.value as "pl" | "uk" | "en" | "ru")}
                className="bg-[#1e1e24] border border-gray-700 text-white text-xs font-bold pl-3 pr-6 py-2 rounded-lg appearance-none uppercase h-[36px] w-[68px] outline-none focus:border-sky-500 transition-colors cursor-pointer text-center shadow-sm"
              >
                <option value="pl">PL</option>
                <option value="uk">UK</option>
                <option value="en">EN</option>
                <option value="ru">RU</option>
              </select>
              <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none text-[10px]">▼</span>
            </div>

            {/* Кнопка Telegram */}
            <a 
              href="https://t.me/courier_dash" // ⚠️ ЗАМІНИ НА РЕАЛЬНЕ ПОСИЛАННЯ СВОГО КАНАЛУ
              target="_blank" 
              rel="noopener noreferrer"
              className="bg-sky-950/30 border border-sky-500/30 text-sky-400 text-[11px] sm:text-xs font-bold px-1.5 sm:px-3 py-2 rounded-lg flex items-center justify-center gap-1 sm:gap-1.5 h-[36px] w-full transition hover:bg-sky-950/50 hover:border-sky-400 shadow-sm"
            >
              <svg className="w-3 h-3 sm:w-3.5 sm:h-3.5 fill-current shrink-0" viewBox="0 0 24 24">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69.01-.03.01-.14-.07-.2-.08-.06-.19-.04-.27-.02-.12.02-1.96 1.24-5.54 3.65-.52.36-.97.53-1.35.52-.42-.01-1.23-.24-1.83-.43-.74-.24-1.33-.37-1.28-.77.03-.21.32-.43.88-.65 3.44-1.5 5.74-2.49 6.88-2.97 3.28-1.36 3.96-1.59 4.41-1.6.1.01.32.03.46.15.12.1.15.24.17.34-.02.08-.01.2-.02.26z"/>
              </svg>
              <span className="truncate">{tgLabel}</span>
            </a>

            {/* Кнопка Гараж */}
            <Link 
              href="/garage" 
              className="bg-gray-800 border border-gray-700 text-white text-[11px] sm:text-xs font-medium px-1.5 sm:px-3 py-2 rounded-lg flex items-center justify-center gap-1 sm:gap-1.5 h-[36px] w-full transition hover:bg-gray-700 shadow-sm truncate"
            >
              {t.work.garageBtn}
            </Link>

            {/* Кнопка Вихід */}
            <button 
              onClick={handleLogout} 
              className="bg-red-900/20 border border-red-900/30 text-red-400 text-[11px] sm:text-xs font-medium px-1.5 sm:px-3 py-2 rounded-lg flex items-center justify-center h-[36px] w-full transition hover:bg-red-900/40 shadow-sm truncate"
            >
              {t.common.logout}
            </button>
            
          </div>
        </div>

        {/* Кнопка додавання зміни (ДЛЯ ПК) */}
        {!isFormOpen && (
          <button onClick={() => setIsFormOpen(true)} className="hidden md:block w-full mb-8 bg-gradient-to-r from-green-600 to-green-500 hover:from-green-500 hover:to-green-400 text-white font-bold px-6 py-4 rounded-xl transition shadow-lg text-lg">
            {t.work.addShiftBtn}
          </button>
        )}

        {/* ПЛАВАЮЧА АНІМОВАНА КНОПКА (ДЛЯ ТЕЛЕФОНІВ) */}
        {!isFormOpen && (
          <div className="md:hidden fixed bottom-6 right-6 z-[90] flex items-center justify-center">
            {/* Анімація "хвильки" */}
            <div className="absolute w-full h-full bg-green-500 rounded-full animate-ping opacity-60"></div>
            {/* Сама кнопка */}
            <button 
              onClick={() => { setIsFormOpen(true); window.scrollTo({ top: 0, behavior: 'smooth' }); }} 
              className="relative bg-gradient-to-br from-green-400 to-green-600 text-white rounded-full w-14 h-14 flex items-center justify-center shadow-[0_4px_20px_rgba(34,197,94,0.5)] border border-green-400/50 transition active:scale-95"
            >
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4"></path>
              </svg>
            </button>
          </div>
        )}

        <div className={`transition-all duration-500 ease-in-out overflow-hidden ${isFormOpen ? "max-h-[2500px] opacity-100 mb-8" : "max-h-0 opacity-0"}`}>
          <form onSubmit={handleSubmit} className={`p-5 md:p-6 rounded-xl border shadow-lg transition-all ${editingId ? 'bg-[#25251a] border-yellow-700/50' : 'bg-[#1e1e24] border-gray-800'}`}>
            
            {/* ШАПКА ФОРМИ З КНОПКОЮ НАЛАШТУВАНЬ */}
            <div className="flex justify-between items-center mb-5 border-b border-gray-700/50 pb-3">
               <h3 className="text-gray-300 font-bold flex items-center gap-2">📝 {fText.formTitle}</h3>
               <button type="button" onClick={() => setShowFieldSettings(true)} className="text-xs bg-gray-800 hover:bg-gray-700 text-gray-400 hover:text-white px-3 py-1.5 rounded-lg transition border border-gray-700 flex items-center gap-1.5 font-medium shadow-sm">
                 ⚙️ {fText.title}
               </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 mb-4">
              <div>
                <label className="block text-sm text-gray-400 mb-1.5">{t.work.date}</label>
                <input type="date" required value={date} onChange={(e) => setDate(e.target.value)} disabled={editingId !== null} className="w-full p-3.5 bg-[#2a2a35] border border-gray-700 rounded-xl text-white focus:outline-none focus:border-green-500 disabled:opacity-50 text-base appearance-none" />
              </div>
              <div className={!fieldSettings.km ? "opacity-50" : ""}>
                <label className="block text-sm text-gray-400 mb-1.5">{t.work.mileage}</label>
                <input type="number" step="0.1" required={fieldSettings.km} disabled={!fieldSettings.km} value={fieldSettings.km ? km : ""} onChange={(e) => setKm(e.target.value)} className="w-full p-3.5 bg-[#2a2a35] border border-gray-700 rounded-xl text-white focus:outline-none focus:border-green-500 disabled:cursor-not-allowed text-base font-medium appearance-none" />
              </div>
              <div className={!fieldSettings.hours ? "opacity-50" : ""}>
                <label className="block text-sm text-gray-400 mb-1.5">{t.work.hours}</label>
                <input type="number" step="0.1" required={fieldSettings.hours} disabled={!fieldSettings.hours} value={fieldSettings.hours ? hours : ""} onChange={(e) => setHours(e.target.value)} className="w-full p-3.5 bg-[#2a2a35] border border-gray-700 rounded-xl text-white focus:outline-none focus:border-green-500 disabled:cursor-not-allowed text-base font-medium appearance-none" />
                
                {fieldSettings.hours && (
                  <div className="mt-2 flex items-center justify-between px-1">
                    <button type="button" onClick={() => setShowCalc(!showCalc)} className="text-[11px] font-bold text-blue-400 hover:text-blue-300 transition flex items-center gap-1.5 bg-blue-500/10 px-2 py-1 rounded-md border border-blue-500/20">
                      🧮 {t.work.calcHoursBtn}
                    </button>
                    <button type="button" onClick={() => setShowCalcInfo(!showCalcInfo)} className="text-gray-400 hover:text-white transition text-xs w-6 h-6 flex items-center justify-center bg-gray-800 rounded-full border border-gray-700">❓</button>
                  </div>
                )}
              </div>
            </div>

            {showCalcInfo && fieldSettings.hours && (
              <div className="mb-4 p-3 bg-[#1e2330] border border-blue-900/50 rounded-xl text-xs text-blue-200 leading-relaxed shadow-inner animate-fade-in">
                {t.work.calcTooltip}
              </div>
            )}

            {showCalc && fieldSettings.hours && (
              <div className="col-span-1 md:col-span-3 bg-[#17171d] p-4 md:p-5 rounded-xl border border-blue-900/50 mb-6 shadow-inner animate-fade-in">
                <div className="grid grid-cols-2 gap-3 mb-4">
                  <div>
                    <label className="block text-[10px] text-gray-400 uppercase tracking-wider mb-1.5">{t.work.shiftStart}</label>
                    <input type="time" value={shiftStart} onChange={(e) => setShiftStart(e.target.value)} className="w-full p-3 bg-[#2a2a35] border border-gray-700 rounded-lg text-white font-bold focus:border-blue-500 focus:outline-none appearance-none" />
                  </div>
                  <div>
                    <label className="block text-[10px] text-gray-400 uppercase tracking-wider mb-1.5">{t.work.shiftEnd}</label>
                    <input type="time" value={shiftEnd} onChange={(e) => setShiftEnd(e.target.value)} className="w-full p-3 bg-[#2a2a35] border border-gray-700 rounded-lg text-white font-bold focus:border-blue-500 focus:outline-none appearance-none" />
                  </div>
                </div>

                {breaks.length > 0 && (
                  <div className="mb-4">
                    <span className="text-[10px] text-gray-500 uppercase tracking-wider font-bold mb-2 block">Перерви</span>
                    <div className="space-y-3">
                      {breaks.map((brk, idx) => (
                        <div key={idx} className="relative bg-[#22222a] p-3 rounded-lg border border-gray-800 flex flex-col gap-2">
                          <button type="button" onClick={() => setBreaks(breaks.filter((_, i) => i !== idx))} className="absolute top-2 right-2 bg-red-900/20 text-red-500 w-6 h-6 rounded-md flex items-center justify-center border border-red-900/30 hover:bg-red-900/40 transition">✕</button>
                          <span className="text-[10px] font-bold text-gray-500">Перерва {idx + 1}</span>
                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <label className="block text-[9px] text-gray-500 uppercase tracking-wider mb-1">{t.work.breakStart}</label>
                              <input type="time" value={brk.start} onChange={(e) => { const newBreaks = [...breaks]; newBreaks[idx].start = e.target.value; setBreaks(newBreaks); }} className="w-full p-2.5 bg-[#1e1e24] border border-gray-700 rounded-lg text-white text-sm focus:border-yellow-500 focus:outline-none appearance-none" />
                            </div>
                            <div>
                              <label className="block text-[9px] text-gray-500 uppercase tracking-wider mb-1">{t.work.breakEnd}</label>
                              <input type="time" value={brk.end} onChange={(e) => { const newBreaks = [...breaks]; newBreaks[idx].end = e.target.value; setBreaks(newBreaks); }} className="w-full p-2.5 bg-[#1e1e24] border border-gray-700 rounded-lg text-white text-sm focus:border-yellow-500 focus:outline-none appearance-none" />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex flex-col sm:flex-row gap-3 border-t border-gray-800 pt-4 mt-2">
                  <button type="button" onClick={() => setBreaks([...breaks, { start: "", end: "" }])} className="sm:w-1/3 w-full py-3.5 rounded-xl text-sm font-bold text-yellow-500 hover:text-yellow-400 transition bg-yellow-500/10 border border-yellow-500/20 hover:bg-yellow-500/20 flex items-center justify-center">
                    {t.work.addBreakBtn}
                  </button>
                  <button type="button" onClick={calculateHours} disabled={!shiftStart || !shiftEnd} className="flex-1 w-full py-3.5 rounded-xl text-sm font-bold text-white bg-blue-600 hover:bg-blue-500 disabled:bg-gray-800 disabled:text-gray-500 transition shadow-md flex items-center justify-center">
                    {t.work.calcActionBtn}
                  </button>
                </div>
              </div>
            )}

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
                        <input type="number" step="0.01" value={earnings[platform as keyof typeof earnings]} onChange={(e) => handleEarningChange(platform, e.target.value)} placeholder="0.00" className="w-full bg-[#1e1e24] border border-gray-700 rounded-lg p-2.5 text-white text-sm md:text-base font-bold focus:outline-none focus:border-green-500 transition appearance-none" />
                      </div>
                      <div className={!fieldSettings.orders ? "opacity-50" : ""}>
                        <span className="block text-[10px] text-gray-400 uppercase tracking-wider mb-1">{t.work.ordersLabel}</span>
                        <input type="number" step="1" required={fieldSettings.orders} disabled={!fieldSettings.orders} value={fieldSettings.orders ? orders[platform as keyof typeof orders] : ""} onChange={(e) => handleOrderChange(platform, e.target.value)} placeholder="0" className="w-full bg-[#1e1e24] border border-gray-700 rounded-lg p-2.5 text-white text-sm md:text-base font-bold focus:outline-none focus:border-blue-500 disabled:cursor-not-allowed transition appearance-none" />
                      </div>
                      {showExtras && (
                        <>
                          <div>
                            <span className="block text-[10px] text-gray-400 uppercase tracking-wider mb-1">{t.work.tipsLabel}</span>
                            <input type="number" step="0.01" value={tips[platform as keyof typeof tips]} onChange={(e) => handleTipChange(platform, e.target.value)} placeholder="0.00" className="w-full bg-[#1e1e24] border border-gray-700 rounded-lg p-2.5 text-rose-400 text-sm md:text-base font-bold focus:outline-none focus:border-rose-500 transition appearance-none" />
                          </div>
                          <div>
                            <span className="block text-[10px] text-gray-400 uppercase tracking-wider mb-1">{t.work.bonusesLabel}</span>
                            <input type="number" step="0.01" value={bonuses[platform as keyof typeof bonuses]} onChange={(e) => handleBonusChange(platform, e.target.value)} placeholder="0.00" className="w-full bg-[#1e1e24] border border-gray-700 rounded-lg p-2.5 text-purple-400 text-sm md:text-base font-bold focus:outline-none focus:border-purple-500 transition appearance-none" />
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

        <div className="mb-6 bg-[#1e1e24] border border-gray-800 rounded-xl p-4 md:p-5 shadow-sm">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4 pb-4 border-b border-gray-700/50">
            <h2 className="text-xl md:text-2xl font-bold text-white">{t.work.statsTitle}</h2>
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <Link href="/work/year" className="flex-1 sm:flex-none text-center bg-gray-800 hover:bg-gray-700 border border-gray-700 text-white px-4 py-2.5 rounded-lg font-medium transition text-sm">
                {t.work.yearReportBtn}
              </Link>
              <input type="month" value={selectedMonth} onChange={(e) => setSelectedMonth(e.target.value)} className="flex-1 sm:flex-none bg-[#2a2a35] border border-gray-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-green-500 font-medium text-center appearance-none" />
            </div>
          </div>

          <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 w-full xl:w-auto bg-[#17171d] p-3 rounded-lg border border-gray-800">
              <span className="text-[11px] text-gray-500 font-medium uppercase tracking-wider">
                {lang === "pl" ? "Uwzględnij w dochodach:" : lang === "en" ? "Include in income:" : lang === "ru" ? "Учитывать в доходах:" : "Враховувати у доходах:"}
              </span>
              <div className="flex gap-2">
                <button onClick={() => setIncludeTips(!includeTips)} className={`px-4 py-1.5 rounded-md text-xs font-bold transition border shadow-sm ${includeTips ? 'bg-rose-500/20 text-rose-400 border-rose-500/50' : 'bg-[#1e1e24] text-gray-500 border-gray-800 hover:text-gray-300'}`}>
                  {includeTips ? "✓ " : "+ "}{t.work.toggleTips}
                </button>
                <button onClick={() => setIncludeBonuses(!includeBonuses)} className={`px-4 py-1.5 rounded-md text-xs font-bold transition border shadow-sm ${includeBonuses ? 'bg-purple-500/20 text-purple-400 border-purple-500/50' : 'bg-[#1e1e24] text-gray-500 border-gray-800 hover:text-gray-300'}`}>
                  {includeBonuses ? "✓ " : "+ "}{t.work.toggleBonuses}
                </button>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full xl:w-auto">
              <button onClick={() => setShowTaxModal(true)} className="flex items-center justify-center gap-1.5 bg-blue-900/20 hover:bg-blue-900/40 border border-blue-900/30 text-blue-400 text-sm font-bold px-4 py-2 rounded-lg transition h-[40px]">
                ⚙️ {t.work.taxesBtn}
              </button>
              
              <div className="flex bg-[#17171d] p-1 rounded-lg border border-gray-800 font-bold text-[11px] uppercase tracking-wider w-full sm:w-auto h-[40px]">
                <button onClick={() => setIsNetto(false)} className={`flex-1 sm:flex-none px-5 rounded-md transition ${!isNetto ? 'bg-gradient-to-r from-green-600 to-green-500 text-white shadow-sm' : 'text-gray-500 hover:text-gray-300'}`}>
                  {t.work.brutto}
                </button>
                <button onClick={handleNettoToggle} className={`flex-1 sm:flex-none px-5 rounded-md transition flex items-center justify-center gap-1.5 ${isNetto ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-sm' : 'text-gray-500 hover:text-gray-300'}`}>
                  {!hasTaxesConfigured() && <span className="text-[10px]">🔒</span>}
                  {t.work.netto}
                </button>
              </div>
            </div>
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
          <span className="text-xs font-semibold text-gray-500 tracking-wider uppercase mb-2 block">{t.work.totalMonthTitle} {isNetto && <span className="text-blue-400">({t.work.netto})</span>}</span>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
            <div className="col-span-2 sm:col-span-1 bg-gradient-to-br from-[#1e1e24] to-[#252530] p-4 rounded-xl border border-gray-800 text-center shadow-md relative overflow-hidden">
              {isNetto && <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-purple-500"></div>}
              <h3 className="text-gray-400 text-[10px] md:text-xs uppercase tracking-wider mb-1">{t.work.totalIncome}</h3>
              <p className={`text-xl sm:text-2xl font-black ${isNetto ? 'text-blue-400' : 'text-green-400'}`}>{totalVisualEarned.toFixed(2)} <span className="text-[10px] sm:text-sm font-normal">{t.common.currency}</span></p>
            </div>
            <div className="bg-[#1e1e24] p-4 rounded-xl border border-gray-800 text-center flex flex-col justify-center">
              <h3 className="text-gray-400 text-[10px] md:text-xs uppercase tracking-wider mb-1">{t.work.totalOrders}</h3>
              <p className="text-xl sm:text-2xl font-bold text-blue-400">{totalOrders > 0 ? totalOrders : "—"} <span className="text-[10px] font-normal text-gray-500">{totalOrders > 0 && t.work.tableOrders}</span></p>
            </div>
            <div className="bg-[#1e1e24] p-4 rounded-xl border border-gray-800 text-center flex flex-col justify-center">
              <h3 className="text-gray-400 text-[10px] md:text-xs uppercase tracking-wider mb-1">{t.work.totalHours}</h3>
              <p className="text-xl sm:text-2xl font-bold text-white">{totalHours > 0 ? totalHours.toFixed(1) : "—"} <span className="text-[10px] font-normal text-gray-500">{totalHours > 0 && t.common.hrs}</span></p>
            </div>
            <div className="bg-[#1e1e24] p-4 rounded-xl border border-gray-800 text-center flex flex-col justify-center">
              <h3 className="text-gray-400 text-[10px] md:text-xs uppercase tracking-wider mb-1">{t.work.totalKm}</h3>
              <p className="text-xl sm:text-2xl font-bold text-purple-400">{totalKm > 0 ? totalKm.toFixed(1) : "—"} <span className="text-[10px] font-normal text-gray-500">{totalKm > 0 && t.common.km}</span></p>
            </div>
            <div className="bg-[#1e1e24] p-4 rounded-xl border border-gray-800 text-center flex flex-col justify-center">
              <h3 className="text-gray-400 text-[10px] md:text-xs uppercase tracking-wider mb-1">{t.work.tipsPercent}</h3>
              <p className="text-xl sm:text-2xl font-bold text-rose-400">{tipsPercent} <span className="text-[10px] font-normal text-gray-500">%</span></p>
            </div>
          </div>
        </div>

        <div className="mb-8">
          <span className="text-xs font-semibold text-gray-500 tracking-wider uppercase mb-2 block">{t.work.avgStatsTitle} {isNetto && <span className="text-blue-400">({t.work.netto})</span>}</span>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2">
            <div className={`bg-[#1e1e24] p-3 rounded-xl border border-gray-800 text-center border-b-2 shadow-sm ${isNetto ? 'border-blue-500/50' : 'border-green-500/50'}`}>
              <h3 className="text-gray-400 text-[10px] uppercase tracking-wider mb-1">{t.work.incomePerDay}</h3>
              <p className={`text-lg font-bold ${isNetto ? 'text-blue-400' : 'text-green-400'}`}>{avgEarnedPerDay} <span className="text-[10px] font-normal">{t.common.currency}</span></p>
            </div>
            <div className="bg-[#1e1e24] p-3 rounded-xl border border-gray-800 text-center flex flex-col justify-center">
              <h3 className="text-gray-400 text-[10px] uppercase tracking-wider mb-1">{t.work.ratePerHour}</h3>
              <p className="text-lg font-bold text-white">{avgPerHour} <span className="text-[10px] font-normal text-gray-500">{avgPerHour !== "—" && t.common.currency}</span></p>
            </div>
            <div className="bg-[#1e1e24] p-3 rounded-xl border border-gray-800 text-center flex flex-col justify-center">
              <h3 className="text-gray-400 text-[10px] uppercase tracking-wider mb-1">{t.work.ratePerOrder}</h3>
              <p className="text-lg font-bold text-blue-400">{avgPerOrder} <span className="text-[10px] font-normal text-gray-500">{avgPerOrder !== "—" && t.common.currency}</span></p>
            </div>
            <div className="bg-[#1e1e24] p-3 rounded-xl border border-gray-800 text-center flex flex-col justify-center">
              <h3 className="text-gray-400 text-[10px] uppercase tracking-wider mb-1">{t.work.effPerKm}</h3>
              <p className="text-lg font-bold text-purple-400">{avgPerKm} <span className="text-[10px] font-normal text-gray-500">{avgPerKm !== "—" && t.common.currency}</span></p>
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
          <div className="bg-[#1e1e24] p-3 md:p-6 rounded-xl border border-gray-800 mb-8 shadow-sm">
            <h3 className="text-sm font-medium text-gray-400 mb-4">{t.work.chartTitle} {isNetto && <span className="text-blue-400">({t.work.netto})</span>}</h3>
            <div className="w-full overflow-x-auto pb-2">
              <div className="h-64 md:h-72 min-w-[700px] relative">
                <Bar data={monthlyChartData as any} options={monthlyChartOptions as any} />
              </div>
            </div>
          </div>
        )}

        <div className="mb-2 flex justify-between items-end">
          <h2 className="text-lg font-medium text-white">
            {t.work.historyTitle}{" "}
            <span className="text-xs text-gray-500 block sm:inline mt-1 sm:mt-0">
              ({lang === "pl" ? "Zawsze pokazuje" : lang === "en" ? "Always shows" : lang === "ru" ? "Всегда показывает" : "Завжди показує"} {t.work.brutto})
            </span>
          </h2>
          <span className="text-xs text-gray-400 bg-gray-800 px-2 py-1 rounded">{t.work.workDays} {filteredShifts.length}</span>
        </div>

        <div className="md:hidden mb-4">
          <button onClick={() => setShowMobileTable(!showMobileTable)} className="w-full bg-[#1e1e24] border border-gray-700 hover:bg-[#2a2a35] py-3 rounded-xl text-sm font-bold text-white transition">
            {showMobileTable ? (lang === "pl" ? "Ukryj tabelę" : lang === "en" ? "Hide Table" : lang === "ru" ? "Скрыть таблицу" : "Сховати таблицю") : 
                               (lang === "pl" ? "Pokaż tabelę (jak na PC)" : lang === "en" ? "Show Table (PC view)" : lang === "ru" ? "Показать таблицу (как на ПК)" : "Показати таблицю (як на ПК)")}
          </button>
        </div>

        {/* --- ПК ТАБЛИЦЯ (БЕЗ ЗМІН) --- */}
        <div className={`${showMobileTable ? 'block' : 'hidden'} md:block bg-[#1e1e24] rounded-xl border border-gray-800 overflow-x-auto mb-10`}>
          <table className="w-full text-left border-collapse whitespace-nowrap min-w-[800px]">
            <thead>
              <tr className="bg-[#2a2a35] text-gray-400 text-[11px] uppercase tracking-wider border-b border-gray-800">
                <th className="p-4 font-bold text-gray-300">{t.work.tableDate}</th>
                <th className="p-4 font-bold text-blue-400 bg-blue-500/5">{t.work.tableOrders} ℹ️</th>
                <th className="p-4 font-bold text-green-400 bg-green-500/5">{t.work.tableIncome}</th>
                <th className="p-4 font-medium text-gray-400">{t.work.tableBase} ℹ️</th>
                <th className="p-4 font-medium text-purple-400">{t.work.tableBonuses} ℹ️</th>
                <th className="p-4 font-medium text-rose-400">{t.work.tableTips} ℹ️</th>
                <th className="p-4 font-medium">{t.work.tableHours}</th>
                <th className="p-4 font-medium">{t.work.tableKm}</th>
                <th className="p-4 font-bold text-cyan-400 border-l-2 border-gray-700/70 bg-cyan-950/20">{t.work.tableRate}</th>
                <th className="p-4 font-bold text-purple-400 bg-purple-950/20">{t.work.tableEff}</th>
                <th className="p-4 font-bold text-yellow-400 bg-yellow-950/20">{t.work.orderUnit.toUpperCase()}</th>
                <th className="p-4 font-medium text-right">{t.work.tableActions}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800 text-sm">
              {isLoading ? (
                <tr><td colSpan={12} className="p-8 text-center text-gray-500">{t.common.loading}</td></tr>
              ) : filteredShifts.length === 0 ? (
                <tr><td colSpan={12} className="p-8 text-center text-gray-500">{t.work.noRecords}</td></tr>
              ) : (
                filteredShifts.map((shift) => {
                  const dailyBase = shift.uber + shift.wolt + shift.bolt + shift.glovo;
                  const dailyTips = (shift.tips_uber||0) + (shift.tips_wolt||0) + (shift.tips_bolt||0) + (shift.tips_glovo||0);
                  const dailyBonuses = (shift.bonuses_uber||0) + (shift.bonuses_wolt||0) + (shift.bonuses_bolt||0) + (shift.bonuses_glovo||0);
                  const absoluteTotal = dailyBase + dailyTips + dailyBonuses; // ЗАВЖДИ ПОВНА СУМА
                  const dailyOrders = shift.orders_uber + shift.orders_wolt + shift.orders_bolt + shift.orders_glovo;
                  
                  const dailyAvgHour = shift.hours > 0 ? (absoluteTotal / shift.hours).toFixed(2) : "—";
                  const dailyAvgKm = shift.km > 0 ? (absoluteTotal / shift.km).toFixed(2) : "—";
                  const dailyAvgOrder = dailyOrders > 0 ? (absoluteTotal / dailyOrders).toFixed(2) : "—";

                  const baseTooltip = `Uber: ${shift.uber.toFixed(2)}\nWolt: ${shift.wolt.toFixed(2)}\nBolt: ${shift.bolt.toFixed(2)}\nGlovo: ${shift.glovo.toFixed(2)}`;
                  const ordersTooltip = `Uber: ${shift.orders_uber}\nWolt: ${shift.orders_wolt}\nBolt: ${shift.orders_bolt}\nGlovo: ${shift.orders_glovo}`;
                  const tipsTooltip = `Uber: ${(shift.tips_uber||0).toFixed(2)}\nWolt: ${(shift.tips_wolt||0).toFixed(2)}\nBolt: ${(shift.tips_bolt||0).toFixed(2)}\nGlovo: ${(shift.tips_glovo||0).toFixed(2)}`;
                  const bonusesTooltip = `Uber: ${(shift.bonuses_uber||0).toFixed(2)}\nWolt: ${(shift.bonuses_wolt||0).toFixed(2)}\nBolt: ${(shift.bonuses_bolt||0).toFixed(2)}\nGlovo: ${(shift.bonuses_glovo||0).toFixed(2)}`;

                  return (
                    <tr key={shift.id} className="hover:bg-[#2a2a35] transition">
                      <td className="p-4 font-medium">{new Date(shift.date).toLocaleDateString("uk-UA")}</td>
                      <td className="p-4 text-blue-400 font-bold bg-blue-500/5 cursor-help" title={ordersTooltip}>{dailyOrders > 0 ? dailyOrders : "-"}</td>
                      <td className="p-4 font-bold text-green-400 bg-green-500/5">{absoluteTotal.toFixed(2)}</td>
                      <td className="p-4 text-gray-400 cursor-help" title={baseTooltip}>{dailyBase.toFixed(2)}</td>
                      <td className="p-4 text-purple-400 cursor-help" title={bonusesTooltip}>{dailyBonuses > 0 ? dailyBonuses.toFixed(2) : "-"}</td>
                      <td className="p-4 text-rose-400 cursor-help" title={tipsTooltip}>{dailyTips > 0 ? dailyTips.toFixed(2) : "-"}</td>
                      <td className="p-4">{shift.hours > 0 ? shift.hours : "—"}</td>
                      <td className="p-4 text-gray-400">{shift.km > 0 ? shift.km : "—"}</td>
                      <td className="p-4 text-cyan-400 font-bold border-l-2 border-gray-700/70 bg-cyan-950/20">{dailyAvgHour}</td>
                      <td className="p-4 text-purple-400 font-bold bg-purple-950/20">{dailyAvgKm}</td>
                      <td className="p-4 text-yellow-400 font-bold bg-yellow-950/20">{dailyAvgOrder}</td>
                      <td className="p-4 text-right">
                        <button onClick={() => handleEdit(shift)} className="text-gray-400 hover:text-yellow-500 p-2 transition">✏️</button>
                        <button onClick={() => confirmDelete(shift.id)} className="text-gray-400 hover:text-red-500 p-2 transition">🗑️</button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* --- ВИПРАВЛЕНА МОБІЛЬНА ТАБЛИЦЯ --- */}
        <div className={`${showMobileTable ? 'hidden' : 'flex'} md:hidden flex-col gap-3 pb-10`}>
          {isLoading ? (
            <div className="text-center text-gray-500 py-8 bg-[#1e1e24] rounded-xl border border-gray-800">{t.common.loading}</div>
          ) : filteredShifts.length === 0 ? (
            <div className="text-center text-gray-500 py-8 bg-[#1e1e24] rounded-xl border border-gray-800">{t.work.noRecords}</div>
          ) : (
            filteredShifts.map((shift) => {
              const dailyBase = shift.uber + shift.wolt + shift.bolt + shift.glovo;
              const dailyTips = (shift.tips_uber||0) + (shift.tips_wolt||0) + (shift.tips_bolt||0) + (shift.tips_glovo||0);
              const dailyBonuses = (shift.bonuses_uber||0) + (shift.bonuses_wolt||0) + (shift.bonuses_bolt||0) + (shift.bonuses_glovo||0);
              const absoluteTotal = dailyBase + dailyTips + dailyBonuses; // ЗАВЖДИ ПОВНА СУМА
              const dailyOrders = shift.orders_uber + shift.orders_wolt + shift.orders_bolt + shift.orders_glovo;
              
              const dailyAvgHour = shift.hours > 0 ? (absoluteTotal / shift.hours).toFixed(2) : "—";
              const dailyAvgKm = shift.km > 0 ? (absoluteTotal / shift.km).toFixed(2) : "—";
              const dailyAvgOrder = dailyOrders > 0 ? (absoluteTotal / dailyOrders).toFixed(2) : "—";
              
              // Динамічна локаль для правильного формату дати
              const dateLocale = lang === "pl" ? "pl-PL" : lang === "en" ? "en-US" : lang === "ru" ? "ru-RU" : "uk-UA";
              
              return (
                <div key={shift.id} className="bg-[#1e1e24] p-4 rounded-xl border border-gray-800 shadow-sm flex flex-col gap-3">
                  <div className="flex justify-between items-center border-b border-gray-700/50 pb-2.5">
                    <span className="font-bold text-white text-base capitalize">
                      {new Date(shift.date).toLocaleDateString(dateLocale, { weekday: 'short', day: 'numeric', month: 'short' })}
                    </span>
                    <span className="font-black text-green-400 text-lg">{absoluteTotal.toFixed(2)} <span className="text-[10px] font-normal">{t.common.currency}</span></span>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3 items-stretch">
                    <div className="flex flex-col gap-1 text-xs bg-[#17171d] p-2.5 rounded-lg border border-gray-800/60">
                      <span className="text-gray-500 uppercase text-[9px] tracking-wider font-semibold block mb-1">
                        {lang === "pl" ? "Dane zmiany" : lang === "en" ? "Shift Data" : lang === "ru" ? "Данные смены" : "Дані зміни"}
                      </span>
                      <div className="flex justify-between text-gray-400"><span>{t.work.tableBase}:</span><strong>{dailyBase.toFixed(2)}</strong></div>
                      {dailyTips > 0 && <div className="flex justify-between text-rose-400"><span>{t.work.tableTips}:</span><strong>{dailyTips.toFixed(2)}</strong></div>}
                      {dailyBonuses > 0 && <div className="flex justify-between text-purple-400"><span>{t.work.tableBonuses}:</span><strong>{dailyBonuses.toFixed(2)}</strong></div>}
                      <div className="flex justify-between text-blue-400 border-t border-gray-800 mt-1 pt-1"><span>{t.work.tableOrders}:</span><strong>{dailyOrders > 0 ? dailyOrders : "—"}</strong></div>
                      <div className="flex justify-between text-white"><span>{t.work.tableHours}:</span><strong>{shift.hours > 0 ? shift.hours : "—"}</strong></div>
                      <div className="flex justify-between text-gray-300"><span>{t.work.tableKm}:</span><strong>{shift.km > 0 ? shift.km : "—"}</strong></div>
                    </div>

                    <div className="flex flex-col gap-1.5 text-xs bg-[#22222a]/50 p-2.5 rounded-lg border border-cyan-950/30 flex-1 justify-center">
                      <span className="text-gray-500 uppercase text-[9px] tracking-wider font-semibold block mb-1 text-center">
                        {lang === "pl" ? "Efektywność" : lang === "en" ? "Efficiency" : lang === "ru" ? "Эффективность" : "Ефективність"}
                      </span>
                      <div className="flex justify-between border-b border-gray-800/50 pb-1 text-cyan-400"><span>{t.work.tableRate}:</span><strong>{dailyAvgHour}</strong></div>
                      <div className="flex justify-between border-b border-gray-800/50 pb-1 text-purple-400"><span>{t.work.tableEff}:</span><strong>{dailyAvgKm}</strong></div>
                      <div className="flex justify-between text-yellow-400"><span>{t.work.orderUnit}:</span><strong>{dailyAvgOrder}</strong></div>
                    </div>
                  </div>
                  
                  <div className="flex justify-between gap-2 border-t border-gray-800/50 pt-2.5">
                    <button onClick={() => handleEdit(shift)} className="flex-1 bg-gray-800 hover:bg-gray-700 border border-gray-700 py-2 rounded-lg text-yellow-500 text-xs font-bold transition flex items-center justify-center gap-1">✏️ {t.common.edit}</button>
                    <button onClick={() => confirmDelete(shift.id)} className="w-10 bg-red-900/10 hover:bg-red-900/30 border border-red-900/20 rounded-lg text-red-500 transition text-xs flex items-center justify-center">🗑️</button>
                  </div>
                </div>
              );
            })
          )}
        </div>

      </div>

      {/* КАСТОМНЕ ВІКНО ПІДТВЕРДЖЕННЯ ВИДАЛЕННЯ */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-[#1e1e24] border border-gray-800 rounded-2xl w-full max-w-sm p-6 shadow-2xl text-center">
            <div className="text-red-500 text-4xl mb-4">🗑️</div>
            <h3 className="text-xl font-bold text-white mb-2">{lang === "pl" ? "Usunąć zmianę?" : lang === "en" ? "Delete shift?" : lang === "ru" ? "Удалить смену?" : "Видалити зміну?"}</h3>
            <p className="text-gray-400 text-sm mb-6">{t.work.confirmDelete}</p>
            <div className="flex gap-3">
               <button onClick={() => setDeleteConfirmId(null)} className="flex-1 py-3 rounded-xl font-bold bg-gray-800 hover:bg-gray-700 text-white transition">{t.common.cancel}</button>
               <button onClick={executeDelete} className="flex-1 py-3 rounded-xl font-bold bg-red-600 hover:bg-red-500 text-white transition">{t.common.delete}</button>
            </div>
          </div>
        </div>
      )}

      {/* МОДАЛЬНЕ ВІКНО: НАЛАШТУВАННЯ ПОЛІВ */}
      {showFieldSettings && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-[#1e1e24] border border-gray-800 rounded-2xl w-full max-w-sm p-6 shadow-2xl relative">
            <button type="button" onClick={() => setShowFieldSettings(false)} className="absolute top-4 right-4 text-gray-500 hover:text-white transition text-lg">✕</button>
            <h3 className="text-xl font-bold text-white mb-3">⚙️ {fText.title}</h3>
            <p className="text-xs leading-relaxed bg-blue-900/20 p-3 rounded-lg border border-blue-900/30 text-blue-200 mb-6">
              ℹ️ {fText.desc}
            </p>
            <div className="space-y-4 mb-8">
              <label className="flex items-center justify-between cursor-pointer group">
                <span className="text-sm font-medium text-gray-300 group-hover:text-white transition">{fText.trackKm}</span>
                <input type="checkbox" checked={fieldSettings.km} onChange={(e) => updateFieldSetting('km', e.target.checked)} className="w-5 h-5 accent-blue-500 cursor-pointer" />
              </label>
              <label className="flex items-center justify-between cursor-pointer group">
                <span className="text-sm font-medium text-gray-300 group-hover:text-white transition">{fText.trackHrs}</span>
                <input type="checkbox" checked={fieldSettings.hours} onChange={(e) => updateFieldSetting('hours', e.target.checked)} className="w-5 h-5 accent-blue-500 cursor-pointer" />
              </label>
              <label className="flex items-center justify-between cursor-pointer group">
                <span className="text-sm font-medium text-gray-300 group-hover:text-white transition">{fText.trackOrd}</span>
                <input type="checkbox" checked={fieldSettings.orders} onChange={(e) => updateFieldSetting('orders', e.target.checked)} className="w-5 h-5 accent-blue-500 cursor-pointer" />
              </label>
            </div>
            <button type="button" onClick={() => setShowFieldSettings(false)} className="w-full py-3.5 bg-gray-800 hover:bg-gray-700 border border-gray-700 rounded-xl text-white font-bold transition shadow-sm">
              {fText.close}
            </button>
          </div>
        </div>
      )}

      {/* МОДАЛЬНЕ ВІКНО: ПОДАТКИ */}
      {showTaxModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-xl overflow-y-auto">
          <div className="bg-[#1e1e24] border border-gray-800 rounded-2xl w-full max-w-2xl p-6 md:p-8 relative shadow-2xl my-8">
            <button onClick={() => setShowTaxModal(false)} className="absolute top-4 right-4 text-gray-500 hover:text-white transition text-xl">✕</button>
            <h2 className="text-2xl font-black text-white mb-2">{t.work.taxModalTitle}</h2>
            <p className="text-gray-400 text-sm mb-6 leading-relaxed">{t.work.taxModalDesc}</p>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
              {(["uber", "wolt", "bolt", "glovo"] as const).map(p => (
                <div key={p} className="bg-[#2a2a35] p-4 rounded-xl border border-gray-700">
                  <span className="font-bold text-lg text-white capitalize block mb-3 border-b border-gray-600 pb-2">{p}</span>
                  <div className="space-y-3">
                    <select 
                      value={taxForm[`${p}_type` as keyof TaxSettings]} 
                      onChange={(e) => setTaxForm({...taxForm, [`${p}_type`]: e.target.value})}
                      className="w-full bg-[#1e1e24] border border-gray-600 rounded-lg p-3 text-white text-sm focus:border-blue-500 focus:outline-none appearance-none"
                    >
                      <option value="none">{t.work.taxTypeNone}</option>
                      <option value="percent">{t.work.taxTypePercent}</option>
                      <option value="fixed_week">{t.work.taxTypeFixedWeek}</option>
                      <option value="fixed_month">{t.work.taxTypeFixedMonth}</option>
                    </select>
                    {taxForm[`${p}_type` as keyof TaxSettings] !== 'none' && (
                      <div className="relative">
                        <input 
                          type="text" inputMode="decimal" placeholder="0"
                          value={taxForm[`${p}_val` as keyof TaxSettings]}
                          onChange={(e) => setTaxForm({...taxForm, [`${p}_val`]: e.target.value.replace(/[^0-9.,]/g, '')})}
                          className="w-full bg-[#1e1e24] border border-gray-600 rounded-lg p-3 text-white text-base font-bold focus:border-blue-500 focus:outline-none pl-4 pr-10 appearance-none"
                        />
                        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 font-bold text-sm pointer-events-none">
                          {taxForm[`${p}_type` as keyof TaxSettings] === 'percent' ? '%' : 'зл'}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <button onClick={saveTaxSettings} disabled={isSavingTaxes} className="w-full py-4 rounded-xl font-bold text-lg text-white bg-blue-600 hover:bg-blue-500 transition shadow-lg disabled:opacity-50">
              {isSavingTaxes ? t.work.saving : t.common.save}
            </button>
          </div>
        </div>
      )}

      {/* МОДАЛЬНЕ ВІКНО: НІКНЕЙМ */}
      {showNicknameModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-xl">
          <div className="bg-[#1e1e24] border border-gray-800 rounded-2xl w-full max-w-md p-6 md:p-8 relative shadow-2xl text-center">
            <h2 className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500 mb-2">
              {lang === "pl" ? "Wybierz swój pseudonim" : lang === "en" ? "Choose your nickname" : lang === "ru" ? "Выбери свой никнейм" : "Придумай свій нікнейм"}
            </h2>
            <p className="text-gray-400 text-sm mb-6">
              {lang === "pl" ? "Wprowadzamy globalny ranking kurierów!" : lang === "en" ? "We are introducing a global courier leaderboard!" : lang === "ru" ? "Мы внедряем глобальный рейтинг курьеров!" : "Ми впроваджуємо загальний рейтинг кур'єрів!"}
            </p>
            {nicknameError && <div className="bg-red-900/30 border border-red-700/50 text-red-400 p-3 rounded-xl text-xs mb-4 text-left">{nicknameError}</div>}
            <form onSubmit={handleNicknameSubmit} className="space-y-4">
              <div className="text-left">
                <input type="text" required pattern="^[a-zA-Z0-9_]{3,15}$" title="Від 3 до 15 символів" value={newNickname} onChange={(e) => setNewNickname(e.target.value.replace(/[^a-zA-Z0-9_]/g, ""))} placeholder="Courier_Hero_2026" className="w-full text-center font-bold tracking-wide text-lg bg-[#2a2a35] border border-gray-700 rounded-xl p-3.5 text-white focus:outline-none focus:border-blue-500 appearance-none" />
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
