"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import SlowToast from "@/components/slow-toast";
import { UserPlus, Lock, Mail, User, School, Sparkles, CheckCircle2 } from "lucide-react";

export default function TeacherSignupPage() {
  const router = useRouter();
  const { signupTeacher } = useAuth();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [className, setClassName] = useState("5th Grade Entrepreneurs");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);

    try {
      await signupTeacher(email, password, name, className);
      router.push("/teacher/dashboard");
    } catch (err: any) {
      console.error("Signup Error Details:", err);
      let friendlyMsg = err.message || "Failed to create teacher account.";
      const code = err.code || "";

      if (code === "auth/email-already-in-use") {
        friendlyMsg = "This email is already registered! Please click Teacher Login to sign in.";
      } else if (code === "auth/invalid-email") {
        friendlyMsg = "Please enter a valid school email address (e.g. teacher@school.edu).";
      } else if (code === "auth/weak-password") {
        friendlyMsg = "Password is too weak! Please use at least 6 characters.";
      }

      setError(friendlyMsg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12 bg-slate-50 dark:bg-slate-950">
      <SlowToast isLoading={submitting} operationName="Teacher Registration" />

      <div className="w-full max-w-md space-y-8 bg-white p-8 rounded-3xl border border-slate-200 shadow-xl dark:bg-slate-900 dark:border-slate-800">
        
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-600 text-white font-bold text-2xl shadow-md">
            🍎
          </div>
          <h2 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">
            Teacher Registration
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Create your free educator account and launch your classroom economy.
          </p>
        </div>

        {/* Clear What Happens Next Callout */}
        <div className="rounded-2xl bg-indigo-50 p-4 border border-indigo-100 dark:bg-indigo-950/50 dark:border-indigo-900 space-y-2 text-xs">
          <span className="font-extrabold text-indigo-900 dark:text-indigo-300 flex items-center gap-1.5">
            <Sparkles className="h-4 w-4 text-amber-500" />
            What happens after registration?
          </span>
          <ul className="space-y-1 text-slate-600 dark:text-slate-300 font-medium">
            <li className="flex items-center gap-1.5">
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
              <span>Instant 6-character Join Code generated for your class.</span>
            </li>
            <li className="flex items-center gap-1.5">
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
              <span>Full control over approvals, market events, and loans.</span>
            </li>
            <li className="flex items-center gap-1.5">
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
              <span>100% email-free for your students (school-safe).</span>
            </li>
          </ul>
        </div>

        {error && (
          <div className="rounded-2xl bg-red-50 p-4 text-xs font-bold text-red-700 border border-red-200 dark:bg-red-950/50 dark:border-red-800 dark:text-red-300">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
              Full Name
            </label>
            <div className="relative">
              <User className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Ms. Johnson"
                className="w-full rounded-xl border border-slate-300 pl-10 pr-4 py-2.5 text-sm focus:border-indigo-600 focus:outline-none dark:border-slate-700 dark:bg-slate-800"
              />
            </div>
          </div>

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
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
              <input
                type="password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="At least 6 characters"
                className="w-full rounded-xl border border-slate-300 pl-10 pr-4 py-2.5 text-sm focus:border-indigo-600 focus:outline-none dark:border-slate-700 dark:bg-slate-800"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
              Classroom Name
            </label>
            <div className="relative">
              <School className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
              <input
                type="text"
                required
                value={className}
                onChange={(e) => setClassName(e.target.value)}
                placeholder="e.g. Period 2 Entrepreneurship"
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
              <span>Setting up your class...</span>
            ) : (
              <>
                <UserPlus className="h-4 w-4" />
                <span>Create Teacher Account</span>
              </>
            )}
          </button>
        </form>

        <p className="text-center text-xs text-slate-500">
          Already have an account?{" "}
          <Link href="/teacher/login" className="font-bold text-indigo-600 hover:underline dark:text-indigo-400">
            Teacher Login
          </Link>
        </p>
      </div>
    </div>
  );
}
