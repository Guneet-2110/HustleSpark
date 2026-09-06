"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { createListing } from "@/lib/classroom";
import { Sparkles, CheckCircle2, ArrowRight, RefreshCw, Wand2, Lock, ArrowLeft } from "lucide-react";

interface HustleIdea {
  hustleName: string;
  description: string;
  price: number;
  cost?: number;
  aiGeneratedCopy: string;
  category: string;
  suggestedLogo: string;
}

export default function AIGeneratorPage() {
  const router = useRouter();
  const { studentProfile, activeClassroom } = useAuth();

  const [interest, setInterest] = useState("");
  const [loading, setLoading] = useState(false);
  const [generatingPitch, setGeneratingPitch] = useState(false);
  const [ideas, setIdeas] = useState<HustleIdea[]>([]);
  const [selectedIdea, setSelectedIdea] = useState<HustleIdea | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  // Editable fields for chosen idea
  const [customName, setCustomName] = useState("");
  const [customDescription, setCustomDescription] = useState("");
  const [customPrice, setCustomPrice] = useState(15);
  const [customCost, setCustomCost] = useState(5); // LOCKED: set by AI automatically
  const [customCopy, setCustomCopy] = useState("");
  const [customLogo, setCustomLogo] = useState("⚡");

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    setIdeas([]);
    setSelectedIdea(null);

    const payload = { promptInterest: interest || "tutoring, skills, and classroom services" };

    try {
      let res = await fetch("/api/generate-hustle", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok || res.headers.get("content-type")?.includes("text/html")) {
        res = await fetch("https://us-central1-hustlespark-edu.cloudfunctions.net/generateHustleIdeas", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      }

      const data = await res.json();
      if (data.ideas) {
        setIdeas(data.ideas);
      } else {
        setError(data.error || "Failed to generate hustle ideas.");
      }
    } catch (err: any) {
      console.error("Cloud Function Error:", err);
      setError(err.message || "Failed to connect to Sparky AI service.");
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateAIPitch = async () => {
    if (!customName.trim()) {
      setError("Please enter a hustle name first!");
      return;
    }

    setGeneratingPitch(true);
    setError("");
    try {
      let res = await fetch("https://us-central1-hustlespark-edu.cloudfunctions.net/generatePitch", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ hustleName: customName, description: customDescription }),
      });
      const data = await res.json();
      if (data.pitch) {
        setCustomCopy(data.pitch);
      }
    } catch (err: any) {
      console.error("Pitch Helper Error:", err);
    } finally {
      setGeneratingPitch(false);
    }
  };

  const handleSelectIdea = (idea: HustleIdea) => {
    setSelectedIdea(idea);
    setCustomName(idea.hustleName);
    setCustomDescription(idea.description);
    setCustomPrice(idea.price || 15);
    setCustomCost(idea.cost || 5); // AI assigned startup fee
    setCustomCopy(idea.aiGeneratedCopy || "");
    setCustomLogo(idea.suggestedLogo || "⚡");
  };

  const handleOpenConfirmModal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customName.trim() || !customDescription.trim()) {
      setError("Please fill in both name and description.");
      return;
    }
    setError("");
    setShowConfirmModal(true);
  };

  const executePublishListing = async () => {
    if (!studentProfile || !activeClassroom) return;

    setSubmitting(true);
    try {
      await createListing(
        activeClassroom.id,
        studentProfile.id,
        studentProfile.username,
        customName.trim(),
        customDescription.trim(),
        Number(customPrice),
        customCopy.trim(),
        customLogo,
        selectedIdea?.category || "Services",
        Number(customCost)
      );

      setShowConfirmModal(false);
      router.push("/student/dashboard");
    } catch (err: any) {
      setError(err.message || "Failed to submit listing for approval.");
      setShowConfirmModal(false);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 space-y-8">
      
      {/* Header */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-2 rounded-full bg-amber-100 px-4 py-1.5 text-xs font-bold text-amber-800 dark:bg-amber-950 dark:text-amber-300">
          <Sparkles className="h-4 w-4 text-amber-500" />
          <span>Sparky AI Business Coach ⚡</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white">
          AI Service Hustle Generator ⚡
        </h1>
        <p className="text-sm text-slate-600 dark:text-slate-400 max-w-xl mx-auto">
          Tell Sparky what you like to do! Sparky will generate 3 awesome service ideas that cost zero physical materials to launch!
        </p>
      </div>

      {/* Generator Prompt Box */}
      <div className="rounded-3xl bg-gradient-to-r from-amber-400 via-orange-400 to-amber-500 p-6 sm:p-8 text-slate-950 shadow-xl space-y-4 max-w-2xl mx-auto border-2 border-amber-300">
        <h3 className="text-lg font-black tracking-tight">What do you enjoy doing?</h3>
        
        <form onSubmit={handleGenerate} className="space-y-4">
          <input
            type="text"
            value={interest}
            onChange={(e) => setInterest(e.target.value)}
            placeholder="e.g. math tutoring, drawing comics, sports referee, study helper..."
            className="w-full rounded-2xl border-0 bg-white px-4 py-3 text-sm font-semibold text-slate-900 placeholder-slate-400 shadow-inner focus:outline-none focus:ring-2 focus:ring-slate-950"
          />

          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 rounded-2xl bg-slate-950 py-3.5 font-black text-amber-300 text-base hover:bg-slate-900 disabled:opacity-50 transition-all shadow-lg"
          >
            {loading ? (
              <>
                <RefreshCw className="h-5 w-5 animate-spin text-amber-400" />
                <span>Sparky is thinking...</span>
              </>
            ) : (
              <>
                <Sparkles className="h-5 w-5 text-amber-400" />
                <span>Generate 3 Hustle Ideas!</span>
              </>
            )}
          </button>
        </form>
      </div>

      {error && (
        <div className="rounded-2xl bg-red-50 p-4 text-xs font-bold text-red-700 border border-red-200 dark:bg-red-950/50 dark:border-red-800 text-center max-w-2xl mx-auto">
          {error}
        </div>
      )}

      {/* Idea Cards List */}
      {ideas.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-xl font-black text-slate-900 dark:text-white text-center">
            Pick Your Favorite Service Idea! ✨
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {ideas.map((idea, index) => (
              <div
                key={index}
                onClick={() => handleSelectIdea(idea)}
                className={`group cursor-pointer rounded-3xl border-2 p-6 transition-all hover:scale-[1.02] flex flex-col justify-between space-y-4 shadow-lg ${
                  selectedIdea?.hustleName === idea.hustleName
                    ? "border-amber-400 bg-amber-50/50 dark:bg-slate-900"
                    : "border-slate-200 bg-white hover:border-amber-400 dark:bg-slate-900 dark:border-slate-800"
                }`}
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-4xl">{idea.suggestedLogo}</span>
                    <span className="rounded-full bg-emerald-100 px-3 py-1 text-sm font-black text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                      ⚡ {idea.price} SparkCoins
                    </span>
                  </div>

                  <h4 className="text-lg font-extrabold text-slate-900 dark:text-white group-hover:text-indigo-600">
                    {idea.hustleName}
                  </h4>

                  <p className="text-xs text-slate-600 dark:text-slate-400">{idea.description}</p>

                  {/* Kid-Friendly Cost Phrasing */}
                  <div className="rounded-2xl bg-slate-50 p-3 border border-slate-200 dark:bg-slate-800 dark:border-slate-700 space-y-1">
                    <p className="text-xs font-bold text-amber-900 dark:text-amber-300">
                      🪙 It costs <span className="text-base font-black text-amber-600 dark:text-amber-400">{idea.cost || 5}</span> SparkCoins to open your shop! This comes out of your wallet when you start.
                    </p>
                    <p className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 italic">
                      Think of it like paying rent for your little shop!
                    </p>
                    <div className="pt-1.5 flex items-center justify-between text-xs font-black border-t border-slate-200 dark:border-slate-700">
                      <span className="text-slate-600 dark:text-slate-300">Shop Opening Fee 🏪:</span>
                      <span className="text-amber-600 font-extrabold text-sm">⚡ {idea.cost || 5}</span>
                    </div>
                    <div className="flex items-center justify-between text-xs font-black">
                      <span className="text-emerald-600 dark:text-emerald-400">Money You Kept 💰:</span>
                      <span className="text-emerald-600 font-extrabold text-sm">⚡ {(idea.price || 15) - (idea.cost || 5)}</span>
                    </div>
                  </div>

                  <div className="rounded-2xl bg-indigo-50 p-3 border border-indigo-100 dark:bg-indigo-950/50 dark:border-indigo-900">
                    <span className="block text-[10px] font-bold text-indigo-500 uppercase">AI Sales Pitch Slogan:</span>
                    <p className="text-xs font-semibold text-indigo-950 dark:text-indigo-200 italic mt-0.5">
                      "{idea.aiGeneratedCopy}"
                    </p>
                  </div>
                </div>

                <button className="w-full flex items-center justify-center gap-1.5 rounded-xl bg-slate-900 py-2.5 text-xs font-bold text-white group-hover:bg-amber-400 group-hover:text-slate-950 transition-colors">
                  <span>Select & Customize</span>
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Customize & Publish Panel */}
      {selectedIdea && (
        <div className="rounded-3xl border-2 border-amber-400 bg-white p-6 sm:p-8 shadow-2xl dark:bg-slate-900 space-y-6 max-w-2xl mx-auto">
          <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4">
            <h3 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-2">
              <CheckCircle2 className="h-6 w-6 text-emerald-500" />
              Customize & Publish Your Service
            </h3>
            <button
              onClick={() => setSelectedIdea(null)}
              className="text-xs font-bold text-indigo-600 hover:underline"
            >
              Pick a different idea
            </button>
          </div>

          <form onSubmit={handleOpenConfirmModal} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">
                Hustle Name
              </label>
              <input
                type="text"
                required
                value={customName}
                onChange={(e) => setCustomName(e.target.value)}
                className="w-full rounded-xl border border-slate-300 px-4 py-2.5 text-sm dark:bg-slate-800 dark:border-slate-700"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">
                Service Description
              </label>
              <textarea
                required
                rows={3}
                value={customDescription}
                onChange={(e) => setCustomDescription(e.target.value)}
                className="w-full rounded-xl border border-slate-300 px-4 py-2.5 text-sm dark:bg-slate-800 dark:border-slate-700"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">
                  Sale Price (SparkCoins)
                </label>
                <input
                  type="number"
                  min={1}
                  max={200}
                  required
                  value={customPrice}
                  onChange={(e) => setCustomPrice(Number(e.target.value))}
                  className="w-full rounded-xl border border-slate-300 px-4 py-2.5 text-sm font-black text-emerald-600 dark:bg-slate-800 dark:border-slate-700"
                />
              </div>

              {/* LOCKED READ-ONLY COST FIELD */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase mb-1 flex items-center gap-1">
                  <Lock className="h-3.5 w-3.5 text-amber-500" />
                  <span>Shop Opening Fee 🏪</span>
                </label>
                <div className="relative">
                  <input
                    type="number"
                    disabled
                    readOnly
                    value={customCost}
                    className="w-full rounded-xl border border-amber-300 bg-amber-50 px-4 py-2.5 text-sm font-black text-amber-900 cursor-not-allowed opacity-90 dark:bg-amber-950/40 dark:border-amber-800 dark:text-amber-300"
                  />
                  <span className="absolute right-3 top-2.5 text-[10px] font-bold text-amber-700 dark:text-amber-400">
                    Locked 🔒
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">
                  Logo Emoji
                </label>
                <input
                  type="text"
                  maxLength={2}
                  value={customLogo}
                  onChange={(e) => setCustomLogo(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 px-4 py-2.5 text-sm text-center text-xl dark:bg-slate-800 dark:border-slate-700"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase">
                  Sales Pitch Slogan
                </label>
                <button
                  type="button"
                  onClick={handleGenerateAIPitch}
                  disabled={generatingPitch}
                  className="flex items-center gap-1 text-[11px] font-extrabold text-purple-600 hover:underline dark:text-purple-400"
                >
                  <Wand2 className="h-3.5 w-3.5" />
                  <span>{generatingPitch ? "AI Pitching..." : "Help Me Write My Pitch!"}</span>
                </button>
              </div>
              <input
                type="text"
                value={customCopy}
                onChange={(e) => setCustomCopy(e.target.value)}
                className="w-full rounded-xl border border-slate-300 px-4 py-2.5 text-sm dark:bg-slate-800 dark:border-slate-700"
              />
            </div>

            {/* KID FRIENDLY COST EXPLANATION BOX */}
            <div className="rounded-2xl bg-gradient-to-br from-amber-100 to-orange-100 p-4 border-2 border-amber-400 text-slate-950 space-y-2 dark:from-amber-950/60 dark:to-slate-900 dark:text-amber-200 dark:border-amber-800">
              <p className="text-xs font-extrabold flex items-center gap-1">
                <span>🏪 Shop Opening Fee:</span>
                <span className="text-base font-black text-amber-600 dark:text-amber-400">⚡ {customCost} SparkCoins</span>
              </p>
              <p className="text-xs font-bold">
                🪙 It costs <span className="text-sm font-black text-amber-700 dark:text-amber-300">{customCost} SparkCoins</span> to open your shop! This comes out of your wallet when you start.
              </p>
              <p className="text-xs font-semibold text-slate-700 dark:text-slate-400 italic">
                Think of it like paying rent for your little shop!
              </p>
              <div className="pt-2 border-t border-amber-300 dark:border-amber-800 flex items-center justify-between">
                <span className="text-xs font-black uppercase text-emerald-800 dark:text-emerald-300">Money You Kept 💰 per sale:</span>
                <span className="text-xl font-black text-emerald-600 dark:text-emerald-400">⚡ {customPrice - customCost} SparkCoins</span>
              </div>
            </div>

            <button
              type="submit"
              className="w-full flex items-center justify-center gap-2 rounded-2xl bg-emerald-600 py-3.5 font-black text-white text-base shadow-lg shadow-emerald-600/20 hover:bg-emerald-700 transition-all"
            >
              <span>Submit Listing to Teacher for Approval</span>
              <ArrowRight className="h-5 w-5" />
            </button>
          </form>
        </div>
      )}

      {/* DOUBLE CONFIRMATION MODAL: PUBLISH LISTING */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md bg-white p-6 sm:p-8 rounded-3xl border-2 border-emerald-500 shadow-2xl dark:bg-slate-900 dark:border-emerald-600 space-y-6 text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl bg-emerald-100 text-3xl shadow-md">
              🚀
            </div>

            <h3 className="text-2xl font-black text-slate-900 dark:text-white">
              Send to Teacher for Approval? 🚀
            </h3>

            <p className="text-xs font-bold text-slate-700 dark:text-slate-300 leading-relaxed">
              Are you ready to send your listing to your teacher for approval? Once submitted you cannot edit it!
            </p>

            <div className="rounded-2xl bg-slate-50 p-4 border border-slate-200 dark:bg-slate-800 dark:border-slate-700 text-xs space-y-1 text-left">
              <span className="font-black text-slate-900 dark:text-white text-sm block">{customLogo} {customName}</span>
              <span className="text-emerald-600 font-bold block">Price: ⚡ {customPrice} {activeClassroom?.currencyName || "SparkCoins"}</span>
              <span className="text-amber-700 dark:text-amber-400 font-bold block">Shop Opening Fee 🏪: ⚡ {customCost} {activeClassroom?.currencyName || "SparkCoins"}</span>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowConfirmModal(false)}
                className="flex items-center justify-center gap-1.5 rounded-2xl border-2 border-slate-300 bg-white py-3.5 font-bold text-slate-700 hover:bg-slate-100 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-200"
              >
                <ArrowLeft className="h-4 w-4" />
                <span>Go Back</span>
              </button>

              <button
                type="button"
                disabled={submitting}
                onClick={executePublishListing}
                className="flex items-center justify-center gap-1.5 rounded-2xl bg-emerald-600 py-3.5 font-black text-white shadow-lg shadow-emerald-600/30 hover:bg-emerald-700 disabled:opacity-50 transition-all"
              >
                {submitting ? (
                  <span>Submitting...</span>
                ) : (
                  <span>Yes, Submit It! 🚀</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
