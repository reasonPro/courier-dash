"use client";

import { useState, useEffect } from "react";
import type { ChartDatasetCustomTypesPerDataset } from "chart.js";
import type { User } from "@supabase/supabase-js";
import { supabase } from "../../lib/supabase";
import { recordAnalyticsActivity } from "../../lib/admin-analytics";
import { syncServerAuthSession } from "../../lib/server-session-client";
import { useRouter } from "next/navigation";
import { useLanguage } from "../../context/LanguageContext";
import { calculateWorkedHours } from "../../lib/work-hours";
import { AUTH_ROUTES, checkAuthRoute } from "../../lib/auth-route-policy";
import { PROTOTYPE_EXPENSE_ENTRY_CATEGORIES } from "../../lib/expenses-prototype";
import { expensesTranslations } from "../../lib/expenses-translations";
import { useExpenses } from "../../lib/use-expenses";
import {
  areTaxesConfigured,
  calculateMonthlyWorkFinance,
} from "../../lib/work-finance";
import {
  PLATFORM_KEYS,
  PLATFORM_LABELS,
  STANDARD_PLATFORM_KEYS,
  TAX_PLATFORM_KEYS,
  buildPlatformShiftPayload,
  createEmptyPlatformValues,
  getEditingPlatformKeys,
  getIncludedPlatformTips,
  getInvalidCashTipPlatform,
  getOtherPlatformNames,
  getPlatformPreferenceKey,
  getPlatformDisplayName,
  getPlatformMetrics,
  getShiftPlatformTotals,
  isPlatformActive,
  isTaxPlatformKey,
  normalizeOtherPlatformName,
  parsePlatformPreference,
  serializePlatformPreference,
  validatePlatformSelection,
  type PlatformKey,
  type PlatformMetrics,
  type PlatformValues,
  type TaxPlatformKey,
} from "../../lib/work-platforms";
import { WorkChart } from "./components/WorkChart";
import { WorkHeader } from "./components/WorkHeader";
import { WorkEntryForm } from "./components/WorkEntryForm";
import { WorkFilters } from "./components/WorkFilters";
import { WorkHistory } from "./components/WorkHistory";
import { WorkModals } from "./components/WorkModals";
import { WorkSummary } from "./components/WorkSummary";
import { WorkToast } from "./components/WorkToast";
import { ExpensesMonthSummary } from "./components/ExpensesMonthSummary";
import { ExpenseFormModal } from "../expenses/components/ExpenseFormModal";
import { ExpenseSettingsModal } from "../expenses/components/ExpenseSettingsModal";
import {
  FIELD_TEXTS,
  FIRST_RUN_PLATFORMS,
  OTHER_CHART_STYLES,
  PLATFORM_CHART_STYLES,
  TELEGRAM_LABELS,
} from "./work-page.constants";
import type {
  Shift,
  TaxSettings,
  ToastMessage,
} from "./work-page.types";

