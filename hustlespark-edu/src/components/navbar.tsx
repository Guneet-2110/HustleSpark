"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { subscribeToNotifications, markNotificationAsRead } from "@/lib/classroom";
import { NotificationDoc } from "@/types";
import {
  Store,
  LayoutDashboard,
  LogOut,
  KeyRound,
  Lightbulb,
  Bell,
  Trophy,
  Check,
  Sparkles
} from "lucide-react";

export function Navbar() {
  const { user, role, studentProfile, activeClassroom, logout } = useAuth();

  const [notifications, setNotifications] = useState<NotificationDoc[]>([]);
  const [showNotifDropdown, setShowNotifDropdown] = useState(false);

  useEffect(() => {
    let unsubscribe: () => void;
    if (activeClassroom) {
      const targetUserId = role === "student" && studentProfile ? studentProfile.id : (user ? user.uid : null);
      if (targetUserId) {
        unsubscribe = subscribeToNotifications(activeClassroom.id, targetUserId, (notifs) => {
          setNotifications(notifs);
        });
      }
    }
    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [activeClassroom, studentProfile, user, role]);

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const handleMarkRead = async (id: string) => {
    if (activeClassroom) {
      await markNotificationAsRead(activeClassroom.id, id);
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-indigo-100 bg-white/90 backdrop-blur-md dark:border-slate-800 dark:bg-slate-950/90">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6">
        <Link href="/" className="flex items-center gap-2.5 transition-transform hover:scale-[1.02]">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-amber-400 via-orange-500 to-indigo-600 shadow-md shadow-orange-500/20 text-white font-bold text-xl">
            ⚡
          </div>
          <div>
            <span className="text-xl font-extrabold tracking-tight bg-gradient-to-r from-indigo-700 via-purple-600 to-pink-600 bg-clip-text text-transparent dark:from-indigo-400 dark:to-pink-400">
              HustleSpark
            </span>
            <span className="ml-1 rounded-full bg-amber-100 px-2 py-0.5 text-xs font-semibold text-amber-800 dark:bg-amber-900/40 dark:text-amber-300">
              EDU
            </span>
          </div>
        </Link>

        {/* Navigation Links */}
        <nav className="flex items-center gap-3 sm:gap-4">
          {role === "student" && studentProfile && (
            <>
              <div className="hidden sm:flex items-center gap-1.5 rounded-full bg-amber-50 px-3.5 py-1.5 border border-amber-200 text-amber-900 font-bold text-sm dark:bg-amber-950/50 dark:border-amber-800 dark:text-amber-300 shadow-xs">
                <span>{studentProfile.avatar || "🚀"}</span>
                <span>{studentProfile.username}</span>
                <span className="text-amber-400">|</span>
                <span className="text-emerald-600 font-black dark:text-emerald-400">
                  ⚡ {studentProfile.balance} {activeClassroom?.currencyName || "SparkCoins"}
                </span>
              </div>

              <Link
                href="/student/dashboard"
                className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-semibold text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800"
              >
                <LayoutDashboard className="h-4 w-4 text-indigo-600" />
                <span className="hidden md:inline">Dashboard</span>
              </Link>

              <Link
                href="/student/leaderboard"
                className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-semibold text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800"
              >
                <Trophy className="h-4 w-4 text-amber-500" />
                <span className="hidden md:inline">Leaderboard</span>
              </Link>

              <Link
                href="/student/generate"
                className="flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-purple-500 to-indigo-600 px-3 py-1.5 text-sm font-semibold text-white shadow-xs hover:opacity-90"
              >
                <Lightbulb className="h-4 w-4 text-amber-300" />
                <span>AI Ideas</span>
              </Link>

              <Link
                href="/student/marketplace"
                className="flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3 py-1.5 text-sm font-semibold text-white shadow-xs hover:bg-emerald-700"
              >
                <Store className="h-4 w-4" />
                <span>Marketplace</span>
              </Link>

              {/* NOTIFICATION BELL */}
              <div className="relative">
                <button
                  onClick={() => setShowNotifDropdown(!showNotifDropdown)}
                  className="relative rounded-lg p-2 text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800 transition-colors"
                  title="Notifications"
                >
                  <Bell className="h-5 w-5" />
                  {unreadCount > 0 && (
                    <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-black text-white shadow-xs">
                      {unreadCount}
                    </span>
                  )}
                </button>

                {showNotifDropdown && (
                  <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl border border-slate-200 bg-white p-4 shadow-2xl dark:bg-slate-900 dark:border-slate-800 space-y-3 z-50">
                    <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
                      <h4 className="font-extrabold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                        <Bell className="h-4 w-4 text-indigo-600" />
                        Notifications ({notifications.length})
                      </h4>
                      {unreadCount > 0 && (
                        <span className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400">
                          {unreadCount} unread
                        </span>
                      )}
                    </div>

                    {notifications.length === 0 ? (
                      <p className="text-xs text-slate-500 py-4 text-center">No notifications yet!</p>
                    ) : (
                      <div className="max-h-80 overflow-y-auto space-y-2">
                        {notifications.slice(0, 10).map((n) => (
                          <div
                            key={n.id}
                            onClick={() => handleMarkRead(n.id)}
                            className={`p-3 rounded-xl border text-xs cursor-pointer transition-all ${
                              n.isRead
                                ? "bg-slate-50 border-slate-200 text-slate-600 dark:bg-slate-800/40 dark:border-slate-800 dark:text-slate-400"
                                : "bg-indigo-50/80 border-indigo-200 text-slate-900 font-medium dark:bg-indigo-950/60 dark:border-indigo-800 dark:text-white"
                            }`}
                          >
                            <div className="flex items-center justify-between font-bold mb-0.5">
                              <span>{n.title}</span>
                              {!n.isRead && (
                                <span className="h-2 w-2 rounded-full bg-indigo-600" />
                              )}
                            </div>
                            <p className="text-[11px] opacity-90">{n.message}</p>
                            <span className="text-[9px] text-slate-400 block mt-1">
                              {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>

              <button
                onClick={logout}
                className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-800 dark:hover:bg-slate-800"
                title="Log out"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </>
          )}

          {role === "teacher" && (
            <>
              {activeClassroom && (
                <div className="hidden md:flex items-center gap-2 rounded-lg bg-indigo-50 px-3 py-1 text-xs font-bold text-indigo-900 border border-indigo-200 dark:bg-indigo-950 dark:border-indigo-800 dark:text-indigo-300">
                  <span>Class: {activeClassroom.className}</span>
                  <span className="rounded bg-indigo-600 px-1.5 py-0.5 text-white tracking-widest font-mono">
                    CODE: {activeClassroom.joinCode}
                  </span>
                </div>
              )}

              <Link
                href="/teacher/leaderboard"
                className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-semibold text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800"
              >
                <Trophy className="h-4 w-4 text-amber-500" />
                <span className="hidden md:inline">Leaderboard</span>
              </Link>

              <Link
                href="/teacher/dashboard"
                className="flex items-center gap-1.5 rounded-lg bg-indigo-600 px-3.5 py-1.5 text-sm font-semibold text-white shadow-xs hover:bg-indigo-700"
              >
                <LayoutDashboard className="h-4 w-4" />
                <span>Teacher Portal</span>
              </Link>

              {/* NOTIFICATION BELL FOR TEACHER */}
              <div className="relative">
                <button
                  onClick={() => setShowNotifDropdown(!showNotifDropdown)}
                  className="relative rounded-lg p-2 text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800 transition-colors"
                  title="Notifications"
                >
                  <Bell className="h-5 w-5" />
                  {unreadCount > 0 && (
                    <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-black text-white shadow-xs">
                      {unreadCount}
                    </span>
                  )}
                </button>

                {showNotifDropdown && (
                  <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl border border-slate-200 bg-white p-4 shadow-2xl dark:bg-slate-900 dark:border-slate-800 space-y-3 z-50">
                    <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
                      <h4 className="font-extrabold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                        <Bell className="h-4 w-4 text-indigo-600" />
                        Class Notifications ({notifications.length})
                      </h4>
                      {unreadCount > 0 && (
                        <span className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400">
                          {unreadCount} unread
                        </span>
                      )}
                    </div>

                    {notifications.length === 0 ? (
                      <p className="text-xs text-slate-500 py-4 text-center">No notifications yet!</p>
                    ) : (
                      <div className="max-h-80 overflow-y-auto space-y-2">
                        {notifications.slice(0, 10).map((n) => (
                          <div
                            key={n.id}
                            onClick={() => handleMarkRead(n.id)}
                            className={`p-3 rounded-xl border text-xs cursor-pointer transition-all ${
                              n.isRead
                                ? "bg-slate-50 border-slate-200 text-slate-600 dark:bg-slate-800/40 dark:border-slate-800 dark:text-slate-400"
                                : "bg-indigo-50/80 border-indigo-200 text-slate-900 font-medium dark:bg-indigo-950/60 dark:border-indigo-800 dark:text-white"
                            }`}
                          >
                            <div className="flex items-center justify-between font-bold mb-0.5">
                              <span>{n.title}</span>
                              {!n.isRead && (
                                <span className="h-2 w-2 rounded-full bg-indigo-600" />
                              )}
                            </div>
                            <p className="text-[11px] opacity-90">{n.message}</p>
                            <span className="text-[9px] text-slate-400 block mt-1">
                              {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>

              <button
                onClick={logout}
                className="flex items-center gap-1 rounded-lg border border-slate-200 px-3 py-1.5 text-sm font-medium text-slate-600 hover:bg-slate-50 dark:border-slate-800 dark:text-slate-300 dark:hover:bg-slate-900"
              >
                <LogOut className="h-4 w-4" />
                <span className="hidden sm:inline">Logout</span>
              </button>
            </>
          )}

          {!role && (
            <>
              <Link
                href="/join"
                className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-amber-400 to-orange-500 px-4 py-2 text-sm font-extrabold text-slate-950 shadow-md shadow-orange-500/20 hover:scale-[1.03] transition-all"
              >
                <KeyRound className="h-4 w-4" />
                <span>Join Class</span>
              </Link>
              <Link
                href="/teacher/login"
                className="hidden sm:inline-flex rounded-lg px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
              >
                Teacher Login
              </Link>
              <Link
                href="/teacher/signup"
                className="rounded-lg bg-indigo-600 px-3.5 py-2 text-sm font-semibold text-white shadow-xs hover:bg-indigo-700"
              >
                Teacher Sign Up
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
