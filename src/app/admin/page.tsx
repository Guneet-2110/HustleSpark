"use client";

import { useEffect, useState } from "react";
import { collection, query, orderBy, limit, getDocs, where, Timestamp } from "firebase/firestore";
import { useFirestore } from "@/firebase";
import { useAuth } from "@/hooks/use-auth";

const ADMIN_EMAILS = ["guneet.ar2010@gmail.com", "tester@gmail.com"];

const fmt = (n: number) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(n);

const fmtDate = (ts: any) => {
  try { return ts?.toDate?.().toLocaleDateString("en-US", { month: "short", day: "numeric" }) ?? "—"; }
  catch { return "—"; }
};

const STATUS_LABEL: Record<string, string> = {
  completed: "Completed",
  pending_delivery: "Awaiting Delivery",
  pending_confirmation: "Awaiting Confirm",
  disputed: "Disputed",
};

const STATUS_CLASS: Record<string, string> = {
  completed: "bg-green-100 text-green-800",
  pending_delivery: "bg-yellow-100 text-yellow-800",
  pending_confirmation: "bg-blue-100 text-blue-800",
  disputed: "bg-red-100 text-red-800",
};

export default function AdminDashboardPage() {
  const { user, isLoggedIn } = useAuth();
  const firestore = useFirestore();

  const [loading, setLoading] = useState(true);
  const [totalSales, setTotalSales] = useState(0);
  const [grossRevenue, setGrossRevenue] = useState(0);
  const [platformEarnings, setPlatformEarnings] = useState(0);
  const [activeUsers, setActiveUsers] = useState(0);
  const [categories, setCategories] = useState<{ category: string; count: number }[]>([]);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [referralLinks, setReferralLinks] = useState<any[]>([]);
  const [showNewLink, setShowNewLink] = useState(false);
  const [newLinkName, setNewLinkName] = useState('');

  const isAdmin = ADMIN_EMAILS.includes(user?.email ?? "");

  useEffect(() => {
    if (!firestore || !isAdmin) return;
    fetchAll();
  }, [firestore, isAdmin]);

  async function fetchAll() {
    setLoading(true);
    try {
      await Promise.all([fetchMetrics(), fetchCategories(), fetchTransactions(), fetchReferralLinks()]);
    } finally {
      setLoading(false);
    }
  }

  async function fetchMetrics() {
    const snap = await getDocs(collection(firestore!, "transactions"));
    let sales = 0, gross = 0;
    snap.forEach((doc) => {
      const d = doc.data();
      if (["completed", "pending_delivery", "pending_confirmation"].includes(d.status)) {
        sales++;
        gross += d.totalAmount ?? d.amount ?? 0;
      }
    });
    setTotalSales(sales);
    setGrossRevenue(gross);
    setPlatformEarnings(Math.round(gross * 0.1));

    try {
      const thirtyDaysAgo = Timestamp.fromDate(new Date(Date.now() - 30 * 24 * 60 * 60 * 1000));
      const usersSnap = await getDocs(
        query(collection(firestore!, "users"), where("lastActive", ">=", thirtyDaysAgo))
      );
      setActiveUsers(usersSnap.size);
    } catch {
      const allSnap = await getDocs(collection(firestore!, "users"));
      setActiveUsers(allSnap.size);
    }
  }

  async function fetchCategories() {
    const snap = await getDocs(collection(firestore!, "marketplace_listings"));
    const counts: Record<string, number> = {};
    snap.forEach((doc) => {
      const cat = doc.data().category ?? "Other";
      counts[cat] = (counts[cat] ?? 0) + 1;
    });
    setCategories(
      Object.entries(counts)
        .map(([category, count]) => ({ category, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 6)
    );
  }

  async function fetchReferralLinks() {
    const snap = await getDocs(collection(firestore!, 'referral_links'));
    setReferralLinks(snap.docs.map(d => ({ id: d.id, ...d.data() })));
  }

  async function handleCreateLink() {
    if (!newLinkName.trim()) return;
    const { addDoc } = await import('firebase/firestore');
    await addDoc(collection(firestore!, 'referral_links'), {
      name: newLinkName,
      code: newLinkName,
      clicks: 0,
      signups: 0,
      conversions: 0,
      totalRevenue: 0,
      payoutDue: 0,
      createdAt: new Date(),
    });
    setNewLinkName('');
    setShowNewLink(false);
    fetchReferralLinks();
  }

  async function fetchTransactions() {
    const snap = await getDocs(
      query(collection(firestore!, "transactions"), orderBy("createdAt", "desc"), limit(20))
    );
    setTransactions(
      snap.docs.map((doc) => {
        const d = doc.data();
        const total = d.totalAmount ?? d.amount ?? 0;
        return {
          id: doc.id,
          buyerEmail: d.buyerEmail ?? "—",
          hustleName: d.hustleName ?? "—",
          sellerEmail: d.sellerEmail ?? "—",
          totalAmount: total,
          sellerPayout: d.sellerPayout ?? d.sellerAmount ?? Math.round(total * 0.9),
          platformFee: d.platformFee ?? Math.round(total * 0.1),
          status: d.status ?? "pending",
          createdAt: d.createdAt,
        };
      })
    );
  }

  // Show debug info instead of redirecting
  if (!isLoggedIn || !user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-sm text-muted-foreground">Not logged in. Email: {user?.email ?? "null"}</p>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-sm text-muted-foreground">Access denied. Your email: {user?.email}</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-sm text-muted-foreground">Loading dashboard…</p>
      </div>
    );
  }

  const maxCat = categories[0]?.count ?? 1;

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-black">Admin Dashboard</h1>
          <p className="text-sm text-muted-foreground mt-0.5">hustlespark.net · platform overview</p>
        </div>
        <button
          onClick={fetchAll}
          className="text-sm px-4 py-2 border rounded-lg hover:bg-muted transition-colors"
        >
          Refresh
        </button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[
          { label: "Total Sales", value: totalSales.toString() },
          { label: "Gross Revenue", value: fmt(grossRevenue) },
          { label: "Your Earnings (10%)", value: fmt(platformEarnings) },
          { label: "Active Users (30d)", value: activeUsers.toString() },
        ].map(({ label, value }) => (
          <div key={label} className="bg-muted/40 rounded-2xl p-4 border">
            <p className="text-xs text-muted-foreground mb-1">{label}</p>
            <p className="text-2xl font-black">{value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        <div className="bg-background border rounded-2xl p-5">
          <h2 className="text-xs font-black uppercase tracking-widest text-muted-foreground mb-4">
            Top Hustle Categories
          </h2>
          {categories.length === 0 ? (
            <p className="text-sm text-muted-foreground">No listings yet.</p>
          ) : (
            categories.map(({ category, count }) => (
              <div key={category} className="flex items-center gap-3 mb-3">
                <span className="text-sm w-32 shrink-0 truncate">{category}</span>
                <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary rounded-full"
                    style={{ width: `${(count / maxCat) * 100}%` }}
                  />
                </div>
                <span className="text-xs text-muted-foreground w-6 text-right">{count}</span>
              </div>
            ))
          )}
        </div>

        <div className="bg-background border rounded-2xl p-5">
          <h2 className="text-xs font-black uppercase tracking-widest text-muted-foreground mb-4">
            Revenue Breakdown
          </h2>
          <div className="space-y-3">
            {[
              { label: "Gross Revenue", value: fmt(grossRevenue), bold: false },
              { label: "Seller Payouts (90%)", value: fmt(Math.round(grossRevenue * 0.9)), bold: false },
              { label: "Your Earnings (10%)", value: fmt(platformEarnings), bold: true, green: true },
              { label: "Completed Sales", value: totalSales.toString(), bold: false },
              { label: "Avg. Sale Value", value: totalSales > 0 ? fmt(Math.round(grossRevenue / totalSales)) : "$0", bold: false },
            ].map(({ label, value, bold, green }) => (
              <div key={label} className={`flex justify-between text-sm ${bold ? "border-t pt-3" : ""}`}>
                <span className={bold ? "font-bold" : "text-muted-foreground"}>{label}</span>
                <span className={`font-medium ${green ? "text-green-600" : ""}`}>{value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-background border rounded-2xl p-5">
        <h2 className="text-xs font-black uppercase tracking-widest text-muted-foreground mb-4">
          Recent Transactions (Last 20)
        </h2>
        {transactions.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-8">No transactions yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-xs text-muted-foreground border-b">
                  <th className="text-left pb-3 font-medium">Buyer</th>
                  <th className="text-left pb-3 font-medium">Hustle</th>
                  <th className="text-left pb-3 font-medium">Seller PayPal</th>
                  <th className="text-right pb-3 font-medium">Seller (90%)</th>
                  <th className="text-right pb-3 font-medium">You (10%)</th>
                  <th className="text-right pb-3 font-medium">Date</th>
                  <th className="text-right pb-3 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map((txn) => (
                  <tr key={txn.id} className="border-b last:border-0">
                    <td className="py-3 text-muted-foreground max-w-[120px] truncate">{txn.buyerEmail}</td>
                    <td className="py-3 max-w-[130px] truncate">{txn.hustleName}</td>
                    <td className="py-3 text-muted-foreground max-w-[130px] truncate">{txn.sellerEmail}</td>
                    <td className="py-3 text-right">{fmt(txn.sellerPayout)}</td>
                    <td className="py-3 text-right text-green-600 font-medium">{fmt(txn.platformFee)}</td>
                    <td className="py-3 text-right text-muted-foreground">{fmtDate(txn.createdAt)}</td>
                    <td className="py-3 text-right">
                      <span className={`inline-block text-xs px-2 py-0.5 rounded-md font-medium ${STATUS_CLASS[txn.status] ?? "bg-muted text-muted-foreground"}`}>
                        {STATUS_LABEL[txn.status] ?? txn.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

{/* REFERRAL LINKS */}
<div className="bg-background border rounded-2xl p-5 mt-4">
  <div className="flex items-center justify-between mb-4">
    <h2 className="text-xs font-black uppercase tracking-widest text-muted-foreground">Influencer Referral Links</h2>
    <button
      onClick={() => setShowNewLink(!showNewLink)}
      className="text-xs px-3 py-1.5 bg-primary text-primary-foreground rounded-lg font-bold"
    >
      + Generate Link
    </button>
  </div>

  {showNewLink && (
    <div className="mb-4 p-4 bg-muted/30 rounded-xl border space-y-3">
      <input
        className="w-full border rounded-lg px-3 py-2 text-sm bg-background"
        placeholder="Influencer name (e.g. sarah_tiktok)"
        value={newLinkName}
        onChange={(e) => setNewLinkName(e.target.value.toLowerCase().replace(/\s+/g, '_'))}
      />
      <button
        onClick={handleCreateLink}
        className="w-full text-sm px-3 py-2 bg-primary text-primary-foreground rounded-lg font-bold"
      >
        Create Link
      </button>
    </div>
  )}

  {referralLinks.length === 0 ? (
    <p className="text-sm text-muted-foreground text-center py-8">No referral links yet. Generate one above.</p>
  ) : (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="text-xs text-muted-foreground border-b">
            <th className="text-left pb-3 font-medium">Name</th>
            <th className="text-left pb-3 font-medium">Link</th>
            <th className="text-right pb-3 font-medium">Clicks</th>
            <th className="text-right pb-3 font-medium">Signups</th>
            <th className="text-right pb-3 font-medium">Conversions</th>
            <th className="text-right pb-3 font-medium">Revenue</th>
            <th className="text-right pb-3 font-medium">Payout Due</th>
            <th className="text-right pb-3 font-medium">Actions</th>
          </tr>
        </thead>
        <tbody>
          {referralLinks.map((link) => (
            <tr key={link.id} className="border-b last:border-0">
              <td className="py-3 font-bold">{link.name}</td>
              <td className="py-3 text-muted-foreground text-xs">{`hustlespark.net?ref=${link.code}`}</td>
              <td className="py-3 text-right">{link.clicks || 0}</td>
              <td className="py-3 text-right">{link.signups || 0}</td>
              <td className="py-3 text-right">{link.conversions || 0}</td>
              <td className="py-3 text-right">{fmt(link.totalRevenue || 0)}</td>
              <td className="py-3 text-right text-orange-600 font-bold">{fmt(link.payoutDue || 0)}</td>
              <td className="py-3 text-right">
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(`https://hustlespark.net?ref=${link.code}`);
                    alert('Link copied!');
                  }}
                  className="text-xs px-2 py-1 border rounded-lg hover:bg-muted"
                >
                  Copy
                </button>
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