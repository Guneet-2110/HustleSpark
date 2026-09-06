"use client";

import React, { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth-context";
import {
  getStudentsInClassroom,
  getClassroomTransactions,
  getClassroomReviews,
  assignCreativeBadge
} from "@/lib/classroom";
import { Student, Transaction, Review } from "@/types";
import {
  Trophy,
  Award,
  TrendingUp,
  DollarSign,
  Sparkles,
  ShoppingBag,
  Heart,
  Star,
  Zap,
  Repeat,
  Palette,
  CheckCircle2,
  UserCheck
} from "lucide-react";

interface LeaderboardProps {
  isTeacherView?: boolean;
}

interface RankedStudent {
  student: Student;
  value: string | number;
  rank: number;
}

export default function LeaderboardContent({ isTeacherView = false }: LeaderboardProps) {
  const { studentProfile, activeClassroom, loading } = useAuth();
  
  const [students, setStudents] = useState<Student[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [activeTab, setActiveTab] = useState<"seller" | "buyer">("seller");
  
  // Teacher Assign Badge Modal State
  const [assigningStudent, setAssigningStudent] = useState<Student | null>(null);
  const [badgeTitle, setBadgeTitle] = useState("Most Creative Hustle 🎨");
  const [savingBadge, setSavingBadge] = useState(false);
  const [notice, setNotice] = useState("");

  useEffect(() => {
    if (activeClassroom) {
      loadAllData();
    }
  }, [activeClassroom]);

  const loadAllData = async () => {
    if (!activeClassroom) return;
    try {
      const studentList = await getStudentsInClassroom(activeClassroom.id);
      setStudents(studentList);

      const txs = await getClassroomTransactions(activeClassroom.id);
      setTransactions(txs);

      const rvs = await getClassroomReviews(activeClassroom.id);
      setReviews(rvs);
    } catch (err) {
      console.error("Leaderboard load error:", err);
    }
  };

  const handleAssignBadge = async () => {
    if (!activeClassroom || !assigningStudent) return;
    setSavingBadge(true);
    try {
      await assignCreativeBadge(activeClassroom.id, assigningStudent.id, badgeTitle);
      setNotice(`Assigned "${badgeTitle}" to ${assigningStudent.username}! 🎉`);
      setAssigningStudent(null);
      await loadAllData();
    } catch (e) {
      console.error("Assign badge error:", e);
    } finally {
      setSavingBadge(false);
    }
  };

  if (loading || !activeClassroom) {
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center p-6 space-y-4">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-amber-500" />
        <p className="text-sm font-semibold text-slate-600">Loading Classroom Hall of Fame...</p>
      </div>
    );
  }

  // Helper calculation functions for Seller & Buyer Leaderboards

  // 1. Most Earned
  const getMostEarned = (): RankedStudent[] => {
    const sorted = [...students].sort((a, b) => (b.totalEarned || 0) - (a.totalEarned || 0));
    return sorted.slice(0, 3).map((st, i) => ({ student: st, value: `⚡ ${st.totalEarned || 0}`, rank: i + 1 }));
  };

  // 2. Highest Profit Margin / Money Kept
  const getHighestProfit = (): RankedStudent[] => {
    const sorted = [...students].sort((a, b) => (b.profit || 0) - (a.profit || 0));
    return sorted.slice(0, 3).map((st, i) => ({ student: st, value: `⚡ ${st.profit || 0}`, rank: i + 1 }));
  };

  // 3. Most Sales
  const getMostSales = (): RankedStudent[] => {
    const sorted = [...students].sort((a, b) => (b.salesCount || 0) - (a.salesCount || 0));
    return sorted.slice(0, 3).map((st, i) => ({ student: st, value: `${st.salesCount || 0} sales`, rank: i + 1 }));
  };

  // 4. Best Customer Rating
  const getBestRating = (): RankedStudent[] => {
    const sorted = [...students].sort((a, b) => (b.avgRating || 0) - (a.avgRating || 0));
    return sorted.slice(0, 3).map((st, i) => ({ student: st, value: `⭐ ${st.avgRating || 0} / 5`, rank: i + 1 }));
  };

  // 5. Hustle Score Champion
  const getScoreChampion = (): RankedStudent[] => {
    const sorted = [...students].sort((a, b) => (b.hustleScore || 0) - (a.hustleScore || 0));
    return sorted.slice(0, 3).map((st, i) => ({ student: st, value: `${st.hustleScore || 100} pts`, rank: i + 1 }));
  };

  // 6. Fastest First Sale (earliest completed transaction)
  const getFastestFirstSale = (): RankedStudent[] => {
    const firstSaleMap: { [studentId: string]: string } = {};
    transactions.forEach((tx) => {
      if (tx.status === "completed" && tx.sellerId) {
        if (!firstSaleMap[tx.sellerId] || new Date(tx.createdAt) < new Date(firstSaleMap[tx.sellerId])) {
          firstSaleMap[tx.sellerId] = tx.createdAt;
        }
      }
    });
    const sellersWithSales = students.filter((s) => firstSaleMap[s.id]);
    sellersWithSales.sort((a, b) => new Date(firstSaleMap[a.id]).getTime() - new Date(firstSaleMap[b.id]).getTime());
    return sellersWithSales.slice(0, 3).map((st, i) => ({
      student: st,
      value: `1st Sale 🎉`,
      rank: i + 1,
    }));
  };

  // 7. Most Improved (Score or Sales count)
  const getMostImproved = (): RankedStudent[] => {
    const sorted = [...students].sort((a, b) => ((b.hustleScore || 100) + (b.salesCount || 0) * 20) - ((a.hustleScore || 100) + (a.salesCount || 0) * 20));
    return sorted.slice(0, 3).map((st, i) => ({ student: st, value: `🚀 ${st.hustleScore || 100} pts`, rank: i + 1 }));
  };

  // 8. Best Pivot (Students with active sales & ratings)
  const getBestPivot = (): RankedStudent[] => {
    const sorted = [...students].sort((a, b) => ((b.avgRating || 0) * 10 + (b.salesCount || 0)) - ((a.avgRating || 0) * 10 + (a.salesCount || 0)));
    return sorted.slice(0, 3).map((st, i) => ({ student: st, value: `💡 Pivot Pro`, rank: i + 1 }));
  };

  // 9. Most Creative Hustle (Teacher Assigned)
  const getMostCreative = (): RankedStudent[] => {
    const creativeList = students.filter((s) => s.creativeBadge);
    const sorted = creativeList.length > 0 ? creativeList : students.slice(0, 3);
    return sorted.slice(0, 3).map((st, i) => ({
      student: st,
      value: st.creativeBadgeTitle || "Most Creative 🎨",
      rank: i + 1,
    }));
  };

  // BUYER AWARDS

  // 1. Top Spender
  const getTopSpender = (): RankedStudent[] => {
    const sorted = [...students].sort((a, b) => (b.totalSpent || 0) - (a.totalSpent || 0));
    return sorted.slice(0, 3).map((st, i) => ({ student: st, value: `⚡ ${st.totalSpent || 0}`, rank: i + 1 }));
  };

  // 2. First Buyer
  const getFirstBuyer = (): RankedStudent[] => {
    const firstBuyMap: { [buyerId: string]: string } = {};
    transactions.forEach((tx) => {
      if (tx.status === "completed" && tx.buyerId) {
        if (!firstBuyMap[tx.buyerId] || new Date(tx.createdAt) < new Date(firstBuyMap[tx.buyerId])) {
          firstBuyMap[tx.buyerId] = tx.createdAt;
        }
      }
    });
    const buyers = students.filter((s) => firstBuyMap[s.id]);
    buyers.sort((a, b) => new Date(firstBuyMap[a.id]).getTime() - new Date(firstBuyMap[b.id]).getTime());
    return buyers.slice(0, 3).map((st, i) => ({ student: st, value: `1st Buyer 🛍️`, rank: i + 1 }));
  };

  // 3. Most Supportive (bought from most different classmates)
  const getMostSupportive = (): RankedStudent[] => {
    const sellerSetMap: { [buyerId: string]: Set<string> } = {};
    transactions.forEach((tx) => {
      if (tx.status === "completed" && tx.buyerId && tx.sellerId) {
        if (!sellerSetMap[tx.buyerId]) sellerSetMap[tx.buyerId] = new Set();
        sellerSetMap[tx.buyerId].add(tx.sellerId);
      }
    });
    const sorted = [...students].sort(
      (a, b) => (sellerSetMap[b.id]?.size || 0) - (sellerSetMap[a.id]?.size || 0)
    );
    return sorted.slice(0, 3).map((st, i) => ({
      student: st,
      value: `Supported ${sellerSetMap[st.id]?.size || 0} shops`,
      rank: i + 1,
    }));
  };

  // 4. Best Reviewer (most reviews left)
  const getBestReviewer = (): RankedStudent[] => {
    const reviewCountMap: { [buyerId: string]: number } = {};
    reviews.forEach((r) => {
      if (r.buyerId) reviewCountMap[r.buyerId] = (reviewCountMap[r.buyerId] || 0) + 1;
    });
    const sorted = [...students].sort((a, b) => (reviewCountMap[b.id] || 0) - (reviewCountMap[a.id] || 0));
    return sorted.slice(0, 3).map((st, i) => ({
      student: st,
      value: `✍️ ${reviewCountMap[st.id] || 0} reviews`,
      rank: i + 1,
    }));
  };

  // 5. Smart Shopper (most purchases count)
  const getSmartShopper = (): RankedStudent[] => {
    const buyCountMap: { [buyerId: string]: number } = {};
    transactions.forEach((tx) => {
      if (tx.status === "completed" && tx.buyerId) {
        buyCountMap[tx.buyerId] = (buyCountMap[tx.buyerId] || 0) + 1;
      }
    });
    const sorted = [...students].sort((a, b) => (buyCountMap[b.id] || 0) - (buyCountMap[a.id] || 0));
    return sorted.slice(0, 3).map((st, i) => ({
      student: st,
      value: `🛍️ ${buyCountMap[st.id] || 0} purchases`,
      rank: i + 1,
    }));
  };

  // 6. Loyal Customer (repeat buyer)
  const getLoyalCustomer = (): RankedStudent[] => {
    const repeatMap: { [buyerId: string]: number } = {};
    transactions.forEach((tx) => {
      if (tx.status === "completed" && tx.buyerId) {
        repeatMap[tx.buyerId] = (repeatMap[tx.buyerId] || 0) + 1;
      }
    });
    const sorted = [...students].sort((a, b) => (repeatMap[b.id] || 0) - (repeatMap[a.id] || 0));
    return sorted.slice(0, 3).map((st, i) => ({
      student: st,
      value: `🔁 Loyal Fan`,
      rank: i + 1,
    }));
  };

  const renderAwardCard = (title: string, icon: React.ReactNode, list: RankedStudent[], colorBg: string) => (
    <div className={`rounded-3xl border-2 p-5 shadow-lg space-y-3 ${colorBg}`}>
      <div className="flex items-center gap-2 border-b pb-2 border-slate-900/10 dark:border-white/10">
        {icon}
        <h3 className="text-base font-black text-slate-900 dark:text-white tracking-tight">{title}</h3>
      </div>

      <div className="space-y-2">
        {list.map((item, idx) => {
          const medal = idx === 0 ? "🥇" : idx === 1 ? "🥈" : "🥉";
          const isUser = studentProfile?.id === item.student.id;
          return (
            <div
              key={item.student.id}
              className={`flex items-center justify-between p-2.5 rounded-2xl bg-white/90 dark:bg-slate-900/90 border ${
                isUser ? "ring-2 ring-indigo-500 border-indigo-500" : "border-slate-200 dark:border-slate-800"
              }`}
            >
              <div className="flex items-center gap-2">
                <span className="text-xl font-black">{medal}</span>
                <span className="text-2xl">{item.student.avatar || "🚀"}</span>
                <div>
                  <span className="font-extrabold text-xs text-slate-900 dark:text-white block">
                    {item.student.username} {isUser && <span className="text-[10px] text-indigo-600">(You)</span>}
                  </span>
                  <span className="text-[10px] text-slate-500 font-bold">{item.student.tier || "Starter"}</span>
                </div>
              </div>

              <div className="text-right">
                <span className="font-black text-xs text-emerald-600 dark:text-emerald-400 block font-mono">
                  {item.value}
                </span>
                {isTeacherView && (
                  <button
                    onClick={() => {
                      setAssigningStudent(item.student);
                      setBadgeTitle(`${title} 🏆`);
                    }}
                    className="text-[9px] font-black text-indigo-600 hover:underline block"
                  >
                    Award Badge 🎨
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-8">
      
      {/* Header Banner */}
      <div className="rounded-3xl bg-gradient-to-r from-amber-400 via-orange-500 to-purple-600 p-6 sm:p-8 text-slate-950 shadow-xl flex flex-col md:flex-row items-center justify-between gap-6 border-2 border-amber-300">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full bg-slate-950/20 px-3 py-1 text-xs font-black">
            <Trophy className="h-4 w-4" />
            <span>{isTeacherView ? "Teacher Leaderboard Command" : "Student Hall of Fame"}</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black mt-2 text-slate-950">
            Classroom Awards & Leaderboards 🏆
          </h1>
          <p className="text-xs sm:text-sm font-bold text-slate-900 opacity-90 mt-1 max-w-2xl">
            Celebrating every entrepreneur in {activeClassroom.className}! Top 3 champions awarded with 🥇 2nd 🥈 and 3rd 🥉 place trophies!
          </p>
        </div>

        <div className="bg-slate-950 p-5 rounded-3xl text-white text-center w-full md:w-auto border-2 border-amber-300 shadow-lg">
          <span className="block text-[10px] font-extrabold uppercase tracking-widest text-amber-300">Classroom Roster</span>
          <span className="text-4xl font-black text-amber-400 font-mono">{students.length}</span>
          <span className="block text-[10px] text-slate-400 font-bold mt-1">Active Students</span>
        </div>
      </div>

      {notice && (
        <div className="rounded-2xl bg-emerald-100 border border-emerald-300 p-4 text-xs font-bold text-emerald-900 flex items-center justify-between">
          <span className="flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-emerald-600" />
            <span>{notice}</span>
          </span>
          <button onClick={() => setNotice("")} className="text-xs font-bold">Dismiss</button>
        </div>
      )}

      {/* Main Mode Tabs */}
      <div className="flex rounded-2xl bg-white p-1.5 border border-slate-200 shadow-sm dark:bg-slate-900 dark:border-slate-800 max-w-md mx-auto">
        <button
          onClick={() => setActiveTab("seller")}
          className={`flex-1 rounded-xl py-3 text-xs font-black transition-all flex items-center justify-center gap-2 ${
            activeTab === "seller" ? "bg-amber-400 text-slate-950 shadow-md" : "text-slate-600 hover:text-slate-900 dark:text-slate-400"
          }`}
        >
          <Sparkles className="h-4 w-4" />
          <span>SELLER AWARDS (9 Categories)</span>
        </button>

        <button
          onClick={() => setActiveTab("buyer")}
          className={`flex-1 rounded-xl py-3 text-xs font-black transition-all flex items-center justify-center gap-2 ${
            activeTab === "buyer" ? "bg-purple-600 text-white shadow-md" : "text-slate-600 hover:text-slate-900 dark:text-slate-400"
          }`}
        >
          <ShoppingBag className="h-4 w-4" />
          <span>BUYER AWARDS (6 Categories)</span>
        </button>
      </div>

      {/* SELLER AWARDS GRID */}
      {activeTab === "seller" && (
        <div className="space-y-6">
          <h2 className="text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2">
            <span>✨ Seller Championship Categories</span>
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {renderAwardCard("Most Earned 💰", <DollarSign className="h-5 w-5 text-amber-600" />, getMostEarned(), "bg-amber-50 border-amber-300 dark:bg-amber-950/40 dark:border-amber-700")}
            {renderAwardCard("Highest Profit Margin 📈", <TrendingUp className="h-5 w-5 text-emerald-600" />, getHighestProfit(), "bg-emerald-50 border-emerald-300 dark:bg-emerald-950/40 dark:border-emerald-700")}
            {renderAwardCard("Most Sales 🛍️", <ShoppingBag className="h-5 w-5 text-indigo-600" />, getMostSales(), "bg-indigo-50 border-indigo-300 dark:bg-indigo-950/40 dark:border-indigo-700")}
            {renderAwardCard("Best Customer Rating ⭐", <Star className="h-5 w-5 text-amber-500" />, getBestRating(), "bg-amber-50 border-amber-300 dark:bg-amber-950/40 dark:border-amber-700")}
            {renderAwardCard("Hustle Score Champion 💎", <Award className="h-5 w-5 text-purple-600" />, getScoreChampion(), "bg-purple-50 border-purple-300 dark:bg-purple-950/40 dark:border-purple-700")}
            {renderAwardCard("Fastest First Sale ⚡", <Zap className="h-5 w-5 text-amber-500" />, getFastestFirstSale(), "bg-sky-50 border-sky-300 dark:bg-sky-950/40 dark:border-sky-700")}
            {renderAwardCard("Most Improved 🚀", <Sparkles className="h-5 w-5 text-pink-600" />, getMostImproved(), "bg-pink-50 border-pink-300 dark:bg-pink-950/40 dark:border-pink-700")}
            {renderAwardCard("Best Pivot 💡", <Repeat className="h-5 w-5 text-teal-600" />, getBestPivot(), "bg-teal-50 border-teal-300 dark:bg-teal-950/40 dark:border-teal-700")}
            {renderAwardCard("Most Creative Hustle 🎨", <Palette className="h-5 w-5 text-rose-600" />, getMostCreative(), "bg-rose-50 border-rose-300 dark:bg-rose-950/40 dark:border-rose-700")}
          </div>
        </div>
      )}

      {/* BUYER AWARDS GRID */}
      {activeTab === "buyer" && (
        <div className="space-y-6">
          <h2 className="text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2">
            <span>🛒 Buyer Championship Categories</span>
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {renderAwardCard("Top Spender 💸", <DollarSign className="h-5 w-5 text-emerald-600" />, getTopSpender(), "bg-emerald-50 border-emerald-300 dark:bg-emerald-950/40 dark:border-emerald-700")}
            {renderAwardCard("First Buyer 🥇", <Trophy className="h-5 w-5 text-amber-500" />, getFirstBuyer(), "bg-amber-50 border-amber-300 dark:bg-amber-950/40 dark:border-amber-700")}
            {renderAwardCard("Most Supportive 🤝", <Heart className="h-5 w-5 text-rose-600" />, getMostSupportive(), "bg-rose-50 border-rose-300 dark:bg-rose-950/40 dark:border-rose-700")}
            {renderAwardCard("Best Reviewer ✍️", <Star className="h-5 w-5 text-purple-600" />, getBestReviewer(), "bg-purple-50 border-purple-300 dark:bg-purple-950/40 dark:border-purple-700")}
            {renderAwardCard("Smart Shopper 🛍️", <ShoppingBag className="h-5 w-5 text-indigo-600" />, getSmartShopper(), "bg-indigo-50 border-indigo-300 dark:bg-indigo-950/40 dark:border-indigo-700")}
            {renderAwardCard("Loyal Customer 🔁", <Repeat className="h-5 w-5 text-sky-600" />, getLoyalCustomer(), "bg-sky-50 border-sky-300 dark:bg-sky-950/40 dark:border-sky-700")}
          </div>
        </div>
      )}

      {/* FULL STUDENT ROSTER TABLE (TEACHER VIEW) */}
      {isTeacherView && (
        <div className="rounded-3xl border border-slate-200 bg-white p-6 dark:bg-slate-900 dark:border-slate-800 shadow-sm space-y-4">
          <h3 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-2">
            <UserCheck className="h-5 w-5 text-indigo-600" />
            Teacher Full Roster Analytics ({students.length})
          </h3>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-slate-200 text-slate-500 dark:border-slate-800">
                <tr>
                  <th className="py-3 px-2 font-bold">Student</th>
                  <th className="py-3 px-2 font-bold">PIN</th>
                  <th className="py-3 px-2 font-bold">Balance</th>
                  <th className="py-3 px-2 font-bold">Total Sales 🛍️</th>
                  <th className="py-3 px-2 font-bold">Money Kept 💰</th>
                  <th className="py-3 px-2 font-bold">Spent 💸</th>
                  <th className="py-3 px-2 font-bold">Score ⭐</th>
                  <th className="py-3 px-2 font-bold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {students.map((s) => (
                  <tr key={s.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                    <td className="py-3 px-2 font-bold flex items-center gap-2">
                      <span className="text-lg">{s.avatar || "🚀"}</span>
                      <span>{s.username}</span>
                      {s.creativeBadge && <span className="text-xs">🎨</span>}
                    </td>
                    <td className="py-3 px-2 font-mono font-bold text-purple-600">{s.pin || "••••"}</td>
                    <td className="py-3 px-2 font-black text-emerald-600">⚡ {s.balance}</td>
                    <td className="py-3 px-2 font-bold">⚡ {s.totalEarned || 0}</td>
                    <td className="py-3 px-2 font-bold text-teal-600">⚡ {s.profit || 0}</td>
                    <td className="py-3 px-2 font-bold text-rose-600">⚡ {s.totalSpent || 0}</td>
                    <td className="py-3 px-2 font-bold text-purple-600">⭐ {s.hustleScore || 100}</td>
                    <td className="py-3 px-2">
                      <button
                        onClick={() => {
                          setAssigningStudent(s);
                          setBadgeTitle("Most Creative Hustle 🎨");
                        }}
                        className="rounded-xl bg-purple-600 px-2.5 py-1 text-[10px] font-black text-white hover:bg-purple-700"
                      >
                        Award Badge 🎨
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TEACHER ASSIGN CREATIVE BADGE MODAL */}
      {assigningStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white p-6 rounded-3xl border-2 border-purple-500 shadow-2xl dark:bg-slate-900 space-y-4">
            <h3 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-2">
              <Palette className="h-5 w-5 text-purple-600" />
              Award Custom Badge to {assigningStudent.username}
            </h3>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">
                Badge Title / Award Name:
              </label>
              <input
                type="text"
                value={badgeTitle}
                onChange={(e) => setBadgeTitle(e.target.value)}
                placeholder="e.g. Most Creative Hustle 🎨"
                className="w-full rounded-xl border border-slate-300 p-2.5 text-xs font-bold dark:bg-slate-800"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setAssigningStudent(null)}
                className="rounded-xl border border-slate-300 px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={savingBadge}
                onClick={handleAssignBadge}
                className="rounded-xl bg-purple-600 px-4 py-2 text-xs font-black text-white hover:bg-purple-700 shadow-md disabled:opacity-50"
              >
                {savingBadge ? "Awarding..." : "Assign Badge 🎨"}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
