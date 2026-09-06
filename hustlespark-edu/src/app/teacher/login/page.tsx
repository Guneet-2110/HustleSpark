"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { auth } from "@/lib/firebase";
import { sendPasswordResetEmail } from "firebase/auth";
import { LogIn, Lock, Mail, CheckCircle2 } from "lucide-react";

export default function TeacherLoginPage() {
  const router = useRouter();
  const { loginTeacher } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [resetMsg, setResetMsg] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [sendingReset, setSendingReset] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setResetMsg("");
    setSubmitting(true);

    try {
      await loginTeacher(email, password);
      router.push("/teacher/dashboard");
    } catch (err: any) {
      console.error("[Login] Teacher Auth Error:", err);
      setError(err.message || "Failed to log in. Please check your credentials.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!email.trim()) {
      setError("Please enter your email address above to receive a password reset link.");
      return;
    }
    setError("");
    setResetMsg("");
    setSendingReset(true);

    try {
      await sendPasswordResetEmail(auth, email.trim());
      setResetMsg("Password reset email sent! Check your inbox.");
    } catch (err: any) {
      console.error("[Login] Password Reset Error:", err);
      if (err.code === "auth/user-not-found") {
        setError("No account found with this email. Please sign up first.");
      } else {
        setError(err.message || "Failed to send password reset email.");
      }
    } finally {
      setSendingReset(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12 bg-slate-50 dark:bg-slate-950">
      <div className="w-full max-w-md space-y-8 bg-white p-8 rounded-3xl border border-slate-200 shadow-xl dark:bg-slate-900 dark:border-slate-800">
        
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-600 text-white font-bold text-2xl shadow-md">
            🔐
          </div>
          <h2 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">
            Teacher Login
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Welcome back! Access your classroom economy dashboard.
          </p>
        </div>

        {error && (
          <div className="rounded-2xl bg-red-50 p-4 text-xs font-bold text-red-700 border border-red-200 dark:bg-red-950/50 dark:border-red-800 dark:text-red-300">
            {error}
          </div>
        )}

        {resetMsg && (
          <div className="rounded-2xl bg-emerald-50 p-4 text-xs font-bold text-emerald-800 border border-emerald-200 dark:bg-emerald-950/50 dark:border-emerald-800 dark:text-emerald-300 flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0" />
            <span>{resetMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
              School Email
            </label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="teacher@school.edu"
                className="w-full rounded-xl border border-slate-300 pl-10 pr-4 py-2.5 text-sm focus:border-indigo-600 focus:outline-none dark:border-slate-700 dark:bg-slate-800"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                Password
              </label>
              <button
                type="button"
                onClick={handleForgotPassword}
                disabled={sendingReset}
                className="text-xs font-extrabold text-indigo-600 hover:underline dark:text-indigo-400"
              >
                {sendingReset ? "Sending..." : "Forgot Password?"}
              </button>
            </div>
            <div className="relative">
              <Lock className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
                className="w-full rounded-xl border border-slate-300 pl-10 pr-4 py-2.5 text-sm focus:border-indigo-600 focus:outline-none dark:border-slate-700 dark:bg-slate-800"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full flex items-center justify-center gap-2 rounded-xl bg-indigo-600 py-3 font-bold text-white shadow-md hover:bg-indigo-700 disabled:opacity-50 transition-all"
          >
            {submitting ? (
              <span>Signing in...</span>
            ) : (
              <>
                <LogIn className="h-4 w-4" />
                <span>Log into Dashboard</span>
              </>
            )}
          </button>
        </form>

        <p className="text-center text-xs text-slate-500">
          Don't have a classroom yet?{" "}
          <Link href="/teacher/signup" className="font-bold text-indigo-600 hover:underline dark:text-indigo-400">
            Create teacher account
          </Link>
        </p>
      </div>
    </div>
  );
}
