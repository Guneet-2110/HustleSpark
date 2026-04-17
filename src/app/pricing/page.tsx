"use client";

import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Check, X, Star, Zap, Lock } from "lucide-react";
import Link from "next/link";

const PLANS = [
  { months: 1, days: 30, weeks: 4, price: 15, label: "1 Month" },
  { months: 2, days: 60, weeks: 8, price: 30, label: "2 Months", popular: true },
  { months: 3, days: 90, weeks: 12, price: 45, label: "3 Months" },
  { months: 4, days: 120, weeks: 16, price: 60, label: "4 Months" },
];

const FEATURES = [
  {
    category: "Hustle Generation",
    items: [
      { name: "AI-generated hustle ideas", free: "3 ideas (one time)", premium: "Unlimited" },
      { name: "Personalized to your skills & age", free: true, premium: true },
      { name: "Re-generate new ideas", free: false, premium: true },
    ],
  },
  {
    category: "Branding Kit",
    items: [
      { name: "AI logo generation", free: true, premium: true },
      { name: "AI flyer generation", free: true, premium: true },
      { name: "Redesign logo & flyer anytime", free: true, premium: true },
    ],
  },
  {
    category: "Launch Roadmap",
    items: [
      { name: "AI-generated weekly action plan", free: "2 weeks", premium: "Up to 16 weeks" },
      { name: "Task checkboxes & progress tracking", free: true, premium: true },
      { name: "Earnings tracker & win log", free: true, premium: true },
    ],
  },
  {
    category: "Growth Strategy",
    items: [
      { name: "Elite pricing strategy", free: false, premium: true },
      { name: "High-impact marketing plan", free: false, premium: true },
      { name: "AI business blueprint", free: false, premium: true },
    ],
  },
  {
    category: "AI Coach",
    items: [
      { name: "Sparky AI coach chat", free: false, premium: true },
      { name: "Personalized business advice", free: false, premium: true },
    ],
  },
  {
    category: "Marketplace",
    items: [
      { name: "Browse & buy hustles", free: true, premium: true },
      { name: "List & sell your hustle", free: false, premium: true },
      { name: "Escrow payment protection", free: true, premium: true },
      { name: "Buyer/seller chat", free: true, premium: true },
    ],
  },
];

function FeatureValue({ value }: { value: boolean | string }) {
  if (value === true) return <Check className="h-5 w-5 text-green-500 mx-auto" />;
  if (value === false) return <X className="h-5 w-5 text-muted-foreground/40 mx-auto" />;
  return <span className="text-xs font-bold text-primary">{value}</span>;
}

export default function PricingPage() {
  const { isPremium, setPaymentModalOpen, isLoggedIn } = useAuth();

  return (
    <div className="container max-w-5xl py-16">
      {/* Header */}
      <div className="text-center mb-12">
        <h1 className="text-4xl font-black tracking-tight mb-4">Simple, honest pricing</h1>
        <p className="text-muted-foreground text-lg max-w-xl mx-auto">
          Start free. Upgrade when you're ready to go all in on your hustle.
        </p>
      </div>

      {/* Plan cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-16">
        {PLANS.map((plan) => (
          <div
            key={plan.days}
            className={`relative rounded-2xl border p-5 text-center ${
              plan.popular
                ? "border-primary bg-primary/5 shadow-lg"
                : "border-border bg-background"
            }`}
          >
            {plan.popular && (
              <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded-full">
                Most Popular
              </span>
            )}
            <p className="font-black text-sm mb-1">{plan.label}</p>
            <p className="text-3xl font-black text-primary">${plan.price}</p>
            <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest mt-1 mb-4">
              {plan.weeks} weeks
            </p>
            <Button
              className="w-full rounded-xl font-bold text-sm h-10"
              variant={plan.popular ? "default" : "outline"}
              onClick={() => {
                if (isLoggedIn) {
                  setPaymentModalOpen(true);
                } else {
                  window.location.href = "/login?tab=signup";
                }
              }}
            >
              {isPremium ? "Extend Plan" : "Get Started"}
            </Button>
          </div>
        ))}
      </div>

      {/* Free vs Premium comparison */}
      <div className="rounded-2xl border overflow-hidden">
        <div className="grid grid-cols-3 bg-muted/50 border-b">
          <div className="p-4 font-black text-sm">Features</div>
          <div className="p-4 text-center font-black text-sm border-l">Free</div>
          <div className="p-4 text-center font-black text-sm border-l text-primary flex items-center justify-center gap-1">
            <Star className="h-4 w-4 fill-primary" /> Premium
          </div>
        </div>

        {FEATURES.map((section) => (
          <div key={section.category}>
            <div className="bg-muted/30 px-4 py-2 border-b">
              <p className="text-xs font-black uppercase tracking-widest text-muted-foreground">
                {section.category}
              </p>
            </div>
            {section.items.map((item, i) => (
              <div
                key={i}
                className="grid grid-cols-3 border-b last:border-b-0 hover:bg-muted/20 transition-colors"
              >
                <div className="p-4 text-sm font-medium">{item.name}</div>
                <div className="p-4 border-l flex items-center justify-center">
                  <FeatureValue value={item.free} />
                </div>
                <div className="p-4 border-l flex items-center justify-center bg-primary/3">
                  <FeatureValue value={item.premium} />
                </div>
              </div>
            ))}
          </div>
        ))}
      </div>

      {/* CTA */}
      <div className="mt-12 text-center space-y-4">
        {!isPremium && (
          <Button
            className="h-14 px-10 rounded-2xl font-black text-lg shadow-xl"
            onClick={() => {
              if (isLoggedIn) {
                setPaymentModalOpen(true);
              } else {
                window.location.href = "/login?tab=signup";
              }
            }}
          >
            <Zap className="mr-2 h-5 w-5" />
            Unlock Premium Now
          </Button>
        )}
        {isPremium && (
          <div className="inline-flex items-center gap-2 bg-green-500/10 text-green-600 px-6 py-3 rounded-2xl font-black">
            <Check className="h-5 w-5" />
            You're on Premium!
          </div>
        )}
        <p className="text-xs text-muted-foreground">
          No subscriptions. One-time payment per plan. Cancel anytime.
        </p>
      </div>
    </div>
  );
}