"use client";

import React, { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { useRouter } from "next/navigation";
import {
  getStudentsInClassroom,
  getClassroomListings,
  updateListingStatus,
  removeListingByTeacher,
  createClassroom,
  triggerMarketEventInClassroom,
  getClassroomTransactions,
  getClassroomLoans,
  approveLoan,
  rejectLoan,
  repayLoan,
  getClassroomCompetitions,
  createCompetition,
  resetClassroomEconomy,
  sendNotification
} from "@/lib/classroom";
import QRCode from "qrcode";
import SlowToast from "@/components/slow-toast";
import { Student, Listing, Transaction, Loan, Competition, CompetitionType } from "@/types";
import {
  CheckCircle,
  XCircle,
  Copy,
  Check,
  Trophy,
  RefreshCw,
  PlusCircle,
  ShieldAlert,
  TrendingUp,
  TrendingDown,
  Building2,
  Gift,
  Zap,
  Sparkles,
  RotateCcw,
  Activity,
  FileText,
  Trash2,
  Store,
  AlertTriangle,
  QrCode
} from "lucide-react";

export default function TeacherDashboard() {
  const router = useRouter();
  const { user, activeClassroom, setActiveClassroom, loading, loadTeacherClassrooms } = useAuth();

  const [students, setStudents] = useState<Student[]>([]);
  const [listings, setListings] = useState<Listing[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loans, setLoans] = useState<Loan[]>([]);
  const [competitions, setCompetitions] = useState<Competition[]>([]);
  
  const [copiedCode, setCopiedCode] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // QR Code Modal State
  const [showQrModal, setShowQrModal] = useState(false);
  const [qrDataUrl, setQrDataUrl] = useState("");

  // New classroom modal state
  const [showNewClassModal, setShowNewClassModal] = useState(false);
  const [newClassName, setNewClassName] = useState("");
  const [newCurrencyName, setNewCurrencyName] = useState("SparkCoins");
  const [newStartingBalance, setNewStartingBalance] = useState(100);
  const [creatingClass, setCreatingClass] = useState(false);

  // Market event notification state
  const [eventNotice, setEventNotice] = useState<{ name: string; details: string } | null>(null);
  const [triggeringEvent, setTriggeringEvent] = useState<string | null>(null);

  // 1. APPROVE LISTING MODAL
  const [approveListingItem, setApproveListingItem] = useState<Listing | null>(null);
  const [approvingListing, setApprovingListing] = useState(false);

  // 2. REJECT LISTING MODAL
  const [rejectListingItem, setRejectListingItem] = useState<Listing | null>(null);
  const [rejectReason, setRejectReason] = useState("");
  const [rejectingListing, setRejectingListing] = useState(false);

  // 3. REMOVE APPROVED LISTING MODAL
  const [removeListingItem, setRemoveListingItem] = useState<Listing | null>(null);
  const [removeReason, setRemoveReason] = useState("");
  const [removing, setRemoving] = useState(false);

  // 4. TRIGGER MARKET EVENT MODAL
  const [eventToTrigger, setEventToTrigger] = useState<{
    type: "inflation" | "recession" | "taxday" | "bonuspayday" | "doubleearnings";
    name: string;
  } | null>(null);

  // 5. RESET ECONOMY MODAL
  const [showResetModal, setShowResetModal] = useState(false);
  const [resetting, setResetting] = useState(false);

  // 6. APPROVE LOAN MODAL
  const [approveLoanItem, setApproveLoanItem] = useState<Loan | null>(null);
  const [approvingLoan, setApprovingLoan] = useState(false);

  // 7. REJECT LOAN MODAL
  const [rejectLoanItem, setRejectLoanItem] = useState<Loan | null>(null);
  const [rejectingLoan, setRejectingLoan] = useState(false);

  // 8. LAUNCH COMPETITION FORM & CONFIRM MODAL
  const [showCompModal, setShowCompModal] = useState(false);
  const [compType, setCompType] = useState<CompetitionType>("Most Earned");
  const [compTitle, setCompTitle] = useState("");
  const [compDesc, setCompDesc] = useState("");
  const [compPrize, setCompPrize] = useState("50 SparkCoins Bonus");
  const [showCompConfirmModal, setShowCompConfirmModal] = useState(false);
  const [launchingComp, setLaunchingComp] = useState(false);

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.push("/teacher/login");
      } else if (!activeClassroom) {
        loadTeacherClassrooms();
      }
    }
  }, [loading, user, activeClassroom, router, loadTeacherClassrooms]);

  useEffect(() => {
    if (activeClassroom) {
      loadDashboardData();
    }
  }, [activeClassroom]);

  const loadDashboardData = async () => {
    if (!activeClassroom) return;
    setRefreshing(true);
    try {
      const studentList = await getStudentsInClassroom(activeClassroom.id);
      setStudents(studentList);

      const listingList = await getClassroomListings(activeClassroom.id);
      setListings(listingList);

      const txs = await getClassroomTransactions(activeClassroom.id);
      setTransactions(txs);

      const loanList = await getClassroomLoans(activeClassroom.id);
      setLoans(loanList);

      const comps = await getClassroomCompetitions(activeClassroom.id);
      setCompetitions(comps);
    } catch (err) {
      console.error("Dashboard Load Error:", err);
    } finally {
      setRefreshing(false);
    }
  };

  const copyJoinCode = () => {
    if (activeClassroom?.joinCode) {
      navigator.clipboard.writeText(activeClassroom.joinCode);
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2000);
    }
  };

  const handleShowQrCode = async () => {
    if (!activeClassroom) return;
    try {
      const joinUrl = `${window.location.origin}/join?code=${activeClassroom.joinCode}`;
      const url = await QRCode.toDataURL(joinUrl, { width: 300, margin: 2 });
      setQrDataUrl(url);
      setShowQrModal(true);
    } catch (e) {
      console.error("QR Code Error:", e);
    }
  };

  // 1. EXECUTE APPROVE LISTING
  const executeApproveListing = async () => {
    if (!activeClassroom || !approveListingItem) return;
    setApprovingListing(true);
    try {
      await updateListingStatus(activeClassroom.id, approveListingItem.id, "approved");
      setApproveListingItem(null);
      await loadDashboardData();
    } catch (err) {
      console.error("Approve listing error:", err);
    } finally {
      setApprovingListing(false);
    }
  };

  // 2. EXECUTE REJECT LISTING
  const executeRejectListing = async () => {
    if (!activeClassroom || !rejectListingItem) return;
    setRejectingListing(true);
    try {
      await updateListingStatus(activeClassroom.id, rejectListingItem.id, "rejected");
      if (rejectReason.trim()) {
        await sendNotification(
          activeClassroom.id,
          rejectListingItem.studentId,
          "teacher_announcement",
          "Hustle Listing Revision Required ⚠️",
          `Your teacher reviewed "${rejectListingItem.hustleName}". Reason for rejection: ${rejectReason.trim()}`
        );
      }
      setRejectListingItem(null);
      setRejectReason("");
      await loadDashboardData();
    } catch (err) {
      console.error("Reject listing error:", err);
    } finally {
      setRejectingListing(false);
    }
  };

  // 3. EXECUTE REMOVE APPROVED LISTING
  const executeRemoveListing = async () => {
    if (!activeClassroom || !removeListingItem) return;
    setRemoving(true);
    try {
      await removeListingByTeacher(activeClassroom.id, removeListingItem.id, removeReason);
      setRemoveListingItem(null);
      setRemoveReason("");
      await loadDashboardData();
    } catch (err) {
      console.error("Remove listing error:", err);
    } finally {
      setRemoving(false);
    }
  };

  // 4. EXECUTE TRIGGER MARKET EVENT
  const executeTriggerMarketEvent = async () => {
    if (!activeClassroom || !eventToTrigger) return;
    const eventType = eventToTrigger.type;
    setTriggeringEvent(eventType);
    try {
      let res = await fetch("https://us-central1-hustlespark-edu.cloudfunctions.net/triggerMarketEvent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ classroomId: activeClassroom.id, eventType }),
      });

      if (!res.ok) {
        const result = await triggerMarketEventInClassroom(activeClassroom.id, eventType);
        setEventNotice({ name: result.eventName, details: result.details });
      } else {
        const data = await res.json();
        setEventNotice({ name: data.eventName, details: data.details || data.message });
      }
      setEventToTrigger(null);
      await loadDashboardData();
    } catch (err: any) {
      console.error("Failed to trigger market event via Cloud Function, running fallback:", err);
      const result = await triggerMarketEventInClassroom(activeClassroom.id, eventType);
      setEventNotice({ name: result.eventName, details: result.details });
      setEventToTrigger(null);
      await loadDashboardData();
    } finally {
      setTriggeringEvent(null);
    }
  };

  // 5. EXECUTE RESET ECONOMY
  const executeResetEconomy = async () => {
    if (!activeClassroom) return;
    setResetting(true);
    try {
      await resetClassroomEconomy(activeClassroom.id);
      setShowResetModal(false);
      await loadDashboardData();
    } catch (err) {
      console.error("Reset economy error:", err);
    } finally {
      setResetting(false);
    }
  };

  // 6. EXECUTE APPROVE LOAN
  const executeApproveLoan = async () => {
    if (!activeClassroom || !approveLoanItem) return;
    setApprovingLoan(true);
    try {
      await approveLoan(activeClassroom.id, approveLoanItem.id);
      setApproveLoanItem(null);
      await loadDashboardData();
    } catch (err) {
      console.error("Approve loan error:", err);
    } finally {
      setApprovingLoan(false);
    }
  };

  // 7. EXECUTE REJECT LOAN
  const executeRejectLoan = async () => {
    if (!activeClassroom || !rejectLoanItem) return;
    setRejectingLoan(true);
    try {
      await rejectLoan(activeClassroom.id, rejectLoanItem.id);
      setRejectLoanItem(null);
      await loadDashboardData();
    } catch (err) {
      console.error("Reject loan error:", err);
    } finally {
      setRejectingLoan(false);
    }
  };

  const handleRepayLoan = async (loanId: string) => {
    if (!activeClassroom) return;
    await repayLoan(activeClassroom.id, loanId);
    loadDashboardData();
  };

  // 8. EXECUTE LAUNCH COMPETITION
  const executeLaunchCompetition = async () => {
    if (!activeClassroom || !compTitle.trim()) return;
    setLaunchingComp(true);
    try {
      const startDate = new Date().toISOString();
      const endDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();

      await createCompetition(
        activeClassroom.id,
        compType,
        compTitle.trim(),
        compDesc.trim() || `Classroom Challenge for ${compType}`,
        startDate,
        endDate,
        compPrize.trim()
      );

      setShowCompConfirmModal(false);
      setShowCompModal(false);
      setCompTitle("");
      setCompDesc("");
      await loadDashboardData();
    } catch (err) {
      console.error("Launch competition error:", err);
    } finally {
      setLaunchingComp(false);
    }
  };

  const handleCreateNewClassroom = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !newClassName.trim()) return;
    setCreatingClass(true);
    try {
      const newClass = await createClassroom(
        user.uid,
        user.displayName || "Teacher",
        newClassName.trim(),
        newCurrencyName.trim() || "SparkCoins",
        newStartingBalance || 100
      );
      setActiveClassroom(newClass);
      setShowNewClassModal(false);
      setNewClassName("");
    } catch (err) {
      console.error("Failed to create classroom:", err);
    } finally {
      setCreatingClass(false);
    }
  };

  if (loading || !activeClassroom) {
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center p-6 space-y-4">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600" />
        <p className="text-sm font-semibold text-slate-600">Loading Teacher Dashboard...</p>
      </div>
    );
  }

  const pendingListings = listings.filter((l) => l.status === "pending");
  const approvedListings = listings.filter((l) => l.status === "approved" || l.status === "live");

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-8">
      
      {/* Top Banner & Join Code */}
      <div className="rounded-3xl bg-gradient-to-r from-indigo-900 via-indigo-950 to-slate-900 p-6 sm:p-8 text-white shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full bg-indigo-800/60 px-3 py-1 text-xs font-semibold text-indigo-300 border border-indigo-700">
            <span>Teacher Control Panel</span>
          </div>
          <h1 className="mt-2 text-3xl sm:text-4xl font-black">{activeClassroom.className}</h1>
          <p className="text-xs text-indigo-200 mt-1">
            Teacher: {activeClassroom.teacherName} | Currency: <span className="font-bold text-amber-300">{activeClassroom.currencyName}</span> | Starting Balance: <span className="font-bold text-emerald-300">⚡ {activeClassroom.startingBalance}</span>
          </p>
        </div>

        {/* Join Code Box */}
        <div className="flex flex-col sm:flex-row items-center gap-4 bg-slate-950/80 p-4 rounded-2xl border border-indigo-700 w-full md:w-auto">
          <div>
            <span className="block text-[10px] font-extrabold uppercase tracking-widest text-indigo-300">
              Student Join Code
            </span>
            <span className="text-3xl font-black tracking-widest text-amber-400 font-mono">
              {activeClassroom.joinCode}
            </span>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-2">
            <button
              onClick={copyJoinCode}
              className="flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-xs font-bold text-white hover:bg-indigo-700 transition-colors w-full sm:w-auto justify-center"
            >
              {copiedCode ? <Check className="h-4 w-4 text-emerald-400" /> : <Copy className="h-4 w-4" />}
              <span>{copiedCode ? "Copied!" : "Copy Code"}</span>
            </button>

            <button
              onClick={handleShowQrCode}
              className="flex items-center gap-2 rounded-xl bg-amber-500 px-4 py-2.5 text-xs font-black text-slate-950 hover:bg-amber-400 transition-colors w-full sm:w-auto justify-center"
            >
              <QrCode className="h-4 w-4" />
              <span>Class QR Code 📱</span>
            </button>
          </div>
        </div>
      </div>

      {eventNotice && (
        <div className="rounded-2xl bg-amber-400/20 border-2 border-amber-400 p-4 text-xs font-bold text-amber-900 dark:text-amber-300 flex items-center justify-between shadow-lg animate-pulse">
          <div className="flex items-center gap-3">
            <Sparkles className="h-6 w-6 text-amber-500" />
            <div>
              <span className="font-black text-sm block">{eventNotice.name}</span>
              <span className="font-semibold text-xs text-slate-800 dark:text-slate-200">{eventNotice.details}</span>
            </div>
          </div>
          <button onClick={() => setEventNotice(null)} className="text-xs font-black bg-amber-400 text-slate-950 px-3 py-1 rounded-lg">Dismiss</button>
        </div>
      )}

      {/* Action Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={loadDashboardData}
            disabled={refreshing}
            className="flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-2 text-xs font-bold text-slate-700 shadow-xs hover:bg-slate-50 dark:bg-slate-900 dark:border-slate-800 dark:text-slate-200"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${refreshing ? "animate-spin" : ""}`} />
            <span>Refresh Roster</span>
          </button>

          <button
            onClick={() => setShowCompModal(true)}
            className="flex items-center gap-2 rounded-xl bg-amber-500 px-4 py-2 text-xs font-bold text-slate-950 shadow-xs hover:bg-amber-400"
          >
            <Trophy className="h-3.5 w-3.5" />
            <span>Launch Competition</span>
          </button>

          <button
            onClick={() => setShowNewClassModal(true)}
            className="flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2 text-xs font-bold text-white shadow-xs hover:bg-indigo-700"
          >
            <PlusCircle className="h-3.5 w-3.5" />
            <span>New Classroom</span>
          </button>

          <button
            onClick={() => setShowResetModal(true)}
            className="flex items-center gap-2 rounded-xl border border-rose-300 bg-rose-50 px-4 py-2 text-xs font-bold text-rose-700 shadow-xs hover:bg-rose-100 dark:bg-rose-950/40 dark:border-rose-800 dark:text-rose-300"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            <span>Reset Economy</span>
          </button>
        </div>

        {/* Quick Stats */}
        <div className="flex items-center gap-4 text-xs font-bold text-slate-600 dark:text-slate-400">
          <span>👥 {students.length} Students</span>
          <span>🛍️ {approvedListings.length} Active Listings</span>
          <span className="text-amber-600 font-bold">⏳ {pendingListings.length} Pending</span>
          <span className="text-purple-600 font-bold">🏦 {loans.filter(l => l.status === "pending").length} Loans</span>
        </div>
      </div>

      {/* MARKET EVENTS CONTROL CENTER SECTION */}
      <section className="rounded-3xl border-2 border-indigo-500 bg-gradient-to-br from-indigo-950 via-slate-950 to-purple-950 p-6 sm:p-8 text-white shadow-2xl space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-indigo-800/80 pb-4">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-amber-400/20 px-3.5 py-1 text-xs font-black text-amber-300 border border-amber-400/30">
              <Sparkles className="h-4 w-4 text-amber-400" />
              <span>Real-Time Economic Simulator</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black mt-2 tracking-tight">
              Market Events Control Center ⚡
            </h2>
            <p className="text-xs sm:text-sm text-indigo-200 mt-1 max-w-2xl">
              Click any event button to trigger atomic economy updates across all students in real time. Automatically notifies every student with instant in-app alerts!
            </p>
          </div>

          {activeClassroom.economySettings?.activeMarketEvent && (
            <div className="rounded-2xl bg-gradient-to-r from-amber-400 to-orange-500 p-3 text-slate-950 font-black text-xs shadow-lg text-center">
              <span className="block text-[9px] uppercase tracking-widest text-slate-900 opacity-80">Currently Active Event</span>
              <span className="text-sm font-extrabold">{activeClassroom.economySettings.activeMarketEvent}</span>
            </div>
          )}
        </div>

        {/* 5 Big Colorful Trigger Buttons Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          
          {/* Button 1: Inflation Week */}
          <button
            onClick={() => setEventToTrigger({ type: "inflation", name: "Inflation Week 📈" })}
            className="group relative flex flex-col justify-between p-5 rounded-3xl bg-gradient-to-br from-amber-400 via-amber-500 to-orange-600 text-slate-950 hover:scale-[1.03] active:scale-95 transition-all shadow-xl hover:shadow-amber-500/30 text-left border-2 border-amber-300"
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-3xl">📈</span>
                <TrendingUp className="h-5 w-5 text-slate-950 group-hover:translate-y-[-2px] transition-transform" />
              </div>
              <h3 className="text-lg font-black tracking-tight">Inflation Week</h3>
              <p className="text-xs font-bold text-slate-900/90 mt-1">
                Increases all listing prices by 20% temporarily.
              </p>
            </div>
            <div className="mt-4 inline-flex items-center justify-center rounded-xl bg-slate-950 px-3 py-2 text-xs font-black text-amber-300 shadow-md group-hover:bg-slate-900">
              Trigger Inflation 📈
            </div>
          </button>

          {/* Button 2: Recession */}
          <button
            onClick={() => setEventToTrigger({ type: "recession", name: "Recession 📉" })}
            className="group relative flex flex-col justify-between p-5 rounded-3xl bg-gradient-to-br from-rose-600 via-red-600 to-rose-800 text-white hover:scale-[1.03] active:scale-95 transition-all shadow-xl hover:shadow-rose-600/30 text-left border-2 border-rose-400"
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-3xl">📉</span>
                <TrendingDown className="h-5 w-5 text-white group-hover:translate-y-[2px] transition-transform" />
              </div>
              <h3 className="text-lg font-black tracking-tight">Recession</h3>
              <p className="text-xs font-bold text-rose-100 mt-1">
                Decreases all student balances by 10% due to market slowdown.
              </p>
            </div>
            <div className="mt-4 inline-flex items-center justify-center rounded-xl bg-black/40 px-3 py-2 text-xs font-black text-white shadow-md group-hover:bg-black/60">
              Trigger Recession 📉
            </div>
          </button>

          {/* Button 3: Tax Day */}
          <button
            onClick={() => setEventToTrigger({ type: "taxday", name: "Tax Day 🏛️" })}
            className="group relative flex flex-col justify-between p-5 rounded-3xl bg-gradient-to-br from-purple-600 via-indigo-600 to-purple-800 text-white hover:scale-[1.03] active:scale-95 transition-all shadow-xl hover:shadow-purple-600/30 text-left border-2 border-purple-400"
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-3xl">🏛️</span>
                <Building2 className="h-5 w-5 text-purple-200" />
              </div>
              <h3 className="text-lg font-black tracking-tight">Tax Day</h3>
              <p className="text-xs font-bold text-purple-100 mt-1">
                Collects 10% tax from all student wallet balances.
              </p>
            </div>
            <div className="mt-4 inline-flex items-center justify-center rounded-xl bg-black/40 px-3 py-2 text-xs font-black text-white shadow-md group-hover:bg-black/60">
              Collect Taxes 🏛️
            </div>
          </button>

          {/* Button 4: Bonus Payday */}
          <button
            onClick={() => setEventToTrigger({ type: "bonuspayday", name: "Bonus Payday 🎉" })}
            className="group relative flex flex-col justify-between p-5 rounded-3xl bg-gradient-to-br from-emerald-500 via-teal-600 to-emerald-700 text-white hover:scale-[1.03] active:scale-95 transition-all shadow-xl hover:shadow-emerald-500/30 text-left border-2 border-emerald-300"
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-3xl">🎉</span>
                <Gift className="h-5 w-5 text-emerald-200" />
              </div>
              <h3 className="text-lg font-black tracking-tight">Bonus Payday</h3>
              <p className="text-xs font-bold text-emerald-100 mt-1">
                Awards +50 SparkCoins bonus to every student!
              </p>
            </div>
            <div className="mt-4 inline-flex items-center justify-center rounded-xl bg-black/40 px-3 py-2 text-xs font-black text-white shadow-md group-hover:bg-black/60">
              Give +50 Bonus 🎉
            </div>
          </button>

          {/* Button 5: Double Earnings */}
          <button
            onClick={() => setEventToTrigger({ type: "doubleearnings", name: "Double Earnings Week ⚡" })}
            className="group relative flex flex-col justify-between p-5 rounded-3xl bg-gradient-to-br from-indigo-500 via-sky-600 to-blue-700 text-white hover:scale-[1.03] active:scale-95 transition-all shadow-xl hover:shadow-indigo-500/30 text-left border-2 border-sky-300"
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-3xl">⚡⚡</span>
                <Zap className="h-5 w-5 text-amber-300" />
              </div>
              <h3 className="text-lg font-black tracking-tight">Double Earnings</h3>
              <p className="text-xs font-bold text-sky-100 mt-1">
                Toggles 2x seller payouts on all marketplace sales.
              </p>
            </div>
            <div className="mt-4 inline-flex items-center justify-center rounded-xl bg-black/40 px-3 py-2 text-xs font-black text-white shadow-md group-hover:bg-black/60">
              Toggle 2x Earnings ⚡
            </div>
          </button>

        </div>
      </section>

      {/* Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: Student Roster & Product Queues */}
        <div className="lg:col-span-8 space-y-8">
          
          {/* Pending Approval Queue */}
          <div className="rounded-3xl border border-amber-200 bg-amber-50/50 p-6 dark:bg-slate-900 dark:border-amber-900/40">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <ShieldAlert className="h-5 w-5 text-amber-600" />
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                  Pending Product Approvals ({pendingListings.length})
                </h3>
              </div>
            </div>

            {pendingListings.length === 0 ? (
              <p className="text-xs text-slate-500 italic">No pending listings awaiting teacher review.</p>
            ) : (
              <div className="space-y-3">
                {pendingListings.map((item) => (
                  <div
                    key={item.id}
                    className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 rounded-2xl bg-white p-4 border border-amber-200 shadow-xs dark:bg-slate-950 dark:border-slate-800"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xl">{item.logoUrl || "📦"}</span>
                        <h4 className="font-bold text-slate-900 dark:text-white">{item.hustleName}</h4>
                        <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-bold text-amber-800">
                          ⚡ {item.price} {activeClassroom.currencyName}
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">{item.description}</p>
                      {item.aiGeneratedCopy && (
                        <p className="text-[11px] text-indigo-600 dark:text-indigo-400 italic mt-0.5">
                          "{item.aiGeneratedCopy}"
                        </p>
                      )}
                      <span className="text-[10px] text-slate-400">By Student: {item.studentUsername || item.studentId}</span>
                    </div>

                    <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                      <button
                        onClick={() => setApproveListingItem(item)}
                        className="flex items-center gap-1 rounded-xl bg-emerald-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-emerald-700"
                      >
                        <CheckCircle className="h-3.5 w-3.5" />
                        <span>Approve</span>
                      </button>
                      <button
                        onClick={() => {
                          setRejectListingItem(item);
                          setRejectReason("");
                        }}
                        className="flex items-center gap-1 rounded-xl bg-red-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-red-700"
                      >
                        <XCircle className="h-3.5 w-3.5" />
                        <span>Reject</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* APPROVED PRODUCTS & TEACHER REMOVE LISTING SECTION */}
          <div className="rounded-3xl border border-indigo-200 bg-white p-6 dark:bg-slate-900 dark:border-indigo-900/40 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Store className="h-5 w-5 text-indigo-600" />
                Live Marketplace Listings ({approvedListings.length})
              </h3>
            </div>

            {approvedListings.length === 0 ? (
              <p className="text-xs text-slate-500 italic py-2">No active marketplace listings live right now.</p>
            ) : (
              <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
                {approvedListings.map((item) => (
                  <div
                    key={item.id}
                    className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 rounded-2xl bg-slate-50 p-4 border border-slate-200 dark:bg-slate-800 dark:border-slate-700"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-2xl">{item.logoUrl || "🎨"}</span>
                        <h4 className="font-bold text-slate-900 dark:text-white">{item.hustleName}</h4>
                        <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-black text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                          ⚡ {item.price} SparkCoins
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">{item.description}</p>
                      <div className="flex items-center gap-3 text-[10px] text-slate-500 mt-1">
                        <span>By: <strong>{item.studentUsername || item.studentId}</strong></span>
                        <span>Shop Fee 🏪: ⚡ {item.cost || 5}</span>
                      </div>
                    </div>

                    {/* REMOVE LISTING BUTTON */}
                    <button
                      onClick={() => {
                        setRemoveListingItem(item);
                        setRemoveReason("");
                      }}
                      className="flex items-center gap-1.5 rounded-xl bg-rose-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-rose-700 transition-colors shrink-0"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      <span>Remove Listing 🗑️</span>
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Student Report Cards Table */}
          <div className="rounded-3xl border border-slate-200 bg-white p-6 dark:bg-slate-900 dark:border-slate-800 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <FileText className="h-5 w-5 text-indigo-600" />
                Student Report Cards ({students.length})
              </h3>
            </div>

            {students.length === 0 ? (
              <p className="text-xs text-slate-500 py-4 text-center">No students registered in this class code yet.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="border-b border-slate-200 text-slate-500 dark:border-slate-800">
                    <tr>
                      <th className="py-3 px-2 font-bold">Student</th>
                      <th className="py-3 px-2 font-bold">PIN</th>
                      <th className="py-3 px-2 font-bold">Balance</th>
                      <th className="py-3 px-2 font-bold">Total Sales 🛍️</th>
                      <th className="py-3 px-2 font-bold">Money You Kept 💰</th>
                      <th className="py-3 px-2 font-bold">Score</th>
                      <th className="py-3 px-2 font-bold">Tier</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {students.map((s) => (
                      <tr key={s.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                        <td className="py-3 px-2 font-bold flex items-center gap-2">
                          <span className="text-lg">{s.avatar || "🚀"}</span>
                          <span>{s.username}</span>
                        </td>
                        <td className="py-3 px-2 font-mono font-bold text-purple-600 dark:text-purple-400">
                          {s.pin || "••••"}
                        </td>
                        <td className="py-3 px-2 font-black text-emerald-600 dark:text-emerald-400">
                          ⚡ {s.balance}
                        </td>
                        <td className="py-3 px-2 font-semibold text-slate-600 dark:text-slate-300">
                          ⚡ {s.totalEarned || 0}
                        </td>
                        <td className="py-3 px-2 font-bold text-teal-600 dark:text-teal-400">
                          ⚡ {s.profit || 0}
                        </td>
                        <td className="py-3 px-2 font-bold text-purple-600 dark:text-purple-400">
                          ⭐ {s.hustleScore || 100}
                        </td>
                        <td className="py-3 px-2">
                          <span className="rounded-full bg-slate-100 px-2.5 py-0.5 font-bold text-[10px] dark:bg-slate-800">
                            {s.tier || "Starter"}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Loan Approval & Repayment Queue */}
          <div className="rounded-3xl border border-purple-200 bg-purple-50/50 p-6 dark:bg-slate-900 dark:border-purple-900/40 space-y-4">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Building2 className="h-5 w-5 text-purple-600" />
              Student Micro-Loans ({loans.length})
            </h3>

            {loans.length === 0 ? (
              <p className="text-xs text-slate-500 italic">No loan requests submitted yet.</p>
            ) : (
              <div className="space-y-3">
                {loans.map((loan) => (
                  <div
                    key={loan.id}
                    className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 rounded-2xl bg-white p-4 border border-purple-200 shadow-xs dark:bg-slate-950 dark:border-slate-800"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900 dark:text-white">{loan.studentName}</span>
                        <span className="rounded-full bg-purple-100 px-2 py-0.5 text-[10px] font-bold text-purple-800">
                          Amount: ⚡ {loan.amount}
                        </span>
                        <span className="text-[10px] text-slate-500">(Due +10%: ⚡ {loan.totalDue})</span>
                      </div>
                      <span className="text-[10px] text-slate-400 block mt-1">Status: {loan.status}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      {loan.status === "pending" && (
                        <>
                          <button
                            onClick={() => setApproveLoanItem(loan)}
                            className="rounded-xl bg-emerald-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-emerald-700"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => setRejectLoanItem(loan)}
                            className="rounded-xl bg-red-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-red-700"
                          >
                            Reject
                          </button>
                        </>
                      )}
                      {loan.status === "approved" && (
                        <button
                          onClick={() => handleRepayLoan(loan.id)}
                          className="rounded-xl bg-indigo-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-indigo-700"
                        >
                          Mark Repaid
                        </button>
                      )}
                      {loan.status === "repaid" && (
                        <span className="text-xs font-bold text-emerald-600">✓ Repaid</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>

        {/* Right Column: Live Transaction Feed & Competitions */}
        <div className="lg:col-span-4 space-y-8">
          
          {/* Live Transaction Feed */}
          <div className="rounded-3xl border border-slate-200 bg-white p-6 dark:bg-slate-900 dark:border-slate-800 shadow-sm space-y-4">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Activity className="h-5 w-5 text-emerald-500" />
              Live Marketplace Activity Feed
            </h3>

            {transactions.length === 0 ? (
              <p className="text-xs text-slate-500 italic py-4 text-center">No marketplace sales recorded yet.</p>
            ) : (
              <div className="space-y-2 max-h-72 overflow-y-auto">
                {transactions.slice(0, 10).map((tx) => (
                  <div key={tx.id} className="p-3 rounded-2xl bg-slate-50 border border-slate-200 dark:bg-slate-800 dark:border-slate-700 text-xs space-y-1">
                    <div className="flex items-center justify-between font-bold">
                      <span className="text-indigo-600 dark:text-indigo-400">{tx.buyerName}</span>
                      <span className="text-emerald-600 font-black">⚡ {tx.amount}</span>
                    </div>
                    <p className="text-slate-600 dark:text-slate-300">Purchased "{tx.listingName}" from {tx.sellerName}</p>
                    <span className="text-[9px] text-slate-400 block">
                      {new Date(tx.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Active Competitions */}
          <div className="rounded-3xl border border-amber-200 bg-amber-50/50 p-6 dark:bg-slate-900 dark:border-amber-900/40 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Trophy className="h-5 w-5 text-amber-500" />
                Active Competitions ({competitions.length})
              </h3>
            </div>

            {competitions.length === 0 ? (
              <p className="text-xs text-slate-500 italic">No active competitions currently running.</p>
            ) : (
              <div className="space-y-3">
                {competitions.map((comp) => (
                  <div key={comp.id} className="p-3.5 rounded-2xl bg-white border border-amber-200 dark:bg-slate-950 dark:border-slate-800 text-xs space-y-1">
                    <span className="font-extrabold text-slate-900 dark:text-white block">{comp.title}</span>
                    <span className="text-indigo-600 font-bold block">{comp.type}</span>
                    <p className="text-slate-500 text-[11px]">{comp.description}</p>
                    <span className="text-emerald-600 font-black block pt-1">Prize: {comp.prizeDescription}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>

      </div>

      {/* ========================================================================= */}
      {/* ALL 8 TEACHER CONFIRMATION DIALOG MODALS                                  */}
      {/* ========================================================================= */}

      {/* 1. APPROVE LISTING MODAL */}
      {approveListingItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white p-6 rounded-3xl border-2 border-emerald-500 shadow-2xl dark:bg-slate-900 dark:border-emerald-600 space-y-5 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-100 text-3xl">
              ✅
            </div>
            <h3 className="text-xl font-black text-slate-900 dark:text-white">Approve Listing?</h3>
            <p className="text-xs font-bold text-slate-700 dark:text-slate-300 leading-relaxed">
              Approve <strong>{approveListingItem.hustleName}</strong> by <strong>{approveListingItem.studentUsername}</strong>? This will make it live in the marketplace for all students to buy.
            </p>

            <div className="flex justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setApproveListingItem(null)}
                className="rounded-xl border border-slate-300 px-5 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-100"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={approvingListing}
                onClick={executeApproveListing}
                className="rounded-xl bg-emerald-600 px-5 py-2.5 text-xs font-black text-white hover:bg-emerald-700 shadow-md disabled:opacity-50"
              >
                {approvingListing ? "Approving..." : "Yes, Approve! ✅"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 2. REJECT LISTING MODAL */}
      {rejectListingItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white p-6 rounded-3xl border-2 border-red-500 shadow-2xl dark:bg-slate-900 dark:border-red-600 space-y-4">
            <div className="flex items-center gap-3 border-b border-slate-200 dark:border-slate-800 pb-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-red-100 text-red-600 text-xl">
                ❌
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">Reject Listing?</h3>
                <span className="text-xs font-semibold text-red-600 dark:text-red-400">Teacher Action</span>
              </div>
            </div>

            <p className="text-xs font-bold text-slate-700 dark:text-slate-300 leading-relaxed">
              Reject <strong>{rejectListingItem.hustleName}</strong>? The student will be notified and can make changes.
            </p>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">
                Reason for rejection (Required):
              </label>
              <input
                type="text"
                required
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="e.g. Please clarify your service description or adjust price"
                className="w-full rounded-xl border border-slate-300 p-2.5 text-xs dark:bg-slate-800 dark:border-slate-700 font-semibold"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setRejectListingItem(null)}
                className="rounded-xl border border-slate-300 px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={rejectingListing || !rejectReason.trim()}
                onClick={executeRejectListing}
                className="rounded-xl bg-red-600 px-4 py-2 text-xs font-black text-white hover:bg-red-700 shadow-md disabled:opacity-50"
              >
                {rejectingListing ? "Rejecting..." : "Yes, Reject"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 3. REMOVE APPROVED LISTING MODAL */}
      {removeListingItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white p-6 rounded-3xl border-2 border-rose-500 shadow-2xl dark:bg-slate-900 dark:border-rose-600 space-y-4">
            <div className="flex items-center gap-3 border-b border-slate-200 dark:border-slate-800 pb-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-rose-100 text-rose-600 text-xl">
                🗑️
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">Remove Listing from Marketplace?</h3>
                <span className="text-xs font-semibold text-rose-600 dark:text-rose-400">Teacher Control</span>
              </div>
            </div>

            <p className="text-xs font-bold text-slate-700 dark:text-slate-300 leading-relaxed">
              Remove <strong>{removeListingItem.hustleName}</strong> from the marketplace? The student will be notified.
            </p>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">
                Reason for removal (Required):
              </label>
              <input
                type="text"
                required
                value={removeReason}
                onChange={(e) => setRemoveReason(e.target.value)}
                placeholder="e.g. Inappropriate content or price correction"
                className="w-full rounded-xl border border-slate-300 p-2.5 text-xs dark:bg-slate-800 dark:border-slate-700 font-semibold"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setRemoveListingItem(null)}
                className="rounded-xl border border-slate-300 px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={removing || !removeReason.trim()}
                onClick={executeRemoveListing}
                className="rounded-xl bg-rose-600 px-4 py-2 text-xs font-black text-white hover:bg-rose-700 shadow-md disabled:opacity-50"
              >
                {removing ? "Removing..." : "Remove Listing ❌"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 4. TRIGGER MARKET EVENT MODAL */}
      {eventToTrigger && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white p-6 rounded-3xl border-2 border-indigo-500 shadow-2xl dark:bg-slate-900 dark:border-indigo-600 space-y-5 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-100 text-3xl">
              ⚡
            </div>
            <h3 className="text-xl font-black text-slate-900 dark:text-white">Trigger Market Event?</h3>
            <p className="text-xs font-bold text-slate-700 dark:text-slate-300 leading-relaxed">
              Trigger <strong>{eventToTrigger.name}</strong>? This will affect ALL students in your classroom immediately!
            </p>

            <div className="flex justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setEventToTrigger(null)}
                className="rounded-xl border border-slate-300 px-5 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-100"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={triggeringEvent !== null}
                onClick={executeTriggerMarketEvent}
                className="rounded-xl bg-indigo-600 px-5 py-2.5 text-xs font-black text-white hover:bg-indigo-700 shadow-md disabled:opacity-50"
              >
                {triggeringEvent !== null ? "Triggering..." : "Yes, Trigger It! ⚡"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 5. RESET ECONOMY MODAL */}
      {showResetModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white p-6 rounded-3xl border-2 border-rose-500 shadow-2xl dark:bg-slate-900 dark:border-rose-600 space-y-5 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-rose-100 text-rose-600 text-3xl">
              ⚠️
            </div>
            <h3 className="text-2xl font-black text-slate-900 dark:text-white">RESET ALL BALANCES?</h3>
            <p className="text-xs font-bold text-slate-700 dark:text-slate-300 leading-relaxed">
              RESET ALL BALANCES? Every student will go back to their starting balance. This CANNOT be undone!
            </p>

            <div className="flex justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowResetModal(false)}
                className="rounded-xl border border-slate-300 px-5 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-100"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={resetting}
                onClick={executeResetEconomy}
                className="rounded-xl bg-rose-600 px-6 py-3 text-xs font-black text-white hover:bg-rose-700 shadow-lg disabled:opacity-50 uppercase tracking-wider"
              >
                {resetting ? "Resetting..." : "Yes, Reset Everything ⚠️"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 6. APPROVE LOAN MODAL */}
      {approveLoanItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white p-6 rounded-3xl border-2 border-emerald-500 shadow-2xl dark:bg-slate-900 dark:border-emerald-600 space-y-5 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-100 text-3xl">
              🏦
            </div>
            <h3 className="text-xl font-black text-slate-900 dark:text-white">Approve Student Loan?</h3>
            <p className="text-xs font-bold text-slate-700 dark:text-slate-300 leading-relaxed">
              Approve loan of <strong>{approveLoanItem.amount} SparkCoins</strong> for <strong>{approveLoanItem.studentName}</strong>? The SparkCoins will be added to their wallet immediately.
            </p>

            <div className="flex justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setApproveLoanItem(null)}
                className="rounded-xl border border-slate-300 px-5 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-100"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={approvingLoan}
                onClick={executeApproveLoan}
                className="rounded-xl bg-emerald-600 px-5 py-2.5 text-xs font-black text-white hover:bg-emerald-700 shadow-md disabled:opacity-50"
              >
                {approvingLoan ? "Approving..." : "Yes, Approve Loan ✅"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 7. REJECT LOAN MODAL */}
      {rejectLoanItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white p-6 rounded-3xl border-2 border-red-500 shadow-2xl dark:bg-slate-900 dark:border-red-600 space-y-5 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-red-100 text-3xl">
              ❌
            </div>
            <h3 className="text-xl font-black text-slate-900 dark:text-white">Reject Loan Request?</h3>
            <p className="text-xs font-bold text-slate-700 dark:text-slate-300 leading-relaxed">
              Reject loan request from <strong>{rejectLoanItem.studentName}</strong>?
            </p>

            <div className="flex justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setRejectLoanItem(null)}
                className="rounded-xl border border-slate-300 px-5 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-100"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={rejectingLoan}
                onClick={executeRejectLoan}
                className="rounded-xl bg-red-600 px-5 py-2.5 text-xs font-black text-white hover:bg-red-700 shadow-md disabled:opacity-50"
              >
                {rejectingLoan ? "Rejecting..." : "Yes, Reject"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 8. LAUNCH COMPETITION MODAL & FORM */}
      {showCompModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white p-6 rounded-3xl border-2 border-amber-400 shadow-2xl dark:bg-slate-900 dark:border-amber-500 space-y-4">
            <h3 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Trophy className="h-5 w-5 text-amber-500" />
              Launch Classroom Competition
            </h3>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                setShowCompConfirmModal(true);
              }}
              className="space-y-4"
            >
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">Competition Type</label>
                <select
                  value={compType}
                  onChange={(e) => setCompType(e.target.value as CompetitionType)}
                  className="w-full rounded-xl border border-slate-300 p-2.5 text-xs dark:bg-slate-800 dark:border-slate-700 font-semibold"
                >
                  <option value="Most Earned">Most Earned</option>
                  <option value="Fastest First Sale">Fastest First Sale</option>
                  <option value="Highest Profit Margin">Highest Profit Margin</option>
                  <option value="Best Customer Rating">Best Customer Rating</option>
                  <option value="Most Improved">Most Improved</option>
                  <option value="Best Pivot">Best Pivot</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">Title</label>
                <input
                  type="text"
                  required
                  value={compTitle}
                  onChange={(e) => setCompTitle(e.target.value)}
                  placeholder="e.g. Week 1 Revenue Sprint"
                  className="w-full rounded-xl border border-slate-300 p-2.5 text-xs dark:bg-slate-800 dark:border-slate-700 font-semibold"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">Prize Description</label>
                <input
                  type="text"
                  required
                  value={compPrize}
                  onChange={(e) => setCompPrize(e.target.value)}
                  placeholder="e.g. +50 SparkCoins & Homework Pass"
                  className="w-full rounded-xl border border-slate-300 p-2.5 text-xs dark:bg-slate-800 dark:border-slate-700 font-semibold"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCompModal(false)}
                  className="rounded-xl border border-slate-300 px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-amber-400 px-5 py-2 text-xs font-black text-slate-950 hover:bg-amber-300 shadow-md"
                >
                  Continue
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CONFIRMATION STEP FOR LAUNCHING COMPETITION */}
      {showCompConfirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white p-6 rounded-3xl border-2 border-amber-400 shadow-2xl dark:bg-slate-900 dark:border-amber-500 space-y-5 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-100 text-3xl">
              🏆
            </div>
            <h3 className="text-xl font-black text-slate-900 dark:text-white">Launch Competition?</h3>
            <p className="text-xs font-bold text-slate-700 dark:text-slate-300 leading-relaxed">
              Launch <strong>{compTitle}</strong>? All students will be notified immediately.
            </p>

            <div className="flex justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowCompConfirmModal(false)}
                className="rounded-xl border border-slate-300 px-5 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-100"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={launchingComp}
                onClick={executeLaunchCompetition}
                className="rounded-xl bg-amber-400 px-5 py-2.5 text-xs font-black text-slate-950 hover:bg-amber-300 shadow-md disabled:opacity-50"
              >
                {launchingComp ? "Launching..." : "Yes, Launch! 🏆"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* New Classroom Modal */}
      {showNewClassModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white p-6 rounded-3xl border border-slate-200 shadow-2xl dark:bg-slate-900 dark:border-slate-800 space-y-4">
            <h3 className="text-xl font-bold text-slate-900 dark:text-white">Create Additional Classroom</h3>
            <form onSubmit={handleCreateNewClassroom} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">Classroom Name</label>
                <input
                  type="text"
                  required
                  value={newClassName}
                  onChange={(e) => setNewClassName(e.target.value)}
                  placeholder="e.g. Period 4 Social Studies"
                  className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm dark:bg-slate-800 dark:border-slate-700"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">Currency Name</label>
                <input
                  type="text"
                  required
                  value={newCurrencyName}
                  onChange={(e) => setNewCurrencyName(e.target.value)}
                  placeholder="e.g. SparkCoins"
                  className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm dark:bg-slate-800 dark:border-slate-700"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">Starting Student Balance</label>
                <input
                  type="number"
                  required
                  min={10}
                  max={1000}
                  value={newStartingBalance}
                  onChange={(e) => setNewStartingBalance(Number(e.target.value))}
                  className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm dark:bg-slate-800 dark:border-slate-700"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowNewClassModal(false)}
                  className="rounded-xl border border-slate-300 px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creatingClass}
                  className="rounded-xl bg-indigo-600 px-4 py-2 text-xs font-bold text-white hover:bg-indigo-700 disabled:opacity-50"
                >
                  {creatingClass ? "Creating..." : "Create Class"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CLASSROOM QR CODE MODAL */}
      {showQrModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-xs">
          <div className="w-full max-w-sm bg-white p-6 rounded-3xl border-2 border-amber-400 shadow-2xl dark:bg-slate-900 text-center space-y-4">
            <h3 className="text-xl font-black text-slate-900 dark:text-white">
              Student Join QR Code 📱
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-300">
              Display on your projector or print for students! Scanning opens the join portal with class code <strong>{activeClassroom.joinCode}</strong> pre-filled.
            </p>

            {qrDataUrl && (
              <div className="bg-white p-4 rounded-2xl inline-block border-2 border-slate-200 shadow-md">
                <img src={qrDataUrl} alt="Classroom Join QR Code" className="h-56 w-56 mx-auto" />
              </div>
            )}

            <div className="pt-2">
              <button
                type="button"
                onClick={() => setShowQrModal(false)}
                className="w-full rounded-2xl bg-indigo-600 py-3 text-xs font-black text-white hover:bg-indigo-700 shadow-md"
              >
                Close QR Code
              </button>
            </div>
          </div>
        </div>
      )}

      <SlowToast isLoading={refreshing || resetting || approvingListing || rejectingListing || removing} operationName="Classroom Operation" />

    </div>
  );
}
