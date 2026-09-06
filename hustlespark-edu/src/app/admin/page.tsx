"use client";

import React, { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Classroom } from "@/types";
import { ShieldAlert, Users, Store, School, DollarSign, Activity } from "lucide-react";

export default function AdminDashboard() {
  const [classrooms, setClassrooms] = useState<Classroom[]>([]);
  const [totalStudents, setTotalStudents] = useState(0);
  const [totalListings, setTotalListings] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAdminStats();
  }, []);

  const loadAdminStats = async () => {
    setLoading(true);
    try {
      const classSnap = await getDocs(collection(db, "classrooms"));
      const classList = classSnap.docs.map((docSnap) => ({ id: docSnap.id, ...docSnap.data() } as Classroom));
      setClassrooms(classList);

      let sCount = 0;
      let lCount = 0;

      for (const cls of classList) {
        const sSnap = await getDocs(collection(db, "classrooms", cls.id, "students"));
        sCount += sSnap.size;

        const lSnap = await getDocs(collection(db, "classrooms", cls.id, "listings"));
        lCount += lSnap.size;
      }

      setTotalStudents(sCount);
      setTotalListings(lCount);
    } catch (err) {
      console.error("Admin Load Error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-8">
      
      {/* Header */}
      <div className="rounded-3xl bg-slate-900 p-6 sm:p-8 text-white shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border border-slate-800">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full bg-amber-400/20 px-3 py-1 text-xs font-black text-amber-300 border border-amber-400/30">
            <ShieldAlert className="h-4 w-4" />
            <span>Platform Operations Admin</span>
          </div>
          <h1 className="text-3xl font-black mt-2">HustleSpark Education Admin</h1>
          <p className="text-xs text-slate-400 mt-1">Platform overview & live classroom monitoring for Guneet.</p>
        </div>

        <button
          onClick={loadAdminStats}
          disabled={loading}
          className="rounded-xl bg-indigo-600 px-4 py-2 text-xs font-bold text-white hover:bg-indigo-700 shadow-xs"
        >
          {loading ? "Refreshing..." : "Refresh Platform Stats"}
        </button>
      </div>

      {/* Global Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-6">
        <div className="rounded-3xl bg-white p-6 border border-slate-200 shadow-sm dark:bg-slate-900 dark:border-slate-800">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">Active Classrooms</span>
            <School className="h-5 w-5 text-indigo-600" />
          </div>
          <span className="text-3xl font-black text-slate-900 dark:text-white mt-2 block">
            {classrooms.length}
          </span>
        </div>

        <div className="rounded-3xl bg-white p-6 border border-slate-200 shadow-sm dark:bg-slate-900 dark:border-slate-800">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">Enrolled Students</span>
            <Users className="h-5 w-5 text-emerald-600" />
          </div>
          <span className="text-3xl font-black text-slate-900 dark:text-white mt-2 block">
            {totalStudents}
          </span>
        </div>

        <div className="rounded-3xl bg-white p-6 border border-slate-200 shadow-sm dark:bg-slate-900 dark:border-slate-800">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">Total Listings</span>
            <Store className="h-5 w-5 text-amber-500" />
          </div>
          <span className="text-3xl font-black text-slate-900 dark:text-white mt-2 block">
            {totalListings}
          </span>
        </div>

        <div className="rounded-3xl bg-white p-6 border border-slate-200 shadow-sm dark:bg-slate-900 dark:border-slate-800">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">System Health</span>
            <Activity className="h-5 w-5 text-purple-600" />
          </div>
          <span className="text-3xl font-black text-emerald-500 mt-2 block">
            100% OK
          </span>
        </div>
      </div>

      {/* Classrooms Table */}
      <div className="rounded-3xl bg-white p-6 border border-slate-200 shadow-sm dark:bg-slate-900 dark:border-slate-800 space-y-4">
        <h3 className="text-lg font-bold text-slate-900 dark:text-white">Active Classroom Directory</h3>

        {classrooms.length === 0 ? (
          <p className="text-xs text-slate-500 italic">No classrooms registered on the platform yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-slate-200 text-slate-500 dark:border-slate-800">
                <tr>
                  <th className="py-3 px-2 font-bold">Class Name</th>
                  <th className="py-3 px-2 font-bold">Teacher</th>
                  <th className="py-3 px-2 font-bold">Join Code</th>
                  <th className="py-3 px-2 font-bold">Currency</th>
                  <th className="py-3 px-2 font-bold">Created At</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {classrooms.map((cls) => (
                  <tr key={cls.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                    <td className="py-3 px-2 font-bold text-slate-900 dark:text-white">{cls.className}</td>
                    <td className="py-3 px-2 text-slate-600 dark:text-slate-300">{cls.teacherName}</td>
                    <td className="py-3 px-2 font-mono font-black text-amber-500">{cls.joinCode}</td>
                    <td className="py-3 px-2 font-semibold text-emerald-600">{cls.currencyName}</td>
                    <td className="py-3 px-2 text-slate-400">
                      {new Date(cls.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  );
}
