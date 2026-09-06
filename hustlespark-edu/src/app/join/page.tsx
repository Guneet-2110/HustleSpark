"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import SlowToast from "@/components/slow-toast";
import { KeyRound, User, Lock, ArrowRight, ShieldCheck, Sparkles, UserPlus, LogIn, CheckCircle } from "lucide-react";

const AVATARS = ["🚀", "🎨", "⚡", "🐾", "🍪", "🎮", "🦄", "⚽", "🤖", "🔥"];

function JoinForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { joinAsStudent, loginAsStudentWithPin } = useAuth();

  const [mode, setMode] = useState<"new" | "returning">("new");
  const [joinCode, setJoinCode] = useState("");
  const [username, setUsername] = useState("");
  const [pin, setPin] = useState("");
  const [avatar, setAvatar] = useState("🚀");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const codeParam = searchParams.get("code");
    if (codeParam) {
      setJoinCode(codeParam.toUpperCase());
    }
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!joinCode.trim() || joinCode.trim().length !== 6) {
      setError("Please enter a valid 6-character class code!");
      return;
    }

    if (!username.trim()) {
      setError("Please enter your nickname!");
      return;
    }

    if (!pin.trim() || pin.trim().length !== 4 || !/^\d{4}$/.test(pin.trim())) {
      setError("Please enter a 4-digit secret PIN number (e.g. 1234)!");
      return;
    }

    setSubmitting(true);
    try {
      if (mode === "new") {
        await joinAsStudent(joinCode.trim(), username.trim(), pin.trim(), avatar);
      } else {
        await loginAsStudentWithPin(joinCode.trim(), username.trim(), pin.trim());
      }
      router.push("/student/dashboard");
    } catch (err: any) {
      setError(err.message || "Failed to join class. Please double-check your class code and PIN!");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex flex-col items-center justify-center px-4 py-12 bg-gradient-to-b from-indigo-950 via-slate-900 to-slate-950 text-white space-y-12">
      <SlowToast isLoading={submitting} operationName="Student Authentication" />

      <div className="w-full max-w-lg space-y-8 rounded-3xl border border-indigo-800/60 bg-indigo-900/40 p-8 backdrop-blur-xl shadow-2xl">
        
        {/* Header */}
        <div className="text-center space-y-3">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl bg-gradient-to-br from-amber-400 to-orange-500 text-3xl font-black shadow-lg shadow-orange-500/20">
            {avatar}
          </div>
          <h2 className="text-3xl font-black tracking-tight">
            Classroom Student Portal 🚀
          </h2>
          <p className="text-sm text-indigo-200">
            100% email-free & safe for school! Choose your nickname and 4-digit PIN to join or log back in.
          </p>
        </div>

        {/* Mode Switcher Tabs */}
        <div className="flex rounded-2xl bg-slate-950/80 p-1.5 border border-indigo-800">
          <button
            type="button"
            onClick={() => { setMode("new"); setError(""); }}
            className={`flex items-center justify-center gap-2 flex-1 rounded-xl py-2.5 text-xs font-black transition-all ${
              mode === "new" ? "bg-amber-400 text-slate-950 shadow-md" : "text-indigo-300 hover:text-white"
            }`}
          >
            <UserPlus className="h-4 w-4" />
            <span>First-Time Student</span>
          </button>

          <button
            type="button"
            onClick={() => { setMode("returning"); setError(""); }}
            className={`flex items-center justify-center gap-2 flex-1 rounded-xl py-2.5 text-xs font-black transition-all ${
              mode === "returning" ? "bg-amber-400 text-slate-950 shadow-md" : "text-indigo-300 hover:text-white"
            }`}
          >
            <LogIn className="h-4 w-4" />
            <span>Returning Student</span>
          </button>
        </div>

        {error && (
          <div className="rounded-2xl bg-red-950/80 p-4 text-xs font-bold text-red-200 border border-red-800 text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Section Indicator */}
          <div className="rounded-xl bg-indigo-950/80 p-3 border border-indigo-700/60 text-xs font-semibold text-indigo-200 flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-amber-400" />
            <span>
              {mode === "new"
                ? "First-Time Signup: Create your account, avatar, and secret 4-digit PIN!"
                : "Returning Student: Enter your class code, nickname, and secret 4-digit PIN."}
            </span>
          </div>

          {/* Class Code Input */}
          <div>
            <label className="block text-xs font-extrabold text-amber-300 uppercase tracking-widest mb-1.5">
              Class Code
            </label>
            <div className="relative">
              <KeyRound className="absolute left-4 top-3.5 h-5 w-5 text-amber-400" />
              <input
                type="text"
                maxLength={6}
                required
                value={joinCode}
                onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                placeholder="e.g. SPARK9"
                className="w-full rounded-2xl border-2 border-indigo-500 bg-slate-950/90 pl-12 pr-4 py-3 font-black tracking-widest text-xl uppercase text-amber-300 placeholder-indigo-700 focus:border-amber-400 focus:outline-none"
              />
            </div>
          </div>

          {/* Student Username Input */}
          <div>
            <label className="block text-xs font-extrabold text-amber-300 uppercase tracking-widest mb-1.5">
              Your Nickname
            </label>
            <div className="relative">
              <User className="absolute left-4 top-3.5 h-5 w-5 text-indigo-400" />
              <input
                type="text"
                required
                maxLength={18}
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="e.g. AlexTheHustler"
                className="w-full rounded-2xl border border-indigo-600 bg-slate-950/90 pl-12 pr-4 py-3 text-base font-bold text-white placeholder-indigo-600 focus:border-indigo-400 focus:outline-none"
              />
            </div>
          </div>

          {/* Avatar Picker (Only for new students) */}
          {mode === "new" && (
            <div>
              <label className="block text-xs font-extrabold text-amber-300 uppercase tracking-widest mb-1.5">
                Choose Avatar
              </label>
              <div className="grid grid-cols-5 gap-2">
                {AVATARS.map((emoji) => (
                  <button
                    type="button"
                    key={emoji}
                    onClick={() => setAvatar(emoji)}
                    className={`flex h-11 w-11 items-center justify-center rounded-2xl text-xl transition-all ${
                      avatar === emoji
                        ? "bg-amber-400 border-2 border-white scale-110 shadow-lg shadow-amber-400/40"
                        : "bg-slate-900/80 border border-indigo-800 hover:bg-slate-800"
                    }`}
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Secret 4-digit PIN Input */}
          <div>
            <label className="block text-xs font-extrabold text-amber-300 uppercase tracking-widest mb-1.5">
              {mode === "new" ? "Create 4-Digit Secret PIN" : "Enter 4-Digit Secret PIN"}
            </label>
            <div className="relative">
              <Lock className="absolute left-4 top-3.5 h-5 w-5 text-purple-400" />
              <input
                type="password"
                maxLength={4}
                required
                value={pin}
                onChange={(e) => setPin(e.target.value.replace(/\D/g, ""))}
                placeholder="e.g. 1234"
                className="w-full rounded-2xl border border-indigo-600 bg-slate-950/90 pl-12 pr-4 py-3 text-base font-black tracking-widest text-amber-300 placeholder-indigo-600 focus:border-indigo-400 focus:outline-none"
              />
            </div>
            <p className="text-[11px] text-indigo-300/80 mt-1">
              {mode === "new"
                ? "Remember this 4-digit PIN! You'll use it to log back in on any computer or tablet."
                : "Enter the secret 4-digit PIN you created when joining."}
            </p>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={submitting}
            className="w-full flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-amber-400 via-orange-500 to-pink-500 py-4 font-black text-slate-950 text-base shadow-xl shadow-orange-500/25 hover:scale-[1.02] disabled:opacity-50 transition-all"
          >
            {submitting ? (
              <span>Connecting to Class... ⚡</span>
            ) : (
              <>
                <span>{mode === "new" ? "Create Account & Join Class" : "Log Into Student Dashboard"}</span>
                <ArrowRight className="h-5 w-5" />
              </>
            )}
          </button>
        </form>

        {/* School Safety Callout */}
        <div className="flex items-center justify-center gap-2 text-xs text-indigo-300/80 pt-2 border-t border-indigo-800/60">
          <ShieldCheck className="h-4 w-4 text-emerald-400" />
          <span>100% Safe for Schools. No passwords or email addresses required!</span>
        </div>
      </div>

      {/* STUDENT HOW IT WORKS GUIDE */}
      <div className="w-full max-w-lg rounded-3xl border border-indigo-800/60 bg-slate-950/80 p-6 space-y-4">
        <h3 className="text-lg font-black text-center text-amber-300 flex items-center justify-center gap-2">
          <span>How It Works in 3 Easy Steps 🚀</span>
        </h3>

        <div className="grid grid-cols-1 gap-3 text-xs">
          <div className="flex items-start gap-3 p-3 rounded-2xl bg-indigo-950/60 border border-indigo-800">
            <span className="flex h-7 w-7 items-center justify-center rounded-xl bg-amber-400 text-slate-950 font-black shrink-0">1</span>
            <div>
              <span className="font-extrabold block text-white">Enter Your Class Code & Nickname</span>
              <span className="text-indigo-200">Ask your teacher for your classroom's 6-character code (e.g. SPARK9).</span>
            </div>
          </div>

          <div className="flex items-start gap-3 p-3 rounded-2xl bg-indigo-950/60 border border-indigo-800">
            <span className="flex h-7 w-7 items-center justify-center rounded-xl bg-amber-400 text-slate-950 font-black shrink-0">2</span>
            <div>
              <span className="font-extrabold block text-white">Pick Your Secret 4-Digit PIN</span>
              <span className="text-indigo-200">Keeps your wallet safe so you can log back in on any tablet or computer!</span>
            </div>
          </div>

          <div className="flex items-start gap-3 p-3 rounded-2xl bg-indigo-950/60 border border-indigo-800">
            <span className="flex h-7 w-7 items-center justify-center rounded-xl bg-amber-400 text-slate-950 font-black shrink-0">3</span>
            <div>
              <span className="font-extrabold block text-white">Launch Your Service Hustle</span>
              <span className="text-indigo-200">Brainstorm service ideas with Sparky AI and trade services with classmates!</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function StudentJoinPage() {
  return (
    <Suspense fallback={<div className="min-h-[85vh] flex items-center justify-center text-white">Sparky is warming up your classroom... ⚡</div>}>
      <JoinForm />
    </Suspense>
  );
}