export default function WorkDashboard() {
  const router = useRouter();
  const { lang, setLanguage, t } = useLanguage();
  const expenseCopy = expensesTranslations[lang];
  const expensesPrototype = useExpenses();
  const [userId, setUserId] = useState<string | null>(null);
  
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [km, setKm] = useState("");
  const [hours, setHours] = useState("");
  
  const [showCalc, setShowCalc] = useState(false);
  const [showCalcInfo, setShowCalcInfo] = useState(false);
  const [shiftStart, setShiftStart] = useState("");
  const [shiftEnd, setShiftEnd] = useState("");
  const [breaks, setBreaks] = useState<{start: string, end: string}[]>([]);

  const [earnings, setEarnings] = useState<PlatformValues>(createEmptyPlatformValues);
  const [orders, setOrders] = useState<PlatformValues>(createEmptyPlatformValues);
  const [tips, setTips] = useState<PlatformValues>(createEmptyPlatformValues);
  const [cashTips, setCashTips] = useState<PlatformValues>(createEmptyPlatformValues);
  const [bonuses, setBonuses] = useState<PlatformValues>(createEmptyPlatformValues);
  const [otherPlatformName, setOtherPlatformName] = useState("");
  const [showExtras, setShowExtras] = useState(false);
  
  const [activePlatforms, setActivePlatforms] = useState<PlatformKey[]>(FIRST_RUN_PLATFORMS);
  const [preferredPlatforms, setPreferredPlatforms] = useState<PlatformKey[]>(FIRST_RUN_PLATFORMS);
  const [preferredOtherPlatformName, setPreferredOtherPlatformName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  
  const [showBestMonthDay, setShowBestMonthDay] = useState(false);
  const [includeTips, setIncludeTips] = useState(true);
  const [includeBonuses, setIncludeBonuses] = useState(true);
  const [showMobileTable, setShowMobileTable] = useState(false);

  const [shifts, setShifts] = useState<Shift[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [shiftLoadFailed, setShiftLoadFailed] = useState(false);
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

  const [toast, setToast] = useState<ToastMessage | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<number | null>(null);
  const [showExpenseModal, setShowExpenseModal] = useState(false);
  const [showExpenseSettings, setShowExpenseSettings] = useState(false);

  // === НАЛАШТУВАННЯ ВВОДУ ДАНИХ (ПРОБІГ, ГОДИНИ) ===
  const [showFieldSettings, setShowFieldSettings] = useState(false);
  const [fieldSettings, setFieldSettings] = useState({ km: true, hours: true, orders: true });

  const fText = FIELD_TEXTS[lang] || FIELD_TEXTS.uk;
  const tgLabel = TELEGRAM_LABELS[lang] || TELEGRAM_LABELS.uk;

  useEffect(() => {
    const savedFields = localStorage.getItem("courier_field_settings");
    if (savedFields) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- Restore browser-only field settings after hydration while preserving the SSR default snapshot.
      try { setFieldSettings(JSON.parse(savedFields)); } catch {}
    }
  }, []);

  const updateFieldSetting = (key: keyof typeof fieldSettings, val: boolean) => {
    const newVal = { ...fieldSettings, [key]: val };
    setFieldSettings(newVal);
    localStorage.setItem("courier_field_settings", JSON.stringify(newVal));
    if (!val) {
      if (key === 'km') setKm("");
      if (key === 'hours') { setHours(""); setShowCalc(false); }
      if (key === 'orders') setOrders(createEmptyPlatformValues());
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

  const fetchShifts = async (uid: string) => {
    setIsLoading(true);
    setShiftLoadFailed(false);
    const { data, error } = await supabase.from("work_shifts").select("*").eq("user_id", uid).order("date", { ascending: false });
    if (!error && data) setShifts(data as Shift[]);
    if (error) setShiftLoadFailed(true);
    setIsLoading(false);
  };

  const checkNickname = async (sessionUser: User) => {
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
    const { data: fetchedData, error } = await supabase.from("tax_settings").select("*").eq("user_id", uid).single();
    let data = fetchedData;
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

  useEffect(() => {
    let isActive = true;

    const checkUser = async () => {
      const { redirectTo, user } = await checkAuthRoute("protected", () =>
        supabase.auth.getSession(),
      );

      if (!isActive) return;

      if (redirectTo) {
        router.replace(redirectTo);
        return;
      }

      if (!user) return;

      const savedPreference = parsePlatformPreference(
        localStorage.getItem(getPlatformPreferenceKey(user.id)),
      );
      const initialPlatforms = savedPreference?.platforms ?? FIRST_RUN_PLATFORMS;
      const initialOtherPlatformName = savedPreference?.otherPlatformName ?? "";

      setUserId(user.id);
      setPreferredPlatforms([...initialPlatforms]);
      setPreferredOtherPlatformName(initialOtherPlatformName);
      setActivePlatforms([...initialPlatforms]);
      setOtherPlatformName(initialOtherPlatformName);
      fetchShifts(user.id);
      checkNickname(user);
      fetchTaxSettings(user.id);
    };

    checkUser();

    return () => {
      isActive = false;
    };
  }, [router]);

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

  const handleLogout = async () => {
    setIsLoading(true);
    await supabase.auth.signOut();
    await syncServerAuthSession(null);
    localStorage.removeItem("supabase.auth.token"); 
    router.replace(AUTH_ROUTES.home);
  };

  const handleEarningChange = (platform: PlatformKey, value: string) => setEarnings((prev) => ({ ...prev, [platform]: value }));
  const handleOrderChange = (platform: PlatformKey, value: string) => setOrders((prev) => ({ ...prev, [platform]: value }));
  const handleTipChange = (platform: PlatformKey, value: string) => setTips((prev) => ({ ...prev, [platform]: value }));
  const handleCashTipChange = (platform: PlatformKey, value: string) => setCashTips((prev) => ({ ...prev, [platform]: value }));
  const handleBonusChange = (platform: PlatformKey, value: string) => setBonuses((prev) => ({ ...prev, [platform]: value }));

  const persistPlatformPreference = (
    platforms: PlatformKey[],
    customPlatformName: string,
  ) => {
    if (!userId) return;
    const cleanCustomPlatformName = platforms.includes("other")
      ? normalizeOtherPlatformName(customPlatformName)
      : "";

    setPreferredPlatforms([...platforms]);
    setPreferredOtherPlatformName(cleanCustomPlatformName);
    localStorage.setItem(
      getPlatformPreferenceKey(userId),
      serializePlatformPreference(platforms, cleanCustomPlatformName),
    );
  };

  const addPlatform = (platform: PlatformKey) => {
    const nextPlatforms = [...activePlatforms, platform];
    setActivePlatforms(nextPlatforms);
    if (!editingId) {
      persistPlatformPreference(nextPlatforms, otherPlatformName);
    }
  };

  const removePlatform = (platform: PlatformKey) => {
    const nextPlatforms = activePlatforms.filter(p => p !== platform);
    const nextOtherPlatformName = platform === "other" ? "" : otherPlatformName;
    setActivePlatforms(nextPlatforms);
    handleEarningChange(platform, ""); handleOrderChange(platform, ""); handleTipChange(platform, ""); handleCashTipChange(platform, ""); handleBonusChange(platform, "");
    if (platform === "other") setOtherPlatformName("");
    if (!editingId) {
      persistPlatformPreference(nextPlatforms, nextOtherPlatformName);
    }
  };

  const handleOtherPlatformNameBlur = () => {
    const cleanOtherPlatformName = normalizeOtherPlatformName(otherPlatformName);
    setOtherPlatformName(cleanOtherPlatformName);
    if (!editingId && activePlatforms.includes("other")) {
      persistPlatformPreference(activePlatforms, cleanOtherPlatformName);
    }
  };

  const calculateHours = () => {
    if (!shiftStart || !shiftEnd) return;
    setHours(calculateWorkedHours(shiftStart, shiftEnd, breaks).toFixed(2));
    setShowCalc(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId) return;
    const selectionError = validatePlatformSelection(activePlatforms, otherPlatformName);
    if (selectionError === "no_platforms") {
      showToast(t.work.platformSelectionRequired, "error");
      return;
    }
    if (selectionError === "other_name_required") {
      showToast(t.work.otherPlatformNameRequired, "error");
      return;
    }
    if (getInvalidCashTipPlatform(activePlatforms, cashTips)) {
      showToast(t.work.cashTipsNonNegative, "error");
      return;
    }
    setIsSubmitting(true);

    const editingShift = editingId
      ? shifts.find((shift) => shift.id === editingId)
      : undefined;
    const shiftData = {
      date: date, km: parseFloat(km) || 0, hours: parseFloat(hours) || 0,
      ...buildPlatformShiftPayload(
        activePlatforms,
        { earnings, orders, tips, cashTips, bonuses },
        otherPlatformName,
        editingShift,
      ),
      user_id: userId,
    };

    if (editingId) {
      const { error } = await supabase.from("work_shifts").update(shiftData).eq("id", editingId);
      if (error) showToast(t.work.updateError + error.message, "error");
      else { 
        void recordAnalyticsActivity("work");
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
        void recordAnalyticsActivity("work");
        resetForm(); fetchShifts(userId);
        showToast(lang === "pl" ? "Zapisano zmianę!" : lang === "en" ? "Shift saved!" : lang === "ru" ? "Смена сохранена!" : "Зміну збережено!", "success");
      }
    }
    setIsSubmitting(false);
  };

  const handleEdit = (shift: Shift) => {
    setEditingId(shift.id); setDate(shift.date); setKm(shift.km.toString()); setHours(shift.hours.toString());
    const formValues = (
      metric: "income" | "orders" | "appTips" | "cashTips" | "bonuses",
    ) =>
      PLATFORM_KEYS.reduce((values, platform) => {
        const value = getPlatformMetrics(shift, platform)[metric];
        values[platform] = value !== 0 ? value.toString() : "";
        return values;
      }, createEmptyPlatformValues());
    setEarnings(formValues("income"));
    setOrders(formValues("orders"));
    setTips(formValues("appTips"));
    setCashTips(formValues("cashTips"));
    setBonuses(formValues("bonuses"));
    setOtherPlatformName(normalizeOtherPlatformName(shift.other_platform_name ?? ""));

    const hasExtras = PLATFORM_KEYS.some((platform) => {
      const metrics = getPlatformMetrics(shift, platform);
      return metrics.tips !== 0 || metrics.bonuses !== 0;
    });
    setShowExtras(hasExtras);

    setActivePlatforms(getEditingPlatformKeys(shift));
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
    setEarnings(createEmptyPlatformValues());
    setOrders(createEmptyPlatformValues());
    setTips(createEmptyPlatformValues());
    setCashTips(createEmptyPlatformValues());
    setBonuses(createEmptyPlatformValues());
    setOtherPlatformName(preferredOtherPlatformName);
    setShowExtras(false); setActivePlatforms([...preferredPlatforms]); setIsFormOpen(false);
  };

  const hasTaxesConfigured = () => {
    return areTaxesConfigured(taxSettings);
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

  const getPlatformOptionLabel = (platform: PlatformKey) =>
    platform === "other" ? t.work.otherPlatform : PLATFORM_LABELS[platform];
  const availableToAdd = PLATFORM_KEYS.filter(p => !activePlatforms.includes(p));
  const filteredShifts = shifts.filter(shift => shift.date.startsWith(selectedMonth));
  const expensesFinance = calculateMonthlyWorkFinance(filteredShifts, taxSettings);
  const getMetricTooltip = (shift: Shift, metric: keyof PlatformMetrics) =>
    PLATFORM_KEYS
      .filter((platform) => platform !== "other" || isPlatformActive(shift, platform))
      .map((platform) => {
        const metrics = getPlatformMetrics(shift, platform);
        const value = metrics[metric];
        const formattedValue = metric === "orders" ? value.toString() : value.toFixed(2);
        const platformName = getPlatformDisplayName(shift, platform, t.work.otherPlatform);

        if (metric === "tips") {
          return `${platformName}: ${formattedValue} (${t.work.appTipsLabel}: ${metrics.appTips.toFixed(2)}; ${t.work.cashTipsLabel}: ${metrics.cashTips.toFixed(2)})`;
        }

        return `${platformName}: ${formattedValue}`;
      })
      .join("\n");

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
    TAX_PLATFORM_KEYS.forEach(p => {
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
    TAX_PLATFORM_KEYS.forEach(p => {
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

  const getPlatNetto = (gross: number, p: TaxPlatformKey) => {
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
    const dailyTotals = getShiftPlatformTotals(shift);
    
    PLATFORM_KEYS.forEach(p => {
      const metrics = getPlatformMetrics(shift, p);
      const includedTips = getIncludedPlatformTips(metrics, includeTips);
      let taxableGross = metrics.income + includedTips.appTips;
      if (includeBonuses) taxableGross += metrics.bonuses;
      shiftVisualTotal += (isNetto && taxableGross > 0 && isTaxPlatformKey(p))
        ? getPlatNetto(taxableGross, p) + includedTips.cashTips
        : taxableGross + includedTips.cashTips;
    });

    absTotalTips += dailyTotals.tips;
    absTotalBaseAndBonuses += (dailyTotals.income + dailyTotals.bonuses);

    totalVisualEarned += shiftVisualTotal;
    totalHours += shift.hours;
    totalKm += shift.km;
    totalOrders += dailyTotals.orders;

    if (shiftVisualTotal > maxEarned) { maxEarned = shiftVisualTotal; bestShiftDate = shift.date; }
  });

  const totalDays = filteredShifts.length;
  // Елегантні прочерки, якщо даних немає (замість кривих 0.00)
  const avgPerHour = totalHours > 0 ? (totalVisualEarned / totalHours).toFixed(2) : "—";
  const avgPerKm = totalKm > 0 ? (totalVisualEarned / totalKm).toFixed(2) : "—";
  const avgPerOrder = totalOrders > 0 ? (totalVisualEarned / totalOrders).toFixed(2) : "—";
  
  const avgHoursPerDay = totalDays > 0 ? (totalHours / totalDays).toFixed(1) : "—";
  const avgOrdersPerDay = totalDays > 0 ? (totalOrders / totalDays).toFixed(1) : "—";
  const avgEarnedPerDay = totalDays > 0 ? (totalVisualEarned / totalDays).toFixed(2) : "0.00";

  const absoluteTotalIncome = absTotalBaseAndBonuses + absTotalTips;
  const tipsPercent = absoluteTotalIncome > 0 ? ((absTotalTips / absoluteTotalIncome) * 100).toFixed(1) : "0.0";

  const chronologicalShifts = [...filteredShifts].reverse();

  const getChartVal = (shift: Shift, p: PlatformKey, type: "base"|"tips"|"bonuses") => {
    const metrics = getPlatformMetrics(shift, p);
    const includedTips = getIncludedPlatformTips(metrics, includeTips);
    const pGross = metrics.income;
    const pBon = metrics.bonuses;
    const taxableGross = pGross + includedTips.appTips + (includeBonuses ? pBon : 0);
    
    const rawVal = type === "base" ? pGross : (type === "tips" ? includedTips.totalTips : pBon);
    if (!isNetto || !isTaxPlatformKey(p)) return rawVal;
    if (taxableGross <= 0) return type === "tips" ? includedTips.cashTips : rawVal;
    
    const netto = getPlatNetto(taxableGross, p);
    const ratio = netto / taxableGross;
    return type === "tips"
      ? includedTips.appTips * ratio + includedTips.cashTips
      : rawVal * ratio;
  };

  const chartDatasets: ChartDatasetCustomTypesPerDataset<
    "bar" | "line",
    number[]
  >[] = STANDARD_PLATFORM_KEYS.map((platform) => ({
    type: "bar",
    label: PLATFORM_LABELS[platform],
    data: chronologicalShifts.map(s => getChartVal(s, platform, "base")),
    ...PLATFORM_CHART_STYLES[platform],
    borderWidth: 1,
    stack: "Stack 0",
    order: 2,
  }));

  getOtherPlatformNames(chronologicalShifts).forEach((platformName, index) => {
    const chartStyle = OTHER_CHART_STYLES[index % OTHER_CHART_STYLES.length];
    chartDatasets.push({
      type: "bar",
      label: platformName,
      data: chronologicalShifts.map((shift) =>
        normalizeOtherPlatformName(shift.other_platform_name ?? "") === platformName
          ? getChartVal(shift, "other", "base")
          : 0
      ),
      ...chartStyle,
      borderWidth: 1,
      stack: "Stack 0",
      order: 2,
    });
  });

  if (includeTips) {
    chartDatasets.push({ type: 'bar', label: t.work.tipsLabel, data: chronologicalShifts.map(s => PLATFORM_KEYS.reduce((sum, platform) => sum + getChartVal(s, platform, "tips"), 0)), backgroundColor: "rgba(244, 63, 94, 0.4)", borderColor: "rgba(244, 63, 94, 1)", borderWidth: 1, stack: 'Stack 0', order: 2 });
  }
  if (includeBonuses) {
    chartDatasets.push({ type: 'bar', label: t.work.bonusesLabel, data: chronologicalShifts.map(s => PLATFORM_KEYS.reduce((sum, platform) => sum + getChartVal(s, platform, "bonuses"), 0)), backgroundColor: "rgba(168, 85, 247, 0.4)", borderColor: "rgba(168, 85, 247, 1)", borderWidth: 1, stack: 'Stack 0', order: 2 });
  }

  chartDatasets.push(
    {
      type: 'line', label: t.work.tableRate,
      data: chronologicalShifts.map(s => {
        let sVisual = 0;
        PLATFORM_KEYS.forEach(p => {
          const metrics = getPlatformMetrics(s, p);
          const includedTips = getIncludedPlatformTips(metrics, includeTips);
          const taxableGross = metrics.income + includedTips.appTips + (includeBonuses ? metrics.bonuses : 0);
          sVisual += (isNetto && taxableGross > 0 && isTaxPlatformKey(p))
            ? getPlatNetto(taxableGross, p) + includedTips.cashTips
            : taxableGross + includedTips.cashTips;
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

    const activeExpenseCategories =
      expensesPrototype.state.activeCategories.filter(
        (category) => PROTOTYPE_EXPENSE_ENTRY_CATEGORIES.includes(category),
      );

  return (
    <div className="min-h-screen bg-[#121212] text-white p-4 md:p-10 relative">
      <WorkToast toast={toast} />

      <div className="max-w-6xl mx-auto">
        <WorkHeader
          editingId={editingId}
          expensesLabel={expenseCopy.navLabel}
          lang={lang}
          onLanguageChange={setLanguage}
          onLogout={handleLogout}
          telegramLabel={tgLabel}
          translations={t}
          userNickname={userNickname}
        />

        {/* Кнопка додавання зміни (ДЛЯ ПК) */}
        {!isFormOpen && (
          <div className="mb-8 hidden gap-3 md:flex">
            <button
              className="min-w-0 flex-1 rounded-xl bg-gradient-to-r from-green-600 to-green-500 px-6 py-4 text-lg font-bold text-white shadow-lg transition hover:from-green-500 hover:to-green-400"
              onClick={() => setIsFormOpen(true)}
              type="button"
            >
              {t.work.addShiftBtn}
            </button>
            {expensesPrototype.state.enabled && activeExpenseCategories.length > 0 && (
              <button
                aria-label={expenseCopy.addExpenseAria}
                className="shrink-0 rounded-xl border border-red-400/40 bg-gradient-to-r from-red-500 to-rose-600 px-6 py-4 text-lg font-bold text-white shadow-lg shadow-red-950/30 transition hover:brightness-110"
                onClick={() => setShowExpenseModal(true)}
                type="button"
              >
                {expenseCopy.addExpenseButton}
              </button>
            )}
          </div>
        )}

        {/* ПЛАВАЮЧА АНІМОВАНА КНОПКА (ДЛЯ ТЕЛЕФОНІВ) */}
        {!isFormOpen && (
          <div className="md:hidden fixed bottom-6 right-6 z-[90] flex flex-col items-center gap-3">
            {expensesPrototype.state.enabled && activeExpenseCategories.length > 0 && (
              <button
                aria-label={expenseCopy.addExpenseAria}
                className="relative flex h-14 w-14 items-center justify-center rounded-full border border-red-400/50 bg-gradient-to-br from-red-400 to-rose-600 text-white shadow-[0_4px_20px_rgba(244,63,94,0.45)] transition active:scale-95"
                onClick={() => setShowExpenseModal(true)}
                type="button"
              >
                <span className="absolute inset-0 animate-ping rounded-full bg-red-500 opacity-35" />
                <span aria-hidden="true" className="relative text-4xl font-light leading-none">−</span>
              </button>
            )}
            {/* Анімація "хвильки" */}
            {/* Сама кнопка */}
            <button 
              aria-label={expenseCopy.addShiftAria}
              onClick={() => { setIsFormOpen(true); window.scrollTo({ top: 0, behavior: 'smooth' }); }} 
              className="relative bg-gradient-to-br from-green-400 to-green-600 text-white rounded-full w-14 h-14 flex items-center justify-center shadow-[0_4px_20px_rgba(34,197,94,0.5)] border border-green-400/50 transition active:scale-95"
              type="button"
            >
              <span className="absolute inset-0 animate-ping rounded-full bg-green-500 opacity-40" />
              <svg className="relative w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4"></path>
              </svg>
            </button>
          </div>
        )}

        <WorkEntryForm
          activePlatforms={activePlatforms}
          availablePlatforms={availableToAdd}
          bonuses={bonuses}
          breaks={breaks}
          cashTips={cashTips}
          date={date}
          earnings={earnings}
          editingId={editingId}
          fieldSettings={fieldSettings}
          fieldText={fText}
          getPlatformOptionLabel={getPlatformOptionLabel}
          hours={hours}
          isFormOpen={isFormOpen}
          isSubmitting={isSubmitting}
          km={km}
          onAddPlatform={addPlatform}
          onBonusChange={handleBonusChange}
          onCashTipChange={handleCashTipChange}
          onBreaksChange={setBreaks}
          onCalculateHours={calculateHours}
          onDateChange={setDate}
          onEarningChange={handleEarningChange}
          onHoursChange={setHours}
          onKmChange={setKm}
          onOpenFieldSettings={() => setShowFieldSettings(true)}
          onOrderChange={handleOrderChange}
          onOtherPlatformNameBlur={handleOtherPlatformNameBlur}
          onOtherPlatformNameChange={setOtherPlatformName}
          onRemovePlatform={removePlatform}
          onReset={resetForm}
          onShiftEndChange={setShiftEnd}
          onShiftStartChange={setShiftStart}
          onShowCalcChange={setShowCalc}
          onShowCalcInfoChange={setShowCalcInfo}
          onShowExtrasChange={setShowExtras}
          onSubmit={handleSubmit}
          onTipChange={handleTipChange}
          orders={orders}
          otherPlatformName={otherPlatformName}
          shiftEnd={shiftEnd}
          shiftStart={shiftStart}
          showCalc={showCalc}
          showCalcInfo={showCalcInfo}
          showExtras={showExtras}
          tips={tips}
          translations={t}
        />

        <WorkFilters
          hasTaxesConfigured={hasTaxesConfigured()}
          includeBonuses={includeBonuses}
          includeTips={includeTips}
          isNetto={isNetto}
          lang={lang}
          onBruttoSelect={() => setIsNetto(false)}
          onIncludeBonusesChange={setIncludeBonuses}
          onIncludeTipsChange={setIncludeTips}
          onNettoSelect={handleNettoToggle}
          onOpenTaxSettings={() => setShowTaxModal(true)}
          onSelectedMonthChange={setSelectedMonth}
          selectedMonth={selectedMonth}
          translations={t}
        />

        <WorkSummary
          avgEarnedPerDay={avgEarnedPerDay}
          avgHoursPerDay={avgHoursPerDay}
          avgOrdersPerDay={avgOrdersPerDay}
          avgPerHour={avgPerHour}
          avgPerKm={avgPerKm}
          avgPerOrder={avgPerOrder}
          bestShiftDate={bestShiftDate}
          isNetto={isNetto}
          maxEarned={maxEarned}
          onShowBestMonthDayChange={setShowBestMonthDay}
          showBestMonthDay={showBestMonthDay}
          tipsPercent={tipsPercent}
          totalHours={totalHours}
          totalKm={totalKm}
          totalOrders={totalOrders}
          totalVisualEarned={totalVisualEarned}
          translations={t}
        />

        <ExpensesMonthSummary
          copy={expenseCopy}
          expensesReadFailed={expensesPrototype.error !== null}
          grossIncome={expensesFinance.grossIncome}
          grossKnown={!isLoading && !shiftLoadFailed}
          mode={isNetto ? "netto" : "brutto"}
          netIncome={expensesFinance.netIncome}
          onSetupCategories={() => setShowExpenseSettings(true)}
          selectedMonth={selectedMonth}
          state={expensesPrototype.state}
        />

        {filteredShifts.length > 0 && (
          <WorkChart
            data={monthlyChartData}
            isNetto={isNetto}
            options={monthlyChartOptions}
            translations={t}
          />
        )}

        <WorkHistory
          getMetricTooltip={getMetricTooltip}
          isLoading={isLoading}
          lang={lang}
          onDelete={confirmDelete}
          onEdit={handleEdit}
          onShowMobileTableChange={setShowMobileTable}
          shifts={filteredShifts}
          showMobileTable={showMobileTable}
          translations={t}
        />

      </div>

      <WorkModals
        deleteConfirmId={deleteConfirmId}
        fieldSettings={fieldSettings}
        fieldText={fText}
        isSavingNickname={isSavingNickname}
        isSavingTaxes={isSavingTaxes}
        lang={lang}
        newNickname={newNickname}
        nicknameError={nicknameError}
        onCancelDelete={() => setDeleteConfirmId(null)}
        onCloseFieldSettings={() => setShowFieldSettings(false)}
        onCloseTaxSettings={() => setShowTaxModal(false)}
        onConfirmDelete={executeDelete}
        onFieldSettingChange={updateFieldSetting}
        onNewNicknameChange={setNewNickname}
        onNicknameSubmit={handleNicknameSubmit}
        onSaveTaxSettings={saveTaxSettings}
        onTaxFormChange={setTaxForm}
        showFieldSettings={showFieldSettings}
        showNicknameModal={showNicknameModal}
        showTaxModal={showTaxModal}
        taxForm={taxForm}
        translations={t}
      />
      <ExpenseFormModal
          activeCategories={activeExpenseCategories}
        copy={expenseCopy}
        editing={null}
        key={`work-expense-form-${showExpenseModal}`}
        onClose={() => setShowExpenseModal(false)}
        onSave={async (value) => {
          try {
            await expensesPrototype.addManualExpense(value);
            setShowExpenseModal(false);
            showToast(expenseCopy.expenseAdded, "success");
          } catch {
            showToast(expenseCopy.readError, "error");
          }
        }}
        open={showExpenseModal}
      />
      <ExpenseSettingsModal
        activeCategories={expensesPrototype.state.activeCategories}
        copy={expenseCopy}
        key={`work-expense-settings-${showExpenseSettings}-${expensesPrototype.state.activeCategories.join("-")}`}
        onClose={() => setShowExpenseSettings(false)}
        onSave={async (categories) => {
          try {
            await expensesPrototype.saveCategories(categories);
            setShowExpenseSettings(false);
          } catch {
            showToast(expenseCopy.readError, "error");
          }
        }}
        open={showExpenseSettings}
      />
    </div>
  );
}
