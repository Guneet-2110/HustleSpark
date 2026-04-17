"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { useAuth } from '@/hooks/use-auth';
import { Button } from './ui/button';
import { Star, CheckCircle2, CreditCard, Zap } from 'lucide-react';
import React, { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { StripeUpgradeButton } from './stripe-upgrade-button';

const PLANS = [
  { months: 1, days: 30, weeks: 4, price: 15, label: '1 Month', popular: false },
  { months: 2, days: 60, weeks: 8, price: 30, label: '2 Months', popular: true },
  { months: 3, days: 90, weeks: 12, price: 45, label: '3 Months', popular: false },
  { months: 4, days: 120, weeks: 16, price: 60, label: '4 Months', popular: false },
];

export function PaymentModal() {
  const { isPaymentModalOpen, setPaymentModalOpen, upgradeToPremium } = useAuth();
  const { toast } = useToast();
  const [isSuccess, setIsSuccess] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(PLANS[0]);
  const [showCheckout, setShowCheckout] = useState(false);

  const handlePaymentSuccess = () => {
    setIsSuccess(true);
    setTimeout(() => {
        upgradeToPremium(selectedPlan.days);
        setPaymentModalOpen(false);
        setIsSuccess(false);
        setShowCheckout(false);
        setSelectedPlan(PLANS[0]);
        toast({
            title: 'Premium Activated!',
            description: `Welcome to HustleSpark Premium! You have ${selectedPlan.weeks} weeks of access.`,
        });
    }, 1500);
  };

  const handleClose = (open: boolean) => {
    setPaymentModalOpen(open);
    if (!open) {
      setShowCheckout(false);
      setSelectedPlan(PLANS[0]);
    }
  };

  return (
    <Dialog open={isPaymentModalOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-lg rounded-[2.5rem]">
        <DialogHeader>
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 mb-4">
            <Star className="h-6 w-6 text-primary" />
          </div>
          <DialogTitle className="text-2xl text-center font-black">
            {isSuccess ? "Payment Confirmed!" : "Unlock Premium Growth"}
          </DialogTitle>
          <DialogDescription className="text-center pt-2 font-medium">
            {isSuccess
              ? "Redirecting to your premium dashboard..."
              : "Choose your plan and unlock unlimited hustle potential."}
          </DialogDescription>
        </DialogHeader>

        {isSuccess ? (
          <div className="flex flex-col items-center justify-center py-10 space-y-4">
            <CheckCircle2 className="h-16 w-16 text-green-500 animate-bounce" />
            <p className="font-semibold text-lg">Thank you for your purchase!</p>
          </div>
        ) : !showCheckout ? (
          <div className="space-y-4 py-2">
            {/* Plan selector */}
            <div className="grid grid-cols-2 gap-3">
              {PLANS.map((plan) => (
                <button
                  key={plan.days}
                  onClick={() => setSelectedPlan(plan)}
                  className={`relative p-4 rounded-2xl border-2 text-left transition-all ${
                    selectedPlan.days === plan.days
                      ? 'border-primary bg-primary/5'
                      : 'border-border hover:border-primary/50'
                  }`}
                >
                  {plan.popular && (
                    <span className="absolute -top-2 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full">
                      Popular
                    </span>
                  )}
                  <p className="font-black text-sm">{plan.label}</p>
                  <p className="text-2xl font-black text-primary mt-1">${plan.price}</p>
                  <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest mt-1">
                    {plan.weeks} weeks access
                  </p>
                </button>
              ))}
            </div>

            {/* Selected plan summary */}
            <div className="bg-muted/50 p-4 rounded-2xl border border-primary/10 flex justify-between items-center">
              <div>
                <p className="font-black">{selectedPlan.label} Plan</p>
                <p className="text-xs text-muted-foreground font-bold uppercase tracking-widest">
                  {selectedPlan.days} days · {selectedPlan.weeks} weeks roadmap
                </p>
              </div>
              <p className="text-2xl font-black text-primary">${selectedPlan.price}</p>
            </div>

            <Button
              className="w-full h-14 rounded-2xl font-black text-lg shadow-xl"
              onClick={() => setShowCheckout(true)}
            >
              <CreditCard className="mr-2 h-5 w-5" />
              Continue to Checkout
            </Button>
          </div>
        ) : (
          <div className="space-y-4 animate-in fade-in zoom-in-95">
            <div className="bg-muted/50 p-3 rounded-xl flex justify-between items-center text-sm">
              <span className="font-bold">{selectedPlan.label} · {selectedPlan.weeks} weeks</span>
              <span className="font-black text-primary">${selectedPlan.price}</span>
            </div>
            <StripeUpgradeButton amount={selectedPlan.price} onSuccess={handlePaymentSuccess} />
            <Button variant="ghost" className="w-full text-xs" onClick={() => setShowCheckout(false)}>
              ← Change Plan
            </Button>
          </div>
        )}

        <DialogFooter className="flex flex-col items-center">
          <p className="text-[10px] text-muted-foreground text-center font-bold uppercase tracking-widest opacity-60">
            Secure SSL Protected Checkout
          </p>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}