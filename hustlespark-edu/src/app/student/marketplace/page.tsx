"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { getClassroomListings, createReview } from "@/lib/classroom";
import { Listing } from "@/types";
import { Store, ShoppingBag, Search, CheckCircle, AlertCircle, ShoppingCart, ArrowLeft, Star } from "lucide-react";

export default function StudentMarketplacePage() {
  const router = useRouter();
  const { user, role, studentProfile, activeClassroom, loading, refreshStudentProfile } = useAuth();

  const [listings, setListings] = useState<Listing[]>([]);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");
  
  // Double Confirmation Modal State
  const [confirmingListing, setConfirmingListing] = useState<Listing | null>(null);
  const [reviewingListing, setReviewingListing] = useState<Listing | null>(null);
  const [buyingId, setBuyingId] = useState<string | null>(null);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Review Form State
  const [starRating, setStarRating] = useState(5);
  const [reviewComment, setReviewComment] = useState("");
  const [submittingReview, setSubmittingReview] = useState(false);

  useEffect(() => {
    if (!loading && role !== "student") {
      router.push("/join");
    }
  }, [loading, role, router]);

  useEffect(() => {
    if (activeClassroom) {
      loadMarketplaceData();
    }
  }, [activeClassroom]);

  const loadMarketplaceData = async () => {
    if (!activeClassroom) return;
    try {
      const all = await getClassroomListings(activeClassroom.id);
      setListings(all.filter((l) => l.status === "approved" || l.status === "live"));
    } catch (err) {
      console.error("Marketplace Load Error:", err);
    }
  };

  const handleOpenBuyModal = (listing: Listing) => {
    if (!studentProfile || !activeClassroom || !user) return;
    setMessage(null);

    if (studentProfile.id === listing.studentId) {
      setMessage({ type: "error", text: "You cannot buy your own hustle listing!" });
      return;
    }

    if (studentProfile.balance < listing.price) {
      setMessage({
        type: "error",
        text: `You need ⚡ ${listing.price - studentProfile.balance} more SparkCoins to buy this!`,
      });
      return;
    }

    setConfirmingListing(listing);
  };

  const executePurchase = async () => {
    if (!confirmingListing || !studentProfile || !activeClassroom) return;

    const listing = confirmingListing;
    setBuyingId(listing.id);
    setMessage(null);

    const payload = {
      classroomId: activeClassroom.id,
      buyerId: studentProfile.id,
      listingId: listing.id,
    };

    try {
      let res = await fetch("https://us-central1-hustlespark-edu.cloudfunctions.net/purchaseListing", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        res = await fetch("/api/buy-listing", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      }

      const data = await res.json();
      if (res.ok && data.success) {
        setMessage({ type: "success", text: `Awesome! Purchased "${listing.hustleName}" for ⚡ ${listing.price} SparkCoins!` });
        setReviewingListing(listing);
        await refreshStudentProfile();
        loadMarketplaceData();
      } else {
        setMessage({ type: "error", text: data.error || "Purchase failed." });
      }
    } catch (err: any) {
      setMessage({ type: "error", text: err.message || "Purchase failed." });
    } finally {
      setBuyingId(null);
      setConfirmingListing(null);
    }
  };

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewingListing || !studentProfile || !activeClassroom) return;

    setSubmittingReview(true);
    try {
      await createReview(
        activeClassroom.id,
        reviewingListing.id,
        reviewingListing.studentId,
        studentProfile.id,
        studentProfile.username,
        starRating,
        reviewComment.trim() || "Great service!"
      );
      setMessage({ type: "success", text: `Review submitted for "${reviewingListing.hustleName}"! ⭐` });
      setReviewingListing(null);
      setReviewComment("");
      loadMarketplaceData();
    } catch (err: any) {
      setMessage({ type: "error", text: err.message || "Failed to submit review." });
    } finally {
      setSubmittingReview(false);
    }
  };

  if (loading || !studentProfile || !activeClassroom) {
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center p-6 space-y-4">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-emerald-500" />
        <p className="text-sm font-semibold text-slate-600">Loading Class Marketplace...</p>
      </div>
    );
  }

  const filteredListings = listings.filter((l) => {
    const matchesSearch =
      l.hustleName.toLowerCase().includes(search.toLowerCase()) ||
      (l.studentUsername && l.studentUsername.toLowerCase().includes(search.toLowerCase()));
    const matchesCategory = categoryFilter === "All" || l.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-8">
      
      {/* Header Banner */}
      <div className="rounded-3xl bg-gradient-to-r from-emerald-900 via-teal-950 to-slate-950 p-6 sm:p-8 text-white shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full bg-emerald-400/20 px-3.5 py-1 text-xs font-black text-emerald-300 border border-emerald-400/30">
            <Store className="h-4 w-4" />
            <span>Classroom Marketplace</span>
          </div>
          <h1 className="text-3xl font-black mt-2">Classroom Marketplace 🛒</h1>
          <p className="text-xs text-emerald-200 mt-1">
            Browse and buy services created by your classmates in {activeClassroom.className}!
          </p>
        </div>

        <div className="bg-slate-950/80 p-4 rounded-2xl border border-emerald-700 text-center w-full md:w-auto">
          <span className="block text-[10px] font-extrabold uppercase tracking-widest text-emerald-400">
            Your Wallet
          </span>
          <span className="text-3xl font-black text-emerald-400 font-mono">
            ⚡ {studentProfile.balance}
          </span>
          <span className="block text-[10px] font-bold text-slate-400">
            {activeClassroom.currencyName}
          </span>
        </div>
      </div>

      {message && (
        <div
          className={`rounded-2xl p-4 text-xs font-extrabold flex items-center justify-between shadow-md border ${
            message.type === "success"
              ? "bg-emerald-50 text-emerald-800 border-emerald-200 dark:bg-emerald-950 dark:border-emerald-800 dark:text-emerald-300"
              : "bg-red-50 text-red-800 border-red-200 dark:bg-red-950 dark:border-red-800 dark:text-red-300"
          }`}
        >
          <div className="flex items-center gap-2">
            {message.type === "success" ? <CheckCircle className="h-5 w-5" /> : <AlertCircle className="h-5 w-5" />}
            <span>{message.text}</span>
          </div>
          <button onClick={() => setMessage(null)} className="text-slate-400 hover:text-slate-600">✕</button>
        </div>
      )}

      {/* Search & Filter Controls */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Search */}
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by hustle or classmate..."
            className="w-full rounded-2xl border border-slate-300 pl-10 pr-4 py-2.5 text-xs font-semibold dark:bg-slate-900 dark:border-slate-800"
          />
        </div>

        {/* Categories */}
        <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto pb-1">
          {["All", "Services", "Digital", "Fun"].map((cat) => (
            <button
              key={cat}
              onClick={() => setCategoryFilter(cat)}
              className={`rounded-xl px-3.5 py-1.5 text-xs font-bold transition-all ${
                categoryFilter === cat
                  ? "bg-emerald-600 text-white shadow-xs"
                  : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50 dark:bg-slate-900 dark:border-slate-800 dark:text-slate-300"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Product Grid */}
      {filteredListings.length === 0 ? (
        <div className="py-16 text-center space-y-3 bg-white rounded-3xl border border-slate-200 dark:bg-slate-900 dark:border-slate-800">
          <p className="text-3xl">📦</p>
          <h3 className="font-bold text-slate-800 dark:text-slate-200">No active services in marketplace yet!</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Be the first entrepreneur in your class to generate a hustle idea and submit it to your teacher!
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {filteredListings.map((item) => {
            const isOwnListing = item.studentId === studentProfile.id;
            return (
              <div
                key={item.id}
                className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm hover:shadow-lg transition-shadow dark:bg-slate-900 dark:border-slate-800 flex flex-col justify-between space-y-4"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-4xl">{item.logoUrl || "⚡"}</span>
                    <div className="flex flex-col items-end">
                      <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-black text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                        ⚡ {item.price} SparkCoins
                      </span>
                      {item.avgRating ? (
                        <div className="flex items-center gap-1 text-xs font-bold text-amber-500 mt-1">
                          <Star className="h-3.5 w-3.5 fill-amber-400" />
                          <span>{item.avgRating} ({item.reviewCount || 0})</span>
                        </div>
                      ) : null}
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-black text-slate-900 dark:text-white">{item.hustleName}</h3>
                    <span className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400">
                      By: {item.studentUsername || "Classmate"} {isOwnListing && "(You)"}
                    </span>
                  </div>

                  <p className="text-xs text-slate-600 dark:text-slate-400">{item.description}</p>

                  {item.aiGeneratedCopy && (
                    <div className="rounded-2xl bg-slate-50 p-3 border border-slate-200 dark:bg-slate-800/50 dark:border-slate-700">
                      <p className="text-xs italic text-slate-700 dark:text-slate-300">
                        "{item.aiGeneratedCopy}"
                      </p>
                    </div>
                  )}
                </div>

                <button
                  onClick={() => handleOpenBuyModal(item)}
                  disabled={isOwnListing}
                  className={`w-full flex items-center justify-center gap-2 rounded-2xl py-3 font-black text-xs shadow-md transition-all ${
                    isOwnListing
                      ? "bg-slate-200 text-slate-500 cursor-not-allowed dark:bg-slate-800 dark:text-slate-500"
                      : "bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-50"
                  }`}
                >
                  {isOwnListing ? (
                    <span>Your Listing</span>
                  ) : (
                    <>
                      <ShoppingBag className="h-4 w-4" />
                      <span>Buy for ⚡ {item.price} {activeClassroom.currencyName}</span>
                    </>
                  )}
                </button>
              </div>
            );
          })}
        </div>
      )}

      {/* DOUBLE CONFIRMATION MODAL */}
      {confirmingListing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md bg-white p-6 sm:p-8 rounded-3xl border-2 border-emerald-500 shadow-2xl dark:bg-slate-900 dark:border-emerald-600 space-y-6">
            {/* Confirmation details */}
            <div className="text-center space-y-2">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl bg-emerald-100 text-3xl shadow-md">
                {confirmingListing.logoUrl || "🛒"}
              </div>
              <h3 className="text-2xl font-black text-slate-900 dark:text-white">
                Confirm Purchase 🛒
              </h3>
              <p className="text-xs font-bold text-slate-700 dark:text-slate-300 leading-relaxed">
                Are you sure you want to buy <strong>{confirmingListing.hustleName}</strong> for <strong>{confirmingListing.price} {activeClassroom?.currencyName || "SparkCoins"}</strong>? You will have <strong>{studentProfile.balance - confirmingListing.price} {activeClassroom?.currencyName || "SparkCoins"}</strong> left.
              </p>
            </div>

            {/* Price & Balance Details Box */}
            <div className="rounded-2xl bg-slate-50 p-4 border border-slate-200 dark:bg-slate-800 dark:border-slate-700 space-y-2 text-xs">
              <div className="flex justify-between font-bold text-slate-700 dark:text-slate-300">
                <span>Item:</span>
                <span className="text-slate-900 dark:text-white font-extrabold">{confirmingListing.hustleName}</span>
              </div>
              <div className="flex justify-between font-bold text-slate-700 dark:text-slate-300">
                <span>Price:</span>
                <span className="text-emerald-600 dark:text-emerald-400 font-black">⚡ {confirmingListing.price} {activeClassroom?.currencyName || "SparkCoins"}</span>
              </div>
              <div className="flex justify-between text-slate-500 pt-2 border-t border-slate-200 dark:border-slate-700">
                <span>Your Current Balance:</span>
                <span className="font-mono font-bold">⚡ {studentProfile.balance} {activeClassroom?.currencyName || "SparkCoins"}</span>
              </div>
              <div className="flex justify-between text-slate-900 dark:text-white font-extrabold">
                <span>Remaining Balance After Purchase:</span>
                <span className="font-mono text-emerald-600 font-black">⚡ {studentProfile.balance - confirmingListing.price} {activeClassroom?.currencyName || "SparkCoins"}</span>
              </div>
            </div>

            {/* Dialog Buttons */}
            <div className="grid grid-cols-2 gap-3 pt-2">
              <button
                type="button"
                onClick={() => setConfirmingListing(null)}
                className="flex items-center justify-center gap-2 rounded-2xl border-2 border-slate-300 bg-white py-3.5 font-bold text-slate-700 hover:bg-slate-100 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-200"
              >
                <ArrowLeft className="h-4 w-4" />
                <span>Go Back</span>
              </button>

              <button
                type="button"
                disabled={buyingId === confirmingListing.id}
                onClick={executePurchase}
                className="flex items-center justify-center gap-2 rounded-2xl bg-emerald-600 py-3.5 font-black text-white shadow-lg shadow-emerald-600/30 hover:bg-emerald-700 disabled:opacity-50 transition-all"
              >
                {buyingId === confirmingListing.id ? (
                  <span>Purchasing...</span>
                ) : (
                  <span>Yes, Buy It! 🛒</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* LEAVE REVIEW MODAL */}
      {reviewingListing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md bg-white p-6 sm:p-8 rounded-3xl border-2 border-amber-400 shadow-2xl dark:bg-slate-900 dark:border-amber-500 space-y-5">
            <div className="text-center space-y-2">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-100 text-3xl">
                ⭐
              </div>
              <h3 className="text-2xl font-black text-slate-900 dark:text-white">
                Leave a Review ⭐
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400">
                Rate your experience with "{reviewingListing.hustleName}" by {reviewingListing.studentUsername || "seller"}!
              </p>
            </div>

            <form onSubmit={handleSubmitReview} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase mb-2 text-center">
                  Star Rating
                </label>
                <div className="flex items-center justify-center gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setStarRating(star)}
                      className="p-1.5 transition-transform hover:scale-125"
                    >
                      <Star
                        className={`h-8 w-8 ${
                          star <= starRating ? "text-amber-400 fill-amber-400" : "text-slate-300 dark:text-slate-700"
                        }`}
                      />
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">
                  Your Feedback Comment
                </label>
                <textarea
                  rows={3}
                  value={reviewComment}
                  onChange={(e) => setReviewComment(e.target.value)}
                  placeholder="e.g. Great tutoring session! Helped me understand math."
                  className="w-full rounded-2xl border border-slate-300 p-3 text-xs dark:bg-slate-800 dark:border-slate-700"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setReviewingListing(null)}
                  className="rounded-xl border border-slate-300 px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100"
                >
                  Skip Review
                </button>
                <button
                  type="submit"
                  disabled={submittingReview}
                  className="rounded-xl bg-amber-400 px-5 py-2 text-xs font-black text-slate-950 hover:bg-amber-300 disabled:opacity-50"
                >
                  {submittingReview ? "Submitting..." : "Submit Review ⭐"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
