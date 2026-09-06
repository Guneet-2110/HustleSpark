"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import {
  getClassroomListings,
  getStudentsInClassroom,
  subscribeToNotifications,
  getClassroomCompetitions,
  getClassroomLoans,
  requestLoan,
} from "@/lib/classroom";
import { Listing, Student, Competition, Loan, PivotReport, NotificationDoc } from "@/types";
import {
  Sparkles,
  Store,
  Trophy,
  PlusCircle,
  Building2,
  Lightbulb,
  CheckSquare,
  Square,
  X
} from "lucide-react";

export default function StudentDashboard() {
  const router = useRouter();
  const { user, role, studentProfile, activeClassroom, loading, refreshStudentProfile } = useAuth();

  const [myListings, setMyListings] = useState<Listing[]>([]);
  const [topStudents, setTopStudents] = useState<Student[]>([]);
  const [notifications, setNotifications] = useState<NotificationDoc[]>([]);
  const [competitions, setCompetitions] = useState<Competition[]>([]);
  const [myLoans, setMyLoans] = useState<Loan[]>([]);

  // Loan Request Form State
  const [loanAmount, setLoanAmount] = useState(50);
  const [requestingLoan, setRequestingLoan] = useState(false);
  const [loanMsg, setLoanMsg] = useState("");
  const [showLoanConfirmModal, setShowLoanConfirmModal] = useState(false);

  // Pivot Report State
  const [pivotReport, setPivotReport] = useState<PivotReport | null>(null);
  const [checkedSuggestions, setCheckedSuggestions] = useState<boolean[]>([false, false, false]);
  const [dismissedPivotIds, setDismissedPivotIds] = useState<string[]>([]);

  useEffect(() => {
    if (!loading && role !== "student") {
      router.push("/join");
    }
  }, [loading, role, router]);

  useEffect(() => {
    let unsub: () => void;
    if (activeClassroom && user) {
      loadStudentData();
      unsub = subscribeToNotifications(activeClassroom.id, user.uid, (notifs) => {
        setNotifications(notifs);
      });
    }
    return () => {
      if (unsub) unsub();
    };
  }, [activeClassroom, user]);

  const loadStudentData = async () => {
    if (!activeClassroom || !user) return;
    try {
      await refreshStudentProfile();
      const allListings = await getClassroomListings(activeClassroom.id);
      const userListings = allListings.filter((l) => l.studentId === user.uid);
      setMyListings(userListings);

      const students = await getStudentsInClassroom(activeClassroom.id);
      students.sort((a, b) => b.balance - a.balance);
      setTopStudents(students.slice(0, 5));

      const comps = await getClassroomCompetitions(activeClassroom.id);
      setCompetitions(comps.filter((c) => c.active));

      const loans = await getClassroomLoans(activeClassroom.id);
      setMyLoans(loans.filter((l) => l.studentId === user.uid));

      // Check all approved listings for 7+ days with zero sales
      const zeroSalesListing = userListings.find((l) => {
        if (l.status !== "approved" && l.status !== "live") return false;
        const daysOld = (Date.now() - new Date(l.createdAt).getTime()) / (1000 * 60 * 60 * 24);
        const hasZeroSales = !l.reviewCount || l.reviewCount === 0;
        return (daysOld >= 7 || hasZeroSales) && !dismissedPivotIds.includes(l.id);
      });

      if (zeroSalesListing && (!pivotReport || pivotReport.listingId !== zeroSalesListing.id)) {
        fetchPivotReport(zeroSalesListing);
      }
    } catch (err) {
      console.error("Student Dashboard Load Error:", err);
    }
  };

  const fetchPivotReport = async (listing: Listing) => {
    try {
      const res = await fetch("https://us-central1-hustlespark-edu.cloudfunctions.net/generatePivotReport", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          listingName: listing.hustleName,
          description: listing.description,
          category: listing.category || "Services",
        }),
      });
      const data = await res.json();
      if (data.analysis) {
        setPivotReport({
          id: listing.id,
          listingId: listing.id,
          listingName: listing.hustleName,
          analysis: data.analysis,
          suggestions: data.suggestions || [
            "Lower your price by 5 SparkCoins for a 1-week launch sale!",
            "Add a free 5-minute trial session so classmates can test your service.",
            "Update your logo emoji and write a fun sales pitch slogan!"
          ],
          createdAt: new Date().toISOString(),
        });
        setCheckedSuggestions([false, false, false]);
      }
    } catch (e) {
      console.error("Failed to generate pivot report:", e);
    }
  };

  const handleToggleSuggestion = (index: number) => {
    const updated = [...checkedSuggestions];
    updated[index] = !updated[index];
    setCheckedSuggestions(updated);

    // If all 3 suggestions are checked off, automatically dismiss the pivot report!
    if (updated.every((val) => val === true) && pivotReport) {
      setTimeout(() => {
        dismissCurrentPivotReport();
      }, 800);
    }
  };

  const dismissCurrentPivotReport = () => {
    if (pivotReport) {
      setDismissedPivotIds((prev) => [...prev, pivotReport.listingId]);
      setPivotReport(null);
    }
  };

  const handleOpenLoanModal = (e: React.FormEvent) => {
    e.preventDefault();
    setLoanMsg("");
    setShowLoanConfirmModal(true);
  };

  const executeRequestLoan = async () => {
    if (!studentProfile || !activeClassroom) return;
    setRequestingLoan(true);
    setLoanMsg("");

    try {
      await requestLoan(activeClassroom.id, studentProfile.id, studentProfile.username, Number(loanAmount));
      setLoanMsg(`Loan request for ⚡ ${loanAmount} SparkCoins submitted to teacher!`);
      setShowLoanConfirmModal(false);
      loadStudentData();
    } catch (err: any) {
      setLoanMsg(err.message || "Failed to submit loan request.");
      setShowLoanConfirmModal(false);
    } finally {
      setRequestingLoan(false);
    }
  };

  if (loading || !studentProfile || !activeClassroom) {
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center p-6 space-y-4">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-amber-500" />
        <p className="text-sm font-semibold text-slate-600">Restoring Student Session...</p>
      </div>
    );
  }

  const latestNotif = notifications.find((n) => !n.isRead);

  // Gamified Hustle Score calculation
  const score = studentProfile.hustleScore || 100;
  const tier = studentProfile.tier || "Starter";
  const tierEmoji =
    tier === "Top Entrepreneur" ? "💎" : tier === "Pro Hustler" ? "🥇" : tier === "Rising Hustler" ? "🥈" : "🥉";
  const tierBg =
    tier === "Top Entrepreneur"
      ? "bg-purple-100 text-purple-900 border-purple-300"
      : tier === "Pro Hustler"
      ? "bg-amber-100 text-amber-900 border-amber-300"
      : tier === "Rising Hustler"
      ? "bg-slate-200 text-slate-900 border-slate-300"
      : "bg-orange-100 text-orange-900 border-orange-300";

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-8">
      
      {/* Top Banner */}
      <div className="rounded-3xl bg-gradient-to-r from-amber-400 via-orange-400 to-amber-500 p-6 sm:p-8 text-slate-950 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative overflow-hidden border-2 border-amber-300">
        <div className="space-y-2 relative z-10">
          <div className="inline-flex items-center gap-2 rounded-full bg-slate-950/10 px-3.5 py-1 text-xs font-black text-slate-950 border border-slate-950/20">
            <span>Classroom: {activeClassroom.className}</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black flex items-center gap-3">
            <span>{studentProfile.avatar || "🚀"}</span>
            <span>Welcome, {studentProfile.username}!</span>
          </h1>
          <div className="flex items-center gap-2 pt-1">
            <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-black border ${tierBg}`}>
              <span>{tierEmoji}</span>
              <span>{tier}</span>
            </span>
            <span className="text-xs font-bold text-slate-900">
              Score: <strong>{score} / 1000 pts</strong>
            </span>
          </div>
        </div>

        {/* Big Balance Box */}
        <div className="relative z-10 bg-slate-950 p-6 rounded-3xl text-white shadow-xl w-full md:w-auto text-center border-2 border-amber-300">
          <span className="block text-[10px] font-extrabold uppercase tracking-widest text-amber-300">
            Your Wallet Balance
          </span>
          <span className="text-4xl font-black text-emerald-400 font-mono tracking-tight">
            ⚡ {studentProfile.balance}
          </span>
          <span className="block text-[11px] font-bold text-slate-400 mt-1">
            {activeClassroom.currencyName || "SparkCoins"}
          </span>
        </div>
      </div>

      {/* AI PIVOT REPORT CARD FEATURE */}
      {pivotReport && (
        <div className="rounded-3xl bg-gradient-to-r from-purple-900 via-indigo-950 to-slate-950 p-6 sm:p-8 text-white border-2 border-purple-400 shadow-2xl space-y-4 relative overflow-hidden">
          <div className="flex items-center justify-between border-b border-purple-800/80 pb-3">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-amber-400 text-slate-950 font-bold text-xl shadow-md">
                💡
              </div>
              <div>
                <h3 className="text-2xl font-black text-amber-300">Time to Switch Things Up! 💡</h3>
                <span className="text-xs font-semibold text-purple-200">Hustle: {pivotReport.listingName}</span>
              </div>
            </div>

            <button
              onClick={dismissCurrentPivotReport}
              className="flex items-center gap-1 rounded-xl bg-purple-900 px-3 py-1.5 text-xs font-bold text-purple-200 hover:bg-purple-800 border border-purple-700 transition-colors"
            >
              <X className="h-4 w-4" />
              <span>Dismiss Report</span>
            </button>
          </div>

          <p className="text-xs sm:text-sm font-medium text-slate-200 leading-relaxed">
            {pivotReport.analysis}
          </p>

          <div className="space-y-2 pt-1">
            <span className="block text-xs font-black text-amber-300 uppercase tracking-wider">
              3 Pivot Suggestions (Check them off as you try them!):
            </span>

            <div className="space-y-2">
              {pivotReport.suggestions.map((sug, idx) => (
                <div
                  key={idx}
                  onClick={() => handleToggleSuggestion(idx)}
                  className={`flex items-start gap-3 p-3 rounded-2xl border cursor-pointer transition-all ${
                    checkedSuggestions[idx]
                      ? "bg-emerald-950/60 border-emerald-500 text-emerald-200 line-through opacity-80"
                      : "bg-purple-900/40 border-purple-700 text-slate-100 hover:bg-purple-900/70"
                  }`}
                >
                  <button className="mt-0.5 shrink-0">
                    {checkedSuggestions[idx] ? (
                      <CheckSquare className="h-5 w-5 text-emerald-400" />
                    ) : (
                      <Square className="h-5 w-5 text-purple-300" />
                    )}
                  </button>
                  <span className="text-xs font-bold leading-normal">
                    <strong className="text-amber-400 font-extrabold mr-1">#{idx + 1}</strong>
                    {sug}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Encouraging Footer */}
          <div className="rounded-2xl bg-amber-400/20 p-3 border border-amber-400/40 text-center">
            <span className="text-xs font-black text-amber-300">
              Every great entrepreneur pivots! Let's make your hustle even better 🚀
            </span>
          </div>
        </div>
      )}

      {/* Market Event Notification Banner */}
      {latestNotif && (
        <div
          className={`rounded-3xl p-5 border-2 shadow-lg flex items-start justify-between gap-4 ${
            latestNotif.eventType === "bonuspayday"
              ? "bg-gradient-to-r from-emerald-500 to-teal-600 text-white border-emerald-300"
              : latestNotif.eventType === "recession"
              ? "bg-gradient-to-r from-rose-600 to-red-700 text-white border-rose-400"
              : latestNotif.eventType === "taxday"
              ? "bg-gradient-to-r from-purple-600 to-indigo-700 text-white border-purple-400"
              : latestNotif.eventType === "inflation"
              ? "bg-gradient-to-r from-amber-500 to-orange-600 text-slate-950 border-amber-300"
              : "bg-gradient-to-r from-indigo-600 to-purple-600 text-white border-indigo-400"
          }`}
        >
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-black/20 text-2xl">
              {latestNotif.eventType === "bonuspayday"
                ? "🎉"
                : latestNotif.eventType === "recession"
                ? "📉"
                : latestNotif.eventType === "taxday"
                ? "🏛️"
                : latestNotif.eventType === "inflation"
                ? "📈"
                : "⚡"}
            </div>
            <div>
              <span className="text-xs font-black uppercase tracking-wider block opacity-80">
                Classroom Event Notification
              </span>
              <h3 className="text-lg font-black">{latestNotif.title}</h3>
              <p className="text-xs font-bold mt-1 opacity-90">{latestNotif.message}</p>
            </div>
          </div>
        </div>
      )}

      {/* KID FRIENDLY STATS CARDS WITH BIG COLORFUL NUMBERS */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
        <div className="rounded-3xl bg-white p-4 border-2 border-emerald-200 shadow-sm dark:bg-slate-900 dark:border-emerald-900/40">
          <span className="block text-xs text-slate-500 font-extrabold">Total Sales 🛍️</span>
          <span className="text-2xl font-black text-emerald-600 dark:text-emerald-400">
            ⚡ {studentProfile.totalEarned || 0}
          </span>
        </div>

        <div className="rounded-3xl bg-white p-4 border-2 border-teal-200 shadow-sm dark:bg-slate-900 dark:border-teal-900/40">
          <span className="block text-xs text-slate-500 font-extrabold">Money You Kept 💰</span>
          <span className="text-2xl font-black text-teal-600 dark:text-teal-400">
            ⚡ {studentProfile.profit || 0}
          </span>
        </div>

        <div className="rounded-3xl bg-white p-4 border-2 border-purple-200 shadow-sm dark:bg-slate-900 dark:border-purple-900/40">
          <span className="block text-xs text-slate-500 font-extrabold">Hustle Score ⭐</span>
          <span className="text-2xl font-black text-purple-600 dark:text-purple-400">
            {studentProfile.hustleScore || 100}
          </span>
        </div>

        <div className="rounded-3xl bg-white p-4 border-2 border-indigo-200 shadow-sm dark:bg-slate-900 dark:border-indigo-900/40">
          <span className="block text-xs text-slate-500 font-extrabold">Completed Sales</span>
          <span className="text-2xl font-black text-indigo-600 dark:text-indigo-400">
            🛍️ {studentProfile.salesCount || 0}
          </span>
        </div>

        <div className="rounded-3xl bg-white p-4 border-2 border-amber-200 shadow-sm dark:bg-slate-900 dark:border-amber-900/40">
          <span className="block text-xs text-slate-500 font-extrabold">Avg Rating ⭐</span>
          <span className="text-2xl font-black text-amber-500">
            {studentProfile.avgRating || 0} / 5
          </span>
        </div>
      </div>

      {/* Active Competitions Section */}
      {competitions.length > 0 && (
        <div className="rounded-3xl border border-amber-200 bg-amber-50 p-6 dark:bg-slate-900 dark:border-amber-900/40 space-y-3">
          <h3 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
            <Trophy className="h-5 w-5 text-amber-500" />
            Active Classroom Competitions ({competitions.length})
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {competitions.map((comp) => (
              <div key={comp.id} className="p-4 rounded-2xl bg-white border border-amber-200 dark:bg-slate-950 dark:border-slate-800 space-y-1">
                <span className="font-extrabold text-slate-900 dark:text-white block">{comp.title}</span>
                <span className="text-xs text-indigo-600 font-bold block">{comp.type}</span>
                <p className="text-xs text-slate-600 dark:text-slate-400">{comp.description}</p>
                <span className="text-xs font-black text-emerald-600 block pt-1">Prize: {comp.prizeDescription}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Main Grid: My Active Hustles & Student Loan Request */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Active Hustles Column */}
        <div className="lg:col-span-8 space-y-6">
          <div className="rounded-3xl border border-slate-200 bg-white p-6 dark:bg-slate-900 dark:border-slate-800 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Store className="h-5 w-5 text-indigo-600" />
                My Hustle Listings ({myListings.length})
              </h3>
              <Link
                href="/student/generate"
                className="flex items-center gap-1 text-xs font-bold text-indigo-600 hover:underline dark:text-indigo-400"
              >
                <PlusCircle className="h-4 w-4" />
                <span>Create New</span>
              </Link>
            </div>

            {myListings.length === 0 ? (
              <div className="py-12 text-center space-y-4 border-2 border-dashed border-slate-200 rounded-2xl dark:border-slate-800">
                <p className="text-2xl">💡</p>
                <h4 className="font-bold text-slate-800 dark:text-slate-200">You haven't created a hustle yet!</h4>
                <Link
                  href="/student/generate"
                  className="inline-flex items-center gap-2 rounded-xl bg-amber-400 px-5 py-2.5 text-xs font-black text-slate-950 shadow-md hover:bg-amber-300"
                >
                  <Sparkles className="h-4 w-4" />
                  <span>Generate Hustle Idea</span>
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {myListings.map((item) => (
                  <div
                    key={item.id}
                    className="rounded-3xl border-2 border-slate-200 bg-slate-50 p-5 dark:bg-slate-800/50 dark:border-slate-700 space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-3xl">{item.logoUrl || "🎨"}</span>
                      <span
                        className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                          item.status === "approved" || item.status === "live"
                            ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"
                            : item.status === "pending"
                            ? "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300"
                            : "bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300"
                        }`}
                      >
                        {item.status}
                      </span>
                    </div>

                    <div>
                      <h4 className="font-black text-slate-900 dark:text-white text-base">{item.hustleName}</h4>
                      <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 line-clamp-2">{item.description}</p>
                    </div>

                    {/* Kid Friendly Cost Explanation Box */}
                    <div className="rounded-2xl bg-amber-50 p-3 border border-amber-200 text-slate-950 space-y-1 dark:bg-amber-950/40 dark:border-amber-900 dark:text-amber-200">
                      <p className="text-[11px] font-bold text-amber-900 dark:text-amber-300">
                        🪙 It costs <span className="font-black text-amber-600 dark:text-amber-400">{item.cost || 5}</span> SparkCoins to open your shop! This comes out of your wallet when you start.
                      </p>
                      <p className="text-[10px] text-slate-600 dark:text-slate-400 italic">
                        Think of it like paying rent for your little shop!
                      </p>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-slate-200 dark:border-slate-700 text-xs font-black">
                      <div>
                        <span className="block text-[10px] font-bold text-slate-400 uppercase">Sale Price</span>
                        <span className="text-emerald-600 font-extrabold text-sm">⚡ {item.price}</span>
                      </div>
                      <div className="text-right">
                        <span className="block text-[10px] font-bold text-teal-600 uppercase">Money You Kept 💰</span>
                        <span className="text-teal-600 font-extrabold text-sm">⚡ {item.price - (item.cost || 0)}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Student Loan System */}
        <div className="lg:col-span-4 space-y-6">
          
          {activeClassroom.economySettings?.loansEnabled && (
            <div className="rounded-3xl border border-purple-200 bg-white p-6 dark:bg-slate-900 dark:border-slate-800 shadow-sm space-y-4">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Building2 className="h-5 w-5 text-purple-600" />
                Request Student Loan 🏦
              </h3>

              {loanMsg && (
                <p className="text-xs font-bold text-purple-600 bg-purple-50 p-2.5 rounded-xl border border-purple-200">
                  {loanMsg}
                </p>
              )}

              <form onSubmit={handleOpenLoanModal} className="space-y-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">
                    Amount (Max 100 SparkCoins)
                  </label>
                  <input
                    type="number"
                    min={10}
                    max={100}
                    required
                    value={loanAmount}
                    onChange={(e) => setLoanAmount(Number(e.target.value))}
                    className="w-full rounded-xl border border-slate-300 p-2 text-xs dark:bg-slate-800 dark:border-slate-700 font-bold"
                  />
                </div>

                <div className="text-[10px] text-slate-500 font-medium">
                  Loan interest rate: 10%. If approved, you will owe <strong>⚡ {Math.round(loanAmount * 1.10)} SparkCoins</strong> at semester end.
                </div>

                <button
                  type="submit"
                  className="w-full rounded-xl bg-purple-600 py-2.5 font-bold text-xs text-white hover:bg-purple-700 transition-colors shadow-md"
                >
                  Submit Loan Request
                </button>
              </form>

              {myLoans.length > 0 && (
                <div className="pt-2 space-y-2 border-t border-slate-100 dark:border-slate-800">
                  <span className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase">My Loans</span>
                  {myLoans.map((loan) => (
                    <div key={loan.id} className="p-2.5 rounded-xl bg-slate-50 border text-xs flex justify-between items-center dark:bg-slate-800">
                      <div>
                        <span className="font-bold block">⚡ {loan.amount} SparkCoins</span>
                        <span className="text-[10px] text-slate-400">Due: ⚡ {loan.totalDue}</span>
                      </div>
                      <span className="font-bold text-[10px] uppercase text-purple-600">{loan.status}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

        </div>

      </div>

      {/* DOUBLE CONFIRMATION MODAL: REQUEST LOAN */}
      {showLoanConfirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md bg-white p-6 sm:p-8 rounded-3xl border-2 border-purple-500 shadow-2xl dark:bg-slate-900 dark:border-purple-600 space-y-6 text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl bg-purple-100 text-3xl shadow-md">
              🏦
            </div>

            <h3 className="text-2xl font-black text-slate-900 dark:text-white">
              Confirm Loan Request 🏦
            </h3>

            <p className="text-xs font-bold text-slate-700 dark:text-slate-300 leading-relaxed">
              Are you sure you want to borrow <strong>{loanAmount} {activeClassroom?.currencyName || "SparkCoins"}</strong>? You will need to pay back <strong>{Math.round(loanAmount * 1.10)} {activeClassroom?.currencyName || "SparkCoins"}</strong> later.
            </p>

            <div className="rounded-2xl bg-purple-50 p-4 border border-purple-200 dark:bg-purple-950/40 dark:border-purple-900 text-xs space-y-1 text-left font-bold text-purple-900 dark:text-purple-300">
              <div className="flex justify-between">
                <span>Borrow Amount:</span>
                <span className="font-mono font-black">⚡ {loanAmount} {activeClassroom?.currencyName || "SparkCoins"}</span>
              </div>
              <div className="flex justify-between">
                <span>Total Due Later (+10% Interest):</span>
                <span className="font-mono font-black text-rose-600 dark:text-rose-400">⚡ {Math.round(loanAmount * 1.10)} {activeClassroom?.currencyName || "SparkCoins"}</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowLoanConfirmModal(false)}
                className="flex items-center justify-center gap-1.5 rounded-2xl border-2 border-slate-300 bg-white py-3.5 font-bold text-slate-700 hover:bg-slate-100 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-200"
              >
                <span>Cancel</span>
              </button>

              <button
                type="button"
                disabled={requestingLoan}
                onClick={executeRequestLoan}
                className="flex items-center justify-center gap-1.5 rounded-2xl bg-purple-600 py-3.5 font-black text-white shadow-lg shadow-purple-600/30 hover:bg-purple-700 disabled:opacity-50 transition-all"
              >
                {requestingLoan ? (
                  <span>Submitting...</span>
                ) : (
                  <span>Yes, Borrow It! 🏦</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
